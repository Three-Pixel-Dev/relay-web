import { Check } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { ChipDot, Spin } from "@/components/common/spin"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { cardClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useDistributeChannelOffMutation,
  useDistributeChannelOnMutation,
  useDistributeWeekMutation,
  useProductQuery,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type {
  ChannelCatalogItem,
  ChannelState,
  ConnectionState,
  Product,
  ServiceCatalogItem,
} from "@/shared/types/relay"
import { apiError } from "@/util/api-error"
import { money, productName } from "@/util/format"

type ChannelGate =
  | { kind: "ok" }
  | { kind: "connect"; serviceId: string; name: string }
  | { kind: "comingSoon"; serviceId: string; name: string }

function resolveChannelGate(
  channel: ChannelCatalogItem,
  services: ServiceCatalogItem[],
  connected: Record<string, ConnectionState | undefined>
): ChannelGate {
  for (const need of channel.needs) {
    if (connected[need]) continue
    const service = services.find((s) => s.id === need)
    const name = service?.name ?? need
    if (service?.comingSoon) {
      return { kind: "comingSoon", serviceId: need, name }
    }
    return { kind: "connect", serviceId: need, name }
  }
  return { kind: "ok" }
}

function bestChannelLabel(
  product: Product,
  channels: ChannelCatalogItem[]
): string {
  const ranked = Object.entries(product.distribute ?? {})
    .filter(([, state]) => state?.on)
    .sort((a, b) => (b[1].clicks ?? 0) - (a[1].clicks ?? 0))
  const top = ranked[0]
  if (!top) return "—"
  return channels.find((c) => c.id === top[0])?.name ?? top[0]
}

function channelStatusNote(state: ChannelState) {
  if (state.week && state.week > 0) {
    return `Week ${state.week} approved. Numbers appear when platforms report them.`
  }
  return "Set up. Numbers appear after the first weekly batch."
}

export function DistributePage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const turnOn = useDistributeChannelOnMutation()
  const turnOff = useDistributeChannelOffMutation()
  const approveWeek = useDistributeWeekMutation()
  const showToast = useUiStore((state) => state.showToast)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const built = product.stage !== "build" && product.stage !== "paused"
  const isPublished = Object.keys(product.publish?.live ?? {}).length > 0
  const unlocked = built && (product.stage === "distribute" || isPublished)
  if (!unlocked) {
    return <Navigate to={ROUTES.publish(product.id)} replace />
  }

  const channels = catalog.channels
  const connected = workspace?.services ?? {}
  const anyOn = Object.values(product.distribute ?? {}).some((c) => c?.on)
  const busy =
    turnOn.isPending || turnOff.isPending || approveWeek.isPending
  const pendingChannel =
    turnOn.isPending && turnOn.variables
      ? turnOn.variables.channel
      : turnOff.isPending && turnOff.variables
        ? turnOff.variables.channel
        : null

  function handleOn(channelId: string) {
    turnOn.mutate(
      { id, channel: channelId },
      {
        onSuccess: () => {
          const name = channels.find((c) => c.id === channelId)?.name ?? channelId
          showToast(`${name} is on.`)
        },
        onError: (error) => showToast(apiError(error).message),
      }
    )
  }

  function handleOff(channelId: string) {
    turnOff.mutate(
      { id, channel: channelId },
      {
        onSuccess: () => showToast("Channel turned off."),
        onError: (error) => showToast(apiError(error).message),
      }
    )
  }

  function handleWeek() {
    approveWeek.mutate(id, {
      onSuccess: () =>
        showToast("This week's batch approved. Nothing posts until workers run."),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  const m = product.metrics

  return (
    <>
      <StageBar product={product} />
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted-foreground">{product.brand?.title || productName(product)}</p>
          <h1 className="text-[30px]">Distribute</h1>
          <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted-foreground">
            Relay runs the channels; the numbers are yours to see. Turn a channel on, approve the
            week's batch, watch clicks and leads come back from the connected accounts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {anyOn ? (
            <button
              type="button"
              className={protoBtn()}
              disabled={busy}
              onClick={handleWeek}
            >
              {approveWeek.isPending ? <Spin /> : <Check className="size-4" />}
              Approve this week's batch
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-[18px] grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
        <MetricCard
          label="Visits (30 d)"
          value={m.visits.toLocaleString()}
          hint="all channels"
        />
        <MetricCard label="Leads" value={String(m.leads)} hint="email subscribers" />
        <MetricCard
          label="Sales"
          value={String(m.sales)}
          hint={money(m.revenue)}
        />
        <MetricCard
          label="Best channel"
          value={bestChannelLabel(product, channels)}
          hint="by clicks"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        {channels.map((channel) => {
          const state = product.distribute?.[channel.id] ?? {}
          const gate = resolveChannelGate(channel, catalog.services, connected)
          const isOn = Boolean(state.on)
          const isSetting = Boolean(state.setting) || pendingChannel === channel.id
          const channelBusy = pendingChannel === channel.id

          return (
            <div
              key={channel.id}
              className={cn(
                "rounded-2xl border-[1.5px] border-border bg-card p-4",
                isOn && "border-success/50"
              )}
            >
              <header className="mb-2 flex items-center justify-between gap-2.5">
                <b className="text-[14.5px] font-semibold text-foreground">{channel.name}</b>
                {isOn ? (
                  <span className={protoChip({ variant: "mint" })}>
                    <ChipDot /> On
                  </span>
                ) : isSetting ? (
                  <span className={protoChip({ variant: "sun" })}>
                    <Spin /> Setting up
                  </span>
                ) : (
                  <span className={protoChip()}>Off</span>
                )}
              </header>
              <p className="text-[12.5px] leading-relaxed text-muted-foreground">{channel.desc}</p>

              {isOn ? (
                <>
                  <div className="my-3 flex gap-4">
                    <div>
                      <b className="block text-xl font-extrabold tracking-tight">
                        {(state.clicks ?? 0).toLocaleString()}
                      </b>
                      <span className="text-[11.5px] text-muted-foreground">Clicks</span>
                    </div>
                    <div>
                      <b className="block text-xl font-extrabold tracking-tight">
                        {state.week ?? 0}
                      </b>
                      <span className="text-[11.5px] text-muted-foreground">Weeks</span>
                    </div>
                  </div>
                  <div className="rounded-lg bg-muted px-2.5 py-2 text-[12.5px] text-foreground">
                    {channelStatusNote(state)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={protoBtn({ variant: "ghost" })}
                      disabled={busy}
                      onClick={() => handleOff(channel.id)}
                    >
                      {channelBusy && turnOff.isPending ? <Spin /> : null}
                      Turn off
                    </button>
                  </div>
                </>
              ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                  {gate.kind === "comingSoon" ? (
                    <button type="button" className={protoBtn({ variant: "soft" })} disabled>
                      {gate.name} coming soon
                    </button>
                  ) : gate.kind === "connect" ? (
                    <Link
                      to={ROUTES.connections}
                      className={protoBtn({ variant: "soft" })}
                    >
                      Connect {gate.name} first
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={protoBtn()}
                      disabled={busy}
                      onClick={() => handleOn(channel.id)}
                    >
                      {channelBusy && turnOn.isPending ? <Spin /> : null}
                      Turn on
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint: string
}) {
  return (
    <div className={cn(cardClass, "rounded-xl p-3.5")}>
      <span className="mb-0.5 block text-xs text-muted-foreground">{label}</span>
      <b className="block text-[22px] font-extrabold tracking-tight text-foreground">{value}</b>
      <small className="mt-0.5 block text-[11.5px] text-muted-foreground/80">{hint}</small>
    </div>
  )
}

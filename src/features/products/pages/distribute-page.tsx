import { Check } from "lucide-react"
import { Navigate, useParams } from "react-router"

import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useChannelOffMutation,
  useChannelOnMutation,
  useProductQuery,
  useWeekBatchMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { money } from "@/util/format"

function scaleNum(value: string, week: number) {
  const n = parseFloat(value.replace(/[^0-9.]/g, ""))
  if (Number.isNaN(n)) return value
  const f = Math.min(1, week / 4)
  if (value.includes("k")) return `${(n * f).toFixed(1)}k`
  if (value.startsWith("$")) return `$${Math.round(n * f)}`
  return String(Math.round(n * f))
}

export function DistributePage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const on = useChannelOnMutation()
  const off = useChannelOffMutation()
  const week = useWeekBatchMutation()
  const showToast = useUiStore((state) => state.showToast)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />
  if (product.stage === "build" || product.stage === "paused") {
    return <Navigate to={ROUTES.build(product.id)} replace />
  }

  const d = product.distribute
  const anyOn = Object.values(d).some((c) => c.on)
  const connected = (sid: string) => workspace?.services[sid]?.status === "connected"
  const best = Object.entries(d)
    .filter(([, c]) => c.on)
    .sort((a, b) => (b[1].clicks || 0) - (a[1].clicks || 0))[0]?.[0]
  const bestName = catalog.channels.find((c) => c.id === best)?.name ?? "—"

  return (
    <>
      <StageBar product={product} />
      <div className="run-head">
        <div>
          <p className="small muted">{product.brand?.title}</p>
          <h1>Distribute</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: "60ch" }}>
            Relay runs the channels; the numbers are yours to see. Turn a channel on, approve the
            week’s batch, watch clicks and leads come back from the connected accounts.
          </p>
        </div>
        <div className="row">
          {anyOn ? (
            <button
              type="button"
              className="btn sun"
              onClick={() =>
                week.mutate(product.id, {
                  onSuccess: () => showToast("This week’s batch approved."),
                })
              }
            >
              <Check className="size-4" /> Approve this week’s batch
            </button>
          ) : null}
        </div>
      </div>
      <div className="metrics">
        <div><span>Visits (30 d)</span><b>{product.metrics.visits.toLocaleString()}</b><small>all channels</small></div>
        <div><span>Leads</span><b>{product.metrics.leads}</b><small>email subscribers</small></div>
        <div><span>Sales</span><b>{product.metrics.sales}</b><small>{money(product.metrics.revenue)}</small></div>
        <div><span>Best channel</span><b>{bestName}</b><small>by clicks</small></div>
      </div>
      <div className="channels">
        {catalog.channels.map((channel) => {
          const state = d[channel.id] || {}
          const need = channel.needs.find((n) => !connected(n))
          const needService = need ? catalog.services.find((s) => s.id === need) : undefined
          return (
            <div className={`chan ${state.on ? "on" : ""}`} key={channel.id}>
              <header>
                <b>{channel.name}</b>
                {state.on ? <span className="chip mint"><i />On</span> : state.setting ? <span className="chip sun"><span className="spin" />Setting up</span> : <span className="chip">Off</span>}
              </header>
              <p>{channel.desc}</p>
              {state.on ? (
                <>
                  <div className="nums">
                    {channel.nums.map(([label, value]) => (
                      <div key={label}>
                        <b>{state.week ? scaleNum(value, state.week) : "0"}</b>
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="did">{state.week ? channel.did || "Running." : "Set up. Numbers appear after the first weekly batch."}</div>
                  <div className="row">
                    <button type="button" className="btn ghost" onClick={() => off.mutate({ id: product.id, channelId: channel.id })}>
                      Turn off
                    </button>
                  </div>
                </>
              ) : (
                <div className="row" style={{ marginTop: 12 }}>
                  {needService ? (
                    <button type="button" className="btn soft" onClick={() => openConnectModal(needService)}>
                      Connect {needService.name} first
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn sun"
                      onClick={() =>
                        on.mutate(
                          { id: product.id, channelId: channel.id },
                          { onSuccess: () => showToast(`${channel.name} is on.`) }
                        )
                      }
                    >
                      Turn on
                    </button>
                  )}
                  <span className="small muted">
                    {channel.needs.length
                      ? `Needs ${channel.needs.map((n) => catalog.services.find((s) => s.id === n)?.name).join(" or ")}`
                      : "No account needed"}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ShieldIcon } from "lucide-react"
import { useSearchParams } from "react-router"

import { ChipDot } from "@/components/common/spin"
import { PlansPicker } from "@/components/common/plans-picker"
import { ServiceMark } from "@/components/common/service-mark"
import { BillingPanel } from "@/features/connections/components/billing-panel"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { cardClass, noteClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { partnersKeys } from "@/shared/queries/partners.query"
import {
  useDisconnectServiceMutation,
  useWorkspaceQuery,
  workspaceKeys,
} from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { ServiceCatalogItem } from "@/shared/types/relay"

const GROUPS = ["Sell", "Outreach", "Reach", "Leads", "AI (your keys)"] as const

export function ConnectionsPage() {
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const disconnect = useDisconnectServiceMutation()
  const showToast = useUiStore((state) => state.showToast)
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const gmailResult = searchParams.get("gmail")

  useEffect(() => {
    if (!gmailResult) return
    if (gmailResult === "connected") {
      showToast("Gmail connected. Outreach now sends from your own mailbox.")
      void queryClient.invalidateQueries({ queryKey: workspaceKeys.all })
      void queryClient.invalidateQueries({ queryKey: partnersKeys.all })
    } else {
      showToast("Gmail connection was cancelled or failed. Try again.")
    }
    setSearchParams({}, { replace: true })
  }, [gmailResult, queryClient, setSearchParams, showToast])

  if (!catalog || !workspace) return null

  const services = catalog.services

  return (
    <>
      <h1 className="mb-1.5 text-[32px]">Connections</h1>
      <p className="mb-[22px] text-muted-foreground">
        Relay works through your accounts. Connect once; every product uses them.
      </p>
      <div className={cn(cardClass, "mb-[22px]")}>
        <div className="flex flex-wrap items-center justify-between gap-3.5">
          <div>
            <h3>Relay plan</h3>
            <p className="text-[13px] text-muted-foreground">
              {workspace.sub
                ? workspace.sub === "yearly"
                  ? "$149 / year · no trial"
                  : "$99 / 6 months · no trial"
                : "Not started"}
            </p>
          </div>
          {workspace.sub ? (
            <span className={protoChip({ variant: "mint" })}>
              <ChipDot />
              Active
            </span>
          ) : null}
        </div>
        <div className="mt-3.5">
          <PlansPicker selected={workspace.sub} />
        </div>
        <BillingPanel />
      </div>
      {GROUPS.map((group) => (
        <ServiceGroup
          key={group}
          title={group}
          services={services.filter((service) => service.group === group)}
          connected={workspace.services}
          onConnect={openConnectModal}
          onRemove={(id, name) =>
            disconnect.mutate(id, {
              onSuccess: () => showToast(`${name} removed.`),
            })
          }
        />
      ))}
      <p className={cn(noteClass, "mt-[18px]")}>
        <ShieldIcon className="size-4 shrink-0" />
        <span>
          Keys and OAuth tokens are stored for your account. Every action is logged on the product
          thread. Marketplace fees belong to the connected providers.
        </span>
      </p>
    </>
  )
}

interface ServiceGroupProps {
  title: string
  services: ServiceCatalogItem[]
  connected: Record<string, { status: string; label: string }>
  onConnect: (service: ServiceCatalogItem) => void
  onRemove: (id: string, name: string) => void
}

function ServiceGroup({ title, services, connected, onConnect, onRemove }: ServiceGroupProps) {
  return (
    <>
      <h3 className="mt-[22px] mb-2.5">{title}</h3>
      <div className="grid gap-3.5">
        {services.map((service) => {
          const link = connected[service.id]
          const on = link?.status === "connected"
          return (
            <div
              className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 rounded-lg border border-border bg-card p-4"
              key={service.id}
            >
              <ServiceMark service={service} size={44} />
              <div>
                <b className="block text-[15px]">
                  {service.name}
                  {service.main ? (
                    <span className={cn(protoChip({ variant: "sun" }), "ml-1.5")}>
                      Main store
                    </span>
                  ) : null}
                </b>
                <small className="mt-0.5 block text-[12.5px] text-muted-foreground">{service.does}</small>
                <small className="mt-0.5 block text-[12.5px] text-muted-foreground">{service.price}</small>
              </div>
              <div className="flex items-center gap-2.5">
                {service.comingSoon ? (
                  <span className={protoChip()}>Coming soon</span>
                ) : on ? (
                  <>
                    <span className={protoChip({ variant: "mint" })}>
                      <ChipDot />
                      {link.label}
                    </span>
                    <button
                      type="button"
                      className={protoBtn({ variant: "ghost" })}
                      onClick={() => onRemove(service.id, service.name)}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={protoBtn({ variant: "soft" })}
                    onClick={() => onConnect(service)}
                  >
                    {service.kind === "oauth" ? "Connect" : "Add key"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

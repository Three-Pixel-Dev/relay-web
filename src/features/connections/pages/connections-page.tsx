import { ShieldIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PlansPicker } from "@/components/common/plans-picker"
import { ServiceMark } from "@/components/common/service-mark"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useDisconnectServiceMutation,
  useWorkspaceQuery,
} from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { ServiceCatalogItem } from "@/shared/types/relay"

const GROUPS = ["Sell", "Outreach", "Reach", "Leads", "AI (your keys)"] as const

export function ConnectionsPage() {
  const { t } = useTranslation("common")
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const disconnect = useDisconnectServiceMutation()
  const showToast = useUiStore((state) => state.showToast)

  if (!catalog || !workspace) return null

  const services = catalog.services

  return (
    <>
      <h1 style={{ fontSize: 32, marginBottom: 6 }}>{t("connections.title")}</h1>
      <p className="muted" style={{ marginBottom: 22 }}>
        {t("connections.subtitle")}
      </p>
      <div className="card" style={{ marginBottom: 22 }}>
        <div className="between">
          <div>
            <h3>{t("connections.plan")}</h3>
            <p className="small muted">
              {workspace.sub
                ? workspace.sub === "yearly"
                  ? t("connections.plan_yearly")
                  : t("connections.plan_monthly")
                : t("connections.not_started")}
            </p>
          </div>
          {workspace.sub ? (
            <span className="chip mint">
              <i />
              {t("connections.active")}
            </span>
          ) : null}
        </div>
        <div style={{ marginTop: 14 }}>
          <PlansPicker selected={workspace.sub} />
        </div>
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
              onSuccess: () => showToast(t("connections.removed", { name })),
            })
          }
        />
      ))}
      <p className="note" style={{ marginTop: 18 }}>
        <ShieldIcon className="size-4" />
        <span>{t("connections.note")}</span>
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
  const { t } = useTranslation("common")

  return (
    <>
      <h3 style={{ margin: "22px 0 10px" }}>{title}</h3>
      <div className="stack">
        {services.map((service) => {
          const link = connected[service.id]
          const on = link?.status === "connected"
          return (
            <div className="prov" key={service.id}>
              <ServiceMark service={service} size={44} />
              <div>
                <b>
                  {service.name}
                  {service.main ? (
                    <span className="chip sun" style={{ marginLeft: 6 }}>
                      {t("connections.main_store")}
                    </span>
                  ) : null}
                </b>
                <small>{service.does}</small>
                <small>{service.price}</small>
              </div>
              <div className="st">
                {service.kind === "guided" ? (
                  <span className="chip">{t("connections.guided")}</span>
                ) : on ? (
                  <>
                    <span className="chip mint">
                      <i />
                      {link.label}
                    </span>
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => onRemove(service.id, service.name)}
                    >
                      {t("connections.remove")}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn soft"
                    onClick={() => onConnect(service)}
                  >
                    {service.kind === "oauth"
                      ? t("connections.connect")
                      : t("connections.add_key")}
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

import type { ServiceCatalogItem } from "@/shared/types/relay"

interface ServiceMarkProps {
  service: ServiceCatalogItem
  size?: number
}

export function ServiceMark({ service, size = 22 }: ServiceMarkProps) {
  return (
    <span
      className="mark"
      style={{
        width: size,
        height: size,
        background: service.color,
        color: "#14121c",
        fontSize: Math.round(size * 0.42),
      }}
    >
      {service.short}
    </span>
  )
}

interface ServiceLabelProps {
  service: ServiceCatalogItem
  label?: string
}

export function ServiceLabel({ service, label }: ServiceLabelProps) {
  return (
    <span className="pv">
      <ServiceMark service={service} />
      {label || service.name}
    </span>
  )
}

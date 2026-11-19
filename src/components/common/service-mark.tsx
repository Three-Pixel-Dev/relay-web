import type { ServiceCatalogItem } from "@/shared/types/relay"

interface ServiceMarkProps {
  service: ServiceCatalogItem
  size?: number
}

export function ServiceMark({ service, size = 22 }: ServiceMarkProps) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-[7px] font-extrabold"
      style={{
        width: size,
        height: size,
        background: service.color,
        color: "#14121c",
        fontSize: Math.round(size * 0.42),
        borderRadius: size > 30 ? 12 : 7,
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
    <span className="flex items-center gap-2 text-[13px] font-semibold">
      <ServiceMark service={service} />
      {label || service.name}
    </span>
  )
}

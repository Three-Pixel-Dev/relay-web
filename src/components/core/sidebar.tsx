import { BookOpen, Plug, Sparkles, Users } from "lucide-react"
import { NavLink } from "react-router"

import { BrandLogo, RelayGuyMark } from "@/components/common/relayguy-mark"
import { ROUTES } from "@/constants/routes"
import { usePartnersOverviewQuery } from "@/shared/queries/partners.query"
import { useProductsQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { cn } from "@/lib/utils"

export function Sidebar() {
  const { data: workspace } = useWorkspaceQuery()
  const { data: products = [] } = useProductsQuery()
  const { data: partnersOverview } = usePartnersOverviewQuery()
  const partnerCount = partnersOverview?.partners?.length ?? 0

  const items: {
    to: string
    label: string
    icon: typeof Sparkles
    end: boolean
    count?: number
  }[] = [
    { to: ROUTES.start, label: "Start", icon: Sparkles, end: true },
    { to: ROUTES.products, label: "My products", icon: BookOpen, end: false, count: products.length },
    { to: ROUTES.partners, label: "Partners", icon: Users, end: true, count: partnerCount || undefined },
    { to: ROUTES.connections, label: "Connections", icon: Plug, end: true },
  ]

  return (
    <aside className="sticky top-0 flex h-full w-[232px] shrink-0 flex-col gap-1.5 border-r border-border bg-background px-4 py-5 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-20 max-md:h-auto max-md:w-full max-md:flex-row max-md:overflow-x-auto max-md:border-r-0 max-md:border-t max-md:p-2">
      <NavLink
        to={ROUTES.start}
        className="mb-2 flex items-center px-2.5 py-1.5 max-md:hidden"
        aria-label="RelayGuy"
      >
        <BrandLogo size={42} />
      </NavLink>
      <nav className="flex flex-col gap-0.5 max-md:w-full max-md:flex-row max-md:gap-0.5" aria-label="Main">
        {items.map(({ to, label, icon: Icon, end, count }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-md:min-w-16 max-md:flex-1 max-md:flex-col max-md:gap-1 max-md:px-1.5 max-md:py-2 max-md:text-[11px]",
                isActive && "bg-card text-foreground"
              )
            }
          >
            <Icon className="size-[19px] shrink-0" />
            <span>{label}</span>
            {count ? (
              <span className="ml-auto rounded-full bg-border px-2 py-0.5 text-[11px] text-foreground max-md:hidden">
                {count}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>
      <div className="relative mt-auto rounded-lg border border-dashed border-border-strong py-3.5 pr-3.5 pl-[58px] text-[13px] text-muted-foreground max-md:hidden">
        <RelayGuyMark size={36} className="absolute top-3.5 left-3" />
        <b className="mb-1 block text-foreground">
          {workspace?.sub ? "RelayGuy is on" : "Build, sell, get seen"}
        </b>
        {workspace?.sub
          ? "Your AI keys and connected accounts do the work."
          : "$99 / 6 months or $149 / year. No trial."}
      </div>
    </aside>
  )
}

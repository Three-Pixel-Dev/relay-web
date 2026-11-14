import { BookOpen, Plug, Shield, Sparkles, Users } from "lucide-react"
import { useTranslation } from "react-i18next"
import { NavLink } from "react-router"

import { ROUTES } from "@/constants/routes"
import { useProductsQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"

export function Sidebar() {
  const { t } = useTranslation("common")
  const { data: workspace } = useWorkspaceQuery()
  const { data: products = [] } = useProductsQuery()

  const items: {
    to: string
    key: string
    icon: typeof Sparkles
    end: boolean
    count?: number
  }[] = [
    { to: ROUTES.start, key: "nav.start", icon: Sparkles, end: true },
    { to: ROUTES.products, key: "nav.products", icon: BookOpen, end: false, count: products.length },
    { to: ROUTES.partners, key: "nav.partners", icon: Users, end: true },
    { to: ROUTES.connections, key: "nav.connections", icon: Plug, end: true },
  ]
  if (workspace?.role === "admin") {
    items.push({ to: ROUTES.admin, key: "nav.admin", icon: Shield, end: true })
  }

  return (
    <aside className="rail">
      <NavLink to={ROUTES.start} className="logo">
        <i>R</i>
        {t("app.name")}
      </NavLink>
      <nav className="nav" aria-label={t("nav.aria_main")}>
        {items.map(({ to, key, icon: Icon, end, count }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? "on" : undefined)}
          >
            <Icon />
            <span>{t(key)}</span>
            {count ? <span className="count">{count}</span> : null}
          </NavLink>
        ))}
      </nav>
      <div className="rail-foot">
        <b>{workspace?.sub ? t("shell.plan_on_title") : t("app.tagline")}</b>
        {workspace?.sub ? t("shell.plan_on_body") : t("shell.plan_trial")}
      </div>
    </aside>
  )
}

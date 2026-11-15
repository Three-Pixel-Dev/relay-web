import { useTranslation } from "react-i18next"
import { Link, useLocation, useNavigate } from "react-router"

import { UI_LOCALES } from "@/app/config/i18n"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"
import { useLogoutMutation } from "@/shared/queries/auth.query"
import { useProductQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useSessionStore } from "@/shared/stores/session.store"

export function Topbar() {
  const { t, i18n } = useTranslation("common")
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const id = pathname.match(/^\/products\/([^/]+)/)?.[1]
  const { data: workspace } = useWorkspaceQuery()
  const { data: product } = useProductQuery(id)
  const user = useSessionStore((s) => s.user)
  const logout = useLogoutMutation()
  const connected = Object.values(workspace?.services ?? {}).filter(
    (service) => service.status === "connected"
  ).length

  const productTitle = product?.brand?.title || product?.input || t("nav.products")
  const stageCrumbs: Record<string, string> = {
    build: t("crumbs.build"),
    publish: t("crumbs.publish"),
    distribute: t("crumbs.distribute"),
    promote: t("crumbs.promote"),
  }
  const stage = pathname.split("/")[3]
  const crumbs = (() => {
    if (pathname.startsWith("/products/") && id) {
      return (
        <>
          <Link to={ROUTES.products}>{t("nav.products")}</Link>
          {" / "}
          <Link to={ROUTES.product(id)}>
            <b>{productTitle}</b>
          </Link>
          {stage && stageCrumbs[stage] ? (
            <>
              {" / "}
              <b>{stageCrumbs[stage]}</b>
            </>
          ) : null}
        </>
      )
    }
    if (pathname === ROUTES.products) return <b>{t("nav.products")}</b>
    if (pathname === ROUTES.partners) return <b>{t("nav.partners")}</b>
    if (pathname === ROUTES.connections) return <b>{t("nav.connections")}</b>
    if (pathname === ROUTES.admin) return <b>{t("nav.admin")}</b>
    return <b>{t("nav.start")}</b>
  })()

  const initials = (user?.name || user?.email || "YO")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "YO"

  return (
    <header className="topbar">
      <div className="crumbs">{crumbs}</div>
      <div className="top-right">
        <Link
          to={ROUTES.connections}
          className={`plan-pill ${workspace?.sub ? "" : "none"}`}
        >
          <i />
          {workspace?.sub
            ? t("shell.plan_pill", {
                plan: workspace.sub === "yearly" ? "Yearly" : "6 months",
                count: connected,
              })
            : t("shell.choose_plan_cta")}
        </Link>
        <div
          className="flex overflow-hidden rounded-full border border-border bg-card"
          role="group"
          aria-label={t("shell.language")}
        >
          {UI_LOCALES.map((locale) => (
            <Button
              key={locale}
              type="button"
              variant="ghost"
              size="sm"
              className={
                i18n.resolvedLanguage === locale
                  ? "rounded-none bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                  : "rounded-none text-muted-foreground"
              }
              onClick={() => {
                void i18n.changeLanguage(locale)
              }}
            >
              {locale.toUpperCase()}
            </Button>
          ))}
        </div>
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="avatar"
            style={{ objectFit: "cover" }}
            title={user.email}
          />
        ) : (
          <Link to={ROUTES.connections} className="avatar" aria-label={t("shell.account")}>
            {initials}
          </Link>
        )}
        <button
          type="button"
          className="btn ghost"
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => void navigate(ROUTES.login),
            })
          }
        >
          {t("shell.sign_out")}
        </button>
      </div>
    </header>
  )
}

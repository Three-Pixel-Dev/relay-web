import { Link, useLocation, useNavigate } from "react-router"

import { ROUTES } from "@/constants/routes"
import { protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useLogoutMutation } from "@/shared/queries/auth.query"
import { useProductQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useSessionStore } from "@/shared/stores/session.store"
import { productName } from "@/util/format"

export function Topbar() {
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

  const productTitle = productName(product)
  const stageCrumbs: Record<string, string> = {
    build: "Build",
    publish: "Publish",
    distribute: "Distribute",
    promote: "Promote",
  }
  const stage = pathname.split("/")[3]
  const crumbs = (() => {
    if (pathname.startsWith("/products/") && id) {
      return (
        <>
          <Link to={ROUTES.products}>My products</Link>
          {" / "}
          <Link to={ROUTES.product(id)}>
            <b className="text-foreground">{productTitle}</b>
          </Link>
          {stage && stageCrumbs[stage] ? (
            <>
              {" / "}
              <b className="text-foreground">{stageCrumbs[stage]}</b>
            </>
          ) : null}
        </>
      )
    }
    if (pathname === ROUTES.products) return <b className="text-foreground">My products</b>
    if (pathname === ROUTES.partners) return <b className="text-foreground">Partners</b>
    if (pathname === ROUTES.connections) return <b className="text-foreground">Connections</b>
    if (pathname === ROUTES.profile) return <b className="text-foreground">Profile</b>
    if (pathname === ROUTES.admin) return <b className="text-foreground">Admin</b>
    return <b className="text-foreground">Start</b>
  })()

  const initials = (user?.name || user?.email || "YO")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "YO"

  const planLabel = workspace?.sub === "yearly" ? "Yearly" : "6 months"

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-3.5 border-b border-border bg-background/85 px-8 py-4 backdrop-blur-md max-md:px-4 max-md:py-3">
      <div className="text-sm font-medium text-muted-foreground">{crumbs}</div>
      <div className="flex items-center gap-2.5">
        <Link
          to={ROUTES.connections}
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card py-2 pr-3 pl-2.5 text-[13px] font-semibold max-md:max-w-[48vw] max-md:overflow-hidden max-md:text-ellipsis max-md:whitespace-nowrap",
          )}
        >
          <i
            className={cn(
              "size-2 rounded-full not-italic",
              workspace?.sub ? "bg-success" : "bg-destructive"
            )}
          />
          {workspace?.sub
            ? `Relay ${planLabel} · ${connected} connected`
            : "Choose a plan"}
        </Link>
        {user?.avatarUrl ? (
          <Link to={ROUTES.profile} title={user.email} aria-label="Profile">
            <img src={user.avatarUrl} alt="" className="size-9 rounded-full object-cover" />
          </Link>
        ) : (
          <Link
            to={ROUTES.profile}
            className="grid size-9 place-items-center rounded-full bg-linear-to-br from-lilac to-sky text-[13px] font-extrabold text-lilac-foreground"
            aria-label="Profile"
          >
            {initials}
          </Link>
        )}
        <button
          type="button"
          className={protoBtn({ variant: "ghost" })}
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => void navigate(ROUTES.login),
            })
          }
        >
          Sign out
        </button>
      </div>
    </header>
  )
}

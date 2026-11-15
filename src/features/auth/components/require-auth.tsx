import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router"

import { ROUTES } from "@/constants/routes"
import { useMeQuery } from "@/shared/queries/auth.query"
import { useSessionStore } from "@/shared/stores/session.store"

export function RequireAuth() {
  const location = useLocation()
  const accessToken = useSessionStore((s) => s.accessToken)
  const clear = useSessionStore((s) => s.clear)
  const me = useMeQuery(Boolean(accessToken))

  useEffect(() => {
    if (me.isError && accessToken) {
      clear()
    }
  }, [me.isError, accessToken, clear])

  if (!accessToken) {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />
  }

  if (me.isLoading || me.isError) {
    return (
      <div className="content" style={{ padding: 40 }}>
        <span className="spin" />
      </div>
    )
  }

  return <Outlet />
}

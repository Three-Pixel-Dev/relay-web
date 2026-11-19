import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router"

import { Spin } from "@/components/common/spin"
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
      <div className="p-10">
        <Spin />
      </div>
    )
  }

  return <Outlet />
}

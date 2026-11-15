import { Navigate, Outlet } from "react-router"

import { ROUTES } from "@/constants/routes"
import { useSessionStore } from "@/shared/stores/session.store"

export function AuthLayout() {
  const accessToken = useSessionStore((s) => s.accessToken)

  if (accessToken) {
    return <Navigate to={ROUTES.start} replace />
  }

  return (
    <div
      className="auth-shell"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background:
          "radial-gradient(1200px 600px at 10% -10%, color-mix(in oklab, var(--sun, #f5c542) 22%, transparent), transparent), var(--bg, #0f1115)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em" }}>relay</div>
          <p className="muted small" style={{ marginTop: 6 }}>
            Build, sell, get seen
          </p>
        </div>
        <div className="card" style={{ padding: 22 }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

import { Navigate, Outlet } from "react-router"

import { ROUTES } from "@/constants/routes"
import { cardClass } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useSessionStore } from "@/shared/stores/session.store"

export function AuthLayout() {
  const accessToken = useSessionStore((s) => s.accessToken)

  if (accessToken) {
    return <Navigate to={ROUTES.start} replace />
  }

  return (
    <div className="grid min-h-full place-items-center bg-[radial-gradient(1200px_600px_at_10%_-10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] bg-background p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-[22px] text-center">
          <div className="text-[28px] font-bold tracking-tight">relay</div>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Build, sell, get seen</p>
        </div>
        <div className={cn(cardClass, "p-[22px]")}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

import { ArrowLeft } from "lucide-react"
import { Link, Navigate, Outlet } from "react-router"

import { BrandLogo } from "@/components/common/relayguy-mark"
import { ThemeToggle } from "@/components/common/theme-toggle"
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
    <div className="relative grid min-h-full place-items-center bg-[radial-gradient(1200px_600px_at_10%_-10%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent)] bg-background p-6">
      <div className="absolute top-4 left-4">
        <Link
          to={ROUTES.landing}
          className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
      </div>
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-[420px]">
        <div className="mb-[22px] flex flex-col items-center text-center">
          <BrandLogo size={56} nameClassName="text-[28px]" />
          <p className="mt-2.5 text-[13px] text-muted-foreground">Build, sell, get seen</p>
        </div>
        <div className={cn(cardClass, "p-[22px]")}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

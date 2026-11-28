import { Link } from "react-router"

import { RelayGuyMark } from "@/components/common/relayguy-mark"
import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/shared/stores/ui.store"

export function AppToast() {
  const toast = useUiStore((state) => state.toast)
  const hasConnectionsHint = Boolean(toast && /connections/i.test(toast))

  return (
    <div
      className={cn(
        "fixed bottom-[26px] left-1/2 z-60 flex max-w-[min(560px,90vw)] -translate-x-1/2 translate-y-5 items-center gap-2.5 rounded-xl bg-foreground px-[18px] py-3 text-left text-sm font-semibold text-background opacity-0 transition duration-200",
        hasConnectionsHint ? "pointer-events-auto" : "pointer-events-none",
        toast && "translate-y-0 opacity-100"
      )}
      role="status"
      aria-live="polite"
    >
      <RelayGuyMark size={26} className="border-0" />
      <span>{toast}</span>
      {hasConnectionsHint ? (
        <Link to={ROUTES.connections} className="ml-1 underline underline-offset-2">
          Open Connections
        </Link>
      ) : null}
    </div>
  )
}

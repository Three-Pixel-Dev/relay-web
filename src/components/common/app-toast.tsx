import { cn } from "@/lib/utils"
import { useUiStore } from "@/shared/stores/ui.store"

export function AppToast() {
  const toast = useUiStore((state) => state.toast)

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-[26px] left-1/2 z-60 max-w-[min(560px,90vw)] -translate-x-1/2 translate-y-5 rounded-xl bg-foreground px-[18px] py-3 text-center text-sm font-semibold text-background opacity-0 transition duration-200",
        toast && "translate-y-0 opacity-100"
      )}
      role="status"
      aria-live="polite"
    >
      {toast}
    </div>
  )
}

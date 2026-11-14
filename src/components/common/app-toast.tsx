import { useUiStore } from "@/shared/stores/ui.store"

export function AppToast() {
  const toast = useUiStore((state) => state.toast)

  return (
    <div id="toast" className={toast ? "show" : ""} role="status" aria-live="polite">
      {toast}
    </div>
  )
}

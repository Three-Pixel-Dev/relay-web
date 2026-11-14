import { useUiStore } from "@/shared/stores/ui.store"

export function AppModal() {
  const modal = useUiStore((state) => state.modal)
  const closeModal = useUiStore((state) => state.closeModal)

  if (!modal) return null

  return (
    <div className="backdrop" data-close onClick={closeModal}>
      <section
        className={`modal ${modal.wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{modal.title}</h2>
        {modal.body}
        {modal.actions ? <div className="actions">{modal.actions}</div> : null}
      </section>
    </div>
  )
}

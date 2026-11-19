import { protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useUiStore } from "@/shared/stores/ui.store"

export function AppModal() {
  const modal = useUiStore((state) => state.modal)
  const closeModal = useUiStore((state) => state.closeModal)

  if (!modal) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-5 backdrop-blur-md"
      data-close
      onClick={closeModal}
    >
      <section
        className={cn(
          "max-h-[92vh] w-full max-w-[640px] overflow-auto rounded-[22px] border border-border-strong bg-card p-[26px]",
          modal.wide && "max-w-[900px]"
        )}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-2 text-xl font-semibold">{modal.title}</h2>
        {modal.body}
        {modal.actions ? (
          <div className="mt-[22px] flex flex-wrap justify-end gap-2.5">{modal.actions}</div>
        ) : null}
      </section>
    </div>
  )
}

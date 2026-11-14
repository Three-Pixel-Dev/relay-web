import { Bolt, Check } from "lucide-react"
import { Link } from "react-router"

import { openConnectModal } from "@/features/connections/components/connect-modal"
import { ROUTES } from "@/constants/routes"
import {
  useApproveProductMutation,
  useCancelProductMutation,
  useProceedProductMutation,
  useResumeProductMutation,
  useSuggestProductMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { Product, RelayCatalog } from "@/shared/types/relay"
import { money } from "@/util/format"

interface BuildActionBarProps {
  product: Product
  catalog: RelayCatalog
}

export function BuildActionBar({ product, catalog }: BuildActionBarProps) {
  const { data: workspace } = useWorkspaceQuery()
  const proceed = useProceedProductMutation()
  const approve = useApproveProductMutation()
  const cancel = useCancelProductMutation()
  const resume = useResumeProductMutation()
  const suggest = useSuggestProductMutation()
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const i = product.cur
  const step = product.steps[i]
  const connected = (id: string) => workspace?.services[id]?.status === "connected"

  function askSuggest() {
    openModal({
      title: "What should change?",
      body: <SuggestForm onSend={(text) => { closeModal(); suggest.mutate({ id: product.id, text }) }} />,
    })
  }

  function askCancel() {
    openModal({
      title: "Pause this product?",
      body: (
        <p className="muted">
          Everything made so far is kept. {money(product.spend)} already spent on AI is not refunded.
        </p>
      ),
      actions: (
        <>
          <button type="button" className="btn ghost" onClick={closeModal}>Keep going</button>
          <button type="button" className="btn sun" onClick={() => { closeModal(); cancel.mutate(product.id) }}>
            Pause
          </button>
        </>
      ),
    })
  }

  if (product.stage === "paused") {
    return (
      <div className="actionbar">
        <span className="hint">Paused. Everything is kept.</span>
        <button type="button" className="btn sun" onClick={() => resume.mutate(product.id)}>Resume</button>
      </div>
    )
  }

  if (product.stage !== "build") {
    return (
      <div className="actionbar">
        <span className="hint">Built. {money(product.spend)} in AI.</span>
        <Link to={ROUTES.product(product.id)} className="btn ghost">Product overview</Link>
        <Link to={ROUTES.publish(product.id)} className="btn sun">Publish it</Link>
      </div>
    )
  }

  if (step.status === "running") {
    return (
      <div className="actionbar">
        <span className="hint"><span className="spin" /> Relay is working on step {i + 1}.</span>
        <button type="button" className="btn ghost" onClick={askCancel}>Stop</button>
      </div>
    )
  }

  if (step.status === "gate") {
    return (
      <div className="actionbar">
        <span className="hint">Approve the voice and Relay writes the other {product.structure.length - 1} sections the same way.</span>
        <button type="button" className="btn ghost danger" onClick={askCancel}>Cancel</button>
        <button type="button" className="btn ghost" onClick={askSuggest}>Change the voice</button>
        <button type="button" className="btn mint" onClick={() => approve.mutate(product.id)}>
          <Check className="size-4" /> Voice is right, write the rest
        </button>
      </div>
    )
  }

  if (step.status === "review" && (i === 1 || i === 2)) {
    return (
      <div className="actionbar">
        <span className="hint">{i === 1 ? "Pick a pocket above." : "Pick a product type above."}</span>
        <button type="button" className="btn ghost danger" onClick={askCancel}>Cancel</button>
        {i === 1 ? (
          <button type="button" className="btn ghost" onClick={askSuggest}>Different direction</button>
        ) : null}
      </div>
    )
  }

  if (step.status === "review") {
    return (
      <div className="actionbar">
        <span className="hint">Happy with it?</span>
        <button type="button" className="btn ghost danger" onClick={askCancel}>Cancel</button>
        <button type="button" className="btn ghost" onClick={askSuggest}>Suggest a change</button>
        <button type="button" className="btn mint" onClick={() => approve.mutate(product.id)}>
          <Check className="size-4" /> Looks good, continue
        </button>
      </div>
    )
  }

  const needs: Record<number, string | null> = {
    0: product.sources.length && !product.profile ? "llm" : null,
    1: "llm",
    3: "llm",
    4: "llm",
    5: "img",
    6: null,
  }
  const need = needs[i]
  const service = need ? catalog.services.find((item) => item.id === need) : undefined
  const missing = Boolean(need && !connected(need))

  return (
    <div className="actionbar">
      <span className="hint">
        {missing
          ? `Relay needs your ${service?.name} key for this step.`
          : `Relay will do step ${i + 1}: ${catalog.buildSteps[i].toLowerCase()}.`}
      </span>
      <button type="button" className="btn ghost danger" onClick={askCancel}>Cancel</button>
      <button type="button" className="btn ghost" onClick={askSuggest}>Suggest</button>
      {missing && service ? (
        <button type="button" className="btn sun" onClick={() => openConnectModal(service)}>
          Add {service.name} key
        </button>
      ) : (
        <button type="button" className="btn sun" onClick={() => proceed.mutate(product.id)}>
          <Bolt className="size-4" /> Proceed
        </button>
      )}
    </div>
  )
}

function SuggestForm({ onSend }: { onSend: (text: string) => void }) {
  return (
    <>
      <textarea id="sg" placeholder="Warmer voice. Shorter sections." />
      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => useUiStore.getState().closeModal()}>
          Cancel
        </button>
        <button
          type="button"
          className="btn sun"
          onClick={() => {
            const value = (document.getElementById("sg") as HTMLTextAreaElement | null)?.value ?? ""
            onSend(value)
          }}
        >
          Send
        </button>
      </div>
    </>
  )
}

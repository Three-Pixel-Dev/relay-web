import { Bolt, Check, Paperclip } from "lucide-react"
import { Link } from "react-router"

import { openConnectModal } from "@/features/connections/components/connect-modal"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { ROUTES } from "@/constants/routes"
import {
  useAddSourcesMutation,
  useApproveProductMutation,
  useCancelProductMutation,
  useContinueQualityProductMutation,
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
  const continueQuality = useContinueQualityProductMutation()
  const addSources = useAddSourcesMutation()
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
      body: (
        <SuggestForm
          onSend={(text) => {
            closeModal()
            suggest.mutate({ id: product.id, text })
          }}
        />
      ),
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
          <button type="button" className="btn ghost" onClick={closeModal}>
            Keep going
          </button>
          <button
            type="button"
            className="btn sun"
            onClick={() => {
              closeModal()
              cancel.mutate(product.id)
            }}
          >
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
        <button type="button" className="btn sun" onClick={() => resume.mutate(product.id)}>
          Resume
        </button>
      </div>
    )
  }

  if (product.stage !== "build") {
    return (
      <div className="actionbar">
        <span className="hint">Built. {money(product.spend)} in AI.</span>
        <Link to={ROUTES.product(product.id)} className="btn ghost">
          Product overview
        </Link>
      </div>
    )
  }

  // Gate build steps after Step 0 (Sources & Source summary)
  if (i > 0) {
    return (
      <div className="actionbar">
        <span className="hint">
          Next steps coming soon — Step 1 (Sources &amp; Source summary) is complete.
        </span>
        <Link to={ROUTES.product(product.id)} className="btn soft">
          Product overview
        </Link>
      </div>
    )
  }

  if (step.status === "running") {
    return (
      <div className="actionbar">
        <span className="hint">
          <span className="spin" /> Relay is working on step {i + 1}.
        </span>
        <button type="button" className="btn ghost" onClick={askCancel}>
          Stop
        </button>
      </div>
    )
  }

  if (step.status === "quality_gate") {
    const warningText =
      product.qualityWarning ||
      step.qualityWarning ||
      "This source is too thin to build a product from. Add more sources or tell us what you know."
    return (
      <div className="actionbar">
        <span className="hint">{warningText}</span>
        <button
          type="button"
          className="btn soft"
          onClick={() =>
            openSourceDialog({
              sources: product.sources,
              onChange: (sources) => {
                const added = sources.filter(
                  (s) => !product.sources.some((p) => p.id === s.id)
                )
                if (added.length) addSources.mutate({ id: product.id, sources: added })
              },
            })
          }
        >
          <Paperclip className="size-3.5" /> Add sources
        </button>
        <button
          type="button"
          className="btn sun"
          disabled={continueQuality.isPending}
          onClick={() => continueQuality.mutate(product.id)}
        >
          Continue anyway
        </button>
      </div>
    )
  }

  if (step.status === "review") {
    return (
      <div className="actionbar">
        <span className="hint">Happy with it?</span>
        <button type="button" className="btn ghost danger" onClick={askCancel}>
          Cancel
        </button>
        <button type="button" className="btn ghost" onClick={askSuggest}>
          Suggest a change
        </button>
        <button type="button" className="btn mint" onClick={() => approve.mutate(product.id)}>
          <Check className="size-4" /> Looks good, continue
        </button>
      </div>
    )
  }

  const need = product.sources.length && !product.profile ? "llm" : null
  const service = need ? catalog.services.find((item) => item.id === need) : undefined
  const missing = Boolean(need && !connected(need))

  return (
    <div className="actionbar">
      <span className="hint">
        {missing
          ? `Relay needs your ${service?.name} key for this step.`
          : `Relay will do step ${i + 1}: ${catalog.buildSteps[i].toLowerCase()}.`}
      </span>
      <button type="button" className="btn ghost danger" onClick={askCancel}>
        Cancel
      </button>
      <button type="button" className="btn ghost" onClick={askSuggest}>
        Suggest
      </button>
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
        <button
          type="button"
          className="btn ghost"
          onClick={() => useUiStore.getState().closeModal()}
        >
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

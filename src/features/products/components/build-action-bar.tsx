import { Bolt, Check, Paperclip } from "lucide-react"
import { Link } from "react-router"

import { Spin } from "@/components/common/spin"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { followThreadToEnd } from "@/features/products/components/thread-pane"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { ROUTES } from "@/constants/routes"
import { actionBarClass, fieldClass, protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
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
import { apiError } from "@/util/api-error"
import { money } from "@/util/format"

interface BuildActionBarProps {
  product: Product
  catalog: RelayCatalog
}

const hintClass = "mr-auto text-[13px] text-muted-foreground"
const modalActionsClass = "mt-[22px] flex flex-wrap justify-end gap-2.5"

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
  const showToast = useUiStore((state) => state.showToast)
  const i = product.cur
  const step = product.steps[i]
  const connected = (id: string) => workspace?.services[id]?.status === "connected"

  function askSuggest() {
    openModal({
      title: "What should change?",
      body: (
        <SuggestForm
          pending={suggest.isPending}
          onSend={(text) => {
            if (suggest.isPending) return
            closeModal()
            followThreadToEnd()
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
        <p className="text-muted-foreground">
          Everything made so far is kept. {money(product.spend)} already spent on AI is not refunded.
        </p>
      ),
      actions: (
        <>
          <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
            Keep going
          </button>
          <button
            type="button"
            className={protoBtn()}
            disabled={cancel.isPending}
            onClick={() => {
              if (cancel.isPending) return
              closeModal()
              followThreadToEnd()
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
      <div className={actionBarClass}>
        <span className={hintClass}>Paused. Everything is kept.</span>
        <button
          type="button"
          className={protoBtn()}
          disabled={resume.isPending}
          onClick={() => {
            if (resume.isPending) return
            followThreadToEnd()
            resume.mutate(product.id)
          }}
        >
          Resume
        </button>
      </div>
    )
  }

  if (product.stage !== "build") {
    return (
      <div className={actionBarClass}>
        <span className={hintClass}>Built. {money(product.spend)} in AI.</span>
        <Link to={ROUTES.product(product.id)} className={protoBtn({ variant: "ghost" })}>
          Product overview
        </Link>
        <Link to={ROUTES.publish(product.id)} className={protoBtn()}>
          Publish it
        </Link>
      </div>
    )
  }

  if (step.status === "running") {
    return (
      <div className={actionBarClass}>
        <span className={cn(hintClass, "inline-flex items-center gap-2")}>
          <Spin /> Relay is working on step {i + 1}.
        </span>
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={askCancel}>
          Stop
        </button>
      </div>
    )
  }

  if (step.status === "quality_gate") {
    const warningText = product.qualityWarning || step.qualityWarning || ""
    const nonTeachable = warningText.startsWith("These sources cannot support")
    return (
      <div className={actionBarClass}>
        <span className={hintClass}>
          {nonTeachable ? "Add teachable sources to continue." : "Add more sources or continue anyway."}
        </span>
        <button
          type="button"
          className={protoBtn({ variant: nonTeachable ? "sun" : "soft" })}
          onClick={() =>
            openSourceDialog({
              sources: product.sources,
              onChange: (sources) => {
                const added = sources.filter(
                  (s) => !product.sources.some((p) => p.id === s.id)
                )
                if (added.length) {
                  followThreadToEnd()
                  addSources.mutate({ id: product.id, sources: added })
                }
              },
            })
          }
        >
          <Paperclip className="size-3.5" /> Add sources
        </button>
        {!nonTeachable ? (
          <button
            type="button"
            className={protoBtn()}
            disabled={continueQuality.isPending}
            onClick={() => {
              followThreadToEnd()
              continueQuality.mutate(product.id, {
                onError: (err) => showToast(apiError(err).message),
              })
            }}
          >
            Continue anyway
          </button>
        ) : null}
      </div>
    )
  }

  if (step.status === "gate") {
    return (
      <div className={actionBarClass}>
        <span className={hintClass}>Approve the voice to write the rest.</span>
        <button type="button" className={protoBtn({ variant: "danger" })} onClick={askCancel}>
          Cancel
        </button>
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={askSuggest}>
          Change the voice
        </button>
        <button
          type="button"
          className={protoBtn({ variant: "mint" })}
          disabled={approve.isPending}
          onClick={() => {
            followThreadToEnd()
            approve.mutate(product.id)
          }}
        >
          <Check className="size-4" /> Voice is right, write the rest
        </button>
      </div>
    )
  }

  if (step.status === "review") {
    if (i === 0 && product.profile) {
      const notViable =
        product.profile.viable === false ||
        /no viable|not viable|cannot support a paid/i.test(product.profile.verdict || "")
      if (notViable) {
        return (
          <div className={actionBarClass}>
            <span className={hintClass}>
              These sources cannot support a paid product yet. Add more sources to continue.
            </span>
            <button
              type="button"
              className={protoBtn()}
              onClick={() =>
                openSourceDialog({
                  sources: product.sources,
                  onChange: (sources) => {
                    const added = sources.filter(
                      (s) => !product.sources.some((p) => p.id === s.id)
                    )
                    if (added.length) {
                      followThreadToEnd()
                      addSources.mutate({ id: product.id, sources: added })
                    }
                  },
                })
              }
            >
              <Paperclip className="size-3.5" /> Add sources
            </button>
          </div>
        )
      }
    }
    if (i === 1) {
      const hasPocket = Boolean(product.pocket)
      return (
        <div className={actionBarClass}>
          <span className={hintClass}>
            {hasPocket
              ? "Switch pockets above, or continue to Product type."
              : "Pick a pocket above."}
          </span>
          <button
            type="button"
            className={protoBtn({ variant: "danger" })}
            disabled={cancel.isPending}
            onClick={askCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className={protoBtn({ variant: "ghost" })}
            disabled={suggest.isPending}
            onClick={askSuggest}
          >
            Suggest a change
          </button>
          {hasPocket ? (
            <button
              type="button"
              className={protoBtn({ variant: "mint" })}
              disabled={approve.isPending}
              onClick={() => {
                if (approve.isPending) return
                followThreadToEnd()
                approve.mutate(product.id)
              }}
            >
              <Check className="size-4" /> Looks good, continue
            </button>
          ) : null}
        </div>
      )
    }
    if (i === 2) {
      const hasType = Boolean(product.type)
      return (
        <div className={actionBarClass}>
          <span className={hintClass}>
            {hasType
              ? "Switch formats above, or continue to Structure."
              : "Pick a product type above."}
          </span>
          <button type="button" className={protoBtn({ variant: "danger" })} onClick={askCancel}>
            Cancel
          </button>
          <button type="button" className={protoBtn({ variant: "ghost" })} onClick={askSuggest}>
            Suggest a change
          </button>
          {hasType ? (
            <button
              type="button"
              className={protoBtn({ variant: "mint" })}
              disabled={approve.isPending}
              onClick={() => {
                followThreadToEnd()
                approve.mutate(product.id)
              }}
            >
              <Check className="size-4" /> Looks good, continue
            </button>
          ) : null}
        </div>
      )
    }
    return (
      <div className={actionBarClass}>
        <span className={hintClass}>Happy with it?</span>
        <button
          type="button"
          className={protoBtn({ variant: "danger" })}
          disabled={cancel.isPending}
          onClick={askCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={protoBtn({ variant: "ghost" })}
          disabled={suggest.isPending}
          onClick={askSuggest}
        >
          Suggest a change
        </button>
        <button
          type="button"
          className={protoBtn({ variant: "mint" })}
          disabled={approve.isPending}
          onClick={() => {
            if (approve.isPending) return
            followThreadToEnd()
            approve.mutate(product.id)
          }}
        >
          <Check className="size-4" /> Looks good, continue
        </button>
      </div>
    )
  }

  const need =
    (i === 0 && product.sources.length && !product.profile) ||
    i === 1 ||
    i === 3 ||
    i === 4
      ? "llm"
      : i === 5
        ? !connected("llm")
          ? "llm"
          : "img"
        : i === 6
          ? "img"
          : null
  const service = need ? catalog.services.find((item) => item.id === need) : undefined
  const missing = Boolean(need && !connected(need))

  return (
    <div className={actionBarClass}>
      <span className={hintClass}>
        {missing
          ? `Relay needs your ${service?.name} key for this step.`
          : `Relay will do step ${i + 1}: ${catalog.buildSteps[i].toLowerCase()}.`}
      </span>
      <button
        type="button"
        className={protoBtn({ variant: "danger" })}
        disabled={cancel.isPending}
        onClick={askCancel}
      >
        Cancel
      </button>
      <button
        type="button"
        className={protoBtn({ variant: "ghost" })}
        disabled={suggest.isPending}
        onClick={askSuggest}
      >
        Suggest
      </button>
      {missing && service ? (
        <button type="button" className={protoBtn()} onClick={() => { followThreadToEnd(); openConnectModal(service) }}>
          Add {service.name} key
        </button>
      ) : (
        <button
          type="button"
          className={protoBtn()}
          disabled={proceed.isPending}
          onClick={() => {
            if (proceed.isPending) return
            followThreadToEnd()
            proceed.mutate(product.id, {
              onError: (err) => showToast(apiError(err).message),
            })
          }}
        >
          <Bolt className="size-4" /> Proceed
        </button>
      )}
    </div>
  )
}

function SuggestForm({
  onSend,
  pending = false,
}: {
  onSend: (text: string) => void
  pending?: boolean
}) {
  return (
    <>
      <textarea id="sg" className={fieldClass} placeholder="What should change?" />
      <div className={modalActionsClass}>
        <button
          type="button"
          className={protoBtn({ variant: "ghost" })}
          onClick={() => useUiStore.getState().closeModal()}
        >
          Cancel
        </button>
        <button
          type="button"
          className={protoBtn()}
          disabled={pending}
          onClick={() => {
            if (pending) return
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

import { Check, Paperclip } from "lucide-react"

import { SourceChips } from "@/components/common/source-chips"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import {
  useAddSourcesMutation,
  useRemoveSourceMutation,
} from "@/shared/queries/product.query"
import type { Product, RelayCatalog } from "@/shared/types/relay"

interface StepCardProps {
  product: Product
  index: number
  catalog: RelayCatalog
}

export function StepCard({ product, index, catalog }: StepCardProps) {
  const step = product.steps[index]
  const live = index === product.cur && product.stage === "build"
  const title = catalog.buildSteps[index]
  const status =
    index > 0 ? (
      <span className="chip outline">Coming soon</span>
    ) : step.status === "done" ? (
      <span className="chip mint">
        <i />
        Done
      </span>
    ) : step.status === "running" ? (
      <span className="chip sun">
        <span className="spin" />
        Working
      </span>
    ) : step.status === "review" || step.status === "gate" ? (
      <span className="chip sun">
        <i />
        Your call
      </span>
    ) : live ? (
      <span className="chip sun">
        <i />
        Waiting for you
      </span>
    ) : (
      <span className="chip">Up next</span>
    )

  return (
    <div
      className={`stepcard ${step.status === "done" ? "done" : live ? "live" : ""}`}
      id={`step-${index}`}
    >
      <header>
        <b>
          {index + 1}. {title}
        </b>
        {status}
      </header>
      <div className="body">
        <StepBody product={product} index={index} />
      </div>
    </div>
  )
}

function ProgressLines({ lines }: { lines: string[] }) {
  return (
    <div className="progress-lines">
      {lines.map((line, index) => (
        <div key={`${line}-${index}`}>
          {index < lines.length - 1 ? (
            <span className="ok">
              <Check className="size-3" />
            </span>
          ) : (
            <span className="spin" />
          )}
          {line}
        </div>
      ))}
    </div>
  )
}

function StepBody({
  product,
  index,
}: {
  product: Product
  index: number
}) {
  const step = product.steps[index]
  const addSources = useAddSourcesMutation()
  const removeSource = useRemoveSourceMutation()

  if (index === 0) {
    return (
      <>
        <p className="does">
          {product.input ||
            (product.sources.length
              ? "Relay takes the subject from the sources."
              : "No input given; Relay proposes from what sells.")}
          {product.forElse ? (
            <span className="chip lilac" style={{ marginLeft: 6 }}>
              Built for {product.client || "a client"}
            </span>
          ) : null}
        </p>
        {product.sources.length ? (
          <SourceChips
            sources={product.sources}
            onRemove={
              step.status === "done"
                ? undefined
                : (id) => removeSource.mutate({ id: product.id, sourceId: id })
            }
          />
        ) : null}
        {step.status !== "done" && step.status !== "running" ? (
          <button
            type="button"
            className="btn soft"
            style={{ marginTop: 10 }}
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
        ) : null}
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {product.profile ? (
          <div className="profile">
            <div className="between">
              <b>{product.forElse ? "Creator overview" : "What your sources say"}</b>
              <span className="small muted">
                {product.profile.read.videos
                  ? `${product.profile.read.videos} videos · `
                  : ""}
                {product.profile.read.docs ? `${product.profile.read.docs} docs · ` : ""}
                {product.profile.read.passages.toLocaleString()} passages
              </span>
            </div>
            <div className="kv">
              <span>Niche</span>
              <b>{product.profile.niche}</b>
            </div>
            <div className="kv">
              <span>Transformation</span>
              <b>{product.profile.transformation}</b>
            </div>
            <div className="themes">
              {product.profile.themes.map((theme) => (
                <div key={theme.t}>
                  <div className="between">
                    <b>{theme.t}</b>
                    <span
                      className={`chip ${
                        theme.level === "High"
                          ? "mint"
                          : theme.level === "Medium"
                            ? "outline"
                            : "sun"
                      }`}
                    >
                      {theme.level}
                    </span>
                  </div>
                  <small>{theme.d}</small>
                </div>
              ))}
            </div>
            <div className="kv">
              <span>Verdict</span>
              <b>{product.profile.verdict}</b>
            </div>
            <div className="kv">
              <span>Audience</span>
              <b>{product.profile.audience}</b>
            </div>
            <div className="kv">
              <span>Voice</span>
              <b>{product.profile.voice}</b>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <p className="does muted">
      Coming soon — this build step is not enabled on the server yet. Your indexed sources and
      source summary from Step 1 are saved and ready.
    </p>
  )
}

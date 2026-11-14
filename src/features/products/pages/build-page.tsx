import { Check } from "lucide-react"
import { Navigate, useParams } from "react-router"

import type { ReactNode } from "react"

import { StageBar } from "@/components/common/stage-bar"
import { ThreadText } from "@/components/common/thread-text"
import { ROUTES } from "@/constants/routes"
import { BuildActionBar } from "@/features/products/components/build-action-bar"
import { StepCard } from "@/features/products/components/step-card"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useAddSourcesMutation, useProductQuery } from "@/shared/queries/product.query"
import { formatTime, money } from "@/util/format"
import { SOURCE_KINDS } from "@/util/source"

export function BuildPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const addSources = useAddSourcesMutation()

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const shown = new Set<number>()
  const thread: { key: string; node: ReactNode }[] = []
  for (const message of product.thread) {
    thread.push({
      key: `${message.t}-${message.text.slice(0, 12)}`,
      node: (
        <div className={`msg ${message.who}`}>
          <span className="av">{message.who === "you" ? "YO" : "R"}</span>
          <div className="bubble">
            <ThreadText text={message.text} />
            <small>{formatTime(message.t)}</small>
          </div>
        </div>
      ),
    })
    if (message.who !== "relay") continue
    let idx = -1
    if (/^Got it[:.]|^No input/.test(message.text)) idx = 0
    const match = message.text.match(/^Next: \*\*(.+?)\*\*/)
    if (match) idx = catalog.buildSteps.findIndex((step) => step.toLowerCase() === match[1].toLowerCase())
    if (idx >= 0 && !shown.has(idx)) {
      shown.add(idx)
      thread.push({
        key: `step-${idx}`,
        node: <StepCard product={product} index={idx} catalog={catalog} />,
      })
    }
  }

  const typeName = catalog.types.find((item) => item.id === product.type)?.name

  return (
    <>
      <StageBar product={product} />
      <div className="runwrap">
        <div>
          <div className="thread">
            {thread.map((item) => (
              <div key={item.key}>{item.node}</div>
            ))}
          </div>
          <BuildActionBar product={product} catalog={catalog} />
        </div>
        <aside className="sidecol">
          <div className="card">
            <h3>Plan</h3>
            <div className="plan-mini" style={{ marginTop: 10 }}>
              {catalog.buildSteps.map((label, i) => {
                const status = product.steps[i].status
                const cls = status === "done" ? "done" : i === product.cur && product.stage === "build" ? "cur" : ""
                const who = i === 0 ? (product.sources.length ? "Text model" : "you") : i === 2 ? "you" : i === 5 ? "Image model" : i === 6 ? "Relay" : "Text model"
                return (
                  <div className={cls} key={label}>
                    <span className="dot">{status === "done" ? <Check className="size-2.5" /> : i + 1}</span>
                    <span>{label}</span>
                    <small>{who}</small>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="card budget">
            <h3>Spend</h3>
            <div className="kv"><span>AI so far</span><b>{money(product.spend)}</b></div>
            <div className="kv"><span>Estimate to Ready</span><b>{money(1.8 + (product.structure.length || 9) * 0.08)}</b></div>
            <p className="tiny dim" style={{ marginTop: 8 }}>Billed by your providers at their price.</p>
          </div>
          <div className="card">
            <div className="between">
              <h3>Sources</h3>
              <button
                type="button"
                className="link small"
                onClick={() =>
                  openSourceDialog({
                    sources: product.sources,
                    late: product.cur > 0,
                    onChange: (sources) => {
                      const added = sources.filter((s) => !product.sources.some((p) => p.id === s.id))
                      if (added.length) addSources.mutate({ id: product.id, sources: added })
                    },
                  })
                }
              >
                Add
              </button>
            </div>
            {product.sources.length ? (
              <>
                <div className="stack" style={{ marginTop: 10, gap: 6 }}>
                  {product.sources.map((source) => (
                    <div className="small" key={source.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="chip outline" style={{ flex: "none" }}>{SOURCE_KINDS[source.kind].short}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{source.name}</span>
                    </div>
                  ))}
                </div>
                <p className="tiny dim" style={{ marginTop: 8 }}>
                  {product.profile
                    ? `${product.profile.read.passages.toLocaleString()} passages indexed. Sections cite them.`
                    : "Read at step 1."}
                </p>
              </>
            ) : (
              <p className="small muted" style={{ marginTop: 8 }}>None. Relay writes from research and what you typed.</p>
            )}
          </div>
          {product.pocket ? (
            <div className="card">
              <h3>Pocket</h3>
              <p className="small muted" style={{ marginTop: 8 }}>{product.pocket.h}</p>
              {typeName ? <p className="small" style={{ marginTop: 8 }}><span className="chip outline">{typeName}</span></p> : null}
            </div>
          ) : null}
        </aside>
      </div>
    </>
  )
}

import { Check } from "lucide-react"
import { Navigate, useParams } from "react-router"

import type { ReactNode } from "react"

import { JumpScroll } from "@/components/common/jump-scroll"
import { SourceChips } from "@/components/common/source-chips"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { BuildActionBar } from "@/features/products/components/build-action-bar"
import { StepCard } from "@/features/products/components/step-card"
import { ThreadMessage } from "@/features/products/components/thread-message"
import { followThreadToEnd, ThreadPane } from "@/features/products/components/thread-pane"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { cardClass, kvClass, protoChip, linkClass } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useAddSourcesMutation,
  useProductEvents,
  useProductQuery,
} from "@/shared/queries/product.query"
import { money, pluralize } from "@/util/format"

export function BuildPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const addSources = useAddSourcesMutation()
  const isRunning = Boolean(
    product && product.stage === "build" && product.steps[product.cur]?.status === "running"
  )
  useProductEvents(id, isRunning)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const shown = new Set<number>()
  const thread: { key: string; node: ReactNode }[] = []
  for (const message of product.thread) {
    thread.push({
      key: `${message.t}-${message.text.slice(0, 12)}`,
      node: (
        <ThreadMessage who={message.who} text={message.text} at={message.t} />
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
  const lastMessage = product.thread.at(-1)
  const pinToEnd = lastMessage?.who === "you"

  const scrollKey = `${product.thread.length}-${product.updated}-${product.steps[product.cur]?.status}`

  return (
    <div className="product-run flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <StageBar product={product} />
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_340px] grid-rows-[minmax(0,1fr)] items-stretch gap-6 overflow-hidden max-md:grid-cols-1 max-md:grid-rows-[minmax(0,1fr)_minmax(0,auto)]">
        <ThreadPane
          scrollKey={scrollKey}
          pinToEnd={pinToEnd}
          footer={<BuildActionBar product={product} catalog={catalog} />}
        >
          {thread.map((item) => (
            <div key={item.key}>{item.node}</div>
          ))}
        </ThreadPane>
        <JumpScroll
          className="h-full min-h-0 max-md:h-auto max-md:max-h-[40svh]"
          scrollKey={`${product.sources.length}-${product.updated}`}
        >
          <div className={cn(cardClass, "mb-3.5")}>
            <h3>Plan</h3>
            <div className="mt-2.5 grid gap-1">
              {catalog.buildSteps.map((label, i) => {
                const status = product.steps[i].status
                const isCur = i === product.cur && product.stage === "build"
                const who =
                  i === 0
                    ? product.sources.length
                      ? "Text model"
                      : "you"
                    : i === 2
                      ? "you"
                      : i === 5
                        ? "Image model"
                        : i === 6
                          ? "Relay"
                          : "Text model"
                return (
                  <div
                    className={cn(
                      "grid grid-cols-[22px_1fr_auto] items-center gap-2 rounded-md px-2 py-1.5 text-[13px]",
                      isCur && "bg-muted"
                    )}
                    key={label}
                  >
                    <span
                      className={cn(
                        "grid size-[18px] place-items-center rounded-full text-[10px] bg-secondary text-muted-foreground",
                        status === "done" && "bg-success/20 text-success",
                        isCur && "bg-primary text-primary-foreground"
                      )}
                    >
                      {status === "done" ? <Check className="size-2.5" /> : i + 1}
                    </span>
                    <span>{label}</span>
                    <small className="text-[11.5px] text-dim">{who}</small>
                  </div>
                )
              })}
            </div>
          </div>
          <div className={cn(cardClass, "mb-3.5")}>
            <h3>Spend</h3>
            <div className={kvClass}>
              <span className="text-muted-foreground">AI so far</span>
              <b>{money(product.spend)}</b>
            </div>
            <div className={kvClass}>
              <span className="text-muted-foreground">Estimate to Ready</span>
              <b>{money(1.8 + (product.structure.length || 9) * 0.08)}</b>
            </div>
            <p className="mt-2 text-xs text-dim">Billed by your providers at their price.</p>
          </div>
          <div className={cn(cardClass, "mb-3.5 min-w-0 overflow-hidden")}>
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <h3>Sources</h3>
              <button
                type="button"
                className={linkClass}
                onClick={() =>
                  openSourceDialog({
                    sources: product.sources,
                    late: product.cur > 0,
                    onChange: (sources) => {
                      const added = sources.filter((s) => !product.sources.some((p) => p.id === s.id))
                      if (added.length) {
                        followThreadToEnd()
                        addSources.mutate({ id: product.id, sources: added })
                      }
                    },
                  })
                }
              >
                Add
              </button>
            </div>
            {product.sources.length ? (
              <>
                <div className="mt-2.5">
                  <SourceChips sources={product.sources} />
                </div>
                <p className="mt-2 text-xs text-dim">
                  {product.profile
                    ? `${pluralize(product.profile.read.passages, "passage")} indexed. Sections cite them.`
                    : "Read at step 1."}
                </p>
              </>
            ) : (
              <p className="mt-2 text-[13px] text-muted-foreground">
                None. Relay writes from research and what you typed.
              </p>
            )}
          </div>
          {product.pocket ? (
            <div className={cn(cardClass, "mb-3.5")}>
              <h3>Pocket</h3>
              <p className="mt-2 text-[13px] text-muted-foreground">{product.pocket.h}</p>
              {typeName ? (
                <p className="mt-2 text-[13px]">
                  <span className={protoChip({ variant: "outline" })}>{typeName}</span>
                </p>
              ) : null}
            </div>
          ) : null}
        </JumpScroll>
      </div>
    </div>
  )
}

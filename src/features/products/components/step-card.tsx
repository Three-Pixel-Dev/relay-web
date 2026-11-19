import { Check, Paperclip } from "lucide-react"

import { ChipDot, Spin } from "@/components/common/spin"
import { SourceChips } from "@/components/common/source-chips"
import { followThreadToEnd } from "@/features/products/components/thread-pane"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { kvClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import {
  useAddSourcesMutation,
  useRemoveSourceMutation,
} from "@/shared/queries/product.query"
import type { Product, RelayCatalog } from "@/shared/types/relay"
import { pluralize } from "@/util/format"

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
      <span className={protoChip({ variant: "outline" })}>Coming soon</span>
    ) : step.status === "done" ? (
      <span className={protoChip({ variant: "mint" })}>
        <ChipDot />
        Done
      </span>
    ) : step.status === "running" ? (
      <span className={protoChip({ variant: "sun" })}>
        <Spin />
        Working
      </span>
    ) : step.status === "quality_gate" ? (
      <span className={protoChip({ variant: "sun" })}>
        <ChipDot />
        Check sources
      </span>
    ) : step.status === "review" || step.status === "gate" ? (
      <span className={protoChip({ variant: "sun" })}>
        <ChipDot />
        Your call
      </span>
    ) : live ? (
      <span className={protoChip({ variant: "sun" })}>
        <ChipDot />
        Waiting for you
      </span>
    ) : (
      <span className={protoChip()}>Up next</span>
    )

  return (
    <div
      className={cn(
        "max-w-[min(100%,42rem)] overflow-hidden rounded-lg border-[1.5px] border-border-strong bg-card",
        step.status === "done" && "border-border",
        live && "border-primary"
      )}
      id={`step-${index}`}
    >
      <header className="flex items-center justify-between gap-2.5 border-b border-border bg-muted px-4 py-3">
        <b className="text-sm">
          {index + 1}. {title}
        </b>
        {status}
      </header>
      <div className="p-4">
        <StepBody product={product} index={index} />
      </div>
    </div>
  )
}

function ProgressLines({ lines }: { lines: string[] }) {
  return (
    <div className="mt-3 grid gap-1.5 text-[13px] text-muted-foreground">
      {lines.map((line, index) => (
        <div className="flex items-center gap-2" key={`${line}-${index}`}>
          {index < lines.length - 1 ? (
            <span className="text-success">
              <Check className="size-3" />
            </span>
          ) : (
            <Spin />
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
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">
          {product.input ||
            (product.sources.length
              ? "Relay takes the subject from the sources."
              : "No input given; Relay proposes from what sells.")}
          {product.forElse ? (
            <span className={cn(protoChip({ variant: "lilac" }), "ml-1.5")}>
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
            className={cn(protoBtn({ variant: "soft" }), "mt-2.5")}
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
        ) : null}
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {step.status === "quality_gate" ? (
          <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
            {product.qualityWarning ||
              step.qualityWarning ||
              "This source is too thin to build a product from. Add more sources or tell us what you know."}
          </p>
        ) : null}
        {product.profile ? (
          <div className="mt-3.5 grid gap-2.5 rounded-md border border-border-strong bg-muted p-4">
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <b>{product.forElse ? "Creator overview" : "What your sources say"}</b>
              <span className="text-[13px] text-muted-foreground">
                {[
                  product.profile.read.videos
                    ? pluralize(product.profile.read.videos, "video")
                    : "",
                  product.profile.read.docs ? pluralize(product.profile.read.docs, "doc") : "",
                  pluralize(product.profile.read.passages, "passage"),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </div>
            <div className={cn(kvClass, "items-start gap-4")}>
              <span className="w-[118px] shrink-0 text-muted-foreground max-md:w-auto">Niche</span>
              <b className="flex-1 text-left font-medium leading-relaxed">{product.profile.niche}</b>
            </div>
            <div className={cn(kvClass, "items-start gap-4")}>
              <span className="w-[118px] shrink-0 text-muted-foreground max-md:w-auto">
                Transformation
              </span>
              <b className="flex-1 text-left font-medium leading-relaxed">
                {product.profile.transformation}
              </b>
            </div>
            <div className="grid gap-2">
              {product.profile.themes.map((theme) => (
                <div
                  key={theme.t}
                  className="rounded-xl border border-border bg-foreground/3 px-3.5 py-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3.5">
                    <b>{theme.t}</b>
                    <span
                      className={protoChip({
                        variant:
                          theme.level === "High"
                            ? "mint"
                            : theme.level === "Medium"
                              ? "outline"
                              : "sun",
                      })}
                    >
                      {theme.level}
                    </span>
                  </div>
                  <small className="mt-1 block text-[12.5px] leading-relaxed text-muted-foreground">
                    {theme.d}
                  </small>
                </div>
              ))}
            </div>
            <div className={cn(kvClass, "items-start gap-4")}>
              <span className="w-[118px] shrink-0 text-muted-foreground max-md:w-auto">Verdict</span>
              <b className="flex-1 text-left font-medium leading-relaxed">{product.profile.verdict}</b>
            </div>
            <div className={cn(kvClass, "items-start gap-4")}>
              <span className="w-[118px] shrink-0 text-muted-foreground max-md:w-auto">Audience</span>
              <b className="flex-1 text-left font-medium leading-relaxed">{product.profile.audience}</b>
            </div>
            <div className={cn(kvClass, "items-start gap-4")}>
              <span className="w-[118px] shrink-0 text-muted-foreground max-md:w-auto">Voice</span>
              <b className="flex-1 text-left font-medium leading-relaxed">{product.profile.voice}</b>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
      Coming soon — this build step is not enabled on the server yet. Your indexed sources and
      source summary from Step 1 are saved and ready.
    </p>
  )
}

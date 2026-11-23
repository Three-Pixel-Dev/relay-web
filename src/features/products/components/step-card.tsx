import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown, ChevronUp, Download, Paperclip, Plus, RefreshCw, Sparkles, X } from "lucide-react"

import { AuthGraphic, CoverArt } from "@/components/common/cover-art"
import { ChipDot, Spin } from "@/components/common/spin"
import { SourceChips } from "@/components/common/source-chips"
import { followThreadToEnd } from "@/features/products/components/thread-pane"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { fieldClass, kvClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import {
  useAddSectionMutation,
  useAddSourcesMutation,
  useChoosePocketMutation,
  useChooseTypeMutation,
  useRegenerateSectionMutation,
  useRemoveSectionMutation,
  useRemoveSourceMutation,
  useUpdateBrandMutation,
} from "@/shared/queries/product.query"
import { downloadProductFile } from "@/shared/services/product.service"
import type { Pocket, Product, ProductFile, ProductType, RelayCatalog } from "@/shared/types/relay"
import { pagesCount, pluralize } from "@/util/format"

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
    step.status === "done" ? (
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
        <StepBody product={product} index={index} catalog={catalog} />
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
  catalog,
}: {
  product: Product
  index: number
  catalog: RelayCatalog
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

  if (index === 1) {
    return <PocketsStepBody product={product} />
  }

  if (index === 2) {
    return <TypesStepBody product={product} catalog={catalog} />
  }

  if (index === 3) {
    return <StructureStepBody product={product} />
  }

  if (index === 4) {
    return <ManuscriptStepBody product={product} />
  }

  if (index === 5) {
    return <BrandingStepBody product={product} catalog={catalog} />
  }

  return <ReadyStepBody product={product} catalog={catalog} />
}

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf_letter: "PDF Letter",
  pdf_a4: "PDF A4",
  epub: "EPUB",
  docx: "DOCX",
  mockups: "Mockups",
  html: "Canva-editable",
}

function ReadyStepBody({ product, catalog }: { product: Product; catalog: RelayCatalog }) {
  const step = product.steps[6]
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const files = product.files ?? []
  const palette = catalog.palettes[product.brand?.palette ?? 0] ?? catalog.palettes[0]
  const title = product.brand?.title || product.name || "Untitled product"
  const previewSections = product.structure.slice(0, 11)

  async function handleDownload(file: ProductFile) {
    setDownloadingId(file.id)
    try {
      await downloadProductFile(product.id, file.id, `${file.fileType}-v${file.version}`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {files.length
          ? "Pages laid out and files packaged. Download any format below — they are yours."
          : "Relay lays out your pages and packages US Letter PDF, A4 PDF, EPUB, DOCX, mockups, and a Canva-editable HTML pack."}
      </p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {files.length > 0 ? (
        <div className="mt-3.5 grid gap-4">
          {palette ? (
            <div className="grid grid-cols-4 gap-2 max-sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-border-strong bg-muted shadow-xs">
                <CoverArt
                  palette={palette}
                  variant={product.brand?.cover ?? 0}
                  title={title}
                  imageUrl={product.brand?.coverImageUrls?.[product.brand.cover] ?? null}
                />
              </div>
              {previewSections.map((sec, idx) => {
                const secImgUrl = product.brand?.pageGraphicUrls?.[sec.id] ?? null
                return (
                  <div
                    key={sec.id || `${sec.title}-${idx}`}
                    className="flex aspect-3/4 flex-col justify-between overflow-hidden rounded-lg border border-border p-2.5 text-[10px]"
                    style={{
                      backgroundColor: palette.cols[0],
                      color: palette.cols[1],
                    }}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <span
                        className="block text-[8px] font-bold uppercase tracking-wider"
                        style={{ color: palette.cols[2] }}
                      >
                        Section {idx + 1}
                      </span>
                      <b className="mt-0.5 line-clamp-2 block text-[10.5px] leading-snug">
                        {sec.title}
                      </b>
                      <div
                        className="my-1.5 h-px w-full"
                        style={{ backgroundColor: palette.cols[3] }}
                      />
                      {secImgUrl ? (
                        <AuthGraphic
                          imageUrl={secImgUrl}
                          alt={sec.title}
                          className="mb-1.5 h-14 w-full rounded object-cover"
                        />
                      ) : null}
                      <p
                        className={cn(
                          "text-[9px] leading-relaxed",
                          secImgUrl ? "line-clamp-2" : "line-clamp-4"
                        )}
                        style={{ color: palette.cols[4] }}
                      >
                        {sec.text || sec.moment || "Laid out page"}
                      </p>
                    </div>
                    <span className="text-[8px]" style={{ color: palette.cols[4] }}>
                      p. {idx + 2}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {files.map((file) => {
              const label = FILE_TYPE_LABELS[file.fileType] ?? file.fileType.toUpperCase()
              const busy = downloadingId === file.id
              return (
                <button
                  key={file.id}
                  type="button"
                  disabled={busy}
                  onClick={() => handleDownload(file)}
                  className={cn(protoBtn({ variant: "soft" }), "text-xs")}
                >
                  <Download className="size-3.5" />
                  {busy ? "Downloading…" : label}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </>
  )
}

function BrandingStepBody({ product, catalog }: { product: Product; catalog: RelayCatalog }) {
  const step = product.steps[5]
  const updateBrand = useUpdateBrandMutation()
  const brand = product.brand
  const [titleDraft, setTitleDraft] = useState(brand?.title ?? "")
  const generatedPaletteRef = useRef(brand?.palette ?? 0)
  const canEdit = product.stage === "build" && product.cur === 5 && step.status === "review"

  useEffect(() => {
    setTitleDraft(brand?.title ?? "")
  }, [brand?.title])

  const palette = catalog.palettes[brand?.palette ?? 0] ?? catalog.palettes[0]
  const paletteMatchesArt = (brand?.palette ?? 0) === generatedPaletteRef.current

  function previewImageUrl(variant: number) {
    if (!paletteMatchesArt) return null
    return brand?.coverImageUrls?.[variant] ?? null
  }

  function selectPalette(idx: number) {
    if (!canEdit || !brand || idx === brand.palette) return
    updateBrand.mutate({ id: product.id, palette: idx })
  }

  function selectCover(variant: number) {
    if (!canEdit || !brand || variant === brand.cover) return
    updateBrand.mutate({ id: product.id, cover: variant })
  }

  function saveTitle(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = titleDraft.trim()
    if (!trimmed || !canEdit || trimmed === brand?.title) return
    updateBrand.mutate({ id: product.id, title: trimmed })
  }

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {brand
          ? "Cover title, color palette, typography, and layout. Switch any option to preview live."
          : "Relay picks a cover title, palette, typography, and cover layout from your pocket and manuscript."}
      </p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {product.qualityWarning && product.cur === 5 ? (
        <p className="mt-2.5 text-xs text-muted-foreground">{product.qualityWarning}</p>
      ) : null}
      {brand && palette ? (
        <div className="mt-3.5 grid grid-cols-[180px_minmax(0,1fr)] items-start gap-4 max-sm:grid-cols-1">
          <div className="aspect-3/4 self-start overflow-hidden rounded-xl border border-border-strong bg-muted shadow-sm">
            <CoverArt
              palette={palette}
              variant={brand.cover}
              title={titleDraft || brand.title}
              imageUrl={previewImageUrl(brand.cover)}
            />
          </div>

          <div className="grid content-start gap-3.5">
            <form onSubmit={saveTitle} className="grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Cover title</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className={cn(fieldClass, "flex-1 py-2 text-[13px]")}
                  value={titleDraft}
                  disabled={!canEdit}
                  onChange={(e) => setTitleDraft(e.target.value)}
                />
                {canEdit && titleDraft.trim() && titleDraft.trim() !== brand.title ? (
                  <button
                    type="submit"
                    className={protoBtn({ variant: "soft" })}
                    disabled={updateBrand.isPending}
                  >
                    Save
                  </button>
                ) : null}
              </div>
            </form>

            <div className="grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">
                Palette &amp; typography
              </span>
              <div className="grid grid-cols-3 gap-2 max-sm:grid-cols-1">
                {catalog.palettes.map((pal, idx) => {
                  const active = brand.palette === idx
                  return (
                    <button
                      key={pal.name}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => selectPalette(idx)}
                      className={cn(
                        "rounded-xl border border-border bg-muted p-2.5 text-left transition-colors disabled:cursor-default",
                        active && "border-primary bg-card",
                        canEdit && "cursor-pointer hover:border-border-strong"
                      )}
                    >
                      <div className="mb-1.5 flex gap-1">
                        {pal.cols.slice(0, 4).map((col) => (
                          <span
                            key={col}
                            className="size-3.5 rounded-full border border-black/15"
                            style={{ backgroundColor: col }}
                          />
                        ))}
                      </div>
                      <b className="block text-xs text-foreground">{pal.name}</b>
                      <small className="block text-[11px] text-dim">
                        {pal.display} / {pal.body}
                      </small>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-1.5">
              <span className="text-xs font-semibold text-muted-foreground">Cover layout</span>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((variant) => {
                  const active = brand.cover === variant
                  return (
                    <button
                      key={variant}
                      type="button"
                      disabled={!canEdit}
                      onClick={() => selectCover(variant)}
                      className={cn(
                        "overflow-hidden rounded-lg border-2 border-transparent transition-colors disabled:cursor-default",
                        active && "border-primary",
                        canEdit && "cursor-pointer hover:border-border-strong"
                      )}
                    >
                      <CoverArt
                        palette={palette}
                        variant={variant}
                        title={titleDraft || brand.title}
                        imageUrl={previewImageUrl(variant)}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function ManuscriptStepBody({ product }: { product: Product }) {
  const step = product.steps[4]
  const regenerate = useRegenerateSectionMutation()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sections = product.structure
  const doneCount = sections.filter((s) => s.status === "done").length
  const totalWords =
    product.words || sections.reduce((sum, s) => sum + (s.words || 0), 0)
  const estPages = pagesCount(totalWords, sections.length)
  const canRegenerate =
    product.stage === "build" &&
    product.cur === 4 &&
    (step.status === "gate" || step.status === "review")

  // Focus user-selected section if still present, else current live section, else latest done section
  const liveSection = sections.find((s) => s.status === "live")
  const latestDone = [...sections].reverse().find((s) => s.status === "done")
  const focused =
    (selectedId ? sections.find((s) => s.id === selectedId) : null) ||
    liveSection ||
    latestDone ||
    sections[0] ||
    null

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        Written one section at a time, citing your indexed sources. Relay stops after the first
        section so you can approve the voice before writing the rest.
      </p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {sections.length ? (
        <div className="mt-3.5 grid grid-cols-[minmax(0,220px)_minmax(0,1fr)] gap-3 max-md:grid-cols-1">
          <div className="grid min-w-0 content-start gap-1">
            {sections.map((sec, idx) => {
              const isFocused = focused?.id === sec.id
              return (
                <button
                  key={sec.id || `${sec.title}-${idx}`}
                  type="button"
                  title={sec.title}
                  onClick={() => setSelectedId(sec.id)}
                  className={cn(
                    "flex w-full min-w-0 items-center gap-2 overflow-hidden rounded-lg border border-transparent px-2.5 py-2 text-left text-xs transition-colors hover:bg-muted",
                    isFocused && "border-border-strong bg-muted text-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[10px] font-bold text-muted-foreground",
                      sec.status === "done" && "bg-success/20 text-success",
                      sec.status === "live" && "bg-primary/20 text-primary"
                    )}
                  >
                    {sec.status === "done" ? (
                      <Check className="size-3" />
                    ) : sec.status === "live" ? (
                      <Spin />
                    ) : (
                      idx + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {sec.title}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="min-w-0 rounded-xl border border-border-strong bg-muted p-4">
            {focused ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
                  <div className="min-w-0">
                    <b className="block text-sm text-foreground">{focused.title}</b>
                    {focused.moment ? (
                      <small className="mt-0.5 block text-xs text-muted-foreground">
                        {focused.moment}
                      </small>
                    ) : null}
                  </div>
                  {canRegenerate && focused.status === "done" ? (
                    <button
                      type="button"
                      className={cn(protoBtn({ variant: "soft" }), "px-2.5 py-1.5 text-xs")}
                      disabled={regenerate.isPending}
                      onClick={() => {
                        followThreadToEnd()
                        regenerate.mutate({ id: product.id, sectionId: focused.id })
                      }}
                    >
                      <RefreshCw className="size-3" /> Regenerate
                    </button>
                  ) : null}
                </div>

                {focused.status === "live" ? (
                  <div className="flex items-center gap-2 py-8 text-[13px] text-muted-foreground">
                    <Spin /> Writing this section…
                  </div>
                ) : focused.text ? (
                  <>
                    <div className="mt-3 max-h-[360px] overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                      {focused.text}
                    </div>
                    {focused.cites && focused.cites.length > 0 ? (
                      <div className="mt-3 border-t border-border pt-2.5 text-xs text-muted-foreground">
                        <b className="text-foreground">From:</b> {focused.cites.join(" · ")}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <p className="py-6 text-[13px] text-dim">Not written yet.</p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-dim">No sections yet.</p>
            )}
          </div>
        </div>
      ) : null}
      {sections.length ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-xs text-muted-foreground">
          <span>
            {pluralize(totalWords, "word")} · {doneCount}/{sections.length} sections · ~
            {pluralize(estPages, "page")}
          </span>
        </div>
      ) : null}
    </>
  )
}

function StructureStepBody({ product }: { product: Product }) {
  const step = product.steps[3]
  const addSection = useAddSectionMutation()
  const removeSection = useRemoveSectionMutation()
  const [newTitle, setNewTitle] = useState("")
  const canEdit = product.stage === "build" && product.cur === 3 && step.status === "review"

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newTitle.trim()
    if (!trimmed || !canEdit) return
    addSection.mutate(
      { id: product.id, title: trimmed },
      {
        onSuccess: () => setNewTitle(""),
      }
    )
  }

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {product.structure.length
          ? `${pluralize(product.structure.length, "section")} — each owns a real moment the reader faces.`
          : "A table of contents where each section owns a concrete moment the reader faces."}
      </p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {product.structure.length ? (
        <ol className="mt-3.5 grid gap-2">
          {product.structure.map((section, idx) => (
            <li
              key={section.id || `${section.title}-${idx}`}
              className="flex items-start gap-3 rounded-xl border border-border bg-muted px-3.5 py-3"
            >
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-[13.5px] text-foreground">{section.title}</b>
                {section.moment ? (
                  <small className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {section.moment}
                  </small>
                ) : null}
              </div>
              {canEdit ? (
                <button
                  type="button"
                  className={cn(protoBtn({ variant: "danger" }), "px-2 py-1 text-xs")}
                  disabled={removeSection.isPending || product.structure.length <= 1}
                  title={
                    product.structure.length <= 1
                      ? "Keep at least one section"
                      : "Remove section"
                  }
                  onClick={() =>
                    removeSection.mutate({ id: product.id, sectionId: section.id })
                  }
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      {canEdit ? (
        <form onSubmit={handleAdd} className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="text"
            className={cn(fieldClass, "flex-1 py-2 text-[13px]")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add your own section title..."
          />
          <button
            type="submit"
            className={protoBtn({ variant: "soft" })}
            disabled={addSection.isPending || !newTitle.trim()}
          >
            <Plus className="size-3.5" /> Add
          </button>
        </form>
      ) : null}
    </>
  )
}

function TypesStepBody({ product, catalog }: { product: Product; catalog: RelayCatalog }) {
  const step = product.steps[2]
  const structureStep = product.steps[3]
  const chooseType = useChooseTypeMutation()
  // Allow pick/re-pick on Product type review, or while Structure is still waiting (no sections yet)
  const canPick =
    product.stage === "build" &&
    ((product.cur === 2 && step.status === "review") ||
      (product.cur === 3 &&
        structureStep?.status === "todo" &&
        product.structure.length === 0))
  const showCards = canPick || Boolean(product.type)

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {canPick
          ? product.type
            ? "Format selected — click another card to switch, then press Looks good, continue."
            : "Pick the format that fits your pocket and how buyers will use it."
          : product.type
            ? "Product format selected."
            : "Press Proceed to compare the six product formats and pick one."}
      </p>
      {showCards ? (
        <div className="mt-3.5 grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {catalog.types.map((typeItem) => (
            <TypeCard
              key={typeItem.id}
              typeItem={typeItem}
              chosen={product.type === typeItem.id}
              canPick={canPick}
              picking={chooseType.isPending}
              onPick={() => {
                if (!canPick || product.type === typeItem.id) return
                chooseType.mutate({ id: product.id, typeId: typeItem.id })
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}

interface TypeCardProps {
  typeItem: ProductType
  chosen: boolean
  canPick: boolean
  picking: boolean
  onPick: () => void
}

function TypeCard({ typeItem, chosen, canPick, picking, onPick }: TypeCardProps) {
  return (
    <button
      type="button"
      disabled={!canPick || picking}
      onClick={onPick}
      className={cn(
        "flex flex-col justify-between rounded-xl border border-border-strong bg-muted p-4 text-left transition-colors disabled:cursor-default",
        chosen && "border-success bg-success/5",
        canPick && "cursor-pointer hover:border-primary"
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <b className="text-sm text-foreground">{typeItem.name}</b>
          {chosen ? (
            <span className={protoChip({ variant: "mint" })}>
              <Check className="size-3" />
              Chosen
            </span>
          ) : null}
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
          {typeItem.desc}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2.5 text-xs text-dim">
        <span>{typeItem.pages}</span>
        <b className="text-foreground">{typeItem.price}</b>
      </div>
    </button>
  )
}

function PocketsStepBody({ product }: { product: Product }) {
  const step = product.steps[1]
  const choosePocket = useChoosePocketMutation()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const canPick = product.stage === "build" && product.cur === 1 && step.status === "review"

  return (
    <>
      <p className="text-[13.5px] leading-relaxed text-muted-foreground">
        {product.pockets.length
          ? "Four pockets backed by live Etsy, Google, and Google Trends data. Pick one to build."
          : "Relay checks active Etsy listings, Google demand, and Google Trends to propose four profitable pockets."}
      </p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {product.pockets.length ? (
        <div className="mt-3.5 grid gap-3">
          {product.pockets.map((pocket) => {
            const key = pocket.id || pocket.h
            const isChosen =
              Boolean(product.pocket) &&
              (product.pocket?.id ? product.pocket.id === pocket.id : product.pocket?.h === pocket.h)
            const isOpen = Boolean(expanded[key])
            return (
              <PocketCard
                key={key}
                pocket={pocket}
                chosen={isChosen}
                canPick={canPick}
                picking={choosePocket.isPending}
                expanded={isOpen}
                onToggleEvidence={() =>
                  setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))
                }
                onPick={() => {
                  if (!canPick || !pocket.id) return
                  followThreadToEnd()
                  choosePocket.mutate({ id: product.id, pocketId: pocket.id })
                }}
              />
            )
          })}
        </div>
      ) : null}
    </>
  )
}

interface PocketCardProps {
  pocket: Pocket
  chosen: boolean
  canPick: boolean
  picking: boolean
  expanded: boolean
  onToggleEvidence: () => void
  onPick: () => void
}

function PocketCard({
  pocket,
  chosen,
  canPick,
  picking,
  expanded,
  onToggleEvidence,
  onPick,
}: PocketCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-strong bg-muted p-4 transition-colors",
        chosen && "border-success bg-success/5",
        canPick && "hover:border-primary"
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {pocket.rec ? (
          <span className={protoChip({ variant: "sun" })}>
            <Sparkles className="size-3" />
            Recommended
          </span>
        ) : null}
        {pocket.grounded ? (
          <span className={protoChip({ variant: "mint" })}>
            <ChipDot />
            Grounded in your sources
          </span>
        ) : null}
        {chosen ? (
          <span className={protoChip({ variant: "mint" })}>
            <Check className="size-3" />
            Chosen
          </span>
        ) : null}
        <span className="ml-auto text-xs text-muted-foreground">
          {pocket.ind} · {pocket.niche}
        </span>
      </div>

      <h4 className="mt-2.5 text-[15px] leading-snug font-semibold text-foreground">
        {pocket.h}
      </h4>

      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{pocket.prob}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{pocket.know}</p>

      <div className="mt-3 grid grid-cols-4 gap-2 max-sm:grid-cols-2">
        <ScorePill label="Pain" value={pocket.scores.pain} />
        <ScorePill label="Worse" value={pocket.scores.worse} />
        <ScorePill label="Power" value={pocket.scores.power} />
        <ScorePill label="Speed" value={pocket.scores.speed} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
          onClick={onToggleEvidence}
        >
          {expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          Why these scores ({pocket.src.length})
        </button>

        {canPick ? (
          <button
            type="button"
            className={protoBtn({ variant: pocket.rec ? "sun" : "soft" })}
            disabled={picking}
            onClick={onPick}
          >
            <Check className="size-3.5" /> Pick this pocket
          </button>
        ) : null}
      </div>

      {expanded ? (
        <ul className="mt-2.5 grid gap-1.5 rounded-lg border border-border bg-card/70 p-3 text-xs leading-relaxed text-muted-foreground">
          {pocket.src.length ? (
            pocket.src.map((line, i) => (
              <li key={`${line}-${i}`} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{line}</span>
              </li>
            ))
          ) : (
            <li className="text-dim">No evidence bullets recorded.</li>
          )}
        </ul>
      ) : null}
    </div>
  )
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-center">
      <span className="block text-[11px] text-muted-foreground">{label}</span>
      <b className="text-sm font-bold text-foreground">{value}</b>
    </div>
  )
}

import { useState } from "react"
import { Download, ExternalLink } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { ChipDot } from "@/components/common/spin"
import { CoverArt } from "@/components/common/cover-art"
import { ServiceLabel } from "@/components/common/service-mark"
import { SourceChips } from "@/components/common/source-chips"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { cardClass, protoBtn, protoChip } from "@/lib/proto"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useProductEvents, useProductQuery } from "@/shared/queries/product.query"
import { downloadProductFile } from "@/shared/services/product.service"
import type { ProductFile } from "@/shared/types/relay"
import { formatDate, money, pagesCount, pluralize, productName } from "@/util/format"

const FILE_TYPE_LABELS: Record<string, string> = {
  pdf_letter: "PDF Letter",
  pdf_a4: "PDF A4",
  epub: "EPUB",
  docx: "DOCX",
  mockups: "Mockups",
  html: "Canva-editable",
}

export function ProductOverviewPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const isRunning = Boolean(
    product && product.stage === "build" && product.steps[product.cur]?.status === "running"
  )
  useProductEvents(id, isRunning)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const palette = product.brand ? catalog.palettes[product.brand.palette] : null
  const whop = product.publish.live.whop
  const m = product.metrics
  const files = product.files ?? []

  async function handleDownload(file: ProductFile) {
    setDownloadingId(file.id)
    try {
      await downloadProductFile(product!.id, file.id, `${file.fileType}-v${file.version}`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <StageBar product={product} />
      <div className="mb-[18px] flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[13px] text-muted-foreground">{product.pocket?.niche || product.profile?.niche}</p>
          <h1 className="text-[30px]">{productName(product)}</h1>
        </div>
        <Link to={ROUTES.build(product.id)} className={protoBtn()}>
          Open build
        </Link>
      </div>
      <div className="mb-[18px] grid grid-cols-4 gap-2.5 max-md:grid-cols-2">
        <Metric label="Sales" value={String(m.sales)} hint="from connected shops" />
        <Metric label="Revenue" value={money(m.revenue)} hint="before fees" />
        <Metric label="Leads" value={String(m.leads)} hint="email subscribers" />
        <Metric label="Visits" value={m.visits.toLocaleString()} hint="all channels, 30 days" />
      </div>
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div className={cardClass}>
          <h3>Files</h3>
          <p className="mt-2.5 text-[13px] text-muted-foreground">
            {product.structure.length
              ? `${pluralize(product.structure.length, "section")} · ${pluralize(product.words, "word")} · ${pluralize(pagesCount(product.words, product.structure.length), "page")}`
              : "Exports (PDF, EPUB, DOCX, Mockups) are generated in the Ready step."}
          </p>
          {files.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file) => {
                const label = FILE_TYPE_LABELS[file.fileType] ?? file.fileType.toUpperCase()
                const busy = downloadingId === file.id
                return (
                  <button
                    key={file.id}
                    type="button"
                    disabled={busy}
                    onClick={() => handleDownload(file)}
                    className={protoBtn({ variant: "soft" })}
                  >
                    <Download className="size-3.5" />
                    {busy ? "Downloading…" : label}
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
        <div className={cardClass}>
          <h3>Where it is</h3>
          <div className="mt-2.5 grid gap-2">
            {Object.entries(product.publish.live).length ? (
              Object.entries(product.publish.live).map(([key, url]) => {
                const service = catalog.services.find((s) => s.id === key)
                return (
                  <div className="flex flex-wrap items-center justify-between gap-3.5 text-[13px]" key={key}>
                    {service ? <ServiceLabel service={service} /> : key}
                    <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success">
                      <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all">
                        {url} <ExternalLink className="size-3" />
                      </a>
                    </span>
                  </div>
                )
              })
            ) : (
              <span className="text-[13px] text-dim">Not listed yet. Publish it to Whop from the Publish step.</span>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        {whop ? (
          <div className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3.5">
              <h3>Whop store</h3>
              <span className={protoChip({ variant: "mint" })}>
                <ChipDot />
                Sales sync on
              </span>
            </div>
            <p className="mt-2.5 text-[13px]">
              Checkout link{" "}
              <a
                href={whop}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 break-all font-semibold text-success"
              >
                {whop}
              </a>
            </p>
            {product.orders.length ? (
              <table className="mt-2.5 w-full border-collapse text-[13.5px]">
                <thead>
                  <tr>
                    <th className="border-b border-border px-2.5 py-2 text-left font-semibold text-muted-foreground">
                      When
                    </th>
                    <th className="border-b border-border px-2.5 py-2 text-left font-semibold text-muted-foreground">
                      Amount
                    </th>
                    <th className="border-b border-border px-2.5 py-2 text-left font-semibold text-muted-foreground">
                      Came from
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.orders.slice(0, 6).map((order) => (
                    <tr key={`${order.t}-${order.amt}-${order.via}`}>
                      <td className="border-b border-border p-2.5 last:border-0">{formatDate(order.t)}</td>
                      <td className="border-b border-border p-2.5">{money(order.amt)}</td>
                      <td className="border-b border-border p-2.5">{order.via}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2.5 text-[13px] text-muted-foreground">No orders yet.</p>
            )}
          </div>
        ) : null}
        {product.sources.length ? (
          <div className={cardClass}>
            <h3>Sources</h3>
            <div className="mt-2.5">
              <SourceChips sources={product.sources} />
            </div>
          </div>
        ) : null}
        {product.brand && palette ? (
          <div className={cardClass}>
            <h3>{product.brand.title}</h3>
            <div className="relative my-2.5 aspect-3/4 w-[120px] overflow-hidden rounded-[10px]">
              <CoverArt
                palette={palette}
                variant={product.brand.cover}
                title={product.brand.title}
                imageUrl={product.brand.coverImageUrls?.[product.brand.cover] ?? null}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3.5 py-3">
      <span className="mb-0.5 block text-xs text-muted-foreground">{label}</span>
      <b className="text-[22px] tracking-tight">{value}</b>
      <small className="mt-0.5 block text-[11.5px] text-dim">{hint}</small>
    </div>
  )
}

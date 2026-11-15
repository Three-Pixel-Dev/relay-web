import { ExternalLink } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { CoverArt } from "@/components/common/cover-art"
import { ServiceLabel } from "@/components/common/service-mark"
import { SourceChips } from "@/components/common/source-chips"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useProductEvents, useProductQuery } from "@/shared/queries/product.query"
import { formatDate, money, pagesCount } from "@/util/format"

export function ProductOverviewPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const isRunning = Boolean(
    product && product.stage === "build" && product.steps[product.cur]?.status === "running"
  )
  useProductEvents(id, isRunning)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const palette = product.brand ? catalog.palettes[product.brand.palette] : null
  const whop = product.publish.live.whop
  const m = product.metrics

  return (
    <>
      <StageBar product={product} />
      <div className="run-head">
        <div>
          <p className="small muted">{product.pocket?.niche || product.profile?.niche}</p>
          <h1>{product.brand?.title || product.input || "Untitled product"}</h1>
        </div>
        <Link to={ROUTES.build(product.id)} className="btn sun">
          Open build
        </Link>
      </div>
      <div className="metrics">
        <div>
          <span>Sales</span>
          <b>{m.sales}</b>
          <small>from connected shops</small>
        </div>
        <div>
          <span>Revenue</span>
          <b>{money(m.revenue)}</b>
          <small>before fees</small>
        </div>
        <div>
          <span>Leads</span>
          <b>{m.leads}</b>
          <small>email subscribers</small>
        </div>
        <div>
          <span>Visits</span>
          <b>{m.visits.toLocaleString()}</b>
          <small>all channels, 30 days</small>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Files</h3>
          <p className="small muted" style={{ marginTop: 10 }}>
            {product.structure.length
              ? `${product.structure.length} sections · ${product.words.toLocaleString()} words · ${pagesCount(product.words, product.structure.length)} pages`
              : "Exports (PDF, EPUB, DOCX, Mockups) coming soon after manuscript & branding steps."}
          </p>
        </div>
        <div className="card">
          <h3>Where it is</h3>
          <div className="stack" style={{ marginTop: 10, gap: 8 }}>
            {Object.entries(product.publish.live).length ? (
              Object.entries(product.publish.live).map(([key, url]) => {
                const service = catalog.services.find((s) => s.id === key)
                return (
                  <div className="between small" key={key}>
                    {service ? <ServiceLabel service={service} /> : key}
                    <span className="live-link">
                      {url} <ExternalLink className="size-3" />
                    </span>
                  </div>
                )
              })
            ) : (
              <span className="dim small">Not listed yet (publishing coming soon).</span>
            )}
          </div>
        </div>
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        {whop ? (
          <div className="card">
            <div className="between">
              <h3>Whop store</h3>
              <span className="chip mint">
                <i />
                Sales sync on
              </span>
            </div>
            <p className="small" style={{ marginTop: 10 }}>
              Checkout link <span className="live-link">{whop}/checkout</span>
            </p>
            {product.orders.length ? (
              <table className="tbl" style={{ marginTop: 10 }}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Amount</th>
                    <th>Came from</th>
                  </tr>
                </thead>
                <tbody>
                  {product.orders.slice(0, 6).map((order) => (
                    <tr key={order.t}>
                      <td>{formatDate(order.t)}</td>
                      <td>{money(order.amt)}</td>
                      <td>{order.via}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="small muted" style={{ marginTop: 10 }}>
                No orders yet.
              </p>
            )}
          </div>
        ) : null}
        {product.sources.length ? (
          <div className="card">
            <h3>Sources</h3>
            <div style={{ marginTop: 10 }}>
              <SourceChips sources={product.sources} />
            </div>
          </div>
        ) : null}
        {product.brand && palette ? (
          <div className="card">
            <h3>{product.brand.title}</h3>
            <div className="cover" style={{ width: 120, margin: "10px 0" }}>
              <CoverArt
                palette={palette}
                variant={product.brand.cover}
                title={product.brand.title}
              />
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}

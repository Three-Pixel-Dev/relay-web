import { XIcon } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { CoverArt, PosterLite } from "@/components/common/cover-art"
import { ROUTES } from "@/constants/routes"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useDeleteProductMutation, useProductsQuery } from "@/shared/queries/product.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { formatDate, money } from "@/util/format"
import type { Product } from "@/shared/types/relay"

export function ProductsPage() {
  const { data: products = [] } = useProductsQuery()
  const { data: catalog } = useCatalogQuery()
  const navigate = useNavigate()
  const remove = useDeleteProductMutation()
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)

  function stageLabel(product: Product) {
    if (product.stage === "build") return `building · step ${product.cur + 1} of 7`
    if (product.stage === "paused") return "paused"
    if (product.stage === "publish") return "built · listing"
    const live = Object.keys(product.publish.live)
    if (live.length) {
      return `live on ${live.map((id) => catalog?.services.find((s) => s.id === id)?.name).join(", ")}`
    }
    return "built"
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>My products</h1>
          <p className="muted">Everything you’ve built, where it sells, what it earns.</p>
        </div>
        <Link to={ROUTES.start} className="btn sun">
          Build a new one
        </Link>
      </div>
      {products.length ? (
        <div className="stack">
          {products.map((product) => {
            const title = product.brand?.title || product.pocket?.niche || product.input || "New product"
            const palette = catalog?.palettes[product.brand?.palette ?? 0]
            const href =
              product.stage === "build" || product.stage === "paused"
                ? ROUTES.build(product.id)
                : ROUTES.product(product.id)
            return (
              <div className="proj" key={product.id}>
                <div className="poster" style={{ aspectRatio: "3/4" }}>
                  {product.brand && palette ? (
                    <CoverArt
                      palette={palette}
                      variant={product.brand.cover}
                      title={product.brand.title}
                    />
                  ) : (
                    <PosterLite />
                  )}
                </div>
                <div>
                  <h3>{title}</h3>
                  <div className="sub">
                    {stageLabel(product)}
                    {product.words ? ` · ${product.words.toLocaleString()} words` : ""}
                    {product.metrics.sales
                      ? ` · ${product.metrics.sales} sales · ${money(product.metrics.revenue)}`
                      : ""}
                  </div>
                </div>
                <div className="money">
                  {money(product.spend)}
                  <small>AI · {formatDate(product.updated)}</small>
                </div>
                <div className="row">
                  <button
                    type="button"
                    className={`btn ${product.stage === "build" ? "sun" : "soft"}`}
                    onClick={() => navigate(href)}
                  >
                    {product.stage === "build"
                      ? "Continue"
                      : product.stage === "paused"
                        ? "Resume"
                        : "Open"}
                  </button>
                  <button
                    type="button"
                    className="btn danger"
                    aria-label="Delete"
                    onClick={() =>
                      openModal({
                        title: "Delete this product?",
                        body: (
                          <p className="muted">
                            Removed from this browser. Listings already created in your connected
                            accounts stay there.
                          </p>
                        ),
                        actions: (
                          <>
                            <button type="button" className="btn ghost" onClick={closeModal}>
                              Keep it
                            </button>
                            <button
                              type="button"
                              className="btn sun"
                              onClick={() => {
                                remove.mutate(product.id)
                                closeModal()
                              }}
                            >
                              Delete
                            </button>
                          </>
                        ),
                      })
                    }
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty">
          <h2>No products yet.</h2>
          <p>Tell Relay what you know and it finds the pocket, writes and designs the product.</p>
          <Link to={ROUTES.start} className="btn sun big">
            Start
          </Link>
        </div>
      )}
    </>
  )
}

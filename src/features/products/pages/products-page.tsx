import { XIcon } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { CoverArt, PosterLite } from "@/components/common/cover-art"
import { ROUTES } from "@/constants/routes"
import { protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useDeleteProductMutation, useProductsQuery } from "@/shared/queries/product.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { formatDate, money, pluralize, productName } from "@/util/format"
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
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3.5">
        <div>
          <h1 className="text-[32px]">My products</h1>
          <p className="text-muted-foreground">Everything you’ve built, where it sells, what it earns.</p>
        </div>
        <Link to={ROUTES.start} className={protoBtn()}>
          Build a new one
        </Link>
      </div>
      {products.length ? (
        <div className="grid gap-3.5">
          {products.map((product) => {
            const title = productName(product)
            const palette = catalog?.palettes[product.brand?.palette ?? 0]
            const href =
              product.stage === "build" || product.stage === "paused"
                ? ROUTES.build(product.id)
                : ROUTES.product(product.id)
            return (
              <div
                className="grid grid-cols-[90px_1fr_auto_auto] items-center gap-[18px] rounded-lg border border-border bg-card p-3.5 max-md:grid-cols-[70px_1fr]"
                key={product.id}
              >
                <div className="relative isolate aspect-3/4 overflow-hidden rounded-[10px] bg-secondary">
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
                  <h3 className="text-base">{title}</h3>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">
                    {stageLabel(product)}
                    {product.words ? ` · ${pluralize(product.words, "word")}` : ""}
                    {product.metrics.sales
                      ? ` · ${pluralize(product.metrics.sales, "sale")} · ${money(product.metrics.revenue)}`
                      : ""}
                  </div>
                </div>
                <div className="text-right font-bold max-md:col-span-2">
                  {money(product.spend)}
                  <small className="block text-xs font-medium text-muted-foreground">
                    AI · {formatDate(product.updated)}
                  </small>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 max-md:col-span-2">
                  <button
                    type="button"
                    className={protoBtn({
                      variant: product.stage === "build" ? "sun" : "soft",
                    })}
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
                    className={protoBtn({ variant: "danger" })}
                    aria-label="Delete"
                    onClick={() =>
                      openModal({
                        title: "Delete this product?",
                        body: (
                          <p className="text-muted-foreground">
                            Removed from this browser. Listings already created in your connected
                            accounts stay there.
                          </p>
                        ),
                        actions: (
                          <>
                            <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
                              Keep it
                            </button>
                            <button
                              type="button"
                              className={protoBtn()}
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
        <div className="rounded-[22px] border-[1.5px] border-dashed border-border-strong px-5 py-[60px] text-center">
          <h2 className="mb-2">No products yet.</h2>
          <p className="mb-[18px] text-muted-foreground">
            Tell Relay what you know and it finds the pocket, writes and designs the product.
          </p>
          <Link to={ROUTES.start} className={cn(protoBtn({ size: "big" }))}>
            Start
          </Link>
        </div>
      )}
    </>
  )
}

import { useEffect, useRef, useState } from "react"
import { ArrowRight, ExternalLink, RefreshCw } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { CoverArt, PosterLite } from "@/components/common/cover-art"
import { Spin } from "@/components/common/spin"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { resolveBrandPalette } from "@/lib/brand-palette"
import { cardClass, fieldClass, labelClass, noteClass, protoBtn, protoChip } from "@/lib/proto"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useListingDraftMutation,
  useProductQuery,
  useWhopPublishMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { money, productName } from "@/util/format"

export function PublishPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const publish = useWhopPublishMutation()
  const draft = useListingDraftMutation()
  const showToast = useUiStore((state) => state.showToast)

  const [price, setPrice] = useState("")
  const [title, setTitle] = useState("")
  const [headline, setHeadline] = useState("")
  const [affiliate, setAffiliate] = useState("30")
  const seededRef = useRef<string | null>(null)
  const editedRef = useRef(false)

  const checkoutUrl = product?.publish.live.whop

  useEffect(() => {
    if (!product || !id || checkoutUrl) return
    if (seededRef.current === product.id) return
    seededRef.current = product.id

    draft.mutate(id, {
      onSuccess: (res) => {
        if (editedRef.current) return
        if (res.price != null && Number.isFinite(res.price)) {
          setPrice(String(res.price))
        }
        if (res.title) setTitle(res.title)
        if (res.headline) setHeadline(res.headline)
      },
    })
  }, [product?.id, id, checkoutUrl])

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const isConnected = Boolean(workspace?.services.whop)
  const hasFiles = (product.files ?? []).length > 0
  const typeSuggestionPrice = product.type
    ? product.typePriceSuggestions?.[product.type]?.price
    : undefined
  const whopFeeText = catalog.services.find((s) => s.id === "whop")?.price
  const palette = product.brand ? resolveBrandPalette(product.brand, catalog.palettes) : null

  const parsedPrice = Number(price)
  const parsedAffiliate = affiliate.trim() === "" ? 30 : Number(affiliate)
  const canPublish =
    isConnected && hasFiles && Number.isFinite(parsedPrice) && parsedPrice >= 1 && !draft.isPending

  function handleRewrite() {
    if (draft.isPending) return
    editedRef.current = false
    draft.mutate(id, {
      onSuccess: (res) => {
        if (res.price != null && Number.isFinite(res.price)) {
          setPrice(String(res.price))
        }
        if (res.title) setTitle(res.title)
        if (res.headline) setHeadline(res.headline)
        showToast("Listing copy refreshed.")
      },
      onError: (error) => showToast(apiError(error).message),
    })
  }

  function handlePublish() {
    const affiliatePercent =
      affiliate.trim() === "" ? 30 : Number.isFinite(Number(affiliate)) ? Number(affiliate) : 30
    publish.mutate(
      {
        id,
        price: parsedPrice,
        title: title.trim() || undefined,
        headline: headline.trim() || undefined,
        affiliatePercent,
      },
      {
        onSuccess: () => showToast("Published to Whop."),
        onError: (error) => showToast(apiError(error).message),
      }
    )
  }

  const previewTitle = title.trim() || product.brand?.title || productName(product)
  const previewHeadline =
    headline.trim() || product.pocket?.h || "Instant-download digital product delivered after payment."
  const coverImageUrl = product.brand?.coverImageUrls?.[product.brand.cover] ?? null

  const previewCard = (
    <div className={cardClass}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm">Listing preview</h3>
        {Number.isFinite(parsedPrice) && parsedPrice >= 1 ? (
          <span className={protoChip({ variant: "mint" })}>{money(parsedPrice)}</span>
        ) : (
          <span className={protoChip()}>—</span>
        )}
      </div>
      <div className="aspect-3/4 w-full overflow-hidden rounded-xl border border-border-strong bg-muted shadow-xs">
        {product.brand && palette ? (
          <CoverArt
            palette={palette}
            variant={product.brand.cover}
            title={previewTitle}
            imageUrl={coverImageUrl}
          />
        ) : (
          <PosterLite />
        )}
      </div>
      <div className="mt-3">
        <b className="block text-sm leading-snug text-foreground">{previewTitle}</b>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{previewHeadline}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className={protoChip({ variant: "outline" })}>Whop checkout</span>
          {Number.isFinite(parsedAffiliate) && parsedAffiliate > 0 ? (
            <span className={protoChip({ variant: "sun" })}>{parsedAffiliate}% affiliate</span>
          ) : null}
        </div>
      </div>
    </div>
  )

  const liveCard = checkoutUrl ? (
    <div className={cardClass}>
      <h3>Live on Whop</h3>
      <p className="mt-2.5 text-[13px] text-muted-foreground">
        Buyers pay on Whop and are sent to a page with their files straight after. Sales appear on
        your product overview as Whop reports them.
      </p>
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 break-all text-[13.5px] font-semibold text-success"
      >
        {checkoutUrl} <ExternalLink className="size-3" />
      </a>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={ROUTES.product(product.id)} className={protoBtn({ variant: "ghost" })}>
          Product overview
        </Link>
        <Link to={ROUTES.distribute(product.id)} className={protoBtn()}>
          Distribute <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <p className="mt-3 text-[12.5px] text-muted-foreground">
        Listed. Now get it seen — turn on channels and approve a weekly batch.
      </p>
    </div>
  ) : null

  const blocker = !hasFiles ? (
    <div className={noteClass}>
      There are no files to sell yet. Finish the Ready step first.{" "}
      <Link to={ROUTES.build(product.id)} className="font-bold text-primary">
        Open build
      </Link>
    </div>
  ) : !isConnected ? (
    <div className={noteClass}>
      Connect Whop first so Relay can create the product for you.{" "}
      <Link to={ROUTES.connections} className="font-bold text-primary">
        Open connections
      </Link>
    </div>
  ) : null

  const form = (
    <div className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3>Sell on Whop</h3>
        <button
          type="button"
          className={protoBtn({ variant: "soft" })}
          disabled={draft.isPending}
          onClick={handleRewrite}
        >
          {draft.isPending ? <Spin /> : <RefreshCw className="size-3.5" />}
          {draft.isPending ? "Drafting…" : "Rewrite listing"}
        </button>
      </div>
      <p className="mt-2.5 mb-4 text-[13px] text-muted-foreground">
        Relay creates the Whop product and a one-time checkout link. After payment, buyers land on a
        Relay page where they download the files.
      </p>
      {blocker}
      <div className="mt-4 grid gap-3.5">
        <div>
          <label className={labelClass} htmlFor="publish-price">
            Price (USD)
          </label>
          <input
            id="publish-price"
            className={fieldClass}
            type="number"
            min={1}
            step="0.01"
            inputMode="decimal"
            disabled={draft.isPending}
            placeholder={typeSuggestionPrice ? `Suggested ${typeSuggestionPrice}` : "19"}
            value={price}
            onChange={(event) => {
              editedRef.current = true
              setPrice(event.target.value)
            }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="publish-title">
            Title (optional)
          </label>
          <input
            id="publish-title"
            className={fieldClass}
            maxLength={80}
            disabled={draft.isPending}
            placeholder={productName(product)}
            value={title}
            onChange={(event) => {
              editedRef.current = true
              setTitle(event.target.value)
            }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="publish-headline">
            Short description (optional)
          </label>
          <input
            id="publish-headline"
            className={fieldClass}
            maxLength={80}
            disabled={draft.isPending}
            value={headline}
            onChange={(event) => {
              editedRef.current = true
              setHeadline(event.target.value)
            }}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="publish-affiliate">
            Affiliate commission % (optional — 0 to disable)
          </label>
          <input
            id="publish-affiliate"
            className={fieldClass}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="30"
            value={affiliate}
            onChange={(event) => setAffiliate(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {whopFeeText ? (
          <small className="text-xs text-muted-foreground">{whopFeeText}.</small>
        ) : (
          <span />
        )}
        <button
          type="button"
          className={protoBtn()}
          disabled={!canPublish || publish.isPending}
          onClick={handlePublish}
        >
          {publish.isPending ? <Spin /> : null} Publish to Whop
        </button>
      </div>
    </div>
  )

  return (
    <>
      <StageBar product={product} />
      <div className="mb-[18px]">
        <h1 className="text-[30px]">Publish</h1>
        <p className="text-[13px] text-muted-foreground">{productName(product)}</p>
      </div>
      <div className="grid max-w-[960px] grid-cols-[minmax(0,1fr)_280px] items-start gap-6 max-lg:grid-cols-1">
        <div>{liveCard ?? form}</div>
        {previewCard}
      </div>
    </>
  )
}

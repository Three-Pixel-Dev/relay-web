import { useState } from "react"
import { ExternalLink } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { Spin } from "@/components/common/spin"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { cardClass, fieldClass, labelClass, noteClass, protoBtn } from "@/lib/proto"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useProductQuery, useWhopPublishMutation } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { productName } from "@/util/format"

export function PublishPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const publish = useWhopPublishMutation()
  const showToast = useUiStore((state) => state.showToast)
  const [price, setPrice] = useState("")
  const [title, setTitle] = useState("")
  const [headline, setHeadline] = useState("")
  const [affiliate, setAffiliate] = useState("")

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const checkoutUrl = product.publish.live.whop
  const isConnected = Boolean(workspace?.services.whop)
  const hasFiles = (product.files ?? []).length > 0
  const typeHint = catalog.types.find((type) => type.id === product.type)?.price
  const parsedPrice = Number(price)
  const canPublish = isConnected && hasFiles && Number.isFinite(parsedPrice) && parsedPrice >= 1

  function handlePublish() {
    const affiliatePercent = affiliate.trim() === "" ? undefined : Number(affiliate)
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
      <div className="mt-4">
        <Link to={ROUTES.product(product.id)} className={protoBtn({ variant: "soft" })}>
          Product overview
        </Link>
      </div>
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
      <h3>Sell on Whop</h3>
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
            placeholder={typeHint ? `Typical ${typeHint}` : "19"}
            value={price}
            onChange={(event) => setPrice(event.target.value)}
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
            placeholder={productName(product)}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
            value={headline}
            onChange={(event) => setHeadline(event.target.value)}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="publish-affiliate">
            Affiliate commission % (optional)
          </label>
          <input
            id="publish-affiliate"
            className={fieldClass}
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            placeholder="0"
            value={affiliate}
            onChange={(event) => setAffiliate(event.target.value)}
          />
        </div>
      </div>
      <div className="mt-5 flex justify-end">
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
      <div className="max-w-[640px]">{liveCard ?? form}</div>
    </>
  )
}

import { type ReactNode, useEffect } from "react"
import { Check, Zap } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"

import { CoverArt, PosterLite } from "@/components/common/cover-art"
import { Spin } from "@/components/common/spin"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { resolveBrandPalette } from "@/lib/brand-palette"
import { actionBarClass, cardClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  productKeys,
  useProductQuery,
  usePromoteApproveMutation,
  usePromoteRedoMutation,
  usePromoteScheduleMutation,
  usePromoteStartMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { PromoteState, ServiceCatalogItem } from "@/shared/types/relay"
import { apiError } from "@/util/api-error"
import { money, productName } from "@/util/format"

const REACH = ["youtube", "tiktok", "instagram"] as const

function statusLabel(pr: PromoteState) {
  if (pr.status === "todo") return "Not started"
  if (pr.status === "gate") return "Video 1 ready"
  if (pr.status === "done") {
    return pr.scheduled ? "Scheduled" : `${pr.videos.length} ready`
  }
  if (pr.status === "running") return "Working"
  return "Working"
}

function estimateHint(pr: PromoteState) {
  const total = pr.estimateUsd ?? 7
  const next = pr.nextSpendUsd
  if (pr.status === "todo") {
    return `10 flip-through Shorts from the pages, first one stops for approval. About ${money(total)} in video.`
  }
  if (pr.status === "gate" && next != null) {
    return `Approve the look and Relay makes the other 9 the same way. About ${money(next)} more.`
  }
  return null
}

export function PromotePage() {
  const { id = "" } = useParams()
  const queryClient = useQueryClient()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const start = usePromoteStartMutation()
  const approve = usePromoteApproveMutation()
  const redo = usePromoteRedoMutation()
  const schedule = usePromoteScheduleMutation()
  const showToast = useUiStore((state) => state.showToast)

  const promoteStatus = product?.promote?.status
  useEffect(() => {
    if (!id || promoteStatus !== "running") return
    const timer = window.setInterval(() => {
      void queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
    }, 3000)
    return () => window.clearInterval(timer)
  }, [id, promoteStatus, queryClient])

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />

  const built = product.stage !== "build" && product.stage !== "paused"
  const isPublished = Object.keys(product.publish?.live ?? {}).length > 0
  const unlocked = built && (product.stage === "distribute" || isPublished)
  if (!unlocked) {
    return <Navigate to={ROUTES.publish(product.id)} replace />
  }

  const pr = product.promote ?? { videos: [], status: "todo", scheduled: false }
  const connected = workspace?.services ?? {}
  const higgsfield = catalog.services.find((s) => s.id === "higgsfield")
  const higgsfieldComingSoon = Boolean(higgsfield?.comingSoon)
  const higgsfieldConnected = Boolean(connected.higgsfield)
  const reachConnected = REACH.some((s) => connected[s])
  const reachComingSoon = REACH.every((s) => {
    const svc = catalog.services.find((x) => x.id === s)
    return Boolean(svc?.comingSoon)
  })
  const pinterestOn = Boolean(product.distribute?.pinterest?.on)
  const palette = product.brand ? resolveBrandPalette(product.brand, catalog.palettes) : null
  const busy = start.isPending || approve.isPending || redo.isPending || schedule.isPending

  function onStart() {
    start.mutate(id, {
      onSuccess: () => showToast("Generating the first Short with Higgsfield…"),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  function onApprove() {
    approve.mutate(id, {
      onSuccess: () => showToast("Making the other 9 with Higgsfield…"),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  function onRedo() {
    redo.mutate(id, {
      onSuccess: () => showToast("Regenerating the first video…"),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  function onSchedule() {
    schedule.mutate(id, {
      onSuccess: () => showToast("Scheduled: one video a day for 10 days (nothing posts until workers run)."),
      onError: (error) => showToast(apiError(error).message),
    })
  }

  const hint = estimateHint(pr)

  let action: ReactNode = null
  if (pr.status === "todo") {
    action = (
      <div className={actionBarClass}>
        <span className="text-[13px] text-muted-foreground">
          {hint ?? "10 flip-through Shorts from the pages, first one stops for approval."}
        </span>
        {higgsfieldComingSoon ? (
          <Link to={ROUTES.connections} className={protoBtn()}>
            Higgsfield coming soon — Connections
          </Link>
        ) : higgsfieldConnected ? (
          <button type="button" className={protoBtn()} disabled={busy} onClick={onStart}>
            {start.isPending ? <Spin /> : <Zap className="size-4" />}
            Make the first video
          </button>
        ) : (
          <Link to={ROUTES.connections} className={protoBtn()}>
            Add Higgsfield key
          </Link>
        )}
      </div>
    )
  } else if (pr.status === "running") {
    const doneCount = pr.videos.filter((v) => v.status === "done" || v.status === "review").length
    action = (
      <div className={actionBarClass}>
        <span className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
          <Spin /> Generating with Higgsfield
          {pr.videos.length > 1 ? ` (${doneCount}/${pr.videos.length})` : ""}…
        </span>
      </div>
    )
  } else if (pr.status === "gate") {
    action = (
      <div className={actionBarClass}>
        <span className="text-[13px] text-muted-foreground">
          {hint ?? "Approve the look and Relay makes the other 9 the same way."}
        </span>
        <button type="button" className={protoBtn({ variant: "ghost" })} disabled={busy} onClick={onRedo}>
          {redo.isPending ? <Spin /> : null}
          Regenerate
        </button>
        <button type="button" className={protoBtn({ variant: "mint" })} disabled={busy} onClick={onApprove}>
          {approve.isPending ? <Spin /> : <Check className="size-4" />}
          Looks right, make the rest
        </button>
      </div>
    )
  } else if (pr.status === "done" && !pr.scheduled) {
    action = (
      <div className={actionBarClass}>
        <span className="text-[13px] text-muted-foreground">
          10 videos ready. Schedule one a day where you're connected.
        </span>
        {reachComingSoon ? (
          <Link to={ROUTES.connections} className={protoBtn({ variant: "soft" })}>
            YouTube / TikTok / Instagram coming soon
          </Link>
        ) : reachConnected ? (
          <button type="button" className={protoBtn()} disabled={busy} onClick={onSchedule}>
            {schedule.isPending ? <Spin /> : null}
            Schedule 10 days
          </button>
        ) : (
          <Link to={ROUTES.connections} className={protoBtn()}>
            Connect a reach account
          </Link>
        )}
      </div>
    )
  } else if (pr.scheduled) {
    action = (
      <div className={actionBarClass}>
        <span className="text-[13px] text-muted-foreground">
          Scheduled one a day for 10 days. Nothing posts until the scheduler workers ship.
        </span>
      </div>
    )
  }

  const videos = pr.videos.slice(0, 10)

  return (
    <>
      <StageBar product={product} />
      <div className="mb-[18px]">
        <p className="text-[13px] text-muted-foreground">{product.brand?.title || productName(product)}</p>
        <h1 className="text-[30px]">Promote</h1>
        <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-relaxed text-muted-foreground">
          Short videos and graphics made from the product itself: page flip-throughs, “3 things
          inside”, before/after. Scheduled to the accounts you connect.
        </p>
      </div>

      <div className={cardClass}>
        <div className="flex items-center justify-between gap-2">
          <h3>Flip-through Shorts</h3>
          <span className={protoChip({ variant: pr.status === "done" || pr.scheduled ? "mint" : "sun" })}>
            {statusLabel(pr)}
          </span>
        </div>
        {videos.length ? (
          <div className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5">
            {videos.map((video, index) => {
              const coverUrl =
                product.brand?.coverImageUrls?.[
                  (product.brand.cover + index) % Math.max(product.brand.coverImageUrls.length, 1)
                ] ?? product.brand?.coverImageUrls?.[product.brand.cover] ?? null
              const playable = Boolean(video.url)
              return (
                <div
                  key={`${video.title}-${index}`}
                  className="relative overflow-hidden rounded-xl border border-border bg-muted"
                  style={{ aspectRatio: "9 / 16" }}
                >
                  {playable ? (
                    <video
                      className="h-full w-full object-cover"
                      src={video.url!}
                      muted
                      playsInline
                      controls
                      preload="metadata"
                    />
                  ) : product.brand && palette ? (
                    <CoverArt
                      palette={palette}
                      variant={(product.brand.cover + index) % 3}
                      title={video.title}
                      imageUrl={coverUrl}
                    />
                  ) : (
                    <PosterLite />
                  )}
                  {video.status === "running" ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                      <Spin />
                    </span>
                  ) : null}
                  <span className="absolute right-2 bottom-2 rounded bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                    {video.dur || "0:20"}
                  </span>
                  {video.status === "review" ? (
                    <span
                      className={cn(
                        protoChip({ variant: "sun" }),
                        "absolute bottom-2 left-2 bg-primary/90 text-primary-foreground"
                      )}
                    >
                      Approve?
                    </span>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-2 text-[13px] text-muted-foreground">
            Nothing yet. The first video uses your cover and three pages, 9:16, 20 seconds, captions
            on.
          </p>
        )}
      </div>

      <div className="mt-3.5 grid grid-cols-2 gap-3.5 max-md:grid-cols-1">
        <div className={cardClass}>
          <h3>Pin graphics</h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            {pinterestOn
              ? "Pinterest is on in Distribute. Pin graphics will appear when the pin worker ships."
              : "40 pins, made when you turn Pinterest on in Distribute."}
          </p>
          {!pinterestOn ? (
            <Link to={ROUTES.distribute(product.id)} className={cn(protoBtn({ variant: "soft" }), "mt-3")}>
              Open Distribute
            </Link>
          ) : null}
        </div>
        <div className={cardClass}>
          <h3>Cover variants</h3>
          <p className="mt-1.5 text-[13px] text-muted-foreground">
            Three brand covers for A/B tests on listings and ads.
          </p>
          <div className="mt-3 flex gap-2">
            {[0, 1, 2].map((variant) => {
              const url = product.brand?.coverImageUrls?.[variant] ?? null
              return (
                <div
                  key={variant}
                  className="w-[72px] overflow-hidden rounded-lg border border-border bg-muted"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  {product.brand && palette ? (
                    <CoverArt
                      palette={palette}
                      variant={variant}
                      title={product.brand.title || productName(product)}
                      imageUrl={url}
                    />
                  ) : (
                    <PosterLite />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {action}

      <HiggsfieldFootnote service={higgsfield} />
    </>
  )
}

function HiggsfieldFootnote({ service }: { service?: ServiceCatalogItem }) {
  if (!service) return null
  if (service.comingSoon) {
    return (
      <p className="mt-3 text-[12.5px] text-muted-foreground">
        Video generation needs {service.name} ({service.price}). It is marked coming soon in Connections
        until the key path ships.
      </p>
    )
  }
  return (
    <p className="mt-3 text-[12.5px] text-muted-foreground">
      Videos render through {service.name} ({service.price}). Connect KEY_ID:KEY_SECRET in Connections;
      spend is charged when each Short finishes (~$0.76 at 480p × 20s).
    </p>
  )
}

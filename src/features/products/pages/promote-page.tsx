import { Bolt, Check } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import { CoverArt } from "@/components/common/cover-art"
import { StageBar } from "@/components/common/stage-bar"
import { ROUTES } from "@/constants/routes"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useApprovePromoteMutation,
  useProductQuery,
  useRedoPromoteMutation,
  useSchedulePromoteMutation,
  useStartPromoteMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"

export function PromotePage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const start = useStartPromoteMutation()
  const approve = useApprovePromoteMutation()
  const redo = useRedoPromoteMutation()
  const schedule = useSchedulePromoteMutation()
  const showToast = useUiStore((state) => state.showToast)

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />
  if (product.stage === "build" || product.stage === "paused") {
    return <Navigate to={ROUTES.build(product.id)} replace />
  }

  const pr = product.promote
  const connected = (sid: string) => workspace?.services[sid]?.status === "connected"
  const higgs = catalog.services.find((s) => s.id === "higgsfield")!
  const tiktok = catalog.services.find((s) => s.id === "tiktok")!
  const reach = ["youtube", "tiktok", "instagram"].filter(connected)

  let bar
  if (pr.status === "todo") {
    bar = (
      <div className="actionbar">
        <span className="hint">10 flip-through Shorts from the pages, first one stops for approval. About $7 in video.</span>
        {connected("higgsfield") ? (
          <button type="button" className="btn sun" onClick={() => start.mutate(product.id)}>
            <Bolt className="size-4" /> Make the first video
          </button>
        ) : (
          <button type="button" className="btn sun" onClick={() => openConnectModal(higgs)}>
            Add Higgsfield key
          </button>
        )}
      </div>
    )
  } else if (pr.status === "running") {
    bar = <div className="actionbar"><span className="hint"><span className="spin" /> Generating.</span></div>
  } else if (pr.status === "gate") {
    bar = (
      <div className="actionbar">
        <span className="hint">Approve the look and Relay makes the other 9 the same way.</span>
        <button type="button" className="btn ghost" onClick={() => redo.mutate(product.id)}>Regenerate</button>
        <button type="button" className="btn mint" onClick={() => approve.mutate(product.id)}>
          <Check className="size-4" /> Looks right, make the rest
        </button>
      </div>
    )
  } else if (pr.status === "done" && !pr.scheduled) {
    bar = (
      <div className="actionbar">
        <span className="hint">10 videos ready. Schedule one a day where you’re connected.</span>
        {reach.length ? (
          <button
            type="button"
            className="btn sun"
            onClick={() =>
              schedule.mutate(product.id, {
                onSuccess: () => showToast("Scheduled: one video a day for 10 days."),
              })
            }
          >
            Schedule 10 days
          </button>
        ) : (
          <button type="button" className="btn sun" onClick={() => openConnectModal(tiktok)}>
            Connect TikTok
          </button>
        )}
      </div>
    )
  } else {
    bar = (
      <div className="actionbar">
        <span className="hint">
          Scheduled: one a day on {reach.map((k) => catalog.services.find((s) => s.id === k)?.name).join(", ") || "—"}.
        </span>
        <Link to={ROUTES.distribute(product.id)} className="btn ghost">Distribute</Link>
      </div>
    )
  }

  return (
    <>
      <StageBar product={product} />
      <div className="run-head">
        <div>
          <p className="small muted">{product.brand?.title}</p>
          <h1>Promote</h1>
          <p className="muted" style={{ marginTop: 6, maxWidth: "60ch" }}>
            Short videos and graphics made from the product itself: page flip-throughs, “3 things
            inside”, before/after. Scheduled to the accounts you connect.
          </p>
        </div>
      </div>
      <div className="card">
        <div className="between">
          <h3>Flip-through Shorts</h3>
          <span className={`chip ${pr.status === "done" ? "mint" : "sun"}`}>
            {pr.status === "todo" ? "Not started" : pr.status === "gate" ? "Video 1 ready" : pr.status === "done" ? `${pr.videos.length} ready` : "Working"}
          </span>
        </div>
        {pr.videos.length ? (
          <div className="vids" style={{ marginTop: 12 }}>
            {pr.videos.slice(0, 10).map((video, k) => (
              <div className="poster" style={{ aspectRatio: "9/16" }} key={video.title}>
                <CoverArt
                  palette={catalog.palettes[(product.brand!.palette + k) % 3]}
                  variant={k % 3}
                  title={video.title}
                />
                <span className="dur">{video.dur}</span>
                {video.status === "review" ? (
                  <span className="chip sun" style={{ position: "absolute", left: 8, bottom: 8 }}>Approve?</span>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="small muted" style={{ marginTop: 8 }}>
            Nothing yet. The first video uses your cover and three pages, 9:16, 20 seconds, captions on.
          </p>
        )}
      </div>
      <div className="grid-2" style={{ marginTop: 14 }}>
        <div className="card">
          <h3>Pin graphics</h3>
          <p className="small muted" style={{ marginTop: 6 }}>40 pins, made when you turn Pinterest on in Distribute.</p>
        </div>
        <div className="card">
          <h3>Cover variants</h3>
          <p className="small muted" style={{ marginTop: 6 }}>Three alternative covers for A/B tests on Etsy.</p>
          <div className="covers" style={{ marginTop: 10 }}>
            {[0, 1, 2].map((v) => (
              <div className="cover" key={v} style={{ cursor: "default" }}>
                <CoverArt palette={catalog.palettes[((product.brand?.palette ?? 0) + 1) % 3]} variant={v} title={product.brand?.title ?? ""} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {bar}
    </>
  )
}

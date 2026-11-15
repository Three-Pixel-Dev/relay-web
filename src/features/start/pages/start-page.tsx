import { ArrowUp, ArrowRight, Paperclip, Flame, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"

import { PlansPicker } from "@/components/common/plans-picker"
import { SourceChips } from "@/components/common/source-chips"
import { ROUTES } from "@/constants/routes"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useCreateProductMutation } from "@/shared/queries/product.query"
import {
  useMarkOnboardedMutation,
  useWorkspaceQuery,
} from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { uid } from "@/util/source"
import { linkKind, linkName } from "@/util/source"

import type { BuildMode, SourceItem } from "@/shared/types/relay"

export function StartPage() {
  const navigate = useNavigate()
  const { data: catalog } = useCatalogQuery()
  const { data: workspace } = useWorkspaceQuery()
  const createProduct = useCreateProductMutation()
  const markOnboarded = useMarkOnboardedMutation()
  const showToast = useUiStore((state) => state.showToast)
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const [mode, setMode] = useState<BuildMode>("guided")
  const [input, setInput] = useState("")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [showTrend, setShowTrend] = useState(false)

  useEffect(() => {
    if (!workspace || workspace.seen.onboard || workspace.sub) return
    markOnboarded.mutate()
    openModal({
      title: "One price. Your product, built, listed and seen.",
      body: (
        <>
          <p className="muted" style={{ marginBottom: 16 }}>
            Tell Relay what you know. Add your documents or a creator’s YouTube or Instagram
            link. It finds the profitable pocket, writes and designs the product from those
            sources, sells it through Whop, and runs the channels that bring people. You
            proceed, suggest or cancel at each step.
          </p>
          <PlansPicker onPicked={closeModal} />
        </>
      ),
      actions: (
        <button type="button" className="btn ghost" onClick={closeModal}>
          Look around first
        </button>
      ),
    })
  }, [workspace, markOnboarded, openModal, closeModal, showToast])

  function requireSub() {
    openModal({
      title: "Choose a plan to build a product",
      body: (
        <PlansPicker onPicked={closeModal} />
      ),
      actions: (
        <button type="button" className="btn ghost" onClick={closeModal}>
          Not now
        </button>
      ),
    })
  }

  function start(text: string, extra?: { forElse?: boolean; client?: string; sources?: SourceItem[] }) {
    createProduct.mutate(
      {
        input: text,
        mode,
        forElse: extra?.forElse,
        client: extra?.client,
        sources: extra?.sources ?? sources,
      },
      {
        onSuccess: (product) => {
          setSources([])
          setInput("")
          navigate(ROUTES.build(product.id))
        },
        onError: (error) => {
          const parsed = apiError(error)
          if (parsed.code === "SUB_REQUIRED") requireSub()
          else showToast(parsed.message)
        },
      }
    )
  }

  function openAgency() {
    openModal({
      title: "Building for someone else",
      body: <AgencyForm onStart={start} />,
    })
  }

  return (
    <section className="start">
      <h1>
        What do you know, care about,
        <br />
        or want to help people with?
      </h1>
      <div className="ask">
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              start(input.trim())
            }
          }}
          placeholder="e.g. a skill or method you know, a group you understand, a problem you have solved"
        />
        <div className="bar">
          <span className="mode">
            <button type="button" className={mode === "guided" ? "on" : ""} onClick={() => setMode("guided")}>
              Guided
            </button>
            <button type="button" className={mode === "fast" ? "on" : ""} onClick={() => setMode("fast")}>
              Fast
            </button>
          </span>
          <span className="small muted">
            {mode === "guided" ? "Relay asks before each step" : "Relay runs to the first draft, then asks"}
          </span>
          <button type="button" className="send" aria-label="Start" onClick={() => start(input.trim())}>
            <ArrowUp className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="srcs" style={{ margin: "10px 0 0" }}>
        <SourceChips sources={sources} onRemove={(id) => setSources((list) => list.filter((s) => s.id !== id))} />
      </div>
      <button type="button" className="opt" onClick={() => openSourceDialog({ sources, onChange: setSources })}>
        <Paperclip className="size-[18px]" />
        <div>
          <b>Add sources</b>
          <small>
            Upload documents, notes or transcripts, or paste a YouTube, Instagram or web link.
            Relay writes from them and cites them.
          </small>
        </div>
        <span className="arr">
          <ArrowRight className="size-4" />
        </span>
      </button>
      <button type="button" className="opt" onClick={() => setShowTrend((value) => !value)}>
        <Flame className="size-[18px]" />
        <div>
          <b>Trending ideas</b>
          <small>What people are searching for this month, with numbers. Pick one if you have nothing to say yet.</small>
        </div>
        <span className="arr">
          <ArrowRight className="size-4" />
        </span>
      </button>
      {showTrend ? (
        <div className="trend">
          {catalog?.trending.map((idea) => (
            <button type="button" key={idea.title} onClick={() => start(idea.title)}>
              <b>{idea.title}</b>
              <small>{idea.stats}</small>
            </button>
          ))}
        </div>
      ) : null}
      <button type="button" className="opt" onClick={openAgency}>
        <User className="size-[18px]" />
        <div>
          <b>
            I’m building for someone else{" "}
            <span className="chip lilac" style={{ marginLeft: 6 }}>
              Agency mode
            </span>
          </b>
          <small>
            Paste a creator’s YouTube or Instagram link. Relay studies their content and builds
            the product in their voice.
          </small>
        </div>
        <span className="arr">
          <ArrowRight className="size-4" />
        </span>
      </button>
      <p className="tiny dim" style={{ marginTop: 30 }}>
        Not sure where to start? Press the arrow with the box empty and Relay proposes a pocket
        from what sells this month.
      </p>
    </section>
  )
}

interface AgencyFormProps {
  onStart: (
    text: string,
    extra: { forElse: boolean; client?: string; sources?: SourceItem[] }
  ) => void
}

function AgencyForm({ onStart }: AgencyFormProps) {
  const closeModal = useUiStore((state) => state.closeModal)
  const showToast = useUiStore((state) => state.showToast)
  const [client, setClient] = useState("")
  const [yt, setYt] = useState("")
  const [ig, setIg] = useState("")
  const [know, setKnow] = useState("")

  return (
    <>
      <p className="muted small" style={{ marginBottom: 12 }}>
        Add at least one link or document. Relay studies their content, shows you what it found,
        then builds in their voice. The product lives in your workspace.
      </p>
      <div className="stack">
        <div>
          <label>Who is it for?</label>
          <input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Hana, @slowmotherhood.hana" />
        </div>
        <div className="grid-2" style={{ gap: 10 }}>
          <div>
            <label>Their YouTube</label>
            <input value={yt} onChange={(e) => setYt(e.target.value)} placeholder="youtube.com/@channel" />
          </div>
          <div>
            <label>Their Instagram</label>
            <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="instagram.com/handle" />
          </div>
        </div>
        <div>
          <label>What do they teach? (optional)</label>
          <textarea value={know} onChange={(e) => setKnow(e.target.value)} />
        </div>
      </div>
      <div className="actions">
        <button type="button" className="btn ghost" onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button"
          className="btn sun"
          onClick={() => {
            const sources: SourceItem[] = []
            for (const value of [yt, ig]) {
              const v = value.trim()
              if (v) sources.push({ id: uid(), kind: linkKind(v), name: linkName(v), url: v })
            }
            if (!sources.length && !know.trim()) {
              showToast("Paste their YouTube or Instagram link, or say what they teach.")
              return
            }
            closeModal()
            onStart(know.trim(), { forElse: true, client: client.trim(), sources })
          }}
        >
          Start
        </button>
      </div>
    </>
  )
}

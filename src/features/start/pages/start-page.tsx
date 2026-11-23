import { ArrowUp, ArrowRight, Paperclip, Flame, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router"

import { ChipDot } from "@/components/common/spin"
import { PlansPicker } from "@/components/common/plans-picker"
import { SourceChips } from "@/components/common/source-chips"
import { ROUTES } from "@/constants/routes"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import { fieldClass, labelClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useCreateProductMutation } from "@/shared/queries/product.query"
import {
  useMarkOnboardedMutation,
  useWorkspaceQuery,
} from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { isValidSourceLink, linkKind, linkName, uid } from "@/util/source"

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
  const [name, setName] = useState("")
  const [input, setInput] = useState("")
  const [sources, setSources] = useState<SourceItem[]>([])
  const [showTrend, setShowTrend] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)
  const didPromptOnboard = useRef(false)

  useEffect(() => {
    if (didPromptOnboard.current) return
    if (!workspace || workspace.seen?.onboard || workspace.sub) return
    didPromptOnboard.current = true
    markOnboarded.mutate()
    openModal({
      title: "One price. Your product, built, listed and seen.",
      body: (
        <>
          <p className="mb-4 text-muted-foreground">
            Tell Relay what you know. Add your documents or a creator’s YouTube or Instagram
            link. It finds the profitable pocket, writes and designs the product from those
            sources, sells it through Whop, and runs the channels that bring people. You
            proceed, suggest or cancel at each step.
          </p>
          <PlansPicker onPicked={closeModal} />
        </>
      ),
      actions: (
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Look around first
        </button>
      ),
    })
  }, [workspace, markOnboarded, openModal, closeModal])

  function requireSub() {
    openModal({
      title: "Choose a plan to build a product",
      body: (
        <PlansPicker onPicked={closeModal} />
      ),
      actions: (
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Not now
        </button>
      ),
    })
  }

  function start(
    text: string,
    extra?: { name?: string; forElse?: boolean; client?: string; sources?: SourceItem[] }
  ) {
    const resolvedName = (extra?.name ?? name).trim()
    const resolvedSources = extra?.sources ?? sources
    if (!resolvedName && !text.trim() && resolvedSources.length === 0) {
      showToast("Describe what you know or attach a source to start.")
      return
    }
    createProduct.mutate(
      {
        name: resolvedName,
        input: text,
        mode,
        forElse: extra?.forElse,
        client: extra?.client,
        sources: resolvedSources,
      },
      {
        onSuccess: (product) => {
          setSources([])
          setName("")
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
    <section className="mx-auto mt-10 max-w-[760px] text-center">
      <h1 className="text-[40px] leading-[1.08] tracking-tight max-md:text-[30px]">
        What do you know, care about,
        <br />
        or want to help people with?
      </h1>
      <div className="mt-[26px] mb-3 rounded-[18px] border-[1.5px] border-border-strong bg-card p-4 text-left">
        <div className="mb-3 border-b border-border pb-3">
          <label
            htmlFor="start-product-name"
            className="mb-1 block text-xs font-semibold tracking-wide text-muted-foreground uppercase"
          >
            Product name <span className="font-normal normal-case text-dim">(optional)</span>
          </label>
          <input
            id="start-product-name"
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                start(input.trim())
              }
            }}
            placeholder="e.g. Reactive Dog Walking Guide"
            className="w-full border-0 bg-transparent p-1 text-base font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-dim"
          />
        </div>
        <textarea
          className="min-h-[70px] w-full resize-none border-0 bg-transparent p-1 text-base text-foreground outline-none placeholder:text-dim"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
              start(input.trim())
            }
          }}
          placeholder="What is it about? (optional if you add sources — e.g. a skill or method you know, a group you understand, a problem you have solved)"
        />
        <div className="mt-1.5 flex items-center gap-2.5">
          <span className="inline-flex overflow-hidden rounded-full border border-border">
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-semibold text-muted-foreground",
                mode === "guided" && "bg-foreground text-background"
              )}
              onClick={() => setMode("guided")}
            >
              Guided
            </button>
            <button
              type="button"
              className={cn(
                "px-3 py-1.5 text-[12.5px] font-semibold text-muted-foreground",
                mode === "fast" && "bg-foreground text-background"
              )}
              onClick={() => setMode("fast")}
            >
              Fast
            </button>
          </span>
          <span className="text-[13px] text-muted-foreground">
            {mode === "guided" ? "Relay asks before each step" : "Relay runs to the first draft, then asks"}
          </span>
          <button
            type="button"
            className="ml-auto grid size-10 place-items-center rounded-full bg-primary text-primary-foreground"
            aria-label="Start"
            onClick={() => start(input.trim())}
          >
            <ArrowUp className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap justify-center gap-2">
        <SourceChips sources={sources} onRemove={(id) => setSources((list) => list.filter((s) => s.id !== id))} />
      </div>
      <StartOpt
        icon={<Paperclip className="size-[18px]" />}
        title="Add sources"
        body="Upload documents, notes, transcripts, audio, or video, or paste a YouTube, Instagram or web link. Relay writes from them and cites them."
        onClick={() => openSourceDialog({ sources, onChange: setSources })}
      />
      <StartOpt
        icon={<Flame className="size-[18px]" />}
        title="Trending ideas"
        body="What people are searching for this month, with numbers. Pick one if you have nothing to say yet."
        onClick={() => setShowTrend((value) => !value)}
      />
      {showTrend ? (
        catalog?.trending.length ? (
          <div className="mt-3.5 grid grid-cols-3 gap-2.5 text-left max-md:grid-cols-1">
            {catalog.trending.map((idea) => (
              <button
                type="button"
                className="rounded-xl border border-border bg-muted px-3.5 py-3 text-left hover:border-primary"
                key={idea.title}
                onClick={() => start(idea.title, { name: name.trim() || idea.title })}
              >
                <b className="block text-[13.5px]">{idea.title}</b>
                <small className="text-xs text-muted-foreground">{idea.stats}</small>
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3.5 text-[13px] text-muted-foreground">No trending ideas yet.</p>
        )
      ) : null}
      <StartOpt
        icon={<User className="size-[18px]" />}
        title={
          <>
            I’m building for someone else{" "}
            <span className={cn(protoChip({ variant: "lilac" }), "ml-1.5")}>
              <ChipDot />
              Agency mode
            </span>
          </>
        }
        body="Paste a creator’s YouTube or Instagram link. Relay studies their content and builds the product in their voice."
        onClick={openAgency}
      />
      <p className="mt-[30px] text-xs text-dim">
        Describe what you know or attach your sources and press Start. Leave the name blank and it
        stays Untitled until Relay finds a niche.
      </p>
    </section>
  )
}

interface StartOptProps {
  icon: React.ReactNode
  title: React.ReactNode
  body: string
  onClick: () => void
}

function StartOpt({ icon, title, body, onClick }: StartOptProps) {
  return (
    <button
      type="button"
      className="mt-2.5 flex w-full cursor-pointer items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5 text-left hover:border-border-strong"
      onClick={onClick}
    >
      {icon}
      <div>
        <b className="block text-sm">{title}</b>
        <small className="text-[12.5px] text-muted-foreground">{body}</small>
      </div>
      <span className="ml-auto text-muted-foreground">
        <ArrowRight className="size-4" />
      </span>
    </button>
  )
}

interface AgencyFormProps {
  onStart: (
    text: string,
    extra: { name: string; forElse: boolean; client?: string; sources?: SourceItem[] }
  ) => void
}

function AgencyForm({ onStart }: AgencyFormProps) {
  const closeModal = useUiStore((state) => state.closeModal)
  const showToast = useUiStore((state) => state.showToast)
  const [productName, setProductName] = useState("")
  const [client, setClient] = useState("")
  const [yt, setYt] = useState("")
  const [ig, setIg] = useState("")
  const [know, setKnow] = useState("")

  return (
    <>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Add at least one link or document. Relay studies their content, shows you what it found,
        then builds in their voice. The product lives in your workspace.
      </p>
      <div className="grid gap-3.5">
        <div>
          <label className={labelClass}>Product name (optional)</label>
          <input
            className={fieldClass}
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g. Creator Content Playbook"
          />
        </div>
        <div>
          <label className={labelClass}>Who is it for?</label>
          <input
            className={fieldClass}
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Name or handle"
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5 max-md:grid-cols-1">
          <div>
            <label className={labelClass}>Their YouTube</label>
            <input
              className={fieldClass}
              value={yt}
              onChange={(e) => setYt(e.target.value)}
              placeholder="youtube.com/@channel"
            />
          </div>
          <div>
            <label className={labelClass}>Their Instagram</label>
            <input
              className={fieldClass}
              value={ig}
              onChange={(e) => setIg(e.target.value)}
              placeholder="instagram.com/handle"
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>What do they teach? (optional)</label>
          <textarea className={fieldClass} value={know} onChange={(e) => setKnow(e.target.value)} />
        </div>
      </div>
      <div className="mt-[22px] flex flex-wrap justify-end gap-2.5">
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button"
          className={protoBtn()}
          onClick={() => {
            const sources: SourceItem[] = []
            for (const value of [yt, ig]) {
              const v = value.trim()
              if (!v) continue
              if (!isValidSourceLink(v)) {
                showToast("We couldn't read this link")
                return
              }
              sources.push({ id: uid(), kind: linkKind(v), name: linkName(v), url: v })
            }
            if (!sources.length && !know.trim()) {
              showToast("Paste their YouTube or Instagram link, or say what they teach.")
              return
            }
            closeModal()
            onStart(know.trim(), {
              name: productName.trim(),
              forElse: true,
              client: client.trim(),
              sources,
            })
          }}
        >
          Start
        </button>
      </div>
    </>
  )
}

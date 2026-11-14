import { ShieldIcon } from "lucide-react"

import { SourceChips } from "@/components/common/source-chips"
import { uid } from "@/util/source"
import { linkKind, linkName } from "@/util/source"
import { useUiStore } from "@/shared/stores/ui.store"

import type { SourceItem } from "@/shared/types/relay"

interface SourceDialogProps {
  sources: SourceItem[]
  late?: boolean
  onChange: (sources: SourceItem[]) => void
}

export function openSourceDialog({ sources, late, onChange }: SourceDialogProps) {
  useUiStore.getState().openModal({
    title: "Add sources",
    body: <SourceDialogBody sources={sources} late={late} onChange={onChange} />,
    actions: (
      <button type="button" className="btn sun" onClick={() => useUiStore.getState().closeModal()}>
        Done
      </button>
    ),
  })
}

function SourceDialogBody({ sources, late, onChange }: SourceDialogProps) {
  const samples = ["coaching-notes.pdf", "workshop-transcript.docx", "client-faq.txt"]

  function add(items: SourceItem[]) {
    onChange([...sources, ...items])
    openSourceDialog({ sources: [...sources, ...items], late, onChange })
  }

  function remove(id: string) {
    const next = sources.filter((source) => source.id !== id)
    onChange(next)
    openSourceDialog({ sources: next, late, onChange })
  }

  return (
    <>
      <p className="muted small" style={{ marginBottom: 14 }}>
        Relay reads these, indexes every passage, and writes the product from them. Each section
        shows which source it came from.{" "}
        {late
          ? "Sources added now are used for sections written or regenerated from here on."
          : ""}
      </p>
      <div className="stack">
        <div>
          <label>Upload documents</label>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md,.csv,.srt,.mp3,.mp4"
            onChange={(event) => {
              const files = [...(event.target.files ?? [])]
              add(
                files.map((file) => ({
                  id: uid(),
                  kind: "file" as const,
                  name: file.name,
                  size: file.size,
                }))
              )
            }}
          />
          <p className="tiny dim" style={{ marginTop: 6 }}>
            PDF, Word, text, transcripts, audio or video.{" "}
            <button
              type="button"
              className="link tiny"
              onClick={() =>
                add([
                  {
                    id: uid(),
                    kind: "file",
                    name: samples[sources.length % 3],
                    size: 482000,
                  },
                ])
              }
            >
              Add a sample document
            </button>
          </p>
        </div>
        <div>
          <label>Or paste a link</label>
          <div className="row">
            <input id="src-link" placeholder="youtube.com/@channel, instagram.com/handle, or any page" />
            <button
              type="button"
              className="btn soft"
              onClick={() => {
                const input = document.getElementById("src-link") as HTMLInputElement | null
                const value = input?.value.trim()
                if (!value) return
                add([{ id: uid(), kind: linkKind(value), name: linkName(value), url: value }])
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label>Added ({sources.length})</label>
          {sources.length ? (
            <SourceChips sources={sources} onRemove={remove} />
          ) : (
            <span className="dim small">Nothing yet.</span>
          )}
        </div>
        <p className="note">
          <ShieldIcon className="size-4" />
          <span>
            Your sources are private to your account and never used to train anything. Instagram
            needs the account owner’s approval; YouTube and web pages are read from the link.
          </span>
        </p>
      </div>
    </>
  )
}

import { ShieldIcon } from "lucide-react"

import { SourceChips } from "@/components/common/source-chips"
import { fieldClass, labelClass, noteClass, protoBtn } from "@/lib/proto"
import { SOURCE_FILE_ACCEPT, isValidSourceLink, linkKind, linkName, uid } from "@/util/source"
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
      <button type="button" className={protoBtn()} onClick={() => useUiStore.getState().closeModal()}>
        Done
      </button>
    ),
  })
}

function SourceDialogBody({ sources, late, onChange }: SourceDialogProps) {
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
      <p className="mb-3.5 text-[13px] text-muted-foreground">
        Relay reads these, indexes every passage, and writes the product from them. Each section
        shows which source it came from.{" "}
        {late
          ? "Sources added now are used for sections written or regenerated from here on."
          : ""}
      </p>
      <div className="grid gap-3.5">
        <div>
          <label className={labelClass}>Upload documents, audio, or video</label>
          <input
            className={fieldClass}
            type="file"
            multiple
            accept={SOURCE_FILE_ACCEPT}
            onChange={(event) => {
              const files = [...(event.target.files ?? [])]
              add(
                files.map((file) => ({
                  id: uid(),
                  kind: "file" as const,
                  name: file.name,
                  size: file.size,
                  file,
                }))
              )
            }}
          />
          <p className="mt-1.5 text-xs text-dim">
            PDF, Word, text, transcripts, audio, or video. Speech is transcribed when you proceed.
            Video also uses unique on-screen scenes.
          </p>
        </div>
        <div>
          <label className={labelClass}>Or paste a link</label>
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              id="src-link"
              className={fieldClass}
              placeholder="youtube.com/@channel, instagram.com/handle, or any page"
            />
            <button
              type="button"
              className={protoBtn({ variant: "soft" })}
              onClick={() => {
                const input = document.getElementById("src-link") as HTMLInputElement | null
                const value = input?.value.trim()
                if (!value) return
                if (!isValidSourceLink(value)) {
                  useUiStore.getState().showToast("We couldn't read this link")
                  return
                }
                add([{ id: uid(), kind: linkKind(value), name: linkName(value), url: value }])
              }}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label className={labelClass}>Added ({sources.length})</label>
          {sources.length ? (
            <SourceChips sources={sources} onRemove={remove} />
          ) : (
            <span className="text-[13px] text-dim">Nothing yet.</span>
          )}
        </div>
        <p className={noteClass}>
          <ShieldIcon className="size-4 shrink-0" />
          <span>
            Your sources are private to your account and never used to train anything. Instagram
            is read from the public bio and post captions only (private accounts can’t be read);
            YouTube and web pages are read from the link.
          </span>
        </p>
      </div>
    </>
  )
}

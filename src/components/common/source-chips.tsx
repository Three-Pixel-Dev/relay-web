import { XIcon } from "lucide-react"

import { SOURCE_KINDS } from "@/util/source"

import type { SourceItem } from "@/shared/types/relay"

interface SourceChipsProps {
  sources: SourceItem[]
  onRemove?: (id: string) => void
}

export function SourceChips({ sources, onRemove }: SourceChipsProps) {
  return (
    <div className="srcs">
      {sources.map((source) => (
        <span
          className="src"
          key={source.id}
          title={
            source.error
              ? `${source.status ? `[${source.status}] ` : ""}${source.error}`
              : source.status
                ? `Status: ${source.status}`
                : undefined
          }
        >
          <b>{SOURCE_KINDS[source.kind].short}</b>
          {source.name}
          {source.status === "failed" ? " (failed)" : source.status === "skipped" ? " (skipped)" : ""}
          {onRemove ? (
            <button type="button" aria-label="Remove" onClick={() => onRemove(source.id)}>
              <XIcon className="size-3" />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  )
}

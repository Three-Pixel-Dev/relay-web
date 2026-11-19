import { XIcon } from "lucide-react"

import { SOURCE_KINDS } from "@/util/source"

import type { SourceItem } from "@/shared/types/relay"

interface SourceChipsProps {
  sources: SourceItem[]
  onRemove?: (id: string) => void
}

export function SourceChips({ sources, onRemove }: SourceChipsProps) {
  return (
    <div className="flex min-w-0 flex-wrap gap-2">
      {sources.map((source) => {
        const statusNote =
          source.status === "failed"
            ? " (failed)"
            : source.status === "skipped"
              ? " (skipped)"
              : ""
        const tooltip = [
          source.name,
          source.status ? `Status: ${source.status}` : "",
          source.error ?? "",
        ]
          .filter(Boolean)
          .join("\n")

        return (
          <span
            className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border-strong bg-muted py-1.5 pr-2.5 pl-1.5 text-[12.5px]"
            key={source.id}
            title={tooltip}
          >
            <b className="shrink-0 rounded-full bg-lilac/15 px-1.5 py-0.5 text-[10.5px] font-bold text-lilac">
              {SOURCE_KINDS[source.kind].short}
            </b>
            <span className="min-w-0 truncate">
              {source.name}
              {statusNote}
            </span>
            {onRemove ? (
              <button
                type="button"
                className="grid shrink-0 place-items-center rounded-full p-0.5 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
                onClick={() => onRemove(source.id)}
              >
                <XIcon className="size-3" />
              </button>
            ) : null}
          </span>
        )
      })}
    </div>
  )
}

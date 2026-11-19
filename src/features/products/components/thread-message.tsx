import { ThreadText } from "@/components/common/thread-text"
import { cn } from "@/lib/utils"
import { formatTime } from "@/util/format"

interface ThreadMessageProps {
  who: "you" | "relay"
  text: string
  at: string
}

export function ThreadMessage({ who, text, at }: ThreadMessageProps) {
  const isYou = who === "you"

  return (
    <div className={cn("flex items-end gap-2.5", isYou ? "flex-row-reverse" : "flex-row")}>
      <span
        className={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-[12px] font-extrabold",
          isYou ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
        )}
      >
        {isYou ? "YO" : "R"}
      </span>
      <div className={cn("flex min-w-0 max-w-[min(80%,42rem)] flex-col", isYou && "items-end")}>
        <div
          className={cn(
            "px-3.5 py-2.5 text-sm leading-relaxed",
            isYou
              ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-2xl rounded-bl-sm border border-border bg-card"
          )}
        >
          <ThreadText text={text} />
        </div>
        <small
          className={cn(
            "mt-1 px-1 text-[11px] text-dim",
            isYou && "text-right"
          )}
        >
          {formatTime(at)}
        </small>
      </div>
    </div>
  )
}

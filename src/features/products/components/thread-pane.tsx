import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { ReactNode } from "react"

const followHandlers = new Set<() => void>()

export function followThreadToEnd() {
  for (const handler of followHandlers) handler()
}

interface ThreadPaneProps {
  children: ReactNode
  footer: ReactNode
  scrollKey: string
  pinToEnd?: boolean
}

export function ThreadPane({ children, footer, scrollKey, pinToEnd = false }: ThreadPaneProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const stickToBottom = useRef(true)
  const [showJump, setShowJump] = useState(false)

  function measure() {
    const el = scrollerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    const atBottom = distance < 64
    stickToBottom.current = atBottom
    setShowJump(!atBottom)
  }

  function jumpToLatest(smooth = true) {
    const el = scrollerRef.current
    if (!el) return
    stickToBottom.current = true
    setShowJump(false)
    const top = el.scrollHeight
    el.scrollTo({ top, behavior: smooth ? "smooth" : "auto" })
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" })
    })
  }

  useEffect(() => {
    followHandlers.add(jumpToLatest)
    return () => {
      followHandlers.delete(jumpToLatest)
    }
  })

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    if (pinToEnd || stickToBottom.current) {
      el.scrollTop = el.scrollHeight
      setShowJump(false)
      stickToBottom.current = true
      return
    }
    measure()
  }, [scrollKey, pinToEnd])

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div
        ref={scrollerRef}
        className="min-h-0 flex-1 overflow-auto pr-0.5 [scrollbar-gutter:stable]"
        onScroll={measure}
      >
        <div className="grid gap-4 pb-3">{children}</div>
      </div>
      {showJump ? (
        <button
          type="button"
          className="absolute right-[18px] bottom-[88px] z-[5] grid size-10 place-items-center rounded-full border-[1.5px] border-border-strong bg-card text-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--background)_55%,transparent)] hover:border-primary hover:bg-secondary max-md:bottom-20"
          aria-label="Scroll to latest"
          onClick={() => jumpToLatest()}
        >
          <ChevronDown className="size-5" />
        </button>
      ) : null}
      {footer}
    </div>
  )
}

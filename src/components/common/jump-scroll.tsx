import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface JumpScrollProps {
  children: ReactNode
  className?: string
  buttonClassName?: string
  scrollKey?: string
}

export function JumpScroll({
  children,
  className,
  buttonClassName,
  scrollKey,
}: JumpScrollProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [showJump, setShowJump] = useState(false)

  function measure() {
    const el = scrollerRef.current
    if (!el) return
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowJump(distance > 64)
  }

  function jumpToEnd() {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    setShowJump(false)
  }

  useEffect(() => {
    measure()
    const el = scrollerRef.current
    if (!el || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(el)
    return () => observer.disconnect()
  }, [scrollKey])

  return (
    <div className={cn("relative min-h-0", className)}>
      <div
        ref={scrollerRef}
        className="h-full overflow-auto pr-0.5 [scrollbar-gutter:stable]"
        onScroll={measure}
      >
        {children}
      </div>
      {showJump ? (
        <button
          type="button"
          className={cn(
            "absolute right-3 bottom-3 z-[5] grid size-10 place-items-center rounded-full border-[1.5px] border-border-strong bg-card text-foreground shadow-[0_10px_28px_color-mix(in_oklab,var(--background)_55%,transparent)] hover:border-primary hover:bg-secondary",
            buttonClassName
          )}
          aria-label="Scroll to bottom"
          onClick={jumpToEnd}
        >
          <ChevronDown className="size-5" />
        </button>
      ) : null}
    </div>
  )
}

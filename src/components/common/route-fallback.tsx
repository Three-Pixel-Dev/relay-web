import { Loader2Icon } from "lucide-react"

export function RouteFallback() {
  return (
    <div
      className="flex min-h-64 flex-1 items-center justify-center"
      role="status"
      aria-label="Loading…"
    >
      <Loader2Icon className="size-6 animate-spin text-muted-foreground motion-reduce:animate-none" />
    </div>
  )
}

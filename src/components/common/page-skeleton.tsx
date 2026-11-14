import { Skeleton } from "@/components/ui/skeleton"

export function PageSkeleton() {
  return (
    <div
      className="flex h-full min-h-0 max-w-2xl flex-col gap-6"
      role="status"
      aria-busy="true"
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-4 w-2/3 max-w-sm" />
      </div>
      <Skeleton className="h-11 w-40 rounded-md" />
    </div>
  )
}

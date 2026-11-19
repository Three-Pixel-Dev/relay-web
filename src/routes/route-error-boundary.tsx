import { TriangleAlertIcon } from "lucide-react"
import { isRouteErrorResponse, useRouteError } from "react-router"

import { Button } from "@/components/ui/button"

export function RouteErrorBoundary() {
  const error = useRouteError()
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Something went wrong"

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
        <TriangleAlertIcon className="size-7" aria-hidden />
      </span>
      <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page could not be loaded. Reload to try again, or go back to start.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload page
        </Button>
        <Button type="button" onClick={() => window.location.assign("/")}>
          Back to start
        </Button>
      </div>
    </div>
  )
}

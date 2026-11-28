import { ArrowLeftIcon } from "lucide-react"
import { Link } from "react-router"

import { buttonVariants } from "@/components/ui/button"
import { ROUTES } from "@/constants/routes"

export function NotFoundPage() {
  return (
    <section className="flex min-h-96 flex-col items-start gap-3">
      <h1 className="text-[26px] font-bold tracking-tight">We couldn&apos;t find that</h1>
      <p className="max-w-md text-muted-foreground">
        It may have been removed, or the link may be incorrect.
      </p>
      <Link to={ROUTES.start} className={buttonVariants({ variant: "outline" })}>
        <ArrowLeftIcon className="size-4" />
        Back to start
      </Link>
    </section>
  )
}

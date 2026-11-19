import { Link } from "react-router"

import { ROUTES } from "@/constants/routes"
import { protoBtn } from "@/lib/proto"

interface ComingSoonPageProps {
  title?: string
  description?: string
}

export function ComingSoonPage({
  title = "Coming soon",
  description = "This stage is not enabled on the server yet. Sources and Source summary (Step 1) are live now.",
}: ComingSoonPageProps) {
  return (
    <div className="rounded-[22px] border-[1.5px] border-dashed border-border-strong px-5 py-[60px] text-center">
      <h2 className="mb-2">{title}</h2>
      <p className="mb-[18px] text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link to={ROUTES.products} className={protoBtn({ variant: "soft" })}>
          My products
        </Link>
        <Link to={ROUTES.start} className={protoBtn()}>
          Back to Start
        </Link>
      </div>
    </div>
  )
}

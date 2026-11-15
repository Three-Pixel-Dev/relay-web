import { Link } from "react-router"

import { ROUTES } from "@/constants/routes"

interface ComingSoonPageProps {
  title?: string
  description?: string
}

export function ComingSoonPage({
  title = "Coming soon",
  description = "This stage is not enabled on the server yet. Sources and Source summary (Step 1) are live now.",
}: ComingSoonPageProps) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="row" style={{ justifyContent: "center", gap: 10 }}>
        <Link to={ROUTES.products} className="btn soft">
          My products
        </Link>
        <Link to={ROUTES.start} className="btn sun">
          Back to Start
        </Link>
      </div>
    </div>
  )
}


import { Link, useLocation } from "react-router"

import { ROUTES } from "@/constants/routes"
import type { Product } from "@/shared/types/relay"

interface StageBarProps {
  product: Product
}

export function StageBar({ product }: StageBarProps) {
  const { pathname } = useLocation()
  const built = product.stage !== "build" && product.stage !== "paused"
  const items = [
    {
      to: ROUTES.build(product.id),
      label: "Build",
      sub: product.stage === "build" ? `step ${product.cur + 1} of 7` : "done",
      locked: false,
      done: built,
    },
    {
      to: ROUTES.publish(product.id),
      label: "Publish",
      sub: "coming soon",
      locked: true,
      done: false,
    },
    {
      to: ROUTES.distribute(product.id),
      label: "Distribute",
      sub: "coming soon",
      locked: true,
      done: false,
    },
    {
      to: ROUTES.promote(product.id),
      label: "Promote",
      sub: "coming soon",
      locked: true,
      done: false,
    },
  ]

  return (
    <div className="stages">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`${pathname === item.to ? "on" : ""} ${item.done ? "done" : ""}`}
          style={item.locked ? { opacity: 0.45, pointerEvents: "none" } : undefined}
        >
          {item.label}
          <small>{item.sub}</small>
        </Link>
      ))}
    </div>
  )
}

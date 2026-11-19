import { Link, useLocation } from "react-router"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
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
    <div className="mb-4 flex gap-1.5 max-md:flex-wrap">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={cn(
            "flex-1 rounded-xl border border-border bg-muted px-3 py-2.5 text-[13px] font-semibold text-muted-foreground max-md:min-w-[45%] hover:bg-card hover:text-foreground",
            pathname === item.to && "border-primary bg-card text-foreground",
            pathname === item.to && "[&_small]:text-primary [&_small]:opacity-100",
            item.done && "border-success/35 text-success"
          )}
          style={item.locked ? { opacity: 0.45, pointerEvents: "none" } : undefined}
        >
          {item.label}
          <small className="mt-0.5 block text-[11.5px] font-medium opacity-80">{item.sub}</small>
        </Link>
      ))}
    </div>
  )
}

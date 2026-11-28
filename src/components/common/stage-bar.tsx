import { Link, useLocation } from "react-router"

import { ROUTES } from "@/constants/routes"
import { cn } from "@/lib/utils"
import type { Product } from "@/shared/types/relay"

interface StageBarProps {
  product: Product
}

function channelsOnCount(product: Product) {
  return Object.values(product.distribute ?? {}).filter((c) => c?.on).length
}

function promoteSub(product: Product) {
  const promote = product.promote
  if (!promote) return "not started"
  if (promote.scheduled) return "scheduled"
  const n = promote.videos?.length ?? 0
  if (n > 0) return `${n} video${n === 1 ? "" : "s"}`
  return "not started"
}

export function StageBar({ product }: StageBarProps) {
  const { pathname } = useLocation()
  const built = product.stage !== "build" && product.stage !== "paused"
  const isPublished = Object.keys(product.publish?.live ?? {}).length > 0
  const distributeUnlocked = built && (product.stage === "distribute" || isPublished)
  const onCount = channelsOnCount(product)

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
      sub: isPublished ? "live" : built ? "ready" : "after build",
      locked: !built,
      done: isPublished,
    },
    {
      to: ROUTES.distribute(product.id),
      label: "Distribute",
      sub: onCount ? `${onCount} channel${onCount === 1 ? "" : "s"} on` : "not started",
      locked: !distributeUnlocked,
      done: onCount > 0,
    },
    {
      to: ROUTES.promote(product.id),
      label: "Promote",
      sub: promoteSub(product),
      locked: !distributeUnlocked,
      done: (product.promote?.videos?.length ?? 0) > 0 || Boolean(product.promote?.scheduled),
    },
  ]

  return (
    <div className="mb-4 flex gap-1.5 max-md:flex-wrap">
      {items.map((item) => {
        const isOn = pathname === item.to
        // Match look-spec: only Build turns mint when finished; other stages stay neutral.
        const isDoneBuild = item.label === "Build" && item.done && !isOn

        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex-1 rounded-lg border border-border bg-card px-3 py-2.5 text-[13px] font-semibold text-muted-foreground max-md:min-w-[45%] hover:text-foreground",
              isOn && "border-foreground bg-foreground text-background hover:text-background",
              isOn && "[&_small]:text-background [&_small]:opacity-80",
              isDoneBuild && "text-success"
            )}
            style={item.locked ? { opacity: 0.45, pointerEvents: "none" } : undefined}
          >
            {item.label}
            <small className="mt-0.5 block text-[11.5px] font-medium opacity-80">{item.sub}</small>
          </Link>
        )
      })}
    </div>
  )
}

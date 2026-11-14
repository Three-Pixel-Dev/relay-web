import { ShieldIcon } from "lucide-react"

import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useStartSubscriptionMutation } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { SubscriptionPlan } from "@/shared/types/relay"

interface PlansPickerProps {
  selected?: SubscriptionPlan | null
  onPicked?: () => void
}

export function PlansPicker({ selected = null, onPicked }: PlansPickerProps) {
  const { data: catalog } = useCatalogQuery()
  const start = useStartSubscriptionMutation()
  const showToast = useUiStore((state) => state.showToast)

  function pick(plan: SubscriptionPlan) {
    start.mutate(plan, {
      onSuccess: () => {
        showToast(plan === "yearly" ? "Trial started on the yearly plan." : "Trial started on the monthly plan.")
        onPicked?.()
      },
    })
  }

  return (
    <>
      <div className="sub-plans">
        <button
          type="button"
          className={`plan ${selected === "monthly" ? "on" : ""}`}
          onClick={() => pick("monthly")}
        >
          <h3>Monthly</h3>
          <div className="price">
            ${catalog?.prices.monthly ?? 19} <small>/ month</small>
          </div>
          <p className="muted small">Unlimited products. Cancel any time.</p>
        </button>
        <button
          type="button"
          className={`plan ${selected === "yearly" ? "on" : ""}`}
          onClick={() => pick("yearly")}
        >
          <span className="chip mint tag">2 months free</span>
          <h3>Yearly</h3>
          <div className="price">
            ${catalog?.prices.yearly ?? 149} <small>/ year</small>
          </div>
          <p className="muted small">Same everything, one payment.</p>
        </button>
      </div>
      <p className="note" style={{ marginTop: 12 }}>
        <ShieldIcon className="size-4" />
        <span>
          AI usage runs on your own keys at the providers’ prices. Marketplace fees are theirs.
          Relay’s price is only Relay.
        </span>
      </p>
    </>
  )
}

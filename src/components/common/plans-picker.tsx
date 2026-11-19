import { ShieldIcon } from "lucide-react"

import { ChipDot } from "@/components/common/spin"
import { noteClass, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { usePlansQuery } from "@/shared/queries/subscription.query"
import { useStartSubscriptionMutation } from "@/shared/queries/workspace.query"
import { useSessionStore } from "@/shared/stores/session.store"
import { useUiStore } from "@/shared/stores/ui.store"
import type { SubscriptionPlan } from "@/shared/types/relay"
import { apiError } from "@/util/api-error"

interface PlansPickerProps {
  selected?: SubscriptionPlan | null
  onPicked?: () => void
}

export function PlansPicker({ selected = null, onPicked }: PlansPickerProps) {
  const { data: catalog } = useCatalogQuery()
  const { data: livePlans } = usePlansQuery()
  const start = useStartSubscriptionMutation()
  const accessToken = useSessionStore((s) => s.accessToken)
  const showToast = useUiStore((state) => state.showToast)

  const sixMonthsPrice =
    livePlans?.find((p) => p.plan === "SIX_MONTHS")?.priceUsd ?? catalog?.prices.six_months ?? 99
  const yearlyPrice =
    livePlans?.find((p) => p.plan === "YEARLY")?.priceUsd ?? catalog?.prices.yearly ?? 149

  function pick(plan: SubscriptionPlan) {
    if (!accessToken) {
      showToast("Sign in to choose a plan.")
      return
    }
    start.mutate(plan, {
      onSuccess: () => {
        showToast(
          plan === "yearly"
            ? "Yearly plan activated."
            : "6-month plan activated.",
        )
        onPicked?.()
      },
      onError: (error) => {
        showToast(apiError(error).message)
      },
    })
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <button
          type="button"
          className={cn(
            "relative cursor-pointer rounded-[22px] border-[1.5px] border-border bg-card p-[22px] text-left transition-colors hover:border-border-strong",
            selected === "six_months" && "border-primary"
          )}
          disabled={start.isPending}
          onClick={() => pick("six_months")}
        >
          <h3>6 months</h3>
          <div className="my-2 text-[26px] font-extrabold tracking-tight">
            ${sixMonthsPrice}{" "}
            <small className="text-[13px] font-medium tracking-normal text-muted-foreground">
              / 6 months
            </small>
          </div>
          <p className="text-[13px] text-muted-foreground">No trial. Unlimited products. Cancel any time.</p>
        </button>
        <button
          type="button"
          className={cn(
            "relative cursor-pointer rounded-[22px] border-[1.5px] border-border bg-card p-[22px] text-left transition-colors hover:border-border-strong",
            selected === "yearly" && "border-primary"
          )}
          disabled={start.isPending}
          onClick={() => pick("yearly")}
        >
          <span className={cn(protoChip({ variant: "mint" }), "absolute top-4 right-4")}>
            <ChipDot />
            Best value
          </span>
          <h3>Yearly</h3>
          <div className="my-2 text-[26px] font-extrabold tracking-tight">
            ${yearlyPrice}{" "}
            <small className="text-[13px] font-medium tracking-normal text-muted-foreground">
              / year
            </small>
          </div>
          <p className="text-[13px] text-muted-foreground">Same everything, one payment. No trial.</p>
        </button>
      </div>
      <p className={cn(noteClass, "mt-3")}>
        <ShieldIcon className="size-4 shrink-0" />
        <span>
          AI usage runs on your own keys at the providers’ prices. Marketplace fees are theirs.
          Relay’s price is only Relay. Payment provider wiring comes next — plans are recorded on your account.
        </span>
      </p>
    </>
  )
}

import { ShieldIcon } from "lucide-react"
import { useCallback, useState } from "react"

import { ChipDot } from "@/components/common/spin"
import { StripeEmbeddedCheckout } from "@/features/connections/components/stripe-embedded-checkout"
import { noteClass, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useConfirmCheckoutMutation,
  useCreateCheckoutMutation,
  usePlansQuery,
  useSubscribeMutation,
} from "@/shared/queries/subscription.query"
import { useSessionStore } from "@/shared/stores/session.store"
import { useUiStore } from "@/shared/stores/ui.store"
import type { CheckoutSession } from "@/shared/types/api"
import type { SubscriptionPlan } from "@/shared/types/relay"
import { apiError } from "@/util/api-error"

interface PlansPickerProps {
  selected?: SubscriptionPlan | null
  onPicked?: () => void
}

function isCheckoutSession(value: unknown): value is CheckoutSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "clientSecret" in value &&
      "publishableKey" in value &&
      "sessionId" in value,
  )
}

export function PlansPicker({ selected = null, onPicked }: PlansPickerProps) {
  const { data: catalog } = useCatalogQuery()
  const { data: livePlans } = usePlansQuery()
  const createCheckout = useCreateCheckoutMutation()
  const confirmCheckout = useConfirmCheckoutMutation()
  const localSubscribe = useSubscribeMutation()
  const accessToken = useSessionStore((s) => s.accessToken)
  const showToast = useUiStore((state) => state.showToast)
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const [pending, setPending] = useState(false)

  const sixMonthsPrice =
    livePlans?.find((p) => p.plan === "SIX_MONTHS")?.priceUsd ?? catalog?.prices.six_months ?? 99
  const yearlyPrice =
    livePlans?.find((p) => p.plan === "YEARLY")?.priceUsd ?? catalog?.prices.yearly ?? 149

  const finishPaid = useCallback(
    (sessionId: string) => {
      confirmCheckout.mutate(sessionId, {
        onSuccess: () => {
          showToast("Payment received. Plan activated.")
          closeModal()
          onPicked?.()
        },
        onError: (error) => showToast(apiError(error).message),
      })
    },
    [closeModal, confirmCheckout, onPicked, showToast],
  )

  function openCheckout(session: CheckoutSession, plan: SubscriptionPlan) {
    openModal({
      title: plan === "yearly" ? "Pay yearly with card" : "Pay 6 months with card",
      body: (
        <div className="stack" style={{ gap: 12 }}>
          <p className="muted small">
            Paid by card.
          </p>
          <StripeEmbeddedCheckout
            clientSecret={session.clientSecret}
            publishableKey={session.publishableKey}
            onComplete={() => finishPaid(session.sessionId)}
          />
        </div>
      ),
      actions: (
        <button type="button" className="btn ghost" onClick={closeModal}>
          Cancel
        </button>
      ),
    })
  }

  function pick(plan: SubscriptionPlan) {
    if (!accessToken) {
      showToast("Sign in to choose a plan.")
      return
    }
    setPending(true)
    createCheckout.mutate(plan, {
      onSuccess: (session) => {
        setPending(false)
        openCheckout(session, plan)
      },
      onError: () => {
        // Stripe not configured → local activate (dev).
        localSubscribe.mutate(plan, {
          onSuccess: (result) => {
            setPending(false)
            if (isCheckoutSession(result)) {
              openCheckout(result, plan)
              return
            }
            showToast(plan === "yearly" ? "Yearly plan activated." : "6-month plan activated.")
            onPicked?.()
          },
          onError: (error) => {
            setPending(false)
            showToast(apiError(error).message)
          },
        })
      },
    })
  }

  const busy = pending || createCheckout.isPending || confirmCheckout.isPending || localSubscribe.isPending

  return (
    <>
      <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
        <button
          type="button"
          className={cn(
            "relative cursor-pointer rounded-[22px] border-[1.5px] border-border bg-card p-[22px] text-left transition-colors hover:border-border-strong",
            selected === "six_months" && "border-primary",
          )}
          disabled={busy}
          onClick={() => pick("six_months")}
        >
          <h3>6 months</h3>
          <div className="my-2 text-[26px] font-extrabold tracking-tight">
            ${sixMonthsPrice}{" "}
            <small className="text-[13px] font-medium tracking-normal text-muted-foreground">
              / 6 months
            </small>
          </div>
          <p className="text-[13px] text-muted-foreground">
            No trial. Pay by card. Unlimited products.
          </p>
        </button>
        <button
          type="button"
          className={cn(
            "relative cursor-pointer rounded-[22px] border-[1.5px] border-border bg-card p-[22px] text-left transition-colors hover:border-border-strong",
            selected === "yearly" && "border-primary",
          )}
          disabled={busy}
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
          <p className="text-[13px] text-muted-foreground">
            Same everything, one card payment. No trial.
          </p>
        </button>
      </div>
      <p className={cn(noteClass, "mt-3")}>
        <ShieldIcon className="size-4 shrink-0" />
        <span>
          AI usage runs on your own keys at the providers’ prices. Marketplace fees are theirs.
          Relay’s price is only Relay — paid by card.
        </span>
      </p>
    </>
  )
}

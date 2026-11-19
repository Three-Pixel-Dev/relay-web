import { ShieldIcon } from "lucide-react"
import { useCallback, useState } from "react"

import { StripeEmbeddedCheckout } from "@/features/connections/components/stripe-embedded-checkout"
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
            Card only via Stripe. Test card: 4242 4242 4242 4242 · any future expiry · any CVC.
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
      <div className="sub-plans">
        <button
          type="button"
          className={`plan ${selected === "six_months" ? "on" : ""}`}
          disabled={busy}
          onClick={() => pick("six_months")}
        >
          <h3>6 months</h3>
          <div className="price">
            ${sixMonthsPrice} <small>/ 6 months</small>
          </div>
          <p className="muted small">No trial. Pay by card. Unlimited products.</p>
        </button>
        <button
          type="button"
          className={`plan ${selected === "yearly" ? "on" : ""}`}
          disabled={busy}
          onClick={() => pick("yearly")}
        >
          <span className="chip mint tag">Best value</span>
          <h3>Yearly</h3>
          <div className="price">
            ${yearlyPrice} <small>/ year</small>
          </div>
          <p className="muted small">Same everything, one card payment. No trial.</p>
        </button>
      </div>
      <p className="note" style={{ marginTop: 12 }}>
        <ShieldIcon className="size-4" />
        <span>
          AI usage runs on your own keys at the providers’ prices. Marketplace fees are theirs.
          Relay’s price is only Relay — paid by card through Stripe Checkout.
        </span>
      </p>
    </>
  )
}

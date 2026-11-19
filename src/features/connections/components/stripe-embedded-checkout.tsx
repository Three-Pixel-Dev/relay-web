import { useMemo } from "react"
import { loadStripe, type Stripe } from "@stripe/stripe-js"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"

const stripeCache = new Map<string, Promise<Stripe | null>>()

function stripePromiseFor(publishableKey: string): Promise<Stripe | null> {
  const key = publishableKey.trim()
  let promise = stripeCache.get(key)
  if (!promise) {
    promise = loadStripe(key)
    stripeCache.set(key, promise)
  }
  return promise
}

interface StripeEmbeddedCheckoutProps {
  clientSecret: string
  publishableKey: string
  onComplete: () => void
}

/** Payni-style Embedded Checkout — card form stays on Relay (no redirect). */
export function StripeEmbeddedCheckout({
  clientSecret,
  publishableKey,
  onComplete,
}: StripeEmbeddedCheckoutProps) {
  const stripePromise = useMemo(() => stripePromiseFor(publishableKey), [publishableKey])
  const options = useMemo(
    () => ({
      clientSecret,
      onComplete,
    }),
    [clientSecret, onComplete],
  )

  return (
    <div style={{ width: "100%", minHeight: 420, overflow: "hidden" }}>
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}

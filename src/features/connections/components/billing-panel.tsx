import { fromApiPlan } from "@/shared/services/subscription.service"
import {
  useCancelSubscriptionMutation,
  useCurrentSubscriptionQuery,
  useResumeSubscriptionMutation,
  useSubscriptionHistoryQuery,
} from "@/shared/queries/subscription.query"
import { useSessionStore } from "@/shared/stores/session.store"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"

export function BillingPanel() {
  const accessToken = useSessionStore((s) => s.accessToken)
  const current = useCurrentSubscriptionQuery(Boolean(accessToken))
  const history = useSubscriptionHistoryQuery(Boolean(accessToken))
  const cancel = useCancelSubscriptionMutation()
  const resume = useResumeSubscriptionMutation()
  const showToast = useUiStore((s) => s.showToast)

  if (!accessToken) {
    return <p className="muted small">Sign in to manage billing.</p>
  }

  if (current.isLoading) {
    return <p className="muted small">Loading billing…</p>
  }

  const sub = current.data
  const planLabel = fromApiPlan(sub?.plan)

  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ marginBottom: 8 }}>Billing management</h4>
      {sub ? (
        <div className="stack" style={{ gap: 8 }}>
          <p className="small">
            Plan: <b>{planLabel === "yearly" ? "Yearly" : "6 months"}</b> · Status:{" "}
            <b>{sub.status}</b>
          </p>
          {sub.currentPeriodEnd ? (
            <p className="small muted">
              Current period ends {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              {sub.cancelAtPeriodEnd ? " · cancels at period end" : ""}
            </p>
          ) : null}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!sub.cancelAtPeriodEnd ? (
              <button
                type="button"
                className="btn"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate(undefined, {
                    onSuccess: () => showToast("Will cancel at period end."),
                    onError: (e) => showToast(apiError(e).message),
                  })
                }
              >
                Cancel at period end
              </button>
            ) : (
              <button
                type="button"
                className="btn sun"
                disabled={resume.isPending}
                onClick={() =>
                  resume.mutate(undefined, {
                    onSuccess: () => showToast("Cancellation withdrawn."),
                    onError: (e) => showToast(apiError(e).message),
                  })
                }
              >
                Resume plan
              </button>
            )}
          </div>
        </div>
      ) : (
        <p className="small muted">No active subscription yet. Pick a plan above.</p>
      )}

      {history.data && history.data.length > 0 ? (
        <div style={{ marginTop: 14 }}>
          <h4 style={{ marginBottom: 8 }}>History</h4>
          <ul className="stack" style={{ gap: 6, paddingLeft: 18 }}>
            {history.data.map((row) => (
              <li key={row.id} className="small muted">
                {fromApiPlan(row.plan) === "yearly" ? "Yearly" : "6 months"} · {row.status}
                {row.createdAt ? ` · ${new Date(row.createdAt).toLocaleDateString()}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

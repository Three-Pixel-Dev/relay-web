import { protoBtn } from "@/lib/proto"
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
    return <p className="text-[13px] text-muted-foreground">Sign in to manage billing.</p>
  }

  if (current.isLoading) {
    return <p className="text-[13px] text-muted-foreground">Loading billing…</p>
  }

  const sub = current.data
  const planLabel = fromApiPlan(sub?.plan)

  return (
    <div className="mt-4">
      <h4 className="mb-2">Billing management</h4>
      {sub ? (
        <div className="grid gap-2">
          <p className="text-[13px]">
            Plan: <b>{planLabel === "yearly" ? "Yearly" : "6 months"}</b> · Status:{" "}
            <b>{sub.status}</b>
          </p>
          {sub.currentPeriodEnd ? (
            <p className="text-[13px] text-muted-foreground">
              Current period ends {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              {sub.cancelAtPeriodEnd ? " · cancels at period end" : ""}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {!sub.cancelAtPeriodEnd ? (
              <button
                type="button"
                className={protoBtn({ variant: "ghost" })}
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
                className={protoBtn()}
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
        <p className="text-[13px] text-muted-foreground">No active subscription yet. Pick a plan above.</p>
      )}

      {history.data && history.data.length > 0 ? (
        <div className="mt-3.5">
          <h4 className="mb-2">History</h4>
          <ul className="grid list-disc gap-1.5 pl-[18px]">
            {history.data.map((row) => (
              <li key={row.id} className="text-[13px] text-muted-foreground">
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

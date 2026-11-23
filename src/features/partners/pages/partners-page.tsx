import {
  ArrowUp,
  Mail,
  Shield,
  Sparkles,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"
import { useNavigate } from "react-router"

import { ChipDot, Spin } from "@/components/common/spin"
import { PlansPicker } from "@/components/common/plans-picker"
import { ROUTES } from "@/constants/routes"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { cardClass, fieldClass, labelClass, noteClass, protoBtn, protoChip } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import {
  useAddFromScoutMutation,
  useAddOwnListMutation,
  useBuildForPartnerMutation,
  usePartnersOverviewQuery,
  useRemovePartnerMutation,
  useScoutMutation,
  useSendOutreachMutation,
  useUpdateOutreachMutation,
  useUpdatePartnerStatusMutation,
} from "@/shared/queries/partners.query"
import { useProductsQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import type { OutreachTemplate, Partner, PartnerStatus, ScoutResult } from "@/shared/types/relay"
import { apiError } from "@/util/api-error"
import { fillMessage } from "@/util/outreach"

const STATUS_META: Record<PartnerStatus, { label: string; variant: "sun" | "outline" | "mint" | "lilac" | "default" }> = {
  queued: { label: "Ready to send", variant: "sun" },
  sent: { label: "Sent", variant: "outline" },
  replied: { label: "Replied", variant: "sun" },
  interested: { label: "Interested", variant: "mint" },
  declined: { label: "Not interested", variant: "default" },
  partnered: { label: "Partner", variant: "lilac" },
}

/** Turns a scout/partner source path (instagram.com/x or youtube.com/@x) into an absolute https URL. */
function sourceHref(url?: string | null): string | null {
  if (!url?.trim()) return null
  const cleaned = url.trim().replace(/^https?:\/\//i, "")
  if (!/^(www\.)?(instagram\.com|youtube\.com|youtu\.be)\//i.test(cleaned)) return null
  return `https://${cleaned.replace(/^www\./i, "")}`
}

function SourceLink({ url, className }: { url?: string | null; className?: string }) {
  const href = sourceHref(url)
  if (!href) return null
  const label = href.replace(/^https:\/\//i, "")
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn("text-[12px] text-primary underline-offset-2 hover:underline", className)}
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </a>
  )
}

export function PartnersPage() {
  const navigate = useNavigate()
  const { data: overview, isLoading } = usePartnersOverviewQuery()
  const { data: workspace } = useWorkspaceQuery()
  const { data: catalog } = useCatalogQuery()
  const { data: products = [] } = useProductsQuery()
  const showToast = useUiStore((s) => s.showToast)
  const openModal = useUiStore((s) => s.openModal)
  const closeModal = useUiStore((s) => s.closeModal)

  const scoutMutation = useScoutMutation()
  const addFromScout = useAddFromScoutMutation()
  const removePartner = useRemovePartnerMutation()
  const updateOutreach = useUpdateOutreachMutation()
  const sendOutreach = useSendOutreachMutation()
  const updateStatus = useUpdatePartnerStatusMutation()
  const buildForPartner = useBuildForPartnerMutation()

  const [scoutQ, setScoutQ] = useState("")
  const [plats, setPlats] = useState({ youtube: true, instagram: true })
  const [scoutResults, setScoutResults] = useState<ScoutResult[]>([])
  const [scoutDone, setScoutDone] = useState(false)
  const [selectedHandles, setSelectedHandles] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState<OutreachTemplate | null>(null)

  const partners = overview?.partners ?? []
  const outreach = draft ?? overview?.outreach
  const mailConfigured = overview?.mailConfigured ?? false

  const queued = partners.filter((p) => p.status === "queued")
  const contacted = partners.filter((p) => p.status !== "queued").length
  const replied = partners.filter((p) =>
    ["replied", "interested", "declined", "partnered"].includes(p.status)
  ).length
  const interested = partners.filter((p) => p.status === "interested" || p.status === "partnered").length
  const partnered = partners.filter((p) => p.status === "partnered").length

  const previewCreator = useMemo(() => {
    return (
      queued[0] ||
      partners[0] ||
      scoutResults[0] || {
        name: "Hana Whitfield",
        niche: "motherhood",
        email: "",
        handle: "",
        plat: "instagram" as const,
        followers: "",
        signal: "",
        product: "",
        list: "",
      }
    )
  }, [queued, partners, scoutResults])

  if (isLoading || !overview || !outreach || !workspace || !catalog) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spin /> Loading partners…
      </div>
    )
  }

  function requireSub() {
    openModal({
      title: "Start your plan to find partners",
      body: <PlansPicker onPicked={closeModal} />,
      actions: (
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Not now
        </button>
      ),
    })
  }

  function ensureDraft(): OutreachTemplate {
    if (draft) return draft
    const next = { ...overview!.outreach }
    setDraft(next)
    return next
  }

  function patchOutreach(patch: Partial<OutreachTemplate>) {
    const base = ensureDraft()
    const next = { ...base, ...patch }
    setDraft(next)
  }

  function persistOutreach(patch: Partial<OutreachTemplate>) {
    const next = { ...(draft ?? overview!.outreach), ...patch }
    setDraft(next)
    updateOutreach.mutate(patch, {
      onError: (err) => showToast(apiError(err).message),
    })
  }

  async function runScout() {
    if (!workspace?.sub) {
      requireSub()
      return
    }
    const platforms = (["youtube", "instagram"] as const).filter((p) => plats[p])
    if (!platforms.length) {
      showToast("Pick YouTube or Instagram.")
      return
    }
    setScoutDone(false)
    setScoutResults([])
    try {
      const results = await scoutMutation.mutateAsync({
        query: scoutQ.trim(),
        platforms: [...platforms],
      })
      setScoutResults(results)
      setSelectedHandles(new Set(results.map((r) => r.handle)))
      setScoutDone(true)
      showToast(
        results.length
          ? `${results.length} creators found with an email list.`
          : "No new creators for that search. Try another niche."
      )
    } catch (err) {
      showToast(apiError(err).message)
      setScoutDone(true)
    }
  }

  function togglePlat(plat: "youtube" | "instagram") {
    setPlats((prev) => {
      const next = { ...prev, [plat]: !prev[plat] }
      if (!next.youtube && !next.instagram) next[plat] = true
      return next
    })
  }

  function addSelected() {
    const picks = scoutResults.filter((c) => selectedHandles.has(c.handle))
    if (!picks.length) {
      showToast("Tick at least one creator.")
      return
    }
    addFromScout.mutate(picks, {
      onSuccess: () => {
        showToast(`${picks.length} added. Check the message, then send.`)
        setScoutResults((prev) => prev.filter((c) => !selectedHandles.has(c.handle)))
        setSelectedHandles(new Set())
      },
      onError: (err) => showToast(apiError(err).message),
    })
  }

  function openOwnList() {
    openModal({
      title: "Add your own list",
      body: <OwnListModalBody onAdded={() => closeModal()} />,
    })
  }

  function openSendConfirm() {
    if (!queued.length || !outreach) return
    const first = queued[0]
    openModal({
      title: `Send to ${queued.length} creator${queued.length > 1 ? "s" : ""}?`,
      body: (
        <>
          <p className="mb-3 text-[13px] text-muted-foreground">
            From your mailbox SMTP, one at a time. Two follow-ups on day 3 and day 7 unless they
            reply.
          </p>
          <div className="rounded-md border border-border bg-muted p-3.5">
            <small className="text-muted-foreground">
              To {first.name} &lt;{first.email}&gt;
            </small>
            <b className="mt-1 block">{fillMessage(outreach.subject, first, outreach)}</b>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {fillMessage(outreach.body, first, outreach)}
            </p>
          </div>
        </>
      ),
      actions: (
        <>
          <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
            Not yet
          </button>
          <button
            type="button"
            className={protoBtn()}
            disabled={sendOutreach.isPending}
            onClick={() => {
              sendOutreach.mutate(undefined, {
                onSuccess: (res) => {
                  closeModal()
                  showToast(`${res.sent} sent. Replies show up in step 3.`)
                  if (res.partners.some((p) => p.status === "interested")) {
                    window.setTimeout(() => showToast("A creator replied: interested."), 800)
                  }
                },
                onError: (err) => showToast(apiError(err).message),
              })
            }}
          >
            {sendOutreach.isPending ? <Spin /> : <Mail className="size-4" />} Send
          </button>
        </>
      ),
    })
  }

  function openPartnerModal(partner: Partner) {
    if (!outreach) return
    openModal({
      title: partner.name,
      body: (
        <>
          <p className="mb-3 text-[13px] text-muted-foreground">
            {partner.handle || ""}{" "}
            {partner.followers ? `· ${partner.followers} followers` : ""} · {partner.email}
            {sourceHref(partner.url) ? (
              <>
                <br />
                <SourceLink url={partner.url} />
              </>
            ) : null}
          </p>
          <div className="rounded-md border border-border bg-muted p-3.5">
            <small className="text-muted-foreground">You</small>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {fillMessage(outreach.body, partner, outreach)}
            </p>
          </div>
          {partner.reply ? (
            <div className="mt-2.5 rounded-md border border-success/40 bg-muted p-3.5">
              <small className="text-muted-foreground">{partner.name.split(" ")[0]}</small>
              <p className="mt-1 whitespace-pre-wrap text-sm">{partner.reply}</p>
            </div>
          ) : null}
          <p className="mt-2.5 text-[11px] text-muted-foreground">
            Relay sorted this as “{STATUS_META[partner.status].label.toLowerCase()}”. Change it if
            that is wrong. Answer them from your mailbox.
          </p>
        </>
      ),
      actions: (
        <>
          {partner.status !== "partnered" ? (
            <>
              <button
                type="button"
                className={protoBtn({ variant: "ghost" })}
                onClick={() =>
                  updateStatus.mutate(
                    { id: partner.id, status: "declined" },
                    {
                      onSuccess: () => {
                        closeModal()
                        showToast("Marked not interested.")
                      },
                      onError: (err) => showToast(apiError(err).message),
                    }
                  )
                }
              >
                Not interested
              </button>
              <button
                type="button"
                className={protoBtn({ variant: "ghost" })}
                onClick={() =>
                  updateStatus.mutate(
                    { id: partner.id, status: "interested" },
                    {
                      onSuccess: () => {
                        closeModal()
                        showToast("Marked interested.")
                      },
                      onError: (err) => showToast(apiError(err).message),
                    }
                  )
                }
              >
                Interested
              </button>
            </>
          ) : null}
          {partner.status === "interested" ? (
            <button
              type="button"
              className={protoBtn()}
              disabled={buildForPartner.isPending}
              onClick={() => doBuild(partner.id)}
            >
              {buildForPartner.isPending ? <Spin /> : <Sparkles className="size-4" />} Build their
              product
            </button>
          ) : (
            <button type="button" className={protoBtn()} onClick={closeModal}>
              Close
            </button>
          )}
        </>
      ),
    })
  }

  function doBuild(id: string) {
    buildForPartner.mutate(id, {
      onSuccess: (product) => {
        closeModal()
        showToast("Partner product started.")
        void navigate(ROUTES.build(product.id))
      },
      onError: (err) => showToast(apiError(err).message),
    })
  }

  function connectMailbox() {
    const gmail = catalog.services.find((s) => s.id === "gmail")
    if (gmail) openConnectModal(gmail)
  }

  const todayCap = Math.min(queued.length, outreach.cap)

  return (
    <>
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[32px]">Partners</h1>
          <p className="max-w-[66ch] text-muted-foreground">
            Find creators who already have an email list and no product to sell it. Offer to build
            one from their content and sell it together. When one says yes, you build it here and
            Whop splits every sale.
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metric label="In your list" value={partners.length} hint={`${queued.length} ready to send`} />
        <Metric label="Contacted" value={contacted} hint={`${outreach.cap} a day at most`} />
        <Metric label="Replied" value={replied} hint="follow-ups stop on reply" />
        <Metric
          label="Interested"
          value={interested}
          hint={`${partnered} building or selling`}
        />
      </div>

      <section className={cn(cardClass, "mt-4")}>
        <StepHeader
          n={1}
          title="Find creators"
          desc="Relay looks for a public mention of an email list (bio, About, link in bio, pinned comment) and a public business email."
        />
        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <input
            className={cn(fieldClass, "min-w-[220px] flex-1")}
            placeholder="A niche, e.g. new moms, reactive dogs, budgeting"
            value={scoutQ}
            onChange={(e) => setScoutQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runScout()
            }}
          />
          <span className="inline-flex overflow-hidden rounded-md border border-border">
            {(["youtube", "instagram"] as const).map((plat) => (
              <button
                key={plat}
                type="button"
                className={cn(
                  "px-3 py-2 text-[13px] font-semibold capitalize",
                  plats[plat] ? "bg-primary text-primary-foreground" : "bg-transparent text-muted-foreground"
                )}
                onClick={() => togglePlat(plat)}
              >
                {plat === "youtube" ? "YouTube" : "Instagram"}
              </button>
            ))}
          </span>
          <button
            type="button"
            className={protoBtn()}
            disabled={scoutMutation.isPending}
            onClick={() => void runScout()}
          >
            {scoutMutation.isPending ? (
              <>
                <Spin /> Looking
              </>
            ) : (
              "Find creators"
            )}
          </button>
          <button type="button" className={protoBtn({ variant: "ghost" })} onClick={openOwnList}>
            <ArrowUp className="size-3.5" /> Add my own list
          </button>
        </div>

        {scoutResults.length ? (
          <>
            <div className="mt-3.5 divide-y divide-border rounded-md border border-border">
              {scoutResults.map((c) => (
                <label key={c.handle} className="flex flex-wrap items-start gap-3 px-3 py-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selectedHandles.has(c.handle)}
                    onChange={(e) => {
                      setSelectedHandles((prev) => {
                        const next = new Set(prev)
                        if (e.target.checked) next.add(c.handle)
                        else next.delete(c.handle)
                        return next
                      })
                    }}
                  />
                  <div className="min-w-[180px] flex-1">
                    <b>{c.name}</b>{" "}
                    <span className="text-[13px] text-muted-foreground">
                      {c.handle} · {c.plat === "youtube" ? "YouTube" : "Instagram"} · {c.followers}
                    </span>
                    <small className="mt-0.5 block text-muted-foreground">{c.niche}</small>
                    <SourceLink url={c.url} className="mt-0.5 block" />
                  </div>
                  <div className="min-w-[140px]">
                    <span className={protoChip({ variant: "mint" })}>
                      <ChipDot /> Email list
                    </span>
                    <small className="mt-1 block text-[12px] text-muted-foreground">{c.signal}</small>
                  </div>
                  <div className="min-w-[140px]">
                    <span
                      className={protoChip({
                        variant: /^No/.test(c.product) ? "sun" : "outline",
                      })}
                    >
                      {c.product}
                    </span>
                    <small className="mt-1 block text-[12px] text-muted-foreground">{c.email}</small>
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                className={protoBtn()}
                disabled={addFromScout.isPending}
                onClick={addSelected}
              >
                {addFromScout.isPending ? <Spin /> : null} Add selected to my list
              </button>
              <span className="text-[13px] text-muted-foreground">
                Only creators with a public business email are shown.
              </span>
            </div>
          </>
        ) : scoutMutation.isPending ? (
          <div className="mt-3.5 flex items-center gap-2 text-[13px] text-muted-foreground">
            <Spin /> Reading Instagram profiles, YouTube About pages and links for emails
          </div>
        ) : scoutDone ? (
          <p className="mt-3.5 text-[13px] text-muted-foreground">
            No new creators for that search. Everyone found is already in your list. Try another
            niche.
          </p>
        ) : null}
      </section>

      <section className={cn(cardClass, "mt-4")}>
        <StepHeader
          n={2}
          title="The message"
          desc="One email and two short follow-ups (day 3 and day 7), sent from your own mailbox. Follow-ups stop the moment someone replies."
        />
        <div className="mt-3.5 grid gap-4 md:grid-cols-2 md:items-start">
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Subject</label>
              <input
                className={fieldClass}
                value={outreach.subject}
                onChange={(e) => patchOutreach({ subject: e.target.value })}
                onBlur={(e) => persistOutreach({ subject: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <textarea
                className={cn(fieldClass, "min-h-[230px]")}
                value={outreach.body}
                onChange={(e) => patchOutreach({ body: e.target.value })}
                onBlur={(e) => persistOutreach({ body: e.target.value })}
              />
            </div>
            <details>
              <summary className="cursor-pointer text-[13px] font-semibold text-muted-foreground">
                Follow-ups
              </summary>
              <div className="mt-2.5 flex flex-col gap-3">
                <div>
                  <label className={labelClass}>Day 3</label>
                  <textarea
                    className={fieldClass}
                    value={outreach.f1}
                    onChange={(e) => patchOutreach({ f1: e.target.value })}
                    onBlur={(e) => persistOutreach({ f1: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelClass}>Day 7</label>
                  <textarea
                    className={fieldClass}
                    value={outreach.f2}
                    onChange={(e) => patchOutreach({ f2: e.target.value })}
                    onBlur={(e) => persistOutreach({ f2: e.target.value })}
                  />
                </div>
              </div>
            </details>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <label className={labelClass}>Revenue split you offer (creator / you)</label>
              <span className="inline-flex overflow-hidden rounded-md border border-border">
                {[30, 40, 50, 60].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={cn(
                      "px-3 py-2 text-[13px] font-semibold",
                      outreach.split === n
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground"
                    )}
                    onClick={() => persistOutreach({ split: n })}
                  >
                    {n} / {100 - n}
                  </button>
                ))}
              </span>
            </div>
            <div className="rounded-md border border-border bg-muted p-3.5">
              <small className="text-muted-foreground">Preview to {previewCreator.name}</small>
              <b className="mt-1 block">
                {fillMessage(outreach.subject, previewCreator as Partner | ScoutResult, outreach)}
              </b>
              <p className="mt-2 whitespace-pre-wrap text-sm">
                {fillMessage(outreach.body, previewCreator as Partner | ScoutResult, outreach)}
              </p>
              <small className="mt-2 block text-[11px] text-muted-foreground">
                Unsubscribe line and your address are added automatically.
              </small>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {mailConfigured ? (
                <button
                  type="button"
                  className={protoBtn()}
                  disabled={!queued.length || sendOutreach.isPending}
                  onClick={openSendConfirm}
                >
                  <Mail className="size-4" /> Send to {queued.length} creator
                  {queued.length === 1 ? "" : "s"}
                </button>
              ) : (
                <button type="button" className={protoBtn()} onClick={connectMailbox}>
                  Connect your mailbox
                </button>
              )}
              <span className="text-[13px] text-muted-foreground">
                {queued.length
                  ? `${todayCap} today${queued.length > outreach.cap ? ", the rest tomorrow" : ""}.`
                  : "Add creators in step 1 first."}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className={cn(cardClass, "mt-4")}>
        <StepHeader
          n={3}
          title="Replies and partners"
          desc="Relay reads replies to these emails only and sorts them. When someone is interested, build their product with one click."
        />
        {partners.length ? (
          <div className="mt-3.5 divide-y divide-border rounded-md border border-border">
            {partners.map((c) => {
              const meta = STATUS_META[c.status]
              const product = c.productId ? products.find((p) => p.id === c.productId) : null
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center gap-3 px-3 py-3"
                >
                  <div className="min-w-[160px] flex-1">
                    <b>{c.name}</b>{" "}
                    <span className="text-[13px] text-muted-foreground">
                      {c.handle || c.email}
                      {c.followers ? ` · ${c.followers}` : ""}
                    </span>
                    <small className="mt-0.5 block text-muted-foreground">
                      {c.niche || "From your own list"}
                    </small>
                    <SourceLink url={c.url} className="mt-0.5 block" />
                  </div>
                  <div className="min-w-[160px] flex-1">
                    <span className={protoChip({ variant: meta.variant })}>
                      {meta.variant !== "default" && meta.variant !== "outline" ? <ChipDot /> : null}
                      {meta.label}
                      {c.status === "sent" ? ` · email ${c.step} of 3` : ""}
                    </span>
                    {c.reply ? (
                      <small className="mt-1 block text-[12px] text-muted-foreground">
                        “{c.reply.slice(0, 70)}
                        {c.reply.length > 70 ? "…" : ""}”
                      </small>
                    ) : c.status === "queued" ? (
                      <small className="mt-1 block text-[12px] text-muted-foreground">
                        Waiting for you to send
                      </small>
                    ) : c.status === "sent" ? (
                      <small className="mt-1 block text-[12px] text-muted-foreground">
                        Next follow-up in {c.step === 1 ? 3 : 4} days
                      </small>
                    ) : null}
                  </div>
                  <div className="ml-auto flex flex-wrap justify-end gap-2">
                    {c.status === "interested" ? (
                      <button
                        type="button"
                        className={protoBtn()}
                        disabled={buildForPartner.isPending}
                        onClick={() => doBuild(c.id)}
                      >
                        <Sparkles className="size-3.5" /> Build their product
                      </button>
                    ) : null}
                    {c.status === "partnered" && product ? (
                      <button
                        type="button"
                        className={protoBtn({ variant: "soft" })}
                        onClick={() =>
                          void navigate(
                            product.stage === "build" || product.stage === "paused"
                              ? ROUTES.build(product.id)
                              : ROUTES.product(product.id)
                          )
                        }
                      >
                        {product.stage === "build"
                          ? `Building · step ${product.cur + 1} of 7`
                          : product.publish?.live?.whop
                            ? "Selling on Whop"
                            : "Built"}
                      </button>
                    ) : null}
                    {c.reply ? (
                      <button
                        type="button"
                        className={protoBtn({ variant: "ghost" })}
                        onClick={() => openPartnerModal(c)}
                      >
                        Read
                      </button>
                    ) : null}
                    {c.status === "queued" ? (
                      <button
                        type="button"
                        className={protoBtn({ variant: "danger" })}
                        aria-label="Remove"
                        disabled={removePartner.isPending}
                        onClick={() =>
                          removePartner.mutate(c.id, {
                            onSuccess: () => showToast("Removed."),
                            onError: (err) => showToast(apiError(err).message),
                          })
                        }
                      >
                        <X className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="mt-3.5 text-[13px] text-muted-foreground">
            Nobody yet. Find creators above or add your own list.
          </p>
        )}
      </section>

      <p className={cn(noteClass, "mt-[18px]")}>
        <Shield className="size-4 shrink-0" />
        <span>
          Relay sends one-to-one emails from your mailbox to public business addresses,{" "}
          {outreach.cap} a day at most, each with an unsubscribe line. It promises creators nothing
          about income.
        </span>
      </p>
    </>
  )
}

interface MetricProps {
  label: string
  value: number
  hint: string
}

function Metric({ label, value, hint }: MetricProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-3.5 py-3">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <b className="mt-1 block text-2xl">{value}</b>
      <small className="text-[12px] text-muted-foreground">{hint}</small>
    </div>
  )
}

interface StepHeaderProps {
  n: number
  title: string
  desc: string
}

function StepHeader({ n, title, desc }: StepHeaderProps) {
  return (
    <header className="flex gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {n}
      </span>
      <div>
        <h3>{title}</h3>
        <p className="text-[13px] text-muted-foreground">{desc}</p>
      </div>
    </header>
  )
}

interface OwnListModalBodyProps {
  onAdded: () => void
}

function OwnListModalBody({ onAdded }: OwnListModalBodyProps) {
  const [text, setText] = useState("")
  const addOwnList = useAddOwnListMutation()
  const showToast = useUiStore((s) => s.showToast)
  const closeModal = useUiStore((s) => s.closeModal)

  async function onFile(file: File | null) {
    if (!file) return
    const content = await file.text()
    setText((prev) => (prev ? `${prev}\n${content}` : content))
  }

  return (
    <>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Creators or contacts you already know. One per line: name, email, and optionally their
        YouTube or Instagram link.
      </p>
      <textarea
        id="own"
        className={cn(fieldClass, "min-h-[150px]")}
        placeholder={"Sara Lim, sara@example.com, instagram.com/saracooks\nBen Ode, ben@example.com"}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2.5">
        <label className={labelClass}>Or upload a CSV</label>
        <input
          type="file"
          accept=".csv,.txt"
          onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <div className="mt-[22px] flex flex-wrap justify-end gap-2.5">
        <button type="button" className={protoBtn({ variant: "ghost" })} onClick={closeModal}>
          Cancel
        </button>
        <button
          type="button"
          className={protoBtn()}
          disabled={addOwnList.isPending || !text.trim()}
          onClick={() =>
            addOwnList.mutate(text, {
              onSuccess: (partners) => {
                const before = partners.length
                showToast(before ? "Added from your list." : "No valid emails found.")
                onAdded()
              },
              onError: (err) => showToast(apiError(err).message),
            })
          }
        >
          {addOwnList.isPending ? <Spin /> : null} Add to my list
        </button>
      </div>
    </>
  )
}

import { Bolt, Mail, ShieldIcon, Upload, XIcon } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router"

import { PlansPicker } from "@/components/common/plans-picker"
import { ROUTES } from "@/constants/routes"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import {
  useAddFromScoutMutation,
  useAddOwnListMutation,
  useBuildPartnerMutation,
  useMarkPartnerMutation,
  useOutreachQuery,
  usePartnersQuery,
  useRemovePartnerMutation,
  useScoutMutation,
  useScoutQuery,
  useSendOutreachMutation,
  useUpdateOutreachMutation,
} from "@/shared/queries/partner.query"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { useProductsQuery } from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { fillMessage } from "@/util/outreach"
import type { Partner, PartnerPlatform } from "@/shared/types/relay"

const STATUS: Record<string, [string, string]> = {
  queued: ["Ready to send", "sun"],
  sent: ["Sent", "outline"],
  replied: ["Replied", "sun"],
  interested: ["Interested", "mint"],
  declined: ["Not interested", ""],
  partnered: ["Partner", "lilac"],
}

export function PartnersPage() {
  const { data: partners = [] } = usePartnersQuery()
  const { data: scout = [] } = useScoutQuery()
  const { data: outreach } = useOutreachQuery()
  const { data: workspace } = useWorkspaceQuery()
  const { data: catalog } = useCatalogQuery()
  const { data: products = [] } = useProductsQuery()
  const scoutMut = useScoutMutation()
  const addScout = useAddFromScoutMutation()
  const ownList = useAddOwnListMutation()
  const send = useSendOutreachMutation()
  const remove = useRemovePartnerMutation()
  const mark = useMarkPartnerMutation()
  const build = useBuildPartnerMutation()
  const updateOutreach = useUpdateOutreachMutation()
  const navigate = useNavigate()
  const showToast = useUiStore((state) => state.showToast)
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const [query, setQuery] = useState("")
  const [plats, setPlats] = useState<Record<string, boolean>>({ youtube: true, instagram: true })
  const [picked, setPicked] = useState<Record<string, boolean>>({})
  const o = outreach
  const found = scout.filter((c) => !partners.some((p) => p.handle === c.handle))
  const queued = partners.filter((p) => p.status === "queued")
  const gmail = catalog?.services.find((s) => s.id === "gmail")
  const connectedMail = Boolean(workspace?.services.gmail)

  if (!o) return null

  const previewTarget = queued[0] || partners[0] || found[0]

  function runScout() {
    const platforms = Object.entries(plats)
      .filter(([, on]) => on)
      .map(([id]) => id as PartnerPlatform)
    scoutMut.mutate(
      { query, platforms },
      {
        onSuccess: (results) =>
          showToast(results.length ? `${results.length} creators found with an email list.` : "No new creators for that search."),
        onError: (error) => {
          const parsed = apiError(error)
          if (parsed.code === "SUB_REQUIRED") {
            openModal({
              title: "Choose a plan to find partners",
              body: <PlansPicker onPicked={closeModal} />,
              actions: <button type="button" className="btn ghost" onClick={closeModal}>Not now</button>,
            })
            return
          }
          showToast(parsed.message)
        },
      }
    )
  }

  return (
    <>
      <div className="between" style={{ marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 32 }}>Partners</h1>
          <p className="muted" style={{ maxWidth: "66ch" }}>
            Find creators who already have an email list and no product to sell it. Offer to build
            one from their content and sell it together.
          </p>
        </div>
      </div>
      <div className="metrics" style={{ marginTop: 16 }}>
        <div><span>In your list</span><b>{partners.length}</b><small>{queued.length} ready to send</small></div>
        <div><span>Contacted</span><b>{partners.filter((p) => p.status !== "queued").length}</b><small>{o.cap} a day at most</small></div>
        <div><span>Replied</span><b>{partners.filter((p) => ["replied", "interested", "declined", "partnered"].includes(p.status)).length}</b><small>follow-ups stop on reply</small></div>
        <div><span>Interested</span><b>{partners.filter((p) => p.status === "interested" || p.status === "partnered").length}</b><small>{partners.filter((p) => p.status === "partnered").length} building or selling</small></div>
      </div>

      <div className="card pstep">
        <header>
          <span className="n">1</span>
          <div>
            <h3>Find creators</h3>
            <p className="small muted">Relay looks for a public mention of an email list and a public business email.</p>
          </div>
        </header>
        <div className="row" style={{ marginTop: 14 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runScout()}
            placeholder="A niche, e.g. new moms, reactive dogs, budgeting"
            style={{ flex: 1, minWidth: 220 }}
          />
          <span className="mode">
            <button type="button" className={plats.youtube ? "on" : ""} onClick={() => setPlats((p) => ({ ...p, youtube: !p.youtube || !p.instagram }))}>YouTube</button>
            <button type="button" className={plats.instagram ? "on" : ""} onClick={() => setPlats((p) => ({ ...p, instagram: !p.instagram || !p.youtube }))}>Instagram</button>
          </span>
          <button type="button" className="btn sun" disabled={scoutMut.isPending} onClick={runScout}>
            {scoutMut.isPending ? <span className="spin" /> : null} {scoutMut.isPending ? "Looking" : "Find creators"}
          </button>
          <button
            type="button"
            className="btn ghost"
            onClick={() =>
              openModal({
                title: "Add your own list",
                body: (
                  <OwnListForm
                    onAdd={(lines) =>
                      ownList.mutate(lines, {
                        onSuccess: (res) => {
                          closeModal()
                          showToast(res.count ? `${res.count} added from your list.` : "No valid emails found.")
                        },
                      })
                    }
                  />
                ),
              })
            }
          >
            <Upload className="size-3.5" /> Add my own list
          </button>
        </div>
        {found.length ? (
          <>
            <div className="plist">
              {found.map((creator) => (
                <label className="prow" key={creator.handle}>
                  <input
                    type="checkbox"
                    className="pick"
                    checked={picked[creator.handle] !== false}
                    onChange={(e) =>
                      setPicked((current) => ({ ...current, [creator.handle]: e.target.checked }))
                    }
                  />
                  <div>
                    <b>{creator.name}</b>{" "}
                    <span className="muted small">{creator.handle} · {creator.plat === "youtube" ? "YouTube" : "Instagram"} · {creator.followers}</span>
                    <small>{creator.niche}</small>
                  </div>
                  <div className="sig">
                    <span className="chip mint"><i />Email list</span>
                    <small>{creator.signal}</small>
                  </div>
                  <div className="sig">
                    <span className={`chip ${/^No/.test(creator.product) ? "sun" : "outline"}`}>{creator.product}</span>
                    <small>{creator.email}</small>
                  </div>
                </label>
              ))}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <button
                type="button"
                className="btn sun"
                onClick={() => {
                  const handles = found
                    .map((creator) => creator.handle)
                    .filter((handle) => picked[handle] !== false)
                  if (!handles.length) {
                    showToast("Tick at least one creator.")
                    return
                  }
                  addScout.mutate(handles, {
                    onSuccess: () => {
                      setPicked({})
                      showToast(`${handles.length} added. Check the message, then send.`)
                    },
                  })
                }}
              >
                Add selected to my list
              </button>
              <span className="small muted">Only creators with a public business email are shown.</span>
            </div>
          </>
        ) : scoutMut.isPending ? (
          <div className="progress-lines" style={{ marginTop: 14 }}>
            <div><span className="spin" />Reading bios, About pages and links for email-list mentions</div>
          </div>
        ) : null}
      </div>

      <div className="card pstep">
        <header>
          <span className="n">2</span>
          <div>
            <h3>The message</h3>
            <p className="small muted">One email and two short follow-ups, sent from your own mailbox.</p>
          </div>
        </header>
        <div className="grid-2" style={{ marginTop: 14, alignItems: "start" }}>
          <div className="stack">
            <div>
              <label>Subject</label>
              <input defaultValue={o.subject} onBlur={(e) => updateOutreach.mutate({ subject: e.target.value })} />
            </div>
            <div>
              <label>Email</label>
              <textarea style={{ minHeight: 230 }} defaultValue={o.body} onBlur={(e) => updateOutreach.mutate({ body: e.target.value })} />
            </div>
          </div>
          <div className="stack">
            <div>
              <label>Revenue split you offer (creator / you)</label>
              <span className="mode">
                {[30, 40, 50, 60].map((n) => (
                  <button key={n} type="button" className={o.split === n ? "on" : ""} onClick={() => updateOutreach.mutate({ split: n })}>
                    {n} / {100 - n}
                  </button>
                ))}
              </span>
            </div>
            <div className="preview">
              <small className="muted">Preview to {previewTarget?.name ?? "Hana Whitfield"}</small>
              <b>{fillMessage(o.subject, previewTarget, o)}</b>
              <p style={{ whiteSpace: "pre-wrap" }}>{fillMessage(o.body, previewTarget, o)}</p>
              <small className="dim">Unsubscribe line and your address are added automatically.</small>
            </div>
            <div className="row">
              {connectedMail ? (
                <button
                  type="button"
                  className="btn sun"
                  disabled={!queued.length}
                  onClick={() => {
                    const first = queued[0]
                    openModal({
                      title: `Send to ${queued.length} creator${queued.length > 1 ? "s" : ""}?`,
                      wide: true,
                      body: (
                        <>
                          <p className="muted small" style={{ marginBottom: 12 }}>From your mailbox, one at a time. Two follow-ups unless they reply.</p>
                          {first ? (
                            <div className="preview">
                              <small className="muted">To {first.name} &lt;{first.email}&gt;</small>
                              <b>{fillMessage(o.subject, first, o)}</b>
                              <p style={{ whiteSpace: "pre-wrap" }}>{fillMessage(o.body, first, o)}</p>
                            </div>
                          ) : null}
                        </>
                      ),
                      actions: (
                        <>
                          <button type="button" className="btn ghost" onClick={closeModal}>Not yet</button>
                          <button
                            type="button"
                            className="btn sun"
                            onClick={() => {
                              closeModal()
                              send.mutate(undefined, {
                                onSuccess: (res) => showToast(`${res.sent} sent. Replies show up in step 3.`),
                              })
                            }}
                          >
                            <Mail className="size-4" /> Send
                          </button>
                        </>
                      ),
                    })
                  }}
                >
                  <Mail className="size-4" /> Send to {queued.length} creator{queued.length === 1 ? "" : "s"}
                </button>
              ) : gmail ? (
                <button type="button" className="btn sun" onClick={() => openConnectModal(gmail)}>Connect your mailbox</button>
              ) : null}
              <span className="small muted">{queued.length ? `${Math.min(queued.length, o.cap)} today.` : "Add creators in step 1 first."}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card pstep">
        <header>
          <span className="n">3</span>
          <div>
            <h3>Replies and partners</h3>
            <p className="small muted">When someone is interested, build their product with one click.</p>
          </div>
        </header>
        {partners.length ? (
          <div className="plist">
            {partners.map((partner) => {
              const [lab, cls] = STATUS[partner.status]
              const linked = products.find((p) => p.id === partner.productId)
              return (
                <div className="prow pipe" key={partner.id}>
                  <div>
                    <b>{partner.name}</b>{" "}
                    <span className="muted small">{partner.handle || partner.email}{partner.followers ? ` · ${partner.followers}` : ""}</span>
                    <small>{partner.niche || "From your own list"}</small>
                  </div>
                  <div className="sig">
                    <span className={`chip ${cls}`}>{cls ? <i /> : null}{lab}{partner.status === "sent" ? ` · email ${partner.step} of 3` : ""}</span>
                    {partner.reply ? <small>“{partner.reply.slice(0, 70)}{partner.reply.length > 70 ? "…" : ""}”</small> : null}
                  </div>
                  <div className="row" style={{ justifyContent: "flex-end" }}>
                    {partner.status === "interested" ? (
                      <button
                        type="button"
                        className="btn sun"
                        onClick={() =>
                          build.mutate(
                            { id: partner.id, mode: "guided" },
                            { onSuccess: (res) => navigate(ROUTES.build(res.product.id)) }
                          )
                        }
                      >
                        <Bolt className="size-3.5" /> Build their product
                      </button>
                    ) : null}
                    {partner.status === "partnered" && linked ? (
                      <button
                        type="button"
                        className="btn soft"
                        onClick={() =>
                          navigate(
                            linked.stage === "build" || linked.stage === "paused"
                              ? ROUTES.build(linked.id)
                              : ROUTES.product(linked.id)
                          )
                        }
                      >
                        {linked.stage === "build"
                          ? `Building · step ${linked.cur + 1} of 7`
                          : linked.publish.live.whop
                            ? "Selling on Whop"
                            : "Built"}
                      </button>
                    ) : null}
                    {partner.reply ? (
                      <button type="button" className="btn ghost" onClick={() => openPartner(partner, o, mark, build, navigate)}>
                        Read
                      </button>
                    ) : null}
                    {partner.status === "queued" ? (
                      <button type="button" className="btn danger" aria-label="Remove" onClick={() => remove.mutate(partner.id)}>
                        <XIcon className="size-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="small muted" style={{ marginTop: 14 }}>Nobody yet. Find creators above or add your own list.</p>
        )}
      </div>
      <p className="note" style={{ marginTop: 18 }}>
        <ShieldIcon className="size-4" />
        <span>
          Relay sends one-to-one emails from your mailbox to public business addresses, {o.cap} a
          day at most, each with an unsubscribe line.
        </span>
      </p>
    </>
  )
}

function OwnListForm({ onAdd }: { onAdd: (lines: string) => void }) {
  const closeModal = useUiStore((state) => state.closeModal)
  return (
    <>
      <p className="muted small" style={{ marginBottom: 12 }}>
        One per line: name, email, and optionally their YouTube or Instagram link.
      </p>
      <textarea id="own" style={{ minHeight: 150 }} placeholder="Sara Lim, sara@example.com, instagram.com/saracooks" />
      <div className="actions">
        <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
        <button
          type="button"
          className="btn sun"
          onClick={() => onAdd((document.getElementById("own") as HTMLTextAreaElement | null)?.value ?? "")}
        >
          Add to my list
        </button>
      </div>
    </>
  )
}

function openPartner(
  partner: Partner,
  outreach: { subject: string; body: string; split: number; cap: number; f1: string; f2: string },
  mark: ReturnType<typeof useMarkPartnerMutation>,
  build: ReturnType<typeof useBuildPartnerMutation>,
  navigate: ReturnType<typeof useNavigate>
) {
  const { openModal, closeModal } = useUiStore.getState()
  openModal({
    title: partner.name,
    wide: true,
    body: (
      <>
        <p className="small muted" style={{ marginBottom: 12 }}>{partner.handle} · {partner.email}</p>
        <div className="preview">
          <small className="muted">You</small>
          <p style={{ whiteSpace: "pre-wrap" }}>{fillMessage(outreach.body, partner, outreach)}</p>
        </div>
        <div className="preview" style={{ marginTop: 10, borderColor: "var(--mint)" }}>
          <small className="muted">{partner.name.split(" ")[0]}</small>
          <p>{partner.reply}</p>
        </div>
      </>
    ),
    actions: (
      <>
        {partner.status !== "partnered" ? (
          <>
            <button type="button" className="btn ghost" onClick={() => { mark.mutate({ id: partner.id, status: "declined" }); closeModal() }}>Not interested</button>
            <button type="button" className="btn ghost" onClick={() => { mark.mutate({ id: partner.id, status: "interested" }); closeModal() }}>Interested</button>
          </>
        ) : null}
        {partner.status === "interested" ? (
          <button
            type="button"
            className="btn sun"
            onClick={() => {
              closeModal()
              build.mutate({ id: partner.id, mode: "guided" }, { onSuccess: (res) => navigate(ROUTES.build(res.product.id)) })
            }}
          >
            Build their product
          </button>
        ) : (
          <button type="button" className="btn sun" onClick={closeModal}>Close</button>
        )}
      </>
    ),
  })
}

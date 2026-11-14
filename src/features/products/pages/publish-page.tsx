import { Bolt, Check } from "lucide-react"
import { useEffect } from "react"
import { Link, Navigate, useParams } from "react-router"

import type { ReactNode } from "react"

import { CoverArt } from "@/components/common/cover-art"
import { ServiceLabel } from "@/components/common/service-mark"
import { StageBar } from "@/components/common/stage-bar"
import { ThreadText } from "@/components/common/thread-text"
import { ROUTES } from "@/constants/routes"
import { openConnectModal } from "@/features/connections/components/connect-modal"
import { useCatalogQuery } from "@/shared/queries/catalog.query"
import { usePartnersQuery } from "@/shared/queries/partner.query"
import {
  useEnsurePublishIntroMutation,
  useProductQuery,
  usePublishProceedMutation,
  usePublishSkipMutation,
  usePublishSuggestMutation,
  useSetListingPriceMutation,
  useSetPlatformsMutation,
} from "@/shared/queries/product.query"
import { useWorkspaceQuery } from "@/shared/queries/workspace.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { apiError } from "@/util/api-error"
import { formatTime, money, pagesCount } from "@/util/format"
import type { Product, RelayCatalog } from "@/shared/types/relay"

export function PublishPage() {
  const { id = "" } = useParams()
  const { data: product, isLoading } = useProductQuery(id)
  const { data: catalog } = useCatalogQuery()
  const intro = useEnsurePublishIntroMutation()

  useEffect(() => {
    if (product && product.stage !== "build" && product.publish.step == null) {
      intro.mutate(product.id)
    }
  }, [product?.id, product?.publish.step])

  if (isLoading || !catalog) return null
  if (!product) return <Navigate to={ROUTES.products} replace />
  if (product.stage === "build" || product.stage === "paused") {
    return <Navigate to={ROUTES.build(product.id)} replace />
  }

  return <PublishView product={product} catalog={catalog} />
}

function PublishView({ product, catalog }: { product: Product; catalog: RelayCatalog }) {
  const { data: workspace } = useWorkspaceQuery()
  const { data: partners = [] } = usePartnersQuery()
  const setPlatforms = useSetPlatformsMutation()
  const proceed = usePublishProceedMutation()
  const skip = usePublishSkipMutation()
  const suggest = usePublishSuggestMutation()
  const setPrice = useSetListingPriceMutation()
  const showToast = useUiStore((state) => state.showToast)
  const openModal = useUiStore((state) => state.openModal)
  const closeModal = useUiStore((state) => state.closeModal)
  const pub = product.publish
  const connected = (id: string) => workspace?.services[id]?.status === "connected"
  const partner = partners.find((item) => item.id === product.partnerId)
  const palette = catalog.palettes[product.brand?.palette ?? 0]

  function runProceed() {
    proceed.mutate(product.id, {
      onError: (error) => {
        const parsed = apiError(error)
        if (parsed.code === "CONNECT" && parsed.service) {
          const service = catalog.services.find((s) => s.id === parsed.service)
          if (service) openConnectModal(service)
          return
        }
        showToast(parsed.message)
      },
    })
  }

  const chooser = (
    <div className={`stepcard ${pub.step && pub.step > 0 ? "done" : "live"}`}>
      <header>
        <b>1. Where to sell</b>
        {pub.step && pub.step > 0 ? <span className="chip mint"><i />Done</span> : <span className="chip sun"><i />Your call</span>}
      </header>
      <div className="body">
        <div className="types">
          {catalog.platforms.map((key) => {
            const service = catalog.services.find((s) => s.id === key)!
            const on = pub.platforms.includes(key)
            return (
              <button
                type="button"
                key={key}
                className={`type ${on ? "on" : ""}`}
                disabled={Boolean(pub.step && pub.step > 0)}
                onClick={() => {
                  const next = on ? pub.platforms.filter((p) => p !== key) : [...pub.platforms, key]
                  setPlatforms.mutate({ id: product.id, platforms: next })
                }}
              >
                <b>
                  <ServiceLabel service={service} />
                  {service.main ? <span className="chip sun" style={{ marginLeft: 6 }}>Main store</span> : null}
                </b>
                <small>{service.does}</small>
                <div className="meta">
                  {service.price}
                  {service.kind === "guided" ? " · guided" : connected(key) ? " · connected" : " · connect later"}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  const listings = pub.step && pub.step >= 1 ? (
    <div className={`stepcard ${pub.step > 1 ? "done" : "live"}`}>
      <header>
        <b>2. Listings</b>
        {pub.step > 1 ? <span className="chip mint"><i />Done</span> : pub.status === "running" ? <span className="chip sun"><span className="spin" />Writing</span> : <span className="chip sun"><i />Your call</span>}
      </header>
      <div className="body">
        {Object.keys(pub.listings).length ? (
          <div className="stack">
            {pub.platforms.map((key) => {
              const listing = pub.listings[key]
              const service = catalog.services.find((s) => s.id === key)
              if (!listing || !service) return null
              return (
                <div className="listing-prev" key={key}>
                  <div className="cover">
                    <CoverArt palette={palette} variant={product.brand?.cover ?? 0} title={product.brand?.title ?? ""} />
                  </div>
                  <div>
                    <div className="row" style={{ marginBottom: 6 }}>
                      <ServiceLabel service={service} />
                      <span className="chip sun">{money(listing.price)}</span>
                      {pub.step === 1 ? (
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          defaultValue={listing.price}
                          style={{ width: 90, padding: "6px 8px" }}
                          onChange={(event) =>
                            setPrice.mutate({ id: product.id, platform: key, price: Number(event.target.value) || 1 })
                          }
                        />
                      ) : null}
                    </div>
                    <b>{listing.title}</b>
                    <small>{listing.desc.split("\n")[0]}</small>
                    {listing.tags ? <small>Tags: {listing.tags}</small> : null}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="progress-lines"><div><span className="spin" />Reading buyer keywords</div></div>
        )}
      </div>
    </div>
  ) : null

  let bar = null
  if (product.stage !== "publish" && pub.status === "done") {
    bar = (
      <div className="actionbar">
        <span className="hint">Listed. Now get it seen.</span>
        <Link to={ROUTES.product(product.id)} className="btn ghost">Overview</Link>
        <Link to={ROUTES.distribute(product.id)} className="btn sun">Distribute</Link>
      </div>
    )
  } else if (pub.status === "running") {
    bar = <div className="actionbar"><span className="hint"><span className="spin" /> Relay is working.</span></div>
  } else if (pub.step === 0) {
    bar = (
      <div className="actionbar">
        <span className="hint">{pub.platforms.length ? `${pub.platforms.length} selected.` : "Pick where to sell."}</span>
        <button type="button" className="btn sun" disabled={!pub.platforms.length} onClick={runProceed}>
          <Bolt className="size-4" /> Write the listings
        </button>
      </div>
    )
  } else if (pub.step === 1) {
    bar = (
      <div className="actionbar">
        <span className="hint">Edit prices above if you like.</span>
        <button
          type="button"
          className="btn ghost"
          onClick={() =>
            openModal({
              title: "What should change?",
              body: (
                <>
                  <textarea id="sg" />
                  <div className="actions">
                    <button type="button" className="btn ghost" onClick={closeModal}>Cancel</button>
                    <button
                      type="button"
                      className="btn sun"
                      onClick={() => {
                        const text = (document.getElementById("sg") as HTMLTextAreaElement)?.value.trim()
                        closeModal()
                        if (text) suggest.mutate({ id: product.id, text })
                      }}
                    >
                      Send
                    </button>
                  </div>
                </>
              ),
            })
          }
        >
          Suggest a change
        </button>
        <button type="button" className="btn mint" onClick={runProceed}>
          <Check className="size-4" /> Looks good, list them
        </button>
      </div>
    )
  } else if (pub.step === 2 && pub.current) {
    const service = catalog.services.find((s) => s.id === pub.current)!
    bar = service.kind === "guided" ? (
      <div className="actionbar">
        <span className="hint">Follow the guide for {service.name}, then come back.</span>
        <button type="button" className="btn ghost" onClick={() => skip.mutate(product.id)}>Do it later</button>
        <button type="button" className="btn sun" onClick={runProceed}>I did this</button>
      </div>
    ) : connected(service.id) ? (
      <div className="actionbar">
        <span className="hint">Relay will create the {service.name} listing.</span>
        <button type="button" className="btn ghost" onClick={() => skip.mutate(product.id)}>Skip {service.name}</button>
        <button type="button" className="btn sun" onClick={runProceed}><Bolt className="size-4" /> Proceed</button>
      </div>
    ) : (
      <div className="actionbar">
        <span className="hint">Relay needs your {service.name} account.</span>
        <button type="button" className="btn ghost" onClick={() => skip.mutate(product.id)}>Skip {service.name}</button>
        <button type="button" className="btn sun" onClick={() => openConnectModal(service)}>Connect {service.name}</button>
      </div>
    )
  }

  const shown = new Set<string>()
  const nodes: { key: string; node: ReactNode }[] = []
  const pubMsgs = product.thread.filter((m) =>
    /Where should it sell|Writing listings|Listings written|Live on|Marked|Listed everywhere|Adjusted the listings|Skip |Next: \*\*(Etsy|Gumroad|Whop|Payhip|Amazon KDP|Distribute)|Next one is yours|Looks good\.$|^(Etsy|Gumroad|Whop|Payhip|Amazon KDP)(, |$)|Done\.$/.test(m.text) &&
    !/Profitable pockets|Product type|Structure|Manuscript|Branding|Ready|Pocket|voice/.test(m.text)
  )
  for (const message of pubMsgs) {
    nodes.push({
      key: message.t + message.text.slice(0, 8),
      node: (
        <div className={`msg ${message.who}`}>
          <span className="av">{message.who === "you" ? "YO" : "R"}</span>
          <div className="bubble">
            <ThreadText text={message.text} />
            <small>{formatTime(message.t)}</small>
          </div>
        </div>
      ),
    })
    if (message.who !== "relay") continue
    if (/Where should it sell/.test(message.text) && !shown.has("choose")) {
      shown.add("choose")
      nodes.push({ key: "choose", node: chooser })
    }
    if (/Writing listings/.test(message.text) && !shown.has("list")) {
      shown.add("list")
      nodes.push({ key: "list", node: listings })
    }
  }
  if (!shown.has("choose")) nodes.push({ key: "choose", node: chooser })

  return (
    <>
      <StageBar product={product} />
      <div className="runwrap">
        <div>
          <div className="thread">{nodes.map((item) => <div key={item.key}>{item.node}</div>)}</div>
          {bar}
        </div>
        <aside className="sidecol">
          <div className="card">
            <h3>{product.brand?.title}</h3>
            <div className="cover" style={{ width: 120, margin: "10px 0" }}>
              <CoverArt palette={palette} variant={product.brand?.cover ?? 0} title={product.brand?.title ?? ""} />
            </div>
            <p className="small muted">
              {product.structure.length} sections · {product.words.toLocaleString()} words · {pagesCount(product.words, product.structure.length)} pages
            </p>
          </div>
          <div className="card">
            <h3>Accounts</h3>
            <div className="stack" style={{ marginTop: 10, gap: 8 }}>
              {catalog.platforms
                .map((key) => catalog.services.find((s) => s.id === key)!)
                .filter((s) => s.kind === "oauth")
                .map((service) => (
                  <div className="between small" key={service.id}>
                    <ServiceLabel service={service} />
                    {connected(service.id) ? (
                      <span className="chip mint"><i />On</span>
                    ) : (
                      <button type="button" className="link" onClick={() => openConnectModal(service)}>Connect</button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

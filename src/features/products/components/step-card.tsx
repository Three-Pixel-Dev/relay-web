import { Check, Download, Paperclip } from "lucide-react"
import { Link } from "react-router"

import { CoverArt } from "@/components/common/cover-art"
import { SourceChips } from "@/components/common/source-chips"
import { ROUTES } from "@/constants/routes"
import { openSourceDialog } from "@/features/start/components/source-dialog"
import {
  useAddSectionMutation,
  useAddSourcesMutation,
  useChoosePocketMutation,
  useChooseTypeMutation,
  useRemoveSectionMutation,
  useRemoveSourceMutation,
  useUpdateBrandMutation,
} from "@/shared/queries/product.query"
import { useUiStore } from "@/shared/stores/ui.store"
import { pagesCount } from "@/util/format"
import type { Product, RelayCatalog } from "@/shared/types/relay"

interface StepCardProps {
  product: Product
  index: number
  catalog: RelayCatalog
}

export function StepCard({ product, index, catalog }: StepCardProps) {
  const step = product.steps[index]
  const live = index === product.cur && product.stage === "build"
  const title = catalog.buildSteps[index]
  const status =
    step.status === "done" ? (
      <span className="chip mint"><i />Done</span>
    ) : step.status === "running" ? (
      <span className="chip sun"><span className="spin" />Working</span>
    ) : step.status === "review" || step.status === "gate" ? (
      <span className="chip sun"><i />Your call</span>
    ) : live ? (
      <span className="chip sun"><i />Waiting for you</span>
    ) : (
      <span className="chip">Up next</span>
    )

  return (
    <div className={`stepcard ${step.status === "done" ? "done" : live ? "live" : ""}`} id={`step-${index}`}>
      <header>
        <b>{index + 1}. {title}</b>
        {status}
      </header>
      <div className="body">
        <StepBody product={product} index={index} catalog={catalog} live={live} />
      </div>
    </div>
  )
}

function ProgressLines({ lines }: { lines: string[] }) {
  return (
    <div className="progress-lines">
      {lines.map((line, index) => (
        <div key={`${line}-${index}`}>
          {index < lines.length - 1 ? (
            <span className="ok"><Check className="size-3" /></span>
          ) : (
            <span className="spin" />
          )}
          {line}
        </div>
      ))}
    </div>
  )
}

function StepBody({
  product,
  index,
  catalog,
}: {
  product: Product
  index: number
  catalog: RelayCatalog
  live: boolean
}) {
  const step = product.steps[index]
  const addSources = useAddSourcesMutation()
  const removeSource = useRemoveSourceMutation()
  const choosePocket = useChoosePocketMutation()
  const chooseType = useChooseTypeMutation()
  const addSection = useAddSectionMutation()
  const removeSection = useRemoveSectionMutation()
  const updateBrand = useUpdateBrandMutation()
  const showToast = useUiStore((state) => state.showToast)

  if (index === 0) {
    return (
      <>
        <p className="does">
          {product.input || (product.sources.length ? "Relay takes the subject from the sources." : "No input given; Relay proposes from what sells.")}
          {product.forElse ? (
            <span className="chip lilac" style={{ marginLeft: 6 }}>Built for {product.client || "a client"}</span>
          ) : null}
        </p>
        {product.sources.length ? (
          <SourceChips
            sources={product.sources}
            onRemove={step.status === "done" ? undefined : (id) => removeSource.mutate({ id: product.id, sourceId: id })}
          />
        ) : null}
        {step.status !== "done" && step.status !== "running" ? (
          <button
            type="button"
            className="btn soft"
            style={{ marginTop: 10 }}
            onClick={() =>
              openSourceDialog({
                sources: product.sources,
                onChange: (sources) => {
                  const added = sources.filter((s) => !product.sources.some((p) => p.id === s.id))
                  if (added.length) addSources.mutate({ id: product.id, sources: added })
                },
              })
            }
          >
            <Paperclip className="size-3.5" /> Add sources
          </button>
        ) : null}
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {product.profile ? (
          <div className="profile">
            <div className="between">
              <b>{product.forElse ? "Creator overview" : "What your sources say"}</b>
              <span className="small muted">
                {product.profile.read.videos ? `${product.profile.read.videos} videos · ` : ""}
                {product.profile.read.docs ? `${product.profile.read.docs} docs · ` : ""}
                {product.profile.read.passages.toLocaleString()} passages
              </span>
            </div>
            <div className="kv"><span>Niche</span><b>{product.profile.niche}</b></div>
            <div className="kv"><span>Transformation</span><b>{product.profile.transformation}</b></div>
            <div className="themes">
              {product.profile.themes.map((theme) => (
                <div key={theme.t}>
                  <div className="between">
                    <b>{theme.t}</b>
                    <span className={`chip ${theme.level === "High" ? "mint" : theme.level === "Medium" ? "outline" : "sun"}`}>
                      {theme.level}
                    </span>
                  </div>
                  <small>{theme.d}</small>
                </div>
              ))}
            </div>
            <div className="kv"><span>Verdict</span><b>{product.profile.verdict}</b></div>
            <div className="kv"><span>Audience</span><b>{product.profile.audience}</b></div>
            <div className="kv"><span>Voice</span><b>{product.profile.voice}</b></div>
          </div>
        ) : null}
      </>
    )
  }

  if (index === 1) {
    return (
      <>
        <p className="does">Four pockets where what you know meets what people pay for. Scores are 1–10; open “why” for the sources.</p>
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {product.pockets.length ? (
          <div className="pockets">
            {product.pockets.map((pocket, n) => (
              <div className={`pocket ${pocket.rec ? "rec" : ""}`} key={pocket.h}>
                {pocket.rec ? <span className="chip sun tag">Recommended</span> : null}
                {pocket.grounded ? <span className="chip lilac" style={{ marginBottom: 8 }}>Grounded in your sources</span> : null}
                <h4>{pocket.h}</h4>
                <div className="ind">Industry <b>{pocket.ind}</b> · Niche <b>{pocket.niche}</b></div>
                <div className="kp">
                  <div><span>Specific knowledge</span>{pocket.know}</div>
                  <div><span>Problem solved</span>{pocket.prob}</div>
                </div>
                <div className="scores">
                  <div>Pain<b>{pocket.scores.pain}.0</b></div>
                  <div>Worsening<b>{pocket.scores.worse}.0</b></div>
                  <div>Purchasing power<b>{pocket.scores.power}.0</b></div>
                  <div>Speed<b>{pocket.scores.speed}.0</b></div>
                </div>
                <details>
                  <summary>Why these scores</summary>
                  <ul>{pocket.src.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
                {product.pocket?.h === pocket.h ? (
                  <span className="chip mint"><i />Chosen</span>
                ) : step.status === "review" ? (
                  <button type="button" className="btn sun" onClick={() => choosePocket.mutate({ id: product.id, index: n })}>
                    Use this pocket
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  if (index === 2) {
    return (
      <>
        <p className="does">Pick the shape. Price and length are what the category actually sells for.</p>
        {step.status === "review" || product.type ? (
          <div className="types">
            {catalog.types.map((type) => (
              <button
                type="button"
                key={type.id}
                className={`type ${product.type === type.id ? "on" : ""}`}
                disabled={step.status === "done"}
                onClick={() => chooseType.mutate({ id: product.id, typeId: type.id })}
              >
                <b>{type.name}</b>
                <small>{type.desc}</small>
                <div className="meta">{type.pages} · {type.price}</div>
              </button>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  if (index === 3) {
    return (
      <>
        <p className="does">Each section names the moment it owns, so nothing is filler.</p>
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {product.structure.length ? (
          <div className="toc">
            {product.structure.map((section, k) => (
              <div key={`${section.title}-${k}`}>
                <span className="n">{String(k + 1).padStart(2, "0")}</span>
                <div>
                  <b>{section.title}</b>
                  <small>{section.moment}</small>
                </div>
                {step.status === "review" && !section.text ? (
                  <button type="button" className="link tiny" onClick={() => removeSection.mutate({ id: product.id, index: k })}>
                    Remove
                  </button>
                ) : (
                  <span className={`st ${section.status}`}>
                    {section.status === "done" ? `${section.words} words` : section.status === "live" ? "writing…" : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : null}
        {step.status === "review" ? (
          <div className="row" style={{ marginTop: 10 }}>
            <input id="addsec" placeholder="Add a section (title)" style={{ maxWidth: 360 }} />
            <button
              type="button"
              className="btn soft"
              onClick={() => {
                const value = (document.getElementById("addsec") as HTMLInputElement | null)?.value.trim()
                if (value) addSection.mutate({ id: product.id, title: value })
              }}
            >
              Add
            </button>
          </div>
        ) : null}
      </>
    )
  }

  if (index === 4) {
    const current =
      product.structure.find((s) => s.status === "live") ||
      [...product.structure].reverse().find((s) => s.status === "done")
    return (
      <>
        <p className="does">Written one section at a time in the pocket’s voice. The first one stops for your approval.</p>
        {product.structure.length ? (
          <>
            <div className="manu">
              <div className="toc" style={{ margin: 0 }}>
                {product.structure.map((section, k) => (
                  <div key={section.title} style={{ padding: "8px 10px" }}>
                    <span className="n">{String(k + 1).padStart(2, "0")}</span>
                    <div><b style={{ fontSize: 12.5 }}>{section.title}</b></div>
                    <span className={`st ${section.status}`}>
                      {section.status === "done" ? <Check className="size-3" /> : section.status === "live" ? <span className="spin" /> : null}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text">
                {current ? (
                  <>
                    <h5>{current.title}</h5>
                    {current.text ? current.text.split("\n").slice(1).join("\n").trim() : <span className="spin" />}
                    {current.cites?.length ? (
                      <div className="cites">
                        <Paperclip className="size-3" /> From: {current.cites.join(" · ")}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <span className="dim">Waiting to start.</span>
                )}
              </div>
            </div>
            <div className="wc">
              <span><b>{product.words.toLocaleString()}</b> words written</span>
              <span><b>{product.structure.filter((s) => s.status === "done").length}</b> of {product.structure.length} sections</span>
              <span>~<b>{pagesCount(product.words, product.structure.length)}</b> pages</span>
            </div>
          </>
        ) : null}
      </>
    )
  }

  if (index === 5) {
    const palette = product.brand ? catalog.palettes[product.brand.palette] : null
    return (
      <>
        <p className="does">Palette, type and cover taken from the book’s own subject. Your logo or brand kit can replace them.</p>
        {step.progress ? <ProgressLines lines={step.progress} /> : null}
        {product.brand && palette ? (
          <div className="brand">
            <div>
              <span className="small muted">Brand palette</span>
              <div className="pal" style={{ marginTop: 8 }}>
                {palette.cols.map((col, k) => (
                  <i key={col} style={{ background: col }}>
                    <small>{["page", "type", "accent", "tint", "muted"][k]}</small>
                  </i>
                ))}
              </div>
              <div className="row" style={{ marginTop: 28, gap: 6 }}>
                {catalog.palettes.map((item, k) => (
                  <button
                    type="button"
                    key={item.name}
                    className={`chip ${product.brand?.palette === k ? "sun" : "outline"}`}
                    disabled={step.status === "done"}
                    onClick={() => updateBrand.mutate({ id: product.id, palette: k })}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
              <div className="typo">
                <span className="small muted">Display · {palette.display}</span>
                <div className="d">{product.brand.title}</div>
                <small>Body · {palette.body} · editorial, calm, flat</small>
              </div>
            </div>
            <div>
              <span className="small muted">Cover</span>
              <div className="covers" style={{ marginTop: 8 }}>
                {[0, 1, 2].map((v) => (
                  <button
                    type="button"
                    key={v}
                    className={`cover ${product.brand?.cover === v ? "on" : ""}`}
                    onClick={() => updateBrand.mutate({ id: product.id, cover: v })}
                  >
                    <CoverArt palette={palette} variant={v} title={product.brand!.title} />
                    {product.brand?.cover === v ? <span className="chip sun pick">Chosen</span> : null}
                  </button>
                ))}
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <label htmlFor="btitle" style={{ margin: 0 }}>Title</label>
                <input
                  id="btitle"
                  defaultValue={product.brand.title}
                  disabled={step.status === "done"}
                  onChange={(event) => updateBrand.mutate({ id: product.id, title: event.target.value })}
                />
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  const palette = product.brand ? catalog.palettes[product.brand.palette] : null
  return (
    <>
      <p className="does">Every page laid out, files rendered, mockups made. Yours to download; nothing stays locked in Relay.</p>
      {step.progress ? <ProgressLines lines={step.progress} /> : null}
      {step.status === "done" && product.brand && palette ? (
        <>
          <div className="pages">
            {Array.from({ length: 12 }, (_, k) =>
              k === 0 ? (
                <div className="cov" key="cov">
                  <CoverArt palette={palette} variant={product.brand!.cover} title={product.brand!.title} />
                </div>
              ) : (
                <div key={k}>
                  <i style={{ top: "14%" }} />
                  <i style={{ top: "22%", width: "60%" }} />
                  <i style={{ top: "34%" }} />
                  <i style={{ top: "40%" }} />
                  <i style={{ top: "46%", width: "70%" }} />
                  <i style={{ top: "58%" }} />
                  <i style={{ top: "64%" }} />
                  <span>{k + 1}</span>
                </div>
              )
            )}
          </div>
          <p className="small muted" style={{ marginTop: 6 }}>
            + {pagesCount(product.words, product.structure.length) - 12} more pages · A4 and US Letter
          </p>
          <div className="exports">
            {["PDF", "EPUB", "DOCX (editable)", "Mockups ×6", "Canva-editable"].map((label) => (
              <button key={label} type="button" className="btn soft" onClick={() => showToast(`Prototype: the real ${label} is rendered in production.`)}>
                <Download className="size-3.5" /> {label}
              </button>
            ))}
          </div>
          <div className="handoff">
            <Link to={ROUTES.publish(product.id)}>
              <b>Publish it</b>
              <small>Whop store first: checkout link, affiliates, partner share.</small>
            </Link>
            <button type="button" onClick={() => showToast("Lead-magnet version queued.")}>
              <b>Make a lead-magnet version</b>
              <small>One free page and a landing page to build your list.</small>
            </button>
            <Link to={ROUTES.promote(product.id)}>
              <b>Promote it</b>
              <small>Flip-through Shorts, pins, cover variants.</small>
            </Link>
          </div>
        </>
      ) : null}
    </>
  )
}

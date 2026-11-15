import {
  BUILD_STEPS,
  CHANNELS,
  OUTREACH_DEFAULT,
  PLATFORMS,
  REPLIES,
  SERVICE_CATALOG,
  serviceById,
  typeById,
} from "@/shared/services/mock/catalog"
import {
  brandTitleFromPocket,
  citeFor,
  linkKind,
  linkName,
  listingFor,
  nowISO,
  pagesCount,
  pocketsFor,
  profileFor,
  readLines,
  scoutFor,
  sectionText,
  sleep,
  structureFor,
  uid,
} from "@/shared/services/mock/generators"
import { cloneProduct, getState, patchState } from "@/shared/services/mock/store"
import type {
  AdminStats,
  CreateProductInput,
  PartnerPlatform,
  Product,
  SourceItem,
  SubscriptionPlan,
} from "@/shared/types/relay"

const running = new Set<string>()

function product(id: string) {
  return getState().products.find((item) => item.id === id)
}

function requireProduct(id: string) {
  const found = product(id)
  if (!found) throw new Error("Product not found")
  return found
}

function connected(id: string) {
  return getState().workspace.services[id]?.status === "connected"
}

function say(item: Product, text: string, who: "relay" | "you" = "relay") {
  item.thread.push({ who, text, t: nowISO() })
  item.updated = nowISO()
}

async function progress(item: Product, index: number, lines: string[], ms: number) {
  const step = item.steps[index]
  step.progress = []
  for (const line of lines) {
    if (item.cancelled) return false
    step.progress = [...(step.progress ?? []), line]
    patchState(() => undefined)
    await sleep(ms)
  }
  return true
}

function emptySteps() {
  return Array.from({ length: 7 }, () => ({
    status: "todo" as const,
    note: "",
    progress: null as string[] | null,
  }))
}

export function listWorkspace() {
  return structuredClone(getState().workspace)
}

export function markOnboarded() {
  patchState((state) => {
    state.workspace.seen.onboard = true
  })
  return listWorkspace()
}

export function startSubscription(plan: SubscriptionPlan) {
  patchState((state) => {
    state.workspace.sub = plan
    state.workspace.seen.onboard = true
  })
  return listWorkspace()
}

export function connectService(id: string, label: string) {
  const catalog = serviceById(id)
  if (!catalog || catalog.kind === "guided") {
    throw new Error("This service cannot be connected")
  }
  patchState((state) => {
    state.workspace.services[id] = { status: "connected", label, t: nowISO() }
  })
  return listWorkspace()
}

export function disconnectService(id: string) {
  patchState((state) => {
    delete state.workspace.services[id]
  })
  return listWorkspace()
}

export function listProducts() {
  return getState().products.map(cloneProduct)
}

export function getProduct(id: string) {
  return cloneProduct(requireProduct(id))
}

export function createProduct(input: CreateProductInput) {
  if (!getState().workspace.sub && getState().workspace.role !== "admin") {
    throw Object.assign(new Error("Choose a plan to build a product"), {
      code: "SUB_REQUIRED",
    })
  }
  const sources = (input.sources ?? []).map((source) => ({ ...source }))
  const item: Product = {
    id: uid(),
    input: input.input || "",
    mode: input.mode,
    forElse: Boolean(input.forElse),
    client: input.client ?? "",
    partnerId: input.partnerId ?? null,
    sources,
    profile: null,
    orders: [],
    pockets: [],
    pocket: null,
    type: null,
    structure: [],
    words: 0,
    brand: null,
    stage: "build",
    cur: 0,
    steps: emptySteps(),
    thread: [],
    publish: { platforms: [], listings: {}, live: {}, step: null, status: "todo", current: null },
    distribute: {},
    promote: { videos: [], status: "todo", scheduled: false },
    metrics: { sales: 0, revenue: 0, leads: 0, visits: 0 },
    spend: 0,
    created: nowISO(),
    updated: nowISO(),
  }
  item.steps[0].status = sources.length ? "todo" : "done"
  const ns = sources.length
  say(
    item,
    ns
      ? `Got it${input.input ? `: **${input.input}**` : ""}. ${ns} source${ns > 1 ? "s" : ""} to read first${item.client ? ` for ${item.client}` : ""}. I read them, index every passage so the product can cite it, and show you what I found before anything is written. About $0.25 in AI.`
      : input.input
        ? `Got it: **${input.input}**. Let me find where that is worth money. I read what people search for, what already sells, what reviews complain about, and come back with four profitable pockets.`
        : "No input is fine. I’ll propose pockets from what sells this month."
  )
  patchState((state) => {
    state.products.unshift(item)
  })
  if (item.mode === "fast") {
    void proceedProduct(item.id)
  } else if (!sources.length && item.steps[0].status === "done") {
    advance(item)
    patchState(() => undefined)
  }
  return cloneProduct(item)
}

export function deleteProduct(id: string) {
  patchState((state) => {
    state.products = state.products.filter((item) => item.id !== id)
  })
}

export function addSources(id: string, sources: SourceItem[]) {
  const item = requireProduct(id)
  item.sources.push(...sources)
  if (item.cur === 0 && item.stage === "build") {
    item.profile = null
    if (item.steps[0].status !== "running") item.steps[0].status = "todo"
  }
  patchState(() => undefined)
  return cloneProduct(item)
}

export function removeSource(id: string, sourceId: string) {
  const item = requireProduct(id)
  item.sources = item.sources.filter((source) => source.id !== sourceId)
  if (item.cur === 0 && item.stage === "build") {
    item.profile = null
    if (item.steps[0].status !== "running") item.steps[0].status = "todo"
  }
  patchState(() => undefined)
  return cloneProduct(item)
}

function advance(item: Product) {
  item.cur += 1
  const i = item.cur
  if (i >= BUILD_STEPS.length) return
  item.steps[i].status = "todo"
  const msgs: Record<number, string> = {
    1: "Next: **Profitable pockets**. About $0.30 in AI, a minute.",
    2: "Next: **Product type**.",
    3: "Next: **Structure**. A table of contents with the moment each section owns.",
    4: `Next: **Manuscript**. ${item.structure.length} sections, written one at a time. I stop after the first so you can approve the voice. About $${(item.structure.length * 0.08).toFixed(2)} in AI.`,
    5: "Next: **Branding**. Palette, type and cover from the subject. About $0.40.",
    6: "Next: **Ready**. Pages laid out, PDF, EPUB, DOCX, mockups.",
  }
  if (msgs[i]) say(item, msgs[i])
  if (item.mode === "fast" && [1, 3, 5, 6].includes(i)) {
    setTimeout(() => {
      void proceedProduct(item.id)
    }, 500)
  }
}

export async function proceedProduct(id: string) {
  const item = requireProduct(id)
  if (item.stage !== "build" || running.has(id)) return cloneProduct(item)
  const i = item.cur
  const step = item.steps[i]
  running.add(id)
  try {
    if (i === 0) {
      if (item.sources.length && !item.profile) {
        step.status = "running"
        patchState(() => undefined)
        if (!(await progress(item, i, readLines(item.sources), 850))) return cloneProduct(item)
        item.profile = profileFor(item)
        if (!item.input) item.input = item.profile.niche
        step.progress = null
        step.status = "review"
        item.spend += 0.25
        say(
          item,
          `Read ${item.profile.read.videos ? `${item.profile.read.videos} videos` : ""}${item.profile.read.videos && item.profile.read.docs ? " and " : ""}${item.profile.read.docs ? `${item.profile.read.docs} document${item.profile.read.docs > 1 ? "s" : ""}` : ""}; ${item.profile.read.passages.toLocaleString()} passages indexed. Here is what the sources say. If it matches, I use it to find the pockets and to write in this voice. Uploaded documents take priority over what I infer.`
        )
        patchState(() => undefined)
        return cloneProduct(item)
      }
      step.status = "done"
      advance(item)
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 1) {
      step.status = "running"
      patchState(() => undefined)
      if (
        !(await progress(item, i, [
          "Reading marketplace searches",
          "Counting competing products and prices",
          "Reading review complaints",
          "Scoring pain, urgency, purchasing power, speed",
        ], 800))
      ) {
        return cloneProduct(item)
      }
      item.pockets = pocketsFor(item.input)
      if (item.profile) {
        item.pockets.forEach((pocket, n) => {
          const theme = item.profile!.themes[n % item.profile!.themes.length]
          pocket.src.unshift(
            `Your sources: “${theme.t}” (${theme.level.toLowerCase()} evidence across ${item.profile!.read.passages.toLocaleString()} passages)`
          )
          pocket.grounded = true
        })
      }
      step.progress = null
      step.status = "review"
      item.spend += 0.3
      say(
        item,
        "Your profitable pockets are ready. Start with the one marked Recommended, or pick another. Every score has its sources under “why”."
      )
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 2) {
      step.status = "review"
      say(item, "What shape should it take? Planners and workbooks sell most on Etsy; a guide teaches best; a checklist makes a strong lead magnet.")
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 3) {
      step.status = "running"
      patchState(() => undefined)
      if (
        !(await progress(item, i, [
          "Mapping the method into sections",
          "Naming the moment each section owns",
          "Adding the fill-in pages",
        ], 700))
      ) {
        return cloneProduct(item)
      }
      item.structure = structureFor(item.pocket!, item.type!)
      step.progress = null
      step.status = "review"
      item.spend += 0.1
      say(
        item,
        `${item.structure.length} sections. Each one owns a moment the reader actually faces. Remove any, add your own, then proceed.`
      )
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 4) {
      step.status = "running"
      patchState(() => undefined)
      const first = item.structure.findIndex((section) => section.status !== "done")
      for (let k = first; k < item.structure.length; k += 1) {
        const section = item.structure[k]
        section.status = "live"
        patchState(() => undefined)
        await sleep(900)
        if (item.cancelled) return cloneProduct(item)
        section.text = sectionText(section.title, item.pocket!)
        section.cites = citeFor(item, k)
        section.words =
          180 +
          Math.round(Math.random() * 120) +
          (item.type === "ebook"
            ? 900
            : item.type === "workbook"
              ? 500
              : item.type === "minicourse"
                ? 700
                : 120)
        section.status = "done"
        item.words = item.structure.reduce((n, s) => n + s.words, 0)
        item.spend += 0.08
        patchState(() => undefined)
        if (k === 0 && !step.gatePassed) {
          step.status = "gate"
          say(
            item,
            "The first section is written. Read it. If the voice and depth are right, I write the rest the same way; if not, tell me what to change before I spend on the others."
          )
          patchState(() => undefined)
          return cloneProduct(item)
        }
      }
      step.status = "review"
      say(
        item,
        `All ${item.structure.length} sections written, ${item.words.toLocaleString()} words. Edit any section, or proceed to branding.`
      )
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 5) {
      step.status = "running"
      patchState(() => undefined)
      if (
        !(await progress(item, i, [
          "Reading the subject for colour and mood",
          "Pairing type",
          "Drawing three covers",
        ], 700))
      ) {
        return cloneProduct(item)
      }
      item.brand = { title: brandTitleFromPocket(item.pocket!), palette: 0, cover: 0 }
      step.progress = null
      step.status = "review"
      item.spend += 0.4
      say(item, "Palette, type and three covers, all drawn from the subject. Pick a palette and a cover, or suggest a direction.")
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (i === 6) {
      step.status = "running"
      patchState(() => undefined)
      if (
        !(await progress(item, i, [
          "Laying out pages",
          "Rendering PDF (A4 + US Letter)",
          "Rendering EPUB and DOCX",
          "Making mockups",
        ], 700))
      ) {
        return cloneProduct(item)
      }
      step.progress = null
      step.status = "done"
      item.stage = "publish"
      item.cur = 0
      say(
        item,
        `**${item.brand?.title}** is ready: ${item.structure.length} sections, ${item.words.toLocaleString()} words, ${pagesCount(item)} pages. Files are yours. Next: list it where it sells.`
      )
      patchState(() => undefined)
      return cloneProduct(item)
    }
  } finally {
    running.delete(id)
  }
  return cloneProduct(item)
}

export function approveStep(id: string) {
  const item = requireProduct(id)
  const i = item.cur
  const step = item.steps[i]
  if (i === 4 && step.status === "gate") {
    step.gatePassed = true
    say(item, "Voice approved. Write the rest.", "you")
    patchState(() => undefined)
    void proceedProduct(id)
    return cloneProduct(item)
  }
  if (step.status !== "review") return cloneProduct(item)
  step.status = "done"
  say(item, "Looks good.", "you")
  advance(item)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function choosePocket(id: string, index: number) {
  const item = requireProduct(id)
  item.pocket = item.pockets[index]
  item.steps[1].status = "done"
  say(item, item.pocket.h, "you")
  advance(item)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function chooseType(id: string, typeId: string) {
  const item = requireProduct(id)
  item.type = typeId
  item.steps[2].status = "done"
  say(item, typeById(typeId)?.name ?? typeId, "you")
  advance(item)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function suggestChange(id: string, text: string) {
  const item = requireProduct(id)
  if (!text.trim()) return cloneProduct(item)
  const i = item.cur
  const step = item.steps[i]
  step.note = text.trim()
  say(item, text.trim(), "you")
  if (i === 0) item.profile = null
  if (i === 4) {
    step.gatePassed = false
    item.structure.forEach((section) => {
      section.status = "todo"
      section.text = ""
      section.words = 0
    })
    item.words = 0
  }
  step.status = "todo"
  say(item, `Got it. I’ll redo **${BUILD_STEPS[i].toLowerCase()}** with that. Press Proceed when ready.`)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function cancelProduct(id: string) {
  const item = requireProduct(id)
  item.cancelled = true
  item.stage = "paused"
  say(item, `Paused. Everything so far is kept; $${item.spend.toFixed(2)} spent on AI. Resume from My products.`)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function resumeProduct(id: string) {
  const item = requireProduct(id)
  item.cancelled = false
  item.stage = "build"
  say(item, "Resumed.")
  patchState(() => undefined)
  return cloneProduct(item)
}

export function addSection(id: string, title: string) {
  const item = requireProduct(id)
  item.structure.push({
    title,
    moment: "Your own section",
    words: 0,
    text: "",
    status: "todo",
  })
  patchState(() => undefined)
  return cloneProduct(item)
}

export function removeSection(id: string, index: number) {
  const item = requireProduct(id)
  item.structure.splice(index, 1)
  patchState(() => undefined)
  return cloneProduct(item)
}

export function updateBrand(
  id: string,
  patch: Partial<{ palette: number; cover: number; title: string }>
) {
  const item = requireProduct(id)
  if (!item.brand) return cloneProduct(item)
  if (patch.palette != null) item.brand.palette = patch.palette
  if (patch.cover != null && item.steps[5].status !== "done") item.brand.cover = patch.cover
  if (patch.title != null) item.brand.title = patch.title
  patchState(() => undefined)
  return cloneProduct(item)
}

function partnerOf(item: Product) {
  return item.partnerId
    ? getState().partners.find((partner) => partner.id === item.partnerId)
    : null
}

function splitOf(item: Product) {
  return partnerOf(item)?.split ?? 50
}

function nextPlatform(item: Product) {
  const pub = item.publish
  const left = pub.platforms.filter((k) => !pub.live[k])
  if (!left.length) {
    pub.step = 3
    pub.status = "done"
    item.stage = "distribute"
    say(
      item,
      "Listed everywhere you chose. Next: **Distribute**. Relay runs the channels that bring people; you approve once a week."
    )
    return
  }
  pub.current = left[0]
  const service = serviceById(pub.current)!
  if (service.kind === "guided") {
    say(
      item,
      `Next one is yours: **${service.name}** has no API. Files and copy are prepared; follow the guide, then press I did this.`
    )
  } else {
    say(
      item,
      `Next: **${service.name}**. Relay creates the listing with files, mockups, tags and price${connected(pub.current) ? "." : ", once connected."}`
    )
  }
}

export function ensurePublishIntro(id: string) {
  const item = requireProduct(id)
  const pub = item.publish
  if (pub.step == null) {
    pub.step = 0
    pub.status = "choose"
    if (!pub.platforms.length) pub.platforms = ["whop"]
    if (!item.thread.some((m) => /Where should it sell/.test(m.text))) {
      const partner = partnerOf(item)
      say(
        item,
        `Where should it sell? Whop is your main store: one checkout link, a storefront, affiliates${partner ? `, and ${partner.name}’s share paid automatically` : ""}. Add Etsy for search traffic or Gumroad if you already sell there. Payhip and KDP have no API; Relay prepares everything and guides you.`
      )
    }
    patchState(() => undefined)
  }
  return cloneProduct(item)
}

export function setPublishPlatforms(id: string, platforms: string[]) {
  const item = requireProduct(id)
  item.publish.platforms = platforms.filter((k) => PLATFORMS.includes(k))
  patchState(() => undefined)
  return cloneProduct(item)
}

export function setListingPrice(id: string, platform: string, price: number) {
  const item = requireProduct(id)
  if (item.publish.listings[platform]) {
    item.publish.listings[platform].price = price || 1
  }
  patchState(() => undefined)
  return cloneProduct(item)
}

export async function publishProceed(id: string) {
  const item = requireProduct(id)
  const pub = item.publish
  if (running.has(id)) return cloneProduct(item)
  running.add(id)
  try {
    if (pub.step == null || pub.step === 0) {
      if (!pub.platforms.length) throw new Error("Pick at least one place to sell.")
      pub.step = 1
      say(item, pub.platforms.map((k) => serviceById(k)?.name).join(", "), "you")
      say(
        item,
        `Writing listings for ${pub.platforms.length} platform${pub.platforms.length > 1 ? "s" : ""}: title with buyer keywords, tags, description, price from the research. About $0.20.`
      )
      pub.status = "running"
      patchState(() => undefined)
      await sleep(1800)
      for (const k of pub.platforms) pub.listings[k] = listingFor(item, k)
      item.spend += 0.2
      pub.status = "review"
      say(
        item,
        "Listings written. Prices sit 10% under the category median for launch; raise after the first five reviews. Edit anything, then proceed."
      )
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (pub.step === 1) {
      pub.step = 2
      say(item, "Looks good.", "you")
      pub.status = "todo"
      nextPlatform(item)
      patchState(() => undefined)
      return cloneProduct(item)
    }
    if (pub.step === 2) {
      const k = pub.current
      if (!k) return cloneProduct(item)
      const service = serviceById(k)!
      if (service.kind === "guided") {
        pub.live[k] = "manual upload"
        say(item, "Done.", "you")
        say(item, `Marked ${service.name} as uploaded. Paste the live link later from Product overview.`)
        nextPlatform(item)
        patchState(() => undefined)
        return cloneProduct(item)
      }
      if (!connected(k)) {
        throw Object.assign(new Error(`Connect ${service.name}`), { code: "CONNECT", service: k })
      }
      pub.status = "running"
      patchState(() => undefined)
      await sleep(1600)
      pub.live[k] = `${k}.com/${(item.brand?.title ?? "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 28)}`
      pub.status = "todo"
      const partner = partnerOf(item)
      say(
        item,
        k === "whop"
          ? `Live on Whop: ${pub.live[k]}. Product, files and checkout link are in your store; affiliates are on at 30%${partner ? `; ${partner.name} gets ${splitOf(item)}% of every sale, paid by Whop` : ""}. Every sale comes back to Relay as it happens.`
          : `Live on ${service.name}: ${pub.live[k]}. Files, mockups, tags and price all in. ${k === "etsy" ? "Etsy charged $0.20 for the listing." : ""}`
      )
      nextPlatform(item)
      patchState(() => undefined)
      return cloneProduct(item)
    }
  } finally {
    running.delete(id)
  }
  return cloneProduct(item)
}

export function publishSuggest(id: string, text: string) {
  const item = requireProduct(id)
  if (!text.trim()) return cloneProduct(item)
  say(item, text.trim(), "you")
  say(item, "Adjusted the listings with that. Proceed when ready.")
  patchState(() => undefined)
  return cloneProduct(item)
}

export function publishSkip(id: string) {
  const item = requireProduct(id)
  const k = item.publish.current
  if (!k) return cloneProduct(item)
  item.publish.platforms = item.publish.platforms.filter((x) => x !== k)
  say(item, `Skip ${serviceById(k)?.name} for now.`, "you")
  nextPlatform(item)
  patchState(() => undefined)
  return cloneProduct(item)
}

export async function channelOn(id: string, channelId: string) {
  const item = requireProduct(id)
  item.distribute[channelId] = { setting: true }
  patchState(() => undefined)
  await sleep(1500)
  item.distribute[channelId] = { on: true, week: 0, clicks: 0 }
  patchState(() => undefined)
  return cloneProduct(item)
}

export function channelOff(id: string, channelId: string) {
  const item = requireProduct(id)
  delete item.distribute[channelId]
  patchState(() => undefined)
  return cloneProduct(item)
}

export function weekBatch(id: string) {
  const item = requireProduct(id)
  for (const [key, channel] of Object.entries(item.distribute)) {
    if (!channel.on) continue
    channel.week = (channel.week || 0) + 1
    const catalog = CHANNELS.find((c) => c.id === key)
    const raw = catalog?.nums[1]?.[1] ?? "0"
    const clicks = parseFloat(raw.replace(/[^0-9.]/g, "")) * (raw.includes("k") ? 1000 : 1)
    channel.clicks = Math.round(clicks * Math.min(1, channel.week / 4))
  }
  const on = Object.values(item.distribute).filter((c) => c.on).length
  item.metrics.visits += on * 140 + Math.round(Math.random() * 80)
  item.metrics.leads += item.distribute.leads?.on
    ? 22 + Math.round(Math.random() * 10)
    : Math.round(Math.random() * 3)
  const sales = Math.round(on * 0.9 + Math.random() * 2)
  item.metrics.sales += sales
  item.orders = item.orders || []
  if (item.publish.live.whop) {
    for (let n = 0; n < sales; n += 1) {
      item.orders.unshift({
        t: nowISO(),
        amt: item.publish.listings.whop?.price || 9,
        via: ["Email list", "Pinterest", "Affiliate", "Whop search"][Math.floor(Math.random() * 4)],
      })
    }
  }
  item.orders = item.orders.slice(0, 8)
  item.metrics.revenue = Number(
    (item.metrics.revenue + sales * (Object.values(item.publish.listings)[0]?.price || 9)).toFixed(2)
  )
  patchState(() => undefined)
  return cloneProduct(item)
}

export async function promoStart(id: string) {
  const item = requireProduct(id)
  item.promote.status = "running"
  patchState(() => undefined)
  await sleep(2200)
  item.promote.videos = [{ title: "3 things inside", dur: "0:20", status: "review" }]
  item.promote.status = "gate"
  item.spend += 0.7
  patchState(() => undefined)
  return cloneProduct(item)
}

export async function promoApprove(id: string) {
  const item = requireProduct(id)
  if (item.promote.videos[0]) item.promote.videos[0].status = "done"
  item.promote.status = "running"
  patchState(() => undefined)
  await sleep(2600)
  const titles = [
    "The one decision first",
    "Set the distance",
    "Read the light",
    "Ask for space",
    "Leave early",
    "Recover the walk",
    "14-day plan",
    "Decision sheet",
    "Worksheet tour",
  ]
  for (const title of titles) {
    item.promote.videos.push({
      title,
      dur: `0:${18 + Math.round(Math.random() * 9)}`,
      status: "done",
    })
  }
  item.promote.status = "done"
  item.spend += 6.3
  patchState(() => undefined)
  return cloneProduct(item)
}

export async function promoRedo(id: string) {
  const item = requireProduct(id)
  item.promote.videos = []
  item.promote.status = "todo"
  item.spend += 0.7
  patchState(() => undefined)
  return promoStart(id)
}

export function promoSchedule(id: string) {
  const item = requireProduct(id)
  item.promote.scheduled = true
  patchState(() => undefined)
  return cloneProduct(item)
}

export function listPartners() {
  return structuredClone(getState().partners)
}

export function listScout() {
  return structuredClone(getState().scout)
}

export function getOutreach() {
  return structuredClone(getState().outreach)
}

export function updateOutreach(patch: Partial<typeof OUTREACH_DEFAULT>) {
  patchState((state) => {
    state.outreach = { ...state.outreach, ...patch }
  })
  return getOutreach()
}

export async function runScout(query: string, platforms: PartnerPlatform[]) {
  if (!getState().workspace.sub && getState().workspace.role !== "admin") {
    throw Object.assign(new Error("Choose a plan to find partners"), { code: "SUB_REQUIRED" })
  }
  patchState((state) => {
    state.scout = []
  })
  await sleep(1900)
  const skip = getState().partners.map((p) => p.handle)
  const results = scoutFor(query, platforms, skip)
  patchState((state) => {
    state.scout = results
  })
  return results
}

export function addScoutToList(handles: string[]) {
  patchState((state) => {
    for (const handle of handles) {
      const found = state.scout.find((item) => item.handle === handle)
      if (found && !state.partners.some((p) => p.handle === handle)) {
        state.partners.push({
          ...found,
          id: uid(),
          status: "queued",
          step: 0,
          reply: "",
          productId: null,
          from: "scout",
        })
      }
    }
  })
  return listPartners()
}

export function addOwnList(lines: string) {
  let n = 0
  patchState((state) => {
    for (const line of lines.split(/\n/)) {
      const parts = line.split(",").map((x) => x.trim()).filter(Boolean)
      const email = parts.find((x) => /@.+\./.test(x) && !/instagram|youtu/.test(x))
      if (!email || state.partners.some((p) => p.email === email)) continue
      const link = parts.find((x) => /instagram|youtu/.test(x))
      const name = parts.find((x) => x !== email && x !== link) || email.split("@")[0]
      state.partners.push({
        id: uid(),
        name,
        email,
        handle: link ? linkName(link) : "",
        plat: link ? (linkKind(link) as PartnerPlatform) : "",
        url: link || "",
        followers: "",
        niche: "",
        signal: "",
        status: "queued",
        step: 0,
        reply: "",
        productId: null,
        from: "own",
      })
      n += 1
    }
  })
  return { count: n, partners: listPartners() }
}

export async function sendOutreach() {
  const outreach = getState().outreach
  const queued = getState().partners.filter((p) => p.status === "queued").slice(0, outreach.cap)
  if (!queued.length) return { sent: 0, partners: listPartners() }
  patchState((state) => {
    for (const partner of queued) {
      const live = state.partners.find((p) => p.id === partner.id)
      if (!live) continue
      live.status = "sent"
      live.step = 1
      live.sentAt = nowISO()
    }
  })
  void (async () => {
    await sleep(3200)
    patchState((state) => {
      queued.forEach((partner, k) => {
        const live = state.partners.find((p) => p.id === partner.id)
        if (!live || live.status !== "sent") return
        if (k % 3 === 0) {
          live.status = "interested"
          live.reply = REPLIES.interested[k % REPLIES.interested.length]
        } else if (k % 3 === 2 && k % 2 === 0) {
          live.status = "declined"
          live.reply = REPLIES.declined[k % REPLIES.declined.length]
        }
      })
    })
  })()
  return { sent: queued.length, partners: listPartners() }
}

export function removePartner(id: string) {
  patchState((state) => {
    state.partners = state.partners.filter((p) => p.id !== id)
  })
  return listPartners()
}

export function markPartner(id: string, status: "interested" | "declined") {
  patchState((state) => {
    const partner = state.partners.find((p) => p.id === id)
    if (partner) partner.status = status
  })
  return listPartners()
}

export function buildForPartner(id: string, mode: "guided" | "fast") {
  const partner = getState().partners.find((p) => p.id === id)
  if (!partner) throw new Error("Partner not found")
  const link =
    partner.url ||
    (partner.handle
      ? `${partner.plat === "youtube" ? "youtube.com/" : "instagram.com/"}${partner.handle.replace(/^@/, partner.plat === "youtube" ? "@" : "")}`
      : "")
  const sources: SourceItem[] = link
    ? [
        {
          id: uid(),
          kind: partner.plat || linkKind(link),
          name: partner.handle || linkName(link),
          url: link,
        },
      ]
    : []
  partner.split = getState().outreach.split
  const created = createProduct({
    input: partner.niche || "",
    mode,
    forElse: true,
    client: partner.name,
    sources,
    partnerId: partner.id,
  })
  patchState((state) => {
    const live = state.partners.find((p) => p.id === id)
    if (live) {
      live.status = "partnered"
      live.productId = created.id
    }
  })
  return { product: created, partners: listPartners() }
}

export function adminStats(): AdminStats {
  const products = getState().products
  const outreachSteps = getState().partners.reduce((n, p) => n + (p.step || 0), 0)
  return {
    subscribers: 1284,
    productsBuilt: products.length + 2140,
    listedRate: "71%",
    firstSaleRate: "34%",
    fromSourcesRate: "58%",
    outreachSent: outreachSteps + 18400,
    replyRate: "9%",
    partnerLive:
      products.filter((p) => p.partnerId && p.publish.live.whop).length + 212,
  }
}

export function sampleDocumentName(existing: number) {
  return ["coaching-notes.pdf", "workshop-transcript.docx", "client-faq.txt"][existing % 3]
}

export { SERVICE_CATALOG, pagesCount, splitOf, partnerOf }

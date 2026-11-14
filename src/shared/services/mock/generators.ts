import { PRODUCT_TYPES, typeById } from "@/shared/services/mock/catalog"
import type {
  Listing,
  ManuscriptSection,
  PartnerPlatform,
  Pocket,
  Product,
  ScoutResult,
  SourceItem,
  SourceKind,
  SourceProfile,
} from "@/shared/types/relay"

export function uid() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function nowISO() {
  return new Date().toISOString()
}

export function linkKind(url: string): SourceKind {
  if (/youtu\.?be/i.test(url)) return "youtube"
  if (/instagram\.com|^@/i.test(url)) return "instagram"
  return "web"
}

export function linkName(url: string) {
  const kind = linkKind(url)
  const trimmed = url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
  if (kind === "instagram") {
    const handle = trimmed
      .replace(/^instagram\.com\//, "")
      .replace(/^@/, "")
      .split(/[/?]/)[0]
    return `@${handle}`
  }
  if (kind === "youtube") {
    const handle = trimmed.split("/").pop()?.split("?")[0] ?? trimmed
    return handle.startsWith("@") ? handle : `youtube.com/${handle}`
  }
  return trimmed.slice(0, 40)
}

export function readLines(sources: SourceItem[]) {
  const lines: string[] = []
  const count = (kind: SourceKind) => sources.filter((s) => s.kind === kind).length
  if (count("youtube")) lines.push("YouTube: reading the last 30 videos and their captions")
  if (count("instagram")) {
    lines.push("Instagram: creator approved access with the one-tap link")
    lines.push("Watching the reels and listening to what the creator says")
  }
  if (count("file")) {
    const n = count("file")
    lines.push(`Reading ${n} document${n > 1 ? "s" : ""} and splitting into passages`)
  }
  if (count("web")) lines.push("Reading the linked page")
  lines.push("Indexing passages so every section can cite them")
  lines.push("Summarising niche, themes, voice and audience")
  return lines
}

export function pocketsFor(text: string): Pocket[] {
  const t = (text || "").toLowerCase()
  if (/dog|pet|puppy|leash/.test(t)) {
    return [
      {
        h: "I help owners of reactive rescue dogs pass people and other dogs more calmly without forcing close encounters or abandoning neighbourhood walks",
        ind: "Pet care",
        niche: "Calm leash walking for reactive dogs",
        know: "Distance management, trigger observation, emergency turns, reinforcement timing, gradual exposure.",
        prob: "Owners avoid walks because barking and lunging are stressful in public; they want practical ways to create distance and finish safer walks.",
        scores: { pain: 9, worse: 9, power: 9, speed: 7 },
        src: [
          "Etsy: 1,900 searches/mo for “reactive dog”",
          "620 competing digital listings, median $8.50",
          "Top complaint in reviews: “too generic, no walk plan”",
        ],
        rec: true,
      },
      {
        h: "I help first-time rescue adopters get through the first 30 days without the dog shutting down or the family giving up",
        ind: "Pet care",
        niche: "First 30 days with a rescue dog",
        know: "Decompression, routine building, early signals, when to call a trainer.",
        prob: "New adopters panic in week two and return dogs; a day-by-day plan reduces that.",
        scores: { pain: 8, worse: 7, power: 8, speed: 8 },
        src: [
          "Etsy: 2,400 searches/mo for “new dog checklist”",
          "3,100 listings, median $4.20",
          "Reddit r/rescuedogs: 40+ posts/week asking the same question",
        ],
      },
      {
        h: "I help apartment dog owners build a 20-minute indoor routine that keeps the dog calm on rainy days",
        ind: "Pet care",
        niche: "Indoor enrichment routines",
        know: "Scent games, settle training, food puzzles, timing.",
        prob: "Bored dogs destroy things; owners want a routine, not a list of toys.",
        scores: { pain: 6, worse: 6, power: 7, speed: 9 },
        src: [
          "Etsy: 880 searches/mo",
          "1,200 listings, median $5",
          "Pinterest: “indoor dog games” 110k monthly searches",
        ],
      },
      {
        h: "I help senior-dog owners adapt walks, food and home layout as mobility declines",
        ind: "Pet care",
        niche: "Senior dog care at home",
        know: "Joint-friendly routines, ramps, diet adjustments, vet checkpoints.",
        prob: "Owners don’t notice decline until a fall; a staged guide helps earlier.",
        scores: { pain: 7, worse: 8, power: 8, speed: 6 },
        src: [
          "Etsy: 560 searches/mo",
          "390 listings, median $6.90",
          "High purchasing power: senior-dog owners spend 2.3× on care",
        ],
      },
    ]
  }
  if (/money|budget|finance|payday|debt|saving/.test(t)) {
    return [
      {
        h: "I help single-income households stop running out of money before payday without cutting essential bills or tracking every purchase by hand",
        ind: "Personal finance",
        niche: "Stopping monthly budget shortfalls before payday",
        know: "Paycheck timing, recurring bill mapping, spending categories, cash buffer planning.",
        prob: "Households pay every bill yet run short because expenses arrive unevenly.",
        scores: { pain: 9, worse: 9, power: 8, speed: 8 },
        src: [
          "Etsy: 6,400 listings for “budget planner”, median $5.10",
          "Searches up 22% in 90 days",
          "Top complaint: “too many pages I don’t use”",
        ],
        rec: true,
      },
      {
        h: "I help freelancers set aside the right amount for tax every month without a spreadsheet",
        ind: "Personal finance",
        niche: "Freelancer tax set-aside",
        know: "Effective rate estimation, quarterly timing, separate account rules.",
        prob: "Freelancers get a tax bill they can’t pay once a year.",
        scores: { pain: 9, worse: 7, power: 9, speed: 7 },
        src: [
          "Etsy: 410 listings, median $7.80",
          "r/freelance: weekly “how much to save” threads",
          "Low competition for a planner-style product",
        ],
      },
      {
        h: "I help couples run one monthly money meeting without an argument",
        ind: "Personal finance",
        niche: "Couples money meeting",
        know: "Agenda design, shared categories, decision rules.",
        prob: "Money fights come from no shared process, not from the numbers.",
        scores: { pain: 8, worse: 6, power: 8, speed: 8 },
        src: [
          "Etsy: 1,100 listings, median $6",
          "Pinterest: “couples budget” 70k searches/mo",
        ],
      },
      {
        h: "I help parents teach kids 8–12 to manage a weekly allowance with one page a week",
        ind: "Personal finance",
        niche: "Kids allowance system",
        know: "Three-jar method, weekly review, age-appropriate goals.",
        prob: "Parents want to teach money but have no structure.",
        scores: { pain: 5, worse: 5, power: 8, speed: 9 },
        src: [
          "Etsy: 2,300 listings, median $3.90",
          "Seasonal peak: back to school",
        ],
      },
    ]
  }
  if (/mom|mum|mother|baby|parent|newborn/.test(t)) {
    return [
      {
        h: "I help new moms agree on clear household ownership with their partners without assigning every task or becoming the family reminder service",
        ind: "Parenting",
        niche: "Sharing household responsibility after a first baby",
        know: "Invisible labour, end-to-end task ownership, practical household negotiation, review dates.",
        prob: "A partner helps when asked, but mom still notices, plans, delegates and follows up. Couples want a way to hand over whole responsibilities.",
        scores: { pain: 9, worse: 8, power: 8, speed: 8 },
        src: [
          "Etsy: 1,300 searches/mo for “chore chart couples”, median $5.80",
          "Reviews of the top books ask for “a worksheet, not 300 pages”",
          "r/beyondthebump: weekly threads on the mental load",
        ],
        rec: true,
      },
      {
        h: "I help first-time moms in small homes decide which baby items to keep, skip or borrow without buying every trending product",
        ind: "Parenting",
        niche: "Baby gear decisions for small homes",
        know: "Needs-based gear evaluation, product-function overlap, safety essentials.",
        prob: "Parents buy for every scenario the feed shows them and run out of space and money.",
        scores: { pain: 7, worse: 7, power: 9, speed: 9 },
        src: [
          "Etsy: 2,900 searches/mo for “baby registry checklist”",
          "4,800 listings, median $4.10",
          "High purchasing power in the first-baby window",
        ],
      },
      {
        h: "I help first-time moms plan errands around feeding and rest needs without scheduling every minute",
        ind: "Parenting",
        niche: "Flexible outings with an infant",
        know: "Responsive infant care, flexible sequencing, contingency planning.",
        prob: "One unexpected nap or feed ruins the day; moms stop leaving the house.",
        scores: { pain: 8, worse: 6, power: 7, speed: 9 },
        src: [
          "Pinterest: “newborn routine” 240k searches/mo",
          "Etsy: 1,700 listings, median $4.90",
        ],
      },
      {
        h: "I help new moms stop reopening settled parenting decisions after scrolling social media",
        ind: "Parenting",
        niche: "Decision confidence in early motherhood",
        know: "Decision records, source filtering, values-first rules.",
        prob: "Every influencer reopens a decision already made; it costs sleep and confidence.",
        scores: { pain: 8, worse: 8, power: 7, speed: 7 },
        src: [
          "Etsy: 380 listings, median $6.40",
          "Low competition, strong fit with a workbook",
        ],
      },
    ]
  }
  const fallback = text.trim().replace(/\.$/, "")
  return [
    {
      h: `I help ${fallback ? `people who care about ${fallback}` : "busy adults"} get a clear weekly system without a 300-page course`,
      ind: "Self-improvement",
      niche: "Weekly systems",
      know: "Breaking a goal into weekly actions, review rituals, friction removal.",
      prob: "People know what to do and don’t do it; a system beats motivation.",
      scores: { pain: 8, worse: 7, power: 8, speed: 8 },
      src: [
        "Etsy: 4,100 listings in the nearest category, median $5.40",
        "Searches up 18% in 90 days",
        "Reviews ask for “less theory, more pages I can use”",
      ],
      rec: true,
    },
    {
      h: "I help beginners get their first result in 14 days with a day-by-day checklist",
      ind: "Self-improvement",
      niche: "14-day starter plan",
      know: "Sequencing, minimum viable daily action, checkpoints.",
      prob: "Beginners quit in week one because the first steps are unclear.",
      scores: { pain: 7, worse: 6, power: 7, speed: 9 },
      src: [
        "Etsy: 2,800 listings, median $4.60",
        "Strong fit for a checklist or workbook",
      ],
    },
    {
      h: "I help people who already tried and failed restart without repeating the same mistakes",
      ind: "Self-improvement",
      niche: "Restart after failure",
      know: "Failure review, environment design, smaller promises.",
      prob: "Second attempts fail the same way as first ones.",
      scores: { pain: 8, worse: 7, power: 7, speed: 7 },
      src: ["Etsy: 900 listings, median $6.20", "Low competition, high pain"],
    },
    {
      h: "I help small teams adopt the method together in one month",
      ind: "Business",
      niche: "Team adoption kit",
      know: "Roles, weekly cadence, shared tracker.",
      prob: "Individuals adopt, teams don’t; a kit makes it shared.",
      scores: { pain: 6, worse: 6, power: 9, speed: 6 },
      src: [
        "Gumroad: template packs $19–39 sell well to teams",
        "Higher price point, smaller audience",
      ],
    },
  ]
}

export function structureFor(pocket: Pocket, typeId: string): ManuscriptSection[] {
  const dog = [
    ["Introduction", "Why the usual advice fails and what this gives you instead"],
    ["Choose the route before the trigger arrives", "The pre-walk decision that sets up everything after"],
    ["Set distance, not your dog’s threshold", "Distance as the control variable, three zones"],
    ["Read the light before you commit", "Early signals that tell you to turn, wait or go"],
    ["Ask for space without explaining", "Scripts for people who don’t get it"],
    ["Leave early, not after the explosion", "Exit timing and emergency turns"],
    ["Recover the walk, not just the moment", "Getting back to calm and finishing"],
    ["Practice consistency before progress", "What to repeat for 14 days"],
    ["Conclusion", "What changes in a month and what doesn’t"],
    ["Neighbourhood walk decision sheet", "One-page planner"],
    ["Trigger walk planning worksheet", "Fill-in page used every walk"],
  ]
  const generic = [
    ["Introduction", "Why the usual advice fails and what this gives you instead"],
    ["The one decision that matters first", "Where most people go wrong on day one"],
    ["Set the controllable variable", "What you can actually change this week"],
    ["Read the early signals", "How to know before it goes wrong"],
    ["Scripts for the hard moments", "Exact words and moves"],
    ["Exit early, recover fast", "Damage control that works"],
    ["The 14-day consistency plan", "What to repeat"],
    ["Conclusion", "What changes in a month"],
    ["Decision sheet", "One page, every time"],
    ["Planning worksheet", "Fill-in page"],
  ]
  const list = /dog/i.test(pocket.h) ? dog : generic
  const n = typeById(typeId)?.sections ?? 9
  return list.slice(0, n).map(([title, moment]) => ({
    title,
    moment,
    words: 0,
    text: "",
    status: "todo",
  }))
}

export function sectionText(title: string, pocket: Pocket) {
  return `${title}\n\nIt is 6:40 p.m., the leash is in hand, and the route still has not been decided. That is where a lot of these moments go off the rails.\n\nBy the time a person steps out of the door, the real decision is already late. The wrong turn was made earlier, when the plan was still vague. After that, every surprise feels larger than it should because there is no spare space left to work with.\n\nThis section is for the ${pocket.ind.toLowerCase()} reader who keeps trying to make ordinary days work without turning them into drills or emergencies. The goal is simple: ${pocket.h.replace(/^I help /, "").split(" without ")[0]}.\n\nThe real problem is usually not effort. It is sequencing. Most attempts begin with too little room and too much improvisation. Fix the sequence and the effort starts to count.\n\nWhat to do this week\n1. Decide the route before you start, not when the problem appears.\n2. Pick one distance you will protect and protect it every time.\n3. Leave early once, on purpose, and notice that nothing bad happened.`
}

export function profileFor(product: Product): SourceProfile {
  const t = `${product.input} ${product.sources.map((s) => s.name).join(" ")}`.toLowerCase()
  const docs = product.sources.filter((s) => s.kind === "file").length
  const vids = product.sources.filter((s) => s.kind !== "file").length
  const read = {
    videos: vids ? 28 + vids * 4 : 0,
    docs,
    passages: docs * 140 + vids * 210,
  }
  if (/dog|pet|puppy|leash/.test(t)) {
    return {
      read,
      niche: "Calm walking for reactive rescue dogs",
      transformation:
        "Helps owners finish ordinary neighbourhood walks without forcing close encounters.",
      themes: [
        {
          t: "Distance before obedience",
          d: "Most material is about creating and protecting space, with repeatable rules. Clear expertise, maps directly to a paid guide.",
          level: "High",
        },
        {
          t: "Owner confidence in public",
          d: "Scripts for asking strangers for space and handling judgement. Relatable; supports a workbook.",
          level: "Medium-high",
        },
        {
          t: "Rescue-dog backstories",
          d: "Engaging, but less tightly defined as a paid offer.",
          level: "Medium",
        },
      ],
      verdict:
        "The clearest paid product is a practical walk plan built on the distance rules, with fill-in sheets.",
      audience: "Owners of reactive rescue dogs, mostly first-time adopters.",
      voice: "Calm, direct, practical, no jargon. Uses real walk stories.",
    }
  }
  if (/money|budget|finance|payday|debt|saving/.test(t)) {
    return {
      read,
      niche: "Single-income budgeting without the payday panic",
      transformation:
        "Helps households stop running short before payday without tracking every purchase.",
      themes: [
        {
          t: "Bill timing and buffers",
          d: "A consistent method around uneven expenses. Translates into a planner.",
          level: "High",
        },
        {
          t: "No-shame money talk",
          d: "Emotional framing that builds trust; supports the product voice.",
          level: "Medium-high",
        },
        {
          t: "Frugal recipes and swaps",
          d: "Popular, but off the core method.",
          level: "Medium",
        },
      ],
      verdict:
        "The clearest paid product is the buffer system as a planner with a monthly setup page.",
      audience: "Single-income households, mostly parents.",
      voice: "Warm, plain, a little funny. Uses own numbers as examples.",
    }
  }
  if (product.input && !/mom|mum|mother|baby|parent|newborn/.test(t)) {
    const n = product.input.trim().replace(/\.$/, "")
    const short = n.length > 60 ? `${n.slice(0, 57)}…` : n
    return {
      read,
      niche: short,
      transformation: `Helps their audience get a clear, repeatable result in ${short.toLowerCase()} without a long course.`,
      themes: [
        {
          t: "The core method",
          d: "The same steps come back across most of the material, with examples. Clear expertise that maps directly to a paid guide or workbook.",
          level: "High",
        },
        {
          t: "Common mistakes and fixes",
          d: "Frequent, specific and well received. Supports checklists and fill-in pages.",
          level: "Medium-high",
        },
        {
          t: "Personal stories",
          d: "Engaging and good for voice, but less tightly defined as a paid offer.",
          level: "Medium",
        },
      ],
      verdict:
        "The clearest paid product is the core method as a step-by-step workbook, with the common mistakes as checklists.",
      audience: "Beginners and people who tried once and stalled.",
      voice: "Plain, practical and encouraging. Teaches through real examples.",
    }
  }
  return {
    read,
    niche: "Low-maintenance motherhood",
    transformation:
      "Helps moms let go of unnecessary pressure and make motherhood feel more relaxed, enjoyable and manageable.",
    themes: [
      {
        t: "Low-maintenance baby care and gear",
        d: "Practical advice about baby care, registry choices and resisting unnecessary parenting trends. Clear, specific expertise that can translate into a paid guide.",
        level: "High",
      },
      {
        t: "Letting go of mom guilt and pressure",
        d: "Addresses emotional strain, social media pressure and the effort to enjoy motherhood. Relatable; could support paid resources.",
        level: "Medium-high",
      },
      {
        t: "Stronger family and social relationships",
        d: "Advice on marriage and making time for each child. Less tightly defined as a paid offer.",
        level: "Medium",
      },
    ],
    verdict:
      "The clearest paid product is practical guidance for making early motherhood simpler, supported by the broader message of reducing pressure.",
    audience: "New and first-time moms looking for a more relaxed approach.",
    voice:
      "Direct, candid, conversational and often humorous, balanced by reassurance. Uses personal mistakes and anecdotes.",
  }
}

export function citeFor(product: Product, index: number) {
  const sources = product.sources
  if (!sources.length) return []
  const a = sources[index % sources.length]
  const b = sources[(index + 1) % sources.length]
  const one = (source: SourceItem) => {
    if (source.kind === "file") return `${source.name}, p. ${3 + index * 4}`
    if (source.kind === "web") return source.name
    return `${source.name}, ${source.kind === "youtube" ? "video" : "reel"} ${1 + ((index * 3) % 9)} at ${1 + (index % 4)}:${String((10 + index * 7) % 50).padStart(2, "0")}`
  }
  if (sources.length > 1 && a !== b) return [one(a), one(b)]
  return [one(a)]
}

export function listingFor(product: Product, platform: string): Listing {
  const title = product.brand?.title ?? "Untitled"
  const type = product.type
  const priceMap: Record<string, Record<string, number>> = {
    etsy: {
      planner: 6.99,
      checklist: 3.99,
      workbook: 14.99,
      minicourse: 24.99,
      default: 11.99,
    },
    gumroad: {
      planner: 7,
      checklist: 4,
      workbook: 15,
      minicourse: 27,
      default: 12,
    },
    whop: {
      planner: 9,
      checklist: 5,
      workbook: 19,
      minicourse: 29,
      default: 14,
    },
  }
  const prices = priceMap[platform]
  const price = prices?.[type ?? ""] ?? prices?.default ?? 9
  const typeName = PRODUCT_TYPES.find((item) => item.id === type)?.name.toLowerCase() ?? "guide"
  if (platform === "etsy") {
    return {
      title: `${title} | Printable PDF Guide | ${product.pocket?.niche} | Instant Download | A4 + US Letter`,
      price,
      tags: `${product.pocket?.niche.toLowerCase()}, ${product.pocket?.ind.toLowerCase()}, printable pdf, instant download, digital guide, ${typeName}, a4, letter, workbook pages, beginner friendly, step by step, planner insert, checklist`,
      desc: `${product.pocket?.h}.\n\nWhat you get: ${product.structure.length} sections, ${product.words.toLocaleString()} words, fill-in pages, A4 and US Letter PDFs. Instant download after purchase.\n\nMade with AI assistance and edited by the author. Personal use licence.`,
    }
  }
  if (platform === "gumroad") {
    return {
      title,
      price,
      tags: "",
      desc: `${product.pocket?.h}.\n\n${product.structure.length} sections · ${product.words.toLocaleString()} words · PDF + EPUB.\n\nPay what you want above the minimum; 30-day refund.`,
    }
  }
  if (platform === "whop") {
    return {
      title,
      price,
      tags: "",
      desc: `${product.pocket?.h}.\n\nIncludes the PDF, EPUB, the planning sheets, and updates for a year. Affiliates earn 30%.`,
    }
  }
  return { title, price: 9, tags: "", desc: product.pocket?.h ?? "" }
}

export function pagesCount(product: Product) {
  return Math.max(4, Math.round(product.words / 320) + product.structure.length + 2)
}

export function brandTitleFromPocket(pocket: Pocket) {
  return pocket.h
    .replace(/^I help /, "")
    .split(" without ")[0]
    .replace(/^(\w)/, (c) => c.toUpperCase())
}

const SCOUT_POOL: ScoutResult[] = [
  {
    name: "Hana Whitfield",
    handle: "@slowmotherhood.hana",
    plat: "instagram",
    followers: "76k",
    niche: "Low-maintenance motherhood",
    signal: "Bio: “Join 6,000 moms on my Sunday letter”",
    list: "6,000",
    product: "No paid product found",
    email: "hello@slowmotherhood.example",
  },
  {
    name: "Tom Arkwright",
    handle: "@reactivedogdad",
    plat: "youtube",
    followers: "41k",
    niche: "Reactive dog training",
    signal: "About: “Free weekly training email ↓” (beehiiv link)",
    list: "not stated",
    product: "No paid product found",
    email: "tom@reactivedogdad.example",
  },
  {
    name: "Priya Nandakumar",
    handle: "@onepaycheckhome",
    plat: "instagram",
    followers: "128k",
    niche: "Single-income budgeting",
    signal: "Link in bio → Kit signup form, “11k subscribers”",
    list: "11,000",
    product: "Sells one $5 printable",
    email: "priya@onepaycheckhome.example",
  },
  {
    name: "Marco Estévez",
    handle: "@studywithmarco",
    plat: "youtube",
    followers: "212k",
    niche: "Exam technique for college students",
    signal: "Pinned comment: “Join the newsletter for my recall sheets”",
    list: "not stated",
    product: "No paid product found",
    email: "team@studywithmarco.example",
  },
  {
    name: "Greta Lindqvist",
    handle: "@adhd.at.work",
    plat: "instagram",
    followers: "54k",
    niche: "ADHD routines for adults",
    signal: "Bio: “Free Friday email, 3 ideas”",
    list: "not stated",
    product: "No paid product found",
    email: "greta@adhdatwork.example",
  },
  {
    name: "Devon Brooks",
    handle: "@firstgardenyear",
    plat: "youtube",
    followers: "33k",
    niche: "Beginner vegetable gardening",
    signal: "About: Substack link, “4,200 readers”",
    list: "4,200",
    product: "No paid product found",
    email: "devon@firstgardenyear.example",
  },
  {
    name: "Aiko Tanabe",
    handle: "@calmclassroom.aiko",
    plat: "instagram",
    followers: "89k",
    niche: "Classroom management for new teachers",
    signal: "Story highlight “Newsletter”, link to beehiiv",
    list: "not stated",
    product: "Sells lesson plans on TPT",
    email: "aiko@calmclassroom.example",
  },
  {
    name: "Luis Carvalho",
    handle: "@weddingonabudget.luis",
    plat: "youtube",
    followers: "67k",
    niche: "Budget wedding planning",
    signal: "Description: “Get my free checklist by email”",
    list: "not stated",
    product: "No paid product found",
    email: "luis@weddingonabudget.example",
  },
]

const SCOUT_NAMES = [
  "Maya Okafor",
  "Jonas Petrov",
  "Leila Haddad",
  "Ravi Menon",
  "Sofia Marino",
  "Caleb Wright",
  "Nina Kowalski",
  "Diego Fuentes",
  "Amara Singh",
  "Owen Fischer",
  "Yuki Morita",
  "Elena Popescu",
]

const SCOUT_SIGNALS = [
  "Bio: “Free weekly email, link below”",
  "About: newsletter link (beehiiv)",
  "Link in bio → Kit signup form",
  "Pinned comment: “Join my email list for the templates”",
  "Description: “Get my free checklist by email”",
  "Story highlight “Newsletter”, Substack link",
]

export function scoutFor(
  query: string,
  plats: PartnerPlatform[],
  skip: string[] = []
): ScoutResult[] {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2)
  const fresh = (creator: ScoutResult) =>
    plats.includes(creator.plat) && !skip.includes(creator.handle)
  const hits = SCOUT_POOL.filter(
    (creator) =>
      fresh(creator) &&
      words.some((word) => `${creator.niche} ${creator.handle}`.toLowerCase().includes(word))
  )
  const out = [...hits]
  const slug =
    (query || "creator").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 14) || "creator"
  const niche = query ? query[0].toUpperCase() + query.slice(1) : "General how-to"
  let seed = [...slug].reduce((n, ch) => n + ch.charCodeAt(0), 0) + skip.length
  for (let k = 0; out.length < 6 && k < 24; k += 1) {
    const name = SCOUT_NAMES[(seed + k) % SCOUT_NAMES.length]
    const first = name.split(" ")[0].toLowerCase()
    const plat = plats[(seed + k) % plats.length]
    const handle = `@${[`${slug}.${first}`, `${first}.${slug}`, `${slug}with${first}`][k % 3]}`
    if (skip.includes(handle) || out.some((c) => c.handle === handle)) continue
    const followers = `${18 + ((seed * 7 + k * 23) % 190)}k`
    const listed = k % 3 === 0
    out.push({
      name,
      handle,
      plat,
      followers,
      niche,
      signal: SCOUT_SIGNALS[(seed + k) % SCOUT_SIGNALS.length],
      list: listed ? ((2 + ((seed + k) % 9)) * 1000).toLocaleString() : "not stated",
      product: k % 4 === 3 ? "Sells one low-priced printable" : "No paid product found",
      email: `${first}@${slug}${first}.example`,
    })
  }
  if (!query) {
    for (const creator of SCOUT_POOL) {
      if (out.length < 6 && fresh(creator) && !out.includes(creator)) out.unshift(creator)
    }
  }
  return out.slice(0, 6)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

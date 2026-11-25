export type SubscriptionPlan = "six_months" | "yearly"
export type UserRole = "user" | "admin"
export type BuildMode = "guided" | "fast"
export type ProductStage = "build" | "publish" | "distribute" | "paused"
export type StepStatus = "todo" | "running" | "review" | "quality_gate" | "gate" | "done"
export type SectionStatus = "todo" | "live" | "done"
export type SourceKind = "file" | "youtube" | "instagram" | "web"
export type ServiceKind = "oauth" | "key" | "guided"
export type PartnerStatus =
  | "queued"
  | "sent"
  | "replied"
  | "interested"
  | "declined"
  | "partnered"
export type PartnerPlatform = "youtube" | "instagram" | ""

export interface ServiceCatalogItem {
  id: string
  name: string
  short: string
  color: string
  kind: ServiceKind
  group: string
  main?: boolean
  /** When true, Connections shows Coming soon and blocks connect. */
  comingSoon?: boolean
  does: string
  price: string
}

export interface TrendingIdea {
  title: string
  stats: string
}

export interface ProductType {
  id: string
  name: string
  desc: string
  pages: string
  price: string
  sections: number
}

export interface TypePriceSuggestion {
  price: string
  median?: number | null
  pages?: string | null
  rationale?: string | null
  source?: string | null
}

export interface ProductSelectionResponse {
  id: string
  type: string | null
  pocketId: string | null
  cur: number
  stepStatus: StepStatus
}

export interface ChannelCatalogItem {
  id: string
  name: string
  needs: string[]
  desc: string
  did: string
  nums: [string, string][]
}

export interface Palette {
  name: string
  cols: string[]
  display: string
  body: string
}

export interface RelayCatalog {
  services: ServiceCatalogItem[]
  trending: TrendingIdea[]
  types: ProductType[]
  channels: ChannelCatalogItem[]
  palettes: Palette[]
  buildSteps: string[]
  platforms: string[]
  prices: { six_months: number; yearly: number }
}

export interface SourceItem {
  id: string
  kind: SourceKind
  name: string
  url?: string
  size?: number
  status?: string
  error?: string
  file?: File
}

export interface SourceProfile {
  read: { videos: number; docs: number; passages: number }
  niche: string
  transformation: string
  themes: { t: string; d: string; level: string; hits?: number }[]
  verdict: string
  audience: string
  voice: string
  viable?: boolean
}

export interface Pocket {
  id: string
  h: string
  ind: string
  niche: string
  know: string
  prob: string
  scores: { pain: number; worse: number; power: number; speed: number }
  src: string[]
  rec?: boolean
  grounded?: boolean
}

export interface ManuscriptSection {
  id: string
  title: string
  moment: string
  words: number
  text: string
  status: SectionStatus
  cites?: string[]
}

export interface ProductBrand {
  title: string
  palette: number
  paletteDetail?: Palette | null
  cover: number
  coverImageUrls?: (string | null)[]
  pageGraphicUrls?: Record<string, string>
}

export interface ProductFile {
  id: string
  fileType: string
  version: number
  downloadPath?: string
}

export interface ProductStep {
  status: StepStatus
  note: string
  progress: string[] | null
  gatePassed?: boolean
  qualityWarning?: string | null
}

export interface ThreadMessage {
  who: "relay" | "you"
  text: string
  t: string
}

export interface Listing {
  title: string
  price: number
  tags: string
  desc: string
}

export interface ListingDraftResponse {
  title: string
  headline: string
  price: number
}

export interface PublishState {
  platforms: string[]
  listings: Record<string, Listing>
  live: Record<string, string>
  step: number | null
  status: string
  current: string | null
}

export interface ChannelState {
  on?: boolean
  setting?: boolean
  week?: number
  clicks?: number
}

export interface PromoVideo {
  title: string
  dur: string
  status: string
}

export interface PromoteState {
  videos: PromoVideo[]
  status: string
  scheduled: boolean
  /** Total estimate for ten Shorts (USD), when relevant. */
  estimateUsd?: number | null
  /** Cost of the next promote action (USD). */
  nextSpendUsd?: number | null
}

export interface Order {
  t: string
  amt: number
  via: string
}

export interface Product {
  id: string
  name: string
  input: string
  mode: BuildMode
  forElse: boolean
  client: string
  partnerId: string | null
  sources: SourceItem[]
  profile: SourceProfile | null
  orders: Order[]
  pockets: Pocket[]
  pocket: Pocket | null
  type: string | null
  typePriceSuggestions?: Record<string, TypePriceSuggestion>
  structure: ManuscriptSection[]
  words: number
  brand: ProductBrand | null
  files?: ProductFile[]
  stage: ProductStage
  cur: number
  steps: ProductStep[]
  thread: ThreadMessage[]
  publish: PublishState
  distribute: Record<string, ChannelState>
  promote: PromoteState
  metrics: { sales: number; revenue: number; leads: number; visits: number }
  spend: number
  remainingEstimate?: number | null
  pricingAvailable?: boolean
  pricingMessage?: string | null
  qualityWarning?: string | null
  cancelled?: boolean
  created: string
  updated: string
}

export interface ConnectionState {
  status: "connected"
  label: string
  t: string
}

export interface Partner {
  id: string
  name: string
  handle: string
  plat: PartnerPlatform
  url?: string
  followers: string
  niche: string
  signal: string
  list?: string
  product?: string
  email: string
  status: PartnerStatus
  step: number
  reply: string
  productId: string | null
  split?: number
  from: "scout" | "own"
  sentAt?: string
}

export interface OutreachTemplate {
  subject: string
  body: string
  f1: string
  f2: string
  split: number
  cap: number
}

export interface Workspace {
  sub: SubscriptionPlan | null
  role: UserRole
  seen: { onboard: boolean }
  services: Record<string, ConnectionState>
}

export interface AdminStats {
  subscribers: number
  productsBuilt: number
  listedRate: string
  firstSaleRate: string
  fromSourcesRate: string
  outreachSent: number
  replyRate: string
  partnerLive: number
}

export interface CreateProductInput {
  name: string
  input: string
  mode: BuildMode
  forElse?: boolean
  client?: string
  partnerId?: string | null
  sources?: SourceItem[]
  pendingFilesCount?: number
}

export interface ScoutResult extends Omit<
  Partner,
  "id" | "status" | "step" | "reply" | "productId" | "from" | "sentAt" | "split"
> {
  product: string
  list: string
}

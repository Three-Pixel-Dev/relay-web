export type SubscriptionPlan = "monthly" | "yearly"
export type UserRole = "user" | "admin"
export type BuildMode = "guided" | "fast"
export type ProductStage = "build" | "publish" | "distribute" | "paused"
export type StepStatus = "todo" | "running" | "review" | "gate" | "done"
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
  prices: { monthly: number; yearly: number }
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
  themes: { t: string; d: string; level: string }[]
  verdict: string
  audience: string
  voice: string
}

export interface Pocket {
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
  cover: number
}

export interface ProductStep {
  status: StepStatus
  note: string
  progress: string[] | null
  gatePassed?: boolean
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
}

export interface Order {
  t: string
  amt: number
  via: string
}

export interface Product {
  id: string
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
  structure: ManuscriptSection[]
  words: number
  brand: ProductBrand | null
  stage: ProductStage
  cur: number
  steps: ProductStep[]
  thread: ThreadMessage[]
  publish: PublishState
  distribute: Record<string, ChannelState>
  promote: PromoteState
  metrics: { sales: number; revenue: number; leads: number; visits: number }
  spend: number
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

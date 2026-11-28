import { motion, useReducedMotion } from "framer-motion"
import { Play } from "lucide-react"
import { useRef } from "react"
import { Link, Navigate } from "react-router"

import { BrandLogo } from "@/components/common/relayguy-mark"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { LandingHeroArt } from "@/features/landing/components/landing-hero-art"
import { Reveal, RevealGroup, RevealItem } from "@/features/landing/components/reveal"
import { ROUTES } from "@/constants/routes"
import { protoBtn } from "@/lib/proto"
import { cn } from "@/lib/utils"
import { fadeUp, staggerContainer, staggerFast } from "@/shared/motion-variants"
import { useSessionStore } from "@/shared/stores/session.store"
import { useUiStore } from "@/shared/stores/ui.store"

const BUILD_STEPS = [
  ["Sources", "Reads your documents, audio, video or links and shows what it found."],
  ["Profitable pockets", "Four pockets backed by live marketplace listings. You pick one."],
  ["Product type", "Guide, workbook, planner, checklist, template pack or mini-course."],
  ["Structure", "Sections that each own a real moment your reader faces."],
  ["Manuscript", "Writes one section, waits for your OK on the voice, then writes the rest."],
  ["Branding", "Title, palette, type and three covers to choose from."],
  ["Ready", "PDF, EPUB, DOCX, mockups and a Canva-editable pack."],
] as const

const FAQ = [
  [
    "Do I need my own AI keys?",
    "Yes. RelayGuy works through your own AI keys and accounts, so you pay the AI providers their price and nothing is marked up. He shows the cost before every step.",
  ],
  [
    "What does the AI cost for one product?",
    "Cents. A full guide with covers and page graphics has cost well under a dollar in our own builds. The running total sits beside the product while he works.",
  ],
  [
    "Where does the product get sold?",
    "On Whop first. RelayGuy creates the product and the checkout link, hands buyers their files after payment and records each sale. Etsy and Gumroad are coming.",
  ],
  [
    "Is there a free trial?",
    "No. Watch the demo, then pick 6 months or a year. One card payment, unlimited products.",
  ],
  [
    "Can I build a product for someone else?",
    "Yes. Paste a creator’s YouTube or Instagram link, or find creators in Partners, agree a split and build it in their voice.",
  ],
] as const

const REASSURANCE = [
  {
    title: "Written from your sources",
    body: "Every section shows which document, recording or link it came from. If the sources are too thin, he says so before anything is written.",
  },
  {
    title: "Your keys, your accounts",
    body: "Your AI keys, your Whop store, your Gmail. RelayGuy never holds your money or your audience.",
  },
  {
    title: "You stay in charge",
    body: "He stops after every step and shows what he made and what the next step costs. Nothing is published until you say so.",
  },
] as const

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function LandingPage() {
  const accessToken = useSessionStore((s) => s.accessToken)
  const showToast = useUiStore((s) => s.showToast)
  const scrollRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  if (accessToken) {
    return <Navigate to={ROUTES.start} replace />
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-[color:var(--glass)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-3 max-[900px]:px-4">
          <Link to={ROUTES.landing} aria-label="RelayGuy">
            <BrandLogo size={42} />
          </Link>
          <nav className="flex gap-1 max-[900px]:hidden" aria-label="Landing">
            <NavScrollButton label="How it works" target="lp-how" />
            <NavScrollButton label="Pricing" target="lp-price" />
            <NavScrollButton label="Questions" target="lp-faq" />
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to={ROUTES.login}
              className={cn(protoBtn({ variant: "ghost" }), "max-[900px]:hidden")}
            >
              Sign in
            </Link>
            <Link to={ROUTES.login} className={protoBtn()}>
              Start building
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[1120px] grid-cols-[1.1fr_0.9fr] items-center gap-9 px-5 py-14 max-[900px]:grid-cols-1 max-[900px]:gap-8 max-[900px]:px-4 max-[900px]:py-8">
        <motion.div
          variants={reduceMotion ? undefined : staggerContainer}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
        >
          <RevealItem>
            <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              Your digital product guy
            </span>
          </RevealItem>
          <RevealItem>
            <h1 className="mt-4 text-[clamp(36px,4.8vw,54px)] leading-[1.04] tracking-[-0.035em] text-balance">
              You know stuff. This guy turns it into a product that sells.
            </h1>
          </RevealItem>
          <RevealItem>
            <p className="mt-[18px] mb-6 max-w-[48ch] text-[17px] text-muted-foreground">
              Tell RelayGuy what you know, or hand him your documents, recordings or a YouTube
              link. He finds the pocket that pays, writes and designs the product, lists it on Whop
              and brings people to it.
            </p>
          </RevealItem>
          <RevealItem>
            <div className="flex flex-wrap items-center gap-2.5">
              <Link to={ROUTES.login} className={protoBtn({ size: "big" })}>
                Start building
              </Link>
              <button
                type="button"
                className={protoBtn({ variant: "ghost", size: "big" })}
                onClick={() => scrollToId("lp-demo")}
              >
                <Play className="size-4" />
                Watch the demo
              </button>
            </div>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-[13px] text-dim">
              $99 for 6 months or $149 a year. No trial. Your own AI keys, at the providers’
              prices.
            </p>
          </RevealItem>
        </motion.div>

        <LandingHeroArt />
      </section>

      <section id="lp-demo" className="scroll-mt-16 border-y border-border bg-muted">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[1.1fr_0.9fr] items-center gap-10 px-5 py-[52px] max-[900px]:grid-cols-1 max-[900px]:px-4">
          <Reveal root={scrollRef}>
            <div className="relative grid aspect-video place-items-center rounded-[22px] border border-border-strong bg-primary text-primary-foreground dark:bg-secondary">
              <button
                type="button"
                className="grid size-[68px] place-items-center rounded-full bg-background text-foreground"
                aria-label="Play demo"
                onClick={() => showToast("Demo video coming soon.")}
              >
                <Play className="size-[26px] fill-current" />
              </button>
              <span className="absolute bottom-3 left-3.5 text-[12.5px] text-primary-foreground/70 dark:text-muted-foreground">
                Demo · one product, start to finish
              </span>
            </div>
          </Reveal>
          <RevealGroup root={scrollRef} className="grid gap-0">
            <RevealItem>
              <h2 className="text-[clamp(26px,3.2vw,36px)] tracking-[-0.03em]">
                Watch him build one.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mt-2.5 max-w-[46ch] text-base text-muted-foreground">
                A 24-minute talk goes in. A 40-page workbook with a cover, a Whop checkout link and
                a first batch of partner emails come out. You press Proceed seven times.
              </p>
            </RevealItem>
            <RevealGroup root={scrollRef} variants={staggerFast} className="mt-[22px] grid grid-cols-3 gap-4">
              <RevealItem>
                <Stat value="7" label="steps, each waits for you" />
              </RevealItem>
              <RevealItem>
                <Stat value="$0.27" label="in AI for the whole build" />
              </RevealItem>
              <RevealItem>
                <Stat value="6" label="file formats at the end" />
              </RevealItem>
            </RevealGroup>
          </RevealGroup>
        </div>
      </section>

      <section id="lp-how" className="scroll-mt-16">
        <div className="mx-auto max-w-[1120px] px-5 py-[60px] max-[900px]:px-4 max-[900px]:py-10">
          <Reveal root={scrollRef}>
            <h2 className="text-[clamp(26px,3.2vw,36px)] tracking-[-0.03em]">
              Build, sell, get seen.
            </h2>
          </Reveal>
          <Reveal root={scrollRef}>
            <p className="mt-2.5 mb-[26px] max-w-[60ch] text-base text-muted-foreground">
              Three jobs, one guy. He does the work, you make the calls: proceed, suggest a change,
              or cancel.
            </p>
          </Reveal>

          <Reveal root={scrollRef}>
            <div className="rounded-[22px] border border-border bg-card p-[22px]">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Pill>Build</Pill>
                <h3 className="text-[17px]">From what you know to finished files</h3>
              </div>
              <RevealGroup
                as="ol"
                root={scrollRef}
                variants={staggerFast}
                className="m-0 grid list-none grid-cols-4 gap-2.5 p-0 max-[900px]:grid-cols-2"
              >
                {BUILD_STEPS.map(([title, desc], index) => (
                  <RevealItem
                    key={title}
                    as="li"
                    className="grid content-start gap-1 rounded-xl border border-border bg-background p-3.5"
                  >
                    <i className="mb-1 grid size-7 place-items-center rounded-[9px] bg-secondary text-[13px] not-italic font-extrabold">
                      {index + 1}
                    </i>
                    <b className="text-sm">{title}</b>
                    <span className="text-[12.5px] leading-snug text-muted-foreground">{desc}</span>
                  </RevealItem>
                ))}
              </RevealGroup>
            </div>
          </Reveal>

          <RevealGroup
            root={scrollRef}
            className="mt-4 grid grid-cols-2 gap-4 max-[900px]:grid-cols-1"
          >
            <RevealItem>
              <FeatureCard
                pill="Sell"
                title="Listed on Whop, with a checkout link"
                body="He writes the listing, sets a price from what similar products sell for, and publishes. Buyers get their files straight after payment. Sales show up on your product page."
              />
            </RevealItem>
            <RevealItem>
              <FeatureCard
                pill="Get seen"
                title="Channels and partners that bring people"
                body="Pins, Shorts and a lead-magnet page, on a schedule. Or find creators who have an audience and no product, and build one together for a split."
              />
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section className="border-y border-border bg-muted">
        <RevealGroup
          root={scrollRef}
          className="mx-auto grid max-w-[1120px] grid-cols-3 gap-7 px-5 py-[60px] max-[900px]:grid-cols-1 max-[900px]:px-4 max-[900px]:py-10"
        >
          {REASSURANCE.map((item) => (
            <RevealItem key={item.title}>
              <h3 className="mb-2 text-[17px]">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <section id="lp-price" className="scroll-mt-16">
        <div className="mx-auto max-w-[1120px] px-5 py-[60px] max-[900px]:px-4 max-[900px]:py-10">
          <Reveal root={scrollRef}>
            <h2 className="text-[clamp(26px,3.2vw,36px)] tracking-[-0.03em]">
              One price for the guy.
            </h2>
          </Reveal>
          <Reveal root={scrollRef}>
            <p className="mt-2.5 mb-[26px] max-w-[60ch] text-base text-muted-foreground">
              Unlimited products. No trial. AI usage runs on your own keys.
            </p>
          </Reveal>
          <RevealGroup
            root={scrollRef}
            className="grid max-w-[700px] grid-cols-2 items-stretch gap-4 max-[900px]:grid-cols-1"
          >
            <RevealItem className="flex h-full">
              <div className="flex h-full w-full flex-col gap-2 rounded-[22px] border border-border bg-card p-[22px]">
                <h3 className="text-[17px]">6 months</h3>
                <div className="text-[40px] leading-tight font-extrabold tracking-[-0.03em]">$99</div>
                <p className="text-sm text-muted-foreground">One card payment for 6 months.</p>
                <Link
                  to={ROUTES.login}
                  className={cn(protoBtn({ variant: "ghost" }), "mt-auto w-full")}
                >
                  Choose 6 months
                </Link>
              </div>
            </RevealItem>
            <RevealItem className="flex h-full">
              <div className="relative flex h-full w-full flex-col gap-2 rounded-[22px] border-[1.5px] border-foreground bg-card p-[22px]">
                <span className="absolute top-4 right-4 inline-flex rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                  Best value
                </span>
                <h3 className="text-[17px]">Yearly</h3>
                <div className="text-[40px] leading-tight font-extrabold tracking-[-0.03em]">
                  $149
                </div>
                <p className="text-sm text-muted-foreground">
                  Same everything, one card payment for the year.
                </p>
                <Link to={ROUTES.login} className={cn(protoBtn(), "mt-auto w-full")}>
                  Choose yearly
                </Link>
              </div>
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section id="lp-faq" className="scroll-mt-16 border-y border-border bg-muted">
        <div className="mx-auto grid max-w-[1120px] grid-cols-[0.8fr_1.2fr] items-start gap-9 px-5 py-[60px] max-[900px]:grid-cols-1 max-[900px]:px-4 max-[900px]:py-10">
          <Reveal root={scrollRef}>
            <h2 className="text-[clamp(26px,3.2vw,36px)] tracking-[-0.03em]">
              Questions people ask first
            </h2>
          </Reveal>
          <RevealGroup root={scrollRef} variants={staggerFast} className="grid gap-2">
            {FAQ.map(([question, answer]) => (
              <RevealItem key={question}>
                <details className="group rounded-xl border border-border bg-card px-3.5 py-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
                    {question}
                    <span className="font-extrabold group-open:hidden">+</span>
                    <span className="hidden font-extrabold group-open:inline">–</span>
                  </summary>
                  <p className="mt-2 text-[13.5px] text-muted-foreground">{answer}</p>
                </details>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <footer className="border-t border-border">
        <Reveal
          root={scrollRef}
          className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-5 py-[22px] text-[13px] text-muted-foreground max-[900px]:px-4"
          variants={fadeUp}
        >
          <Link to={ROUTES.landing} aria-label="RelayGuy">
            <BrandLogo size={36} nameClassName="text-[18px]" />
          </Link>
          <span>relayguy.com · Build, sell, get seen</span>
          <Link to={ROUTES.login} className={protoBtn()}>
            Start building
          </Link>
        </Reveal>
      </footer>
    </div>
  )
}

function NavScrollButton({ label, target }: { label: string; target: string }) {
  return (
    <button
      type="button"
      className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
      onClick={() => scrollToId(target)}
    >
      {label}
    </button>
  )
}

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-muted-foreground">
      {children}
    </span>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <b className="block text-[26px] font-extrabold tracking-[-0.03em]">{value}</b>
      <span className="text-[12.5px] text-muted-foreground">{label}</span>
    </div>
  )
}

interface FeatureCardProps {
  pill: string
  title: string
  body: string
}

function FeatureCard({ pill, title, body }: FeatureCardProps) {
  return (
    <div className="grid content-start justify-items-start gap-2.5 rounded-[22px] border border-border bg-card p-[22px]">
      <Pill>{pill}</Pill>
      <h3 className="text-[17px]">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  )
}

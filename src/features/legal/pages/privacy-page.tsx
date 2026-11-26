import type { ReactNode } from "react"
import { Link } from "react-router"

import { ROUTES } from "@/constants/routes"
import { cardClass, linkClass } from "@/lib/proto"
import { cn } from "@/lib/utils"

const LAST_UPDATED = "25 November 2026"

export function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(1200px_600px_at_10%_-10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="mb-6 text-center">
          <Link to={ROUTES.login} className="text-[28px] font-bold tracking-tight text-foreground no-underline">
            relay
          </Link>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Build, sell, get seen</p>
        </div>

        <article className={cn(cardClass, "p-[22px] sm:p-8")}>
          <p className="mb-2 text-[13px] text-muted-foreground">Last updated {LAST_UPDATED}</p>
          <h1 className="mb-3 text-2xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-muted-foreground">
            This policy explains what Relay collects and why. Relay is a product of{" "}
            <span className="text-foreground">Three Pixel</span>. It is written for how Relay works
            today — sign-in, subscriptions, product build, Connections, outreach, and promotion —
            not for features that are still coming soon.
          </p>

          <Section title="Who we are">
            <p>
              Relay helps you build digital products, publish them (for example on Whop), distribute
              and promote them, and run partnership outreach. The service is operated by Three
              Pixel (“we”, “us”).
            </p>
            <p>
              Privacy questions:{" "}
              <a className={linkClass} href="mailto:support@threepixel.dev">
                support@threepixel.dev
              </a>{" "}
              <span className="text-muted-foreground">
                (placeholder — replace with your preferred contact).
              </span>
            </p>
          </Section>

          <Section title="Account and sign-in">
            <p>
              You can create or open an account with <strong className="font-semibold text-foreground">Google Sign-In</strong>.
              Google shares basic identity with us (typically name, email, and a Google account
              identifier). We use that to create or match your Relay account and keep you signed in.
            </p>
            <p>
              In Profile you may set a display name and an optional email/password for later
              sign-in. Passwords are stored only in hashed form on our servers; we do not see your
              Google password.
            </p>
          </Section>

          <Section title="Subscriptions and payments">
            <p>
              Paid plans are billed through <strong className="font-semibold text-foreground">Stripe</strong>.
              Card details are entered in Stripe’s checkout and handled by Stripe. Relay stores
              subscription and customer references (for example Stripe customer and subscription
              IDs) so we can show plan status and manage renewals — not your full card number.
            </p>
          </Section>

          <Section title="Product build content">
            <p>
              When you build a product, Relay stores the content you provide and what the product
              pipeline produces: sources (documents, links, uploads), summaries, structure,
              manuscript and design assets, listings, and related product metadata. That material
              lives in your workspace so you can edit, publish, and measure it.
            </p>
          </Section>

          <Section title="Connections">
            <p>
              In Connections you may link third-party accounts or paste API keys so Relay can act
              on your behalf. Depending on what you enable, that can include:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
              <li>
                <span className="text-foreground">Gmail</span> — send partnership outreach from
                your mailbox and read replies on those threads
              </li>
              <li>
                <span className="text-foreground">Whop</span> — create products/checkout links and
                record sales
              </li>
              <li>
                <span className="text-foreground">Pinterest, YouTube, TikTok, Instagram</span> —
                schedule or post promotional content you approve
              </li>
              <li>
                <span className="text-foreground">beehiiv</span> — list, landing page, and email
                sequences via your API key
              </li>
              <li>
                <span className="text-foreground">Higgsfield</span> — generate promo Shorts with
                your key
              </li>
              <li>
                <span className="text-foreground">AI provider keys</span> (for example Google
                Gemini for text/embeddings/images) — Relay calls those providers with{" "}
                <em>your</em> keys to index sources and generate product copy and graphics
              </li>
            </ul>
            <p className="mt-3">
              Credentials and tokens are stored so the integration keeps working. We use them only
              to provide the features you turn on. Each connected service also processes data under
              its own privacy policy.
            </p>
          </Section>

          <Section title="Distribute, promote, and outreach">
            <p>
              When you publish, distribute, or promote, Relay may send content and schedule posts
              to the channels you connected. For Partners outreach, emails go out from your own
              mailbox (Gmail OAuth / SMTP-style sending from your account), with caps and
              follow-ups you configure. Prospect lists you import or discover, message templates,
              and send/reply status are stored so you can run and track campaigns.
            </p>
          </Section>

          <Section title="Analytics and metrics">
            <p>
              Relay shows product and workspace metrics such as sales, revenue, leads, visits, and
              outreach activity. Some figures come from connected platforms (for example Whop
              orders via webhooks); others are derived from activity inside Relay. We use this to
              power your dashboards and improve reliability of the service.
            </p>
          </Section>

          <Section title="Third-party processors">
            <p>Depending on what you use, data may be processed by:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
              <li>Google (Sign-In, Gmail, YouTube, Gemini API when you supply a key)</li>
              <li>Stripe (Relay subscription payments)</li>
              <li>Whop, Pinterest, TikTok, Instagram / Meta, beehiiv, Higgsfield</li>
              <li>Our hosting and infrastructure providers that run Relay’s app and API</li>
            </ul>
            <p className="mt-3">
              Those providers receive only what is needed for the feature you requested. Their
              terms and privacy policies apply to their processing.
            </p>
          </Section>

          <Section title="Cookies and local storage">
            <p>
              Relay uses browser storage (for example session tokens) to keep you signed in and
              remember UI state. We do not use that storage to sell advertising profiles.
            </p>
          </Section>

          <Section title="Retention and your choices">
            <p>
              We keep account, product, connection, and metrics data while your account is active
              and as needed to operate the service or meet legal obligations. You can update
              profile details in the app, disconnect services in Connections, and stop using Relay
              at any time. For deletion or export requests, email the contact above.
            </p>
          </Section>

          <Section title="Children">
            <p>
              Relay is aimed at adults building and selling digital products. It is not intended
              for children under 16, and we do not knowingly collect their personal data.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If this policy changes in a material way, we will update the date at the top of this
              page. Continued use of Relay after an update means you accept the revised policy.
            </p>
          </Section>

          <p className="mt-8 border-t border-border pt-5 text-center text-[13px] text-muted-foreground">
            <Link to={ROUTES.login} className={cn(linkClass, "font-semibold")}>
              Back to sign in
            </Link>
          </p>
        </article>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6 last:mb-0">
      <h2 className="mb-2 text-[15px] font-bold tracking-tight text-foreground">{title}</h2>
      <div className="space-y-2.5 text-[14px] leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

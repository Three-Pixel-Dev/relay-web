import type { ReactNode } from "react"
import { Link } from "react-router"

import { ROUTES } from "@/constants/routes"
import { cardClass, linkClass } from "@/lib/proto"
import { cn } from "@/lib/utils"

const LAST_UPDATED = "25 November 2026"

export function TermsPage() {
  return (
    <div className="min-h-full bg-[radial-gradient(1200px_600px_at_10%_-10%,color-mix(in_oklab,var(--primary)_22%,transparent),transparent)] bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-[640px]">
        <div className="mb-6 text-center">
          <Link to={ROUTES.login} className="text-[28px] font-bold tracking-tight text-foreground no-underline">
            relay
          </Link>
          <p className="mt-1.5 text-[13px] text-muted-foreground">Build, sell, get seen</p>
        </div>

        <article className={cn(cardClass, "p-[22px] sm:p-8")}>
          <p className="mb-2 text-[13px] text-muted-foreground">Last updated {LAST_UPDATED}</p>
          <h1 className="mb-3 text-2xl font-bold tracking-tight">Terms of Service</h1>
          <p className="mb-6 text-[14px] leading-relaxed text-muted-foreground">
            These terms govern your use of Relay, a product of{" "}
            <span className="text-foreground">Three Pixel</span> (“we”, “us”). They cover how Relay
            works today — sign-in, paid plans, product build, Connections, publishing, outreach, and
            promotion — not features that are still coming soon. By creating an account or using
            Relay, you agree to these terms and our{" "}
            <Link to={ROUTES.privacy} className={linkClass}>
              Privacy Policy
            </Link>
            .
          </p>

          <Section title="Who we are">
            <p>
              Relay helps you build digital products, publish them (for example on Whop), distribute
              and promote them, and run partnership outreach. The service is operated by Three
              Pixel.
            </p>
            <p>
              Questions about these terms:{" "}
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
              You can create or open an account with{" "}
              <strong className="font-semibold text-foreground">Google Sign-In</strong>. You must
              provide accurate account information and keep access to your Google account (and any
              Relay password you set in Profile) secure. You are responsible for activity under your
              Relay account.
            </p>
            <p>
              You must be old enough to form a binding contract in your jurisdiction and able to
              accept these terms. Relay is aimed at adults building and selling digital products —
              not at children under 16.
            </p>
          </Section>

          <Section title="Subscriptions and payments">
            <p>
              Some Relay features require a paid plan. Billing runs through{" "}
              <strong className="font-semibold text-foreground">Stripe</strong>. Prices, plan
              limits, and renewal timing are shown in the product at checkout and in Profile. By
              starting a paid plan you authorize Stripe to charge the payment method you provide for
              the listed fees and applicable taxes.
            </p>
            <p>
              Subscriptions renew until you cancel through Relay or Stripe’s customer portal (where
              available). Fees already charged for a billing period are generally non-refundable
              except where required by law or where we state otherwise at purchase. Plan changes
              take effect according to the timing shown in the app.
            </p>
          </Section>

          <Section title="Your content">
            <p>
              You keep ownership of the content you upload or create in Relay — sources, product
              copy, assets, listings, outreach messages, and similar material (“Your Content”). You
              grant Three Pixel a limited license to host, process, display, and transmit Your
              Content only as needed to operate Relay for you (including AI generation, publishing,
              and promotion you trigger).
            </p>
            <p>
              You represent that you have the rights to use Your Content and that it does not
              infringe others’ rights or violate law. We do not claim ownership of Your Content.
            </p>
          </Section>

          <Section title="Connections and third-party posting">
            <p>
              In Connections you may link third-party accounts or paste API keys so Relay can act on
              your behalf. Depending on what you enable, that can include:
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
                Gemini) — Relay calls those providers with <em>your</em> keys to index sources and
                generate product copy and graphics
              </li>
            </ul>
            <p className="mt-3">
              When you connect a service, you authorize Relay to use those credentials to perform
              the actions you request in the product. You remain responsible for complying with each
              platform’s terms, policies, and posting rules. Those providers are independent; their
              availability and behavior are outside our control.
            </p>
          </Section>

          <Section title="AI usage and costs">
            <p>
              Product build, promotion, and related features may call AI providers using keys you
              supply or capacity included in your Relay plan (as shown in the product). Usage beyond
              included allowances, or usage billed directly by a provider against your own key, is
              your responsibility. AI output can be wrong or incomplete — review it before you
              publish, promote, or rely on it commercially.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>You agree not to use Relay to:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[14px] leading-relaxed text-muted-foreground">
              <li>Break the law, or infringe intellectual property, privacy, or publicity rights</li>
              <li>
                Send spam, phishing, deceptive outreach, or abuse email/social platforms via
                Connections
              </li>
              <li>Upload malware, attempt unauthorized access, or disrupt Relay or connected services</li>
              <li>
                Scrape, reverse engineer, or resell Relay except as allowed by law or a written
                agreement with us
              </li>
              <li>Misrepresent your identity or affiliation when publishing or messaging</li>
            </ul>
            <p className="mt-3">
              We may suspend or terminate access if we reasonably believe you violated these terms
              or put Relay, other users, or third parties at risk.
            </p>
          </Section>

          <Section title="Disconnecting and ending use">
            <p>
              You can disconnect third-party services in Connections at any time and stop using
              Relay. Disconnecting stops new actions through that integration; content already
              posted on third-party platforms remains subject to those platforms. You may cancel a
              paid subscription as described in the billing section. We may stop providing Relay or
              particular features with reasonable notice when practical.
            </p>
          </Section>

          <Section title="Service availability">
            <p>
              We aim to keep Relay reliable but do not guarantee uninterrupted or error-free
              service. Features depend on third-party APIs (Google, Stripe, Whop, social platforms,
              AI providers, and others). Outages, rate limits, or policy changes on those services
              may affect what Relay can do.
            </p>
          </Section>

          <Section title="Disclaimer and limitation of liability">
            <p>
              Relay is provided “as is” and “as available,” without warranties of any kind, whether
              express or implied, including merchantability, fitness for a particular purpose, and
              non-infringement, to the fullest extent permitted by law.
            </p>
            <p>
              To the fullest extent permitted by law, Three Pixel and its operators are not liable
              for indirect, incidental, special, consequential, or punitive damages, or for lost
              profits, revenue, data, or goodwill, arising from your use of Relay or connected
              services. Our total liability for claims relating to Relay in any twelve-month period
              is limited to the greater of (a) the amounts you paid us for Relay in that period or
              (b) USD $50.
            </p>
            <p>
              Some jurisdictions do not allow certain limitations; in those places, our liability is
              limited to the maximum extent allowed.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If these terms change in a material way, we will update the date at the top of this
              page. Continued use of Relay after an update means you accept the revised terms. If
              you do not agree, stop using Relay and cancel any paid plan.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Three Pixel — Relay support:{" "}
              <a className={linkClass} href="mailto:support@threepixel.dev">
                support@threepixel.dev
              </a>
              .
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

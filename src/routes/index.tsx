import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Globe2,
  Lock,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import heroImage from "@/assets/hero-dashboard.jpg";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCountries, useServices } from "@/lib/queries";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CountryFlag } from "@/components/brand/CountryFlag";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gigz Exchange — Fast & Reliable SMS Verification" },
      {
        name: "description",
        content:
          "Gigz Exchange gives you instant access to SMS verification numbers across 50+ countries with transparent pricing and a simple dashboard.",
      },
      { property: "og:title", content: "Gigz Exchange — Fast & Reliable SMS Verification" },
      {
        property: "og:description",
        content:
          "Instant SMS verification numbers across 50+ countries, transparent pricing, and a dashboard built for speed.",
      },
    ],
  }),
  component: Home,
});

const stats = [
  { value: "10,000+", label: "Users" },
  { value: "50+", label: "Countries" },
  { value: "1M+", label: "Verifications" },
  { value: "99%", label: "Platform availability" },
];

const whyUs = [
  { icon: Zap, title: "Numbers in seconds", body: "Request a number and receive your verification code in under a minute on most routes." },
  { icon: Globe2, title: "Global coverage", body: "50+ countries with live availability indicators so you always know what's in stock." },
  { icon: Wallet, title: "Pay only for success", body: "Unused or expired numbers are refunded to your wallet automatically." },
  { icon: ShieldCheck, title: "Private by design", body: "Numbers are single-use and never recycled between customers on the same service." },
  { icon: Clock3, title: "Always on", body: "99% platform availability with 24/7 monitoring and support ticketing." },
  { icon: BadgeCheck, title: "Built for scale", body: "Bulk pricing, REST API and per-team reporting when you grow past manual buying." },
];

const steps = [
  { n: "01", title: "Create an account", body: "Sign up in under a minute with just an email address." },
  { n: "02", title: "Add funds", body: "Top up your wallet and see your balance in the dashboard at all times." },
  { n: "03", title: "Select service & country", body: "Pick from live inventory with real-time pricing and availability." },
  { n: "04", title: "Receive your SMS", body: "Your verification code appears in the dashboard the moment it lands." },
];

const faqs = [
  { q: "How fast do codes arrive?", a: "Most verification codes arrive within 10–60 seconds. If nothing arrives before the timer expires, the order is refunded automatically." },
  { q: "Can I reuse a number?", a: "Numbers are single-use per service. You can request a repeat SMS on the same number while the order is still active." },
  { q: "What payment methods are supported?", a: "This is a Phase 1 prototype, so payment methods shown are demo placeholders. Real providers will be connected in Phase 2." },
  { q: "Do you offer an API?", a: "Yes — an API dashboard with keys, usage statistics and documentation is included in the customer dashboard." },
];

function Home() {
  const { data: services = [] } = useServices();
  const { data: countries = [] } = useCountries();

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-ink">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-28">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-ink-foreground/85">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Fast, secure verification across 50+ countries
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.05] text-ink-foreground sm:text-5xl lg:text-6xl">
              Fast & Reliable <span className="text-gradient-accent">SMS Verification</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-foreground/75 sm:text-lg">
              Gigz Exchange provides customers with access to SMS verification services through a
              simple and easy-to-use platform. Choose a country, pick a service, and receive your
              code — no contracts, no complexity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/register">
                  Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground">
                <Link to="/services">View Services</Link>
              </Button>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-2xl font-bold text-ink-foreground sm:text-3xl">{s.value}</dt>
                  <dd className="mt-1 text-xs text-ink-foreground/60">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-[var(--shadow-lift)]">
              <img
                src={heroImage}
                alt="Gigz Exchange dashboard showing a verification number, OTP code and country availability"
                width={1440}
                height={1008}
                className="w-full"
              />
            </div>
            <div className="absolute -bottom-5 left-5 hidden rounded-2xl border border-white/10 bg-ink/90 px-4 py-3 backdrop-blur sm:block">
              <p className="text-[11px] uppercase tracking-[0.14em] text-ink-foreground/50">Code received</p>
              <p className="font-display text-lg font-bold tracking-[0.3em] text-accent">834512</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <Section
        eyebrow="Why Gigz Exchange"
        title="Everything you need to verify, nothing you don't"
        description="A focused platform built around one job: getting you a working number fast."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((f) => (
            <div key={f.title} className="surface-card p-6 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/12 text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Services */}
      <Section
        eyebrow="Available services"
        title="Verify on the platforms that matter"
        description="Live catalogue of the platforms our numbers support."
        action={<Link to="/services" className="text-sm font-semibold text-foreground hover:text-accent">All services →</Link>}
        muted
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 9).map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors hover:border-accent/50">
              <div className="flex items-center gap-3">
                <ServiceIcon service={s.code} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.category}</p>
                </div>
              </div>
              <p className="text-sm font-semibold">{ngn(Number(s.base_price))}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Countries */}
      <Section
        eyebrow="Supported countries"
        title="Local numbers, global reach"
        description="Live availability across every major region."
        action={<Link to="/countries" className="text-sm font-semibold text-foreground hover:text-accent">All countries →</Link>}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {countries.slice(0, 8).map((c) => (
            <div key={c.id} className="surface-card px-4 py-4 transition-shadow hover:shadow-[var(--shadow-lift)]">
              <div className="flex items-center gap-3">
                <CountryFlag country={c.country_code} name={c.name} size="lg" />
                <div>
                  <p className="text-sm font-semibold">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.numbers_available.toLocaleString()} numbers</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                from <span className="font-semibold text-foreground">{ngn(Number(c.base_price))}</span>
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section eyebrow="How it works" title="Four steps to a verified account" description="No onboarding calls. No setup fees." muted>
        <div className="relative grid gap-4 md:grid-cols-4">
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-border md:block" />
          {steps.map((s) => (
            <div key={s.n} className="relative surface-card p-6">
              <span className="font-display text-xs font-bold tracking-[0.2em] text-accent">{s.n}</span>
              <h3 className="mt-3 text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Pricing teaser */}
      <Section eyebrow="Simple pricing" title="Pay as you go, or scale with volume" description="Mock pricing for the prototype.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { name: "Pay as you go", price: "₦270", note: "per verification, from", features: ["No monthly fee", "Automatic refunds", "All countries"] },
            { name: "Volume", price: "-25%", note: "on ₦375,000+ monthly spend", features: ["Bulk discounts", "Priority routes", "API access"], featured: true },
            { name: "Enterprise", price: "Custom", note: "contact sales", features: ["Dedicated pools", "SLA & invoicing", "Account manager"] },
          ].map((p) => (
            <div
              key={p.name}
              className={
                p.featured
                  ? "relative overflow-hidden rounded-2xl gradient-ink p-6 text-ink-foreground shadow-[var(--shadow-lift)]"
                  : "surface-card p-6"
              }
            >
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="mt-3 font-display text-3xl font-bold">{p.price}</p>
              <p className={p.featured ? "mt-1 text-xs text-ink-foreground/60" : "mt-1 text-xs text-muted-foreground"}>{p.note}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-accent" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button asChild variant="outline"><Link to="/pricing">See full pricing</Link></Button>
        </div>
      </Section>

      {/* Security */}
      <section className="border-y border-border gradient-ink">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Security & reliability</p>
            <h2 className="mt-3 text-3xl font-bold text-ink-foreground sm:text-4xl">
              Infrastructure you can build on
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-foreground/70">
              Every order is isolated, encrypted in transit, and monitored end to end. Redundant
              routing keeps delivery consistent even when a single provider degrades.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Lock, t: "Encrypted in transit", d: "TLS 1.3 across the platform." },
              { icon: ShieldCheck, t: "Single-use numbers", d: "Never shared between customers." },
              { icon: MessageSquareText, t: "Delivery monitoring", d: "Routes scored continuously." },
              { icon: Clock3, t: "99% availability", d: "Placeholder uptime target." },
            ].map((i) => (
              <div key={i.t} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <i.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-sm font-semibold text-ink-foreground">{i.t}</p>
                <p className="mt-1 text-xs text-ink-foreground/60">{i.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Questions, answered" description="Can't find what you need? Our team replies within a few hours.">
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="surface-card divide-y divide-border px-5">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q} className="border-none">
                <AccordionTrigger className="text-left text-sm font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 text-center">
            <Link to="/faq" className="text-sm font-semibold hover:text-accent">Read all FAQs →</Link>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="px-5 pb-20">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl gradient-ink px-8 py-14 text-center shadow-[var(--shadow-lift)]">
          <h2 className="text-3xl font-bold text-ink-foreground sm:text-4xl">Start verifying in minutes</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-foreground/70">
            Create a free account, top up your wallet, and get your first number today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg"><Link to="/register">Get Started</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-white/5 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground">
              <Link to="/contact">Talk to sales</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
  action,
  muted,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <section className={muted ? "bg-secondary/40 py-16 sm:py-20" : "py-16 sm:py-20"}>
      <div className="mx-auto max-w-7xl px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h2>
            {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action}
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}

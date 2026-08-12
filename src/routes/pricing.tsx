import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { countries } from "@/lib/mock-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Pay As You Go & Volume | Gigz Exchange" },
      { name: "description", content: "Transparent per-verification pricing, volume discounts and enterprise agreements for Gigz Exchange." },
      { property: "og:title", content: "Pricing — Pay As You Go & Volume | Gigz Exchange" },
      { property: "og:description", content: "Per-verification pricing, volume discounts and enterprise agreements." },
    ],
  }),
  component: PricingPage,
});

const plans = [
  {
    name: "Pay as you go",
    price: "$0.18",
    unit: "per verification, from",
    body: "Best for individuals and occasional verification needs.",
    cta: "Create account",
    to: "/register",
    features: ["No monthly fee", "All 50+ countries", "Automatic refunds on expiry", "Wallet top-ups from $5", "Email support"],
  },
  {
    name: "Volume",
    price: "Up to 25% off",
    unit: "on $250+ monthly spend",
    body: "For teams running verification at consistent scale.",
    cta: "Start scaling",
    to: "/register",
    featured: true,
    features: ["Tiered bulk discounts", "Priority delivery routes", "Full REST API access", "Usage analytics & exports", "Priority ticket queue"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "contact our team",
    body: "Dedicated capacity, invoicing and contractual SLAs.",
    cta: "Contact sales",
    to: "/contact",
    features: ["Dedicated number pools", "Custom SLA & uptime credits", "Invoiced billing", "Named account manager", "Security review support"],
  },
];

const tiers = [
  { spend: "$0 – $249", discount: "—", support: "Email" },
  { spend: "$250 – $999", discount: "10%", support: "Priority email" },
  { spend: "$1,000 – $4,999", discount: "18%", support: "Priority + chat" },
  { spend: "$5,000+", discount: "25%", support: "Dedicated manager" },
];

function PricingPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="Pricing"
        title="Straightforward pricing, no surprises"
        description="All figures below are mock pricing for the Phase 1 prototype. No payments are processed."
      />
      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.featured
                  ? "relative flex flex-col overflow-hidden rounded-3xl gradient-ink p-7 text-ink-foreground shadow-[var(--shadow-lift)]"
                  : "surface-card flex flex-col p-7"
              }
            >
              {p.featured ? (
                <span className="absolute right-6 top-6 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-accent-foreground">
                  Most popular
                </span>
              ) : null}
              <h2 className="text-lg font-semibold">{p.name}</h2>
              <p className={p.featured ? "mt-1 text-sm text-ink-foreground/70" : "mt-1 text-sm text-muted-foreground"}>{p.body}</p>
              <p className="mt-6 font-display text-4xl font-bold">{p.price}</p>
              <p className={p.featured ? "mt-1 text-xs text-ink-foreground/60" : "mt-1 text-xs text-muted-foreground"}>{p.unit}</p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className={p.featured ? "text-ink-foreground/85" : ""}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-7 w-full" variant={p.featured ? "default" : "outline"}>
                <Link to={p.to}>{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          <div className="surface-card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold">Volume discount tiers</h3>
              <p className="text-xs text-muted-foreground">Applied automatically to monthly spend.</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monthly spend</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Support</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((t) => (
                  <TableRow key={t.spend}>
                    <TableCell className="font-medium">{t.spend}</TableCell>
                    <TableCell>{t.discount}</TableCell>
                    <TableCell className="text-muted-foreground">{t.support}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-border px-6 py-4">
              <h3 className="text-base font-semibold">Sample country rates</h3>
              <p className="text-xs text-muted-foreground">Starting price per verification.</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.slice(0, 6).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <span className="mr-2">{c.flag}</span>
                      {c.name}
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{c.availability}</TableCell>
                    <TableCell className="text-right font-semibold">${c.price.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

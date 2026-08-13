import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Common Questions | Gigz Exchange" },
      { name: "description", content: "Answers about delivery times, refunds, supported countries, API access and account security on Gigz Exchange." },
      { property: "og:title", content: "FAQ — Common Questions | Gigz Exchange" },
      { property: "og:description", content: "Delivery times, refunds, coverage, API access and account security." },
    ],
  }),
  component: FaqPage,
});

const groups = [
  {
    title: "Getting started",
    items: [
      { q: "What is Gigz Exchange?", a: "Gigz Exchange is a platform that gives customers access to SMS verification numbers across 50+ countries through a single dashboard and API." },
      { q: "Do I need to sign a contract?", a: "No. Pay-as-you-go accounts have no minimum spend or contract. Enterprise agreements are available if you need invoicing or an SLA." },
      { q: "How much does a verification cost?", a: "Prices start from ₦270 per verification depending on country and service. All prices in this prototype are demo data." },
    ],
  },
  {
    title: "Orders & delivery",
    items: [
      { q: "How fast do codes arrive?", a: "Most codes arrive within 10–60 seconds. Each order has a visible expiry timer in the dashboard." },
      { q: "What happens if no SMS arrives?", a: "The order expires and the amount is refunded to your wallet automatically — you are never charged for a failed verification." },
      { q: "Can I cancel an order?", a: "Yes. Waiting orders can be cancelled at any time before a code arrives, and the funds return to your wallet immediately." },
      { q: "Can I reuse the same number?", a: "Numbers are single-use per service. While an order is active you can request a repeat SMS to the same number." },
    ],
  },
  {
    title: "Billing & API",
    items: [
      { q: "Which payment methods are supported?", a: "This Phase 1 prototype uses demo payment methods only. Real payment providers will be connected in Phase 2." },
      { q: "Is there an API?", a: "The dashboard includes an API section with key management, usage statistics and documentation placeholders. The live API ships in Phase 2." },
      { q: "How is my account secured?", a: "Accounts support password changes, two-factor authentication and login activity review from the security settings." },
    ],
  },
];

function FaqPage() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        description="Everything customers usually ask before their first verification."
      />
      <section className="mx-auto max-w-4xl px-5 py-14">
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.title}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">{g.title}</h2>
              <Accordion type="single" collapsible className="surface-card mt-4 divide-y divide-border px-5">
                {g.items.map((i) => (
                  <AccordionItem key={i.q} value={i.q} className="border-none">
                    <AccordionTrigger className="text-left text-sm font-semibold">{i.q}</AccordionTrigger>
                    <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{i.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
        <div className="surface-card mt-12 flex flex-col items-center gap-4 p-8 text-center">
          <h3 className="text-lg font-semibold">Still have a question?</h3>
          <p className="max-w-md text-sm text-muted-foreground">Our support team typically replies within a few hours.</p>
          <Button asChild><Link to="/contact">Contact support</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, MessageSquareText, MousePointerClick, UserPlus } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Verify in 4 Steps | Gigz Exchange" },
      { name: "description", content: "Create an account, add funds, select a service and country, then receive your verification SMS in seconds." },
      { property: "og:title", content: "How It Works — Verify in 4 Steps | Gigz Exchange" },
      { property: "og:description", content: "Create an account, add funds, pick a number, receive your code." },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { icon: UserPlus, n: "01", title: "Create an account", body: "Register with your email in under a minute. No documents, no waiting list.", detail: "You'll land straight in the dashboard with your account ID and wallet ready." },
  { icon: CreditCard, n: "02", title: "Add funds", body: "Top up your wallet from ₦7,500. Your balance is visible on every screen.", detail: "Payment methods shown in this prototype are demo placeholders." },
  { icon: MousePointerClick, n: "03", title: "Select service & country", body: "Filter live inventory by country and service, then request your number.", detail: "Pricing and availability update as you choose." },
  { icon: MessageSquareText, n: "04", title: "Receive your SMS", body: "Your verification code appears in the dashboard the moment it arrives.", detail: "If nothing arrives before the timer runs out, you're refunded automatically." },
];

function HowItWorks() {
  return (
    <PublicLayout>
      <PageHero
        eyebrow="How it works"
        title="From sign-up to verified in four steps"
        description="A deliberately short flow — most customers complete their first verification within five minutes."
      />
      <section className="mx-auto max-w-5xl px-5 py-16">
        <ol className="relative space-y-6">
          <div className="absolute bottom-8 left-[27px] top-8 hidden w-px bg-border sm:block" />
          {steps.map((s) => (
            <li key={s.n} className="relative flex flex-col gap-5 sm:flex-row">
              <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-ink text-accent shadow-[var(--shadow-card)]">
                <s.icon className="h-6 w-6" />
              </span>
              <div className="surface-card flex-1 p-6">
                <p className="font-display text-xs font-bold tracking-[0.2em] text-accent">STEP {s.n}</p>
                <h2 className="mt-2 text-xl font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <p className="mt-3 rounded-xl bg-secondary/70 px-4 py-3 text-xs text-muted-foreground">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">Get Started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/services">View Services</Link></Button>
        </div>
      </section>
    </PublicLayout>
  );
}

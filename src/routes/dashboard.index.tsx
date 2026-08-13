import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  ListChecks,
  PhoneCall,
  Plus,
  Wallet,
} from "lucide-react";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { orders, transactions, statusLabels } from "@/lib/mock-data";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Gigz Exchange" },
      { name: "description", content: "Your Gigz Exchange overview: wallet balance, active orders, recent transactions and quick actions." },
      { property: "og:title", content: "Dashboard — Gigz Exchange" },
      { property: "og:description", content: "Wallet balance, active orders and recent activity at a glance." },
    ],
  }),
  component: DashboardHome,
});

const activity = [
  { at: "14:02", text: "Purchased WhatsApp number · United States" },
  { at: "13:41", text: "SMS received for order GX-90408" },
  { at: "09:15", text: "Wallet topped up with ₦75,000 (demo)" },
  { at: "Yesterday", text: "API key gx_live_••••7f21 generated" },
  { at: "Yesterday", text: "Signed in from Chrome · macOS" },
];

function DashboardHome() {
  return (
    <CustomerShell
      title="Welcome back, Ada"
      subtitle="Here's what's happening on your account today."
      actions={
        <>
          <Button asChild variant="outline"><Link to="/dashboard/wallet"><Plus className="mr-1.5 h-4 w-4" />Add funds</Link></Button>
          <Button asChild><Link to="/dashboard/buy"><PhoneCall className="mr-1.5 h-4 w-4" />Buy number</Link></Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wallet balance" value="₦192,510" icon={Wallet} hint="Available to spend" />
        <StatCard label="Active orders" value="2" icon={ListChecks} hint="1 waiting for SMS" />
        <StatCard label="Completed orders" value="1,284" icon={CheckCircle2} trend="+12%" hint="vs last month" />
        <StatCard label="Total spent" value="₦1,113,290" icon={CreditCard} hint="Lifetime" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="surface-card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to="/dashboard/history" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                <span className="text-xl">{o.flag}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.service} · {o.country}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.number} · {o.id}</p>
                </div>
                <StatusBadge status={o.status} label={statusLabels[o.status]} />
                <span className="w-16 text-right text-sm font-semibold">{ngn(o.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              {[
                { to: "/dashboard/buy", label: "Buy a number", icon: PhoneCall },
                { to: "/dashboard/wallet", label: "Add funds", icon: Wallet },
                { to: "/dashboard/orders", label: "View active orders", icon: ListChecks },
                { to: "/dashboard/api", label: "Manage API keys", icon: CreditCard },
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:border-accent/50 hover:bg-secondary/60"
                >
                  <a.icon className="h-4 w-4 text-accent" />
                  {a.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="text-sm font-semibold">Account activity</h2>
            <ul className="mt-4 space-y-4">
              {activity.map((a) => (
                <li key={a.text} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <div>
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent transactions</h2>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <ul className="divide-y divide-border">
          {transactions.slice(0, 5).map((t) => (
            <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.type} · {t.description}</p>
                <p className="text-xs text-muted-foreground">{t.date} · {t.id}</p>
              </div>
              <StatusBadge status={t.status} />
              <span className={t.amount >= 0 ? "w-20 text-right text-sm font-semibold text-success" : "w-20 text-right text-sm font-semibold"}>
                {t.amount >= 0 ? "+" : "−"}{ngn(Math.abs(t.amount))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CustomerShell>
  );
}

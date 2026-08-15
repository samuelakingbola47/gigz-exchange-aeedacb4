import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Inbox,
  ListChecks,
  PhoneCall,
  Plus,
  Wallet,
} from "lucide-react";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { useProfile } from "@/lib/auth";
import { useOrders, useTransactions, useWallet } from "@/lib/queries";
import { formatDateTime, orderStatusLabel } from "@/lib/format";

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

function DashboardHome() {
  const { data: profile } = useProfile();
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: transactions = [] } = useTransactions(5);

  const firstName = (profile?.full_name?.trim() || profile?.email?.split("@")[0] || "there").split(" ")[0];
  const activeCount = orders.filter((o) => o.status === "waiting" || o.status === "sms_received").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.price), 0);

  return (
    <CustomerShell
      title={`Welcome back, ${firstName}`}
      subtitle="Here's what's happening on your account today."
      actions={
        <>
          <Button asChild variant="outline"><Link to="/dashboard/wallet"><Plus className="mr-1.5 h-4 w-4" />Add funds</Link></Button>
          <Button asChild><Link to="/dashboard/buy"><PhoneCall className="mr-1.5 h-4 w-4" />Buy number</Link></Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Wallet balance"
          value={walletLoading ? "—" : ngn(Number(wallet?.balance ?? 0))}
          icon={Wallet}
          hint="Available to spend"
        />
        <StatCard label="Active orders" value={String(activeCount)} icon={ListChecks} hint="Waiting or holding a code" />
        <StatCard label="Completed orders" value={String(completedCount)} icon={CheckCircle2} hint="Lifetime" />
        <StatCard label="Total spent" value={ngn(totalSpent)} icon={CreditCard} hint="Lifetime" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="surface-card overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link to="/dashboard/history" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground">
              View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-3 p-5">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Inbox}
                title="No orders yet"
                description="Buy your first verification number and it will show up here instantly."
                action={<Button asChild><Link to="/dashboard/buy">Buy a number</Link></Button>}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <ServiceIcon service={o.service} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.service} · {o.country}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.phone_number} · {o.order_reference}</p>
                  </div>
                  <StatusBadge status={o.status} label={orderStatusLabel(o.status)} />
                  <span className="w-20 text-right text-sm font-semibold">{ngn(Number(o.price))}</span>
                </li>
              ))}
            </ul>
          )}
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
            <h2 className="text-sm font-semibold">Account</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Email</dt>
                <dd className="truncate font-medium">{profile?.email ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={profile?.status === "active" ? "Active" : (profile?.status ?? "Active")} /></dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Member since</dt>
                <dd className="font-medium">{profile ? new Date(profile.created_at).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) : "—"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent transactions</h2>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No transactions yet — your wallet activity will appear here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold capitalize">{t.type} · {t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(t.created_at)} · {t.reference}</p>
                </div>
                <StatusBadge status={t.status === "completed" ? "Completed" : t.status} />
                <span className={Number(t.amount) >= 0 ? "w-24 text-right text-sm font-semibold text-success" : "w-24 text-right text-sm font-semibold"}>
                  {Number(t.amount) >= 0 ? "+" : "−"}{ngn(Math.abs(Number(t.amount)))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Banknote, Package, ShoppingCart, Users } from "lucide-react";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { useAdminOrders, useAdminProfiles, useAdminTransactions, useCountries } from "@/lib/queries";
import { orderStatusLabel } from "@/lib/format";
import { ngn, ngnCompact } from "@/lib/currency";
import { EmptyState } from "@/components/app/EmptyState";
import { ServiceIcon } from "@/components/brand/ServiceIcon";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Overview — Gigz Exchange" },
      { name: "description", content: "Platform-wide metrics for Gigz Exchange: users, orders, revenue, inventory and system status." },
      { property: "og:title", content: "Admin Overview — Gigz Exchange" },
      { property: "og:description", content: "Users, orders, revenue and system status at a glance." },
    ],
  }),
  component: AdminOverview,
});

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 } as const;

function AdminOverview() {
  const { data: orders = [] } = useAdminOrders();
  const { data: profiles = [] } = useAdminProfiles();
  const { data: transactions = [] } = useAdminTransactions();
  const { data: countries = [] } = useCountries();

  const revenue = transactions
    .filter((t) => t.type === "purchase")
    .reduce((a, t) => a + Math.abs(Number(t.amount)), 0);
  const pending = orders.filter((o) => o.status === "waiting").length;
  const available = countries.reduce((a, c) => a + c.numbers_available, 0);
  const activeUsers = profiles.filter((p) => p.last_login_at).length;

  const monthly = buildMonthlySeries(orders, transactions);
  const growth = buildUserGrowth(profiles);

  return (
    <AdminShell title="Platform overview" subtitle="Live platform metrics from your Gigz Exchange database.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value={profiles.length.toLocaleString()} icon={Users} hint="Registered accounts" />
        <StatCard label="Active users" value={activeUsers.toLocaleString()} icon={Activity} hint="Signed in at least once" />
        <StatCard label="Total orders" value={orders.length.toLocaleString()} icon={ShoppingCart} hint="Lifetime" />
        <StatCard label="Revenue" value={revenue > 0 ? ngnCompact(revenue) : ngn(0)} icon={Banknote} hint="All purchases" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending orders" value={pending.toLocaleString()} hint="Awaiting SMS" />
        <StatCard label="Available numbers" value={available.toLocaleString()} icon={Package} hint="Across all countries" />
        <StatCard label="System status" value="Operational" hint="All services healthy" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="surface-card p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Revenue</h2>
          <p className="text-xs text-muted-foreground">Monthly gross revenue (₦)</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...axis} />
                <YAxis tickLine={false} axisLine={false} {...axis} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-accent)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">User growth</h2>
          <p className="text-xs text-muted-foreground">Registered accounts</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...axis} />
                <YAxis tickLine={false} axisLine={false} {...axis} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Line type="monotone" dataKey="users" stroke="var(--color-info)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Orders per month</h2>
          <div className="mt-5 h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...axis} />
                <YAxis tickLine={false} axisLine={false} {...axis} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Bar dataKey="orders" fill="var(--color-ink)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Latest orders</h2></div>
          {orders.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="No orders yet" description="Orders placed by customers will appear here." />
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                  <ServiceIcon service={o.service_code} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.order_reference} · {o.service}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.phone_number ?? "Awaiting number"}</p>
                  </div>
                  <StatusBadge status={o.status} label={orderStatusLabel(o.status)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

function monthKey(value: string) {
  return new Date(value).toLocaleDateString("en-NG", { month: "short" });
}

function lastMonths(count: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toLocaleDateString("en-NG", { month: "short" }));
  }
  return out;
}

function buildMonthlySeries(
  orders: { created_at: string }[],
  transactions: { created_at: string; type: string; amount: number | string }[],
) {
  const months = lastMonths(6);
  return months.map((month) => ({
    month,
    revenue: transactions
      .filter((t) => t.type === "purchase" && monthKey(t.created_at) === month)
      .reduce((a, t) => a + Math.abs(Number(t.amount)), 0),
    orders: orders.filter((o) => monthKey(o.created_at) === month).length,
  }));
}

function buildUserGrowth(profiles: { created_at: string }[]) {
  const months = lastMonths(6);
  let running = 0;
  return months.map((month) => {
    running += profiles.filter((p) => monthKey(p.created_at) === month).length;
    return { month, users: running };
  });
}

import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, Banknote, Package, ShoppingCart, Users } from "lucide-react";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { orders, revenueSeries, statusLabels, userGrowth } from "@/lib/mock-data";
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
  return (
    <AdminShell title="Platform overview" subtitle="All figures are demo data for the Phase 1 prototype.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total users" value="10,820" icon={Users} trend="+8.4%" hint="vs last month" />
        <StatCard label="Active users (30d)" value="6,412" icon={Activity} trend="+5.1%" hint="logged in" />
        <StatCard label="Total orders" value="213,904" icon={ShoppingCart} trend="+11%" hint="lifetime" />
        <StatCard label="Revenue (Aug)" value="₦59.9M" icon={Banknote} trend="+14.8%" hint="month to date" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pending orders" value="48" hint="Awaiting SMS" />
        <StatCard label="Available numbers" value="182,340" icon={Package} hint="Across all providers" />
        <StatCard label="System status" value="Operational" hint="All services healthy" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-3">
        <div className="surface-card p-5 xl:col-span-2">
          <h2 className="text-sm font-semibold">Revenue</h2>
          <p className="text-xs text-muted-foreground">Monthly gross revenue (₦)</p>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
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
              <LineChart data={userGrowth}>
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
              <BarChart data={revenueSeries}>
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
          <ul className="divide-y divide-border">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                <ServiceIcon service={o.service} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.id} · {o.service}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.number}</p>
                </div>
                <StatusBadge status={o.status} label={statusLabels[o.status]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}

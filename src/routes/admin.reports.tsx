import { createFileRoute } from "@tanstack/react-router";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { countries, revenueSeries, services, userGrowth } from "@/lib/mock-data";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics — Gigz Exchange Admin" },
      { name: "description", content: "Revenue, order volume and growth analytics with top services and countries." },
      { property: "og:title", content: "Reports & Analytics — Gigz Exchange Admin" },
      { property: "og:description", content: "Revenue, volume and growth analytics with top performers." },
    ],
  }),
  component: AdminReports,
});

const axis = { stroke: "var(--color-muted-foreground)", fontSize: 11 } as const;

function AdminReports() {
  return (
    <AdminShell
      title="Reports"
      subtitle="Demo analytics for the Phase 1 prototype."
      actions={<Button variant="outline" onClick={() => toast("Report export queued (demo)")}>Export report</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Revenue (Aug)" value="$39,900" trend="+14.8%" />
        <StatCard label="Orders (Aug)" value="42,600" trend="+11.5%" />
        <StatCard label="New users (Aug)" value="1,420" trend="+15.1%" />
        <StatCard label="Success rate" value="98.6%" hint="Delivered codes" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Revenue vs orders</h2>
          <div className="mt-5 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} {...axis} />
                <YAxis tickLine={false} axisLine={false} {...axis} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }} />
                <Bar dataKey="revenue" fill="var(--color-accent)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="orders" fill="var(--color-ink)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">User growth</h2>
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
        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Top services</h2></div>
          <Table>
            <TableHeader><TableRow><TableHead>Service</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {services.slice(0, 6).map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell><span className="mr-2">{s.emoji}</span>{s.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{(9800 - i * 1100).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{ngn(((9800 - i * 1100) * s.price))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Top countries</h2></div>
          <Table>
            <TableHeader><TableRow><TableHead>Country</TableHead><TableHead className="text-right">Orders</TableHead><TableHead className="text-right">Revenue</TableHead></TableRow></TableHeader>
            <TableBody>
              {countries.slice(0, 6).map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell><span className="mr-2">{c.flag}</span>{c.name}</TableCell>
                  <TableCell className="text-right tabular-nums">{(8600 - i * 950).toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{ngn(((8600 - i * 950) * c.price))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

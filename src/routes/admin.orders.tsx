import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminOrders } from "@/lib/queries";
import { formatDateTime, orderStatusLabel, orderStatusLabels } from "@/lib/format";
import { CountryFlag } from "@/components/brand/CountryFlag";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({
    meta: [
      { title: "Order Management — Gigz Exchange Admin" },
      { name: "description", content: "Monitor every verification order across the platform, filter by status and issue refunds." },
      { property: "og:title", content: "Order Management — Gigz Exchange Admin" },
      { property: "og:description", content: "Monitor platform orders, filter by status and issue refunds." },
    ],
  }),
  component: AdminOrders,
});

function AdminOrders() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const { data: orders = [] } = useAdminOrders();
  const term = q.toLowerCase();
  const rows = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (o.order_reference.toLowerCase().includes(term) ||
        (o.phone_number ?? "").includes(q) ||
        o.service.toLowerCase().includes(term)),
  );
  const waiting = orders.filter((o) => o.status === "waiting").length;
  const completed = orders.filter((o) => o.status === "completed").length;
  const refunded = orders.filter((o) => o.status === "cancelled" || o.status === "expired").length;

  return (
    <AdminShell title="Orders" subtitle="Every verification order across the platform.">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total orders" value={orders.length.toLocaleString()} hint="Most recent 200" />
        <StatCard label="Waiting" value={waiting.toLocaleString()} hint="SMS pending" />
        <StatCard label="Completed" value={completed.toLocaleString()} hint="Code delivered" />
        <StatCard label="Cancelled / expired" value={refunded.toLocaleString()} hint="Auto-refunds" />
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order ID, number or service" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.keys(orderStatusLabels).map((s) => (
                <SelectItem key={s} value={s}>{orderStatusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title={orders.length === 0 ? "No orders yet" : "No orders match"} description={orders.length === 0 ? "No orders have been placed on the platform yet." : "Adjust your filters to see more results."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.order_reference}</TableCell>
                    <TableCell><span className="flex items-center gap-2"><ServiceIcon service={o.service_code} size="sm" plain />{o.service}</span></TableCell>
                    <TableCell className="font-mono text-xs"><span className="flex items-center gap-2"><CountryFlag country={o.country_code} name={o.country} size="sm" />{o.phone_number ?? "—"}</span></TableCell>
                    <TableCell><StatusBadge status={o.status} label={orderStatusLabel(o.status)} /></TableCell>
                    <TableCell className="font-mono text-xs">{o.verification_code ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">{ngn(Number(o.price))}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(o.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.success(`Refund issued for ${o.order_reference} (demo)`)}>Refund</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

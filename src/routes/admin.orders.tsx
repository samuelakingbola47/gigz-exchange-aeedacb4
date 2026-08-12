import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { orders, statusLabels, type OrderStatus } from "@/lib/mock-data";

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
  const rows = orders.filter(
    (o) =>
      (status === "all" || o.status === status) &&
      (o.id.toLowerCase().includes(q.toLowerCase()) || o.number.includes(q) || o.service.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <AdminShell title="Orders" subtitle="Every verification order across the platform.">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Orders today" value="1,428" trend="+6.2%" hint="vs yesterday" />
        <StatCard label="Waiting" value="48" hint="SMS pending" />
        <StatCard label="Success rate" value="98.6%" hint="Last 24 hours" />
        <StatCard label="Refunded" value="112" hint="Auto-refunds" />
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
              {(Object.keys(statusLabels) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="No orders match" description="Adjust your filters to see more results." />
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
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell><span className="mr-1.5">{o.flag}</span>{o.service}</TableCell>
                    <TableCell className="font-mono text-xs">{o.number}</TableCell>
                    <TableCell><StatusBadge status={o.status} label={statusLabels[o.status]} /></TableCell>
                    <TableCell className="font-mono text-xs">{o.code ?? "—"}</TableCell>
                    <TableCell className="text-right tabular-nums">${o.price.toFixed(2)}</TableCell>
                    <TableCell className="text-muted-foreground">{o.created}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.success(`Refund issued for ${o.id} (demo)`)}>Refund</Button>
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

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { orders, statusLabels } from "@/lib/mock-data";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({
    meta: [
      { title: "Order History — Gigz Exchange" },
      { name: "description", content: "Search, filter and export every verification order placed on your Gigz Exchange account." },
      { property: "og:title", content: "Order History — Gigz Exchange" },
      { property: "og:description", content: "Search and filter your full verification order history." },
    ],
  }),
  component: OrderHistory,
});

const PAGE = 6;

function OrderHistory() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          `${o.id} ${o.country} ${o.service} ${o.number}`.toLowerCase().includes(q.toLowerCase()),
      ),
    [q, status],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);

  return (
    <CustomerShell
      title="Order history"
      subtitle="Every order placed on your account."
      actions={<Button variant="outline"><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>}
    >
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search order ID, number, service…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <div className="mt-5">
          <EmptyState icon={Search} title="No orders match" description="Try clearing your filters or searching a different term." />
        </div>
      ) : (
        <>
          <div className="surface-card mt-5 hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Number</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell className="text-muted-foreground">{o.created}</TableCell>
                    <TableCell>{o.flag} {o.country}</TableCell>
                    <TableCell>{o.service}</TableCell>
                    <TableCell>{o.number}</TableCell>
                    <TableCell>{ngn(o.price)}</TableCell>
                    <TableCell><StatusBadge status={o.status} label={statusLabels[o.status]} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 grid gap-3 md:hidden">
            {rows.map((o) => (
              <div key={o.id} className="surface-card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold">{o.flag} {o.service}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · {o.created}</p>
                  </div>
                  <StatusBadge status={o.status} label={statusLabels[o.status]} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{o.number}</span>
                  <span className="font-semibold">{ngn(o.price)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(current - 1) * PAGE + 1}–{Math.min(current * PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </CustomerShell>
  );
}

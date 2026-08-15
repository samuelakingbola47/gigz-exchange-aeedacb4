import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { History as HistoryIcon, Search } from "lucide-react";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CountryFlag } from "@/components/brand/CountryFlag";
import { useOrders } from "@/lib/queries";
import { formatDateTime, orderStatusLabel, orderStatusLabels } from "@/lib/format";

export const Route = createFileRoute("/dashboard/history")({
  head: () => ({
    meta: [
      { title: "Order History — Gigz Exchange" },
      { name: "description", content: "Search, filter and review every verification order placed on your Gigz Exchange account." },
      { property: "og:title", content: "Order History — Gigz Exchange" },
      { property: "og:description", content: "Search and filter your full verification order history." },
    ],
  }),
  component: OrderHistory,
});

const PAGE = 8;

function OrderHistory() {
  const { data: orders = [], isLoading } = useOrders();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (status === "all" || o.status === status) &&
          `${o.order_reference} ${o.country} ${o.service} ${o.phone_number ?? ""}`
            .toLowerCase()
            .includes(q.toLowerCase()),
      ),
    [orders, q, status],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE, current * PAGE);

  return (
    <CustomerShell title="Order history" subtitle="Every order placed on your account.">
      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search order ID, number, service…" className="pl-9" />
        </div>
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="sm:w-52"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {Object.entries(orderStatusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="surface-card mt-5 space-y-3 p-5">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={HistoryIcon}
            title={orders.length === 0 ? "No orders yet" : "No matching orders"}
            description={orders.length === 0
              ? "Your completed, expired and cancelled orders will be listed here."
              : "Try a different search term or status filter."}
            action={orders.length === 0 ? <Button asChild><Link to="/dashboard/buy">Buy a number</Link></Button> : undefined}
          />
        </div>
      ) : (
        <>
          <div className="surface-card mt-5 hidden overflow-hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_reference}</TableCell>
                    <TableCell><span className="flex items-center gap-2"><CountryFlag country={o.country_code} name={o.country} size="sm" />{o.country}</span></TableCell>
                    <TableCell><span className="flex items-center gap-2"><ServiceIcon service={o.service_code} size="sm" plain />{o.service}</span></TableCell>
                    <TableCell>{o.phone_number}</TableCell>
                    <TableCell className="tabular-nums">{o.verification_code ?? "—"}</TableCell>
                    <TableCell>{ngn(Number(o.price))}</TableCell>
                    <TableCell><StatusBadge status={o.status} label={orderStatusLabel(o.status)} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(o.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-5 grid gap-4 lg:hidden">
            {rows.map((o) => (
              <div key={o.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold"><ServiceIcon service={o.service_code} size="sm" plain />{o.service}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.order_reference} · {o.country}</p>
                  </div>
                  <StatusBadge status={o.status} label={orderStatusLabel(o.status)} />
                </div>
                <p className="mt-3 text-sm font-medium">{o.phone_number}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{formatDateTime(o.created_at)}</span>
                  <span className="font-semibold text-foreground">{ngn(Number(o.price))}</span>
                </div>
              </div>
            ))}
          </div>

          {pages > 1 ? (
            <div className="mt-5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">Page {current} of {pages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>Next</Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </CustomerShell>
  );
}

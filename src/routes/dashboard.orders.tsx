import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { orders, statusLabels } from "@/lib/mock-data";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CountryFlag } from "@/components/brand/CountryFlag";

export const Route = createFileRoute("/dashboard/orders")({
  head: () => ({
    meta: [
      { title: "Active Orders — Gigz Exchange" },
      { name: "description", content: "Track every active verification order, its number, status and expiry timer in one place." },
      { property: "og:title", content: "Active Orders — Gigz Exchange" },
      { property: "og:description", content: "Track numbers, statuses and expiry timers for live orders." },
    ],
  }),
  component: ActiveOrders,
});

const active = orders.filter((o) => o.status === "waiting" || o.status === "sms_received");

function ActiveOrders() {
  return (
    <CustomerShell
      title="Active orders"
      subtitle="Orders currently waiting for or holding a verification code."
      actions={<Button asChild><Link to="/dashboard/buy">Buy number</Link></Button>}
    >
      {active.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No active orders"
          description="When you request a number it will appear here with its live status and timer."
          action={<Button asChild><Link to="/dashboard/buy">Buy a number</Link></Button>}
        />
      ) : (
        <>
          <div className="surface-card hidden overflow-hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Phone number</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.id}</TableCell>
                    <TableCell><span className="flex items-center gap-2"><CountryFlag country={o.country} size="sm" />{o.country}</span></TableCell>
                    <TableCell>{o.service}</TableCell>
                    <TableCell className="font-medium">{o.number}</TableCell>
                    <TableCell>{ngn(o.price)}</TableCell>
                    <TableCell><StatusBadge status={o.status} label={statusLabels[o.status]} /></TableCell>
                    <TableCell className="text-muted-foreground">{o.created}</TableCell>
                    <TableCell className="tabular-nums">{o.expires}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => toast("Repeat SMS requested (demo)")}>
                          <RefreshCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => toast("Order cancelled (demo)")}>
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {active.map((o) => (
              <div key={o.id} className="surface-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold"><ServiceIcon service={o.service} size="sm" plain />{o.service}</p>
                    <p className="text-xs text-muted-foreground">{o.id} · {o.country}</p>
                  </div>
                  <StatusBadge status={o.status} label={statusLabels[o.status]} />
                </div>
                <p className="mt-4 font-display text-lg font-bold">{o.number}</p>
                {o.code ? <p className="mt-1 text-sm text-accent">Code: <span className="font-bold tracking-[0.2em]">{o.code}</span></p> : null}
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold">{ngn(o.price)}</dd></div>
                  <div><dt className="text-muted-foreground">Created</dt><dd className="font-semibold">{o.created.slice(11)}</dd></div>
                  <div><dt className="text-muted-foreground">Expires</dt><dd className="font-semibold">{o.expires}</dd></div>
                </dl>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => toast("Repeat SMS requested (demo)")}>Resend</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => toast("Order cancelled (demo)")}>Cancel</Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </CustomerShell>
  );
}

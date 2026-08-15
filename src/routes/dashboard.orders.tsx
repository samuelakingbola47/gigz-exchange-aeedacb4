import { createFileRoute, Link } from "@tanstack/react-router";
import { Inbox, X } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CountryFlag } from "@/components/brand/CountryFlag";
import { useCancelOrder, useOrders } from "@/lib/queries";
import { countdown, formatDateTime, orderStatusLabel } from "@/lib/format";

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

function ActiveOrders() {
  const { data: active = [], isLoading } = useOrders(["waiting", "sms_received"]);
  const cancel = useCancelOrder();

  const cancelOrder = (id: string) =>
    cancel.mutate(id, {
      onSuccess: () => toast.success("Order cancelled", { description: "Your wallet has been refunded." }),
      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not cancel order"),
    });

  return (
    <CustomerShell
      title="Active orders"
      subtitle="Orders currently waiting for or holding a verification code."
      actions={<Button asChild><Link to="/dashboard/buy">Buy number</Link></Button>}
    >
      {isLoading ? (
        <div className="surface-card space-y-3 p-5">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : active.length === 0 ? (
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
                  <TableHead>Expires in</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {active.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.order_reference}</TableCell>
                    <TableCell><span className="flex items-center gap-2"><CountryFlag country={o.country_code} name={o.country} size="sm" />{o.country}</span></TableCell>
                    <TableCell><span className="flex items-center gap-2"><ServiceIcon service={o.service_code} size="sm" plain />{o.service}</span></TableCell>
                    <TableCell className="font-medium">{o.phone_number}</TableCell>
                    <TableCell>{ngn(Number(o.price))}</TableCell>
                    <TableCell><StatusBadge status={o.status} label={orderStatusLabel(o.status)} /></TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(o.created_at)}</TableCell>
                    <TableCell className="tabular-nums">{countdown(o.expires_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-destructive" disabled={cancel.isPending} onClick={() => cancelOrder(o.id)}>
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {active.map((o) => (
              <div key={o.id} className="surface-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold"><ServiceIcon service={o.service_code} size="sm" plain />{o.service}</p>
                    <p className="truncate text-xs text-muted-foreground">{o.order_reference} · {o.country}</p>
                  </div>
                  <StatusBadge status={o.status} label={orderStatusLabel(o.status)} />
                </div>
                <p className="mt-4 font-display text-lg font-bold">{o.phone_number}</p>
                {o.verification_code ? (
                  <p className="mt-1 text-sm text-accent">Code: <span className="font-bold tracking-[0.2em]">{o.verification_code}</span></p>
                ) : null}
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                  <div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold">{ngn(Number(o.price))}</dd></div>
                  <div><dt className="text-muted-foreground">Created</dt><dd className="font-semibold">{formatDateTime(o.created_at)}</dd></div>
                  <div><dt className="text-muted-foreground">Expires in</dt><dd className="font-semibold tabular-nums">{countdown(o.expires_at)}</dd></div>
                </dl>
                <Button size="sm" variant="outline" className="mt-4 w-full text-destructive" disabled={cancel.isPending} onClick={() => cancelOrder(o.id)}>
                  Cancel & refund
                </Button>
              </div>
            ))}
          </div>
        </>
      )}
    </CustomerShell>
  );
}

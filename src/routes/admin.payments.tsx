import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({
    meta: [
      { title: "Payment Gateways — Gigz Exchange Admin" },
      { name: "description", content: "Configure deposit methods, gateway availability and payout settings for Gigz Exchange." },
      { property: "og:title", content: "Payment Gateways — Gigz Exchange Admin" },
      { property: "og:description", content: "Deposit methods, gateway availability and payouts." },
    ],
  }),
  component: AdminPayments,
});

const gateways = [
  { name: "Card payments", desc: "Visa, Mastercard and Amex deposits.", fee: "2.9% + ₦100", on: true },
  { name: "Bank transfer", desc: "Local transfers with manual confirmation.", fee: "Flat ₦150", on: true },
  { name: "Crypto (USDT)", desc: "TRC-20 and ERC-20 deposits.", fee: "1.0%", on: true },
  { name: "Mobile money", desc: "Regional wallets in Africa and Asia.", fee: "1.8%", on: false },
];

function AdminPayments() {
  return (
    <AdminShell title="Payments" subtitle="Deposit methods available to customers. Not connected in Phase 1.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Deposits (30d)" value="₦93.6M" trend="+9.1%" />
        <StatCard label="Average deposit" value="₦72,300" hint="Per transaction" />
        <StatCard label="Failed payments" value="1.2%" hint="Last 30 days" />
      </div>

      <div className="surface-card mt-6 divide-y divide-border">
        {gateways.map((g) => (
          <div key={g.name} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold">{g.name}</p>
                <StatusBadge status="Pending" label="Not connected" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{g.desc}</p>
              <p className="mt-1 text-xs text-muted-foreground">Fee: {g.fee}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => toast("Configuration is a Phase 2 task")}>Configure</Button>
              <Switch defaultChecked={g.on} onCheckedChange={() => toast(`${g.name} toggled (demo)`)} />
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

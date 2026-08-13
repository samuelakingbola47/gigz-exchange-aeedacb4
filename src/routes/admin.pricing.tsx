import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing Rules — Gigz Exchange Admin" },
      { name: "description", content: "Configure global margin, volume discount tiers and per-plan pricing for Gigz Exchange." },
      { property: "og:title", content: "Pricing Rules — Gigz Exchange Admin" },
      { property: "og:description", content: "Global margin, discount tiers and plan pricing." },
    ],
  }),
  component: AdminPricing,
});

const tiers = [
  { tier: "Starter", min: 0, discount: "0%", effective: "₦675" },
  { tier: "Growth", min: 500, discount: "8%", effective: "₦615" },
  { tier: "Volume", min: 2500, discount: "15%", effective: "₦570" },
  { tier: "Enterprise", min: 10000, discount: "24%", effective: "₦510" },
];

function AdminPricing() {
  return (
    <AdminShell title="Pricing" subtitle="Margins and volume discounts applied at checkout.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Average margin" value="32%" hint="Across all routes" />
        <StatCard label="Avg. sale price" value="₦615" hint="Last 30 days" />
        <StatCard label="Discounted orders" value="41%" hint="Volume tiers" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.5fr]">
        <form className="surface-card p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Pricing rules saved (demo)"); }}>
          <h2 className="text-sm font-semibold">Global rules</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2"><Label htmlFor="margin">Default margin (%)</Label><Input id="margin" defaultValue="32" /></div>
            <div className="space-y-2"><Label htmlFor="min">Minimum price (₦)</Label><Input id="min" defaultValue="225" /></div>
            <div className="space-y-2"><Label htmlFor="round">Rounding increment (₦)</Label><Input id="round" defaultValue="5" /></div>
          </div>
          <Button type="submit" className="mt-6">Save rules</Button>
        </form>

        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Volume tiers</h2></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead className="text-right">Min. monthly orders</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Effective US price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiers.map((t) => (
                <TableRow key={t.tier}>
                  <TableCell className="font-semibold">{t.tier}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.min.toLocaleString()}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.discount}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.effective}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, Banknote, CreditCard, Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { transactions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/wallet")({
  head: () => ({
    meta: [
      { title: "Wallet — Gigz Exchange" },
      { name: "description", content: "Manage your Gigz Exchange balance, add funds and review deposit history." },
      { property: "og:title", content: "Wallet — Gigz Exchange" },
      { property: "og:description", content: "Balance, deposits and spending in one place." },
    ],
  }),
  component: WalletPage,
});

const methods = [
  { id: "card", label: "Demo card", icon: CreditCard, note: "Visa •••• 4242" },
  { id: "bank", label: "Demo bank transfer", icon: Banknote, note: "1–2 business days" },
  { id: "voucher", label: "Demo voucher", icon: ArrowDownToLine, note: "Redeem a code" },
];

function WalletPage() {
  const [amount, setAmount] = useState("50");
  const [method, setMethod] = useState("card");
  const [open, setOpen] = useState(false);

  return (
    <CustomerShell
      title="Wallet"
      subtitle="Demo balance — no payment provider is connected in Phase 1."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" />Add funds</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add funds</DialogTitle>
              <DialogDescription>Payment methods below are placeholders for the prototype.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amt">Amount (USD)</Label>
                <Input id="amt" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
                <div className="flex gap-2 pt-1">
                  {["10", "25", "50", "100"].map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(a)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        amount === a ? "border-accent bg-accent/10" : "border-border hover:bg-secondary",
                      )}
                    >
                      ${a}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment method</Label>
                <div className="grid gap-2">
                  {methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                        method === m.id ? "border-accent bg-accent/8" : "border-border hover:bg-secondary",
                      )}
                    >
                      <m.icon className="h-4 w-4 text-accent" />
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{m.label}</span>
                        <span className="block text-xs text-muted-foreground">{m.note}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                onClick={() => {
                  setOpen(false);
                  toast.success(`Deposit of $${amount} simulated`, { description: "No real payment was processed." });
                }}
              >
                Confirm deposit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-3xl gradient-ink p-7 text-ink-foreground shadow-[var(--shadow-lift)]">
          <div className="absolute inset-0 grid-noise opacity-30" />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-ink-foreground/60">
              <Wallet className="h-4 w-4 text-accent" /> Current balance
            </p>
            <p className="mt-3 font-display text-5xl font-bold">$128.34</p>
            <p className="mt-2 text-sm text-ink-foreground/60">Account ID · GX-USR-10241</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button onClick={() => setOpen(true)}>Add funds</Button>
              <Button asChild variant="outline" className="border-white/25 bg-white/5 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground">
                <Link to="/dashboard/transactions">Transaction history</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label="Total deposited" value="$870.53" hint="Lifetime deposits" />
          <StatCard label="Total spent" value="$742.19" hint="Across 1,284 orders" />
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent wallet activity</h2>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        <ul className="divide-y divide-border">
          {transactions.slice(0, 6).map((t) => (
            <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.type} · {t.description}</p>
                <p className="text-xs text-muted-foreground">{t.date}</p>
              </div>
              <StatusBadge status={t.status} />
              <span className={t.amount >= 0 ? "w-20 text-right text-sm font-semibold text-success" : "w-20 text-right text-sm font-semibold"}>
                {t.amount >= 0 ? "+" : "−"}{ngn(Math.abs(t.amount))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </CustomerShell>
  );
}

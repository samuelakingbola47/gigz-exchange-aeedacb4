import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, Plus, ShieldCheck, Wallet } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";
import {
  useSettlePendingPayments, useStartPayment, useTransactions, useVerifyPayment, useWallet,
} from "@/lib/queries";
import { useProfile } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

// Paystack sends the customer back to this page with ?reference=...&trxref=...
type WalletSearch = { reference?: string | undefined; trxref?: string | undefined };

export const Route = createFileRoute("/dashboard/wallet")({
  validateSearch: (search: Record<string, unknown>): WalletSearch => ({
    reference: typeof search['reference'] === "string" ? (search['reference'] as string) : undefined,
    trxref: typeof search['trxref'] === "string" ? (search['trxref'] as string) : undefined,
  }),
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

const MIN_DEPOSIT = 500;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const errorMessage = (e: unknown) =>
  (e && typeof e === "object" && "message" in e && typeof (e as { message: unknown }).message === "string"
    ? (e as { message: string }).message
    : "Please try again.");

function WalletPage() {
  const [amount, setAmount] = useState("5000");
  const [open, setOpen] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data: wallet } = useWallet();
  const { data: profile } = useProfile();
  const { data: transactions = [] } = useTransactions(6);
  const startPayment = useStartPayment();
  const verifyPayment = useVerifyPayment();
  const settlePending = useSettlePendingPayments();
  const handledReference = useRef<string | null>(null);
  const checkedPending = useRef(false);

  const balance = Number(wallet?.balance ?? 0);
  const deposited = transactions.filter((t) => t.type === "deposit").reduce((s, t) => s + Number(t.amount), 0);
  const spent = transactions.filter((t) => t.type === "purchase").reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const amountNumber = Number(amount);
  const amountValid = Number.isFinite(amountNumber) && amountNumber >= MIN_DEPOSIT;

  // Customer just came back from Paystack: ask the server whether the payment went through.
  useEffect(() => {
    const reference = search.reference ?? search.trxref;
    if (!reference || handledReference.current === reference) return;
    handledReference.current = reference;
    const toastId = toast.loading("Confirming your payment…");
    void (async () => {
      let outcome: "completed" | "failed" | "pending" = "pending";
      for (let attempt = 0; attempt < 8; attempt++) {
        try {
          const status = await verifyPayment.mutateAsync(reference);
          if (status === "completed" || status === "failed") {
            outcome = status;
            break;
          }
        } catch (error) {
          toast.error("Could not confirm the payment", { id: toastId, description: errorMessage(error) });
          void navigate({ to: "/dashboard/wallet", search: {}, replace: true });
          return;
        }
        await wait(3000);
      }
      if (outcome === "completed") {
        toast.success("Payment confirmed", { id: toastId, description: "Your wallet has been credited." });
      } else if (outcome === "failed") {
        toast.error("Payment was not completed", {
          id: toastId,
          description: `Reference ${reference}. If money left your account, contact support with this reference.`,
        });
      } else {
        toast("Still waiting for confirmation", {
          id: toastId,
          description: "If you finished paying, your balance will update within a few minutes.",
        });
      }
      void navigate({ to: "/dashboard/wallet", search: {}, replace: true });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.reference, search.trxref]);

  // Opening the wallet normally: settle any earlier payment whose tab was closed before returning.
  useEffect(() => {
    if (checkedPending.current || search.reference || search.trxref) return;
    checkedPending.current = true;
    settlePending.mutate(undefined, {
      onSuccess: (count) => {
        if (count > 0) toast.success("Payment received", { description: "Your wallet has been updated." });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCheckout = () => {
    if (!amountValid) {
      toast.error(`Enter at least ${ngn(MIN_DEPOSIT)}`);
      return;
    }
    startPayment.mutate(amountNumber, {
      onSuccess: (result) => {
        setRedirecting(true);
        window.location.href = result.authorization_url;
      },
      onError: (error) => toast.error("Could not start the payment", { description: errorMessage(error) }),
    });
  };
  const busy = startPayment.isPending || redirecting;

  return (
    <CustomerShell
      title="Wallet"
      subtitle="Your balance is held securely on the server. Top up by card, bank transfer or USSD."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-1.5 h-4 w-4" />Add funds</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add funds</DialogTitle>
              <DialogDescription>Choose an amount, then pay securely on Paystack.</DialogDescription>
            </DialogHeader>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="amt">Amount (₦)</Label>
                <Input id="amt" value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
                <div className="flex flex-wrap gap-2 pt-1">
                  {["5000", "10000", "25000", "50000"].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(a)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        amount === a ? "border-accent bg-accent/10" : "border-border hover:bg-secondary",
                      )}
                    >
                      {ngn(Number(a))}
                    </button>
                  ))}
                </div>
                {!amountValid && amount !== "" ? (
                  <p className="text-xs font-medium text-destructive">Minimum top-up is {ngn(MIN_DEPOSIT)}.</p>
                ) : null}
              </div>
              <p className="flex items-start gap-2 rounded-xl bg-secondary px-4 py-3 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                You will pay on Paystack&apos;s secure page. We never see or store your card details, and your wallet is only
                credited after Paystack confirms the payment.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
              <Button onClick={startCheckout} disabled={busy || !amountValid}>
                {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Redirecting…</> : `Pay ${ngn(amountValid ? amountNumber : 0)}`}
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
            <p className="mt-3 font-display text-5xl font-bold">{ngn(balance)}</p>
            <p className="mt-2 truncate text-sm text-ink-foreground/60">{profile?.email ?? "Your account"}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button onClick={() => setOpen(true)}>Add funds</Button>
              <Button asChild variant="outline" className="border-white/25 bg-white/5 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground">
                <Link to="/dashboard/transactions">Transaction history</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <StatCard label="Total deposited" value={ngn(deposited)} hint="Lifetime deposits" />
          <StatCard label="Total spent" value={ngn(spent)} hint="Across all orders" />
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent wallet activity</h2>
          <Link to="/dashboard/transactions" className="text-xs font-semibold text-muted-foreground hover:text-foreground">View all</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            No wallet activity yet. Your balance starts at ₦0 and every change is recorded here.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t) => (
              <li key={t.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold capitalize">{t.type} · {t.description}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(t.created_at)}</p>
                </div>
                <StatusBadge status={t.status === "completed" ? "Completed" : t.status} />
                <span className={Number(t.amount) >= 0 ? "w-24 text-right text-sm font-semibold text-success" : "w-24 text-right text-sm font-semibold"}>
                  {Number(t.amount) >= 0 ? "+" : "−"}{ngn(Math.abs(Number(t.amount)))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </CustomerShell>
  );
}

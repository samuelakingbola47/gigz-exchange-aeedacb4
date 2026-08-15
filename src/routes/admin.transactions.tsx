import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminTransactions } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/app/EmptyState";
import { Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Gigz Exchange Admin" },
      { name: "description", content: "Ledger of deposits, purchases and refunds across all Gigz Exchange accounts." },
      { property: "og:title", content: "Transactions — Gigz Exchange Admin" },
      { property: "og:description", content: "Platform ledger of deposits, purchases and refunds." },
    ],
  }),
  component: AdminTransactions,
});

function AdminTransactions() {
  const { data: transactions = [] } = useAdminTransactions();
  const sum = (fn: (a: number) => boolean) =>
    transactions.filter((t) => fn(Number(t.amount))).reduce((a, t) => a + Math.abs(Number(t.amount)), 0);
  const deposits = transactions.filter((t) => t.type === "deposit").reduce((a, t) => a + Number(t.amount), 0);
  const spend = sum((a) => a < 0);
  const refunds = transactions.filter((t) => t.type === "refund").reduce((a, t) => a + Number(t.amount), 0);

  return (
    <AdminShell
      title="Transactions"
      subtitle="Platform-wide financial ledger."
      actions={<Button variant="outline" onClick={() => toast("Export queued (demo)")}>Export ledger</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Deposits" value={ngn(deposits)} />
        <StatCard label="Spend" value={ngn(spend)} />
        <StatCard label="Refunds" value={ngn(refunds)} hint="Auto + manual" />
        <StatCard label="Entries" value={transactions.length.toLocaleString()} hint="Ledger records" />
      </div>

      <div className="surface-card mt-6 overflow-x-auto">
        {transactions.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions yet" description="Wallet activity will appear here once customers start transacting." />
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.reference}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(t.created_at)}</TableCell>
                <TableCell className="capitalize">{t.type}</TableCell>
                <TableCell>{t.description ?? "—"}</TableCell>
                <TableCell><StatusBadge status={t.status === "completed" ? "Completed" : "Pending"} /></TableCell>
                <TableCell className={cn("text-right font-semibold tabular-nums", Number(t.amount) >= 0 ? "text-success" : "text-foreground")}>
                  {Number(t.amount) >= 0 ? "+" : "−"}{ngn(Math.abs(Number(t.amount)))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>
    </AdminShell>
  );
}

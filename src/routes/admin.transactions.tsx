import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { transactions } from "@/lib/mock-data";
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
  return (
    <AdminShell
      title="Transactions"
      subtitle="Platform-wide financial ledger."
      actions={<Button variant="outline" onClick={() => toast("Export queued (demo)")}>Export ledger</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Deposits (30d)" value="$62,410" trend="+9.1%" />
        <StatCard label="Spend (30d)" value="$39,900" trend="+14.8%" />
        <StatCard label="Refunds (30d)" value="$1,284" hint="Auto + manual" />
        <StatCard label="Held balance" value="$184,220" hint="Customer wallets" />
      </div>

      <div className="surface-card mt-6 overflow-x-auto">
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
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="text-muted-foreground">{t.date}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className={cn("text-right font-semibold tabular-nums", t.amount >= 0 ? "text-success" : "text-foreground")}>
                  {t.amount >= 0 ? "+" : "−"}{ngn(Math.abs(t.amount))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { StatCard } from "@/components/app/StatCard";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ngn } from "@/lib/currency";
import { useTransactions } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/dashboard/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Gigz Exchange" },
      { name: "description", content: "Full record of deposits, purchases and refunds on your Gigz Exchange wallet." },
      { property: "og:title", content: "Transactions — Gigz Exchange" },
      { property: "og:description", content: "Deposits, purchases and refunds with running balance." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const [type, setType] = useState("all");
  const { data: transactions = [] } = useTransactions();
  const rows = useMemo(() => transactions.filter((t) => type === "all" || t.type === type), [transactions, type]);

  const totals = useMemo(() => {
    let deposited = 0;
    let spent = 0;
    let refunded = 0;
    for (const t of transactions) {
      const amount = Number(t.amount);
      if (t.type === "deposit") deposited += amount;
      else if (t.type === "purchase") spent += Math.abs(amount);
      else if (t.type === "refund") refunded += amount;
    }
    return { deposited, spent, refunded };
  }, [transactions]);

  return (
    <CustomerShell
      title="Transactions"
      subtitle="Deposits, purchases and refunds with running balance."
      actions={<Button variant="outline"><Download className="mr-1.5 h-4 w-4" />Export</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total deposited" value={ngn(totals.deposited)} hint="Lifetime deposits" />
        <StatCard label="Total spent" value={ngn(totals.spent)} hint="Across all orders" />
        <StatCard label="Refunded" value={ngn(totals.refunded)} hint="Cancelled & expired orders" />
      </div>

      <div className="surface-card mt-6 flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">All transactions</h2>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="deposit">Deposit</SelectItem>
            <SelectItem value="purchase">Purchase</SelectItem>
            <SelectItem value="refund">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <p className="surface-card mt-4 px-5 py-10 text-center text-sm text-muted-foreground">
          No transactions yet — purchases, refunds and deposits will be listed here.
        </p>
      ) : null}

      <div className="surface-card mt-4 hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.reference}</TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(t.created_at)}</TableCell>
                <TableCell className="capitalize">{t.type}</TableCell>
                <TableCell className="text-muted-foreground">{t.description}</TableCell>
                <TableCell className={Number(t.amount) >= 0 ? "text-right font-semibold text-success" : "text-right font-semibold"}>
                  {Number(t.amount) >= 0 ? "+" : "−"}{ngn(Math.abs(Number(t.amount)))}
                </TableCell>
                <TableCell className="text-right tabular-nums">{ngn(Number(t.balance_after))}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {rows.map((t) => (
          <div key={t.id} className="surface-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold capitalize">{t.type}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <span className={Number(t.amount) >= 0 ? "text-sm font-semibold text-success" : "text-sm font-semibold"}>
                {Number(t.amount) >= 0 ? "+" : "−"}{ngn(Math.abs(Number(t.amount)))}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatDateTime(t.created_at)} · {t.reference}</span>
              <StatusBadge status={t.status} />
            </div>
          </div>
        ))}
      </div>
    </CustomerShell>
  );
}

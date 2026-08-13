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
import { transactions } from "@/lib/mock-data";
import { ngn } from "@/lib/currency";

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
  const rows = useMemo(() => transactions.filter((t) => type === "all" || t.type === type), [type]);

  return (
    <CustomerShell
      title="Transactions"
      subtitle="Deposits, purchases and refunds with running balance."
      actions={<Button variant="outline"><Download className="mr-1.5 h-4 w-4" />Export</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total deposited" value="₦1,305,800" hint="Lifetime (demo)" />
        <StatCard label="Total spent" value="₦1,113,290" hint="Across 1,284 orders" />
        <StatCard label="Refunded" value="₦27,630" hint="Expired & cancelled orders" />
      </div>

      <div className="surface-card mt-6 flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold">All transactions</h2>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="Deposit">Deposit</SelectItem>
            <SelectItem value="Purchase">Purchase</SelectItem>
            <SelectItem value="Refund">Refund</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
                <TableCell className="font-medium">{t.id}</TableCell>
                <TableCell className="text-muted-foreground">{t.date}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell className="text-muted-foreground">{t.description}</TableCell>
                <TableCell className={t.amount >= 0 ? "text-right font-semibold text-success" : "text-right font-semibold"}>
                  {t.amount >= 0 ? "+" : "−"}{ngn(Math.abs(t.amount))}
                </TableCell>
                <TableCell className="text-right tabular-nums">{ngn(t.balance)}</TableCell>
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
                <p className="text-sm font-semibold">{t.type}</p>
                <p className="text-xs text-muted-foreground">{t.description}</p>
              </div>
              <span className={t.amount >= 0 ? "text-sm font-semibold text-success" : "text-sm font-semibold"}>
                {t.amount >= 0 ? "+" : "−"}{ngn(Math.abs(t.amount))}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>{t.date} · {t.id}</span>
              <StatusBadge status={t.status} />
            </div>
          </div>
        ))}
      </div>
    </CustomerShell>
  );
}

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SearchX, Users } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAdminOrders, useAdminProfiles, useAdminWallets } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — Gigz Exchange Admin" },
      { name: "description", content: "Search, review and manage Gigz Exchange customer accounts, balances and account status." },
      { property: "og:title", content: "User Management — Gigz Exchange Admin" },
      { property: "og:description", content: "Search and manage customer accounts and balances." },
    ],
  }),
  component: AdminUsers,
});

function AdminUsers() {
  const [q, setQ] = useState("");
  const { data: users = [] } = useAdminProfiles();
  const term = q.toLowerCase();
  const rows = users.filter(
    (u) => u.full_name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term) || u.id.toLowerCase().includes(term),
  );
  const { data: wallets = [] } = useAdminWallets();
  const { data: orders = [] } = useAdminOrders();
  const walletFor = (id: string) => Number(wallets.find((w) => w.user_id === id)?.balance ?? 0);
  const orderCount = (id: string) => orders.filter((o) => o.user_id === id).length;
  const active = rows.filter((u) => u.status === "active").length;
  const suspended = rows.filter((u) => u.status === "suspended").length;

  return (
    <AdminShell
      title="Users"
      subtitle={`${users.length} registered account${users.length === 1 ? "" : "s"}.`}
      actions={<Button variant="outline" onClick={() => toast("Export queued (demo)")}>Export CSV</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value={users.length.toLocaleString()} icon={Users} />
        <StatCard label="Active" value={active.toLocaleString()} hint="Good standing" />
        <StatCard label="Pending" value={(users.length - active - suspended).toLocaleString()} hint="Unverified email" />
        <StatCard label="Suspended" value={suspended.toLocaleString()} hint="Manual review" />
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email or ID" className="pl-9" />
          </div>
          <p className="text-xs text-muted-foreground">{rows.length} shown</p>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title={users.length === 0 ? "No users yet" : "No users found"} description={users.length === 0 ? "No accounts have been registered yet." : "Try a different search term."} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <p className="font-semibold">{u.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                    <TableCell><StatusBadge status={u.status === "active" ? "Active" : u.status === "suspended" ? "Suspended" : "Pending"} /></TableCell>
                    <TableCell className="text-right tabular-nums">{ngn(walletFor(u.id))}</TableCell>
                    <TableCell className="text-right tabular-nums">{orderCount(u.id)}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(u.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm">Manage</Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast("Opened profile (demo)")}>View profile</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Balance adjusted (demo)")}>Adjust balance</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast("Reset link sent (demo)")}>Send reset link</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.error("Account suspended (demo)")}>Suspend</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

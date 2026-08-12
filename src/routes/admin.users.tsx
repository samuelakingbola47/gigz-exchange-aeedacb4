import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Users } from "lucide-react";
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
import { adminUsers } from "@/lib/mock-data";

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
  const rows = adminUsers.filter(
    (u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()) || u.id.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AdminShell
      title="Users"
      subtitle="10,820 registered accounts."
      actions={<Button variant="outline" onClick={() => toast("Export queued (demo)")}>Export CSV</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total users" value="10,820" icon={Users} />
        <StatCard label="Active" value="9,904" hint="Good standing" />
        <StatCard label="Pending" value="742" hint="Unverified email" />
        <StatCard label="Suspended" value="174" hint="Manual review" />
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
          <EmptyState title="No users found" description="Try a different search term." />
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
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{u.id}</TableCell>
                    <TableCell><StatusBadge status={u.status} /></TableCell>
                    <TableCell className="text-right tabular-nums">${u.balance.toFixed(2)}</TableCell>
                    <TableCell className="text-right tabular-nums">{u.orders}</TableCell>
                    <TableCell className="text-muted-foreground">{u.joined}</TableCell>
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

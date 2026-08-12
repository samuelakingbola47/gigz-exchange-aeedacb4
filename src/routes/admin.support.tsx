import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { tickets } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/support")({
  head: () => ({
    meta: [
      { title: "Support Queue — Gigz Exchange Admin" },
      { name: "description", content: "Triage customer support tickets, priorities and response times across the platform." },
      { property: "og:title", content: "Support Queue — Gigz Exchange Admin" },
      { property: "og:description", content: "Triage customer tickets, priorities and response times." },
    ],
  }),
  component: AdminSupport,
});

function AdminSupport() {
  return (
    <AdminShell title="Support queue" subtitle="Tickets awaiting a response from the team.">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open tickets" value="34" hint="Across all customers" />
        <StatCard label="Awaiting reply" value="12" hint="Customer responded" />
        <StatCard label="Avg. first response" value="3h 42m" trend="-18%" />
        <StatCard label="Resolved (7d)" value="196" hint="Closed tickets" />
      </div>

      <div className="surface-card mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-mono text-xs">{t.id}</TableCell>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell className="text-muted-foreground">{t.category}</TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="text-muted-foreground">{t.updated}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast(`Opened ${t.id} (demo)`)}>Open</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

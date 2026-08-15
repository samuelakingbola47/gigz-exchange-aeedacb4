import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAdminTickets } from "@/lib/queries";
import { formatDateTime } from "@/lib/format";
import { EmptyState } from "@/components/app/EmptyState";
import { LifeBuoy } from "lucide-react";

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
  const { data: tickets = [] } = useAdminTickets();
  const open = tickets.filter((t) => t.status === "Open").length;
  const resolved = tickets.filter((t) => t.status === "Resolved").length;

  return (
    <AdminShell title="Support queue" subtitle="Tickets awaiting a response from the team.">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Open tickets" value={open.toLocaleString()} hint="Across all customers" />
        <StatCard label="Total tickets" value={tickets.length.toLocaleString()} hint="All time" />
        <StatCard label="Pending" value={(tickets.length - open - resolved).toLocaleString()} hint="In progress" />
        <StatCard label="Resolved" value={resolved.toLocaleString()} hint="Closed tickets" />
      </div>

      <div className="surface-card mt-6 overflow-x-auto">
        {tickets.length === 0 ? (
          <EmptyState icon={LifeBuoy} title="No tickets yet" description="Customer support requests will appear here." />
        ) : (
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
                <TableCell className="font-mono text-xs">{t.ticket_reference}</TableCell>
                <TableCell className="font-medium">{t.subject}</TableCell>
                <TableCell className="text-muted-foreground">{t.category}</TableCell>
                <TableCell>{t.priority}</TableCell>
                <TableCell><StatusBadge status={t.status} /></TableCell>
                <TableCell className="text-muted-foreground">{formatDateTime(t.updated_at)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast(`Opened ${t.ticket_reference}`)}>Open</Button>
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

import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiProviders } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/providers")({
  head: () => ({
    meta: [
      { title: "API Providers — Gigz Exchange Admin" },
      { name: "description", content: "Manage upstream SMS number providers, routing priority and connection health." },
      { property: "og:title", content: "API Providers — Gigz Exchange Admin" },
      { property: "og:description", content: "Upstream provider connections, routing priority and health." },
    ],
  }),
  component: AdminProviders,
});

function AdminProviders() {
  return (
    <AdminShell
      title="API providers"
      subtitle="Upstream number suppliers. Live connections arrive in Phase 2."
      actions={<Button onClick={() => toast("Provider setup is a Phase 2 task")}>Add provider</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Providers" value="3" icon={Server} hint="Configured slots" />
        <StatCard label="Connected" value="0" hint="Phase 1 prototype" />
        <StatCard label="Routing mode" value="Priority" hint="Lowest number first" />
      </div>

      <div className="surface-card mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Countries</TableHead>
              <TableHead className="text-right">Services</TableHead>
              <TableHead className="text-right">Priority</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiProviders.map((p) => (
              <TableRow key={p.id}>
                <TableCell><p className="font-semibold">{p.name}</p><p className="font-mono text-xs text-muted-foreground">{p.id}</p></TableCell>
                <TableCell><StatusBadge status="Pending" label={p.status} /></TableCell>
                <TableCell className="text-right tabular-nums">{p.countries}</TableCell>
                <TableCell className="text-right tabular-nums">{p.services}</TableCell>
                <TableCell className="text-right tabular-nums">{p.priority}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => toast("Credentials are added in Phase 2")}>Connect</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

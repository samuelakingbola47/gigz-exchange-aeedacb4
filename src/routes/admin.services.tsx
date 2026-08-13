import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { services } from "@/lib/mock-data";
import { ServiceIcon } from "@/components/brand/ServiceIcon";

export const Route = createFileRoute("/admin/services")({
  head: () => ({
    meta: [
      { title: "Service Management — Gigz Exchange Admin" },
      { name: "description", content: "Manage which verification services are offered, their pricing and live availability." },
      { property: "og:title", content: "Service Management — Gigz Exchange Admin" },
      { property: "og:description", content: "Manage offered services, pricing and availability." },
    ],
  }),
  component: AdminServices,
});

function AdminServices() {
  return (
    <AdminShell title="Services" subtitle="Catalogue of supported verification services.">
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Numbers</TableHead>
              <TableHead className="w-32">Price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                <TableCell><ServiceIcon service={s.id} size="sm" plain className="mr-2 inline-block align-[-3px]" />{s.name}</TableCell>
                <TableCell className="text-muted-foreground">{s.category}</TableCell>
                <TableCell className="text-right tabular-nums">{s.numbers.toLocaleString()}</TableCell>
                <TableCell><Input defaultValue={s.price.toFixed(2)} className="h-8 w-24" /></TableCell>
                <TableCell><StatusBadge status={s.availability === "low" ? "Pending" : "Active"} label={s.availability} /></TableCell>
                <TableCell className="text-right"><Switch defaultChecked onCheckedChange={() => toast(`${s.name} updated (demo)`)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

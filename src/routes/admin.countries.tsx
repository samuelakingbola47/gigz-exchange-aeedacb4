import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { countries } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/countries")({
  head: () => ({
    meta: [
      { title: "Country Management — Gigz Exchange Admin" },
      { name: "description", content: "Enable, disable and price country coverage for SMS verification across the platform." },
      { property: "og:title", content: "Country Management — Gigz Exchange Admin" },
      { property: "og:description", content: "Enable, disable and price country coverage." },
    ],
  }),
  component: AdminCountries,
});

function AdminCountries() {
  return (
    <AdminShell title="Countries" subtitle="Coverage and base pricing per country.">
      <div className="surface-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead>Region</TableHead>
              <TableHead className="text-right">Numbers</TableHead>
              <TableHead className="w-32">Base price</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead className="text-right">Enabled</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((c) => (
              <TableRow key={c.id}>
                <TableCell><span className="mr-2">{c.flag}</span>{c.name} <span className="text-xs text-muted-foreground">{c.dial}</span></TableCell>
                <TableCell className="text-muted-foreground">{c.region}</TableCell>
                <TableCell className="text-right tabular-nums">{c.numbers.toLocaleString()}</TableCell>
                <TableCell><Input defaultValue={c.price.toFixed(2)} className="h-8 w-24" /></TableCell>
                <TableCell><StatusBadge status={c.availability === "low" ? "Pending" : "Active"} label={c.availability} /></TableCell>
                <TableCell className="text-right"><Switch defaultChecked onCheckedChange={() => toast(`${c.name} updated (demo)`)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

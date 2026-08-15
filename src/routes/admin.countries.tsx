import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCountries } from "@/lib/queries";
import { CountryFlag } from "@/components/brand/CountryFlag";

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
  const { data: countries = [] } = useCountries();

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
                <TableCell><CountryFlag country={c.country_code} name={c.name} size="sm" className="mr-2 inline-block align-[-3px]" />{c.name} <span className="text-xs text-muted-foreground">{c.dial_code}</span></TableCell>
                <TableCell className="text-muted-foreground">{c.region}</TableCell>
                <TableCell className="text-right tabular-nums">{c.numbers_available.toLocaleString()}</TableCell>
                <TableCell><Input defaultValue={Number(c.base_price).toFixed(2)} className="h-8 w-24" /></TableCell>
                <TableCell><StatusBadge status={c.availability === "low" ? "Pending" : "Active"} label={c.availability} /></TableCell>
                <TableCell className="text-right"><Switch defaultChecked={c.status === "active"} onCheckedChange={() => toast(`${c.name} updated (demo)`)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  );
}

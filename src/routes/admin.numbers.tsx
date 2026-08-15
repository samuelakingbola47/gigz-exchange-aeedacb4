import { createFileRoute } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCountries } from "@/lib/queries";
import { CountryFlag } from "@/components/brand/CountryFlag";

export const Route = createFileRoute("/admin/numbers")({
  head: () => ({
    meta: [
      { title: "Number Inventory — Gigz Exchange Admin" },
      { name: "description", content: "Track available phone number inventory by country, utilisation and provider pool health." },
      { property: "og:title", content: "Number Inventory — Gigz Exchange Admin" },
      { property: "og:description", content: "Inventory by country, utilisation and pool health." },
    ],
  }),
  component: AdminNumbers,
});

function AdminNumbers() {
  const { data: countries = [] } = useCountries();
  return (
    <AdminShell
      title="Number inventory"
      subtitle="Pool depth across every connected provider."
      actions={<Button variant="outline" onClick={() => toast("Inventory sync started (demo)")}>Sync inventory</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total numbers" value="182,340" icon={Package} />
        <StatCard label="In use" value="4,912" hint="Currently rented" />
        <StatCard label="Reserved" value="1,204" hint="Held for retries" />
        <StatCard label="Low-stock pools" value="6" hint="Below 1,000 numbers" />
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Pools by country</h2></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Dial code</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="w-52">Utilisation</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((c, i) => {
                const util = 28 + ((i * 13) % 60);
                return (
                  <TableRow key={c.id}>
                    <TableCell><CountryFlag country={c.country_code} name={c.name} size="sm" className="mr-2 inline-block align-[-3px]" />{c.name}</TableCell>
                    <TableCell className="font-mono text-xs">{c.dial_code}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.numbers_available.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={util} className="h-1.5" />
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{util}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={c.availability === "low" ? "Pending" : "Active"} label={c.availability === "low" ? "Low stock" : "Healthy"} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => toast.success(`Restock requested for ${c.name} (demo)`)}>Restock</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminShell>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AdminShell } from "@/components/app/CustomerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform Settings — Gigz Exchange Admin" },
      { name: "description", content: "Global platform configuration: branding, limits, maintenance mode and notifications." },
      { property: "og:title", content: "Platform Settings — Gigz Exchange Admin" },
      { property: "og:description", content: "Branding, limits, maintenance mode and notifications." },
    ],
  }),
  component: AdminSettings,
});

const toggles = [
  { t: "Maintenance mode", d: "Show a maintenance page to all customers.", on: false },
  { t: "New registrations", d: "Allow new accounts to sign up.", on: true },
  { t: "API access", d: "Enable programmatic ordering for API keys.", on: true },
  { t: "Auto-refunds", d: "Refund expired orders automatically.", on: true },
];

function AdminSettings() {
  return (
    <AdminShell title="Platform settings" subtitle="Configuration is simulated in the Phase 1 prototype.">
      <div className="grid gap-5 lg:grid-cols-2">
        <form className="surface-card p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved (demo)"); }}>
          <h2 className="text-sm font-semibold">General</h2>
          <div className="mt-5 space-y-4">
            <div className="space-y-2"><Label htmlFor="s-name">Platform name</Label><Input id="s-name" defaultValue="Gigz Exchange" /></div>
            <div className="space-y-2"><Label htmlFor="s-email">Support email</Label><Input id="s-email" defaultValue="support@gigzexchange.com" /></div>
            <div className="space-y-2"><Label htmlFor="s-min">Minimum deposit (₦)</Label><Input id="s-min" defaultValue="1500" /></div>
            <div className="space-y-2"><Label htmlFor="s-note">Announcement banner</Label><Textarea id="s-note" rows={3} placeholder="Shown at the top of the customer dashboard" /></div>
          </div>
          <Button type="submit" className="mt-6">Save settings</Button>
        </form>

        <div className="surface-card p-6">
          <h2 className="text-sm font-semibold">Feature switches</h2>
          <div className="mt-2 divide-y divide-border">
            {toggles.map((x) => (
              <div key={x.t} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-medium">{x.t}</p>
                  <p className="text-xs text-muted-foreground">{x.d}</p>
                </div>
                <Switch defaultChecked={x.on} onCheckedChange={() => toast(`${x.t} toggled (demo)`)} />
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">Provider credentials, payments and live data are connected in Phase 2.</p>
        </div>
      </div>
    </AdminShell>
  );
}

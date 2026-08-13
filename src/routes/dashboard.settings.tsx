import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { loginActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Security & Preferences | Gigz Exchange" },
      { name: "description", content: "Manage password, two-factor authentication, notifications and platform preferences." },
      { property: "og:title", content: "Settings — Security & Preferences | Gigz Exchange" },
      { property: "og:description", content: "Password, 2FA, notifications and preferences." },
    ],
  }),
  component: SettingsPage,
});

const notifications = [
  { t: "SMS received", d: "Email me the moment a verification code arrives.", on: true },
  { t: "Order expired", d: "Notify me when an order expires and is refunded.", on: true },
  { t: "Low balance", d: "Alert me when my wallet drops below ₦15,000.", on: true },
  { t: "Product updates", d: "Occasional emails about new countries and services.", on: false },
];

function SettingsPage() {
  return (
    <CustomerShell title="Settings" subtitle="Frontend demo controls — nothing is persisted in Phase 1.">
      <Tabs defaultValue="security">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="mt-5 space-y-5">
          <form className="surface-card p-6" onSubmit={(e) => { e.preventDefault(); toast.success("Password updated (demo)"); }}>
            <h2 className="text-sm font-semibold">Change password</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="cur">Current password</Label><Input id="cur" type="password" /></div>
              <div className="space-y-2"><Label htmlFor="new">New password</Label><Input id="new" type="password" /></div>
              <div className="space-y-2"><Label htmlFor="conf">Confirm password</Label><Input id="conf" type="password" /></div>
            </div>
            <Button type="submit" className="mt-6">Update password</Button>
          </form>

          <div className="surface-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">Two-factor authentication</h2>
                <p className="mt-1 text-sm text-muted-foreground">Require a one-time code from your authenticator app at sign-in.</p>
              </div>
              <Switch defaultChecked onCheckedChange={() => toast("2FA setting changed (demo)")} />
            </div>
            <Separator className="my-5" />
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Recovery codes</p>
                <p className="text-xs text-muted-foreground">10 unused codes remaining.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast("Recovery codes regenerated (demo)")}>Regenerate</Button>
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-border px-5 py-4"><h2 className="text-sm font-semibold">Login activity</h2></div>
            <ul className="divide-y divide-border">
              {loginActivity.map((l) => (
                <li key={l.at} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{l.device}</p>
                    <p className="text-xs text-muted-foreground">{l.location} · {l.at}</p>
                  </div>
                  {l.current ? <StatusBadge status="Active" label="Current session" /> : (
                    <Button variant="ghost" size="sm" onClick={() => toast("Session revoked (demo)")}>Revoke</Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-5">
          <div className="surface-card divide-y divide-border">
            {notifications.map((n) => (
              <div key={n.t} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="text-sm font-medium">{n.t}</p>
                  <p className="text-xs text-muted-foreground">{n.d}</p>
                </div>
                <Switch defaultChecked={n.on} />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-5">
          <div className="surface-card grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Default country</Label>
              <Select defaultValue="us">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                  <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency display</Label>
              <Select defaultValue="usd">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ngn">NGN (₦)</SelectItem>
                  <SelectItem value="eur">EUR (€)</SelectItem>
                  <SelectItem value="ngn">NGN (₦)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time zone</Label>
              <Select defaultValue="wat">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="wat">West Africa Time (UTC+1)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">Eastern Time (UTC−5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Order auto-cancel</Label>
              <Select defaultValue="20">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">After 10 minutes</SelectItem>
                  <SelectItem value="20">After 20 minutes</SelectItem>
                  <SelectItem value="30">After 30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Button onClick={() => toast.success("Preferences saved (demo)")}>Save preferences</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CustomerShell>
  );
}

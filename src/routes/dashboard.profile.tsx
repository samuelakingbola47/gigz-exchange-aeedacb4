import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { loginActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Gigz Exchange" },
      { name: "description", content: "Review and update your Gigz Exchange account details and identity information." },
      { property: "og:title", content: "Profile — Gigz Exchange" },
      { property: "og:description", content: "Account details, contact information and verification status." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <CustomerShell title="Profile" subtitle="Your account details. Changes are simulated in Phase 1.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card p-6 text-center">
          <Avatar className="mx-auto h-20 w-20">
            <AvatarFallback className="bg-ink text-xl text-ink-foreground">AO</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold">Ada Okafor</h2>
          <p className="text-sm text-muted-foreground">ada.okafor@example.com</p>
          <div className="mt-3 flex justify-center"><StatusBadge status="Active" label="Verified account" /></div>
          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-left text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Account ID</dt><dd className="font-medium">GX-USR-10241</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Member since</dt><dd className="font-medium">Nov 2025</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Plan</dt><dd className="font-medium">Volume</dd></div>
          </dl>
          <Button variant="outline" size="sm" className="mt-5 w-full" onClick={() => toast("Avatar upload is demo only")}>Change avatar</Button>
        </div>

        <div className="space-y-5">
          <form
            className="surface-card p-6"
            onSubmit={(e) => { e.preventDefault(); toast.success("Profile updated (demo)"); }}
          >
            <h2 className="text-sm font-semibold">Personal information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="p-name">Full name</Label><Input id="p-name" defaultValue="Ada Okafor" /></div>
              <div className="space-y-2"><Label htmlFor="p-email">Email</Label><Input id="p-email" type="email" defaultValue="ada.okafor@example.com" /></div>
              <div className="space-y-2"><Label htmlFor="p-phone">Phone</Label><Input id="p-phone" defaultValue="+234 803 555 0119" /></div>
              <div className="space-y-2"><Label htmlFor="p-id">Account ID</Label><Input id="p-id" defaultValue="GX-USR-10241" readOnly className="bg-secondary/60" /></div>
            </div>
            <Button type="submit" className="mt-6">Save changes</Button>
          </form>

          <div className="surface-card overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Recent login activity</h2>
            </div>
            <ul className="divide-y divide-border">
              {loginActivity.map((l) => (
                <li key={l.at} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{l.device}</p>
                    <p className="text-xs text-muted-foreground">{l.location} · {l.ip} · {l.at}</p>
                  </div>
                  {l.current ? <StatusBadge status="Active" label="This device" /> : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}

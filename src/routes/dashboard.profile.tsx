import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, useProfile } from "@/lib/auth";
import { useWallet } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { ngn } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/format";

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
  const { data: profile } = useProfile();
  const { data: wallet } = useWallet();
  const qc = useQueryClient();
  const [form, setForm] = useState({ full_name: "", phone: "", country: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      country: profile.country ?? "",
    });
  }, [profile]);

  return (
    <CustomerShell title="Profile" subtitle="Your account details, stored securely in your Gigz Exchange account.">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="surface-card p-6 text-center">
          <Avatar className="mx-auto h-20 w-20">
            <AvatarFallback className="bg-ink text-xl text-ink-foreground">
              {initials(profile?.full_name, profile?.email)}
            </AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-lg font-semibold">{profile?.full_name?.trim() || "Your account"}</h2>
          <p className="truncate text-sm text-muted-foreground">{profile?.email ?? "—"}</p>
          <div className="mt-3 flex justify-center">
            <StatusBadge status={profile?.status === "active" ? "Active" : (profile?.status ?? "Active")} label={profile?.status === "active" ? "Active account" : (profile?.status ?? "Active")} />
          </div>
          <dl className="mt-6 space-y-3 border-t border-border pt-5 text-left text-sm">
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Wallet balance</dt><dd className="font-medium">{ngn(Number(wallet?.balance ?? 0))}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Member since</dt><dd className="font-medium">{formatDate(profile?.created_at)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Last sign-in</dt><dd className="font-medium">{formatDateTime(profile?.last_login_at)}</dd></div>
          </dl>
        </div>

        <div className="space-y-5">
          <form
            className="surface-card p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!profile) return;
              setSaving(true);
              const { error } = await supabase
                .from("profiles")
                .update({
                  full_name: form.full_name.trim(),
                  phone: form.phone.trim() || null,
                  country: form.country.trim() || null,
                })
                .eq("id", profile.id);
              setSaving(false);
              if (error) {
                toast.error(error.message);
                return;
              }
              await qc.invalidateQueries({ queryKey: ["profile"] });
              toast.success("Profile updated");
            }}
          >
            <h2 className="text-sm font-semibold">Personal information</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-name">Full name</Label>
                <Input id="p-name" value={form.full_name} onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-email">Email</Label>
                <Input id="p-email" type="email" value={profile?.email ?? ""} readOnly className="bg-secondary/60" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-phone">Phone</Label>
                <Input id="p-phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+234 803 000 0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-country">Country</Label>
                <Input id="p-country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="Nigeria" />
              </div>
            </div>
            <Button type="submit" className="mt-6" disabled={saving || !profile}>{saving ? "Saving…" : "Save changes"}</Button>
          </form>

          <div className="surface-card p-6">
            <h2 className="text-sm font-semibold">Account security</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Account ID</dt><dd className="truncate font-mono text-xs">{profile?.id ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Email confirmed</dt><dd className="font-medium">Managed by Gigz Exchange</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Password</dt><dd className="font-medium">Change it from the sign-in page</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}

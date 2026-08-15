import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Gigz Exchange" },
      { name: "description", content: "Request a password reset link for your Gigz Exchange account." },
      { property: "og:title", content: "Reset your password — Gigz Exchange" },
      { property: "og:description", content: "Request a password reset link for your account." },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="We'll email you a secure link to choose a new password."
      footer={<Link to="/login" className="font-semibold text-foreground hover:text-accent">Back to sign in</Link>}
    >
      {sent ? (
        <div className="rounded-2xl border border-success/30 bg-success/10 p-6 text-center">
          <MailCheck className="mx-auto h-8 w-8 text-success" />
          <h2 className="mt-3 text-base font-semibold">Check your inbox</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            If {email || "that address"} matches an account, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          setBusy(false);
          setSent(true);
        }}>
          <div className="space-y-2">
            <Label htmlFor="fp-email">Email address</Label>
            <Input id="fp-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={busy}>{busy ? "Sending…" : "Send reset link"}</Button>
        </form>
      )}
    </AuthLayout>
  );
}

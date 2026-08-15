import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password — Gigz Exchange" },
      { name: "description", content: "Set a new password for your Gigz Exchange account and get back to your dashboard." },
      { property: "og:title", content: "Choose a new password — Gigz Exchange" },
      { property: "og:description", content: "Set a new password for your Gigz Exchange account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setReady(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setReady(Boolean(session)));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle="Pick something strong — at least 8 characters."
      footer={<Link to="/login" className="font-semibold text-foreground hover:text-accent">Back to sign in</Link>}
    >
      {!ready ? (
        <div className="rounded-2xl border border-border bg-secondary/40 p-6 text-center text-sm text-muted-foreground">
          <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
          Open this page from the reset link in your email to continue.
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (password.length < 8) return setError("Use at least 8 characters.");
            if (password !== confirm) return setError("Passwords must match.");
            setError("");
            setBusy(true);
            const { error: updateError } = await supabase.auth.updateUser({ password });
            setBusy(false);
            if (updateError) return setError(updateError.message);
            toast.success("Password updated");
            navigate({ to: "/dashboard", replace: true });
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="rp-password">New password</Label>
            <div className="relative">
              <Input
                id="rp-password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-11"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rp-confirm">Confirm password</Label>
            <Input
              id="rp-confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            {busy ? "Updating…" : "Update password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

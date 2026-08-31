import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Gigz Exchange" },
      { name: "description", content: "Create a free Gigz Exchange account and get access to SMS verification numbers in 50+ countries." },
      { property: "og:title", content: "Create your account — Gigz Exchange" },
      { property: "og:description", content: "Free account, numbers in 50+ countries, pay only for what you use." },
    ],
  }),
  component: RegisterPage,
});

/**
 * Checks a password against the public "Have I Been Pwned" breach database
 * using the k-anonymity model: only the first 5 characters of the SHA-1
 * hash are ever sent over the network, never the password itself or the
 * full hash. This mirrors the same check Supabase Auth performs server-side
 * on signUp, so the user sees a consistent warning BEFORE submitting
 * instead of a contradictory rejection after.
 *
 * Returns: number of times seen in breaches (0 = clean), or null if the
 * check couldn't be completed (e.g. offline) — in which case we fail open
 * and let Supabase's own server-side check be the final word.
 */
async function checkPwnedPassword(password: string): Promise<number | null> {
  try {
    const bytes = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-1", bytes);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.split("\n").find((line) => line.startsWith(suffix));
    if (!match) return 0;
    const count = parseInt(match.split(":")[1] ?? "0", 10);
    return Number.isFinite(count) ? count : 0;
  } catch {
    return null; // fail open — never block signup on a network hiccup
  }
}

function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");

  // null = not checked yet, 0 = confirmed clean, >0 = seen in N breaches
  const [pwnedCount, setPwnedCount] = useState<number | null>(null);
  const [checkingPwned, setCheckingPwned] = useState(false);

  useEffect(() => {
    if (form.password.length < 8) {
      setPwnedCount(null);
      setCheckingPwned(false);
      return;
    }
    setCheckingPwned(true);
    const handle = setTimeout(async () => {
      const count = await checkPwnedPassword(form.password);
      setPwnedCount(count);
      setCheckingPwned(false);
    }, 500); // debounce so we don't hit the API on every keystroke
    return () => clearTimeout(handle);
  }, [form.password]);

  const isBreached = pwnedCount !== null && pwnedCount > 0;

  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : "Enter a valid email address.",
    password:
      form.password.length < 8
        ? "Use at least 8 characters."
        : isBreached
        ? "This password has appeared in known data breaches. Please choose a different one."
        : "",
    confirm: form.confirm !== form.password || !form.confirm ? "Passwords must match." : "",
    terms: terms ? "" : "You must accept the terms.",
  };
  const valid = Object.values(errors).every((e) => !e);

  const compositionStrength = Math.min(
    4,
    [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(form.password)).length,
  );
  // If the password is a known breach, show it as weak regardless of how
  // "complex" it looks — a leaked password is unsafe no matter its shape.
  const displayStrength = isBreached ? 4 : compositionStrength;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start verifying in minutes. Your wallet starts at ₦0 — no card required."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-foreground hover:text-accent">Sign in</Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setTouched(true);
          if (!valid) return;
          setServerError("");
          setBusy(true);
          const { error } = await supabase.auth.signUp({
            email: form.email.trim(),
            password: form.password,
            options: {
              data: { full_name: form.name.trim() },
            },
          });
          setBusy(false);
          if (error) {
            setServerError(error.message);
            return;
          }
          void navigate({ to: "/verify-email", search: { email: form.email.trim() } });
        }}
      >
        <Field htmlFor="reg-name" label="Full name" error={touched ? errors.name : ""}>
          <Input id="reg-name" value={form.name} onChange={set("name")} placeholder="Ada Okafor" />
        </Field>
        <Field htmlFor="reg-email" label="Email address" error={touched ? errors.email : ""}>
          <Input id="reg-email" type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
        </Field>
        <Field htmlFor="reg-password" label="Password" error={touched ? errors.password : ""}>
          <div className="relative">
            <Input id="reg-password" type={show ? "text" : "password"} value={form.password} onChange={set("password")} className="pr-11" />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={show ? "Hide password" : "Show password"}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i < displayStrength
                    ? isBreached
                      ? "bg-destructive"
                      : displayStrength <= 2
                      ? "bg-warning"
                      : "bg-success"
                    : "bg-border",
                )}
              />
            ))}
          </div>
          {form.password.length >= 8 ? (
            checkingPwned ? (
              <p className="mt-1.5 text-xs text-muted-foreground">Checking password safety…</p>
            ) : isBreached ? (
              <p className="mt-1.5 text-xs font-medium text-destructive">
                This password has appeared in {pwnedCount!.toLocaleString()} known data breaches. Please choose a different one.
              </p>
            ) : pwnedCount === 0 ? (
              <p className="mt-1.5 text-xs text-success">No known breaches found for this password.</p>
            ) : null
          ) : null}
        </Field>
        <Field htmlFor="reg-confirm" label="Confirm password" error={touched ? errors.confirm : ""}>
          <div className="relative">
            <Input id="reg-confirm" type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} className="pr-11" />
            {form.confirm && form.confirm === form.password ? (
              <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-success" />
            ) : null}
          </div>
        </Field>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox checked={terms} onCheckedChange={(v) => setTerms(Boolean(v))} className="mt-0.5" />
          <span>
            I agree to the Terms of Service and Privacy Policy.
            {touched && errors.terms ? <span className="block text-xs text-destructive">{errors.terms}</span> : null}
          </span>
        </label>
        {serverError ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive ring-1 ring-inset ring-destructive/25">
            {serverError}
          </p>
        ) : null}
        <Button type="submit" className="w-full" size="lg" disabled={busy || checkingPwned}>
          {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : "Create account"}
        </Button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, error, children, htmlFor }: { label: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

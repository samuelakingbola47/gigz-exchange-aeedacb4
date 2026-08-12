import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check, Eye, EyeOff } from "lucide-react";
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

function RegisterPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    name: form.name.trim().length < 2 ? "Enter your full name." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "" : "Enter a valid email address.",
    password: form.password.length < 8 ? "Use at least 8 characters." : "",
    confirm: form.confirm !== form.password || !form.confirm ? "Passwords must match." : "",
    terms: terms ? "" : "You must accept the terms.",
  };
  const valid = Object.values(errors).every((e) => !e);

  const strength = Math.min(4, [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) => r.test(form.password)).length);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start verifying in minutes. No card required for the prototype."
      footer={
        <>
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-foreground hover:text-accent">Sign in</Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (valid) navigate({ to: "/dashboard" });
        }}
      >
        <Field label="Full name" error={touched ? errors.name : ""}>
          <Input value={form.name} onChange={set("name")} placeholder="Ada Okafor" />
        </Field>
        <Field label="Email address" error={touched ? errors.email : ""}>
          <Input type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" />
        </Field>
        <Field label="Password" error={touched ? errors.password : ""}>
          <div className="relative">
            <Input type={show ? "text" : "password"} value={form.password} onChange={set("password")} className="pr-11" />
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
                  i < strength ? (strength <= 2 ? "bg-warning" : "bg-success") : "bg-border",
                )}
              />
            ))}
          </div>
        </Field>
        <Field label="Confirm password" error={touched ? errors.confirm : ""}>
          <div className="relative">
            <Input type={show ? "text" : "password"} value={form.confirm} onChange={set("confirm")} className="pr-11" />
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
        <Button type="submit" className="w-full" size="lg">Create account</Button>
      </form>
    </AuthLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}

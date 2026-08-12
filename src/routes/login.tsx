import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/site/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Gigz Exchange" },
      { name: "description", content: "Sign in to your Gigz Exchange account to buy numbers, track orders and manage your wallet." },
      { property: "og:title", content: "Log in — Gigz Exchange" },
      { property: "og:description", content: "Sign in to manage numbers, orders and your wallet." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("ada.okafor@example.com");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Gigz Exchange account."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-foreground hover:text-accent">Create one</Link>
        </>
      }
    >
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!email.includes("@") || password.length < 6) {
            setError("Enter a valid email and a password of at least 6 characters.");
            return;
          }
          setError("");
          navigate({ to: "/dashboard" });
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-11"
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
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Checkbox defaultChecked /> Remember me for 30 days
        </label>
        {error ? (
          <p className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>
        ) : null}
        <Button type="submit" className="w-full" size="lg">Sign in</Button>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          Demo login — any valid-looking credentials open the dashboard.
        </p>
      </form>
    </AuthLayout>
  );
}

import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Gigz Exchange" },
      { name: "description", content: "Sign in to your Gigz Exchange account to buy numbers, track orders and manage your Naira wallet." },
      { property: "og:title", content: "Log in — Gigz Exchange" },
      { property: "og:description", content: "Sign in to manage numbers, orders and your wallet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const [busy, setBusy] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => {
      setTilt({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden gradient-ink px-4 py-10 sm:px-6">
      {/* Cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-noise opacity-25" />
        <div
          className="absolute -left-32 top-[-10%] h-[34rem] w-[34rem] rounded-full bg-accent/25 blur-[140px] animate-drift"
          style={{ transform: `translate3d(${tilt.x * -22}px, ${tilt.y * -18}px, 0)` }}
        />
        <div
          className="absolute -right-24 bottom-[-15%] h-[30rem] w-[30rem] rounded-full bg-primary/25 blur-[150px] animate-drift"
          style={{ animationDelay: "-6s", transform: `translate3d(${tilt.x * 26}px, ${tilt.y * 20}px, 0)` }}
        />
        <div className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
        <div className="absolute inset-y-0 left-1/3 w-40 skew-x-12 bg-gradient-to-r from-transparent via-white/6 to-transparent animate-sweep" />
        {/* Floating abstract nodes */}
        {[
          { c: "left-[12%] top-[22%] h-24 w-24", d: "0s" },
          { c: "left-[8%] bottom-[18%] h-16 w-16", d: "-3s" },
          { c: "right-[14%] top-[16%] h-20 w-20", d: "-5s" },
          { c: "right-[9%] bottom-[24%] h-28 w-28", d: "-7s" },
        ].map((n) => (
          <span
            key={n.c}
            className={cn(
              "absolute hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md animate-float-slow lg:block",
              n.c,
            )}
            style={{ animationDelay: n.d, transform: `translate3d(${tilt.x * 12}px, ${tilt.y * 12}px, 0)` }}
          />
        ))}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-[26.5rem]">
        <div className="animate-rise flex justify-center">
          <Logo tone="light" />
        </div>

        <div
          className="glass-panel animate-rise mt-7 rounded-3xl p-6 sm:p-8"
          style={{
            animationDelay: "80ms",
            transform: `perspective(1200px) rotateX(${tilt.y * -1.2}deg) rotateY(${tilt.x * 1.6}deg)`,
            transition: "transform 350ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent ring-1 ring-inset ring-white/12">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure sign in
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-foreground">Welcome back</h1>
          <p className="mt-1.5 text-sm text-ink-foreground/60">
            Sign in to buy numbers, track verifications and manage your ₦ wallet.
          </p>

          <form
            className="mt-7 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@") || password.length < 6) {
                setError("Enter a valid email and a password of at least 6 characters.");
                return;
              }
              setError("");
              setBusy(true);
              setTimeout(() => navigate({ to: "/dashboard" }), 550);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-ink-foreground/80">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="h-11 border-white/12 bg-white/6 text-ink-foreground placeholder:text-ink-foreground/35 focus-visible:border-accent/60"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-ink-foreground/80">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-ink-foreground/55 hover:text-accent">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 border-white/12 bg-white/6 pr-11 text-ink-foreground focus-visible:border-accent/60"
                />
                <button
                  type="button"
                  onClick={() => setShow((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-foreground/50 hover:text-ink-foreground"
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2.5 text-sm text-ink-foreground/65">
              <Checkbox defaultChecked className="border-white/25 data-[state=checked]:border-accent data-[state=checked]:bg-accent" />
              Remember me for 30 days
            </label>

            {error ? (
              <p className="rounded-xl bg-destructive/20 px-4 py-3 text-sm text-ink-foreground ring-1 ring-inset ring-destructive/40">
                {error}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full shadow-[0_18px_40px_-18px_var(--accent)]" disabled={busy}>
              {busy ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</> : "Sign in"}
            </Button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-ink-foreground/35">
              <span className="h-px flex-1 bg-white/12" /> or <span className="h-px flex-1 bg-white/12" />
            </div>

            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full border-white/15 bg-white/5 text-ink-foreground hover:bg-white/10 hover:text-ink-foreground"
              onClick={() => setError("Social sign-in is a visual placeholder in this prototype.")}
            >
              <SiGoogle className="mr-2 h-4 w-4" /> Continue with Google
            </Button>
          </form>

          <p className="mt-7 text-center text-sm text-ink-foreground/60">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-ink-foreground hover:text-accent">Create one</Link>
          </p>
        </div>

        <p className="animate-rise mt-6 text-center text-xs text-ink-foreground/45" style={{ animationDelay: "160ms" }}>
          Demo login — any valid-looking credentials open the dashboard.
          <span className="mt-2 block">
            <Link to="/" className="hover:text-ink-foreground">← Back to gigzexchange.com</Link>
          </span>
        </p>
      </div>
    </main>
  );
}

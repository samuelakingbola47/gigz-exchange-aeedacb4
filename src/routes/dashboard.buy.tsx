import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Loader2, MessageSquareText, RefreshCw, Search, Timer, X } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { countries, services } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";

export const Route = createFileRoute("/dashboard/buy")({
  head: () => ({
    meta: [
      { title: "Buy Number — Gigz Exchange" },
      { name: "description", content: "Select a country and service, request a verification number and track your SMS in real time." },
      { property: "og:title", content: "Buy Number — Gigz Exchange" },
      { property: "og:description", content: "Pick a country and service, then receive your verification code." },
    ],
  }),
  component: BuyNumber,
});

type Phase = "idle" | "requesting" | "waiting" | "received" | "cancelled";

function BuyNumber() {
  const [countryId, setCountryId] = useState<string | null>("us");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [cq, setCq] = useState("");
  const [sq, setSq] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(1200);
  const [code, setCode] = useState<string | null>(null);

  const country = countries.find((c) => c.id === countryId) ?? null;
  const service = services.find((s) => s.id === serviceId) ?? null;
  const price = country && service ? country.price + service.price * 0.35 : 0;

  const filteredCountries = useMemo(
    () => countries.filter((c) => c.name.toLowerCase().includes(cq.toLowerCase())),
    [cq],
  );
  const filteredServices = useMemo(
    () => services.filter((s) => s.name.toLowerCase().includes(sq.toLowerCase())),
    [sq],
  );

  useEffect(() => {
    if (phase !== "waiting") return;
    const t = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const sms = setTimeout(() => {
      setCode("482 167");
      setPhase("received");
      toast.success("SMS received", { description: "Verification code 482167 (demo)." });
    }, 6000);
    return () => {
      clearInterval(t);
      clearTimeout(sms);
    };
  }, [phase]);

  const number = country ? `${country.dial} ${country.id === "us" ? "213 555 0189" : "802 555 0143"}` : "";
  const step = phase !== "idle" ? 4 : service ? 3 : country ? 2 : 1;

  const request = () => {
    setPhase("requesting");
    setSeconds(1200);
    setCode(null);
    setTimeout(() => setPhase("waiting"), 1200);
  };

  const reset = () => {
    setPhase("idle");
    setCode(null);
  };

  return (
    <CustomerShell title="Buy a number" subtitle="Mock inventory — no real SMS provider is connected in Phase 1.">
      <div className="mb-6 grid gap-2 sm:grid-cols-4">
        {["Select country", "Select service", "Request number", "Active order"].map((label, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-3 rounded-2xl border px-4 py-3",
              step > i ? "border-accent/50 bg-accent/8" : "border-border bg-card",
            )}
          >
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                step > i ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground",
              )}
            >
              {step > i + 1 ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            <span className="text-sm font-medium">{label}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr_360px]">
        <Panel title="1 · Country" search={<SearchInput value={cq} onChange={setCq} placeholder="Search countries…" />}>
          {filteredCountries.map((c) => (
            <button
              key={c.id}
              onClick={() => { setCountryId(c.id); reset(); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                countryId === c.id ? "bg-ink text-ink-foreground" : "hover:bg-secondary",
              )}
            >
              <span className="text-lg">{c.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className={cn("block text-xs", countryId === c.id ? "text-ink-foreground/60" : "text-muted-foreground")}>
                  {c.numbers.toLocaleString()} available
                </span>
              </span>
              <span className="text-sm font-semibold">{ngn(c.price)}</span>
            </button>
          ))}
        </Panel>

        <Panel title="2 · Service" search={<SearchInput value={sq} onChange={setSq} placeholder="Search services…" />}>
          {filteredServices.map((s) => (
            <button
              key={s.id}
              onClick={() => { setServiceId(s.id); reset(); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                serviceId === s.id ? "bg-ink text-ink-foreground" : "hover:bg-secondary",
              )}
            >
              <span className="text-lg">{s.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{s.name}</span>
                <span className={cn("block text-xs capitalize", serviceId === s.id ? "text-ink-foreground/60" : "text-muted-foreground")}>
                  {s.availability} availability
                </span>
              </span>
              <span className="text-sm font-semibold">{ngn(s.price)}</span>
            </button>
          ))}
        </Panel>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold">Order summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Country" value={country ? `${country.flag} ${country.name}` : "—"} />
              <Row label="Service" value={service ? `${service.emoji} ${service.name}` : "—"} />
              <Row label="Duration" value="20 minutes" />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={country && service ? `${ngn(price)}` : "—"} strong />
              </div>
            </dl>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!country || !service || phase === "requesting" || phase === "waiting" || phase === "received"}
              onClick={request}
            >
              {phase === "requesting" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reserving number…</> : "Request number"}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Refunded automatically if no SMS arrives.
            </p>
          </div>

          {phase === "idle" ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-center text-xs text-muted-foreground">
              Your active order will appear here once you request a number.
            </div>
          ) : (
            <div className="surface-card overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-border px-5 py-4">
                <h3 className="text-sm font-semibold">Active order</h3>
                <StatusBadge
                  status={phase === "received" ? "sms_received" : phase === "cancelled" ? "cancelled" : "waiting"}
                  label={phase === "received" ? "SMS Received" : phase === "cancelled" ? "Cancelled" : "Waiting"}
                />
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Phone number</p>
                  <div className="mt-1 flex items-center gap-2">
                    <p className="font-display text-lg font-bold">{number}</p>
                    <button
                      onClick={() => toast.success("Number copied (demo)")}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Copy number"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-secondary/70 px-4 py-3">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold tabular-nums">
                    {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-foreground">until expiry</span>
                </div>

                <div className="rounded-xl border border-border p-4">
                  <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    <MessageSquareText className="h-3.5 w-3.5" /> SMS status
                  </p>
                  {code ? (
                    <p className="mt-2 font-display text-2xl font-bold tracking-[0.3em] text-accent">{code}</p>
                  ) : phase === "cancelled" ? (
                    <p className="mt-2 text-sm text-muted-foreground">Order cancelled — funds returned to wallet.</p>
                  ) : (
                    <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Waiting for incoming SMS…
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast("Repeat SMS requested (demo)")}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Resend
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { setPhase("cancelled"); toast("Order cancelled (demo)"); }}
                  >
                    <X className="mr-1.5 h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
                {phase === "cancelled" || phase === "received" ? (
                  <Button variant="ghost" size="sm" className="w-full" onClick={reset}>Start a new order</Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomerShell>
  );
}

function Panel({ title, search, children }: { title: string; search: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="surface-card flex max-h-[560px] flex-col overflow-hidden">
      <div className="space-y-3 border-b border-border p-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {search}
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto p-2">{children}</div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9" />
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}

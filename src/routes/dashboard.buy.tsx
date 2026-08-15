import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { CountryFlag } from "@/components/brand/CountryFlag";
import { useBuyNumber, useCancelOrder, useCountries, useOrders, useServices, useWallet } from "@/lib/queries";
import { countdown } from "@/lib/format";
import { SmsSessionPanel } from "@/components/sms/SmsSessionPanel";

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

function BuyNumber() {
  const { data: countries = [], isLoading: countriesLoading } = useCountries();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: wallet } = useWallet();
  const { data: activeOrders = [] } = useOrders(["waiting", "sms_received"]);
  const buy = useBuyNumber();
  const cancel = useCancelOrder();

  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [serviceCode, setServiceCode] = useState<string | null>(null);
  const [cq, setCq] = useState("");
  const [sq, setSq] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const country = countries.find((c) => c.country_code === countryCode) ?? null;
  const service = services.find((s) => s.code === serviceCode) ?? null;
  const price = country && service ? Number(country.base_price) + Number(service.base_price) : 0;
  const balance = Number(wallet?.balance ?? 0);
  const insufficient = Boolean(country && service && balance < price);
  const order = activeOrders[0] ?? null;

  const filteredCountries = useMemo(
    () => countries.filter((c) => c.name.toLowerCase().includes(cq.toLowerCase())),
    [countries, cq],
  );
  const filteredServices = useMemo(
    () => services.filter((s) => s.name.toLowerCase().includes(sq.toLowerCase())),
    [services, sq],
  );

  const step = order ? 4 : service ? 3 : country ? 2 : 1;
  void tick;

  return (
    <CustomerShell
      title="Buy a number"
      subtitle="Demo inventory — no SMS provider is connected yet, but orders and wallet debits are real."
    >
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
          {countriesLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
            : filteredCountries.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCountryCode(c.country_code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    countryCode === c.country_code ? "bg-ink text-ink-foreground" : "hover:bg-secondary",
                  )}
                >
                  <CountryFlag country={c.country_code} name={c.name} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{c.name}</span>
                    <span className={cn("block text-xs", countryCode === c.country_code ? "text-ink-foreground/60" : "text-muted-foreground")}>
                      {c.numbers_available.toLocaleString()} available
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{ngn(Number(c.base_price))}</span>
                </button>
              ))}
        </Panel>

        <Panel title="2 · Service" search={<SearchInput value={sq} onChange={setSq} placeholder="Search services…" />}>
          {servicesLoading
            ? [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)
            : filteredServices.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setServiceCode(s.code)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                    serviceCode === s.code ? "bg-ink text-ink-foreground" : "hover:bg-secondary",
                  )}
                >
                  <ServiceIcon service={s.code} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{s.name}</span>
                    <span className={cn("block text-xs capitalize", serviceCode === s.code ? "text-ink-foreground/60" : "text-muted-foreground")}>
                      {s.availability} availability
                    </span>
                  </span>
                  <span className="text-sm font-semibold">{ngn(Number(s.base_price))}</span>
                </button>
              ))}
        </Panel>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h3 className="text-sm font-semibold">Order summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row
                label="Country"
                value={country ? <span className="flex items-center gap-2"><CountryFlag country={country.country_code} name={country.name} size="sm" />{country.name}</span> : "—"}
              />
              <Row
                label="Service"
                value={service ? <span className="flex items-center gap-2"><ServiceIcon service={service.code} size="sm" plain />{service.name}</span> : "—"}
              />
              <Row label="Duration" value="20 minutes" />
              <Row label="Wallet balance" value={ngn(balance)} />
              <div className="border-t border-border pt-3">
                <Row label="Total" value={country && service ? ngn(price) : "—"} strong />
              </div>
            </dl>
            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!country || !service || insufficient || buy.isPending || Boolean(order)}
              onClick={() => {
                if (!country || !service) return;
                buy.mutate(
                  { countryCode: country.country_code, serviceCode: service.code },
                  {
                    onSuccess: (o) => toast.success("Number reserved", { description: `${o.phone_number} · ${o.order_reference}` }),
                    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not reserve a number"),
                  },
                );
              }}
            >
              {buy.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Reserving number…</> : "Request number"}
            </Button>
            {insufficient ? (
              <p className="mt-3 text-center text-xs font-medium text-destructive">
                Not enough balance. <Link to="/dashboard/wallet" className="underline">Add funds</Link>
              </p>
            ) : order ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">Finish or cancel your active order first.</p>
            ) : (
              <p className="mt-3 text-center text-xs text-muted-foreground">Cancel before expiry and your wallet is refunded.</p>
            )}
          </div>

          {!order ? (
            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 text-center text-xs text-muted-foreground">
              Your active order will appear here once you request a number.
            </div>
          ) : (
            <SmsSessionPanel
              phoneNumber={order.phone_number ?? "—"}
              country={order.country}
              countryCode={order.country_code}
              service={order.service}
              serviceCode={order.service_code}
              orderReference={order.order_reference}
              expiresAt={order.expires_at}
              demo
              state={order.status === "sms_received" ? "received" : "waiting"}
              messages={
                order.verification_code
                  ? [{
                      id: order.id,
                      sender: order.service,
                      body: `Your ${order.service} verification code is ${order.verification_code}.`,
                      receivedAt: order.updated_at ?? order.created_at,
                    }]
                  : []
              }
              endingSession={cancel.isPending}
              onEndSession={() =>
                cancel.mutate(order.id, {
                  onSuccess: () => toast.success("Session ended", { description: "Your wallet has been refunded." }),
                  onError: (e) => toast.error(e instanceof Error ? e.message : "Could not end session"),
                })
              }
            />
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

function Row({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={strong ? "font-display text-lg font-bold" : "font-medium"}>{value}</dd>
    </div>
  );
}

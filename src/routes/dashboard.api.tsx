import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Copy, KeyRound, RefreshCw, Terminal } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/dashboard/api")({
  head: () => ({
    meta: [
      { title: "API — Keys & Usage | Gigz Exchange" },
      { name: "description", content: "Manage API keys, monitor request statistics and preview the Gigz Exchange API documentation." },
      { property: "og:title", content: "API — Keys & Usage | Gigz Exchange" },
      { property: "og:description", content: "API keys, usage statistics and documentation preview." },
    ],
  }),
  component: ApiPage,
});

const endpoints = [
  { method: "GET", path: "/v1/countries", desc: "List available countries and pricing." },
  { method: "GET", path: "/v1/services", desc: "List services with availability." },
  { method: "POST", path: "/v1/orders", desc: "Request a number for a country + service." },
  { method: "GET", path: "/v1/orders/{id}", desc: "Poll order status and received SMS." },
  { method: "POST", path: "/v1/orders/{id}/cancel", desc: "Cancel a waiting order." },
  { method: "GET", path: "/v1/wallet", desc: "Retrieve current wallet balance." },
];

function ApiPage() {
  const [key, setKey] = useState("gx_live_9f2a••••••••••••••7f21");

  return (
    <CustomerShell
      title="API"
      subtitle="Placeholder API console — the live API ships in Phase 2."
      actions={
        <Button
          onClick={() => {
            setKey(`gx_live_${Math.random().toString(36).slice(2, 6)}••••••••••••••${Math.random().toString(36).slice(2, 6)}`);
            toast.success("New API key generated (demo)");
          }}
        >
          <KeyRound className="mr-1.5 h-4 w-4" />Generate API key
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="API status" value="Operational" hint="All endpoints healthy" />
        <StatCard label="Requests (30d)" value="184,201" trend="+9%" hint="vs previous period" />
        <StatCard label="Success rate" value="99.4%" hint="2xx responses" />
        <StatCard label="Avg. latency" value="212 ms" hint="p50 across regions" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Live API key</h2>
            <StatusBadge status="Active" />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-4 py-3">
            <code className="flex-1 truncate font-mono text-sm">{key}</code>
            <button onClick={() => toast.success("API key copied (demo)")} className="text-muted-foreground hover:text-foreground" aria-label="Copy API key">
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Created 2026-07-28 · Last used 2 hours ago. Rotating a key does not affect active orders.
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => toast("Key rotated (demo)")}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />Rotate key
          </Button>
        </div>

        <div className="surface-card p-5">
          <h2 className="text-sm font-semibold">Monthly usage</h2>
          <div className="mt-5 space-y-5">
            {[
              { l: "Requests", v: 184201, max: 250000 },
              { l: "Orders created", v: 12840, max: 20000 },
              { l: "Webhook deliveries", v: 9420, max: 25000 },
            ].map((u) => (
              <div key={u.l}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{u.l}</span>
                  <span className="text-muted-foreground">{u.v.toLocaleString()} / {u.max.toLocaleString()}</span>
                </div>
                <Progress value={(u.v / u.max) * 100} className="mt-2 h-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="surface-card mt-6 overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Terminal className="h-4 w-4" />API documentation</h2>
          <p className="text-xs text-muted-foreground">Placeholder layout — full reference arrives with the Phase 2 API.</p>
        </div>
        <Tabs defaultValue="endpoints" className="p-5">
          <TabsList>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="example">Example</TabsTrigger>
          </TabsList>
          <TabsContent value="endpoints" className="mt-5 space-y-2">
            {endpoints.map((e) => (
              <div key={e.path} className="flex flex-wrap items-center gap-3 rounded-xl border border-border px-4 py-3">
                <span className="rounded-md bg-ink px-2 py-1 font-mono text-[11px] font-bold text-ink-foreground">{e.method}</span>
                <code className="font-mono text-sm">{e.path}</code>
                <span className="text-xs text-muted-foreground">{e.desc}</span>
              </div>
            ))}
          </TabsContent>
          <TabsContent value="auth" className="mt-5">
            <p className="text-sm text-muted-foreground">
              Send your key as a bearer token on every request. Keys are scoped to a single account and can be rotated at any time.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-ink p-4 font-mono text-xs text-ink-foreground">
{`Authorization: Bearer gx_live_xxxxxxxxxxxxxxxx
Content-Type: application/json`}
            </pre>
          </TabsContent>
          <TabsContent value="example" className="mt-5">
            <pre className="overflow-x-auto rounded-xl bg-ink p-4 font-mono text-xs text-ink-foreground">
{`curl -X POST https://api.gigzexchange.demo/v1/orders \\
  -H "Authorization: Bearer gx_live_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{ "country": "us", "service": "whatsapp" }'`}
            </pre>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerShell>
  );
}

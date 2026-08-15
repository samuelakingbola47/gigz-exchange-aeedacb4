import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/app/EmptyState";
import { useServices } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";
import { ServiceIcon } from "@/components/brand/ServiceIcon";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — SMS Verification Catalogue | Gigz Exchange" },
      { name: "description", content: "Browse verification services available on Gigz Exchange with live pricing and availability indicators." },
      { property: "og:title", content: "Services — SMS Verification Catalogue | Gigz Exchange" },
      { property: "og:description", content: "Browse verification services with live pricing and availability." },
    ],
  }),
  component: ServicesPage,
});

const categories = ["All", "Messaging", "Social", "Tech", "Finance", "Marketplace"] as const;

const availabilityTone: Record<string, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/20 text-warning-foreground",
  low: "bg-destructive/10 text-destructive",
};

function ServicesPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof categories)[number]>("All");
  const { data: services = [] } = useServices();

  const list = useMemo(
    () =>
      services.filter(
        (s) =>
          (cat === "All" || s.category === cat) &&
          s.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [services, query, cat],
  );

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Service marketplace"
        title="Choose a service, get a number"
        description="Live catalogue from the Gigz Exchange platform. Prices are shown in Naira."
      />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  cat === c ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              icon={Search}
              title="No services found"
              description="Try a different search term or category filter."
              action={<Button variant="outline" onClick={() => { setQuery(""); setCat("All"); }}>Reset filters</Button>}
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((s) => (
              <div key={s.id} className="surface-card group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start justify-between">
                  <ServiceIcon service={s.code} size="lg" />
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", availabilityTone[s.availability])}>
                    {s.availability} availability
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.name}</h3>
                <p className="text-xs text-muted-foreground">{s.category} · {s.numbers_available.toLocaleString()} numbers</p>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Starting at</p>
                    <p className="font-display text-xl font-bold">{ngn(Number(s.base_price))}</p>
                  </div>
                  <Button asChild size="sm"><Link to="/dashboard/buy">Get Number</Link></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/app/EmptyState";
import { countries } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ngn } from "@/lib/currency";
import { CountryFlag } from "@/components/brand/CountryFlag";

export const Route = createFileRoute("/countries")({
  head: () => ({
    meta: [
      { title: "Countries — Global Number Coverage | Gigz Exchange" },
      { name: "description", content: "Explore SMS verification number availability by country, with starting prices and live stock indicators." },
      { property: "og:title", content: "Countries — Global Number Coverage | Gigz Exchange" },
      { property: "og:description", content: "Number availability by country with starting prices and stock indicators." },
    ],
  }),
  component: CountriesPage,
});

const regions = ["All", "Americas", "Europe", "Africa", "Asia", "Oceania"] as const;

const tone: Record<string, string> = {
  high: "bg-success/15 text-success",
  medium: "bg-warning/20 text-warning-foreground",
  low: "bg-destructive/10 text-destructive",
};

function CountriesPage() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<(typeof regions)[number]>("All");

  const list = useMemo(
    () =>
      countries.filter(
        (c) =>
          (region === "All" || c.region === region) &&
          c.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query, region],
  );

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Country marketplace"
        title="Local numbers in 50+ countries"
        description="Demo inventory for the prototype. Real provider inventory connects in Phase 2."
      />
      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="surface-card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search countries…" className="pl-9" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {regions.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  region === r ? "bg-ink text-ink-foreground" : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {list.length === 0 ? (
          <div className="mt-8">
            <EmptyState icon={Search} title="No countries found" description="Adjust your search or region filter." />
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <div key={c.id} className="surface-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CountryFlag country={c.id} name={c.name} size="xl" className="rounded-lg" />
                    <div>
                      <h3 className="text-base font-semibold">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.dial} · {c.region}</p>
                    </div>
                  </div>
                  <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize", tone[c.availability])}>
                    {c.availability}
                  </span>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Available</dt>
                    <dd className="mt-0.5 font-semibold">{c.numbers.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">From</dt>
                    <dd className="mt-0.5 font-semibold">{ngn(c.price)}</dd>
                  </div>
                </dl>
                <Button asChild size="sm" variant="outline" className="mt-4 w-full">
                  <Link to="/dashboard/buy">Browse numbers</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

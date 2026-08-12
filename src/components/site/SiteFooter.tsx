import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

const groups = [
  {
    title: "Platform",
    links: [
      { to: "/services", label: "Services" },
      { to: "/countries", label: "Countries" },
      { to: "/pricing", label: "Pricing" },
      { to: "/how-it-works", label: "How It Works" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Log in" },
      { to: "/register", label: "Create account" },
      { to: "/dashboard", label: "Customer dashboard" },
      { to: "/admin", label: "Admin dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/faq", label: "FAQ" },
      { to: "/contact", label: "Contact" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Gigz Exchange gives customers fast, reliable access to SMS verification numbers across
              50+ countries through one simple platform.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-muted-foreground">
              Phase 1 prototype · demo data only
            </p>
          </div>
          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {g.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.to + l.label}>
                    <Link to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Gigz Exchange. All rights reserved.</p>
          <p>Statistics and pricing shown are placeholder data.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl gradient-ink shadow-[var(--shadow-card)]">
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
          <path d="M4 8.5A4.5 4.5 0 0 1 8.5 4H15" stroke="oklch(0.78 0.13 172)" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M20 15.5A4.5 4.5 0 0 1 15.5 20H9" stroke="oklch(0.72 0.12 205)" strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2.1" fill="oklch(0.85 0.12 172)" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[17px] font-bold tracking-tight",
            tone === "light" ? "text-ink-foreground" : "text-foreground",
          )}
        >
          Gigz <span className="text-gradient-accent">Exchange</span>
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          SMS Verification
        </span>
      </span>
    </Link>
  );
}

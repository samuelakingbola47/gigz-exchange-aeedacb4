import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <div className={cn("surface-card p-5 transition-shadow hover:shadow-[var(--shadow-lift)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {Icon ? (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-secondary text-foreground/70">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
        {trend ? <span className="font-semibold text-success">{trend}</span> : null}
        {hint ? <span>{hint}</span> : null}
      </div>
    </div>
  );
}

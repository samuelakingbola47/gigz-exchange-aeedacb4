import { cn } from "@/lib/utils";

const tones: Record<string, string> = {
  waiting: "bg-warning/15 text-warning-foreground ring-warning/40",
  Waiting: "bg-warning/15 text-warning-foreground ring-warning/40",
  Pending: "bg-warning/15 text-warning-foreground ring-warning/40",
  sms_received: "bg-info/15 text-info ring-info/35",
  "SMS Received": "bg-info/15 text-info ring-info/35",
  Open: "bg-info/15 text-info ring-info/35",
  completed: "bg-success/15 text-success ring-success/35",
  Completed: "bg-success/15 text-success ring-success/35",
  Resolved: "bg-success/15 text-success ring-success/35",
  Active: "bg-success/15 text-success ring-success/35",
  Online: "bg-success/15 text-success ring-success/35",
  expired: "bg-muted text-muted-foreground ring-border",
  Expired: "bg-muted text-muted-foreground ring-border",
  cancelled: "bg-destructive/10 text-destructive ring-destructive/30",
  Cancelled: "bg-destructive/10 text-destructive ring-destructive/30",
  Failed: "bg-destructive/10 text-destructive ring-destructive/30",
  Suspended: "bg-destructive/10 text-destructive ring-destructive/30",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset",
        tones[status] ?? "bg-secondary text-secondary-foreground ring-border",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? status}
    </span>
  );
}

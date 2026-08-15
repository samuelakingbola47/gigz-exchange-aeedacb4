import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Ban, Check, Copy, Hourglass, MessageSquareText, PhoneOff, Radar, Timer,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CountryFlag } from "@/components/brand/CountryFlag";
import { ServiceIcon } from "@/components/brand/ServiceIcon";
import { cn } from "@/lib/utils";
import { countdown } from "@/lib/format";

export type SmsMessage = {
  id: string;
  sender?: string | null;
  body: string;
  receivedAt: string;
};

export type SmsSessionState =
  | "waiting"
  | "received"
  | "expired"
  | "unavailable"
  | "provider_error"
  | "timeout"
  | "cancelled";

export type SmsSessionPanelProps = {
  phoneNumber: string;
  country: string;
  countryCode: string;
  service: string;
  serviceCode: string;
  orderReference: string;
  expiresAt?: string | null;
  state: SmsSessionState;
  messages?: SmsMessage[];
  /** Shows the "test data" ribbon while no real provider is connected. */
  demo?: boolean;
  onEndSession?: () => void;
  endingSession?: boolean;
  className?: string;
};

/** Extract a 4-8 digit verification code only when it is unambiguous. */
export function extractCode(body: string): string | null {
  const matches = body.match(/\b\d{4,8}\b/g);
  if (!matches || matches.length !== 1) return null;
  return matches[0]!;
}

const stateCopy: Record<Exclude<SmsSessionState, "waiting" | "received">, { title: string; body: string; icon: typeof Ban }> = {
  expired: { title: "Session expired", body: "No SMS arrived before the number expired. Your wallet was refunded automatically.", icon: Hourglass },
  unavailable: { title: "Number unavailable", body: "This number was withdrawn by the provider before it could receive a message.", icon: PhoneOff },
  provider_error: { title: "Provider error", body: "The upstream provider rejected this session. Try requesting another number.", icon: AlertTriangle },
  timeout: { title: "SMS delivery timeout", body: "The service did not deliver an SMS in time. You can retry with a fresh number.", icon: Timer },
  cancelled: { title: "Order cancelled", body: "You ended this session. The amount was refunded to your wallet.", icon: Ban },
};

export function SmsSessionPanel({
  phoneNumber, country, countryCode, service, serviceCode, orderReference,
  expiresAt, state, messages = [], demo, onEndSession, endingSession, className,
}: SmsSessionPanelProps) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const timeLeft = useMemo(() => countdown(expiresAt), [expiresAt, tick]);
  const copy = (value: string, label: string) => {
    void navigator.clipboard?.writeText(value);
    toast.success(`${label} copied`);
  };

  const primary = messages[0] ?? null;
  const code = primary ? extractCode(primary.body) : null;

  return (
    <div className={cn("surface-card overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CountryFlag country={countryCode} name={country} size="sm" />
          <span className="text-sm font-semibold">{country}</span>
          <span className="text-muted-foreground">·</span>
          <ServiceIcon service={serviceCode} size="sm" plain />
          <span className="text-sm text-muted-foreground">{service}</span>
        </div>
        {demo ? (
          <span className="rounded-full border border-dashed border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Test data
          </span>
        ) : null}
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Assigned number</p>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <p className="font-display text-2xl font-bold tracking-tight">{phoneNumber}</p>
            <Button size="sm" variant="secondary" onClick={() => copy(phoneNumber, "Number")}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy number
            </Button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{orderReference}</p>
        </div>

        {state === "waiting" ? (
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 text-center">
            <div className="relative mx-auto grid h-28 w-28 place-items-center">
              <span className="animate-radar-ping absolute inset-0 rounded-full border border-accent/40" aria-hidden />
              <span className="animate-radar-ping absolute inset-0 rounded-full border border-accent/30" style={{ animationDelay: "0.8s" }} aria-hidden />
              <span className="animate-radar-ping absolute inset-0 rounded-full border border-accent/20" style={{ animationDelay: "1.6s" }} aria-hidden />
              <span
                className="animate-radar-sweep absolute inset-2 rounded-full"
                style={{ background: "conic-gradient(from 0deg, transparent 0deg, var(--color-accent) 40deg, transparent 90deg)", opacity: 0.28 }}
                aria-hidden
              />
              <span className="grid h-14 w-14 place-items-center rounded-full bg-accent/15 text-accent ring-1 ring-inset ring-accent/30">
                <Radar className="h-6 w-6" />
              </span>
            </div>
            <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              Listening for incoming SMS…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep this page open. Messages sent to this number appear here instantly.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 ring-1 ring-inset ring-border">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold tabular-nums">{timeLeft}</span>
              <span className="text-xs text-muted-foreground">session remaining</span>
            </div>
          </div>
        ) : state === "received" ? (
          <div className="animate-sms-in space-y-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-success">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-success text-success-foreground">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              SMS received
            </p>

            {code ? (
              <div className="rounded-2xl border border-accent/40 bg-accent/8 p-4 text-center">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Verification code</p>
                <p className="mt-1 font-display text-3xl font-bold tracking-[0.3em] text-accent">{code}</p>
                <Button size="sm" className="mt-3" onClick={() => copy(code, "Code")}>
                  <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy code
                </Button>
              </div>
            ) : null}

            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MessageSquareText className="h-3.5 w-3.5" />
                      {m.sender?.trim() ? m.sender : "Unknown sender"}
                    </span>
                    <time dateTime={m.receivedAt}>{relativeTime(m.receivedAt)}</time>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm">{m.body}</p>
                </li>
              ))}
            </ul>
            {messages.length > 1 ? (
              <p className="text-xs text-muted-foreground">{messages.length} messages received on this number.</p>
            ) : null}
          </div>
        ) : (
          <ClosedState state={state} />
        )}

        {onEndSession && (state === "waiting" || state === "received") ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-destructive hover:text-destructive"
            disabled={endingSession}
            onClick={onEndSession}
          >
            <Ban className="mr-1.5 h-3.5 w-3.5" /> End session
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function ClosedState({ state }: { state: Exclude<SmsSessionState, "waiting" | "received"> }) {
  const c = stateCopy[state];
  return (
    <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card text-muted-foreground ring-1 ring-inset ring-border">
        <c.icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold">{c.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{c.body}</p>
    </div>
  );
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return "just now";
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins} min ago`;
  return new Date(iso).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" });
}

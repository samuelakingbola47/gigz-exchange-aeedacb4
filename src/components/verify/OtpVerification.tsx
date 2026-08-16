import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type VerificationStatus = "idle" | "verifying" | "success" | "error";

export type VerifyResult = boolean | { ok: boolean; title?: string; message?: string };

export type OtpVerificationProps = {
  /** Number the code was sent to (display only). */
  phoneNumber?: string;
  /** Number of digits. Defaults to 6. */
  length?: number;
  /** Controlled status override (e.g. driven by a real provider later). */
  verificationStatus?: VerificationStatus;
  /** ISO timestamp — shown as a code-expiry hint. */
  expiresAt?: string | null;
  /** Seconds before the code can be resent. */
  resendSeconds?: number;
  title?: string;
  description?: ReactNode;
  /** Real verification hook-up point. */
  onVerify: (code: string) => Promise<VerifyResult> | VerifyResult;
  /** Real resend hook-up point. */
  onResend?: () => Promise<void> | void;
  onContinue?: () => void;
  className?: string;
};

export function OtpVerification({
  phoneNumber = "+234 810 000 0000",
  length = 6,
  verificationStatus,
  expiresAt,
  resendSeconds = 45,
  title = "Enter verification code",
  description,
  onVerify,
  onResend,
  onContinue,
  className,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(() => Array.from({ length }, () => ""));
  const [focused, setFocused] = useState(false);
  const [internalStatus, setInternalStatus] = useState<VerificationStatus>("idle");
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(resendSeconds);
  const [errorInfo, setErrorInfo] = useState<{ title: string; message: string }>({
    title: "Verification failed",
    message: "Invalid verification code. Please check your email and try again.",
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const status = verificationStatus ?? internalStatus;
  const value = digits.join("");
  const filled = value.length === length;
  const inOrbit = status === "verifying" || status === "success" || (filled && status !== "error");

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const runVerify = useCallback(
    async (code: string) => {
      setInternalStatus("verifying");
      const start = Date.now();
      let result: VerifyResult;
      try {
        result = await onVerify(code);
      } catch {
        result = false;
      }
      const ok = typeof result === "boolean" ? result : result.ok;
      if (!ok && typeof result === "object") {
        setErrorInfo({
          title: result.title ?? "Verification failed",
          message: result.message ?? "Invalid verification code. Please check your email and try again.",
        });
      } else if (!ok) {
        setErrorInfo({
          title: "Verification failed",
          message: "Invalid verification code. Please check your email and try again.",
        });
      }
      const wait = Math.max(0, 1900 - (Date.now() - start));
      setTimeout(() => {
        if (ok) {
          setInternalStatus("success");
        } else {
          setInternalStatus("error");
          setShake(true);
          setTimeout(() => setShake(false), 600);
        }
      }, wait);
    },
    [onVerify],
  );

  const handleChange = (raw: string) => {
    if (status === "verifying" || status === "success") return;
    const next = raw.replace(/\D/g, "").slice(0, length);
    if (internalStatus === "error") setInternalStatus("idle");
    setDigits(Array.from({ length }, (_, i) => next[i] ?? ""));
    if (next.length === length) void runVerify(next);
  };

  const reset = () => {
    setDigits(Array.from({ length }, () => ""));
    setInternalStatus("idle");
    inputRef.current?.focus();
  };

  const resend = async () => {
    if (countdown > 0) return;
    await onResend?.();
    setCountdown(resendSeconds);
    reset();
  };

  const positions = useMemo(() => {
    const radius = 86;
    return digits.map((_, i) => {
      if (!inOrbit) return { x: (i - (length - 1) / 2) * 74, y: 0, lift: 0 };
      const angle = (-90 + (360 / length) * i) * (Math.PI / 180);
      return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, lift: -6 };
    });
  }, [digits, inOrbit, length]);

  const expiryLabel = expiresAt
    ? new Date(expiresAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className={cn("surface-card relative overflow-hidden p-6 sm:p-8", className)}>
      <div
        className="pointer-events-none absolute inset-x-0 -top-24 h-56 opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--color-accent), transparent)" }}
        aria-hidden
      />

      <div className="relative text-center">
        <h3 className="font-display text-xl font-bold sm:text-2xl">
          {status === "success" ? "Verified successfully" : status === "error" ? errorInfo.title : title}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {status === "success"
            ? "Your verification has been completed."
            : status === "error"
              ? errorInfo.message
              : (description ?? (
                  <>
                    We sent a {length}-digit code to <span className="font-medium text-foreground">{phoneNumber}</span>
                    {expiryLabel ? ` · expires ${expiryLabel}` : ""}
                  </>
                ))}
        </p>
      </div>

      {/* Stage */}
      <div
        className={cn(
          "relative mx-auto mt-8 h-[240px] w-full max-w-[380px] select-none sm:h-[280px]",
          shake && "animate-otp-shake",
        )}
      >
        {/* orbit rings */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-[188px] w-[188px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/25 transition-all duration-700",
            inOrbit ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border transition-all duration-700",
            inOrbit ? "animate-orbit-spin scale-100 opacity-70" : "scale-75 opacity-0",
          )}
        />

        {/* centre core */}
        <div
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500",
            inOrbit ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        >
          {status === "success" ? (
            <div className="relative grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 animate-ring-expand rounded-full border-2 border-success" aria-hidden />
              <span className="absolute inset-0 rounded-full bg-success/15 blur-md" aria-hidden />
              {[0, 60, 120, 180, 240, 300].map((a) => (
                <span
                  key={a}
                  aria-hidden
                  className="animate-spark absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-success"
                  style={{ ["--gx-a" as string]: `${a}deg`, animationDelay: `${a / 600}s` }}
                />
              ))}
              <span className="animate-pop-in grid h-16 w-16 place-items-center rounded-full bg-success text-success-foreground shadow-lg">
                <Check className="h-8 w-8" strokeWidth={3} />
              </span>
            </div>
          ) : status === "error" ? (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/12 text-destructive">
              <ShieldAlert className="h-7 w-7" />
            </div>
          ) : (
            <div className="relative grid h-20 w-20 place-items-center">
              <span className="absolute inset-0 rounded-full bg-accent/20 blur-xl" aria-hidden />
              <svg className="absolute inset-0 h-20 w-20 -rotate-90" viewBox="0 0 80 80" aria-hidden>
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="2" />
                <circle
                  className="animate-dash"
                  cx="40" cy="40" r="34" fill="none"
                  stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round"
                  strokeDasharray="52 162"
                />
              </svg>
              <span className="animate-core-pulse h-9 w-9 rounded-full bg-accent/80" />
            </div>
          )}
        </div>

        {/* digits */}
        {digits.map((d, i) => {
          const active = !inOrbit && i === Math.min(value.length, length - 1) && focused;
          const p = positions[i]!;
          return (
            <div
              key={i}
              className={cn(
                "absolute left-1/2 top-1/2 grid h-14 w-12 place-items-center rounded-2xl border font-display text-2xl font-bold transition-all duration-700 sm:h-16 sm:w-14",
                "[transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                inOrbit
                  ? status === "success"
                    ? "border-success/50 bg-success/10 text-success"
                    : "border-accent/45 bg-accent/8 text-foreground"
                  : d
                    ? "border-accent/45 bg-card"
                    : "border-border bg-secondary/50",
                active && "border-accent shadow-[0_0_0_4px_oklch(0.72_0.14_178_/_0.16)]",
              )}
              style={{
                transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y + p.lift}px) scale(${inOrbit ? 0.92 : 1})`,
                transitionDelay: `${i * 70}ms`,
              }}
            >
              {d || (inOrbit ? "" : <span className="text-muted-foreground/40">•</span>)}
            </div>
          );
        })}

        {/* hidden input */}
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          inputMode="numeric"
          autoComplete="one-time-code"
          aria-label="Verification code"
          maxLength={length}
          disabled={status === "verifying" || status === "success"}
          className={cn(
            "absolute left-1/2 top-1/2 h-16 w-[300px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-2xl bg-transparent text-center text-transparent caret-transparent outline-none",
            inOrbit && "pointer-events-none",
          )}
        />
      </div>

      {/* footer states */}
      <div className="relative mt-2 text-center">
        {status === "verifying" && (
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Verifying…
          </p>
        )}

        {status === "success" && (
          <Button className="mt-2 w-full sm:w-auto sm:min-w-48" size="lg" onClick={onContinue}>
            Continue
          </Button>
        )}

        {status === "error" && (
          <Button variant="outline" className="mt-2 w-full sm:w-auto sm:min-w-48" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try again
          </Button>
        )}

        {(status === "idle" || status === "error") && (
          <p className="mt-4 text-xs text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            {countdown > 0 ? (
              <span className="font-medium tabular-nums text-foreground">Resend in {countdown}s</span>
            ) : (
              <button onClick={() => void resend()} className="font-semibold text-accent underline-offset-4 hover:underline">
                Resend code
              </button>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

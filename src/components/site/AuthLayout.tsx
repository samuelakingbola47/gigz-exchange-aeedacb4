import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Globe2 } from "lucide-react";
import { Logo } from "./Logo";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p> : null}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">← Back to gigzexchange.com</Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden gradient-ink lg:block">
        <div className="absolute inset-0 grid-noise opacity-40" />
        <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative flex h-full flex-col justify-center px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Gigz Exchange</p>
          <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight text-ink-foreground">
            One platform for every verification you need
          </h2>
          <ul className="mt-10 space-y-5">
            {[
              { icon: Zap, t: "Codes in under a minute", d: "Live routes monitored continuously." },
              { icon: Globe2, t: "50+ countries", d: "Local numbers wherever you operate." },
              { icon: ShieldCheck, t: "Automatic refunds", d: "Never pay for a failed verification." },
            ].map((i) => (
              <li key={i.t} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/8 text-accent ring-1 ring-inset ring-white/10">
                  <i.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-foreground">{i.t}</p>
                  <p className="text-xs text-ink-foreground/60">{i.d}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
            {[["10,000+", "Users"], ["1M+", "Verifications"], ["99%", "Availability"]].map(([v, l]) => (
              <div key={l}>
                <p className="font-display text-xl font-bold text-ink-foreground">{v}</p>
                <p className="text-[11px] text-ink-foreground/55">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  ChevronLeft,
  LayoutDashboard,
  Menu,
  Search,
  Wallet,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export function AppShell({
  items,
  children,
  title,
  subtitle,
  actions,
  variant = "customer",
}: {
  items: NavItem[];
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  variant?: "customer" | "admin";
}) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const sidebar = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Logo tone="light" />
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-4 pt-4">
        <span className="inline-flex rounded-full bg-sidebar-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sidebar-primary">
          {variant === "admin" ? "Admin console" : "Customer"}
        </span>
      </div>
      <nav className="mt-3 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        {items.map((item) => {
          const active = pathname === item.to || (item.to !== "/dashboard" && item.to !== "/admin" && pathname.startsWith(item.to));
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-4">
        <Link
          to={variant === "admin" ? "/dashboard" : "/admin"}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          {variant === "admin" ? "Customer dashboard" : "Admin dashboard"}
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <button
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search orders, numbers, services…" className="pl-9" />
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:flex">
                <Wallet className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold">$128.34</span>
              </div>
              <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card">
                <Bell className="h-4 w-4" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-accent" />
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl border border-border bg-card p-1.5 pr-3">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-ink text-[11px] text-ink-foreground">AO</AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:block">Ada O.</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>ada.okafor@example.com</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard/profile">Profile</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/settings">Settings</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/wallet">Wallet</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/login">Log out</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
              {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export { Button };

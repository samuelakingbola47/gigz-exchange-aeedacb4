import type { ReactNode } from "react";
import { AppShell } from "./AppShell";
import { customerNav, adminNav } from "./nav-items";

export function CustomerShell(props: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return <AppShell items={customerNav} variant="customer" {...props} />;
}

export function AdminShell(props: { title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  return <AppShell items={adminNav} variant="admin" {...props} />;
}

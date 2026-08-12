import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, MessageSquarePlus, Send } from "lucide-react";
import { toast } from "sonner";
import { CustomerShell } from "@/components/app/CustomerShell";
import { StatCard } from "@/components/app/StatCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { tickets } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({
    meta: [
      { title: "Support — Tickets & Help | Gigz Exchange" },
      { name: "description", content: "Open a support ticket, track its status and review your conversation history with the Gigz Exchange team." },
      { property: "og:title", content: "Support — Tickets & Help | Gigz Exchange" },
      { property: "og:description", content: "Open tickets, track status and review support conversations." },
    ],
  }),
  component: SupportPage,
});

function SupportPage() {
  const [selected, setSelected] = useState(tickets[0]!.id);
  const [open, setOpen] = useState(false);
  const ticket = tickets.find((t) => t.id === selected)!;

  return (
    <CustomerShell
      title="Support"
      subtitle="Average first response time: under 4 hours."
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><MessageSquarePlus className="mr-1.5 h-4 w-4" />New ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a ticket</DialogTitle>
              <DialogDescription>Tickets are simulated in this prototype.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Briefly describe the issue" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select defaultValue="Orders">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Billing", "Orders", "Technical", "API", "Other"].map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select defaultValue="Normal">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Low", "Normal", "High"].map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" rows={5} placeholder="Include order IDs where relevant…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => { setOpen(false); toast.success("Ticket submitted (demo)"); }}>Submit ticket</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open tickets" value="1" icon={LifeBuoy} />
        <StatCard label="Pending reply" value="1" hint="Awaiting your response" />
        <StatCard label="Resolved" value="14" hint="Lifetime" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Ticket history</h2>
          </div>
          <ul className="divide-y divide-border">
            {tickets.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => setSelected(t.id)}
                  className={cn("w-full px-5 py-4 text-left transition-colors", selected === t.id ? "bg-secondary" : "hover:bg-secondary/60")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold leading-snug">{t.subject}</p>
                    <StatusBadge status={t.status} />
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t.id} · {t.category} · {t.priority} priority
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">Updated {t.updated}</p>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-card flex flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">{ticket.subject}</h2>
              <p className="text-xs text-muted-foreground">{ticket.id} · {ticket.category} · {ticket.priority} priority</p>
            </div>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="flex-1 space-y-4 p-5">
            {ticket.messages.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "You" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-md rounded-2xl px-4 py-3 text-sm",
                    m.from === "You" ? "bg-ink text-ink-foreground" : "bg-secondary",
                  )}
                >
                  <p className="text-[11px] uppercase tracking-[0.12em] opacity-60">{m.from} · {m.at}</p>
                  <p className="mt-1.5 leading-relaxed">{m.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input placeholder="Write a reply…" />
              <Button onClick={() => toast.success("Reply sent (demo)")}><Send className="h-4 w-4" /></Button>
            </div>
          </div>
        </div>
      </div>
    </CustomerShell>
  );
}

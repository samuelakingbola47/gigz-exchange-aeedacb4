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
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/app/EmptyState";
import { useCreateTicket, useReplyToTicket, useTicketMessages, useTickets } from "@/lib/queries";
import { useAuthUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";

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
  const { user } = useAuthUser();
  const { data: tickets = [] } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "Orders", priority: "Normal", message: "" });
  const [reply, setReply] = useState("");

  const createTicket = useCreateTicket();
  const replyToTicket = useReplyToTicket();

  const ticket = tickets.find((t) => t.id === selectedId) ?? tickets[0] ?? null;
  const { data: messages = [] } = useTicketMessages(ticket?.id);

  const openCount = tickets.filter((t) => t.status === "Open").length;
  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

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
              <DialogDescription>Our team replies to tickets in the order they arrive.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Briefly describe the issue" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
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
                  <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
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
                <Textarea id="message" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Include order IDs where relevant…" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                disabled={createTicket.isPending || !form.subject.trim() || !form.message.trim()}
                onClick={() =>
                  createTicket.mutate(
                    { ...form, subject: form.subject.trim(), message: form.message.trim() },
                    {
                      onSuccess: (t) => {
                        setOpen(false);
                        setSelectedId(t.id);
                        setForm({ subject: "", category: "Orders", priority: "Normal", message: "" });
                        toast.success("Ticket submitted", { description: t.ticket_reference });
                      },
                      onError: (e) => toast.error(e instanceof Error ? e.message : "Could not create ticket"),
                    },
                  )
                }
              >
                Submit ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Open tickets" value={String(openCount)} icon={LifeBuoy} />
        <StatCard label="Pending reply" value={String(pendingCount)} hint="Awaiting a response" />
        <StatCard label="Resolved" value={String(resolvedCount)} hint="Lifetime" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="surface-card overflow-hidden">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">Ticket history</h2>
          </div>
          {tickets.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">No tickets yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setSelectedId(t.id)}
                    className={cn("w-full px-5 py-4 text-left transition-colors", ticket?.id === t.id ? "bg-secondary" : "hover:bg-secondary/60")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-snug">{t.subject}</p>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {t.ticket_reference} · {t.category} · {t.priority} priority
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Updated {formatDateTime(t.updated_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {ticket ? (
          <div className="surface-card flex flex-col overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">{ticket.subject}</h2>
                <p className="text-xs text-muted-foreground">{ticket.ticket_reference} · {ticket.category} · {ticket.priority} priority</p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            <div className="flex-1 space-y-4 p-5">
              {messages.map((m) => {
                const mine = m.user_id === user?.id && !m.is_staff;
                return (
                  <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-md rounded-2xl px-4 py-3 text-sm", mine ? "bg-ink text-ink-foreground" : "bg-secondary")}>
                      <p className="text-[11px] uppercase tracking-[0.12em] opacity-60">
                        {mine ? "You" : "Support"} · {formatDateTime(m.created_at)}
                      </p>
                      <p className="mt-1.5 leading-relaxed">{m.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-border p-4">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const text = reply.trim();
                  if (!text) return;
                  replyToTicket.mutate(
                    { ticketId: ticket.id, message: text },
                    {
                      onSuccess: () => setReply(""),
                      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not send reply"),
                    },
                  );
                }}
              >
                <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply…" />
                <Button type="submit" disabled={replyToTicket.isPending}><Send className="h-4 w-4" /></Button>
              </form>
            </div>
          </div>
        ) : (
          <div className="surface-card p-6">
            <EmptyState
              icon={LifeBuoy}
              title="No tickets yet"
              description="Open a ticket and our team will pick it up — your conversation will show up here."
              action={<Button onClick={() => setOpen(true)}>New ticket</Button>}
            />
          </div>
        )}
      </div>
    </CustomerShell>
  );
}

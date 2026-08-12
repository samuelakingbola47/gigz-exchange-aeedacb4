import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Mail, MapPin, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/components/site/PublicLayout";
import { PageHero } from "@/components/site/PageHero";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Talk to the Gigz Exchange Team" },
      { name: "description", content: "Reach the Gigz Exchange team about pricing, enterprise agreements, integrations or account support." },
      { property: "og:title", content: "Contact — Talk to the Gigz Exchange Team" },
      { property: "og:description", content: "Questions about pricing, enterprise plans or support? Get in touch." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <PublicLayout>
      <PageHero
        eyebrow="Contact"
        title="Talk to our team"
        description="Sales, support or partnership questions — we usually reply within a few hours."
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-14 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {[
            { icon: Mail, t: "Email us", d: "support@gigzexchange.demo", s: "Demo address for the prototype." },
            { icon: MessageSquare, t: "Live chat", d: "Available in dashboard", s: "Sign in and open Support." },
            { icon: Clock3, t: "Response time", d: "Under 4 hours average", s: "24/7 coverage for High priority." },
            { icon: MapPin, t: "Company", d: "Remote-first, global team", s: "Placeholder company details." },
          ].map((c) => (
            <div key={c.t} className="surface-card flex gap-4 p-5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent">
                <c.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{c.t}</p>
                <p className="mt-0.5 text-sm text-foreground/80">{c.d}</p>
                <p className="mt-1 text-xs text-muted-foreground">{c.s}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="surface-card p-6 sm:p-8"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Message sent (demo)", { description: "This prototype does not deliver real messages." });
          }}
        >
          <h2 className="text-lg font-semibold">Send us a message</h2>
          <p className="mt-1 text-sm text-muted-foreground">All submissions are simulated in Phase 1.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="c-name">Full name</Label>
              <Input id="c-name" placeholder="Ada Okafor" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c-email">Email</Label>
              <Input id="c-email" type="email" placeholder="you@company.com" required />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Label>Topic</Label>
            <Select defaultValue="sales">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sales">Sales & pricing</SelectItem>
                <SelectItem value="support">Account support</SelectItem>
                <SelectItem value="api">API & integrations</SelectItem>
                <SelectItem value="other">Something else</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 space-y-2">
            <Label htmlFor="c-msg">Message</Label>
            <Textarea id="c-msg" rows={6} placeholder="Tell us what you need…" required />
          </div>
          <Button type="submit" className="mt-6 w-full sm:w-auto">Send message</Button>
          {sent ? (
            <p className="mt-4 rounded-xl bg-success/12 px-4 py-3 text-sm text-success">
              Thanks — your message was captured in the prototype.
            </p>
          ) : null}
        </form>
      </section>
    </PublicLayout>
  );
}

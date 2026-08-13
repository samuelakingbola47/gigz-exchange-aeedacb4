import type { IconType } from "react-icons";
import {
  SiWhatsapp, SiTelegram, SiGoogle, SiFacebook, SiInstagram,
  SiTiktok, SiX, SiDiscord, SiPaypal, SiRevolut,
} from "react-icons/si";
import { FaMicrosoft, FaAmazon } from "react-icons/fa6";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Brand = { icon: IconType; color: string };

const brands: Record<string, Brand> = {
  whatsapp: { icon: SiWhatsapp, color: "#25D366" },
  telegram: { icon: SiTelegram, color: "#229ED9" },
  google: { icon: SiGoogle, color: "#4285F4" },
  facebook: { icon: SiFacebook, color: "#1877F2" },
  instagram: { icon: SiInstagram, color: "#E1306C" },
  tiktok: { icon: SiTiktok, color: "#010101" },
  x: { icon: SiX, color: "#0F1419" },
  microsoft: { icon: FaMicrosoft, color: "#00A4EF" },
  discord: { icon: SiDiscord, color: "#5865F2" },
  amazon: { icon: FaAmazon, color: "#FF9900" },
  paypal: { icon: SiPaypal, color: "#003087" },
  revolut: { icon: SiRevolut, color: "#0666EB" },
};

export function resolveServiceKey(nameOrId: string) {
  return nameOrId.trim().toLowerCase().replace(/[^a-z]/g, "");
}

const sizes = {
  sm: { box: "h-8 w-8 rounded-lg", glyph: "h-4 w-4" },
  md: { box: "h-10 w-10 rounded-xl", glyph: "h-5 w-5" },
  lg: { box: "h-12 w-12 rounded-2xl", glyph: "h-6 w-6" },
} as const;

export function ServiceIcon({
  service,
  size = "md",
  className,
  plain,
}: {
  service: string;
  size?: keyof typeof sizes;
  className?: string;
  plain?: boolean;
}) {
  const brand = brands[resolveServiceKey(service)];
  const Glyph = brand?.icon ?? MessageSquare;
  const color = brand?.color ?? "currentColor";
  const s = sizes[size];

  if (plain) {
    return <Glyph className={cn(s.glyph, "shrink-0", className)} style={{ color }} aria-hidden />;
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center ring-1 ring-inset ring-border/60",
        s.box,
        className,
      )}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)` }}
      aria-hidden
    >
      <Glyph className={s.glyph} style={{ color }} />
    </span>
  );
}

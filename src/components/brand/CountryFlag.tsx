import { cn } from "@/lib/utils";

// Country name → ISO 3166-1 alpha-2 (demo dataset).
const iso: Record<string, string> = {
  "united states": "us", "united kingdom": "gb", canada: "ca", nigeria: "ng",
  germany: "de", france: "fr", australia: "au", netherlands: "nl",
  india: "in", "south africa": "za", brazil: "br", indonesia: "id",
};

/** Accepts an id from mock-data ("uk") or a country name ("United Kingdom"). */
export function countryCode(idOrName: string) {
  const key = idOrName.trim().toLowerCase();
  if (iso[key]) return iso[key];
  if (key === "uk") return "gb";
  return key.length === 2 ? key : "un";
}

const sizes = {
  sm: "h-4 w-6",
  md: "h-5 w-7",
  lg: "h-8 w-11",
  xl: "h-10 w-14",
} as const;

export function CountryFlag({
  country,
  name,
  size = "md",
  className,
}: {
  country: string;
  name?: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const code = countryCode(country);
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w160/${code}.png 2x`}
      alt={`${name ?? country} flag`}
      loading="lazy"
      decoding="async"
      className={cn(
        "shrink-0 rounded-[3px] object-cover shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-black/10",
        sizes[size],
        className,
      )}
    />
  );
}

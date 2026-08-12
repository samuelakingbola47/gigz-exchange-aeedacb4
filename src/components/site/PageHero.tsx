export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border gradient-ink">
      <div className="absolute inset-0 grid-noise opacity-40" />
      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-ink-foreground sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-foreground/70">{description}</p>
      </div>
    </section>
  );
}

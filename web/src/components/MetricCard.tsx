interface MetricCardProps {
  label: string;
  value: string;
  hero?: boolean;
  tone?: "default" | "waste" | "recovered";
  loading?: boolean;
}

export function MetricCard({ label, value, hero = false, tone = "default", loading = false }: MetricCardProps) {
  const toneClass =
    tone === "waste" ? "text-waste" : tone === "recovered" ? "text-accent" : "text-ink";

  return (
    <div
      className={
        hero
          ? "rounded-card col-span-full bg-surface p-6 shadow-whisper sm:col-span-2 lg:col-span-3"
          : "rounded-card border border-hairline bg-surface p-5"
      }
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      {loading ? (
        <div
          className={`skeleton mt-2 ${hero ? "h-10 w-40" : "h-8 w-28"}`}
          aria-label={`Loading ${label}`}
        />
      ) : (
        <p
          className={`num mt-2 font-medium tabular-nums ${toneClass} ${
            hero ? "text-4xl" : "text-2xl"
          }`}
        >
          {value}
        </p>
      )}
    </div>
  );
}

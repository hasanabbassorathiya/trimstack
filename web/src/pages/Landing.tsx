interface LandingProps {
  onOpenDashboard: () => void;
}

function InlineImage({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="hidden md:inline-block h-[0.9em] w-[1.8em] rounded-md object-cover align-baseline mx-1"
      loading="lazy"
    />
  );
}

const PROBLEMS: Array<{ title: string; body: string }> = [
  {
    title: "Inactive seats",
    body: "Licenses keep billing long after people stop logging in. The spend never files a complaint.",
  },
  {
    title: "Forgotten trial conversions",
    body: "A trial quietly converts to paid, and nobody recalls who signed up or why.",
  },
  {
    title: "Redundant departmental tools",
    body: "Three teams buy three tools for the same job, on three different renewal dates.",
  },
];

const STEPS: Array<{ n: string; title: string; body: string }> = [
  {
    n: "01",
    title: "Add your subscriptions",
    body: "Every tool, cost, seat count, renewal date, and owning department in one registry.",
  },
  {
    n: "02",
    title: "Run the waste analysis",
    body: "Inactive seats, trial drift, duplicate tools, and blind renewals each get a dollar figure.",
  },
  {
    n: "03",
    title: "Resolve alerts and recover spend",
    body: "Act on the prioritized list and watch the Recovered total climb month over month.",
  },
];

export function Landing({ onOpenDashboard }: LandingProps) {
  const cta = (
    <button
      type="button"
      onClick={onOpenDashboard}
      className="min-h-11 rounded-lg bg-accent px-6 text-sm font-medium text-on-accent transition active:translate-y-[-1px] active:scale-[0.98]"
    >
      Open the dashboard
    </button>
  );

  return (
    <div className="space-y-[clamp(3rem,8vw,6rem)]">
      {/* 1. Hero — left-aligned asymmetric, inline image typography */}
      <section className="min-h-dvh pt-[clamp(3rem,10vh,6rem)]">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">TrimStack</p>
        <h1 className="mt-3 max-w-3xl font-sans text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.15] tracking-tight text-ink">
          Know what your stack
          <InlineImage src="https://picsum.photos/seed/trimstack-spend/240/120" alt="SaaS spend dashboard" />
          really costs.
        </h1>
        <p className="mt-6 max-w-[65ch] text-lg leading-relaxed text-muted">
          TrimStack itemizes every SaaS subscription your company pays for, flags the waste
          hiding in it, and keeps score of every dollar you recover.
        </p>
        <div className="mt-8">{cta}</div>
      </section>

      {/* 2. Problem stats — asymmetric band, honest claims only */}
      <section aria-label="The problem">
        <h2 className="max-w-2xl text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-ink">
          SaaS stacks grew department by department. Nobody was auditing the whole thing.
        </h2>
        <div className="mt-10 grid gap-8 md:grid-cols-5">
          <div className="md:col-span-3 md:md:border-t-2 md:border-hairline md:pt-6">
            <p className="text-lg text-muted">
              Dozens of subscriptions, spread across teams, with no single place showing what
              the company actually pays for. Finance finds out at renewal time.
            </p>
          </div>
          <ul className="md:col-span-2 space-y-6">
            {PROBLEMS.map((p) => (
              <li key={p.title} className="border-t border-hairline pt-4">
                <h3 className="font-medium text-ink">{p.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{p.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. How it works — 3 steps, 2-col zig-zag */}
      <section aria-label="How it works">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-ink">
          From registry to recovered dollars
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              className={
                i === STEPS.length - 1
                  ? "md:col-span-2 md:flex md:items-start md:gap-6 md:justify-center"
                  : i % 2 === 1
                    ? "md:mt-12"
                    : ""
              }
            >
              <span className="num block text-2xl font-medium text-accent">{step.n}</span>
              <div className="mt-2 md:mt-0">
                <h3 className="text-lg font-medium text-ink">{step.title}</h3>
                <p className="mt-1 max-w-[50ch] text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. CTA */}
      <section className="border-t border-hairline pt-10">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-tight text-ink">
          Your stack, itemized. Waste included.
        </h2>
        <p className="mt-3 max-w-[65ch] text-muted">
          The demo dashboard is loaded with a realistic 24-subscription company. See the
          waste in it before you add your own.
        </p>
        <div className="mt-8">{cta}</div>
        <footer className="mt-16 border-t border-hairline pt-6 text-sm text-muted">
          <p>TrimStack — spend visibility for finance teams.</p>
        </footer>
      </section>
    </div>
  );
}

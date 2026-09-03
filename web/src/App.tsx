export default function App() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 h-14 border-b border-hairline bg-surface">
        <p className="px-4 pt-4 font-sans font-semibold tracking-tight text-ink">
          TrimStack
        </p>
      </header>
      <main id="main-content" className="mx-auto max-w-[1400px] p-6">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Dashboard
        </h1>
        <p className="mt-2 text-muted">Foundation scaffold — dashboard lands with Phase 3c.</p>
        <p className="num mt-6 text-2xl">$0.00</p>
      </main>
    </div>
  );
}

export default function Loading() {
  return (
    <section className="container py-6 md:py-10">
      <div className="mb-6">
        <div className="h-3 w-24 rounded bg-muted animate-pulse" />
        <div className="mt-2 h-8 w-56 rounded bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[5/6] w-full rounded-xl bg-muted animate-pulse" />
            <div className="mt-2 h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="mt-1 h-3 w-1/3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

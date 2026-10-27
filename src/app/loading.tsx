export default function Loading() {
  return (
    <section className="container py-12" role="status" aria-label="Loading page">
      <p className="text-sm text-muted-foreground">Loading page...</p>
      <div className="mt-6 animate-pulse space-y-4 motion-reduce:animate-none" aria-hidden="true">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-48 rounded bg-muted" />
      </div>
    </section>
  );
}

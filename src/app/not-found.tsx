import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="container py-20 md:py-28">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-kibana-camel">404</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">Lost the thread</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The page you're looking for has moved, retired, or never existed. Let's get you back on track.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/shop">Shop bags</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

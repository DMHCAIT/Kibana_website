"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    console.error("Unable to load page content:", error);
  }, [error]);

  return (
    <section className="container py-12 text-center" role="alert">
      <h1 className="text-2xl">Unable to load this page</h1>
      <p className="mb-6 mt-3 text-muted-foreground">
        Please try again. Your page can be reloaded without refreshing your browser.
      </p>
      <button
        type="button"
        disabled={pending}
        className="btn-pill disabled:opacity-50"
        onClick={() => {
          startTransition(() => {
            router.refresh();
            reset();
          });
        }}
      >
        {pending ? "Loading..." : "Try Again"}
      </button>
    </section>
  );
}

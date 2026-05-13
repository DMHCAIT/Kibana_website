"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});
type FormValues = z.infer<typeof schema>;

export function NewsletterForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function onSubmit(_values: FormValues) {
    // Wire this to Resend / Supabase function later.
    await new Promise((r) => setTimeout(r, 700));
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 bg-kibana-cream/10 border border-kibana-cream/20 px-4 py-3 text-sm text-kibana-cream">
        <CheckCircle2 className="h-4 w-4 text-kibana-tan" />
        Thanks — you're on the list.
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-sm md:max-w-md flex-col gap-1"
    >
      <div className="flex gap-0">
        <input
          {...register("email")}
          type="email"
          placeholder="Enter Your Mail"
          aria-invalid={!!errors.email}
          className="h-10 flex-1 min-w-0 bg-kibana-cream/10 border border-kibana-cream/20 border-r-0 px-3 text-sm text-kibana-cream placeholder:text-kibana-cream/50 focus:outline-none focus:ring-1 focus:ring-kibana-tan"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-10 shrink-0 bg-kibana-tan text-kibana-ink px-4 text-sm font-semibold hover:bg-kibana-cream transition-colors disabled:opacity-60 inline-flex items-center gap-1.5"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Subscribe
        </button>
      </div>
      {errors.email && (
        <p className="text-xs text-red-300">{errors.email.message}</p>
      )}
    </form>
  );
}

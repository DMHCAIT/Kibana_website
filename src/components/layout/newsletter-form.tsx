"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

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
      <div className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-kibana-brown/30 px-5 py-3 text-[13px] text-kibana-brown">
        <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
        Thank you for subscribing to Kibana!
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-md flex-col gap-2"
    >
      <div className="relative">
        <input
          {...register("email")}
          type="email"
          placeholder="Enter Your Mail"
          aria-label="Email address"
          aria-invalid={!!errors.email}
          className="h-12 w-full rounded-full border border-foreground/25 bg-white pl-6 pr-14 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-kibana-brown focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          aria-label="Subscribe"
          className="absolute right-1.5 top-1.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-kibana-brown text-white transition-colors hover:bg-[#2f1f13] disabled:opacity-60"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          )}
        </button>
      </div>
      {errors.email && <p className="pl-6 text-[12px] text-kibana-sale">{errors.email.message}</p>}
    </form>
  );
}

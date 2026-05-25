"use client";

import { useState } from "react";

export function DeliveryCheck() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  function check() {
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ ok: false, msg: "Please enter a valid 6-digit pincode." });
      return;
    }
    // Delivery available across all India for any valid 6-digit pincode
    setResult({
      ok: true,
      msg: `We deliver to ${pincode}! Estimated delivery: 3–5 business days across India.`,
    });
  }

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Delivery Details</h3>
      <div className="flex w-full">
        <input
          type="text"
          inputMode="numeric"
          value={pincode}
          onChange={(e) =>
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          placeholder="Enter your Pincode"
          className="min-w-0 flex-1 border border-border border-r-0 px-3 py-2 text-sm outline-none focus:border-foreground placeholder:text-muted-foreground bg-background"
          maxLength={6}
          onKeyDown={(e) => e.key === "Enter" && check()}
        />
        <button
          type="button"
          onClick={check}
          className="bg-foreground text-background text-xs font-semibold tracking-[0.12em] px-5 py-2 hover:bg-foreground/90 transition-colors"
        >
          CHECK
        </button>
      </div>
      {result && (
        <p
          className={`mt-2 text-xs ${result.ok ? "text-emerald-700" : "text-destructive"}`}
        >
          {result.msg}
        </p>
      )}
    </div>
  );
}

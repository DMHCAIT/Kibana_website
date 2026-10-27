"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";

export function getEstimatedDeliveryDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)!.value);
  const deliveryDate = new Date(Date.UTC(value("year"), value("month") - 1, value("day") + 4));
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(deliveryDate);
}

export function EstimatedDelivery() {
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setDate(getEstimatedDeliveryDate());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="mt-5 flex items-center gap-2 text-xs">
      <Truck className="h-5 w-5 shrink-0" strokeWidth={1.5} aria-hidden="true" />
      <span>
        Est Delivery by:{" "}
        {date ? (
          <strong className="font-semibold">{date}</strong>
        ) : (
          <span>Calculating date...</span>
        )}
      </span>
    </p>
  );
}

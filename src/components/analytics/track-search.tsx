"use client";

import { useEffect } from "react";
import { trackSearch } from "@/lib/analytics";

type Props = {
  query: string;
  resultsCount: number;
};

export function TrackSearch({ query, resultsCount }: Props) {
  useEffect(() => {
    if (query) {
      trackSearch(query, resultsCount);
    }
  }, [query, resultsCount]);

  return null;
}

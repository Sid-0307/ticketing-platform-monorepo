"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PricingRefresher({ eventId }: { eventId: number }) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [router, eventId]);

  return null;
}

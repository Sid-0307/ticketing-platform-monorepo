// apps/web/src/components/PricingRefresher.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PricingRefresher({ eventId }: { eventId: number }) {
  const router = useRouter();

  useEffect(() => {
    // Refresh every 30 seconds for real-time pricing updates
    const interval = setInterval(() => {
      router.refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [router, eventId]);

  return null;
}

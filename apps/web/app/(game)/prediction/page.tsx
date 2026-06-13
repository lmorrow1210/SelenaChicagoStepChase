"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The prediction moved onto the Map screen; keep old links working.
export default function PredictionPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/map");
  }, [router]);
  return null;
}

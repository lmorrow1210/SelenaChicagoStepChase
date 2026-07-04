"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// M10: the City screen merged into Field Ops (the Intel panel).
// Past-city trophy views live on at /city/[cityId].
export default function CityRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/fieldops");
  }, [router]);
  return null;
}

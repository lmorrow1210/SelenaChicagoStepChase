"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Client redirect (static-export friendly): router.replace applies basePath.
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/map");
  }, [router]);
  return null;
}

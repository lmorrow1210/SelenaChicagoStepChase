"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// M10: the Bingo board merged into Field Ops. Keep old links working.
export default function BingoRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/fieldops");
  }, [router]);
  return null;
}

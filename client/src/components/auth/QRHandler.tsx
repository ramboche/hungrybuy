"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

export default function QRHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resolveTableFromToken } = useCart();
  const processedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get("table");
    if (token && !processedRef.current) {
      processedRef.current = true;

      resolveTableFromToken(token).then(() => {
        router.replace("/");
      });
    }
  }, [searchParams, resolveTableFromToken, router]);

  return null;
}

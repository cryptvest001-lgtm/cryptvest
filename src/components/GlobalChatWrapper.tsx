"use client";

import { usePathname } from "next/navigation";
import FloatingChat from "./FloatingChat";

export default function GlobalChatWrapper() {
  const pathname = usePathname();

  // Do not show floating chat on Admin routes (Admins have their own dashboard for this)
  if (pathname?.startsWith("/admin")) return null;

  return <FloatingChat />;
}

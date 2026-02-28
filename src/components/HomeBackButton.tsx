"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HomeBackButton() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  return (
    <Link href="/" className="home-back-btn" aria-label="返回主页面">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14.5 5.5L8 12l6.5 6.5"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}

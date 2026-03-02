"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  to: string;
};

export default function EntryRedirect({ to }: Props) {
  const router = useRouter();

  useEffect(() => {
    router.replace(to);
  }, [router, to]);

  return <div className="stack">跳转中...</div>;
}

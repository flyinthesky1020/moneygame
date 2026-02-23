import { Suspense } from "react";
import PlayClient from "./PlayClient";

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="stack">加载中...</div>}>
      <PlayClient />
    </Suspense>
  );
}

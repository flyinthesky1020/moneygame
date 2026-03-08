import { Suspense } from "react";
import PlayClient from "./PlayClient";

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="page-loader" role="status" aria-label="页面加载中">
          <span className="page-loader-spinner" />
        </div>
      }
    >
      <PlayClient />
    </Suspense>
  );
}

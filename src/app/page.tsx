"use client";

import dynamic from "next/dynamic";

const GameBoyConsole = dynamic(() => import("@/components/GameBoyConsole"), {
  ssr: false,
  loading: () => (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", color: "#c9c6e0", fontFamily: "monospace" }}>
      오일러 카트리지 로딩 중...
    </div>
  )
});

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--page)" }}>
      <GameBoyConsole />
    </main>
  );
}
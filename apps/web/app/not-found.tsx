"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ padding: "2rem", color: "#fff", background: "#0a0e13", minHeight: "100vh", fontFamily: "system-ui" }}>
      <h1>404 - Page not found</h1>
      <Link href="/" style={{ color: "#6b7280", marginTop: "1rem", display: "inline-block" }}>
        Go home
      </Link>
    </div>
  );
}

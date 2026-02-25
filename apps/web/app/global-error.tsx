"use client";

/**
 * Minimal error UI for build/prerender. Must not use AuthContext or other
 * context (replaces root layout when active). Avoids "useContext of null" during static generation.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#0a0e13", color: "#fff", fontFamily: "system-ui", padding: "2rem" }}>
        <h1>Something went wrong</h1>
        <p>{error.message || "An error occurred"}</p>
        <button
          type="button"
          onClick={reset}
          style={{ marginTop: "1rem", padding: "0.5rem 1rem", cursor: "pointer" }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}

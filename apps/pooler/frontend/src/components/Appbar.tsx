"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function AppBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const session = useSession();

  const handleLogout = () => {
    signOut({ redirect: false });
    router.push("/");
  };

  if (session.status === "loading") return null;

  return (
    <header
      className="sticky top-0 z-40 w-full border-b bg-background/95 text-foreground backdrop-blur supports-[backdrop-filter]:bg-background/80"
      role="banner"
      aria-label="Global navigation"
    >
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-3 md:px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded focus:outline-none focus:ring-2"
          style={{ outlineColor: "oklch(0.439 0 0)" }}
        >
          <span
            aria-hidden
            className="h-5 w-5 rounded-sm"
            style={{ backgroundColor: "#f5b300" }}
          />
          <span className="text-sm font-semibold tracking-wide">TradeX</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {!session || session.status === "unauthenticated" ? (
            <div className="flex items-center gap-6">
              <Link
                className="text-xs text-foreground/80 hover:text-foreground"
                href="/signin"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-black"
                href="/signup"
                style={{ backgroundColor: "#f5b300" }}
              >
                Register
              </Link>
            </div>
          ) : (
            <div>
              <Button onClick={handleLogout} variant={"destructive"}>
                Logout
              </Button>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-border bg-card text-foreground md:hidden focus:outline-none focus:ring-2"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label="Toggle menu"
          style={{ outlineColor: "oklch(0.439 0 0)" }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 6h18M3 12h18M3 18h18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={`${open ? "block" : "hidden"} border-t border-border md:hidden`}
      >
        <div className="space-y-1 px-3 py-3">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block rounded px-2 py-2 text-sm text-foreground/90 hover:bg-secondary"
          >
            Terminal
          </Link>
          <div className="flex gap-2 pt-2">
            <Link
              href="/signin"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-md border border-border bg-transparent px-3 py-2 text-sm text-foreground/90 hover:bg-secondary"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="inline-flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium text-black"
              style={{ backgroundColor: "#f5b300" }}
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

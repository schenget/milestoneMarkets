"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState<{ name?: string | null; email?: string | null } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("mm_user");
      if (raw) setUser(JSON.parse(raw));
    } catch {
      setUser(null);
    }
  }, []);

  const signOut = () => {
    localStorage.removeItem("mm_token");
    localStorage.removeItem("mm_user");
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-auto flex flex-col leading-none" aria-label="Milestone Markets home">
          <span className="font-display text-base font-bold tracking-tight text-primary">Milestone</span>
          <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">Markets</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Link href="/learn" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Learn</Link>
          <Link href="/analytics" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Analytics</Link>
          <Link href="/simulate" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Simulate</Link>
          <Link href="/portfolio" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Portfolio</Link>
          <Link href="/dashboard" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">Dashboard</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted">
                {user.name ?? user.email ?? "Profile"}
              </Link>
              <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted" onClick={signOut}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted">Sign In</Link>
              <Link href="/register" className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Get Started</Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl gap-2 overflow-x-auto px-4 pb-3 md:hidden">
        <Link href="/learn" className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Learn</Link>
        <Link href="/analytics" className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Analytics</Link>
        <Link href="/simulate" className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Simulate</Link>
        <Link href="/portfolio" className="whitespace-nowrap rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Portfolio</Link>
      </div>
    </nav>
  );
}

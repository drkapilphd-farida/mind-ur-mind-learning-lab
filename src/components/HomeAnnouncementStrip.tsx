"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

// Auto-expires the day after the event — no manual cleanup needed once
// 27 Sept 2026 has passed; the strip simply stops rendering.
const EVENT_EXPIRY = new Date("2026-09-28T00:00:00+05:30");
const DISMISS_STORAGE_KEY = "mum_prefrontal_strip_dismissed";

// Slim, non-sticky top strip — sits in normal document flow above the
// (sticky) Navbar, so once a visitor scrolls even slightly it scrolls
// away with the rest of the page rather than permanently eating into the
// viewport. Dismissal persists via localStorage (same technique as
// LanguageContext's own hydrate-after-mount pattern) so a visitor who
// closes it doesn't see it again on their next visit.
export default function HomeAnnouncementStrip(): React.JSX.Element | null {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem(DISMISS_STORAGE_KEY) === "1") {
      setDismissed(true);
    }
  }, []);

  if (dismissed || new Date() > EVENT_EXPIRY) return null;

  function handleDismiss(): void {
    setDismissed(true);
    window.localStorage.setItem(DISMISS_STORAGE_KEY, "1");
  }

  return (
    <div className="border-b border-line bg-[#12162a] px-4 py-2.5 text-center text-[12.5px] text-[#f5f1e6] sm:px-8">
      <div className="mx-auto flex max-w-content items-center justify-center gap-3">
        <Link href="/prefrontal-power-mumbai" className="min-w-0 truncate hover:underline">
          <span className="font-semibold text-gold">LIVE IN MUMBAI</span>
          <span className="text-[#8b8fa8]"> · 27 SEPT 2026 · </span>
          PREfrontal POWER — a one-day brain training workshop
          <span className="ml-1.5 font-semibold text-gold">Reserve Your Seat →</span>
        </Link>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[#8b8fa8] transition-colors hover:text-[#f5f1e6]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

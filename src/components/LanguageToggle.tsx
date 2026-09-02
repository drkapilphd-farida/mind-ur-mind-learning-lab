"use client";

import { useLanguage } from "@/context/LanguageContext";

type LanguageToggleProps = {
  // "light" (default): the site's normal .warm-light nav tokens. "dark":
  // for placement directly on a dark surface (e.g. CourseNav.tsx's hero
  // nav) — the default's text-ink-dim/border-line-strong tokens resolve
  // to near-invisible dark-on-dark there, same reasoning as
  // LivingBrainLogo's colorMode prop.
  variant?: "light" | "dark";
};

export default function LanguageToggle({ variant = "light" }: LanguageToggleProps): React.JSX.Element {
  const { lang, setLang } = useLanguage();
  const isDark = variant === "dark";

  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex items-center rounded-full border p-0.5 font-mono text-[12px] ${
        isDark ? "border-white/15" : "border-line-strong"
      }`}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-gold text-[#1B1508] font-semibold"
            : isDark
              ? "text-[#aeb2c8] hover:text-[#f5f1e6]"
              : "text-ink-dim hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("hi")}
        aria-pressed={lang === "hi"}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "hi"
            ? "bg-gold text-[#1B1508] font-semibold"
            : isDark
              ? "text-[#aeb2c8] hover:text-[#f5f1e6]"
              : "text-ink-dim hover:text-ink"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}

"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function LanguageToggle(): React.JSX.Element {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center rounded-full border border-line-strong p-0.5 font-mono text-[12px]"
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1.5 transition-colors ${
          lang === "en"
            ? "bg-gold text-[#1B1508] font-semibold"
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
            : "text-ink-dim hover:text-ink"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}

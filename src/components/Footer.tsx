"use client";

import { useLanguage } from "@/context/LanguageContext";

export default function Footer(): React.JSX.Element {
  const { t } = useLanguage();
  const f = t.footer;
  const columns = [f.columns.programs, f.columns.retreats, f.columns.mentoring, f.columns.habitApp, f.columns.philosophy];

  return (
    <footer className="px-6 pb-10 pt-16 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
              <span className="relative block h-6 w-6 rounded-full border border-gold">
                <span className="absolute inset-[5px] rounded-full border border-gold/60" />
              </span>
              MIND UR MIND
            </div>
            <p className="mt-4 max-w-[220px] text-[13.5px] leading-relaxed text-ink-dim">
              {f.blurb}
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-faint">
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[13.5px] text-ink-dim transition-colors hover:text-ink"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 font-mono text-[12px] uppercase tracking-[0.05em] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>{f.copyright}</span>
          <span>{f.location}</span>
        </div>
      </div>
    </footer>
  );
}

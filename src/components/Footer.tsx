"use client";

import { useLanguage } from "@/context/LanguageContext";
import { LivingBrainLogo } from "./brand/LivingBrainLogo";

export default function Footer(): React.JSX.Element {
  const { t } = useLanguage();
  const f = t.footer;
  const columns = [f.columns.programs, f.columns.retreats, f.columns.mentoring, f.columns.habitApp, f.columns.philosophy];

  // Clear of the Floating Widget™ — every page pairing this Footer with
  // <WhatsAppWidget /> has that widget fixed to the viewport's
  // bottom-right corner (bottom-24/bottom-16 on mobile, bottom-7 on
  // desktop, ~52px tall button). At maximum scroll the document's bottom
  // edge equals the viewport's bottom edge, so without enough reserved
  // space here the widget sits directly on top of the copyright/location
  // row below — confirmed happening on the homepage. pb-40 sm:pb-24
  // clears the widget's tallest real-world footprint (mobile) with a
  // small margin; only whitespace, never real content, ever sits behind
  // the widget's corner.
  return (
    <footer className="px-6 pb-40 pt-16 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 font-mono text-sm tracking-[0.06em]">
              <LivingBrainLogo size={24} decorative={false} animated={false} />
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

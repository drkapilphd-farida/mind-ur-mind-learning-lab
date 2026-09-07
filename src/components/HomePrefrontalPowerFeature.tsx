import { Eyebrow } from "./ui";

// A Different Kind of Offer™ — a single, date-bound, in-person event, not
// a sixth evergreen digital program, so it's deliberately styled calmer
// than both the gold-accented Habit Builder feature right below it and
// the dark QSR flagship card further down — a plain, quiet border rather
// than either of their stronger visual treatments, so it reads as a
// complementary, time-sensitive offering rather than competing with
// Habit Builder for primary attention.
export default function HomePrefrontalPowerFeature(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-content">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 rounded-sm border border-line-strong bg-panel2 px-7 py-9 text-center sm:px-10 sm:py-10">
          <div>
            <div className="flex justify-center">
              <Eyebrow color="text-ink-faint">Live, In-Person Experience</Eyebrow>
            </div>
            <h2 className="mt-4 text-[22px] font-extrabold leading-tight sm:text-[26px]">
              Your Brain Is Your Biggest Performance Tool.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-ink-dim">
              PREfrontal POWER — a one-day, science-informed brain training workshop in Mumbai. Not a
              lecture, not a retreat.
            </p>
          </div>

          <p className="font-mono text-[12px] uppercase tracking-[0.05em] text-ink-faint">
            27 Sept 2026 · Mumbai · ₹3,500 · 40 Seats
          </p>

          <a
            href="/prefrontal-power-mumbai"
            className="group inline-flex items-center gap-2.5 rounded-sm border border-gold/50 px-7 py-[13px] text-[13.5px] font-semibold text-gold transition-colors hover:bg-gold-soft"
          >
            Learn More &amp; Reserve Seat
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

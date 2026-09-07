import { Eyebrow } from "../ui";

const COMPACT_PHASES = [
  { label: "Morning", items: "Understand Your Brain · Stress + Focus" },
  { label: "Midday", items: "Overthinking + Emotional Regulation" },
  { label: "Afternoon", items: "Decision-Making + MOVERS™" },
  { label: "Closing", items: "21-Day Brain Training Plan + Guided Brain Reset" },
];

const FULL_SCHEDULE = [
  { time: "9:30 – 10:00", session: "Brain Performance Check-in" },
  { time: "10:00 – 10:45", session: "How Your Brain Runs Your Day" },
  { time: "10:45 – 11:30", session: "The Stress Switch" },
  { time: "11:30 – 12:15", session: "Focus Lab" },
  { time: "12:15 – 1:00", session: "Overthinking → Clarity" },
  { time: "1:00 – 2:00", session: "Lunch" },
  { time: "2:00 – 2:45", session: "Emotional Control" },
  { time: "2:45 – 3:30", session: "The Decision Brain" },
  { time: "3:30 – 4:15", session: "MOVERS™ Protocol" },
  { time: "4:15 – 5:00", session: "Brain → Real Life" },
  { time: "5:00 – 5:45", session: "Your 21-Day Brain Training Plan" },
  { time: "5:45 – 6:15", session: "Brain Reset Experience" },
  { time: "6:15 – 6:30", session: "Final Check-in & Commitment" },
];

// V2 — the detailed 13-row timetable was the single biggest length/
// conversion problem in V1 (a full-width table dominating a whole
// section). It's now a compact 4-phase experience timeline by default,
// with the full time-by-time detail behind a native <details> disclosure
// ("VIEW FULL SCHEDULE +") — present for anyone who wants it, never
// forced on everyone by default.
//
// V3 — added a dedicated price block (₹3,500 / person, real inclusions,
// no fake discounting). A "Founding Mumbai Edition ₹2,999" launch offer
// is explicitly described in the brief as OPTIONAL and must stay off
// unless a real launch offer is confirmed — that confirmation hasn't
// happened, so LAUNCH_OFFER_ACTIVE stays false. Flip it (and fill in the
// seat count) only once the business confirms a real, live offer.
const LAUNCH_OFFER_ACTIVE = false;

export default function PrefrontalPowerSchedule(): React.JSX.Element {
  return (
    <section id="schedule" className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-10 max-w-xl">
          <Eyebrow color="text-gold">Event Details</Eyebrow>
        </div>

        <div className="mx-auto max-w-3xl rounded-sm border border-line-strong bg-panel2 p-7 text-center sm:p-9">
          <p className="text-[20px] font-extrabold uppercase leading-tight text-ink sm:text-[24px]">
            27 September 2026 · Mumbai
          </p>
          <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.05em] text-ink-dim">10:00 AM – 6:30 PM</p>
          <p className="mt-1 font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-gold">
            Limited to 40 Participants
          </p>

          <div className="mx-auto mt-8 max-w-md border-t border-line pt-7">
            {LAUNCH_OFFER_ACTIVE ? (
              <>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-gold">
                  Founding Mumbai Edition
                </p>
                <p className="mt-1 text-[32px] font-extrabold text-ink">₹2,999</p>
                <p className="text-[12px] text-ink-faint">First 10 seats · Regular price ₹3,500</p>
              </>
            ) : (
              <>
                <p className="text-[32px] font-extrabold text-ink">
                  ₹3,500 <span className="text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-faint">/ person</span>
                </p>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.05em] text-ink-faint">
                  One-Day Experience · All Workshop Materials Included
                </p>
              </>
            )}
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-ink-dim">
              Includes: Workbook + guided audio + 21-day tracker + digital resources + certificate.
            </p>
          </div>

          <div className="mx-auto mt-9 max-w-2xl border-t border-line pt-8 text-left">
            <p className="mb-5 text-center font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-ink">
              The Day at a Glance
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {COMPACT_PHASES.map((phase) => (
                <div key={phase.label}>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-gold">{phase.label}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-dim">{phase.items}</p>
                </div>
              ))}
            </div>
          </div>

          <details className="group mx-auto mt-9 max-w-2xl border-t border-line pt-6 text-left">
            <summary className="mx-auto flex w-fit cursor-pointer list-none items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
              View Full Schedule
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line-strong text-[12px] text-ink-faint transition-transform duration-200 group-open:rotate-45">
                +
              </span>
            </summary>
            <ol className="mt-6 space-y-2.5">
              {FULL_SCHEDULE.map((item) => (
                <li key={item.time} className="flex items-baseline justify-between gap-4 text-[13.5px]">
                  <span className="font-mono text-[11.5px] text-ink-faint">{item.time}</span>
                  <span className="flex-1 text-right font-semibold text-ink">{item.session}</span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      </div>
    </section>
  );
}

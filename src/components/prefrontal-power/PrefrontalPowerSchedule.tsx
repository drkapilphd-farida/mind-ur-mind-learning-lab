import { Eyebrow } from "../ui";

const SCHEDULE = [
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

// Table on tablet/desktop, a stacked vertical timeline on mobile — a real
// scrollable table at 375–390px is unreadable, so this isn't the same
// markup at two sizes, it's two different presentations of the same
// data (sm:hidden / hidden sm:block), per explicit instruction.
export default function PrefrontalPowerSchedule(): React.JSX.Element {
  return (
    <section id="schedule" className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl">
          <Eyebrow color="text-gold">Workshop Schedule</Eyebrow>
          <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight sm:text-[32px]">
            27 September 2026 · Full-Day Schedule
          </h2>
        </div>

        {/* Mobile — vertical timeline */}
        <ol className="relative max-w-xl space-y-6 border-l border-line-strong pl-6 sm:hidden">
          {SCHEDULE.map((item) => (
            <li key={item.time} className="relative">
              <span
                className="absolute -left-[27px] top-1 h-2.5 w-2.5 rounded-full border-2 border-gold bg-panel"
                aria-hidden="true"
              />
              <p className="font-mono text-[11.5px] uppercase tracking-[0.05em] text-gold">{item.time}</p>
              <p className="mt-0.5 text-[14.5px] font-semibold text-ink">{item.session}</p>
            </li>
          ))}
        </ol>

        {/* Tablet/desktop — table */}
        <div className="hidden overflow-hidden rounded-sm border border-line-strong sm:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong bg-panel2">
                <th className="px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Time
                </th>
                <th className="px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
                  Session
                </th>
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((item, index) => (
                <tr key={item.time} className={index % 2 === 1 ? "bg-panel" : undefined}>
                  <td className="whitespace-nowrap px-6 py-3.5 font-mono text-[13px] text-ink-faint">{item.time}</td>
                  <td className="px-6 py-3.5 text-[14.5px] font-semibold text-ink">{item.session}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

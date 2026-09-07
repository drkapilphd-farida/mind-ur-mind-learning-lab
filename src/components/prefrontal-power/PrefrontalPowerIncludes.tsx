import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "../ui";

// The "7-Day WhatsApp Accountability Support" line from the source copy
// was marked "(include only if confirmed)" — that confirmation was never
// given, so it's deliberately left out rather than listed as included in
// a paid ₹3,500 seat. Add it here (and nowhere else) once confirmed.
const INCLUDES = [
  "Full-day experiential workshop",
  "Printed Brain Training Workbook",
  "MOVERS™ 10-Minute Protocol",
  "21-Day Brain Training Tracker",
  "Guided Practice Audio",
  "Personal Brain Training Plan",
  "Digital Resources",
  "Certificate of Participation",
];

export default function PrefrontalPowerIncludes(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mx-auto mb-12 flex max-w-xl justify-center text-center">
          <Eyebrow color="text-gold">What You Take Home</Eyebrow>
        </div>

        <div className="mx-auto max-w-2xl rounded-sm border border-line-strong bg-panel2 p-7 sm:p-9">
          <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ink">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-7 border-t border-line pt-5 text-center font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-faint">
            Everything included in your ₹3,500 seat.
          </p>
        </div>
      </div>
    </section>
  );
}

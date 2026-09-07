import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "../ui";

const PLAN_ITEMS = [
  "10-minute daily routine",
  "Focus protocol",
  "Trigger/response protocol",
  "Reflection practice",
  "21-Day Tracker",
];

// "21 days of structured practice" — not "21 days creates a habit" — per
// explicit instruction not to state that as scientific fact.
export default function PrefrontalPowerPlan(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">Your 21-Day Brain Training Plan</Eyebrow>
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          Don&apos;t Leave With Inspiration. Leave With a System.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          One day builds the understanding. Twenty-one days of structured practice is where it becomes real.
          Before you leave, you&apos;ll build your own:
        </p>

        <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
          {PLAN_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-[14.5px] font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 flex-none text-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

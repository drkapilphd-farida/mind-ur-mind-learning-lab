import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "../ui";

const PLAN_ITEMS = [
  "Morning practice",
  "Focus protocol",
  "Trigger/response protocol",
  "Evening reflection",
  "21-Day Tracker",
];

export default function PrefrontalPowerPlan(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">The 21-Day Plan</Eyebrow>
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          Don&apos;t Leave With Inspiration. Leave With a System.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          One day builds the understanding. Twenty-one days build the habit. Before you leave, you&apos;ll
          create your own:
        </p>

        <ul className="mx-auto mt-8 max-w-sm space-y-3 text-left">
          {PLAN_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-[14.5px] font-semibold text-ink">
              <CheckCircle2 className="h-4 w-4 flex-none text-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-9 text-[15px] italic text-ink-dim">
          One day starts the process. Twenty-one days help you practise it.
        </p>
      </div>
    </section>
  );
}

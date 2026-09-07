import { Eyebrow } from "../ui";

const PATTERN_LINES = [
  "You start ten things and finish two.",
  "You replay conversations that ended hours ago.",
  "You know what to do — and still don't do it.",
  "Small triggers get big reactions.",
  "By evening, you're tired in a way rest doesn't fix.",
];

export default function PrefrontalPowerProblem(): React.JSX.Element {
  return (
    <section id="problem" className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-ink-faint">The Problem</Eyebrow>
        </div>
        <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight sm:text-[32px]">
          Is Your Mind Working Against You?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          You may be doing well on the outside. Career on track. Responsibilities handled. But internally,
          your mind can still feel loud, scattered, and always one step ahead of you.
        </p>

        <ul className="mx-auto mt-9 max-w-md space-y-3.5 text-left">
          {PATTERN_LINES.map((line) => (
            <li key={line} className="flex items-start gap-3 text-[14.5px] leading-relaxed text-ink">
              <span className="mt-[3px] flex-none text-gold" aria-hidden="true">
                —
              </span>
              {line}
            </li>
          ))}
        </ul>

        <p className="mt-9 text-[15.5px] font-semibold text-ink">
          If even a few of these feel familiar, this workshop was built for you.
        </p>
      </div>
    </section>
  );
}

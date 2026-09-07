import { Eyebrow, CtaButton } from "../ui";
import { PREFRONTAL_POWER_REGISTRATION_URL } from "@/config/whatsappSupportLink";

const MOVERS_LETTERS = [
  { letter: "M", word: "Meditation & Awareness" },
  { letter: "O", word: "Oxygen & Breath Regulation" },
  { letter: "V", word: "Visualization" },
  { letter: "E", word: "Exercise & Movement" },
  { letter: "R", word: "Reading & Positive Input" },
  { letter: "S", word: "Scribing & Reflection" },
];

export default function PrefrontalPowerMovers(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">Your Daily Practice</Eyebrow>
        </div>
        <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight sm:text-[32px]">
          The MOVERS&trade; Protocol
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-ink-dim">
          Build your own 10-minute daily brain-training routine — something you&apos;ll actually keep doing.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {MOVERS_LETTERS.map((item) => (
            <div key={item.letter} className="rounded-sm border border-line-strong bg-panel2 px-3 py-6">
              <div className="font-display text-[34px] font-bold text-gold">{item.letter}</div>
              <p className="mt-2 text-[12.5px] leading-snug text-ink-dim">{item.word}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-lg text-[14.5px] leading-relaxed text-ink-dim">
          MOVERS&trade; isn&apos;t six new habits. It&apos;s six small practices, sequenced into one 10-minute
          daily routine — simple enough to sustain long after the workshop ends.
        </p>

        <div className="mt-8 flex justify-center">
          <CtaButton href={PREFRONTAL_POWER_REGISTRATION_URL} variant="ghost" accent="gold" openInNewTab>
            Build Your 10-Minute Routine
          </CtaButton>
        </div>
      </div>
    </section>
  );
}

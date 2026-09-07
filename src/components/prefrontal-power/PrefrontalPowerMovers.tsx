import { Eyebrow } from "../ui";

const MOVERS_LETTERS = [
  { letter: "M", word: "Meditation & Awareness" },
  { letter: "O", word: "Oxygen & Breath Regulation" },
  { letter: "V", word: "Visualization" },
  { letter: "E", word: "Exercise & Movement" },
  { letter: "R", word: "Reading & Positive Input" },
  { letter: "S", word: "Scribing & Reflection" },
];

// Signature Moment™ — the one visual centerpiece of the page (per
// explicit "one of the signature visual moments" instruction): a single
// connected sequence rather than six isolated boxes, larger letters, and
// a continuous gold thread linking all six on desktop.
export default function PrefrontalPowerMovers(): React.JSX.Element {
  return (
    <section id="movers" className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">The MOVERS&trade; Protocol</Eyebrow>
        </div>
        <h2 className="mx-auto mt-4 max-w-xl text-[26px] font-extrabold uppercase leading-tight sm:text-[34px]">
          Build Your Own 10-Minute Daily Brain-Training Routine
        </h2>

        <div className="relative mx-auto mt-14 max-w-4xl">
          <div className="pointer-events-none absolute left-0 right-0 top-[38px] hidden h-px bg-gold/30 sm:block" aria-hidden="true" />
          <div className="relative grid grid-cols-3 gap-x-4 gap-y-8 sm:grid-cols-6 sm:gap-x-2">
            {MOVERS_LETTERS.map((item) => (
              <div key={item.letter} className="flex flex-col items-center">
                <div className="flex h-[76px] w-[76px] flex-none items-center justify-center rounded-full border border-gold/50 bg-panel2 font-display text-[38px] font-bold text-gold shadow-[0_10px_24px_rgba(184,134,46,0.14)]">
                  {item.letter}
                </div>
                <p className="mt-3 max-w-[110px] text-[12px] leading-snug text-ink-dim">{item.word}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mx-auto mt-14 max-w-md text-[16px] font-semibold leading-relaxed text-ink">
          Learn it in one day.
          <br />
          Practise it for the next 21 days.
        </p>
      </div>
    </section>
  );
}

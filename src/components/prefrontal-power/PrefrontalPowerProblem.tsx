// Editorial, not cards™ — six patterns as an inline, comma-separated
// run of words rather than six repeated boxes, per explicit instruction
// ("do not create six giant cards... use typography / editorial layout").
const PATTERNS = ["Stress", "Distraction", "Overthinking", "Emotional reactions", "Procrastination", "Decision fatigue"];

export default function PrefrontalPowerProblem(): React.JSX.Element {
  return (
    <section id="problem" className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-[24px] font-extrabold uppercase leading-tight sm:text-[32px]">
          You Know What to Do.
          <br />
          <span className="text-gold">So Why Is It Still So Difficult to Do It Consistently?</span>
        </h2>

        <p className="mx-auto mt-8 max-w-xl text-[15.5px] font-medium leading-relaxed text-ink">
          {PATTERNS.map((pattern, index) => (
            <span key={pattern}>
              {index > 0 && <span className="text-ink-faint"> · </span>}
              {pattern}
            </span>
          ))}
          {" "}— these are not character flaws. They&apos;re mental patterns, and patterns can be trained.
        </p>

        <p className="mx-auto mt-8 max-w-lg text-[16px] font-semibold leading-relaxed text-ink">
          If you know you&apos;re capable of more — but your mental patterns keep getting in the way — this
          workshop is for you.
        </p>
      </div>
    </section>
  );
}

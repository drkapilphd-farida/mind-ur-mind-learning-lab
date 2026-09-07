const OUTCOMES = ["Focus", "Clarity", "Self-Control", "Emotional Regulation", "Better Decisions", "Consistent Action"];

// Sophisticated layout, not a generic icon grid™ — large display
// typography in a flowing wrap, separated by a thin rule rather than six
// bordered cards with icons (that treatment is reserved for the module
// grid below, so this section reads visually distinct from it).
export default function PrefrontalPowerPromise(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-[24px] font-extrabold uppercase leading-tight sm:text-[32px]">
          Train the Mental Skills Behind Better Performance.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[14.5px] leading-relaxed text-ink-dim">
          Grounded in research-informed principles of attention, self-control and emotional regulation — not
          guesswork.
        </p>

        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-2 gap-y-4">
          {OUTCOMES.map((outcome, index) => (
            <span key={outcome} className="flex items-center gap-x-2">
              {index > 0 && (
                <span className="mx-1 h-px w-6 flex-none bg-gold/50 sm:mx-2" aria-hidden="true" />
              )}
              <span className="font-display text-[19px] italic text-ink sm:text-[23px]">{outcome}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

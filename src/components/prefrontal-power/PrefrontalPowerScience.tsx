import { Eyebrow } from "../ui";

const FRAMEWORK_STEPS = ["Understand", "Experience", "Practise", "Apply"];

export default function PrefrontalPowerScience(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">The Science, Made Simple</Eyebrow>
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          How Your Brain Influences the Way You Think, Respond &amp; Decide
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          Every day, your brain runs thousands of small decisions — most of them automatic. PREfrontal POWER
          is designed around research-informed principles of attention, working memory, self-control,
          emotional regulation and cognitive flexibility — the mental functions behind focus, patience, and
          good decisions.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          You won&apos;t sit through a lecture. You&apos;ll experience how these functions show up in your own
          behaviour, in real time.
        </p>

        <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-[13px] font-semibold uppercase tracking-[0.05em] text-ink">
          {FRAMEWORK_STEPS.map((step, index) => (
            <span key={step} className="flex items-center gap-3">
              {index > 0 && (
                <span className="text-gold" aria-hidden="true">
                  →
                </span>
              )}
              {step}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

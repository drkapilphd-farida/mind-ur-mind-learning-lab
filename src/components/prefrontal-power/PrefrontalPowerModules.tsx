import { Brain, Activity, Crosshair, RefreshCw, GitBranch, Sparkles, type LucideIcon } from "lucide-react";

type Module = {
  number: string;
  icon: LucideIcon;
  title: string;
  tags: string;
};

// V2 — condensed to a keyword tag line per module instead of a full
// paragraph, and Emotional Control is no longer a standalone tile
// (folded into the 21-day plan / event-timeline framing elsewhere) —
// six compact tiles, the sixth previewing MOVERS™ rather than describing
// it in full (that gets its own dedicated section below).
const MODULES: readonly Module[] = [
  { number: "01", icon: Brain, title: "Understand Your Brain", tags: "Attention · Executive Functions · Automatic Behaviour" },
  { number: "02", icon: Activity, title: "The Stress Switch", tags: "Stress · Emotional Reactivity · Regulation" },
  { number: "03", icon: Crosshair, title: "The Focus Lab", tags: "Attention · Distraction · Focus" },
  { number: "04", icon: RefreshCw, title: "Overthinking → Clarity", tags: "Awareness · Pause · Reframe · Response" },
  { number: "05", icon: GitBranch, title: "The Decision Brain", tags: "Cognitive Load · Deliberate Decisions · Better Choices" },
  { number: "06", icon: Sparkles, title: "MOVERS™", tags: "Build Your 10-Minute Daily Brain Training Routine" },
];

export default function PrefrontalPowerModules(): React.JSX.Element {
  return (
    <section id="experience" className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-4 max-w-xl">
          <h2 className="text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">This Is Not a Lecture.</h2>
          <div className="mt-4 flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-gold">
            Understand <span aria-hidden="true">→</span> Experience <span aria-hidden="true">→</span> Practise{" "}
            <span aria-hidden="true">→</span> Apply
          </div>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-dim">
            You won&apos;t spend seven hours listening to slides. You&apos;ll explore practical concepts,
            experience attention and regulation exercises, and build your own daily practice.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.number} className="flex items-start gap-4 rounded-sm border border-line-strong bg-panel2 p-5">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-mono text-[11px] text-ink-faint">{mod.number}</p>
                  <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-ink">{mod.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-ink-faint">{mod.tags}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

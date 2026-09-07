import { Brain, Activity, Crosshair, RefreshCw, HeartPulse, GitBranch, type LucideIcon } from "lucide-react";
import { Eyebrow } from "../ui";

type Module = {
  number: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  tagLabel: string;
  tagValue: string;
};

// One consistent lucide-react line-icon per module — restrained
// iconography instead of forcing stock photography onto six abstract
// concepts (attention, stress, decisions), per explicit direction.
const MODULES: readonly Module[] = [
  {
    number: "01",
    icon: Brain,
    title: "How Your Brain Runs Your Day",
    desc: "What actually drives your choices: executive functions, attention, and the gap between intention and action.",
    tagLabel: "Experience",
    tagValue: "Live Attention Experiment",
  },
  {
    number: "02",
    icon: Activity,
    title: "The Stress Switch",
    desc: "Why the mind narrows under pressure, and why clear thinking gets harder exactly when you need it most.",
    tagLabel: "Practice",
    tagValue: "Pause → Breathe → Observe → Choose",
  },
  {
    number: "03",
    icon: Crosshair,
    title: "The Focus Lab",
    desc: "Distraction isn't a willpower problem — it's a design problem. Learn to build focus on purpose.",
    tagLabel: "Experience",
    tagValue: "Focus & Distraction Experiment",
  },
  {
    number: "04",
    icon: RefreshCw,
    title: "Overthinking → Clarity",
    desc: "Break the loop: Thought → Emotion → Reaction → Repetition becomes Awareness → Pause → Reframe → Response.",
    tagLabel: "Practice",
    tagValue: "Thought Loop Breaker",
  },
  {
    number: "05",
    icon: HeartPulse,
    title: "Emotional Control",
    desc: "Feel it. Understand it. Choose your response — at home, at work, and everywhere in between.",
    tagLabel: "Focus Areas",
    tagValue: "Trigger awareness, breathing, the response gap",
  },
  {
    number: "06",
    icon: GitBranch,
    title: "The Decision Brain",
    desc: "Move from automatic decisions to deliberate ones, even under pressure.",
    tagLabel: "Framework",
    tagValue: "STOP → CHECK → THINK → CHOOSE",
  },
];

export default function PrefrontalPowerModules(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">The Workshop Experience</Eyebrow>
          <h2 className="mt-4 text-[26px] font-extrabold uppercase leading-tight sm:text-[32px]">
            The PREfrontal POWER Experience
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-dim">
            A full day of science-informed learning, live experiments, and guided practice — not passive
            listening.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.number} className="flex flex-col rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[13px] font-bold text-gold">{mod.number}</span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                    <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  </div>
                </div>
                <h3 className="mt-4 text-[16.5px] font-bold leading-snug text-ink">{mod.title}</h3>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-ink-dim">{mod.desc}</p>
                <p className="mt-4 font-mono text-[10.5px] uppercase leading-relaxed tracking-[0.04em] text-ink-faint">
                  <span className="text-gold">{mod.tagLabel}:</span> {mod.tagValue}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

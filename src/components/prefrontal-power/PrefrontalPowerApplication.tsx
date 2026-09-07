const AREAS = [
  { label: "Career", desc: "Focus, priorities and execution." },
  { label: "Business", desc: "More deliberate decisions under pressure." },
  { label: "Relationships", desc: "More awareness before reacting." },
  { label: "Personal Life", desc: "Consistency, clarity and better daily habits." },
  {
    label: "Health & Daily Life",
    desc: "Practical approaches to stress regulation, recovery and mental performance.",
  },
];

export default function PrefrontalPowerApplication(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <h2 className="mx-auto max-w-2xl text-center text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          Brain Training Should Work Beyond the Workshop.
        </h2>

        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-9">
          {AREAS.map((area) => (
            <div key={area.label} className="w-[220px] text-center">
              <p className="font-mono text-[12px] font-bold uppercase tracking-[0.05em] text-gold">{area.label}</p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink-dim">{area.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

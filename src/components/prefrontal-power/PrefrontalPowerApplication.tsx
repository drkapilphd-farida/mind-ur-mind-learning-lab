const AREAS = [
  { label: "Career", desc: "Focus, priorities, and follow-through." },
  { label: "Business", desc: "More deliberate decisions, even under pressure." },
  { label: "Relationships", desc: "A pause before the reaction." },
  { label: "Personal Growth", desc: "Turning awareness into consistent action." },
  { label: "Health & Daily Life", desc: "Practical routines for stress and everyday mental performance." },
];

export default function PrefrontalPowerApplication(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
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

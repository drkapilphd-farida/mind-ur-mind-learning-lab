import { X } from "lucide-react";

const NOT_LIST = [
  "a traditional neuroscience lecture",
  "a meditation retreat",
  "therapy or medical treatment",
  "a promise of instant transformation",
];

export default function PrefrontalPowerNotThis(): React.JSX.Element {
  return (
    <section className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          This Is Not Another Motivational Seminar.
        </h2>

        <ul className="mx-auto mt-9 max-w-sm space-y-3 text-left">
          {NOT_LIST.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink-dim">
              <X className="mt-0.5 h-4 w-4 flex-none text-rose" aria-hidden="true" />
              <span>
                <span className="font-semibold text-ink">NOT</span> {item}
              </span>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-9 max-w-lg text-[15px] leading-relaxed text-ink-dim">
          It&apos;s a practical, experiential workshop designed to help you understand your mental patterns,
          practise useful skills, and leave with a system you&apos;ll actually use.
        </p>
      </div>
    </section>
  );
}

import { CheckCircle2 } from "lucide-react";
import { Eyebrow } from "../ui";

const TRUST_POINTS = [
  "Over two decades of experience in mind training and life coaching",
  "A program built and refined by Dr. Kapil Sharma since 2015",
  "Designed for working professionals, entrepreneurs, students and parents alike",
];

// Verified-Facts-Only™ — no testimonial photos or quote cards until real
// PREfrontal POWER attendee feedback exists post-workshop, per explicit
// instruction. The video below is real, approved footage of Dr. Kapil
// with real past workshop participants (already embedded, full-size, on
// the homepage's own overview-video section) — placed here small and
// secondary rather than duplicated at full size, per explicit direction.
export default function PrefrontalPowerTrust(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">Trust</Eyebrow>
        </div>
        <h2 className="mt-4 text-[24px] font-extrabold uppercase leading-tight sm:text-[30px]">
          Why People Trust Mind Ur Mind
        </h2>

        <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-gold" aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-10 max-w-sm overflow-hidden rounded-sm border border-line-strong shadow-[0_12px_30px_rgba(34,31,29,0.1)]">
          <div className="aspect-video w-full">
            <iframe
              src="https://www.youtube-nocookie.com/embed/yqBKHd-9apk"
              title="Real workshop moments — Mind Ur Mind"
              loading="lazy"
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

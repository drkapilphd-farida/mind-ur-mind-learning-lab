import Image from "next/image";
import { Eyebrow } from "../ui";

// Approved asset: dr-kapil-learning.png.png (black shirt, explaining with
// both hands) — chosen specifically for this section per explicit
// direction: the teaching/explaining posture fits "Meet Your Trainer"
// better than the founder/mentor photos, which already do different jobs
// on the About and Mentoring pages. Not reused there — one photo, one
// context.
export default function PrefrontalPowerTrainer(): React.JSX.Element {
  return (
    <section className="border-b border-line bg-panel px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">Meet Your Trainer</Eyebrow>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:items-start">
          <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-sm border border-gold/40">
            <Image
              src="/dr-kapil-learning.png.png"
              alt="Dr. Kapil Sharma, Mind Trainer & Life Coach"
              fill
              sizes="220px"
              className="object-cover object-top"
            />
          </div>

          <div>
            <h2 className="text-[22px] font-extrabold text-ink">Dr. Kapil Sharma</h2>
            <p className="mt-1 font-mono text-[11.5px] uppercase tracking-[0.05em] text-ink-faint">
              Mind Trainer &amp; Life Coach · 26 Years Experience
            </p>
            <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
              Over two decades of experience in mind training, meditation and human potential — turning what
              he&apos;s learned into a single, practical day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

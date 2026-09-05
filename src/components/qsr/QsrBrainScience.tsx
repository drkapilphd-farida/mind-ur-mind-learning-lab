"use client";

import Image from "next/image";
import { Brain, Eye, Sparkles, Crosshair } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const CARD_ICONS = [Brain, Sparkles, Eye, Crosshair] as const;

export default function QsrBrainScience(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.qsrLanding.brainScience;

  // Visual Rhythm™ — lg:py-16 trims desktop-only vertical padding (base
  // py-24 unchanged, so mobile/tablet render identically to before).
  return (
    <section id="the-science" className="border-b border-line bg-panel px-6 py-24 sm:px-8 lg:py-16">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {section.cards.map((card, index) => {
            const Icon = CARD_ICONS[index % CARD_ICONS.length] ?? Brain;
            return (
              <div key={card.title} className="rounded-sm border border-line bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold-soft">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16.5px] font-bold leading-snug text-ink">{card.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{card.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Mechanism Visual Storytelling™ (Phase 4, refined 4A) — a single
            illustrated capstone tying the four cards above into one
            system. Phase 4A deliberately caps this at max-w-2xl (was
            full-width): the image's four mini-panels repeat the same four
            concepts as the real cards above, so at full section width it
            read as a second copy of the section rather than a supporting
            recap — capping its width is what keeps it feeling like a
            visual accent instead. The real cards above remain the
            accessible, translatable, responsive source of truth; this is
            purely a visual reinforcement. No new heading added: the image
            already carries its own. `object-contain` inside a container
            matching the source's exact 1536x1024 (3:2) aspect ratio
            guarantees the full graphic is never cropped. */}
        <div className="relative mx-auto mt-8 aspect-[3/2] w-full max-w-2xl overflow-hidden rounded-sm border border-line-strong lg:mt-10">
          <Image
            src="/images/quantum-mind/04-science-behind-faster-learning.png"
            alt="The four cognitive abilities Quantum Speed Reading trains together: right-brain capabilities, visualization and intuition, peripheral vision, and deep concentration"
            fill
            sizes="(min-width: 672px) 672px, 100vw"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}

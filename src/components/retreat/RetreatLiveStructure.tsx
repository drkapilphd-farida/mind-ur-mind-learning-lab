"use client";

import { Video, Users, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";

const POINT_ICONS = [Video, Users, MessageCircle] as const;

export default function RetreatLiveStructure(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.retreatLanding.liveStructure;

  return (
    <section className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-teal">{section.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{section.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{section.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {section.points.map((point, index) => {
            const Icon = POINT_ICONS[index % POINT_ICONS.length] ?? Video;
            return (
              <div key={point.title} className="rounded-sm border border-line-strong bg-panel2 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-teal/40 bg-teal-soft">
                  <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-[16px] font-bold leading-snug text-ink">{point.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-dim">{point.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

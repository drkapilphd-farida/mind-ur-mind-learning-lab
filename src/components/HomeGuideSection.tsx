"use client";

import { useLanguage } from "@/context/LanguageContext";
import GuideProfileCard from "./GuideProfileCard";

// Meet Dr. Kapil Sharma™ — reuses the same real bio/stats/quote already
// shared verbatim across the Personal Class, Overthinking Course, and
// About pages (GuideProfileCard.tsx) rather than re-authoring the
// founder's story a fifth time. Only the eyebrow/title framing and the
// CTA (linking to the full /about page) are specific to this placement.
export default function HomeGuideSection(): React.JSX.Element {
  const { t } = useLanguage();
  const guide = t.aboutPage.guide;
  const section = t.homeGuide;

  return (
    <GuideProfileCard
      eyebrow={section.eyebrow}
      title={section.title}
      credential={guide.credential}
      bio={guide.bio}
      stats={guide.stats}
      quote={guide.quote}
      accent="gold"
      ctaLabel={section.cta}
      ctaHref="/about"
      imageSrc="/dr-kapil-founder.png.png"
    />
  );
}

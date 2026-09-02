"use client";

import { useLanguage } from "@/context/LanguageContext";
import GuideProfileCard from "../GuideProfileCard";

// Thin translated wrapper around the shared GuideProfileCard — same
// pattern the Overthinking Mastery Course page reuses (CourseGuide.tsx).
export default function MentoringGuide(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.guide;

  return <GuideProfileCard {...section} accent="rose" />;
}

"use client";

import { useLanguage } from "@/context/LanguageContext";
import GuideProfileCard from "../GuideProfileCard";

// Thin translated wrapper around the shared GuideProfileCard — same
// component MentoringGuide.tsx reuses, per the request's own instruction
// not to rebuild it.
export default function CourseGuide(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.courseLanding.guide;

  return <GuideProfileCard {...section} accent="rose" />;
}

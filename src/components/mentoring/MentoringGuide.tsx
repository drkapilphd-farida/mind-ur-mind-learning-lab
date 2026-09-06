"use client";

import { useLanguage } from "@/context/LanguageContext";
import GuideProfileCard from "../GuideProfileCard";

// Thin translated wrapper around the shared GuideProfileCard — same
// pattern the Overthinking Mastery Course page reuses (CourseGuide.tsx).
// imageSrc uses the approved dr-kapil-mentor.png.png asset (Mentoring /
// Programs purpose) instead of the shared default photo.
export default function MentoringGuide(): React.JSX.Element {
  const { t } = useLanguage();
  const section = t.mentoringLanding.guide;

  return <GuideProfileCard {...section} accent="rose" imageSrc="/dr-kapil-mentor.png.png" />;
}

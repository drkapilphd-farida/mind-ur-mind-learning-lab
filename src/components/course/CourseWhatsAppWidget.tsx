"use client";

import { useLanguage } from "@/context/LanguageContext";
import WhatsAppWidget from "../WhatsAppWidget";
import { WHATSAPP_COURSE_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Thin translated wrapper — same pattern as QsrWhatsAppWidget.tsx /
// RetreatWhatsAppWidget.tsx / ResidentialWhatsAppWidget.tsx /
// MentoringWhatsAppWidget.tsx. Pre-purchase questions only — the
// Classplus link (nav, sticky bar, both CTAs) is the real conversion
// path, not this widget.
export default function CourseWhatsAppWidget(): React.JSX.Element {
  const { t } = useLanguage();
  const courseWhatsapp = t.courseLanding.whatsapp;

  return (
    <WhatsAppWidget
      href={WHATSAPP_COURSE_INQUIRY_LINK}
      bubble={courseWhatsapp.bubble}
      buttonLabel={courseWhatsapp.button}
      ariaLabel={courseWhatsapp.ariaLabel}
      bottomClassName="bottom-24 sm:bottom-24"
      analyticsLocation="course_widget"
    />
  );
}

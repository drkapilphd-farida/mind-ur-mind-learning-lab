"use client";

import { useLanguage } from "@/context/LanguageContext";
import WhatsAppWidget from "../WhatsAppWidget";
import { WHATSAPP_MENTORING_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Thin translated wrapper — same pattern as QsrWhatsAppWidget.tsx /
// RetreatWhatsAppWidget.tsx / ResidentialWhatsAppWidget.tsx.
export default function MentoringWhatsAppWidget(): React.JSX.Element {
  const { t } = useLanguage();
  const mentoringWhatsapp = t.mentoringLanding.whatsapp;

  return (
    <WhatsAppWidget
      href={WHATSAPP_MENTORING_INQUIRY_LINK}
      bubble={mentoringWhatsapp.bubble}
      buttonLabel={mentoringWhatsapp.button}
      ariaLabel={mentoringWhatsapp.ariaLabel}
      bottomClassName="bottom-24 sm:bottom-24"
      analyticsLocation="mentoring_widget"
    />
  );
}

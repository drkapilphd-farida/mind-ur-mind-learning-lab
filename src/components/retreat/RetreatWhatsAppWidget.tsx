"use client";

import { useLanguage } from "@/context/LanguageContext";
import WhatsAppWidget from "../WhatsAppWidget";
import { WHATSAPP_RETREAT_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Thin translated wrapper — same pattern as QsrWhatsAppWidget.tsx. Page
// stays a Server Component; the bubble/button copy needs the client-side
// language toggle's current value, so that lookup happens here.
export default function RetreatWhatsAppWidget(): React.JSX.Element {
  const { t } = useLanguage();
  const retreatWhatsapp = t.retreatLanding.whatsapp;

  return (
    <WhatsAppWidget
      href={WHATSAPP_RETREAT_INQUIRY_LINK}
      bubble={retreatWhatsapp.bubble}
      buttonLabel={retreatWhatsapp.button}
      ariaLabel={retreatWhatsapp.ariaLabel}
      bottomClassName="bottom-24 sm:bottom-24"
      analyticsLocation="retreat_widget"
    />
  );
}

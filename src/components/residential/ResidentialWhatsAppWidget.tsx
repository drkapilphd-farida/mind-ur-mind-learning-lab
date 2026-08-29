"use client";

import { useLanguage } from "@/context/LanguageContext";
import WhatsAppWidget from "../WhatsAppWidget";
import { WHATSAPP_RESIDENTIAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Thin translated wrapper — same pattern as QsrWhatsAppWidget.tsx /
// RetreatWhatsAppWidget.tsx.
export default function ResidentialWhatsAppWidget(): React.JSX.Element {
  const { t } = useLanguage();
  const residentialWhatsapp = t.residentialLanding.whatsapp;

  return (
    <WhatsAppWidget
      href={WHATSAPP_RESIDENTIAL_INQUIRY_LINK}
      bubble={residentialWhatsapp.bubble}
      buttonLabel={residentialWhatsapp.button}
      ariaLabel={residentialWhatsapp.ariaLabel}
      bottomClassName="bottom-24 sm:bottom-24"
      analyticsLocation="residential_widget"
    />
  );
}

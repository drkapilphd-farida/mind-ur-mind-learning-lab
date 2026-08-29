"use client";

import { useLanguage } from "@/context/LanguageContext";
import WhatsAppWidget from "../WhatsAppWidget";
import { WHATSAPP_MASTERCLASS_INQUIRY_LINK } from "@/config/whatsappSupportLink";

// Thin translated wrapper — page.tsx stays a Server Component, but the
// bubble/button copy needs the client-side language toggle's current
// value, so that lookup has to happen in a client component.
export default function QsrWhatsAppWidget(): React.JSX.Element {
  const { t } = useLanguage();
  const qsrWhatsapp = t.qsrLanding.whatsapp;

  return (
    <WhatsAppWidget
      href={WHATSAPP_MASTERCLASS_INQUIRY_LINK}
      bubble={qsrWhatsapp.bubble}
      buttonLabel={qsrWhatsapp.button}
      ariaLabel={qsrWhatsapp.ariaLabel}
      bottomClassName="bottom-24 sm:bottom-24"
      analyticsLocation="qsr_widget"
    />
  );
}

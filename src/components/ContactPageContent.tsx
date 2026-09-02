"use client";

import { Mail, MessageCircle, MapPin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import SimplePageNav from "./SimplePageNav";
import Footer from "./Footer";
import WhatsAppWidget from "./WhatsAppWidget";
import { WHATSAPP_GENERAL_INQUIRY_LINK } from "@/config/whatsappSupportLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

// Contact Us™ — real contact methods only (WhatsApp + email), no
// backend contact form. Matches this site's established pattern: every
// other page routes inquiries through WhatsApp/email rather than a
// database-backed form (see QsrLiveIntroSession.tsx, RetreatFaq.tsx,
// etc.) — the content package that specified this page offered a form
// as an explicitly optional alternative, and adding one here would mean
// a new Server Action + validation + a way to actually deliver the
// message, none of which exists yet for a simple contact page.
export default function ContactPageContent(): React.JSX.Element {
  const { t } = useLanguage();
  const c = t.contactPage;

  return (
    <div className="warm-light min-h-screen font-sans antialiased">
      <SimplePageNav />
      <main className="border-b border-line px-6 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-[32px] font-extrabold leading-tight sm:text-[40px]">{c.headline}</h1>
          <p className="mx-auto mt-4 max-w-md text-[15.5px] leading-relaxed text-ink-dim">{c.sub}</p>

          <div className="mx-auto mt-12 max-w-sm space-y-4 text-left">
            <div className="flex items-start gap-3.5 rounded-sm border border-line-strong bg-panel2 px-5 py-4">
              <Mail className="mt-0.5 h-4.5 w-4.5 flex-none text-gold" aria-hidden="true" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{c.emailLabel}</div>
                <a href="mailto:info@mindurmind.org.in" className="mt-0.5 block text-[14.5px] font-semibold text-ink hover:text-gold">
                  info@mindurmind.org.in
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-sm border border-line-strong bg-panel2 px-5 py-4">
              <MessageCircle className="mt-0.5 h-4.5 w-4.5 flex-none text-gold" aria-hidden="true" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{c.whatsappLabel}</div>
                <a href={WHATSAPP_GENERAL_INQUIRY_LINK} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-[14.5px] font-semibold text-ink hover:text-gold">
                  +91 95401 23161
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3.5 rounded-sm border border-line-strong bg-panel2 px-5 py-4">
              <MapPin className="mt-0.5 h-4.5 w-4.5 flex-none text-gold" aria-hidden="true" />
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">{c.addressLabel}</div>
                <p className="mt-0.5 text-[14.5px] leading-relaxed text-ink">{c.address}</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[13px] text-ink-faint">{c.responseTime}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={WHATSAPP_GENERAL_INQUIRY_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGaEvent("whatsapp_click", { location: "contact_page" })}
              className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              {c.ctaPrimary}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
            <a href="mailto:info@mindurmind.org.in" className="text-[13.5px] text-ink-dim underline decoration-ink-faint/50 underline-offset-2 hover:text-ink">
              {c.ctaSecondary} info@mindurmind.org.in
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  );
}

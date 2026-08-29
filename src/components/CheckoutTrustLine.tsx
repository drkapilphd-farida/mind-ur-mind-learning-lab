"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

type CheckoutTrustLineProps = {
  className?: string;
};

// Shared across every primary Razorpay CTA on both the QSR and Retreat
// pages (see i18n.ts's top-level checkoutTrust for why this isn't
// duplicated per-page copy). Links to the real refund clause already
// live in the Terms of Service (§2, "Subscriptions and billing") rather
// than a fabricated dedicated refund-policy page that doesn't exist.
export default function CheckoutTrustLine({ className = "" }: CheckoutTrustLineProps): React.JSX.Element {
  const { t } = useLanguage();

  return (
    <p className={`text-[11.5px] leading-relaxed text-ink-faint ${className}`}>
      {t.checkoutTrust.line}{" "}
      <Link
        href="/terms#billing"
        className="underline decoration-ink-faint/50 underline-offset-2 transition-colors hover:text-ink-dim"
      >
        {t.checkoutTrust.refundLabel}
      </Link>
    </p>
  );
}

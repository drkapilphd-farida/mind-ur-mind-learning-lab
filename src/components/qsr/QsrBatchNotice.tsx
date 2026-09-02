"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import AccessModelStrip from "../AccessModelStrip";
import CheckoutTrustLine from "../CheckoutTrustLine";
import QsrGuaranteeBadge from "./QsrGuaranteeBadge";
import { RAZORPAY_MASTERCLASS_PAYMENT_LINK } from "@/config/masterclassPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

const BATCH_START_DAYS = [7, 25] as const;

// Honest Urgency™ — real, fixed batch cadence (confirmed directly: QSR
// batches start the 7th and 25th of every month, since the 30-day
// journey's 7 live classes run on a real cohort schedule even though
// daily app practice is self-paced). Computed client-side from today's
// date, same reasoning as RetreatSchedule.tsx's computeNextBatch: not
// hardcoded to a specific month so it never goes stale, and mounted-
// state-gated so the server and a visitor's browser never disagree on
// "today" and cause a hydration mismatch.
function computeNextBatchStart(today: Date): Date {
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  const thisMonthCandidates = BATCH_START_DAYS.filter((startDay) => startDay >= day);
  if (thisMonthCandidates.length > 0) {
    return new Date(year, month, Math.min(...thisMonthCandidates));
  }
  return new Date(year, month + 1, BATCH_START_DAYS[0]);
}

export default function QsrBatchNotice(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const qsr = t.qsrLanding;
  const [nextBatch, setNextBatch] = useState<Date | null>(null);

  useEffect(() => {
    setNextBatch(computeNextBatchStart(new Date()));
  }, []);

  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const nextBatchLabel =
    nextBatch !== null
      ? nextBatch.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" })
      : "";

  return (
    <section id="pricing" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="flex justify-center">
          <Eyebrow color="text-gold">{qsr.finalCta.eyebrow}</Eyebrow>
        </div>
        <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[36px]">{qsr.finalCta.title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-[15.5px] leading-relaxed text-ink-dim">{qsr.finalCta.desc}</p>

        <AccessModelStrip className="mx-auto mt-8 max-w-2xl" />

        <div className="mx-auto mt-8 max-w-md rounded-sm border border-line-strong bg-panel2 px-7 py-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-faint">
            {qsr.finalCta.batchNoticeLabel}
          </div>
          <div className="mt-1.5 text-[20px] font-bold text-gold">{nextBatchLabel}</div>
          <p className="mt-3 border-t border-line-strong pt-3 text-[13.5px] text-ink-dim">{qsr.finalCta.cadenceLine}</p>
          <p className="mt-1.5 text-[12.5px] text-ink-faint">{qsr.finalCta.structureLine}</p>
        </div>

        <div className="mt-9 flex justify-center">
          <div>
            <a
              href={RAZORPAY_MASTERCLASS_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGaEvent("razorpay_checkout_click", { location: "qsr_final_cta" })}
              className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-8 py-[17px] text-[15px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
            >
              {qsr.finalCta.cta}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>
            <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
              {qsr.finalCta.ctaMeta}
            </p>
            <CheckoutTrustLine className="mx-auto mt-1.5 max-w-[220px] text-center" />
          </div>
        </div>

        <QsrGuaranteeBadge className="mx-auto mt-8 max-w-md text-left" />
      </div>
    </section>
  );
}

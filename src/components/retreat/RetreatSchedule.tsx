"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Eyebrow } from "../ui";
import CheckoutTrustLine from "../CheckoutTrustLine";
import { RAZORPAY_RETREAT_PAYMENT_LINK } from "@/config/retreatPaymentLink";
import { trackGaEvent } from "@/lib/analytics/ga4";

const BATCH_START_DAY = 10;
const BATCH_END_DAY = 20;

type BatchRange = { start: Date; end: Date };

// A new batch starts the 10th of every month and runs through the 20th
// (real facts, not placeholders). If today is past the 10th, the current
// month's batch has already started or finished, so the next bookable
// one is the 10th of next month — the Date constructor normalizes month
// overflow (month 12 -> January of next year) automatically.
function computeNextBatch(today: Date): BatchRange {
  const year = today.getFullYear();
  const month = today.getMonth();
  const rollToNextMonth = today.getDate() > BATCH_START_DAY;
  const start = new Date(year, month + (rollToNextMonth ? 1 : 0), BATCH_START_DAY);
  const end = new Date(start.getFullYear(), start.getMonth(), BATCH_END_DAY);
  return { start, end };
}

function buildCalendarCells(monthDate: Date): (number | null)[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);
  return cells;
}

export default function RetreatSchedule(): React.JSX.Element {
  const { t, lang } = useLanguage();
  const retreat = t.retreatLanding;
  const [batch, setBatch] = useState<BatchRange | null>(null);

  // Computed on the client only — the server and a visitor's browser can
  // land on either side of the 10th at slightly different instants, and
  // rendering a date computed at request time would risk a hydration
  // mismatch against the date computed in the browser.
  useEffect(() => {
    setBatch(computeNextBatch(new Date()));
  }, []);

  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const monthLabel = batch?.start.toLocaleDateString(locale, { month: "long", year: "numeric" }) ?? "";
  const dateRangeLabel =
    batch !== null
      ? `${batch.start.toLocaleDateString(locale, { day: "numeric", month: "short" })} – ${batch.end.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })}`
      : "";
  const cells = batch !== null ? buildCalendarCells(batch.start) : [];
  const weekdayLabels =
    lang === "hi"
      ? ["र", "सो", "मं", "बु", "गु", "शु", "श"]
      : ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <section id="schedule" className="border-b border-line bg-panel px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-content">
        <div className="mb-14 max-w-xl">
          <Eyebrow color="text-gold">{retreat.schedule.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-[28px] font-extrabold leading-tight sm:text-[34px]">{retreat.schedule.title}</h2>
          <p className="mt-3 text-[15.5px] text-ink-dim">{retreat.schedule.desc}</p>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[0.95fr_1.05fr]">
          {/* calendar widget */}
          <div className="rounded-sm border border-line-strong bg-panel2 p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-faint">
                {retreat.schedule.nextBatchLabel}
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-gold">{monthLabel}</span>
            </div>

            <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
              {weekdayLabels.map((label, i) => (
                <div key={`${label}-${i}`} className="font-mono text-[10px] uppercase text-ink-faint">
                  {label}
                </div>
              ))}
              {cells.map((day, i) => {
                const inBatch = day !== null && day >= BATCH_START_DAY && day <= BATCH_END_DAY;
                return (
                  <div
                    key={i}
                    className={`flex h-8 items-center justify-center rounded-[3px] text-[12px] ${
                      day === null
                        ? ""
                        : inBatch
                          ? "bg-gold font-semibold text-[#1B1508]"
                          : "text-ink-dim"
                    }`}
                  >
                    {day ?? ""}
                  </div>
                );
              })}
            </div>

            <p className="mt-5 border-t border-line-strong pt-4 text-center text-[14px] font-semibold text-ink">
              {dateRangeLabel}
            </p>
          </div>

          {/* schedule facts + CTA */}
          <div className="flex flex-col rounded-sm border border-line bg-panel2 p-6 sm:p-8">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
                  {retreat.schedule.durationLabel}
                </div>
                <div className="mt-1.5 text-[14.5px] font-bold text-ink">{retreat.schedule.durationValue}</div>
              </div>
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
                  {retreat.schedule.cadenceLabel}
                </div>
                <div className="mt-1.5 text-[14.5px] font-bold text-ink">{retreat.schedule.cadenceValue}</div>
              </div>
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-ink-faint">
                  {retreat.schedule.timingLabel}
                </div>
                <div className="mt-1.5 text-[14.5px] font-bold text-ink">{retreat.schedule.timingValue}</div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 border-t border-line-strong pt-6 sm:grid-cols-3">
              {retreat.schedule.badges.map((badge) => (
                <div key={badge.title}>
                  <div className="text-[13px] font-semibold text-ink">{badge.title}</div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink-dim">{badge.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <a
                href={RAZORPAY_RETREAT_PAYMENT_LINK}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGaEvent("razorpay_checkout_click", { location: "retreat_schedule" })}
                className="group inline-flex items-center gap-2.5 rounded-sm bg-gold px-7 py-[15px] text-[14.5px] font-semibold tracking-tight text-[#1B1508] transition-transform duration-200 hover:-translate-y-0.5 hover:bg-[#cb9a44]"
              >
                {retreat.schedule.cta}
                <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </a>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-faint">
                {retreat.schedule.ctaMeta}
              </p>
              <CheckoutTrustLine className="mt-1.5 max-w-[260px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

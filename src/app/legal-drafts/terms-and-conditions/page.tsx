import type { Metadata } from 'next'
import { LegalPageShell, legalStyles } from '@/features/legal/components/LegalPageShell'

// DRAFT — NOT PUBLISHED. Same caveat as legal-drafts/privacy-policy/page.tsx
// — do not link this anywhere until the [NEEDS INPUT] sections are filled
// in and a lawyer has reviewed it, particularly the refund/liability
// sections given the mix of digital courses, retreats, and 1-on-1
// mentoring this site actually sells. noindex is deliberate.
//
// Separate from the live /terms, which is stale legacy content from
// before the product pivot (a school/franchise-partner LMS subscription
// model, not the current one-time-payment/retreat/mentoring business) —
// left untouched rather than overwritten with unreviewed draft text. See
// that file's own comment, and legal-drafts/privacy-policy/page.tsx, for
// the same reasoning.
export const metadata: Metadata = {
  title: 'Terms & Conditions (Draft — Not Published)',
  robots: { index: false, follow: false },
}

const LAST_UPDATED = '[DATE]'

export default function TermsAndConditionsDraftPage(): React.JSX.Element {
  return (
    <LegalPageShell
      title="Terms & Conditions"
      lastUpdated={LAST_UPDATED}
      brandName="Mind Ur Mind"
      footerLinks={[
        { label: 'Privacy Policy', href: '/legal-drafts/privacy-policy' },
        { label: 'Terms & Conditions', href: '/legal-drafts/terms-and-conditions' },
      ]}
    >
      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-200">
        <p className="font-semibold">Draft — pending legal review. Not published.</p>
        <p className="mt-1.5 leading-relaxed">
          Have this reviewed before publishing, particularly the refund/liability sections given the mix of digital
          courses, retreats, and 1-on-1 mentoring this site sells. Fill in every <strong>[NEEDS INPUT]</strong>{' '}
          section first.
        </p>
      </div>

      <section>
        <h2 className={legalStyles.h2}>1. About these terms</h2>
        <p className={legalStyles.p}>
          These terms govern your use of mindurmind.org.in and enrollment in any Mind Ur Mind program (Quantum Speed
          Reading, retreats, mentoring, courses). By enrolling or using the site, you agree to these terms.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>2. Nature of our services</h2>
        <p className={legalStyles.p}>
          Mind Ur Mind provides cognitive training, spiritual/personal-development retreats, and mentoring services.
          These are educational and developmental in nature and are not a substitute for licensed medical,
          psychiatric, or therapeutic treatment.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>3. Enrollment and payment</h2>
        <ul className={legalStyles.list}>
          <li>Payments are processed securely via Razorpay.</li>
          <li>Prices and what&rsquo;s included are as stated on each program&rsquo;s page at the time of enrollment.</li>
          <li>[NEEDS INPUT: any eligibility requirements, age restrictions?]</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>4. Refunds and cancellations</h2>
        <p className={legalStyles.p}>
          See our{' '}
          <a href="/terms#billing" className="text-foreground underline underline-offset-2">
            Refund &amp; Cancellation Policy
          </a>{' '}
          for full details.
        </p>
        <p className={legalStyles.p}>
          [NEEDS INPUT: the linked policy above is currently the legacy /terms page, written for a different
          subscription-billing product — confirm whether a new refund/cancellation clause matching the current
          one-time-payment programs and fixed-duration Classplus course should replace it before this page is
          published.]
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>5. Your responsibilities</h2>
        <ul className={legalStyles.list}>
          <li>Provide accurate information during enrollment.</li>
          <li>[NEEDS INPUT: any code-of-conduct expectations for retreats/live sessions?]</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>6. Limitation of liability</h2>
        <p className={legalStyles.p}>
          Mind Ur Mind and Dr. Kapil Dev Sharma are not liable for outcomes not guaranteed as part of a program — see
          individual program pages for what is and isn&rsquo;t promised.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>7. Intellectual property</h2>
        <p className={legalStyles.p}>
          All course content, videos, and materials are the property of Mind Ur Mind and may not be redistributed.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>8. Governing law</h2>
        <p className={legalStyles.p}>
          These terms are governed by the laws of India, with courts in Vadodara, Gujarat having jurisdiction.
          [NEEDS INPUT: confirm this jurisdiction choice with a lawyer.]
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>9. Contact</h2>
        <p className={legalStyles.p}>
          <a href="mailto:info@mindurmind.org.in" className="text-foreground underline underline-offset-2">
            info@mindurmind.org.in
          </a>
        </p>
      </section>
    </LegalPageShell>
  )
}

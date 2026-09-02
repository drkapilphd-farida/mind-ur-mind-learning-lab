import type { Metadata } from 'next'
import { LegalPageShell, legalStyles } from '@/features/legal/components/LegalPageShell'

// DRAFT — NOT PUBLISHED. Do not link this page from the footer, nav, or
// anywhere else on the site until: (1) the [NEEDS INPUT] sections below
// are filled in, and (2) a lawyer has confirmed this is correctly scoped
// under the DPDP Act 2023 / DPDP Rules 2025 (and the interim IT Act/SPDI
// Rules 2011) given the sensitive mental-health context collected via
// the mentoring application and the Razorpay payment data this site
// handles. Razorpay's own merchant-dashboard compliance templates may be
// a faster, safer base to merge with this draft. noindex below is
// deliberate — this route must never be crawled or discovered while
// unreviewed.
//
// This is a SEPARATE page from the live /privacy — that one is stale
// legacy content from before the product pivot (still describes a
// school/franchise-partner LMS platform, a different entity/email than
// the current Mind Ur Mind business) and was left untouched rather than
// overwritten with unreviewed draft text. Once this draft is approved,
// it should replace /privacy's content (and this route can redirect or
// retire) rather than the two coexisting long-term.
export const metadata: Metadata = {
  title: 'Privacy Policy (Draft — Not Published)',
  robots: { index: false, follow: false },
}

const LAST_UPDATED = '[DATE]'

export default function PrivacyPolicyDraftPage(): React.JSX.Element {
  return (
    <LegalPageShell
      title="Privacy Policy"
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
          This is a starting structure, not a final policy. Forms on this site collect sensitive information
          (mental-health context in mentoring applications, payment data via Razorpay), and India&rsquo;s data
          protection rules are actively being phased in (DPDP Act 2023 / DPDP Rules 2025 — most operational
          obligations become fully enforceable by May 2027, with the older IT Act/SPDI Rules 2011 still governing in
          the interim). Have a lawyer confirm this is correctly scoped, and fill in every{' '}
          <strong>[NEEDS INPUT]</strong> section, before this goes live.
        </p>
      </div>

      <p className="text-muted-foreground leading-relaxed">
        Mind Ur Mind (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) operates mindurmind.org.in and the
        Quantum Mind app. This policy explains what personal data we collect, why, and how it&rsquo;s handled.
      </p>

      <section>
        <h2 className={legalStyles.h2}>Information we collect</h2>
        <ul className={legalStyles.list}>
          <li>Contact details you provide (name, email, phone, city) via forms, WhatsApp, or enrollment.</li>
          <li>Payment information processed by Razorpay — we do not store card details ourselves.</li>
          <li>
            Information you choose to share in mentoring/application forms, including context about what you&rsquo;re
            seeking help with.
          </li>
          <li>Usage data from the Quantum Mind app (reading speed, comprehension scores, practice activity).</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>How we use it</h2>
        <ul className={legalStyles.list}>
          <li>To respond to inquiries and process enrollments.</li>
          <li>To personalize coaching/mentoring recommendations.</li>
          <li>To operate the Quantum Mind app&rsquo;s tracking features.</li>
          <li>To send program-related communication (with opt-out available).</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Third parties we share data with</h2>
        <ul className={legalStyles.list}>
          <li>Razorpay (payment processing).</li>
          <li>Classplus (for course delivery, where applicable).</li>
        </ul>
        <p className={legalStyles.p}>We do not sell personal data to third parties.</p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Sensitive information</h2>
        <p className={legalStyles.p}>
          Where you voluntarily share information about your mental health, stress, or personal circumstances (e.g.,
          in a mentoring application), this is used solely to prepare for your session and is not shared beyond the
          coaching team without your consent.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Data retention</h2>
        <p className={legalStyles.p}>[NEEDS INPUT: how long is data kept after a course/program ends?]</p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Your rights</h2>
        <p className={legalStyles.p}>
          You may request access to, correction of, or deletion of your personal data by emailing{' '}
          <a href="mailto:info@mindurmind.org.in" className="text-foreground underline underline-offset-2">
            info@mindurmind.org.in
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Security</h2>
        <p className={legalStyles.p}>
          [NEEDS INPUT: what security measures are actually in place — e.g., encrypted storage, access controls?]
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>Contact</h2>
        <p className={legalStyles.p}>
          Questions about this policy:{' '}
          <a href="mailto:info@mindurmind.org.in" className="text-foreground underline underline-offset-2">
            info@mindurmind.org.in
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}

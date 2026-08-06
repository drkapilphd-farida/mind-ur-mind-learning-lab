import type { Metadata } from 'next'
import { LegalPageShell, legalStyles } from '@/features/legal/components/LegalPageShell'

export const metadata: Metadata = { title: 'Terms of Service' }

const LAST_UPDATED = 'August 2026'

export default function TermsOfServicePage(): React.JSX.Element {
  return (
    <LegalPageShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p className="text-muted-foreground leading-relaxed">
        These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use of Quantum Mind Learning Lab™
        (&ldquo;Quantum Mind,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;), including the individual learner
        application, school and franchise partner portals, and any related services (together, the
        &ldquo;Service&rdquo;). By creating an account, or by using an account provisioned for you by a school or
        franchise partner, you agree to these Terms. If you are entering into these Terms on behalf of a school,
        franchise partner, or other organization, you represent that you have the authority to bind that
        organization, and &ldquo;you&rdquo; refers to that organization as well as you individually.
      </p>

      <section>
        <h2 className={legalStyles.h2}>1. Accounts and account types</h2>
        <p className={legalStyles.p}>The Service supports several kinds of accounts, each with different responsibilities:</p>
        <ul className={legalStyles.list}>
          <li><strong className="text-foreground">Individual and family accounts</strong> are self-registered and self-managed.</li>
          <li><strong className="text-foreground">School and franchise partner accounts</strong> are set up for an institution, with an administrator who manages staff, classes, and student rosters for that institution only.</li>
          <li><strong className="text-foreground">Student accounts</strong> under a school or franchise partner are created by that institution&rsquo;s administrator, not self-registered. The enrolling institution is responsible for the accuracy of the information it provides and for obtaining any consent required by applicable law before enrolling a student.</li>
        </ul>
        <p className={legalStyles.p}>
          You are responsible for maintaining the confidentiality of your login credentials and for all activity
          under your account. Notify us promptly of any unauthorized use.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>2. Subscriptions and billing</h2>
        <p className={legalStyles.p}>
          Paid plans &mdash; whether an individual/family subscription or an institutional plan for a school or
          franchise partner &mdash; are billed in advance on a recurring basis (monthly or yearly, as selected) and
          renew automatically until canceled. Payments are processed by our payment processor, Razorpay; by
          subscribing, you authorize recurring charges to your chosen payment method.
        </p>
        <ul className={legalStyles.list}>
          <li>You may cancel a subscription at any time; access continues through the end of the current billing period unless stated otherwise at checkout.</li>
          <li>Fees are non-refundable except where required by law or expressly stated at the time of purchase.</li>
          <li>If a payment fails or a subscription lapses, we may limit or suspend access to paid features until the account is brought current.</li>
          <li>For institutional accounts, the school or franchise partner administrator is responsible for its own subscription and for any seat/usage limits associated with its plan.</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>3. Acceptable use</h2>
        <p className={legalStyles.p}>You agree not to:</p>
        <ul className={legalStyles.list}>
          <li>Use the Service for any unlawful purpose, or in a way that infringes the rights of others.</li>
          <li>Attempt to access another user&rsquo;s, school&rsquo;s, or franchise partner&rsquo;s data, or circumvent any access control, rate limit, or security measure.</li>
          <li>Upload content you don&rsquo;t have the right to share, or content that is unlawful, harassing, or harmful to minors.</li>
          <li>Use automated means to scrape, resell, or extract data from the Service beyond your own account&rsquo;s normal use.</li>
          <li>Interfere with or disrupt the integrity or performance of the Service, including its AI features, billing systems, or infrastructure.</li>
          <li>Misrepresent your identity or, for institutional administrators, misrepresent your authority to act on behalf of the enrolling school or franchise partner.</li>
        </ul>
        <p className={legalStyles.p}>We may suspend or terminate access for violation of this section, with or without notice, depending on severity.</p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>4. Your content and AI-generated output</h2>
        <p className={legalStyles.p}>
          You retain ownership of the documents, notes, and other content you upload or submit (&ldquo;Your
          Content&rdquo;). You grant us a limited license to process Your Content solely to operate the Service for
          you &mdash; including sending it to our AI provider to generate summaries, questions, or other learning
          output. You are responsible for having the rights necessary to upload Your Content. AI-generated output
          may be inaccurate or incomplete; it is provided to support learning, not as a substitute for professional,
          academic, or expert judgment.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>5. Intellectual property</h2>
        <p className={legalStyles.p}>
          The Service, including its software, design, exercises, and content we author, is owned by Quantum Mind
          Learning Lab™ and protected by intellectual property laws. Subject to these Terms, we grant you a
          limited, non-exclusive, non-transferable license to use the Service for its intended learning purpose.
          You may not copy, modify, reverse-engineer, or create derivative works from the Service itself.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>6. Termination</h2>
        <p className={legalStyles.p}>
          You may stop using the Service and close your account at any time. We may suspend or terminate any
          account &mdash; including an institutional account and its associated student accounts &mdash; for
          violation of these Terms, non-payment, or extended inactivity, with notice where practical. Sections of
          these Terms that by their nature should survive termination (including Sections 5, 7, and 8) will
          continue to apply.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>7. Disclaimers and limitation of liability</h2>
        <p className={legalStyles.p}>
          The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without warranties of any
          kind, express or implied, including merchantability, fitness for a particular purpose, and
          non-infringement. We do not guarantee that the Service will be uninterrupted, error-free, or that any
          particular learning outcome will result from its use.
        </p>
        <p className={legalStyles.p}>
          To the fullest extent permitted by law, Quantum Mind Learning Lab™ will not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of data, revenue, or goodwill,
          arising from your use of the Service. Our total liability for any claim relating to the Service will not
          exceed the amount you paid us in the twelve months preceding the claim.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>8. Indemnification</h2>
        <p className={legalStyles.p}>
          You agree to indemnify and hold Quantum Mind Learning Lab™ harmless from any claims, damages, or expenses
          arising from your violation of these Terms or misuse of the Service, including, for institutional
          accounts, claims arising from your failure to obtain required consent before enrolling a student.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>9. Changes to these Terms</h2>
        <p className={legalStyles.p}>
          We may update these Terms from time to time. We&rsquo;ll update the &ldquo;Last updated&rdquo; date above
          when we do; continued use of the Service after a change constitutes acceptance of the updated Terms. For
          material changes, we&rsquo;ll provide more prominent notice where practical.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>10. Governing law &amp; contact</h2>
        <p className={legalStyles.p}>
          These Terms are governed by the laws of the jurisdiction in which Quantum Mind Learning Lab™ is
          established, without regard to conflict-of-law principles. Questions about these Terms can be sent to{' '}
          <a href="mailto:legal@mindurmindlab.com" className="text-foreground underline underline-offset-2">
            legal@mindurmindlab.com
          </a>
          .
        </p>
      </section>
    </LegalPageShell>
  )
}

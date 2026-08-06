import type { Metadata } from 'next'
import { LegalPageShell, legalStyles } from '@/features/legal/components/LegalPageShell'

export const metadata: Metadata = { title: 'Privacy Policy' }

const LAST_UPDATED = 'August 2026'

export default function PrivacyPolicyPage(): React.JSX.Element {
  return (
    <LegalPageShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p className="text-muted-foreground leading-relaxed">
        Quantum Mind Learning Lab™ (&ldquo;Quantum Mind,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) provides an AI-powered cognitive skills and learning
        platform used directly by individuals and families, and made available to schools and franchise partners for
        their students and staff. This policy explains what information we collect, how we use it, and the choices
        and protections available to you. It applies to every surface of the platform &mdash; the individual learner
        app, school and franchise partner portals, and the master administration console.
      </p>

      <section>
        <h2 className={legalStyles.h2}>1. Information we collect</h2>
        <p className={legalStyles.p}>We collect information in three ways: what you give us directly, what a school or franchise partner provides on a student&rsquo;s behalf, and what the platform generates as you use it.</p>
        <ul className={legalStyles.list}>
          <li><strong className="text-foreground">Account information.</strong> Name, email address, and password (individual and family accounts), or a username and platform-generated credentials for students provisioned by a school (see Section 4).</li>
          <li><strong className="text-foreground">Profile and learning data.</strong> Grade level, selected learning goals, exercise and practice session history, progress and mastery scores, and streak/completion data.</li>
          <li><strong className="text-foreground">Uploaded content.</strong> Documents you upload to the AI Document Transformer and other AI-assisted study tools, and any notes, transcripts, or text you submit for AI processing.</li>
          <li><strong className="text-foreground">Tenant and organizational data.</strong> For schools and franchise partners: institution name, staff roles, class/batch rosters, and enrollment records.</li>
          <li><strong className="text-foreground">Billing information.</strong> Subscription plan, billing cycle, and payment status. Card and payment details are collected and processed directly by our payment processor, Razorpay &mdash; we never see or store full card numbers.</li>
          <li><strong className="text-foreground">Feedback.</strong> Ratings and comments you choose to submit through in-app feedback prompts.</li>
          <li><strong className="text-foreground">Technical data.</strong> IP address, browser and device information, and usage logs, collected automatically to operate and secure the platform.</li>
        </ul>
      </section>

      <section>
        <h2 className={legalStyles.h2}>2. How we use your data</h2>
        <p className={legalStyles.p}>We use the information above to:</p>
        <ul className={legalStyles.list}>
          <li>Provide, personalize, and improve the learning experience &mdash; including adapting exercises and generating AI feedback based on your progress.</li>
          <li>Operate school and franchise partner accounts, including enrollment, class management, and each institution&rsquo;s own reporting on its own students.</li>
          <li>Process subscription payments and renewals, and send related billing communications.</li>
          <li>Communicate with you about your account, product updates, and (where you&rsquo;ve agreed to receive them) other communications.</li>
          <li>Monitor platform health, investigate misuse, and maintain the security described in Section 3.</li>
          <li>Meet legal, regulatory, and contractual obligations.</li>
        </ul>
        <p className={legalStyles.p}>
          Uploaded documents and study content are sent to our AI provider (Anthropic) solely to generate the
          requested learning output &mdash; summaries, questions, explanations, and similar &mdash; and are processed
          server-side under Anthropic&rsquo;s own data handling terms. We do not use your uploaded content to train
          our own models, and we do not sell personal information to third parties.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>3. Data security</h2>
        <p className={legalStyles.p}>
          The platform is built on Supabase (PostgreSQL). Every table holding personal or tenant data is protected
          by Row Level Security (RLS) &mdash; database-enforced rules that determine exactly which rows a given
          signed-in user is allowed to read or write, evaluated on every query, not just in application code. In
          practice this means a school&rsquo;s administrator can see that school&rsquo;s own students and data, and
          nothing belonging to another school or franchise partner.
        </p>
        <ul className={legalStyles.list}>
          <li>All traffic between your device and our servers is encrypted in transit (HTTPS/TLS); data at rest is encrypted by our infrastructure provider.</li>
          <li>Administrative and cross-tenant operations run through server-side, credential-gated code paths &mdash; never exposed to the browser.</li>
          <li>Payment processing is handled by Razorpay, a PCI-DSS compliant payment processor; we do not store your full card details.</li>
          <li>Access to production systems and support tooling is limited to authorized personnel on a need-to-know basis.</li>
        </ul>
        <p className={legalStyles.p}>No method of transmission or storage is 100% secure. We work to protect your information but cannot guarantee absolute security.</p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>4. Student privacy</h2>
        <p className={legalStyles.p}>
          Students accessing Quantum Mind through a school or franchise partner do not sign themselves up. Their
          accounts are created by their school&rsquo;s administrator, using a platform-generated username and
          password &mdash; there is no public student self-registration. The school or franchise partner
          administering the account is responsible for obtaining any parental or guardian consent required by
          applicable law (including, where applicable, laws governing the data of children under 13) before
          enrolling a student.
        </p>
        <p className={legalStyles.p}>
          A student&rsquo;s learning data (progress, practice history, and any documents they submit for AI
          processing) is visible only to that student, their school&rsquo;s administrators, and Quantum Mind &mdash;
          never to another school, franchise partner, or unrelated user, enforced by the same Row Level Security
          described in Section 3. We use student data only to operate and improve the learning platform for that
          student, never for advertising, and we do not sell student data.
        </p>
        <p className={legalStyles.p}>
          A parent, guardian, or school administrator who wants to review, correct, or request deletion of a
          student&rsquo;s data should contact us using the details in Section 8, or their school&rsquo;s
          administrator directly.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>5. Who we share data with</h2>
        <p className={legalStyles.p}>We share information only where necessary to run the platform:</p>
        <ul className={legalStyles.list}>
          <li><strong className="text-foreground">Supabase</strong> &mdash; our database, authentication, and file storage provider.</li>
          <li><strong className="text-foreground">Anthropic</strong> &mdash; processes content you submit to AI-assisted features, solely to generate the requested output.</li>
          <li><strong className="text-foreground">Razorpay</strong> &mdash; processes subscription and tenant billing payments.</li>
          <li><strong className="text-foreground">Your own school or franchise partner</strong> &mdash; if you hold a student account, your enrolling institution can see your roster information and learning progress within their own tenant.</li>
        </ul>
        <p className={legalStyles.p}>We may also disclose information if required by law, or to protect the rights, safety, and security of Quantum Mind, our users, or the public.</p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>6. Data retention</h2>
        <p className={legalStyles.p}>
          We retain account and learning data for as long as your account is active, or as needed to provide the
          service. Institutional (school/franchise partner) data is retained for the duration of that
          organization&rsquo;s subscription. We may retain limited data after account closure where required for
          legal, billing, or security purposes.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>7. Your rights and choices</h2>
        <p className={legalStyles.p}>
          Depending on your location, you may have the right to access, correct, export, or request deletion of
          your personal information, and to object to or restrict certain processing. Individual and family account
          holders can exercise most of these directly from account settings; everyone else can reach us using the
          contact details below.
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>8. Contact us</h2>
        <p className={legalStyles.p}>
          Questions about this policy, or requests regarding your data, can be sent to{' '}
          <a href="mailto:privacy@mindurmindlab.com" className="text-foreground underline underline-offset-2">
            privacy@mindurmindlab.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className={legalStyles.h2}>9. Changes to this policy</h2>
        <p className={legalStyles.p}>
          We may update this policy as the platform evolves. We&rsquo;ll update the &ldquo;Last updated&rdquo; date
          above when we do, and for material changes we&rsquo;ll provide more prominent notice.
        </p>
      </section>
    </LegalPageShell>
  )
}

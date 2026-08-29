// schema.org FAQPage JSON-LD — built server-side from the same real FAQ
// copy the page already renders (QsrFaq.tsx / RetreatFaq.tsx), not
// separately maintained content that could drift out of sync. Built
// from the English translation specifically: JSON-LD describes what a
// crawler should associate with the page's canonical URL, and English
// is what unauthenticated first-load/crawl traffic sees before any
// client-side language toggle runs.
type FaqItem = { question: string; answer: string }

export function buildFaqPageSchema(items: FaqItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  // Escapes '<' so a literal "</script>" inside any answer text can't
  // terminate the injected <script> tag early.
  return JSON.stringify(schema).replace(/</g, "\\u003c");
}

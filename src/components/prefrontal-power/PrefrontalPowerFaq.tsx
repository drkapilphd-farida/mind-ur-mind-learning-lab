import { Eyebrow } from "../ui";

// Exported so page.tsx can build the same real FAQ content into
// schema.org FAQPage JSON-LD via buildFaqPageSchema — single source of
// truth, not separately maintained content that could drift.
export const PREFRONTAL_POWER_FAQ_ITEMS: readonly { question: string; answer: string }[] = [
  {
    question: "Is this a meditation workshop?",
    answer:
      "No. Meditation is one small part of a larger, practical day covering focus, stress, emotion and decision-making.",
  },
  {
    question: "Do I need previous meditation or self-help experience?",
    answer: "None. The workshop is designed for complete beginners.",
  },
  {
    question: "Is this a medical or psychological treatment?",
    answer:
      "No. It's an educational and experiential workshop, not therapy or a clinical intervention. If you're managing a diagnosed condition, please consult a qualified professional alongside attending.",
  },
  {
    question: "Will I learn neuroscience?",
    answer: "You'll learn accessible, research-informed concepts — explained simply, through experience, not lectures.",
  },
  {
    question: "Will one day change my brain?",
    answer:
      "One day won't rewire anything by itself. It gives you the understanding and the starting system — the 21-day plan is where the practice happens.",
  },
  {
    question: "Is this only for working professionals?",
    answer:
      "No. It's built for anyone who feels mentally overloaded and wants a practical way forward — professionals, entrepreneurs, students, parents.",
  },
  {
    question: "What should I bring?",
    answer: "A notebook, an open mind, and comfortable clothing. Materials are provided.",
  },
  {
    question: "What's included in ₹3,500?",
    answer:
      "The full-day workshop, printed workbook, MOVERS™ protocol, 21-day tracker, guided audio, digital resources and certificate.",
  },
  {
    question: "What happens after I register?",
    answer: "You'll receive a confirmation with venue details and a pre-workshop note by email/WhatsApp.",
  },
];

export default function PrefrontalPowerFaq(): React.JSX.Element {
  return (
    <section id="faq" className="border-b border-line px-6 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-content">
        <div className="mb-12 max-w-xl">
          <Eyebrow color="text-gold">Questions</Eyebrow>
          <h2 className="mt-4 text-[26px] font-extrabold leading-tight sm:text-[32px]">Frequently Asked Questions</h2>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-line border-y border-line">
          {PREFRONTAL_POWER_FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[15px] font-semibold text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border border-line-strong text-[13px] text-ink-faint transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 pr-10 text-[14px] leading-relaxed text-ink-dim">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

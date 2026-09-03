type HeroTestimonialBadgeProps = {
  quote: string;
  name: string;
  context: string;
  className?: string;
};

// Compact Hero Social Proof™ — a small, static credibility signal near
// the hero CTA (not a full section, not a carousel) so a visitor sees a
// real name and quote without scrolling. The full testimonials section
// further down the page is untouched — this is additive. Each caller
// picks one specific real testimonial via a stable `id` lookup (never
// array position), same discipline as every other testimonial
// consumer on this site.
export default function HeroTestimonialBadge({ quote, name, context, className = "" }: HeroTestimonialBadgeProps): React.JSX.Element {
  return (
    <div className={`inline-flex max-w-sm items-start gap-2 rounded-sm border border-line-strong bg-panel2 px-3.5 py-2.5 ${className}`}>
      <span className="mt-[-2px] flex-none font-display text-[18px] italic leading-none text-gold" aria-hidden="true">
        &ldquo;
      </span>
      <p className="text-[12px] leading-snug">
        <span className="italic text-ink-dim">{quote}</span>
        <span className="ml-1 whitespace-nowrap not-italic text-ink-faint">
          — {name}
          {context.length > 0 ? ` · ${context}` : ""}
        </span>
      </p>
    </div>
  );
}

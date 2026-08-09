import { BookHeart } from 'lucide-react'

type ShortStoryCardProps = {
  story: string
}

// Short Story Method™ — a genuine 5-6 line mnemonic narrative (see
// quantumDocumentTransformerPrompt.ts's own instruction: "not a dry
// restatement of the summary in story clothing"), distinct from
// feynman_challenge and mnemonics — this card presents it as a story to
// read, not a fact to memorize, so it's just prose, no input/answer
// affordance.
export function ShortStoryCard({ story }: ShortStoryCardProps): React.JSX.Element {
  return (
    <div className="quantum-section-card p-4">
      <div className="flex items-center gap-2">
        <div className="quantum-icon-chip" aria-hidden="true">
          <BookHeart className="size-3.5 text-rose-500" />
        </div>
        <p className="text-sm font-semibold tracking-wide text-foreground">Short Story Method</p>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm italic leading-relaxed text-foreground">{story}</p>
    </div>
  )
}

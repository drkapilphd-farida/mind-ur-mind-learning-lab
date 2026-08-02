import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getPassageById } from '@/features/quantum-speed-reading/passageLibrary'

export const metadata: Metadata = {
  title: 'Questions Coming Soon — Quantum Speed Reading™',
}

type QuestionsComingSoonPageProps = {
  searchParams: Promise<{ mode?: string | undefined; passage?: string | undefined }>
}

// Sprint-3 placeholder — mirrors the exact honest-placeholder pattern
// Sprint-1 established with session-coming-soon. Comprehension questions
// are out of Sprint-2's scope; this is a clearly-labeled stop, not a faked
// question flow.
export default async function QuestionsComingSoonPage({ searchParams }: QuestionsComingSoonPageProps): Promise<React.JSX.Element> {
  const params = await searchParams
  const passage = params.passage ? getPassageById(params.passage) : null

  return (
    <div className="mx-auto flex min-h-[80dvh] max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/[0.08]" aria-hidden="true">
        <div className="size-8 rounded-full bg-primary/[0.15]" />
      </div>
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-balance text-foreground">
          Comprehension questions are coming in Sprint 3
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {passage ? `"${passage.title}"` : 'This passage'} was read — the real question experience is being built next.
        </p>
      </div>
      <Button asChild variant="outline" className="rounded-full transition-transform active:scale-[0.98]">
        <Link href="/labs/quantum-speed-reading">Back to Lab</Link>
      </Button>
    </div>
  )
}

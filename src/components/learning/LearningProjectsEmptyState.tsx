import Link from 'next/link'
import { Brain, UploadCloud } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

// AI Learning Studio™ V1 Launch UX Transformation — the locked entry
// experience: exactly two primary paths, nothing else. "Upload Your
// Content" is the primary path for a learner who already has material;
// "Discover Your Learning Potential™" (a real, existing assessment flow —
// see src/app/discover-learning-potential/) is the onboarding path for a
// learner who doesn't yet, or wants to understand their own learning
// ability first. Deliberately not the small, dense `EmptyStateCard`
// (Sprint 0) used for secondary/incidental empty states elsewhere — this
// is the whole Dashboard's focus for a first-time learner, not one card
// among several.
export function LearningProjectsEmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <h1 className={TYPOGRAPHY.h1}>Upload Anything. Learn Smarter.</h1>
      <p className={cn(TYPOGRAPHY.bodyLarge, 'mt-3 max-w-md text-muted-foreground')}>Read Faster. Remember Longer.</p>

      <div className="mt-10 grid w-full max-w-2xl gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center rounded-2xl border border-primary/20 bg-primary/5 p-8">
          <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <UploadCloud className="size-7 text-primary" />
          </div>
          <h2 className={cn(TYPOGRAPHY.h3, 'mt-5')}>
            Upload Your Content <span aria-hidden="true">⭐</span>
          </h2>
          <p className={cn(TYPOGRAPHY.small, 'mt-2 text-muted-foreground')}>Learn from PDFs, Images and Camera.</p>
          <Button asChild size="lg" className="mt-6 w-full rounded-full">
            <Link href="/preview/learning-projects/new">Upload Your Content</Link>
          </Button>
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-foreground/10 p-8">
          <div aria-hidden="true" className="flex size-14 items-center justify-center rounded-2xl bg-foreground/5">
            <Brain className="size-7 text-foreground" />
          </div>
          <h2 className={cn(TYPOGRAPHY.h3, 'mt-5')}>Discover Your Learning Potential™</h2>
          <p className={cn(TYPOGRAPHY.small, 'mt-2 text-muted-foreground')}>Test your Reading, Memory &amp; Focus in just 5 minutes.</p>
          <Button asChild size="lg" variant="outline" className="mt-6 w-full rounded-full">
            <Link href="/discover-learning-potential">Get Started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatFileSize } from '@/lib/formatFileSize'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type AIDetectionStepProps = {
  title: string
  onTitleChange: (value: string) => void
  formatLabel: string
  estimatedReadingMinutes: number
  sizeBytes: number
  onContinue: () => void
  onBack: () => void
  children: React.ReactNode
}

// AI Learning Studio™ V1 Launch UX Transformation — Screen 3, "AI
// Detection." Every value shown here is real and already computed today
// (analyzeDocumentContent/detectDocumentStructure, both pure and
// synchronous, previously only surfaced later during Processing) — no
// new analysis logic. Deliberately does NOT show a page/chapter count:
// real extraction hasn't run yet at this point in the flow (that happens
// server-side, during Processing), and showing a number here would mean
// fabricating one. `title` defaults to the file's own stripped filename
// and is the one thing the learner may still edit — replacing what used
// to be a separate, mandatory "Name your Learning Project" screen.
export function AIDetectionStep({ title, onTitleChange, formatLabel, estimatedReadingMinutes, sizeBytes, onContinue, onBack, children }: AIDetectionStepProps): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div className="space-y-1">
          <p className={TYPOGRAPHY.h4}>Here&rsquo;s what I found</p>
          <p className={cn(TYPOGRAPHY.small, 'text-muted-foreground')}>
            A {formatLabel} · {formatFileSize(sizeBytes)} · about {estimatedReadingMinutes} min read
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="detected-title">Project name</Label>
        <Input id="detected-title" value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="e.g. Understanding Cell Biology" maxLength={200} />
      </div>

      {children}

      <div className="space-y-3">
        <Button type="button" size="lg" className="w-full rounded-full" onClick={onContinue}>
          Continue <span aria-hidden="true">→</span>
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Change file
        </Button>
      </div>
    </div>
  )
}

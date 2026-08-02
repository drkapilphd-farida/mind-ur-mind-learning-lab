'use client'

import { useRef } from 'react'
import { FileText, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { formatFileSize } from '@/lib/formatFileSize'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type SingleFilePreviewProps = {
  file: File
  accept: string
  onReplace: (file: File) => void
  onRemove: () => void
  // AI Learning Studio™ V1 Launch UX Transformation — optional. The new
  // AI Detection step embeds this file chip with its own primary
  // "Continue" CTA already provided by that screen; rendering a second
  // Continue button here would be redundant. Omitting `onContinue`
  // simply hides this component's own button — every existing caller
  // that still passes it keeps its exact prior behavior.
  onContinue?: () => void
}

// AI Learning Studio™ Sprint ALS-2 — the single-file counterpart to
// ImagePreviewGrid's existing review-before-submit pattern. Previously,
// selecting a PDF/DOCX/TXT/camera-scan file submitted it immediately with
// no chance to replace — only the multi-image flow had that. This closes
// that gap without touching submission itself, which stays exactly as it
// was (createLearningProjectWithDocument, unchanged).
export function SingleFilePreview({ file, accept, onReplace, onRemove, onContinue }: SingleFilePreviewProps): React.JSX.Element {
  const replaceInputRef = useRef<HTMLInputElement>(null)

  function handleReplaceChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const nextFile = event.target.files?.[0]
    if (nextFile) onReplace(nextFile)
    event.target.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-xl border border-border p-4">
        <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className={cn(ICON_SIZE.lg, 'text-primary')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn(TYPOGRAPHY.h4, 'truncate')}>{file.name}</p>
          <p className={TYPOGRAPHY.caption}>{formatFileSize(file.size)}</p>
        </div>
        <Button type="button" size="icon-sm" variant="ghost" onClick={() => replaceInputRef.current?.click()} aria-label={`Replace ${file.name}`}>
          <RotateCcw className={ICON_SIZE.sm} aria-hidden="true" />
        </Button>
        <Button type="button" size="icon-sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${file.name}`}>
          <X className={ICON_SIZE.sm} aria-hidden="true" />
        </Button>
        <input ref={replaceInputRef} type="file" accept={accept} className="sr-only" onChange={handleReplaceChange} />
      </div>
      {onContinue && (
        <Button type="button" size="lg" className="w-full rounded-full" onClick={onContinue}>
          Continue <span aria-hidden="true">→</span>
        </Button>
      )}
    </div>
  )
}

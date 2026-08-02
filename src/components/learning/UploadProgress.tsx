'use client'

import { FileText, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { formatFileSize } from '@/lib/formatFileSize'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export type UploadProgressStatus = 'uploading' | 'processing' | 'error'

type UploadProgressProps = {
  fileName: string
  sizeBytes: number
  progress: number
  status: UploadProgressStatus
  errorMessage?: string | null
  onRetry?: (() => void) | undefined
  onCancel?: (() => void) | undefined
}

// Step 3's Upload Experience™ progress card — shown once a file has
// passed client validation and duplicate detection. Real states only:
// 'uploading' while the Server Action call is in flight, 'error' with
// a genuine Retry action if it fails, no fake byte-by-byte counter.
export function UploadProgress({ fileName, sizeBytes, progress, status, errorMessage, onRetry, onCancel }: UploadProgressProps): React.JSX.Element {
  return (
    <div className="rounded-xl border border-border p-5">
      <div className="flex items-start gap-3">
        <div aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className={cn(ICON_SIZE.lg, 'text-primary')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn(TYPOGRAPHY.h4, 'truncate')}>{fileName}</p>
          <p className={TYPOGRAPHY.caption}>{formatFileSize(sizeBytes)}</p>
        </div>
        {onCancel && status !== 'processing' && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Cancel upload">
            <X className={ICON_SIZE.md} aria-hidden="true" />
          </Button>
        )}
      </div>

      {status !== 'error' && (
        <div className="mt-4">
          <Progress value={progress} />
          <p className={cn(TYPOGRAPHY.caption, 'mt-2')} aria-live="polite">
            {status === 'processing' ? 'Preparing your Learning Project…' : `Uploading… ${Math.round(progress)}%`}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-4">
          <p className={cn(TYPOGRAPHY.caption, 'text-destructive')} role="alert">
            {errorMessage ?? 'Something went wrong. Please try again.'}
          </p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry} className="mt-2">
              Retry
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

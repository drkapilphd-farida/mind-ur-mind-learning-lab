'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

// Multi-Image / Batch Photo Upload™ (Phase 3) — per-image upload state,
// shown as a small overlay badge once a real upload is in flight.
// `undefined`/absent (the review-before-submit stage, before any upload
// has started) shows no badge at all — identical to this component's
// pre-Phase-3 appearance.
export type ImageUploadStatus = 'pending' | 'uploading' | 'done' | 'error'

type ImagePreviewGridProps = {
  images: readonly File[]
  onRemove: (index: number) => void
  onReplace: (index: number, file: File) => void
  // Page order is real, student-defined chapter order — not just a
  // cosmetic arrangement. Swaps two adjacent entries; the caller owns
  // the actual array reordering (this component never mutates `images`
  // itself).
  onMove: (index: number, direction: 'left' | 'right') => void
  // Parallel to `images` by index. Omitted entirely outside of an
  // active upload — reordering/removing/replacing is only offered
  // before upload starts anyway (see NewLearningProjectWizard.tsx),
  // so there's no real conflict between "uploading" state and editing.
  uploadStatuses?: readonly ImageUploadStatus[]
}

const STATUS_ICON: Record<ImageUploadStatus, React.ReactNode> = {
  pending: null,
  uploading: <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />,
  done: <Check className="size-3.5" aria-hidden="true" />,
  error: <AlertCircle className="size-3.5" aria-hidden="true" />,
}

const STATUS_LABEL: Record<ImageUploadStatus, string> = {
  pending: 'Waiting to upload',
  uploading: 'Uploading',
  done: 'Uploaded',
  error: 'Upload failed',
}

// Universal Upload Experience™ (Sprint LW-1C.2), extended by Multi-Image
// / Batch Photo Upload™ (Phase 3) — real local thumbnails via
// URL.createObjectURL (no network round-trip needed for a preview), with
// real remove/replace/reorder controls and, once a real upload starts,
// a real per-page status badge. Object URLs are revoked whenever the
// image list changes, so a long editing session never leaks memory.
export function ImagePreviewGrid({ images, onRemove, onReplace, onMove, uploadStatuses }: ImagePreviewGridProps): React.JSX.Element {
  const [objectUrls, setObjectUrls] = useState<readonly string[]>([])
  const replaceInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const isUploading = uploadStatuses !== undefined

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file))
    setObjectUrls(urls)
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [images])

  function handleReplaceChange(index: number, event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (file) onReplace(index, file)
    event.target.value = ''
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Selected images, in page order">
      {images.map((file, index) => {
        const status = uploadStatuses?.[index] ?? 'pending'
        return (
          <div key={`${file.name}-${index}`} role="listitem" className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30">
            {objectUrls[index] !== undefined && (
              // eslint-disable-next-line @next/next/no-img-element -- a real, local, temporary object URL preview; next/image's remote-optimization pipeline doesn't apply here.
              <img src={objectUrls[index]} alt={`Page ${index + 1}: ${file.name}`} className="size-full object-cover" />
            )}

            <span className={cn(TYPOGRAPHY.caption, 'absolute top-2 left-2 rounded-full bg-black/60 px-2 py-0.5 font-semibold text-white')}>Page {index + 1}</span>

            {isUploading && status !== 'pending' && (
              <span
                className={cn(
                  'absolute top-2 right-2 flex size-6 items-center justify-center rounded-full text-white',
                  status === 'error' ? 'bg-destructive' : status === 'done' ? 'bg-success' : 'bg-black/60',
                )}
                aria-label={STATUS_LABEL[status]}
                title={STATUS_LABEL[status]}
              >
                {STATUS_ICON[status]}
              </span>
            )}

            {!isUploading && (
              <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/40 via-transparent to-black/40 p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <div className="flex items-start justify-end gap-1.5">
                  <Button type="button" size="icon-sm" variant="secondary" className="rounded-full" onClick={() => replaceInputRefs.current[index]?.click()} aria-label={`Replace page ${index + 1}`}>
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button type="button" size="icon-sm" variant="secondary" className="rounded-full" onClick={() => onRemove(index)} aria-label={`Remove page ${index + 1}`}>
                    <X className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => onMove(index, 'left')}
                    disabled={index === 0}
                    aria-label={`Move page ${index + 1} earlier`}
                  >
                    <ChevronLeft className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="secondary"
                    className="rounded-full"
                    onClick={() => onMove(index, 'right')}
                    disabled={index === images.length - 1}
                    aria-label={`Move page ${index + 1} later`}
                  >
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}

            <input
              ref={(element) => {
                replaceInputRefs.current[index] = element
              }}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => handleReplaceChange(index, event)}
            />

            <p className={cn(TYPOGRAPHY.caption, 'absolute inset-x-0 bottom-0 truncate bg-black/50 px-2 py-1 text-white')}>{file.name}</p>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type ImagePreviewGridProps = {
  images: readonly File[]
  onRemove: (index: number) => void
  onReplace: (index: number, file: File) => void
}

// Universal Upload Experience™ (Sprint LW-1C.2) — real local thumbnails via
// URL.createObjectURL (no network round-trip needed for a preview), with a
// real remove and a real per-image replace control. Object URLs are
// revoked whenever the image list changes, so a long editing session never
// leaks memory.
export function ImagePreviewGrid({ images, onRemove, onReplace }: ImagePreviewGridProps): React.JSX.Element {
  const [objectUrls, setObjectUrls] = useState<readonly string[]>([])
  const replaceInputRefs = useRef<(HTMLInputElement | null)[]>([])

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list" aria-label="Selected images">
      {images.map((file, index) => (
        <div key={`${file.name}-${index}`} role="listitem" className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted/30">
          {objectUrls[index] !== undefined && (
            // eslint-disable-next-line @next/next/no-img-element -- a real, local, temporary object URL preview; next/image's remote-optimization pipeline doesn't apply here.
            <img src={objectUrls[index]} alt={`Selected image: ${file.name}`} className="size-full object-cover" />
          )}

          <div className="absolute inset-0 flex items-start justify-end gap-1.5 bg-gradient-to-b from-black/40 via-transparent to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <Button type="button" size="icon-sm" variant="secondary" className="rounded-full" onClick={() => replaceInputRefs.current[index]?.click()} aria-label={`Replace ${file.name}`}>
              <RotateCcw className="size-3.5" aria-hidden="true" />
            </Button>
            <Button type="button" size="icon-sm" variant="secondary" className="rounded-full" onClick={() => onRemove(index)} aria-label={`Remove ${file.name}`}>
              <X className="size-3.5" aria-hidden="true" />
            </Button>
          </div>

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
      ))}
    </div>
  )
}

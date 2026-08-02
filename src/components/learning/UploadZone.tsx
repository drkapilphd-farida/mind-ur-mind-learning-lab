'use client'

import { useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'
import { ICON_SIZE } from '@/lib/designSystem/icons'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

type UploadZoneProps = {
  onFileSelected: (file: File) => void
  // Universal Upload Experience™ (Sprint LW-1C.2) — when `multiple` is
  // true and provided, every selected/dropped file is passed here instead
  // of only the first one via onFileSelected. Optional and additive: every
  // existing single-file caller (PDF/DOCX/TXT) is unaffected, since they
  // never pass `multiple`/`onFilesSelected`.
  onFilesSelected?: (files: File[]) => void
  multiple?: boolean
  accept?: string
  disabled?: boolean
  errorMessage?: string | null
  title?: string
  subtitle?: string
  // AI Learning Studio™ Sprint ALS-2 — "Supported file types UI." Plain
  // text under the drop target (e.g. "PDF · up to 50 MB"), not enforced
  // here — validation still lives entirely in the caller.
  helperText?: string
}

// Step 3's Upload Experience™ entry point — Drag & Drop and Browse.
// Client validation (validateDocumentFile) runs in the caller, not here;
// this component only surfaces whatever errorMessage the caller decides
// to show. Sprint LW-1C.2 generalized this from PDF-only to any
// `accept`/`multiple` combination the caller needs — the drag/drop/browse
// mechanics themselves are unchanged.
export function UploadZone({
  onFileSelected,
  onFilesSelected,
  multiple = false,
  accept = 'application/pdf',
  disabled = false,
  errorMessage = null,
  title = 'Bring your knowledge here',
  subtitle = 'or click to browse',
  helperText,
}: UploadZoneProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(fileList: FileList | null): void {
    if (!fileList || fileList.length === 0) return
    if (multiple && onFilesSelected) {
      onFilesSelected(Array.from(fileList))
      return
    }
    const file = fileList[0]
    if (file) onFileSelected(file)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return
    handleFiles(event.dataTransfer.files)
  }

  function handleBrowseChange(event: React.ChangeEvent<HTMLInputElement>): void {
    handleFiles(event.target.files)
    event.target.value = ''
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors',
          disabled ? 'cursor-not-allowed border-border/60 opacity-50' : 'cursor-pointer border-border hover:border-primary/50 hover:bg-accent/20',
          isDragging && !disabled && 'border-primary bg-primary/5',
        )}
      >
        <div aria-hidden="true" className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
          <UploadCloud className={cn(ICON_SIZE.xl, 'text-primary')} />
        </div>
        <p className={TYPOGRAPHY.h3}>{title}</p>
        <p className={cn(TYPOGRAPHY.caption, 'mt-1')}>{subtitle}</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="sr-only" onChange={handleBrowseChange} disabled={disabled} />
      </div>
      {helperText && <p className={cn(TYPOGRAPHY.caption, 'mt-3 text-center')}>{helperText}</p>}
      {errorMessage && (
        <p className={cn(TYPOGRAPHY.caption, 'mt-3 text-destructive')} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

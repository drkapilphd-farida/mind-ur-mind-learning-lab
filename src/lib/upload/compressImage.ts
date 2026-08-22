// Multi-Image / Batch Photo Upload™ (Phase 3) — lightweight, dependency-
// free client-side compression via Canvas (hand-rolled, matching this
// codebase's existing "hand-craft a visual/media effect rather than add
// a library" convention — e.g. ConfettiBurst.tsx). A phone photo of a
// textbook page is typically far higher resolution than OCR/vision needs
// — downscaling before upload keeps the batch fast to send and cheap to
// store, without losing legibility (2000px on the long edge is well
// beyond what Claude's vision extraction needs to transcribe text
// reliably).
const DEFAULT_MAX_DIMENSION_PX = 2000
const DEFAULT_QUALITY = 0.85

export type CompressImageOptions = {
  maxDimensionPx?: number
  quality?: number
}

function withJpegExtension(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[^./]+$/, '')
  return `${withoutExtension}.jpg`
}

// Compression is an optimization, never a requirement — every real
// failure mode (a format the browser can't decode via createImageBitmap,
// e.g. some HEIC/HEIF variants; a canvas/toBlob failure; a re-encode
// that ends up no smaller than the original) falls back to returning
// the original File unchanged rather than blocking the upload. Never
// throws.
export async function compressImage(file: File, options: CompressImageOptions = {}): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const maxDimensionPx = options.maxDimensionPx ?? DEFAULT_MAX_DIMENSION_PX
  const quality = options.quality ?? DEFAULT_QUALITY

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimensionPx / Math.max(bitmap.width, bitmap.height))
    const targetWidth = Math.max(1, Math.round(bitmap.width * scale))
    const targetHeight = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }

    context.drawImage(bitmap, 0, 0, targetWidth, targetHeight)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
    if (!blob) return file

    // Never make the upload worse — a very small or already-optimized
    // source image can occasionally re-encode larger; only the
    // genuinely smaller result is used.
    if (blob.size >= file.size) return file

    return new File([blob], withJpegExtension(file.name), { type: 'image/jpeg', lastModified: file.lastModified })
  } catch {
    return file
  }
}

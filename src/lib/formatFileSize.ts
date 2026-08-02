// Extracted from UploadProgress.tsx (Sprint LW-1C.2) so the AI Learning
// Studio™ Sprint ALS-2 review-before-submit step can format the same way
// without a second implementation.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

import { File, FileText, Image, Video, type LucideIcon } from 'lucide-react'

// Shared by the master-admin grid and the partner-facing viewer — one
// mapping from a stored MIME type to a representative icon.
export function fileTypeIcon(fileType: string | null): LucideIcon {
  if (fileType === null) return File
  if (fileType === 'application/pdf') return FileText
  if (fileType.startsWith('video/')) return Video
  if (fileType.startsWith('image/')) return Image
  return File
}

export function fileTypeLabel(fileType: string | null): string {
  if (fileType === null) return 'File'
  if (fileType === 'application/pdf') return 'PDF'
  if (fileType.startsWith('video/')) return 'Video'
  if (fileType.startsWith('image/')) return 'Image'
  if (fileType.includes('word')) return 'Document'
  return 'File'
}

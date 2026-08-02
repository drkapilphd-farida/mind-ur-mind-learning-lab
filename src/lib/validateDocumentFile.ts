import {
  ACCEPTED_DOCUMENT_MIME_TYPES,
  JPEG_MAGIC_BYTES,
  LARGE_DOCUMENT_WARNING_BYTES,
  MAX_DOCUMENT_SIZE_BYTES,
  OLE_MAGIC_BYTES,
  PDF_MAGIC_BYTES,
  PNG_MAGIC_BYTES,
  WEBP_FORMAT_MAGIC_BYTES,
  WEBP_RIFF_MAGIC_BYTES,
  ZIP_MAGIC_BYTES,
} from '@/constants/documents'

export type DocumentValidationResult =
  | { valid: true; warning: 'large-file' | null }
  | { valid: false; reason: 'unsupported-type' | 'too-large' | 'corrupted' }

async function readHeaderBytes(file: File, length: number): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, length).arrayBuffer())
}

function matchesSignature(header: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return signature.every((byte, index) => header[offset + index] === byte)
}

async function hasPdfMagicBytes(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, PDF_MAGIC_BYTES.length)
  return matchesSignature(header, PDF_MAGIC_BYTES)
}

async function looksLikeJpeg(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, JPEG_MAGIC_BYTES.length)
  return matchesSignature(header, JPEG_MAGIC_BYTES)
}

async function looksLikePng(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, PNG_MAGIC_BYTES.length)
  return matchesSignature(header, PNG_MAGIC_BYTES)
}

async function looksLikeWebp(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, 12)
  return matchesSignature(header, WEBP_RIFF_MAGIC_BYTES, 0) && matchesSignature(header, WEBP_FORMAT_MAGIC_BYTES, 8)
}

// HEIC/HEIF — an ISO base media file format (like MP4). Best-effort: a
// fully robust check would walk the whole box structure; this checks for
// the "ftyp" box marker at its conventional offset plus a known HEIC/HEIF
// brand, which catches genuinely mislabeled files without needing a full
// parser. Disclosed as best-effort — a weaker guarantee than the other
// formats' checks below.
async function looksLikeHeic(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, 12)
  const ftyp = String.fromCharCode(header[4] ?? 0, header[5] ?? 0, header[6] ?? 0, header[7] ?? 0)
  const brand = String.fromCharCode(header[8] ?? 0, header[9] ?? 0, header[10] ?? 0, header[11] ?? 0)
  return ftyp === 'ftyp' && ['heic', 'heix', 'hevc', 'heim', 'heis', 'mif1', 'msf1'].includes(brand)
}

async function looksLikeZip(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, ZIP_MAGIC_BYTES.length)
  return matchesSignature(header, ZIP_MAGIC_BYTES)
}

async function looksLikeOle(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, OLE_MAGIC_BYTES.length)
  return matchesSignature(header, OLE_MAGIC_BYTES)
}

// Plain text has no universal magic bytes. Best-effort only: genuine UTF-8
// text should decode cleanly and never contain a NUL byte (a strong signal
// of binary data mislabeled as text/plain) — disclosed as best-effort,
// same spirit as the HEIC check above.
async function looksLikePlainText(file: File): Promise<boolean> {
  const header = await readHeaderBytes(file, Math.min(file.size, 512))
  if (header.includes(0)) return false
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(header)
    return true
  } catch {
    return false
  }
}

async function passesContentCheck(file: File): Promise<boolean> {
  switch (file.type) {
    case 'application/pdf':
      return hasPdfMagicBytes(file)
    case 'image/jpeg':
      return looksLikeJpeg(file)
    case 'image/png':
      return looksLikePng(file)
    case 'image/webp':
      return looksLikeWebp(file)
    case 'image/heic':
    case 'image/heif':
      return looksLikeHeic(file)
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return looksLikeZip(file)
    case 'application/msword':
      return looksLikeOle(file)
    case 'text/plain':
      return looksLikePlainText(file)
    default:
      return false
  }
}

// Real, honest validation — never trusts the file extension or the
// browser-reported MIME type alone for "is this actually what it claims to
// be" (a renamed .txt file reports as application/pdf if you rename its
// extension). Sprint LW-1C.2 (Universal Upload Experience™) extends this
// same principle from PDF-only to every format now supported — see
// passesContentCheck above for each format's real signature/content check.
export async function validateDocumentFile(file: File): Promise<DocumentValidationResult> {
  if (!(ACCEPTED_DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { valid: false, reason: 'unsupported-type' }
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return { valid: false, reason: 'too-large' }
  }

  const passesContent = await passesContentCheck(file)
  if (!passesContent) {
    return { valid: false, reason: 'corrupted' }
  }

  return { valid: true, warning: file.size > LARGE_DOCUMENT_WARNING_BYTES ? 'large-file' : null }
}

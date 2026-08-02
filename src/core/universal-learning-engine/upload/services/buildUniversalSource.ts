import type { UniversalSource, UniversalSourceType } from '../types/UniversalSource'

export type BuildUniversalSourceOptions = {
  idFactory?: () => string
  now?: () => Date
}

export function extensionOf(fileName: string): string | null {
  const match = /\.([^./]+)$/.exec(fileName)
  return match?.[1]?.toLowerCase() ?? null
}

// Universal Learning Intelligence Engine™ (ULIE™) — Sprint UCE-1. Pure
// given its injected id/clock dependencies (both default to the real
// crypto.randomUUID()/Date.now() for production use, overridable for
// tests) — builds the one object every Learning Mode will consume. Only
// ever called after validation has already passed, so `status` is always
// the terminal 'ready' state.
export function buildUniversalSource(
  file: File,
  sourceType: UniversalSourceType,
  metadata: Readonly<Record<string, unknown>>,
  options: BuildUniversalSourceOptions = {},
): UniversalSource {
  const idFactory = options.idFactory ?? (() => crypto.randomUUID())
  const now = options.now ?? (() => new Date())

  return {
    id: idFactory(),
    name: file.name,
    mimeType: file.type,
    extension: extensionOf(file.name),
    size: file.size,
    language: null,
    sourceType,
    status: 'ready',
    uploadedAt: now().toISOString(),
    metadata,
  }
}

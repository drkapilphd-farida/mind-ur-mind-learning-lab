const VALID_PRIORITIES = new Set(['critical', 'high', 'medium', 'low'])

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number'
}

function isStringOrNull(value: unknown): value is string | null {
  return value === null || isString(value)
}

function isValidPriority(value: unknown): boolean {
  return isString(value) && VALID_PRIORITIES.has(value)
}

function isValidReference(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return isString(record.memoryId) && isValidPriority(record.priority) && isString(record.reason)
}

function isValidSection(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return isString(record.id) && isValidPriority(record.priority) && Array.isArray(record.references) && record.references.every(isValidReference)
}

function isValidMetadata(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return (
    isStringOrNull(record.sessionId) &&
    isString(record.sourcePackageId) &&
    isNumber(record.sourcePackageVersion) &&
    isString(record.generatedAt) &&
    isNumber(record.payloadVersion)
  )
}

// Structural validator, mirroring
// `@/features/memory-persistence/serialization/DefaultMemorySerializer.ts`'s
// own `isValidV1Payload` convention.
export function isValidContextPayloadShape(payload: Record<string, unknown>): boolean {
  return isString(payload.id) && Array.isArray(payload.sections) && payload.sections.every(isValidSection) && isValidMetadata(payload.metadata)
}

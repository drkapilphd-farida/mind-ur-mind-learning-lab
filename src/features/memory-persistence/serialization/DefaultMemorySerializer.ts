import type { Memory, MemoryImportance, MemoryLifecycleState, MemoryType } from '../domain'
import type { MemorySerializer, SerializedMemory } from '../contracts'
import { InvalidMemoryPayloadError } from './InvalidMemoryPayloadError'

// The only version this sprint ships. "Future schema evolution must be
// supported": adding version 2 means adding a new `isValidV2Payload` +
// a new branch in `deserialize`'s version dispatch — `isValidV1Payload`
// and this class's version-1 behavior never change.
const CURRENT_VERSION = 1

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every(isString)
}

function isValidV1Payload(payload: Record<string, unknown>): boolean {
  const requiredStringFields = ['id', 'type', 'importance', 'content', 'lifecycle', 'createdAt', 'updatedAt'] as const
  for (const field of requiredStringFields) {
    if (!isString(payload[field])) return false
  }
  if (!isBoolean(payload.pinned)) return false

  const metadata = payload.metadata
  if (typeof metadata !== 'object' || metadata === null) return false
  const metadataRecord = metadata as Record<string, unknown>

  return isString(metadataRecord.learnerId) && isString(metadataRecord.source) && isStringArray(metadataRecord.tags)
}

// Implements MemorySerializer. `validate()` is the real gate —
// `deserialize()` always calls it first and throws
// InvalidMemoryPayloadError rather than producing a malformed Memory
// from bad data.
export class DefaultMemorySerializer implements MemorySerializer {
  serialize(memory: Memory): SerializedMemory {
    return {
      version: CURRENT_VERSION,
      payload: {
        id: memory.id,
        type: memory.type,
        importance: memory.importance,
        content: memory.content,
        pinned: memory.pinned,
        metadata: { ...memory.metadata },
        lifecycle: memory.lifecycle,
        createdAt: memory.createdAt,
        updatedAt: memory.updatedAt,
      },
    }
  }

  validate(serialized: SerializedMemory): boolean {
    if (serialized.version === CURRENT_VERSION) return isValidV1Payload(serialized.payload)
    return false
  }

  deserialize(serialized: SerializedMemory): Memory {
    if (!this.validate(serialized)) throw new InvalidMemoryPayloadError(serialized.version)

    const payload = serialized.payload
    const metadata = payload.metadata as Record<string, unknown>

    return {
      id: payload.id as string,
      type: payload.type as MemoryType,
      importance: payload.importance as MemoryImportance,
      content: payload.content as string,
      pinned: payload.pinned as boolean,
      metadata: {
        learnerId: metadata.learnerId as string,
        source: metadata.source as string,
        tags: metadata.tags as readonly string[],
      },
      lifecycle: payload.lifecycle as MemoryLifecycleState,
      createdAt: payload.createdAt as string,
      updatedAt: payload.updatedAt as string,
    }
  }
}

export function createMemorySerializer(): MemorySerializer {
  return new DefaultMemorySerializer()
}

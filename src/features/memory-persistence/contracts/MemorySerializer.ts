import type { Memory } from '../domain'

// "Version payloads... Future schema evolution must be supported" —
// `version` is a real, checked field (not a comment); `payload` stays
// a plain, opaque bag at the type level so a future version's shape
// doesn't require changing this type itself, only the serializer
// implementation's own internal version-dispatch logic.
export type SerializedMemory = {
  version: number
  payload: Record<string, unknown>
}

export interface MemorySerializer {
  serialize(memory: Memory): SerializedMemory
  deserialize(serialized: SerializedMemory): Memory
  validate(serialized: SerializedMemory): boolean
}

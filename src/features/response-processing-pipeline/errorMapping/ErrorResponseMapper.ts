import type { MappedError, RawErrorPayload } from '../types'

// One of the brief's own 10 named responsibilities.
export interface ErrorResponseMapper {
  map(raw: RawErrorPayload | null): MappedError | null
}

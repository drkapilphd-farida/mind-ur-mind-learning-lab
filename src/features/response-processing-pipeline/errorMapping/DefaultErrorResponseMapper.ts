import type { MappedError, RawErrorPayload } from '../types'
import type { ErrorResponseMapper } from './ErrorResponseMapper'

export class DefaultErrorResponseMapper implements ErrorResponseMapper {
  map(raw: RawErrorPayload | null): MappedError | null {
    if (raw === null) return null
    return { code: raw.code, message: raw.message }
  }
}

export function createErrorResponseMapper(): ErrorResponseMapper {
  return new DefaultErrorResponseMapper()
}

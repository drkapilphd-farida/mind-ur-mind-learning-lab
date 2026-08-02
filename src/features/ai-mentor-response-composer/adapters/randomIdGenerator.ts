import type { IdGenerator } from '../contracts'

export const randomIdGenerator: IdGenerator = {
  generate: () => crypto.randomUUID(),
}

import type { Clock } from '../contracts'

export const systemClock: Clock = {
  now: () => new Date().toISOString(),
}

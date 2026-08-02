import type { UserContext } from '../types'

// "Collect and normalize all learner context required by AI... No
// database dependency. Pure contracts only." — `buildContext` is a
// pure, synchronous function: it never fetches anything itself, only
// normalizes/defaults whatever partial data a caller (who already did
// the fetching) hands it.
export interface UserContextEngine {
  buildContext(input: Partial<UserContext>): UserContext
}

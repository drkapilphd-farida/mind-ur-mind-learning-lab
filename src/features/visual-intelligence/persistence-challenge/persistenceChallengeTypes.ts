// Visual Intelligence Lab™ — Image Persistence Challenge™, Sprint 6.

export type ReflectionResponse = 'bright-image' | 'dim-image' | 'colours-changed' | 'nothing-noticeable'

export type PersistenceChallengeSessionInput = {
  imageId: string
  reflectionResponse: ReflectionResponse
  journalNotes: string | null
  durationSeconds: number
}

export type PersistenceChallengeSessionRecord = PersistenceChallengeSessionInput & {
  completed: boolean
  occurredAt: string
}

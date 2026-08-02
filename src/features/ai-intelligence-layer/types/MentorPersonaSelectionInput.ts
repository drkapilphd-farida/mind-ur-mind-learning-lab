import type { AgeGroup } from './AgeGroup'

// What DefaultMentorPersonaEngine's selection logic actually looks at —
// a small, explicit hint set rather than the full UserContext, so the
// engine stays usable without the other three context engines ever
// having run.
export type MentorPersonaSelectionInput = {
  currentLab: string | null
  ageGroup: AgeGroup
  teacherModeRequested: boolean
}

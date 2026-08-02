export type MentorMessageRole = 'mentor' | 'learner'

export type MentorMessage = {
  id: string
  role: MentorMessageRole
  content: string
  createdAt: string
}

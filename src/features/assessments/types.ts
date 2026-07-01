export type Assessment = {
  id: string
  title: string
  durationMinutes?: number
  questionsCount?: number
  description?: string
}

export type Category = {
  id: string
  title: string
  description?: string
  assessments: Assessment[]
}

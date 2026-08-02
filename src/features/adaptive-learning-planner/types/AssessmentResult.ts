// One raw assessment result a caller already has — this planner never
// invents or fabricates a score ("No fake assessment data"); it only
// ever reads whatever is handed to it.
export type AssessmentResult = {
  category: string
  score: number
}

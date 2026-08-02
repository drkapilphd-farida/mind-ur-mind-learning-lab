// The "Teach Me" study mode's underlying structure — a sequence of
// sections, each with the talking points a learner would walk through
// if explaining this material to someone else (the Feynman-technique
// framing "Teach Me" is built around).
export type TeachingOutlineSection = {
  id: string
  conceptId: string
  title: string
  talkingPoints: readonly string[]
}

export type TeachingOutline = {
  sections: readonly TeachingOutlineSection[]
}

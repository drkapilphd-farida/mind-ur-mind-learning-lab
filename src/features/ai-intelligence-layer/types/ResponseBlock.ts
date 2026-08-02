// The Response Formatter's™ common output shapes — "Markdown, Plain
// Text, Cards, Bullet Lists, Action Items, Suggested Exercises." A
// discriminated union (not one loose `{ type, content }` bag) so each
// block carries exactly the fields its type needs, checked by the
// compiler. `SuggestedExerciseBlock` carries only `exerciseId` — no
// invented title/reason text ("No invented data").
export type MarkdownBlock = { type: 'markdown'; content: string }
export type PlainTextBlock = { type: 'plain-text'; content: string }
export type CardBlock = { type: 'card'; title: string; body: string }
export type BulletListBlock = { type: 'bullet-list'; items: readonly string[] }
export type ActionItemBlock = { type: 'action-item'; label: string }
export type SuggestedExerciseBlock = { type: 'suggested-exercise'; exerciseId: string }

export type ResponseBlock = MarkdownBlock | PlainTextBlock | CardBlock | BulletListBlock | ActionItemBlock | SuggestedExerciseBlock

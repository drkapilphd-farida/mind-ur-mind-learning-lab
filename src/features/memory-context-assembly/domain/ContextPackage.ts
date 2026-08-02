import type { ContextPackageMetadata } from './ContextPackageMetadata'
import type { ContextSection } from './ContextSection'

// The core immutable output model — every field `readonly`. "Produces
// a final immutable ContextPackage" — never mutated in place anywhere
// in this feature; every transformation (trimming) returns a *new*
// ContextPackage value. Pure TypeScript, no framework dependency, and
// — per "Do NOT implement: LLM prompt generation" — never itself
// formatted as a prompt; it's "ready for future AI consumption," not
// AI-consumed here.
export type ContextPackage = {
  readonly id: string
  readonly sections: readonly ContextSection[]
  readonly metadata: ContextPackageMetadata
}

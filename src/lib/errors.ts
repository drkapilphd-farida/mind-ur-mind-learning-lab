// A distinct error type for Sprint 0's scaffolding placeholders — lets
// calling code (and monitoring) distinguish "this function isn't built
// yet" from a genuine runtime failure once real implementations land.
export class NotImplementedError extends Error {
  constructor(featureDescription: string) {
    super(`Not implemented yet: ${featureDescription}`)
    this.name = 'NotImplementedError'
  }
}

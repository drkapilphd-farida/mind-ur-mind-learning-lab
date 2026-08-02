// A real extension point, not a comment: a future SDK-backed adapter
// needs somewhere to authenticate a client or open a connection
// (`initialize`) and somewhere to tear it down (`shutdown`). The
// default mock implementation is a deterministic in-memory state
// machine — uninitialized -> ready -> shut down — enforced by
// BaseProviderAdapter refusing to generate()/estimateCost() while
// `isReady()` is false.
export interface ProviderLifecycle {
  initialize(): Promise<void>
  shutdown(): Promise<void>
  isReady(): boolean
}

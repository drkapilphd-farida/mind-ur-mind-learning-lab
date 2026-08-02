import type { ProviderLifecycle } from '../contracts'

// Implements ProviderLifecycle as a deterministic, in-memory state
// machine — no real connection to open or close for a mock adapter,
// but the state transitions (uninitialized -> ready -> shut down) are
// real and enforced by BaseProviderAdapter. A future SDK-backed
// ProviderLifecycle (open a client, close it) is a drop-in
// replacement for this one class; nothing else changes.
export class DefaultProviderLifecycle implements ProviderLifecycle {
  private ready = false

  async initialize(): Promise<void> {
    this.ready = true
  }

  async shutdown(): Promise<void> {
    this.ready = false
  }

  isReady(): boolean {
    return this.ready
  }
}

export function createProviderLifecycle(): ProviderLifecycle {
  return new DefaultProviderLifecycle()
}

import type { AIProvider } from './AIProvider'

// The Provider Adapter layer's own public contract — a superset of
// AIProvider adding explicit lifecycle (initialize/shutdown/isReady).
// Every ProviderAdapter IS an AIProvider, so it stays fully compatible
// with the unmodified Chunk 1/2 ProviderRegistry/ProviderFactory —
// registering one is just `registry.register(adapter)`. The lifecycle
// surface is what's new: a real future SDK-backed adapter needs
// somewhere to set up (authenticate a client, open a connection) and
// tear down; MockProviderAdapter proves the extension point works
// end-to-end today, deterministically.
export interface ProviderAdapter extends AIProvider {
  initialize(): Promise<void>
  shutdown(): Promise<void>
  isReady(): boolean
}

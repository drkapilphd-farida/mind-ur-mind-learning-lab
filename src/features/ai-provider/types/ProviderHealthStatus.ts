export type ProviderHealthState = 'healthy' | 'degraded' | 'unavailable' | 'unknown'

export type ProviderHealthStatus = {
  providerId: string
  state: ProviderHealthState
  checkedAt: string
  message?: string
}

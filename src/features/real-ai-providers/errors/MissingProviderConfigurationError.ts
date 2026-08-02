// Thrown by EnvGatedProviderLifecycle.initialize() when its required
// environment variable is absent — a genuine, specific Configuration
// Error (Sprint 8's own explicit error category), never a raw SDK
// crash. Never includes the variable's *value* — only its name.
export class MissingProviderConfigurationError extends Error {
  constructor(providerId: string, missingEnvVar: string) {
    super(`Provider "${providerId}" is missing required configuration: environment variable "${missingEnvVar}" is not set.`)
    this.name = 'MissingProviderConfigurationError'
  }
}

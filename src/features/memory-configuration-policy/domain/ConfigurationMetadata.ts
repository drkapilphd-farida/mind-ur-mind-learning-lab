// Immutable — every field `readonly`. `profileId` is `null` when a
// configuration was resolved without any profile override layer.
export type ConfigurationMetadata = {
  readonly profileId: string | null
  readonly version: number
  readonly createdAt: string
  readonly updatedAt: string
}

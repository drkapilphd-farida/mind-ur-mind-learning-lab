// A plain version number, independent of `@/features/memory-context-assembly`'s
// own `ContextPackage.metadata.version` — this payload has its own
// version lineage, tracked separately (see `validation/isSupportedPayloadVersion.ts`
// and `serialization/`).
export type ContextPayloadVersion = number

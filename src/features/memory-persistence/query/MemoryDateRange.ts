// Either bound may be `null` (open-ended). Filters on `Memory.createdAt`.
export type MemoryDateRange = {
  readonly from: string | null
  readonly to: string | null
}

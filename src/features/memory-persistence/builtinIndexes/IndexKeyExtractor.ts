import type { Memory } from '../domain'
import type { IndexKey } from '../indexDomain'

// Pure — given one Memory, returns every key it should be associated
// with in a given index. Most built-in indexes return exactly one key
// (e.g. `type`); `tag`-shaped indexes return zero or more (a memory
// may carry any number of tags, or none).
export type IndexKeyExtractor = (memory: Memory) => readonly IndexKey[]

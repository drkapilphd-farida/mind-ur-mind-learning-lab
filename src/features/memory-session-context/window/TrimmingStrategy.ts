// 'drop-oldest' discards from the front of the ordered entry list
// (least-recently-added first) to fit within limits; 'drop-newest'
// discards from the back. Both preserve the relative order of every
// entry that survives.
export type TrimmingStrategy = 'drop-oldest' | 'drop-newest'

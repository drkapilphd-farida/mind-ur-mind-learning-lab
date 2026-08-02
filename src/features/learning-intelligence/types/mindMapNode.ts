// A tree projection of the Concept Graph — `parentId: null` marks a
// root node. Deliberately a tree, not the raw graph edges: a Mind Map
// needs one unambiguous layout, while ConceptGraph's edges can be a
// denser many-to-many web.
export type MindMapNode = {
  id: string
  conceptId: string
  label: string
  parentId: string | null
}

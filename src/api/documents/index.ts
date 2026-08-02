// External contract for the `documents` domain — thin by design (see
// docs/adr/0002-domain-layered-architecture.md). Delegates to
// services/documents/ and does nothing else.

export { listDocuments, getDocument, createDocument, hasDocumentWithTitle, markDocumentReady, markDocumentWorkspaceReady, markDocumentFailed, deleteDocument } from '@/services/documents'
export type { CreateDocumentInput } from '@/services/documents'

// AI Document Transformer™'s upload endpoint (/api/quantum-documents/
// transform) ships the raw file body over HTTP to a single synchronous
// Vercel serverless function — a fundamentally different constraint from
// documents/index.ts's MAX_DOCUMENT_SIZE_BYTES (200 MB), which governs the
// *other* upload flow (/preview/learning-projects/new), where the file
// itself never crosses the wire — only already-extracted text + metadata
// does (see that flow's own actions.ts comment). Node.js Serverless
// Functions on Vercel hard-cap request body size at 4.5 MB at the
// platform's ingress layer, before this app's own code ever runs — a
// "standard" real-world PDF (a few MB is common for a scanned or
// multi-page document) silently exceeding that produces exactly the
// crash real user testing found: the client's fetch/response.json() never
// gets a parseable response, landing in its generic catch. Set
// comfortably under the hard 4.5 MB ceiling to leave headroom for
// multipart/form-data boundary overhead.
export const MAX_SYNCHRONOUS_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB

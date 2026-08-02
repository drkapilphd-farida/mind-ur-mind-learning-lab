// pdfjs-dist ships no type declarations for its own worker entry point
// (confirmed: even pdfjs-dist's own public types declare the internal
// consumer of this export as `any` — this is a genuinely untyped
// implementation detail, not a gap in this codebase's own typing
// discipline). `WorkerMessageHandler` is only ever stored and handed
// back to pdfjs-dist's own `PDFWorker` internals verbatim — never called
// directly by this codebase — so `unknown` is the honest, safe type.
declare module 'pdfjs-dist/legacy/build/pdf.worker.mjs' {
  const WorkerMessageHandler: unknown
  export { WorkerMessageHandler }
}

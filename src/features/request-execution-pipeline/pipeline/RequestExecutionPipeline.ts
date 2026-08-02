import type { PipelineResult, RequestBuilderInputs } from '../types'

// One of the brief's own 10 named responsibilities — the top-level
// entry point: "prepares and routes an AI request after both the
// Provider and Model have already been selected." Never throws — see
// `PipelineResult`'s own header comment.
export interface RequestExecutionPipeline {
  execute(inputs: RequestBuilderInputs): PipelineResult
}

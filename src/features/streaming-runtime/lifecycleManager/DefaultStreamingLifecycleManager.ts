import { createStreamAssembler, type StreamAssembler } from '../assembly'
import { createStreamBuffer, type StreamBuffer } from '../buffering'
import { createStreamCompletionDetector, type StreamCompletionDetector } from '../completion'
import { createStreamingStateMachine, IllegalStreamingTransitionError, type StreamingStateMachine } from '../stateMachine'
import type {
  StreamChunk,
  StreamingRunInputs,
  StreamingRunResult,
  StreamingSession,
  StreamingValidationIssue,
} from '../types'
import {
  validateBufferState,
  validateChunkSequence,
  validateCompletion,
  validateStreamState,
  validateStreamingDiagnostics,
} from '../validation'
import { generateStreamingDiagnostics } from '../diagnostics'
import type { StreamingLifecycleManager } from './StreamingLifecycleManager'

export type StreamingLifecycleManagerDependencies = {
  stateMachine: StreamingStateMachine
  buffer: StreamBuffer
  assembler: StreamAssembler
  completionDetector: StreamCompletionDetector
}

function createDefaultDependencies(): StreamingLifecycleManagerDependencies {
  return {
    stateMachine: createStreamingStateMachine(),
    buffer: createStreamBuffer(),
    assembler: createStreamAssembler(),
    completionDetector: createStreamCompletionDetector(),
  }
}

export class DefaultStreamingLifecycleManager implements StreamingLifecycleManager {
  constructor(private readonly dependencies: StreamingLifecycleManagerDependencies) {}

  run(inputs: StreamingRunInputs): StreamingRunResult {
    const { stateMachine, buffer, assembler, completionDetector } = this.dependencies

    let session: StreamingSession = {
      id: inputs.sessionId,
      state: 'idle',
      bufferState: { chunks: [], totalContentLength: 0 },
    }

    const advance = (to: StreamingSession['state']): void => {
      session = { ...session, state: stateMachine.transition(session.state, to) }
    }

    try {
      if (inputs.cancellationRequested) {
        advance('cancelled')
        return this.buildResult(session, 'cancelled', null, [], [], '')
      }

      const sequenceValidation = validateChunkSequence(inputs.chunks)

      advance('starting')
      advance('streaming')

      const processedChunks: StreamChunk[] = []
      let partialResponse = ''
      let terminalIssues: readonly StreamingValidationIssue[] | null = null

      for (const chunk of inputs.chunks) {
        const streamStateValidation = validateStreamState(session.state)
        if (!streamStateValidation.valid) {
          terminalIssues = streamStateValidation.issues
          break
        }

        const appendResult = buffer.append(session.bufferState, chunk, inputs.bufferPolicy)
        session = { ...session, bufferState: appendResult.state }
        processedChunks.push(chunk)
        partialResponse = assembler.assemblePartialResponse(processedChunks)

        if (appendResult.overflowed) {
          terminalIssues = validateBufferState(appendResult.state, inputs.bufferPolicy).issues
          break
        }
      }

      if (terminalIssues !== null) {
        advance('failed')
        return this.buildResult(session, 'failed', null, processedChunks, terminalIssues, partialResponse)
      }

      if (!sequenceValidation.valid) {
        advance('failed')
        return this.buildResult(session, 'failed', null, processedChunks, sequenceValidation.issues, partialResponse)
      }

      const completionValidation = validateCompletion(inputs.chunks)
      const isComplete = completionDetector.isComplete(inputs.chunks)

      if (isComplete && completionValidation.valid) {
        advance('completed')
        const assembledResponse = assembler.assembleFinalResponse(inputs.chunks)
        return this.buildResult(session, 'completed', assembledResponse, processedChunks, [], partialResponse)
      }

      advance('failed')
      const completionIssues =
        completionValidation.issues.length > 0
          ? completionValidation.issues
          : [{ type: 'invalid-completion' as const, detail: 'The stream ended without reaching a valid completion.' }]
      return this.buildResult(session, 'failed', null, processedChunks, completionIssues, partialResponse)
    } catch (error) {
      if (error instanceof IllegalStreamingTransitionError) {
        return this.buildResult(
          session,
          'failed',
          null,
          [],
          [{ type: 'invalid-lifecycle-transition', detail: error.message }],
          '',
        )
      }
      throw error
    }
  }

  private buildResult(
    session: StreamingSession,
    status: StreamingRunResult['status'],
    assembledResponse: string | null,
    chunksReceived: readonly StreamChunk[],
    issues: readonly StreamingValidationIssue[],
    partialResponse: string,
  ): StreamingRunResult {
    const validation = { valid: issues.length === 0, issues }
    const diagnostics = generateStreamingDiagnostics(session, chunksReceived, partialResponse, validation)
    const diagnosticsValidation = validateStreamingDiagnostics(diagnostics)

    const finalIssues = diagnosticsValidation.valid ? issues : [...issues, ...diagnosticsValidation.issues]
    const finalValidation = { valid: finalIssues.length === 0, issues: finalIssues }

    return {
      session,
      status,
      assembledResponse,
      diagnostics: { ...diagnostics, validation: finalValidation },
      validation: finalValidation,
    }
  }
}

export function createStreamingLifecycleManager(
  overrides: Partial<StreamingLifecycleManagerDependencies> = {},
): StreamingLifecycleManager {
  return new DefaultStreamingLifecycleManager({ ...createDefaultDependencies(), ...overrides })
}

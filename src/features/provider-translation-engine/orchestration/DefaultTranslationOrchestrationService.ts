import type { Clock, IdGenerator } from '../contracts'
import { randomIdGenerator, systemClock } from '../adapters'
import { translateMentorPromptPayload } from '../translation'
import { buildTranslationInputs } from '../integration'
import type { TranslationOrchestrationInputs } from '../integration'
import { validateProviderRequest } from '../validation'
import { generateTranslationDiagnostics } from '../diagnostics'
import type { TranslationOrchestrationResult } from './TranslationOrchestrationResult'
import type { TranslationOrchestrationService } from './TranslationOrchestrationService'

export type TranslationOrchestrationServiceDependencies = {
  clock: Clock
  idGenerator: IdGenerator
}

function createDefaultDependencies(): TranslationOrchestrationServiceDependencies {
  return { clock: systemClock, idGenerator: randomIdGenerator }
}

// Implements TranslationOrchestrationService — reduces the raw
// cross-feature inputs, translates the payload via the requested
// profile, validates it against the source payload's own version, and
// produces diagnostics, always returning all three together.
export class DefaultTranslationOrchestrationService implements TranslationOrchestrationService {
  constructor(private readonly dependencies: TranslationOrchestrationServiceDependencies) {}

  generate(inputs: TranslationOrchestrationInputs): TranslationOrchestrationResult {
    const translationInputs = buildTranslationInputs(inputs)
    const request = translateMentorPromptPayload(translationInputs, inputs.providerId, this.dependencies.clock.now(), this.dependencies.idGenerator.generate())
    const validationResult = validateProviderRequest(request, inputs.promptPayload.version, inputs.configurationFacts)
    const diagnostics = generateTranslationDiagnostics(request, validationResult)

    return { request, validationResult, diagnostics }
  }
}

export function createTranslationOrchestrationService(
  overrides: Partial<TranslationOrchestrationServiceDependencies> = {},
): TranslationOrchestrationService {
  return new DefaultTranslationOrchestrationService({ ...createDefaultDependencies(), ...overrides })
}

import type { ConversationLifecycleState, ConversationState, DispatchResult, TriggerEvent } from '../types'
import type { ConversationDispatcher, ConversationResolver, IdGenerator } from '../contracts'
import { createConversationResolver } from '../resolution'
import { randomIdGenerator } from '../adapters'
import { computeExpiresAt } from './conversationTtl'

const ACTIVE_LIFECYCLE_STATES = new Set<ConversationLifecycleState>(['queued', 'ready', 'running', 'waiting'])

export type ConversationDispatcherDependencies = {
  resolver: ConversationResolver
  idGenerator: IdGenerator
}

function createDefaultDependencies(): ConversationDispatcherDependencies {
  return { resolver: createConversationResolver(), idGenerator: randomIdGenerator }
}

// Implements ConversationDispatcher. "Prevent duplicate conversations":
// if this learner already has an *active* (queued/ready/running/waiting
// — not completed/dismissed/expired) conversation of the exact same
// resolved ConversationType, the new event is deduplicated — reported,
// never silently dropped. Otherwise a fresh `queued` ConversationState
// is appended, with `expiresAt` computed from the rule's own priority.
export class DefaultConversationDispatcher implements ConversationDispatcher {
  constructor(private readonly dependencies: ConversationDispatcherDependencies) {}

  dispatch(event: TriggerEvent, queue: readonly ConversationState[]): DispatchResult {
    const rule = this.dependencies.resolver.resolve(event)

    const duplicate = queue.find(
      (state) => state.learnerId === event.learnerId && state.conversationType === rule.conversationType && ACTIVE_LIFECYCLE_STATES.has(state.lifecycle),
    )

    if (duplicate) {
      return {
        queue,
        dispatchedState: null,
        reason: `A "${rule.conversationType}" conversation is already "${duplicate.lifecycle}" for this learner — deduplicated.`,
      }
    }

    const dispatchedState: ConversationState = {
      id: this.dependencies.idGenerator.generate(),
      learnerId: event.learnerId,
      trigger: event.trigger,
      conversationType: rule.conversationType,
      priority: rule.priority,
      lifecycle: 'queued',
      context: event.context,
      createdAt: event.occurredAt,
      expiresAt: computeExpiresAt(event.occurredAt, rule.priority),
    }

    return {
      queue: [...queue, dispatchedState],
      dispatchedState,
      reason: `Dispatched a new "${rule.conversationType}" conversation at "${rule.priority}" priority.`,
    }
  }
}

export function createConversationDispatcher(overrides: Partial<ConversationDispatcherDependencies> = {}): ConversationDispatcher {
  return new DefaultConversationDispatcher({ ...createDefaultDependencies(), ...overrides })
}

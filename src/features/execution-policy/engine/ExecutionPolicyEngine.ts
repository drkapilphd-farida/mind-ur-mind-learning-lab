import type { ExecutionDecision, ExecutionPolicyRequest } from '../types'

// The brief's own "ExecutionPolicy" responsibility, renamed — a real
// collision found via repo-wide grep with
// `provider-execution-engine/types/ExecutionPolicy.ts` (Sprint 35's
// own plain data bundle, no decision logic of its own — a genuinely
// different concept from this behavioral interface). Renamed to echo
// this sprint's own brief title ("Execution Policy Engine").
// `DefaultExecutionPolicyEngine` (renamed to match) is the one
// concrete implementation. Pure; never throws.
export interface ExecutionPolicyEngine {
  decide(request: ExecutionPolicyRequest): ExecutionDecision
}

import { generateConceptSequence, generateFlashcards, generateLearningJourney, generatePractice, generateQuiz, generateRevision, generateStudyModesDataset } from '../generators'
import { createContentExtractor } from '../parsers'
import { createConceptGraphBuilder } from '../transformers'
import type { ConceptGraphBuilder, ContentExtractor, GeneratorInput, LearningIntelligenceEngine } from '../contracts'
import type { AdaptiveRecommendation, Document, DocumentSummary, Flashcard, LearningPlan, PracticeQuestion, QuizQuestion, RevisionBlock, TeachingOutline } from '../types'

// The only seams a real (future AI-backed) engine needs to override —
// everything else (concept sequencing, study-mode availability,
// journey assembly) is orchestration logic, not a swappable content
// source, so it isn't part of this injectable surface. Defaults to the
// real mock implementations from parsers/transformers/generators, so
// `createLearningIntelligenceEngine()` with no arguments is already a
// fully working engine — tests (and a future real engine) override
// only what they need to.
export type LearningIntelligenceEngineDependencies = {
  createContentExtractor: (mimeType: string | null) => ContentExtractor
  createConceptGraphBuilder: () => ConceptGraphBuilder
  generateFlashcards: (input: GeneratorInput) => Promise<readonly Flashcard[]>
  generateQuiz: (input: GeneratorInput) => Promise<readonly QuizQuestion[]>
  generatePractice: (input: GeneratorInput) => Promise<readonly PracticeQuestion[]>
  generateRevision: (input: GeneratorInput) => Promise<readonly RevisionBlock[]>
}

const defaultDependencies: LearningIntelligenceEngineDependencies = {
  createContentExtractor,
  createConceptGraphBuilder,
  generateFlashcards,
  generateQuiz,
  generatePractice,
  generateRevision,
}

// A minimal, honest DocumentSummary composed directly from real
// pipeline output (the extractor's own rawText, the graph's own
// concept titles) — not a "generateSummary" module, since Chunk 3's
// approved scope didn't include one. See this file's own module
// comment and the Sprint 3 report's "Future Extension Points" for why
// a dedicated generator should replace this later.
function composeSummary(rawText: string, conceptTitles: readonly string[]): DocumentSummary {
  return { overview: rawText, keyPoints: conceptTitles }
}

// Implements LearningIntelligenceEngine — the whole pipeline in one
// place: Document → ExtractedContent → ConceptGraph → Learning
// Generators → LearningPlan. Every stage after extraction/graph-
// building is a plain function call into generators/ (Chunk 3),
// unmodified; this file only sequences them in the order their real
// data dependencies require (see this feature's README-equivalent —
// generators/index.ts's own "first-order/second-order" comment).
export function createLearningIntelligenceEngine(overrides: Partial<LearningIntelligenceEngineDependencies> = {}): LearningIntelligenceEngine {
  const deps: LearningIntelligenceEngineDependencies = { ...defaultDependencies, ...overrides }

  return {
    async generateLearningPlan(document: Document): Promise<LearningPlan> {
      const extractor = deps.createContentExtractor(document.mimeType)
      const extractedContent = await extractor.extract(document)

      const graphBuilder = deps.createConceptGraphBuilder()
      const conceptGraph = await graphBuilder.build(extractedContent)

      const generatorInput: GeneratorInput = { extractedContent, conceptGraph }

      const [flashcards, quizQuestions, practiceQuestions, revisionBlocks] = await Promise.all([
        deps.generateFlashcards(generatorInput),
        deps.generateQuiz(generatorInput),
        deps.generatePractice(generatorInput),
        deps.generateRevision(generatorInput),
      ])

      const conceptSequence = generateConceptSequence(conceptGraph)
      const studyModes = generateStudyModesDataset({ conceptGraph, flashcards, quizQuestions, practiceQuestions, revisionBlocks })
      const journey = generateLearningJourney(conceptSequence, studyModes)

      const recommendations: AdaptiveRecommendation[] = []
      for (const step of journey.steps) {
        if (step.objectType !== null) recommendations.push({ objectType: step.objectType, reason: step.description })
      }

      // No generateMindMap or generateTeachingOutline exists yet (same
      // reason as composeSummary above) — honestly empty collections,
      // never fabricated nodes or sections.
      const mindMapNodes: LearningPlan['mindMapNodes'] = []
      const teachingOutline: TeachingOutline = { sections: [] }

      return {
        documentId: document.id,
        summary: composeSummary(
          extractedContent.rawText,
          conceptGraph.concepts.map((concept) => concept.title),
        ),
        concepts: conceptGraph.concepts,
        flashcards,
        quizQuestions,
        practiceQuestions,
        revisionBlocks,
        mindMapNodes,
        teachingOutline,
        availableStudyModes: studyModes.filter((mode) => mode.isAvailable).map((mode) => mode.objectType),
        recommendations,
      }
    },
  }
}

import type { ProgressAnalyzer } from '../contracts'
import type { MentorActivitySnapshot, MentorInsight } from '../types'

// Implements ProgressAnalyzer. Deterministic and stateless — the same
// snapshot always produces the same insight. Every value comes from
// the snapshot's own real counts (conceptsEncountered.length,
// sessionCount), never invented.
export class MockProgressAnalyzer implements ProgressAnalyzer {
  async analyze(snapshot: MentorActivitySnapshot): Promise<MentorInsight> {
    const conceptCount = snapshot.conceptsEncountered.length

    const summary = conceptCount === 0 ? 'Just getting started' : conceptCount < 3 ? 'Building early momentum' : 'Making steady progress'

    const detail =
      conceptCount === 0
        ? 'No concepts encountered yet — progress will show here once study begins.'
        : `You've engaged with ${conceptCount} concept${conceptCount === 1 ? '' : 's'} across ${snapshot.sessionCount} session${snapshot.sessionCount === 1 ? '' : 's'} so far.`

    return { id: `progress-${snapshot.learningProjectId}`, type: 'progress', summary, detail }
  }
}

export function createProgressAnalyzer(): ProgressAnalyzer {
  return new MockProgressAnalyzer()
}

import type { JourneyReadingSetDef } from './types'

// Quantum Mind Programs — real, in-universe content about this app's own
// pillars (Reading, Memory, Focus, the 21-Day Journey itself), never
// fabricated statistics about the app — just honest descriptions of what
// each real pillar trains.
export const QUANTUM_MIND_PROGRAMS: readonly JourneyReadingSetDef[] = [
  {
    id: 'mum-three-pillars',
    category: 'quantum-mind-programs',
    lengthTier: 'short',
    text: 'Quantum Mind is built around three core pillars of mental training: Reading, Memory, and Focus. Reading exercises train your eyes and brain to process text faster while still understanding it deeply. Memory exercises strengthen your ability to recall names, numbers, and details under pressure. Focus exercises build the concentration needed to stay locked onto a single task without drifting. Together, these three pillars form a complete daily workout for the mind, the same way a gym workout trains different muscle groups on different days.',
    comprehensionQuestions: [
      { question: 'What are the three core pillars mentioned?', options: ['Reading, Memory, and Focus', 'Speed, Strength, and Stamina', 'Math, Science, and Art', 'Sleep, Diet, and Exercise'], correctAnswer: 'Reading, Memory, and Focus' },
      { question: 'What do Focus exercises build?', options: ['Vocabulary', 'Concentration on a single task', 'Physical strength', 'Typing speed'], correctAnswer: 'Concentration on a single task' },
    ],
    retentionQuestions: [
      { question: 'What comparison does the passage make?', options: ['To a music concert', 'To a gym workout for different muscle groups', 'To a cooking recipe', 'To a road trip'], correctAnswer: 'To a gym workout for different muscle groups' },
      { question: 'What do Reading exercises train?', options: ['Only vocabulary', 'Eyes and brain to process text faster while understanding it', 'Handwriting speed', 'Public speaking'], correctAnswer: 'Eyes and brain to process text faster while understanding it' },
    ],
  },
  {
    id: 'mum-21-day-journey',
    category: 'quantum-mind-programs',
    lengthTier: 'medium',
    text: 'The 21-Day Transformation Journey is structured in three distinct weeks, each with its own focus. Week 1 concentrates on foundational eye movements and quick Brain Gym drills, building the basic habits needed before moving to harder skills. Week 2 expands into Right-Brain activation and visualization exercises, layered alongside real reading sprints of growing length. Week 3 brings everything together at an advanced pace, introducing Intuition training for the first time and pushing reading speed further using an adaptive pacing system that adjusts to each person’s own real comprehension results, rather than a one-size-fits-all target.',
    comprehensionQuestions: [
      { question: 'What does Week 1 of the journey focus on?', options: ['Advanced intuition training', 'Foundational eye movements and Brain Gym', 'Only memory games', 'Public speaking'], correctAnswer: 'Foundational eye movements and Brain Gym' },
      { question: 'What is introduced for the first time in Week 3?', options: ['Reading exercises', 'Intuition training', 'Brain Gym drills', 'Focus exercises'], correctAnswer: 'Intuition training' },
    ],
    retentionQuestions: [
      { question: 'What does the adaptive pacing system adjust to?', options: ['A fixed target for everyone', 'Each person’s own real comprehension results', 'Random chance', 'The time of day'], correctAnswer: 'Each person’s own real comprehension results' },
      { question: 'What does Week 2 add alongside visualization?', options: ['Longer reading sprints', 'Shorter breathing sessions', 'Group video calls', 'Written essays'], correctAnswer: 'Longer reading sprints' },
    ],
  },
  {
    id: 'mum-true-wpm',
    category: 'quantum-mind-programs',
    lengthTier: 'medium',
    text: 'Many reading apps report a raw words-per-minute number without checking whether the reader actually understood anything, which can be misleading — skimming quickly without comprehension isn’t genuine reading skill. Quantum Mind instead calculates a "True WPM": your raw reading pace discounted by how much of the passage you actually understood, based on real comprehension questions answered right after reading. If you read at high speed but answer questions poorly, your True WPM reflects that honestly instead of inflating your score. This is meant to keep training grounded in real skill rather than a number that looks impressive but doesn’t reflect genuine ability.',
    comprehensionQuestions: [
      { question: 'What problem does the passage identify with raw WPM scores?', options: ['They are too hard to calculate', 'They ignore whether the reader understood anything', 'They are always too low', 'They require expensive equipment'], correctAnswer: 'They ignore whether the reader understood anything' },
      { question: 'What is True WPM based on?', options: ['Guesswork', 'Raw pace discounted by real comprehension', 'The reader’s age', 'A random number generator'], correctAnswer: 'Raw pace discounted by real comprehension' },
    ],
    retentionQuestions: [
      { question: 'What happens to True WPM if comprehension is poor?', options: ['It stays artificially high', 'It reflects the poor comprehension honestly', 'It becomes negative', 'It is hidden from the user'], correctAnswer: 'It reflects the poor comprehension honestly' },
      { question: 'What is the goal of True WPM, per the passage?', options: ['To impress other users', 'To keep training grounded in real skill', 'To replace comprehension questions', 'To speed up onboarding'], correctAnswer: 'To keep training grounded in real skill' },
    ],
  },
  {
    id: 'mum-smart-weakness-targeting',
    category: 'quantum-mind-programs',
    lengthTier: 'long',
    text: 'A common problem with fixed daily curriculums is that they treat every learner identically, regardless of where each person is genuinely struggling. Quantum Mind addresses this through Smart Weakness Targeting, a system that quietly tracks real accuracy across the Intuition, Right Brain, and Visualisation domains behind the scenes, without ever interrupting the flow of a normal session. If a learner’s recent accuracy in one of these domains drops to a genuinely low level across multiple real attempts — not just one unlucky round, which could simply be bad luck — the system responds by swapping the next day’s warm-up exercise for a targeted drill in that specific weak area, clearly labeled so the learner understands exactly why that exercise was chosen for them. Crucially, this targeting respects the journey’s own weekly structure: a learner struggling with Intuition during Week 1 or Week 2 will not suddenly see Zener Card exercises appear early, since those weeks are deliberately reserved for foundational and expansion content. Instead, weakness signals are stored and only acted upon once the learner reaches the week where that particular skill is genuinely part of the curriculum. This design reflects a broader philosophy: real personalization should adapt to a learner’s actual demonstrated performance, not a guess, and it should never come at the cost of a coherent, trustworthy structure the learner can rely on.',
    comprehensionQuestions: [
      { question: 'What domains does Smart Weakness Targeting track?', options: ['Reading, Writing, and Speaking', 'Intuition, Right Brain, and Visualisation', 'Math, Science, and History', 'Speed, Accuracy, and Memory only'], correctAnswer: 'Intuition, Right Brain, and Visualisation' },
      { question: 'What triggers the system to respond?', options: ['A single unlucky round', 'Genuinely low accuracy across multiple real attempts', 'A random schedule', 'The learner asking for help'], correctAnswer: 'Genuinely low accuracy across multiple real attempts' },
    ],
    retentionQuestions: [
      { question: 'What happens if a learner struggles with Intuition during Week 1?', options: ['Zener Cards appear immediately', 'The signal is stored until the appropriate week', 'The journey restarts', 'Nothing is tracked at all'], correctAnswer: 'The signal is stored until the appropriate week' },
      { question: 'What broader philosophy does this design reflect?', options: ['Personalization based on random guesses', 'Adapting to actual demonstrated performance without breaking structure', 'Ignoring weak areas entirely', 'Treating every learner identically'], correctAnswer: 'Adapting to actual demonstrated performance without breaking structure' },
    ],
  },
]

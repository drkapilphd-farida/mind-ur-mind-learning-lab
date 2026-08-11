import type { ReadingUnit } from '@/features/reading-engine/types'

// Vertical Chunk Sliding™ — companion to Dynamic Chunk Sliding™, same
// "real, hand-authored sentences, programmatically chunked" content model,
// own dataset (no shared files with dynamicChunkSlidingDataset.ts, per
// this app's own-copy convention). Each category is now a genuine ~270-
// word deep dive (not a handful of disconnected aphorisms) so a full read
// at target pace naturally takes 60-75 seconds, followed by 3 real
// comprehension questions per category — each answerable only by having
// actually read that category's own passage, not generic trivia.
export type VerticalChunkSlidingQuizQuestion = {
  id: string
  question: string
  options: readonly string[]
  correctOptionIndex: number
}

export type VerticalChunkSlidingCategory = {
  id: string
  label: string
  sentences: readonly string[]
  questions: readonly VerticalChunkSlidingQuizQuestion[]
}

export const VERTICAL_CHUNK_SLIDING_CATEGORIES: readonly VerticalChunkSlidingCategory[] = [
  {
    id: 'quantum-focus',
    label: 'Quantum Focus',
    sentences: [
      'Deep focus narrows the mind until only the essential signal remains clearly visible, and everything else fades quietly into the background.',
      'A quantum mind holds one clear intention while filtering out every competing distraction that tries to pull it elsewhere.',
      'True concentration feels quiet, not forced, like a lens settling perfectly into place after a long search.',
      'The sharpest attention usually arrives only after the noisy urge to multitask has finally faded away completely.',
      'Research on interruptions suggests that once attention is broken, it can take several minutes for the mind to fully return to its previous depth of focus.',
      'Focused energy directed at one clear target accomplishes more in an hour than scattered effort accomplishes in an entire afternoon.',
      'A single clear thought, held steadily without wavering, consistently outperforms a dozen half-finished ones chasing each other.',
      'Quantum focus treats attention as a genuinely limited resource, not an unlimited tap that can be split infinitely.',
      'The mind that tries to watch everything at once ends up truly seeing almost nothing in real detail.',
      'Training this kind of focus starts small, often with just a few uninterrupted minutes practiced consistently every single day.',
      'A quiet room helps, but the real skill is learning to create quiet within a mind that is not.',
      'Removing visible distractions is only the first step toward genuine, durable focus.',
      'The second and harder step is training the mind itself to stop chasing every new stimulus.',
      'Athletes and musicians often describe this same state as a narrowing of awareness around exactly what matters most.',
      'That narrowing is not a limitation, it is the entire source of their precision under real pressure.',
      'What remains, once the noise is cleared, is usually a very simple and very clear next action.',
    ],
    questions: [
      {
        id: 'quantum-focus-q1',
        question: 'According to the passage, what happens after your attention is interrupted?',
        options: [
          'It immediately returns to full focus',
          'It can take several minutes to fully return to its previous depth',
          'It permanently reduces your total focus capacity',
          'It has no measurable effect on concentration',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'quantum-focus-q2',
        question: 'What does the passage say is the real skill behind focus, beyond just removing distractions?',
        options: [
          'Working in complete silence at all times',
          'Multitasking more efficiently',
          'Training the mind itself to stop chasing new stimulus',
          'Avoiding all mentally demanding tasks',
        ],
        correctOptionIndex: 2,
      },
      {
        id: 'quantum-focus-q3',
        question: 'How does the passage describe the "narrowing of awareness" athletes and musicians experience?',
        options: [
          'A limitation that reduces their performance',
          'An unnecessary side effect of pressure',
          'Something only elite performers can achieve',
          'The source of their precision under pressure',
        ],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'cognitive-mastery',
    label: 'Cognitive Mastery',
    sentences: [
      'Mastery begins the moment you notice how your own thinking actually works, rather than simply trusting every thought that appears.',
      'A trained mind learns to recognize its own biases before those biases can quietly mislead its decisions.',
      'Thinking clearly under pressure is a skill built through calm, repeated practice, not something people are simply born with.',
      'The mind that questions its first conclusion usually reaches a wiser second one shortly afterward.',
      'Psychologists often describe two different modes of thinking, one fast and instinctive, the other slow and deliberate.',
      'Fast thinking is efficient but prone to error, while slow thinking is accurate but requires real effort to engage.',
      'Cognitive mastery means knowing which mode a situation actually calls for, and switching deliberately between them.',
      'Snap judgments work well for familiar, low-stakes situations, but they fail badly under genuine complexity.',
      'Complex decisions deserve the slower mode, even when the fast one feels more comfortable in the moment.',
      'Cognitive strength grows the same way physical strength does, through consistent, controlled, and gradually increasing effort over time.',
      'Mastering your attention is often the very first real step toward mastering your thinking.',
      'A mind that cannot hold still cannot examine itself clearly enough to improve.',
      'Journaling and reflection are two of the simplest tools for noticing recurring patterns in your own thinking.',
      'Over weeks and months, those small noticed patterns quietly become the raw material of real self-knowledge.',
      'Cognitive mastery is not about being right more often through sheer intelligence alone.',
      'It is about noticing you might be wrong more quickly, and adjusting course sooner.',
      'That single habit, practiced consistently, compounds into judgment that looks like wisdom from the outside.',
      'Nobody starts with this skill fully formed; it is built one honest self-correction at a time.',
    ],
    questions: [
      {
        id: 'cognitive-mastery-q1',
        question: 'According to the passage, what are the two modes of thinking it describes?',
        options: ['Logical and emotional', 'Fast and instinctive vs. slow and deliberate', 'Conscious and unconscious', 'Verbal and visual'],
        correctOptionIndex: 1,
      },
      {
        id: 'cognitive-mastery-q2',
        question: 'What does the passage say fast thinking is good for?',
        options: ['Complex, high-stakes decisions', 'Long-term planning', 'Familiar, low-stakes situations', 'Learning entirely new skills'],
        correctOptionIndex: 2,
      },
      {
        id: 'cognitive-mastery-q3',
        question: "What two simple tools does the passage mention for noticing patterns in your own thinking?",
        options: ['Meditation and exercise', 'Reading and writing', 'Journaling and reflection', 'Testing and quizzes'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'neuroplasticity',
    label: 'Neuroplasticity',
    sentences: [
      'Every new skill you practice physically reshapes the pathways inside your own brain, cell by cell.',
      'The brain rewires itself constantly, rewarding whatever behavior you repeat most often with stronger, faster connections.',
      'Neuroscientists sometimes summarize this with a simple rule: neurons that fire together during practice gradually wire themselves together for good.',
      'This principle explains why repetition, not raw willpower alone, is what actually builds a lasting skill.',
      'Old habits fade only when new, stronger neural pathways are deliberately built to replace them over time.',
      'Your brain remains capable of real structural change at any age you choose to practice, not only in childhood.',
      'Early researchers once believed the adult brain was fixed after a certain age, but this turned out to be false.',
      'Modern neuroplasticity research shows the brain keeps adapting well into old age, given the right kind of practice.',
      'Repetition is essentially the language the brain uses to decide what information truly matters.',
      'Skip the repetition, and even meaningful information tends to fade quickly from long-term storage.',
      'Consistency beats intensity when it comes to building new neural pathways that actually last.',
      'A single long study session rewires the brain far less than several short sessions spread across days.',
      'This is part of why cramming feels productive but rarely produces durable learning.',
      'Sleep also plays a quiet but essential role, helping the brain consolidate whatever was practiced during the day.',
      'Physical exercise increases blood flow to the brain, which appears to support this same rewiring process.',
      'Every rep of a skill, physical or mental, is technically a small vote for which pathway survives.',
      'Over enough repetitions, weak, uncertain connections become fast, automatic, nearly effortless ones.',
      'That transformation, from effortful to automatic, is the entire practical promise of neuroplasticity.',
    ],
    questions: [
      {
        id: 'neuroplasticity-q1',
        question: 'What simple rule do neuroscientists use to summarize how repeated practice strengthens brain connections?',
        options: ['"Practice makes perfect"', '"Use it or lose it"', '"The brain never changes"', '"Neurons that fire together wire together"'],
        correctOptionIndex: 3,
      },
      {
        id: 'neuroplasticity-q2',
        question: 'What did early researchers once mistakenly believe about the adult brain?',
        options: ['That it could only learn language', 'That it grew new cells daily', 'That it was fixed after a certain age', 'That it had unlimited plasticity'],
        correctOptionIndex: 2,
      },
      {
        id: 'neuroplasticity-q3',
        question: 'According to the passage, which produces stronger neural rewiring: one long session or several short ones?',
        options: ['One long session', 'Several short sessions spread across days', 'Both are exactly equal', 'Neither produces measurable rewiring'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'speed-reading-science',
    label: 'Speed Reading Science',
    sentences: [
      'Fast readers see whole phrases at once instead of tracking one single word at a time across the page.',
      'Eye movement research shows the brain actually absorbs meaning during brief pauses, called fixations, not during the motion between them.',
      'The eyes do not glide smoothly across a line of text; instead they jump in short, quick bursts.',
      'Each of those jumps is followed by a brief pause where the brain does its real work of extracting meaning.',
      'Reducing inner speech, the quiet voice that silently narrates each word, lets the eyes move faster than that voice ever could.',
      'This habit of narrating every word internally is called subvocalization, and it is often the biggest hidden speed limit.',
      'Skilled readers also learn to trust their peripheral vision, catching upcoming words before their eyes even arrive there directly.',
      'Chunking words into meaningful phrase groups reduces the total number of stops your eyes need to make per line.',
      'Fewer stops per line directly translates into a measurably faster overall reading pace.',
      'Reading speed improves naturally once comprehension no longer requires slow, conscious, word by word translation.',
      'Regression, the habit of accidentally rereading text you already passed, is another common hidden speed drain.',
      'Many slow readers regress far more often than they realize, silently repeating work already done.',
      'Deliberate practice with a moving visual pacer can help train the eyes to stop unnecessary backtracking.',
      'Comprehension and speed are not actually in permanent conflict, despite what many people assume.',
      'With consistent practice, both improve together, since faster eyes free up more mental bandwidth for meaning.',
      'The goal is never simply moving the eyes faster for its own sake.',
      'The real goal is extracting more meaning per fixation, which naturally produces a faster reading pace as a side effect.',
    ],
    questions: [
      {
        id: 'speed-reading-science-q1',
        question: 'According to the passage, when does the brain actually absorb meaning while reading?',
        options: ['During the smooth motion between words', 'During brief pauses called fixations', 'Only at the end of each sentence', 'Continuously, with no distinct pauses'],
        correctOptionIndex: 1,
      },
      {
        id: 'speed-reading-science-q2',
        question: 'What is "subvocalization," according to the passage?',
        options: ['Reading out loud on purpose', 'Skipping words while reading', 'Silently narrating every word internally', 'A technique for speed reading'],
        correctOptionIndex: 2,
      },
      {
        id: 'speed-reading-science-q3',
        question: 'What does the passage call the habit of accidentally rereading text you already passed?',
        options: ['Fixation', 'Subvocalization', 'Chunking', 'Regression'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'mindfulness-presence',
    label: 'Mindfulness & Presence',
    sentences: [
      'Presence means noticing this exact moment fully, without mentally rushing ahead to whatever comes next.',
      'A mindful pause between one thought and the next creates space for a calmer, more considered response.',
      'Awareness of the breath quietly anchors the mind whenever it inevitably starts to wander elsewhere.',
      'Being present does not mean thinking less, it means noticing far more of what already exists around you.',
      'The present moment is, quite literally, the only place real focus has ever actually happened.',
      'Mindful attention treats each passing thought as a visitor, not as a permanent resident that must be obeyed.',
      'This small shift in framing changes the relationship a person has with their own difficult thoughts.',
      'Instead of fighting a thought or being swept away by it, the mind simply lets it pass through.',
      'Regular practice of this kind of noticing appears to reduce the physical stress response over time.',
      'A calmer nervous system, in turn, tends to support clearer thinking and steadier decisions.',
      'Mindfulness is often mistaken for relaxation, but the two are not exactly the same thing.',
      'Relaxation is a pleasant side effect; presence itself is closer to a disciplined form of attention.',
      'Even a single mindful breath, taken deliberately, can interrupt an escalating spiral of anxious thought.',
      'Many traditions use the breath specifically because it is always available, in any moment, without special equipment.',
      'Beginners often find their attention wandering constantly, and this is completely normal, not a failure.',
      'The skill is simply noticing the wandering and gently returning, again and again, without self-criticism.',
      'Over time, that gentle return becomes faster and more automatic with consistent practice.',
      'Presence is less a fixed destination and more a continuous, repeatable practice of returning.',
    ],
    questions: [
      {
        id: 'mindfulness-presence-q1',
        question: 'According to the passage, what does being present NOT mean?',
        options: ['Thinking less', 'Noticing more', 'Being calm', 'Focusing on your breath'],
        correctOptionIndex: 0,
      },
      {
        id: 'mindfulness-presence-q2',
        question: 'How does the passage describe treating a passing thought during mindful attention?',
        options: ['As a problem to eliminate immediately', 'As something to analyze deeply', 'As a visitor, not a permanent resident', 'As a distraction to suppress'],
        correctOptionIndex: 2,
      },
      {
        id: 'mindfulness-presence-q3',
        question: 'Why does the passage say many traditions use the breath as an anchor?',
        options: ['It is the most relaxing sensation', 'It requires special equipment to notice', 'It has no physical effects', 'It is always available, in any moment'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'memory-systems',
    label: 'Memory Systems',
    sentences: [
      'Memories grow stronger each time they are recalled, not simply each time they are first stored.',
      'Spacing your practice out over several days builds memory that lasts far longer than a single cramming session.',
      'The brain remembers meaning far more easily than it remembers isolated, disconnected facts with no context.',
      'Linking new information to something already familiar makes it dramatically easier to recall later on.',
      "Sleep quietly consolidates the day's learning, transferring it from short-term into more durable long-term storage.",
      'Active recall, the act of testing yourself, trains memory far more effectively than simply rereading the same material.',
      'This is because retrieval itself, not passive exposure, is what strengthens a memory trace.',
      'Many students rely on rereading because it feels productive, even though research consistently shows it is comparatively weak.',
      'A memory retrieved under slight difficulty is generally strengthened more than one retrieved with ease.',
      'This is sometimes called desirable difficulty, and it explains why easy review often underperforms harder self-testing.',
      'Forgetting is not always a failure of memory; it is often simply a natural part of how memory is refined.',
      'Reviewing material right before you would otherwise forget it strengthens the memory more than reviewing too early.',
      'This timing principle is the foundation of spaced repetition systems used by many serious learners.',
      'Emotion also plays a surprisingly large role in which memories survive over the long term.',
      'A fact tied to a strong emotional moment is often remembered years after a neutral fact is forgotten.',
      'Working memory, our short-term mental workspace, holds only a handful of items before it feels crowded.',
      'Moving information from that crowded short-term space into durable long-term storage requires deliberate, repeated effort.',
      'Memory is not a passive recording device; it is an active, reconstructive process shaped every time we recall it.',
    ],
    questions: [
      {
        id: 'memory-systems-q1',
        question: 'According to the passage, what strengthens a memory more effectively than rereading?',
        options: ['Highlighting text', 'Active recall through self-testing', 'Listening to a summary', 'Copying the material by hand'],
        correctOptionIndex: 1,
      },
      {
        id: 'memory-systems-q2',
        question: 'What does the passage call the effect where retrieving a memory under slight difficulty strengthens it more than easy retrieval?',
        options: ['Cognitive load', 'Spaced repetition', 'Desirable difficulty', 'The forgetting curve'],
        correctOptionIndex: 2,
      },
      {
        id: 'memory-systems-q3',
        question: 'According to the passage, what role does sleep play in memory?',
        options: ['It has no measurable effect on memory', 'It consolidates learning into longer-term storage', 'It erases short-term memories', 'It only affects physical, not mental, skills'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'deep-work',
    label: 'Deep Work',
    sentences: [
      'Deep work happens only when distraction is deliberately and consistently removed from the immediate environment.',
      'Meaningful progress on hard problems usually comes from long, uninterrupted stretches, not short, scattered bursts of attention.',
      'The ability to concentrate on one demanding task without switching is becoming a genuinely rare skill today.',
      'Constant notifications and open browser tabs have quietly trained many minds to expect frequent interruption as normal.',
      'Hard problems tend to yield to sustained attention far more often than they yield to clever shortcuts.',
      'Protecting a real block of undistracted time is often the actual key to producing meaningful output.',
      'Many people mistake busyness, answering messages and attending meetings, for genuine productive work.',
      'Deep work rewards patience with results that shallow, fragmented effort almost never produces on its own.',
      'Even ninety focused minutes can outproduce an entire distracted, interruption-filled workday.',
      'Scheduling deep work like an unmovable appointment makes it far more likely to actually happen.',
      'Without a scheduled block, deep work quietly gets crowded out by smaller, more urgent-feeling tasks.',
      'The first ten to fifteen minutes of a deep session often feel the hardest to settle into.',
      'Once genuine focus finally sets in, the work tends to feel noticeably easier and more absorbing.',
      'A visible ritual, like closing every tab or silencing every notification, signals to the brain that deep work has begun.',
      'Over time this ritual becomes a reliable trigger that shortens the time needed to reach real focus.',
      'Shallow work, by contrast, can often be done in a distracted, half-attentive state without much cost.',
      'The danger is that shallow work quietly expands to fill an entire day if left unchecked.',
      'Protecting even a single daily block of deep work compounds into significant results over months.',
    ],
    questions: [
      {
        id: 'deep-work-q1',
        question: 'According to the passage, what is often mistaken for genuine productive work?',
        options: ['Reading books', 'Busyness, like answering messages and attending meetings', 'Deep, focused thinking', 'Taking scheduled breaks'],
        correctOptionIndex: 1,
      },
      {
        id: 'deep-work-q2',
        question: 'What does the passage suggest makes deep work more likely to actually happen?',
        options: ['Waiting until you feel motivated', 'Working whenever there is free time', 'Scheduling it like an unmovable appointment', 'Avoiding all rituals or routines'],
        correctOptionIndex: 2,
      },
      {
        id: 'deep-work-q3',
        question: 'According to the passage, what tends to happen if shallow work is left unchecked?',
        options: ['It disappears on its own', 'It automatically becomes deep work', 'It has no effect on total output', 'It expands to fill an entire day'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'flow-states',
    label: 'Flow States',
    sentences: [
      'Flow arrives when a challenge perfectly matches the skill level a person already brings to it.',
      'Time seems to disappear whenever full attention merges completely with the task directly in front of you.',
      'A flow state feels effortless from the outside, though it actually rests on real, well-practiced ability.',
      'Clear goals and immediate feedback form the quiet architecture behind almost every flow experience.',
      'Without knowing what success looks like moment to moment, sustained flow becomes very difficult to reach.',
      'The psychologist who first studied this state described it as being fully absorbed in an activity for its own sake.',
      'He mapped flow onto a narrow zone between two less productive states, boredom and anxiety.',
      'Too little challenge relative to skill produces boredom; too much challenge produces anxiety and stress.',
      'Flow lives in the narrow, dynamic edge between those two, where skill and difficulty stay closely matched.',
      'As skill improves, the challenge must increase too, or flow quietly slips back into boredom.',
      'This is part of why flow tends to appear more often in skilled, deliberately structured practice than in passive activity.',
      'Athletes, musicians, and surgeons frequently describe flow using strikingly similar language, despite working in very different fields.',
      'Losing yourself in focused work is often a genuine sign that the difficulty level is well calibrated.',
      'Flow cannot usually be forced directly, but the conditions for it can be deliberately created.',
      'Removing distractions, setting a clear goal, and choosing an appropriately challenging task all help.',
      'Immediate feedback, whether from a scoreboard, a coach, or the task itself, keeps flow sustained longer.',
      'Many people report their most memorable, satisfying work happened during a flow state they could not fully explain afterward.',
      'Understanding the mechanism behind it makes that state far easier to intentionally invite back.',
    ],
    questions: [
      {
        id: 'flow-states-q1',
        question: 'According to the passage, flow lives in the narrow zone between which two states?',
        options: ['Focus and distraction', 'Confidence and doubt', 'Boredom and anxiety', 'Rest and exhaustion'],
        correctOptionIndex: 2,
      },
      {
        id: 'flow-states-q2',
        question: 'What happens to flow if skill improves but the challenge level stays the same?',
        options: ['Flow becomes permanent', 'Flow intensifies further', 'Flow turns into anxiety', 'Flow quietly slips back into boredom'],
        correctOptionIndex: 3,
      },
      {
        id: 'flow-states-q3',
        question: 'According to the passage, what forms the "quiet architecture" behind most flow experiences?',
        options: ['Silence and isolation', 'High stakes and pressure', 'Clear goals and immediate feedback', 'Natural talent alone'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'visualization-techniques',
    label: 'Visualization Techniques',
    sentences: [
      'Vivid mental rehearsal activates many of the same brain regions that real physical practice activates directly.',
      'Athletes routinely visualize success in careful detail long before that success ever happens in actual competition.',
      'A clear mental image of the desired outcome makes the real path toward it noticeably easier to follow.',
      'Visualization works best when it includes sound, physical feeling, and fine detail, not merely a flat picture.',
      'Imagining a difficult challenge in advance quietly reduces the anxiety it causes once it actually arrives.',
      'The mind often cannot fully distinguish a vividly imagined rehearsal from genuinely lived experience at a neural level.',
      'This is precisely why surgeons, pilots, and elite athletes rehearse high-stakes scenarios mentally before ever performing them for real.',
      'Mental rehearsal is not simply idle daydreaming about a pleasant future outcome.',
      'Effective visualization walks deliberately through the actual process, including likely obstacles, not just the final celebratory moment.',
      'Rehearsing only the win, without the difficult middle part, tends to produce weaker real-world results.',
      'Research comparing visualization to physical practice alone shows a blended combination performs best of all.',
      'Visualization is not a replacement for real practice, but a genuine multiplier on top of it.',
      'Beginners often find visualization difficult at first, since the skill of imagining vividly is itself trainable.',
      'Starting with short, simple, highly specific scenes tends to work better than vague, general ones.',
      'Over repeated sessions, those imagined scenes become sharper, more detailed, and noticeably more useful.',
      'Visualization can also be used afterward, mentally replaying a real performance to extract genuine lessons from it.',
      'This kind of reflective replay strengthens the neural pathways built during the original experience itself.',
      'Used consistently, visualization becomes a quiet rehearsal space available anywhere, requiring no equipment at all.',
    ],
    questions: [
      {
        id: 'visualization-techniques-q1',
        question: 'According to the passage, what does effective visualization deliberately include, beyond just the final outcome?',
        options: ['Only the celebratory final moment', 'Likely obstacles along the way', 'A vague, general scene', "Someone else's experience"],
        correctOptionIndex: 1,
      },
      {
        id: 'visualization-techniques-q2',
        question: 'What does research comparing visualization to physical practice show, according to the passage?',
        options: ['Visualization alone works better than physical practice', 'Physical practice alone works better than visualization', 'A blended combination of both performs best', 'Neither has any measurable effect'],
        correctOptionIndex: 2,
      },
      {
        id: 'visualization-techniques-q3',
        question: 'According to the passage, what happens when you mentally replay a real performance afterward?',
        options: ['It weakens the original memory', 'It has no effect on learning', 'It only works for physical skills, not mental ones', 'It strengthens the neural pathways built during the experience'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'pattern-recognition',
    label: 'Pattern Recognition',
    sentences: [
      'The trained eye starts noticing patterns that a complete beginner would simply overlook entirely, even when looking at the exact same scene.',
      'Expertise is often, at its core, just pattern recognition built from thousands of hours of focused exposure.',
      'Recognizing a familiar structure lets the mind skip straight to the useful, relevant part of a problem.',
      'Patterns hidden inside complex information become obvious once you finally know what to look for.',
      'A pattern noticed once becomes noticeably easier to notice again the very next time it appears.',
      'Studies of chess masters famously found they could recall realistic board positions almost perfectly after a brief glance.',
      'The same masters, shown randomly scrambled pieces, performed no better than complete beginners at recalling them.',
      'This gap reveals that their advantage was not raw memory, but recognition of meaningful, familiar patterns.',
      'Great intuition is frequently just pattern recognition operating faster than slow, conscious, step by step thought.',
      'This is why experienced professionals often sense something is wrong before they can fully explain why.',
      'Their brain has already matched the current situation against thousands of prior similar ones.',
      'Pattern recognition can occasionally mislead when a situation only superficially resembles a familiar one.',
      'This is part of why true experts remain cautious and keep verifying, even when intuition feels confident.',
      'Deliberate practice across many varied examples is what actually builds a reliable library of patterns.',
      'Passive exposure alone, without active engagement, builds this library far more slowly and unreliably.',
      'Novices benefit enormously from being shown many worked examples side by side, not just abstract rules.',
      'Over time, the individual examples fade from conscious memory, leaving behind only the underlying pattern itself.',
      'That distilled pattern is what experts actually rely on, often without being able to fully explain it.',
    ],
    questions: [
      {
        id: 'pattern-recognition-q1',
        question: 'According to the passage, what did chess masters do well when shown realistic board positions briefly?',
        options: ['Recall them almost perfectly', 'Fail completely, just like beginners', 'Only remember the pieces, not positions', 'Take much longer than beginners to respond'],
        correctOptionIndex: 0,
      },
      {
        id: 'pattern-recognition-q2',
        question: 'What happened when the same chess masters were shown randomly scrambled pieces?',
        options: ['They still outperformed beginners easily', 'They refused to attempt the task', 'They performed no better than beginners', 'They performed worse than beginners'],
        correctOptionIndex: 2,
      },
      {
        id: 'pattern-recognition-q3',
        question: 'According to the passage, what is intuition often described as?',
        options: ['A completely random guess', 'A skill that cannot be trained', 'The opposite of expertise', 'Pattern recognition operating faster than conscious thought'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'working-memory',
    label: 'Working Memory',
    sentences: [
      'Working memory holds only a small number of items at once, so mental clarity always beats mental clutter.',
      'Early researchers estimated its capacity at around seven items, though later work suggests the real number is closer to three or four.',
      'Chunking related pieces of information together frees up this limited space for harder, more demanding mental work.',
      'A cluttered mind struggles to hold a genuinely new idea long enough to actually use it well.',
      'Working memory improves somewhat with practice, the same way any other mental capacity can be trained.',
      'Writing a thought down externally frees working memory to focus fully on the very next one.',
      'This is part of why to-do lists reduce mental strain even before a single task is completed.',
      'The fewer items you try to juggle mentally, the more clearly you can think about each one.',
      'Working memory and long-term memory function as genuinely different systems inside the brain.',
      'Long-term memory stores vast amounts of information, but working memory can only actively access a tiny slice at once.',
      'This narrow bottleneck is precisely why complex problems often need to be broken into smaller steps.',
      'Trying to hold an entire complex problem in mind at once frequently causes real mental overload.',
      'Experts partly bypass this limit by chunking familiar information into larger, denser, meaningful units.',
      'A chess master, for instance, sees one meaningful configuration where a beginner sees many separate individual pieces.',
      'This chunking effectively expands the practical capacity of working memory without changing its literal size.',
      'Reducing background noise and interruptions helps protect the limited working memory available for a demanding task.',
      'Multitasking is particularly costly because switching between tasks repeatedly overloads this same narrow bottleneck.',
      'Protecting working memory, rather than trying to expand it endlessly, is often the more practical strategy.',
    ],
    questions: [
      {
        id: 'working-memory-q1',
        question: 'According to the passage, what capacity did later research suggest for working memory, compared to early estimates?',
        options: ['Much higher, around twenty items', 'Closer to three or four items', 'Unlimited, with proper training', 'Exactly one item at a time'],
        correctOptionIndex: 1,
      },
      {
        id: 'working-memory-q2',
        question: 'How does the passage say experts partly bypass the limits of working memory?',
        options: ['By ignoring the limit entirely', 'By using only long-term memory', 'By chunking familiar information into larger, denser units', 'By working on one task at a time only, never combining information'],
        correctOptionIndex: 2,
      },
      {
        id: 'working-memory-q3',
        question: 'Why does the passage say multitasking is particularly costly?',
        options: ['It uses too much long-term memory', 'It has no real cognitive cost', 'It only affects physical tasks', 'It repeatedly overloads the narrow working memory bottleneck'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'creative-thinking',
    label: 'Creative Thinking',
    sentences: [
      'Creativity often means connecting two ideas that nobody had previously placed side by side in quite that way.',
      'A relaxed mind generally generates more original ideas than one straining hard to be deliberately clever.',
      'The first idea that comes to mind is rarely the best one, so creative thinkers keep generating more.',
      'This process is sometimes called divergent thinking, deliberately producing many possible options before judging any of them.',
      'Judging ideas too early tends to quietly shut down the more unusual, less obvious ones.',
      'Constraints frequently sharpen creativity instead of limiting it, forcing genuinely inventive solutions within real boundaries.',
      'A blank page with zero constraints can actually feel more intimidating than a page with a few.',
      'Curiosity is the quiet engine behind almost every truly original idea a person eventually produces.',
      'Stepping away from a difficult problem often lets a creative solution surface on its own later.',
      'This phenomenon is sometimes called incubation, where the unconscious mind keeps working after conscious effort stops.',
      'Many well-known creative breakthroughs reportedly happened during a walk, a shower, or another unrelated activity entirely.',
      'Sleep also appears to play a meaningful role in this same incubation process.',
      'Combining unrelated fields is a particularly reliable source of genuinely fresh ideas.',
      'Someone trained in two different disciplines often notices connections that a single-discipline specialist would simply miss.',
      'Quantity of ideas, perhaps counterintuitively, tends to correlate strongly with eventual quality once enough options are generated.',
      'Generating twenty rough ideas, then selecting the strongest one, usually beats generating only a single polished attempt.',
      'Creative confidence grows through repeated practice, the same way any other skill does over time.',
      'Waiting passively for inspiration tends to produce far less than showing up and simply starting.',
    ],
    questions: [
      {
        id: 'creative-thinking-q1',
        question: 'According to the passage, what is "divergent thinking"?',
        options: ['Judging ideas as quickly as possible', 'Focusing on a single correct answer', 'Deliberately producing many possible options before judging any', 'Avoiding all constraints'],
        correctOptionIndex: 2,
      },
      {
        id: 'creative-thinking-q2',
        question: 'What does the passage call the phenomenon where stepping away from a problem lets a solution surface later?',
        options: ['Divergent thinking', 'Creative confidence', 'Constraint sharpening', 'Incubation'],
        correctOptionIndex: 3,
      },
      {
        id: 'creative-thinking-q3',
        question: 'According to the passage, what tends to correlate with eventual quality of ideas?',
        options: ['Working alone without input', 'Avoiding unrelated fields', 'The quantity of ideas generated', 'Judging each idea immediately'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'mental-discipline',
    label: 'Mental Discipline',
    sentences: [
      'Discipline is simply choosing what you want most over what you happen to want in this exact moment.',
      'Small, consistent choices, repeated daily, eventually outweigh a handful of dramatic, one-time efforts.',
      'Mental discipline feels genuinely difficult at first and quietly becomes far more automatic with enough honest repetition.',
      'The strongest habits are built on reliable systems, not on relying on motivation alone to show up.',
      'Motivation is an unreliable fuel; it fluctuates daily based on mood, sleep, and countless other factors.',
      'A good system keeps working even on the days motivation happens to be completely absent.',
      'Showing up specifically on the hard days is what separates real discipline from merely good intentions.',
      'Discipline is essentially a promise you consistently keep to yourself, one ordinary day at a time.',
      'Willpower alone, treated as a limited resource, tends to run out well before a difficult day actually ends.',
      'This is why removing friction from good choices matters more than most people initially assume.',
      'Preparing the night before, for example, removes an entire decision point from the more difficult morning.',
      'Environment quietly shapes discipline as much as, or more than, raw internal willpower ever does.',
      'A cluttered, distraction-filled environment silently taxes discipline throughout the entire day.',
      'A well-designed environment, by contrast, makes the disciplined choice the easiest one available.',
      'Discipline is not about punishing yourself for every single lapse along the way.',
      'It is about calmly returning to the system immediately after an inevitable lapse occurs.',
      'Perfection is not the actual goal; consistency over a long period of time is.',
      'Many disciplined people report that the hardest part is always the very first small step of any given day.',
    ],
    questions: [
      {
        id: 'mental-discipline-q1',
        question: 'According to the passage, why is motivation described as an "unreliable fuel"?',
        options: ['It never changes day to day', 'It is stronger than willpower', 'It fluctuates based on mood, sleep, and other factors', 'It only affects physical tasks'],
        correctOptionIndex: 2,
      },
      {
        id: 'mental-discipline-q2',
        question: 'What does the passage say preparing the night before helps with?',
        options: ['Sleep quality only', 'Long-term memory', 'Physical exercise', 'An entire decision point in the more difficult morning'],
        correctOptionIndex: 3,
      },
      {
        id: 'mental-discipline-q3',
        question: 'According to the passage, what is the actual goal instead of perfection?',
        options: ['Avoiding all lapses completely', 'Relying purely on motivation', 'Consistency over a long period of time', 'Working harder every single day without rest'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'growth-mindset',
    label: 'Growth Mindset',
    sentences: [
      'A growth mindset treats every failure as useful data rather than as some kind of final verdict on ability.',
      'Ability grows through effort and deliberate practice, not from some fixed trait a person was simply born with.',
      'Psychologists contrast this with a fixed mindset, the belief that talent and intelligence are essentially unchangeable.',
      'People with a fixed mindset tend to avoid challenges, fearing that failure would expose a permanent limitation.',
      'People with a growth mindset tend to seek out challenges, viewing failure as simply useful information instead.',
      'The single word yet quietly transforms a fixed limitation into a temporary, genuinely solvable challenge.',
      'Saying I cannot do this yet keeps the door open in a way that a flat no does not.',
      'Effective, well-directed effort, not raw talent alone, explains most of what people mistake for natural ability.',
      'Mistakes are simply the tuition paid on the way toward genuine skill and eventual mastery.',
      'Believing that improvement is possible is often the necessary first real step toward actually improving.',
      'This belief alone does not guarantee success, but its absence reliably guarantees giving up early.',
      'Praise focused on effort tends to build a growth mindset more effectively than praise focused on innate talent.',
      'Children praised mainly for being smart often avoid harder tasks later, fearing they might look less smart.',
      'Children praised mainly for effort tend to persist longer through genuinely difficult tasks.',
      'A growth mindset does not mean ignoring real limitations or pretending effort alone guarantees any outcome.',
      'It means treating current limitations as a temporary starting point rather than a permanent, fixed ceiling.',
      'Adopting this mindset is itself a skill, one that strengthens the more deliberately it is practiced.',
    ],
    questions: [
      {
        id: 'growth-mindset-q1',
        question: 'According to the passage, what does a "fixed mindset" believe about talent and intelligence?',
        options: ['That they can always be developed', "That they don't matter at all", 'That failure is always useful information', 'That they are essentially unchangeable'],
        correctOptionIndex: 3,
      },
      {
        id: 'growth-mindset-q2',
        question: 'What single word does the passage say transforms a fixed limitation into a temporary challenge?',
        options: ['"Never"', '"Always"', '"Maybe"', '"Yet"'],
        correctOptionIndex: 3,
      },
      {
        id: 'growth-mindset-q3',
        question: 'According to the passage, what happens to children praised mainly for being smart?',
        options: ['They seek out harder tasks', 'They persist longer through difficulty', 'They often avoid harder tasks, fearing they’ll look less smart', 'They develop a stronger growth mindset'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'learning-strategies',
    label: 'Learning Strategies',
    sentences: [
      'Testing yourself teaches more than passively rereading the exact same material a second or third time.',
      'This effect is well documented and is often simply called the testing effect by learning researchers.',
      'Explaining an idea in your own simple words quickly reveals what you actually understand versus merely recognize.',
      'If an explanation breaks down partway through, that exact breaking point shows precisely what to study next.',
      'Mixing related topics together during practice, rather than studying one in isolation, builds more flexible understanding.',
      'This approach is often called interleaving, and it feels harder in the moment than blocked practice.',
      'Despite feeling harder, interleaved practice consistently produces stronger long-term retention than simple, single-topic blocked practice.',
      'The best learners regularly and honestly ask themselves what they still do not understand yet.',
      'Reviewing material right before you would otherwise forget it strengthens memory more than reviewing far too early.',
      'This precise timing is the foundation behind spaced repetition systems used by many serious, deliberate learners.',
      'Learning sticks best when it is active, genuinely effortful, and honestly a little uncomfortable in the moment.',
      'Passive methods, like highlighting or simply rereading, feel productive but generally produce weaker, shallower results.',
      'Teaching a concept to someone else is one of the most effective tests of real understanding.',
      'If you cannot explain something simply, you likely do not yet understand it as deeply as you assumed.',
      'Curiosity-driven questions tend to produce deeper learning than material studied without any real personal interest.',
      'Sleep and spacing, not simply raw hours spent studying, are what convert short-term effort into long-term retention.',
      'Effective learning is less about total time spent and more about how that time is actually used.',
    ],
    questions: [
      {
        id: 'learning-strategies-q1',
        question: 'What does the passage call the effect where testing yourself teaches more than rereading?',
        options: ['Interleaving', 'Spaced repetition', 'Blocked practice', 'The testing effect'],
        correctOptionIndex: 3,
      },
      {
        id: 'learning-strategies-q2',
        question: 'According to the passage, what does interleaving mean?',
        options: ['Studying one topic in complete isolation', 'Rereading the same material repeatedly', 'Mixing related topics together during practice', 'Avoiding difficult material entirely'],
        correctOptionIndex: 2,
      },
      {
        id: 'learning-strategies-q3',
        question: 'According to the passage, what is one of the most effective tests of real understanding?',
        options: ['Rereading your notes', 'Highlighting key terms', 'Memorizing definitions word for word', 'Teaching the concept to someone else'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'attention-control',
    label: 'Attention Control',
    sentences: [
      'Attention is a genuinely limited resource, so guarding it carefully changes what a person can ultimately achieve.',
      'Every notification left unsilenced is one more small, constant tax on the attention actually available for real work.',
      'The mind wanders naturally and frequently, and simply noticing that wandering is itself a real, trainable skill.',
      'Choosing what to deliberately ignore is often more powerful than choosing what to actively focus on.',
      'Sustained attention is trainable, the same way any other cognitive skill can be strengthened through practice.',
      'A single clear priority protects attention far better than a long, sprawling, unranked list ever could.',
      'Environments filled with constant novelty, like endlessly scrolling feeds, quietly train attention to expect frequent, rapid switching.',
      'This training effect makes sustained focus on a single task feel noticeably harder over time.',
      'Reversing this trend takes deliberate, somewhat uncomfortable practice, similar to rebuilding any weakened muscle.',
      'Short, timed blocks of focused work, followed by a genuine break, help rebuild sustained attention gradually.',
      'Attention residue is the term researchers use for lingering thoughts about a previous task that quietly reduce focus on the current one.',
      'Fully finishing or deliberately pausing a task, rather than abruptly abandoning it, reduces this lingering residue.',
      'Multitasking, despite feeling productive, is largely an illusion; the brain actually switches rapidly rather than truly parallel processing.',
      'Each switch carries a real, measurable cost in both time and mental energy.',
      'Protecting blocks of single-tasked time is one of the most reliable ways to rebuild attention control.',
      'Attention control is not simply about willpower in any single moment.',
      'It is about deliberately designing an environment where sustained focus becomes the easier, more natural default.',
    ],
    questions: [
      {
        id: 'attention-control-q1',
        question: 'According to the passage, what is "attention residue"?',
        options: ['A permanent loss of attention capacity', 'The benefit gained from multitasking', 'A type of notification', 'Lingering thoughts about a previous task that reduce focus on the current one'],
        correctOptionIndex: 3,
      },
      {
        id: 'attention-control-q2',
        question: 'What does the passage say about multitasking?',
        options: ['It is true parallel processing with no cost', 'It improves sustained attention over time', 'It has no measurable cost', 'It is largely an illusion, involving rapid switching'],
        correctOptionIndex: 3,
      },
      {
        id: 'attention-control-q3',
        question: 'According to the passage, what helps reduce attention residue?',
        options: ['Abandoning tasks abruptly', 'Adding more notifications', 'Multitasking between several tasks at once', 'Fully finishing or deliberately pausing a task'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'brain-health',
    label: 'Brain Health',
    sentences: [
      'Quality sleep does more for clear thinking than almost any other single daily habit a person can adopt.',
      'During deep sleep stages, the brain actively clears out metabolic waste that accumulates throughout a normal waking day.',
      'Regular movement increases blood flow to the brain and noticeably sharpens focus within a short time.',
      'Even a brisk walk appears to measurably improve mood and mental clarity for a period afterward.',
      'A well rested mind solves problems that a tired, depleted mind simply cannot reach at all.',
      'Chronic sleep deprivation impairs memory, mood, and decision making in ways many people underestimate.',
      'Hydration and steady, balanced nutrition quietly support the mental clarity people often take entirely for granted.',
      'Even mild dehydration has been shown to measurably reduce concentration and short-term memory performance.',
      'Stress management protects cognitive performance just as directly as any dedicated study or practice technique does.',
      'Chronic, unmanaged stress shrinks certain brain regions associated with memory over extended periods of time.',
      'Taking real, deliberate breaks throughout the day actually improves total daily output, not merely comfort.',
      'Working through fatigue without rest often produces more errors than it saves in actual time.',
      "Social connection also appears to meaningfully support long-term brain health across a person's entire lifespan.",
      'Isolation, by contrast, is increasingly linked to measurable cognitive decline in long-term studies.',
      'Alcohol and certain other substances measurably impair the same memory consolidation processes that sleep normally supports.',
      'Simple, boring habits, sleep, movement, hydration, and stress management, consistently outperform exotic brain hacks.',
      'There is no substitute for these fundamentals, no matter how appealing a shortcut initially sounds.',
      'Protecting these basics daily is, in practice, the single highest-leverage investment in long-term brain health.',
    ],
    questions: [
      {
        id: 'brain-health-q1',
        question: 'According to the passage, what does the brain do during deep sleep stages?',
        options: ['Nothing measurable happens', 'It permanently stores all daily memories', 'It shuts down completely', 'It actively clears out metabolic waste'],
        correctOptionIndex: 3,
      },
      {
        id: 'brain-health-q2',
        question: 'According to the passage, what has even mild dehydration been shown to reduce?',
        options: ['Physical strength only', 'Long-term memory exclusively', 'Nothing measurable', 'Concentration and short-term memory performance'],
        correctOptionIndex: 3,
      },
      {
        id: 'brain-health-q3',
        question: 'What does the passage say consistently outperforms "exotic brain hacks"?',
        options: ['Expensive supplements', 'Working through fatigue without rest', 'Isolation and solitary focus', 'Simple habits like sleep, movement, hydration, and stress management'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'peak-performance',
    label: 'Peak Performance',
    sentences: [
      'Peak performance depends on genuine recovery just as much as it depends on focused, deliberate effort.',
      'Consistent preparation quietly turns high pressure moments into simply another familiar chance to perform well.',
      'The best performers rehearse their fundamentals long after they have technically already mastered the basics.',
      'This continued rehearsal keeps foundational skills reliable precisely when pressure is highest and mistakes are costliest.',
      'Sustainable performance comes from rhythm and rest, not from constant, unbroken maximum intensity every single day.',
      'Athletes who train at maximum intensity without adequate recovery frequently see performance decline, not improve, over time.',
      'This pattern is often called overtraining, and it applies well beyond purely physical, athletic performance.',
      'Mental and creative work follow a strikingly similar pattern, requiring genuine recovery between demanding stretches of effort.',
      'Small, measurable improvements, stacked consistently over time, eventually produce a genuinely elite overall result.',
      'This principle is sometimes summarized as the aggregation of marginal gains across many small areas.',
      'No single small improvement looks impressive alone, but their combined, compounded effect becomes substantial.',
      'Performing well under real pressure is a skill practiced calmly, long before the actual pressure ever arrives.',
      'Simulating pressure deliberately during practice, even imperfectly, builds genuine familiarity with the physical feeling of pressure itself.',
      'Elite performers across very different fields consistently describe preparation as the real, unglamorous source of their apparent calm.',
      'Confidence under pressure is rarely accidental; it is typically the visible result of extensive invisible preparation.',
      'Recovery is not the opposite of hard work, but rather a genuinely necessary part of it.',
      'Ignoring recovery does not actually produce more output; it typically produces more mistakes and eventual burnout instead.',
      'Respecting the full cycle of effort and recovery is what separates fleeting good performances from durable, repeatable excellence.',
    ],
    questions: [
      {
        id: 'peak-performance-q1',
        question: 'According to the passage, what happens to athletes who train at maximum intensity without adequate recovery?',
        options: ['Their performance steadily improves', 'They become immune to injury', 'Nothing measurable changes', 'Their performance often declines, a pattern called overtraining'],
        correctOptionIndex: 3,
      },
      {
        id: 'peak-performance-q2',
        question: 'What does the passage call the principle where small, stacked improvements produce a substantial combined result?',
        options: ['Overtraining', 'Desirable difficulty', 'Attention residue', 'The aggregation of marginal gains'],
        correctOptionIndex: 3,
      },
      {
        id: 'peak-performance-q3',
        question: 'According to the passage, what is confidence under pressure typically the result of?',
        options: ['Natural, untrained talent', 'Pure luck', 'Avoiding pressure entirely', 'Extensive invisible preparation'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'emotional-regulation',
    label: 'Emotional Regulation',
    sentences: [
      'A calm nervous system makes space for genuinely clearer thinking under real, immediate pressure.',
      'Naming an emotion accurately often reduces its grip within just a few seconds of doing so.',
      'Researchers call this effect affect labeling, and brain imaging shows it measurably calms certain emotional centers.',
      'Simply saying I feel anxious right now, silently or aloud, can noticeably reduce the intensity of that anxiety.',
      'Reacting more slowly rarely means caring less about the situation; it usually means choosing a wiser response.',
      'Emotional regulation is not suppression, which is pushing a feeling down without actually addressing it.',
      'Suppression tends to backfire, often making an emotion resurface later with even greater intensity.',
      'Regulation instead means choosing a considered, deliberate response instead of an automatic, reflexive reaction.',
      "A few slow, deliberate breaths can measurably shift the nervous system away from a stress response.",
      "This shift happens partly because slow exhalation directly activates the body's natural calming mechanism.",
      'Steady emotions support steady focus far more reliably than forced, performative positivity ever manages to.',
      'Emotional regulation is a skill, not a fixed personality trait some people simply lack entirely.',
      'Like any skill, it improves measurably with deliberate, repeated practice over time.',
      'Children can be explicitly taught these same regulation skills, and doing so predicts better outcomes later in life.',
      'Adults can learn these skills too, though old, ingrained patterns take a bit longer to shift.',
      'Journaling about a difficult emotion serves a similar function to naming it out loud.',
      'The simple act of translating a feeling into specific words appears to reduce its raw intensity.',
      'Emotional regulation ultimately supports better decisions, not the elimination of feeling itself, which is neither possible nor genuinely desirable.',
    ],
    questions: [
      {
        id: 'emotional-regulation-q1',
        question: 'What does the passage call the effect where naming an emotion accurately reduces its intensity?',
        options: ['Suppression', 'Desirable difficulty', 'Attention residue', 'Affect labeling'],
        correctOptionIndex: 3,
      },
      {
        id: 'emotional-regulation-q2',
        question: 'According to the passage, what is the problem with suppression as a strategy?',
        options: ['It works better than regulation', 'It has no effect on emotions at all', 'It is identical to regulation', 'It often makes an emotion resurface later with greater intensity'],
        correctOptionIndex: 3,
      },
      {
        id: 'emotional-regulation-q3',
        question: 'According to the passage, what does emotional regulation ultimately support?',
        options: ['The complete elimination of feeling', 'Suppressing all negative emotions', 'Reacting as quickly as possible', 'Better decisions, not the elimination of feeling'],
        correctOptionIndex: 3,
      },
    ],
  },
  {
    id: 'habit-formation',
    label: 'Habit Formation',
    sentences: [
      'Habits form fastest when the cue, the routine, and the reward stay perfectly consistent every single time.',
      'This three-part loop, cue, routine, reward, is the basic structural unit behind nearly every habit.',
      'Small habits compound quietly until, one day, the accumulated results become genuinely impossible to ignore.',
      'Identity change often happens through repeated action long before it happens through willpower or motivation alone.',
      'Deciding to become a reader matters less than the repeated act of actually reading daily.',
      "The easiest way to build a new habit is to make its very first step deliberately tiny.",
      'A tiny, almost trivially easy first step removes the initial resistance that usually kills a new habit early.',
      'Environment quietly shapes behavior more than willpower does on most ordinary, unremarkable days.',
      'Placing a desired cue somewhere highly visible makes the associated habit noticeably easier to actually start.',
      'Removing an undesired cue from easy reach makes the associated unwanted habit noticeably harder to continue.',
      'A habit repeated consistently, without exception, eventually becomes, in a real sense, simply who a person is.',
      'Missing a single day rarely breaks a habit permanently, but missing two days in a row often does.',
      'This is why protecting the streak, even imperfectly, matters more than any single perfect day.',
      'Habit stacking, attaching a new habit directly onto an already established one, leverages an existing, reliable cue.',
      'For example, doing ten pushups immediately after brushing your teeth borrows that already automatic morning cue.',
      'Rewards do not need to be large; a small, immediate one is often more effective than a large, delayed one.',
      'The brain responds more strongly to immediate feedback than to a distant, abstract future benefit.',
      'Building better habits is less about massive willpower and more about deliberately redesigning the immediate environment.',
    ],
    questions: [
      {
        id: 'habit-formation-q1',
        question: 'According to the passage, what three-part loop forms the basic structural unit behind nearly every habit?',
        options: ['Goal, action, result', 'Trigger, effort, outcome', 'Plan, execute, review', 'Cue, routine, reward'],
        correctOptionIndex: 3,
      },
      {
        id: 'habit-formation-q2',
        question: 'According to the passage, what is the easiest way to build a new habit?',
        options: ['Start with the hardest version immediately', 'Rely entirely on willpower', 'Wait for motivation to strike', 'Make its very first step deliberately tiny'],
        correctOptionIndex: 3,
      },
      {
        id: 'habit-formation-q3',
        question: 'According to the passage, what does "habit stacking" mean?',
        options: ['Doing many unrelated habits at random times', 'Removing all existing habits first', 'Rewarding yourself only after months of practice', 'Attaching a new habit onto an already established one'],
        correctOptionIndex: 3,
      },
    ],
  },
] as const

export const TOTAL_VERTICAL_CHUNK_SLIDING_CATEGORIES = VERTICAL_CHUNK_SLIDING_CATEGORIES.length

// Own-copy of dynamicChunkSlidingDataset.ts's splitIntoChunks — identical
// logic, kept as its own copy rather than a shared import per this app's
// established convention of not coupling sibling feature folders together
// for small self-contained pieces of logic.
export function splitIntoChunks(text: string, minSize = 3, maxSize = 4): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  const chunks: string[] = []
  let index = 0
  while (index < words.length) {
    const remaining = words.length - index
    let size = Math.min(maxSize, remaining)
    const leftoverAfter = remaining - size
    if (leftoverAfter > 0 && leftoverAfter < minSize) {
      size = remaining - minSize
    }
    if (size < minSize) {
      size = remaining
    }
    chunks.push(words.slice(index, index + size).join(' '))
    index += size
  }
  return chunks
}

// 2-3 words per chunk, deliberately narrower than the horizontal sibling's
// 3-4 (that one can rely on its frame's own horizontal clipping — a chunk
// sliding partway offscreen is the intended look there; here only the
// vertical axis moves, so every chunk must fit fully within the card's
// width on its own, including on a narrow phone screen).
export function buildUnitsForCategory(category: VerticalChunkSlidingCategory): readonly ReadingUnit[] {
  const chunks = category.sentences.flatMap((sentence) => splitIntoChunks(sentence, 2, 3))
  return chunks.map((text, index) => ({ id: `${category.id}-chunk-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-vertical-chunk-sliding-last-category'

// Client-only — reads/writes localStorage and calls Math.random(), so it
// must never run during SSR (would be non-deterministic even if it could).
// Callers invoke this exclusively from a useEffect, never from a lazy
// useState initializer, so the server-rendered 'settings' phase and the
// client's first paint always match before this ever runs.
export function pickSessionCategory(): VerticalChunkSlidingCategory {
  const categories = VERTICAL_CHUNK_SLIDING_CATEGORIES
  let lastId: string | null = null
  if (typeof window !== 'undefined') {
    try {
      lastId = localStorage.getItem(LAST_CATEGORY_STORAGE_KEY)
    } catch {
      lastId = null
    }
  }

  const pool = lastId === null ? categories : categories.filter((category) => category.id !== lastId)
  const eligiblePool = pool.length > 0 ? pool : categories
  const picked = eligiblePool[Math.floor(Math.random() * eligiblePool.length)] ?? categories[0]!

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LAST_CATEGORY_STORAGE_KEY, picked.id)
    } catch {
      // Best-effort only — a session still works perfectly without
      // non-repeat tracking, it just can't remember last time's pick.
    }
  }

  return picked
}

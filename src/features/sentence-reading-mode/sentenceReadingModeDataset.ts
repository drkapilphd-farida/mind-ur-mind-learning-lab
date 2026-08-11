import type { ReadingUnit } from '@/features/reading-engine/types'

// Sentence Reading Mode™ dataset — Quantum Speed Reading™ V2, Master Reading
// Engine mode #3. Deliberately its own folder/content, separate from the
// unrelated, protected V1 "Sentence Reading™" exercise (whose files live
// inline inside src/features/quantum-speed-reading/, e.g.
// sentenceDifficulty.ts/sentenceLibrary.ts) — no shared files, no route
// collision.
//
// 10/10 Overhaul — a genuine 22-category library of real, hand-authored,
// multi-sentence passages (no AI, no lorem ipsum), spanning deep
// neuroscience, cognitive mastery, breakthrough technology, history
// secrets, and psychological hacks. Each category is a ~270-320 word deep
// dive (verified in this file's own test suite), not a handful of
// disconnected aphorisms, so a full read at target pace naturally runs
// 60-75 seconds — followed by exactly 3 real comprehension questions per
// category, each answerable only by having actually read that category's
// own passage. Each ReadingUnit is one COMPLETE sentence — unlike Phrase
// Reading Mode, content isn't chunked further.
export type SentenceReadingModeQuizQuestion = {
  id: string
  question: string
  options: readonly string[]
  correctOptionIndex: number
}

export type SentenceReadingModeCategory = {
  id: string
  label: string
  sentences: readonly string[]
  questions: readonly SentenceReadingModeQuizQuestion[]
}

export const SENTENCE_READING_MODE_CATEGORIES: readonly SentenceReadingModeCategory[] = [
  {
    id: 'neural-plasticity',
    label: 'The Plastic Brain',
    sentences: [
      'The brain was once believed to be fixed after childhood, incapable of meaningfully rewiring itself in adulthood.',
      'Modern neuroscience overturned that assumption entirely, revealing a brain that keeps reshaping itself across an entire lifetime.',
      'This capacity for change is called neuroplasticity, and it operates at every scale from single synapses to entire brain regions.',
      'Each time a skill is practiced, the neurons involved strengthen their connections and fire together more efficiently.',
      'Neurons that repeatedly fire together gradually wire together, a principle first proposed by psychologist Donald Hebb.',
      "London taxi drivers who memorize the city's tangled streets develop a measurably larger hippocampus than average.",
      'Musicians who train for years show enlarged brain regions devoted to the specific fingers they use most.',
      'Even losing a sense can trigger dramatic plasticity, as blind individuals often repurpose visual cortex for touch and hearing.',
      "Stroke patients can sometimes recover lost function as healthy brain regions gradually take over damaged ones' former duties.",
      'Plasticity is strongest early in life, but it never fully disappears, which is why adults can still learn new skills.',
      'Sleep plays a crucial supporting role, helping the brain consolidate the physical changes that practice sets in motion.',
      'Stress and chronic inactivity can work against plasticity, subtly shrinking connections that go unused for too long.',
      'Novelty appears to be a key trigger, since the brain adapts most readily when facing something genuinely unfamiliar.',
      'Understanding neuroplasticity has reshaped how therapists treat injury, how schools teach children, and how adults approach learning.',
      'The lesson is remarkably hopeful: the brain you have today is not the brain you are stuck with forever.',
    ],
    questions: [
      {
        id: 'neural-plasticity-q1',
        question: 'According to the passage, what did scientists once wrongly believe about the adult brain?',
        options: [
          'That it was fixed and incapable of meaningfully rewiring itself',
          'That it grew new neurons every day',
          'That it was smaller than a child’s brain',
          'That it could not process new information at all',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'neural-plasticity-q2',
        question: 'What did researchers find about London taxi drivers?',
        options: [
          'They had smaller hippocampi than average',
          'They developed a measurably larger hippocampus',
          'They lost long-term memory ability',
          'They showed no brain changes at all',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'neural-plasticity-q3',
        question: "Per the passage, what plays a crucial supporting role in consolidating plasticity's physical changes?",
        options: ['Caffeine', 'Stress', 'Sleep', 'Silence'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'memory-consolidation',
    label: 'How Memories Form',
    sentences: [
      'A memory does not arrive complete the moment an event happens; it is built gradually over hours and even years.',
      'Immediately after an experience, a fragile trace forms in the hippocampus, a seahorse-shaped structure deep in the brain.',
      'This early trace is unstable and can be disrupted or lost entirely if it is not properly reinforced afterward.',
      "During sleep, particularly deep slow-wave sleep, the brain replays fragments of the day's experiences at high speed.",
      'That replay appears to transfer information gradually from the hippocampus into the cortex for longer-term storage.',
      'The process is called systems consolidation, and it can continue quietly reshaping a memory for years after the event.',
      'Emotionally charged experiences tend to be remembered more vividly, partly because the amygdala tags them as especially important.',
      'This is why people often recall exactly where they were during a major shocking event, yet forget an ordinary Tuesday.',
      'Retrieval itself can subtly alter a memory, since recalling an event makes it briefly unstable and open to change again.',
      'This means every time a memory is retold, it can shift slightly, blending fact with later reinterpretation.',
      'Forgetting is not always a flaw; it may help the brain discard irrelevant detail so key patterns stand out more clearly.',
      'Chronic sleep deprivation measurably impairs consolidation, leaving experiences less securely stored no matter how vivid they felt at the time.',
      'Spaced repetition exploits this system directly, revisiting information just as it starts to fade to strengthen its storage.',
      'Understanding consolidation has transformed education, therapy for trauma, and even legal debates over the reliability of eyewitness testimony.',
      'Researchers now believe there is no single moment a memory becomes "permanent" — it remains negotiable for a surprisingly long time.',
      'This ongoing malleability is unsettling to some, but it also means memories can be gently reshaped through healthy processing over time.',
    ],
    questions: [
      {
        id: 'memory-consolidation-q1',
        question: 'Where does an early, fragile memory trace first form, according to the passage?',
        options: ['The cortex', 'The hippocampus', 'The amygdala', 'The cerebellum'],
        correctOptionIndex: 1,
      },
      {
        id: 'memory-consolidation-q2',
        question: 'What happens to a memory during deep slow-wave sleep, per the passage?',
        options: [
          'It is permanently deleted',
          "The brain replays fragments of the day's experiences",
          'It moves to the amygdala only',
          'It stops being processed entirely',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'memory-consolidation-q3',
        question: 'According to the passage, what can happen every time a memory is retold?',
        options: [
          'It becomes instantly false',
          'It is copied perfectly with no change',
          'It can shift slightly, blending fact with later reinterpretation',
          'It disappears from long-term storage',
        ],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'the-sleeping-brain',
    label: 'The Sleeping Brain',
    sentences: [
      'Sleep was once dismissed as simple downtime, a period when the brain quietly switched itself off until morning.',
      'Modern sleep science reveals something closer to the opposite: a night of sleep is an intensely active, highly organized process.',
      'The brain cycles through distinct stages, moving between light sleep, deep slow-wave sleep, and vivid REM sleep roughly every ninety minutes.',
      'Deep slow-wave sleep is when the body repairs tissue, strengthens the immune system, and releases key growth hormones.',
      'REM sleep, named for the rapid eye movements that mark it, is when most vivid dreaming and emotional processing occur.',
      'During REM, the brain becomes almost as electrically active as when fully awake, even though the body stays essentially paralyzed.',
      'That temporary paralysis prevents people from physically acting out the vivid scenarios their dreaming mind is generating.',
      'Sleep also appears to flush waste from the brain through a recently discovered system called the glymphatic pathway.',
      'This nightly cleanup clears out metabolic byproducts that, left to accumulate, are linked to neurodegenerative disease over time.',
      "Chronic sleep deprivation impairs attention, mood regulation, and decision-making within as little as a single poor night.",
      'Even modest, repeated sleep loss can measurably lower reaction time to a level comparable with mild alcohol intoxication.',
      "Teenagers have a naturally later circadian rhythm, which is part of why early school start times fight against their biology.",
      'Consistent sleep and wake times appear to matter nearly as much as total sleep duration for how rested a person feels.',
      "Far from being wasted time, a good night's sleep is one of the most productive things the brain ever does.",
    ],
    questions: [
      {
        id: 'the-sleeping-brain-q1',
        question: 'What is the glymphatic pathway responsible for, according to the passage?',
        options: ['Generating dreams', 'Flushing waste from the brain during sleep', 'Controlling eye movement', 'Storing long-term memories'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-sleeping-brain-q2',
        question: 'During REM sleep, what happens to the body even as the brain becomes highly active?',
        options: ['It wakes up fully', 'It stays essentially paralyzed', 'It enters deep slow-wave sleep', 'Its temperature rises sharply'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-sleeping-brain-q3',
        question: 'Per the passage, repeated modest sleep loss can lower reaction time to a level comparable with what?',
        options: ['Full alertness', 'Mild alcohol intoxication', 'A caffeine boost', 'Deep meditation'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'neurotransmitters-mood',
    label: 'Chemistry of Mood',
    sentences: [
      'Mood is often described in poetic terms, but underneath every feeling lies a very real chemical conversation between neurons.',
      'Neurotransmitters are the molecules that carry these messages, crossing tiny gaps called synapses to influence the next cell in line.',
      'Dopamine is frequently labeled the "reward chemical," though its true role is closer to motivation than pure pleasure itself.',
      'It rises in anticipation of a reward, driving the pursuit of a goal even before that goal is actually reached.',
      'Serotonin, by contrast, is closely tied to mood stability, and many antidepressant medications work by increasing its availability.',
      'Most serotonin in the body is actually produced in the gut, which has led researchers to study the gut-brain connection closely.',
      'Norepinephrine sharpens alertness and focus, surging during moments of stress to prepare the body for quick action.',
      'Oxytocin, sometimes called the bonding hormone, rises during physical touch, childbirth, and moments of genuine social trust.',
      "GABA acts as the brain's primary calming signal, quieting overactive neural circuits and easing anxiety when it functions properly.",
      'These chemicals rarely act alone; mood almost always emerges from a shifting balance among several systems working together.',
      'Diet, exercise, sunlight exposure, and sleep can all meaningfully influence how these neurotransmitter systems behave day to day.',
      'Chronic stress can deplete or dysregulate several of these systems at once, which is part of why prolonged stress often erodes mood.',
      'Understanding this chemistry does not reduce emotion to something less real; it simply reveals the physical mechanism underneath it.',
      'Modern treatments increasingly target these specific pathways, aiming to restore balance rather than simply numbing how a person feels.',
    ],
    questions: [
      {
        id: 'neurotransmitters-mood-q1',
        question: "According to the passage, dopamine's true role is closer to what than pure pleasure?",
        options: ['Memory storage', 'Motivation', 'Muscle control', 'Digestion'],
        correctOptionIndex: 1,
      },
      {
        id: 'neurotransmitters-mood-q2',
        question: "Where is most of the body's serotonin actually produced, per the passage?",
        options: ["The brain's cortex", 'The heart', 'The gut', 'The liver'],
        correctOptionIndex: 2,
      },
      {
        id: 'neurotransmitters-mood-q3',
        question: 'What does GABA do, according to the passage?',
        options: [
          'It sharpens alertness during stress',
          "It acts as the brain's primary calming signal",
          'It triggers reward anticipation',
          'It controls eye movement during sleep',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-social-brain',
    label: 'The Social Brain',
    sentences: [
      'Humans are an intensely social species, and a surprising amount of brain architecture appears dedicated to managing relationships.',
      'Some researchers argue that navigating complex social groups, not tool use, was the primary pressure that grew the human brain so large.',
      'This idea is often called the social brain hypothesis, linking group size directly to relative brain size across primate species.',
      'Mirror neurons, discovered partly by accident in the 1990s, fire both when performing an action and when watching someone else perform it.',
      "This mirroring system is thought to support empathy, letting the brain simulate another person's experience almost as if it were its own.",
      'Social rejection activates some of the same brain regions involved in processing genuine physical pain.',
      'This overlap may explain why heartbreak and social exclusion can feel viscerally, not just metaphorically, painful.',
      'The brain also tracks social status constantly, often below conscious awareness, adjusting behavior based on perceived hierarchy.',
      'Oxytocin plays a central role here too, strengthening trust and bonding during cooperative or intimate interactions.',
      'Loneliness, meanwhile, appears to function like a biological alarm signal, similar to hunger, nudging a person back toward connection.',
      'Chronic loneliness carries measurable health risks, with some studies comparing its impact to smoking a moderate number of cigarettes daily.',
      'Face-to-face interaction activates broader brain networks than text-based communication, involving tone, posture, and subtle expression all at once.',
      'Even brief, low-stakes social contact, like a short conversation with a stranger, can measurably lift mood for hours afterward.',
      'The social brain suggests that connection is not a luxury layered on top of survival, but part of survival itself.',
    ],
    questions: [
      {
        id: 'the-social-brain-q1',
        question: 'What does the social brain hypothesis link directly to relative brain size across primate species?',
        options: ['Tool use', 'Group size', 'Diet variety', 'Hunting range'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-social-brain-q2',
        question: 'What do mirror neurons do, according to the passage?',
        options: [
          'They fire only during sleep',
          'They fire both when performing an action and when watching someone else perform it',
          'They control blood pressure',
          'They store long-term facts',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'the-social-brain-q3',
        question: 'Per the passage, what does social rejection activate?',
        options: [
          'The same brain regions involved in processing genuine physical pain',
          'Only visual processing regions',
          'The region responsible for hunger',
          'No measurable brain activity',
        ],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'deliberate-practice',
    label: 'The Science of Deliberate Practice',
    sentences: [
      'For decades, popular culture credited great achievement almost entirely to raw, inborn talent.',
      'Research into expert performance told a more complicated story, centered on a specific kind of effortful practice.',
      'Psychologist Anders Ericsson called this deliberate practice, distinguishing it sharply from simple repetition or casual experience.',
      "Deliberate practice requires working just beyond a person's current ability, in a zone that feels genuinely uncomfortable.",
      'It demands clear, specific goals rather than a vague intention to simply "get better" at something.',
      'Immediate, honest feedback is essential, since without it, mistakes can be practiced and reinforced just as easily as good technique.',
      'Full concentration matters enormously; distracted repetition builds far weaker skill than focused, deliberate attention does.',
      'Chess grandmasters, elite musicians, and top athletes all show strikingly similar patterns of years of this specific kind of practice.',
      'The often-cited "ten thousand hours" figure oversimplifies the original research, since quality of practice matters as much as raw quantity.',
      'Two people can log the same number of hours and end up with wildly different skill, depending on how deliberately they practiced.',
      'Mental representations, the internal models experts build of their domain, improve steadily through this kind of demanding, structured practice.',
      'These refined representations let experts notice patterns and errors that remain invisible to a less experienced eye.',
      'Coaches and teachers matter because they can supply the structure, feedback, and pacing that self-directed practice often lacks.',
      'Deliberate practice is effortful by design; comfort and mastery, in this framework, rarely grow from the exact same activity.',
      'That discomfort is not a warning sign to avoid, but often the clearest signal that real, lasting growth is underway.',
    ],
    questions: [
      {
        id: 'deliberate-practice-q1',
        question: "Who coined the term 'deliberate practice,' according to the passage?",
        options: ['Anders Ericsson', 'A chess grandmaster', 'A popular culture critic', 'An elite musician'],
        correctOptionIndex: 0,
      },
      {
        id: 'deliberate-practice-q2',
        question: "What does the passage say the widely cited 'ten thousand hours' figure oversimplifies?",
        options: [
          'How much talent matters',
          'That quality of practice matters as much as raw quantity',
          'How long careers typically last',
          'The role of coaches',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'deliberate-practice-q3',
        question: 'Per the passage, what is essential to deliberate practice besides working beyond current ability?',
        options: ['Comfort and relaxation', 'Immediate, honest feedback', 'Long, unstructured free time', 'Working purely from memory'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'cognitive-biases',
    label: 'Blind Spots of the Mind',
    sentences: [
      'The human brain evolved for fast survival decisions, not perfectly rational analysis, and that legacy still shapes how it thinks today.',
      'Cognitive biases are the predictable mental shortcuts that result, quietly distorting judgment in specific, repeatable ways.',
      'Confirmation bias leads people to notice and remember information that supports what they already believe, while overlooking evidence that contradicts it.',
      'Anchoring bias means an early piece of information, even an irrelevant number, can heavily influence a later judgment or estimate.',
      'The availability heuristic causes people to judge how common something is by how easily examples come to mind.',
      'This is part of why vivid, dramatic risks, like plane crashes, often feel more threatening than statistically larger everyday risks.',
      'Hindsight bias makes past events feel more predictable after the fact than they ever actually were beforehand.',
      'The Dunning-Kruger effect describes how people with limited knowledge in an area can overestimate their own competence in it.',
      'Loss aversion causes losses to feel roughly twice as painful as equivalent gains feel pleasurable, skewing many financial decisions.',
      'The sunk cost fallacy pushes people to keep investing in a failing plan simply because they have already invested so much.',
      'None of these biases mean the brain is broken; each one likely offered a genuine survival advantage at some point in human history.',
      'Awareness alone rarely eliminates a bias completely, but it can create a helpful pause before an important decision.',
      'Structured decision processes, like deliberately seeking disconfirming evidence, can partially offset biases that willpower alone cannot fully overcome.',
      'Understanding these blind spots is less about achieving perfect rationality and more about making wiser choices despite being human.',
    ],
    questions: [
      {
        id: 'cognitive-biases-q1',
        question: 'What does confirmation bias cause people to do, according to the passage?',
        options: [
          'Notice and remember information that supports what they already believe',
          'Forget everything they read',
          'Always choose the newest information',
          'Ignore all evidence equally',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'cognitive-biases-q2',
        question: 'Per the passage, roughly how much more painful do losses feel compared to equivalent gains?',
        options: ['Exactly the same', 'Half as painful', 'Roughly twice as painful', 'Ten times as painful'],
        correctOptionIndex: 2,
      },
      {
        id: 'cognitive-biases-q3',
        question: 'What does the Dunning-Kruger effect describe, according to the passage?',
        options: [
          'Experts underestimating their skill',
          'People with limited knowledge overestimating their own competence',
          'A fear of flying',
          'The tendency to remember dramatic events',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'flow-state',
    label: 'Entering Flow',
    sentences: [
      'Psychologist Mihaly Csikszentmihalyi spent decades studying moments when people become so absorbed in an activity that time itself seems to disappear.',
      'He named this experience flow, and found it reported across wildly different pursuits, from rock climbing to surgery to composing music.',
      "Flow tends to emerge in a specific sweet spot, where a task's difficulty closely matches a person's current skill level.",
      'Too easy, and the mind wanders into boredom; too hard, and it tips instead into anxiety and frustration.',
      'Clear, immediate goals help trigger flow, since the mind can focus fully without pausing to wonder what to do next.',
      'Fast, direct feedback matters too, letting a person continuously adjust their actions in real time as the task unfolds.',
      'During flow, self-consciousness seems to fade, and the usual internal narrator quiets down considerably.',
      'Many people describe flow as deeply rewarding on its own, independent of any external prize waiting at the end.',
      'Brain imaging suggests flow may involve temporarily reduced activity in the prefrontal cortex, an effect researchers call transient hypofrontality.',
      'That dampened self-monitoring may be exactly what allows performance to feel so effortless and automatic in the moment.',
      'Flow is not permanent or guaranteed; even experts slip in and out of it during a single session.',
      'Deliberately removing distractions, silencing notifications, and choosing an appropriately challenging task can all make flow more likely to occur.',
      'Some organizations now design work deliberately around flow triggers, believing it boosts both output and genuine job satisfaction.',
      'Chasing flow directly rarely works; it tends to arrive as a byproduct of full engagement rather than a goal pursued head-on.',
    ],
    questions: [
      {
        id: 'flow-state-q1',
        question: 'According to the passage, when does flow tend to emerge?',
        options: [
          'When a task is far too easy',
          "When a task's difficulty closely matches a person's current skill level",
          'Only during physical sports',
          'When there is no goal at all',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'flow-state-q2',
        question: "What effect do researchers call 'transient hypofrontality,' per the passage?",
        options: [
          'Increased anxiety',
          'Temporarily reduced activity in the prefrontal cortex',
          'A permanent brain change',
          'Faster reaction time only',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'flow-state-q3',
        question: 'Per the passage, what tends to happen if someone chases flow directly as a goal?',
        options: [
          'It arrives instantly',
          'It rarely works, since flow tends to arrive as a byproduct of full engagement',
          'It always backfires into boredom',
          'It only happens during sleep',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'decision-fatigue',
    label: 'Decision Fatigue',
    sentences: [
      'Every decision, no matter how small, appears to draw on a limited pool of mental resources.',
      'As that pool depletes across a day, the quality of subsequent decisions tends to quietly decline, a pattern researchers call decision fatigue.',
      'One widely cited study of parole board judges found favorable rulings dropped sharply as the morning wore on, then rebounded after a break.',
      'Fatigued decision-makers often default to the easiest option available, whether that means saying no or simply maintaining the status quo.',
      'This is part of why grocery shopping while hungry and tired so often leads to impulsive, poorly considered purchases.',
      'Some highly successful people deliberately simplify low-stakes choices, wearing similar outfits daily to preserve mental energy for bigger decisions.',
      'Willpower and decision-making appear to draw from overlapping resources, so resisting temptation earlier can leave less capacity for choices later.',
      'Short breaks, food, and rest can meaningfully restore decision-making capacity, though the exact mechanism remains debated among researchers.',
      'Scheduling important decisions earlier in the day, before fatigue accumulates, is one practical strategy many professionals now use deliberately.',
      'Reducing the sheer number of daily decisions, through routines and defaults, can help preserve capacity for the choices that matter most.',
      'Decision fatigue does not mean willpower is fake; it suggests instead that willpower behaves more like a finite, renewable resource.',
      'Recognizing the pattern in oneself can be the first step toward designing a day that protects decision-making when it counts.',
      'Environments filled with constant minor choices, like endless notifications, may quietly erode focus long before a person even notices feeling tired.',
      'Simplicity, in this light, is not laziness but a deliberate strategy for preserving a genuinely limited cognitive resource.',
    ],
    questions: [
      {
        id: 'decision-fatigue-q1',
        question: 'What did the study of parole board judges find, according to the passage?',
        options: [
          'Favorable rulings stayed constant all day',
          'Favorable rulings dropped sharply as the morning wore on, then rebounded after a break',
          'Judges never granted parole in the morning',
          'Breaks made no difference at all',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'decision-fatigue-q2',
        question: 'Why do some successful people wear similar outfits daily, per the passage?',
        options: [
          'To save money',
          'To preserve mental energy for bigger decisions',
          'Because of a dress code',
          'To avoid ever choosing clothes again',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'decision-fatigue-q3',
        question: 'What does decision fatigue suggest about willpower, according to the passage?',
        options: [
          'It is fake and does not exist',
          'It behaves like a finite, renewable resource',
          'It never changes throughout the day',
          'It only applies to food choices',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'metacognition',
    label: 'Thinking About Thinking',
    sentences: [
      "Metacognition is, quite simply, thinking about one's own thinking, and it may be one of the most powerful learning tools available.",
      'It involves stepping back to notice not just what you know, but how confident you genuinely are in that knowledge.',
      'Students who accurately judge what they do and do not understand tend to study far more efficiently than those who cannot.',
      'A common trap is the illusion of fluency, where rereading familiar material feels like learning even though little new knowledge sticks.',
      'Highlighting a textbook, for instance, often creates a false sense of mastery without meaningfully strengthening long-term memory.',
      'Actively testing oneself, by contrast, forces a much more honest and accurate check of what has actually been retained.',
      'Strong metacognitive skill helps a person notice confusion early, before it quietly compounds into a much larger misunderstanding.',
      "It also supports better planning, since accurately estimating how long a task will take depends on honestly knowing one's own limits.",
      'Experts tend to have well-calibrated metacognition within their specialty, while often being surprisingly overconfident outside of it.',
      'Teaching metacognitive strategies directly, like asking students to predict their own quiz scores before taking them, can measurably improve learning outcomes.',
      "Journaling and reflection are simple, low-tech ways to strengthen this skill, creating space to notice patterns in one's own thinking.",
      'Metacognition also plays a quiet role in emotional regulation, helping a person notice a spiraling thought before it fully takes hold.',
      'Unlike raw intelligence, metacognitive skill can be deliberately trained and strengthened at almost any age.',
      "In a sense, metacognition is the mind's own internal quality-control system, quietly checking its own work.",
    ],
    questions: [
      {
        id: 'metacognition-q1',
        question: "What is the 'illusion of fluency,' according to the passage?",
        options: [
          'A memory disorder',
          'Rereading familiar material feeling like learning even though little new knowledge sticks',
          'A type of test anxiety',
          'An inability to read quickly',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'metacognition-q2',
        question: "Per the passage, how do experts' metacognitive skills typically compare inside versus outside their specialty?",
        options: [
          'Equally poor in both areas',
          'Well-calibrated within their specialty, but often overconfident outside it',
          'Always overconfident everywhere',
          'Always underconfident everywhere',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'metacognition-q3',
        question: 'According to the passage, unlike raw intelligence, what can metacognitive skill be at almost any age?',
        options: ['Ignored safely', 'Deliberately trained and strengthened', 'Permanently fixed', 'Measured only in children'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'quantum-computing-breakthrough',
    label: 'The Quantum Computing Race',
    sentences: [
      'Classical computers store information as bits, each one firmly set to either a zero or a one.',
      'Quantum computers instead use qubits, which can exist in a blend of both states simultaneously through a property called superposition.',
      'This allows a quantum computer to explore many possible solutions to a problem at once, rather than checking them one by one.',
      'A second property, entanglement, links qubits together so that measuring one instantly affects the state of its partner, however far apart they are.',
      'These properties make quantum machines especially promising for problems classical computers handle poorly, like simulating molecules or breaking certain encryption schemes.',
      'Building a stable quantum computer is fiendishly difficult, since qubits are extremely sensitive to heat, vibration, and stray electromagnetic noise.',
      'Most current quantum processors must be cooled to temperatures colder than deep space to function reliably at all.',
      'Errors creep in constantly, and correcting them requires many physical qubits working together to represent one reliable "logical" qubit.',
      'In 2019, researchers claimed a milestone called quantum supremacy, where a quantum machine solved a narrow task faster than any classical supercomputer could.',
      'Critics quickly noted the task itself had little practical use, underscoring how far the field remains from everyday usefulness.',
      'Pharmaceutical companies are watching closely, since quantum simulation could dramatically speed up modeling how new drug molecules behave.',
      'Cryptographers are watching just as closely, racing to develop encryption that would remain secure even against a future full-scale quantum computer.',
      'Despite the excitement, most experts expect quantum computers to complement classical machines rather than replace them for everyday computing tasks.',
      'The race remains as much about physics and engineering as it is about writing genuinely new kinds of algorithms.',
    ],
    questions: [
      {
        id: 'quantum-computing-breakthrough-q1',
        question: 'What property allows a qubit to exist in a blend of both states simultaneously, per the passage?',
        options: ['Entanglement', 'Superposition', 'Supremacy', 'Correction'],
        correctOptionIndex: 1,
      },
      {
        id: 'quantum-computing-breakthrough-q2',
        question: "What did critics point out about the 2019 'quantum supremacy' claim, according to the passage?",
        options: [
          'It was faked entirely',
          'The task itself had little practical use',
          'It used a classical computer only',
          'It proved quantum computers were already obsolete',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'quantum-computing-breakthrough-q3',
        question: 'According to the passage, what temperature must most current quantum processors be cooled to?',
        options: ['Room temperature', 'Slightly below freezing', 'Colder than deep space', 'The temperature of the sun'],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'crispr-gene-editing',
    label: 'Editing the Code of Life',
    sentences: [
      "For most of history, altering an organism's genetic code precisely was simply impossible; genes could only be studied, never rewritten with real precision.",
      'CRISPR changed that almost overnight, offering a tool that could cut and edit DNA at a specific, chosen location.',
      'The system was adapted from a natural defense mechanism bacteria use to fight off invading viruses.',
      'Bacteria store snippets of viral DNA and use a protein called Cas9 as molecular scissors to destroy matching invaders on sight.',
      'Scientists realized this same cut-and-match system could be reprogrammed to target nearly any sequence within a genome.',
      'A guide molecule directs Cas9 to the exact spot in the DNA that needs editing, like a GPS coordinate for the genome.',
      "Once Cas9 makes its cut, the cell's own repair machinery can be nudged to insert, delete, or correct a specific stretch of code.",
      'The technique is dramatically cheaper and faster than earlier gene-editing methods, putting it within reach of many more research labs.',
      'CRISPR has already been used to correct the mutation behind sickle cell disease in several patients, restoring healthy blood cell production.',
      'Agricultural researchers are using it to develop crops that resist disease, drought, and pests without introducing foreign genetic material.',
      'The technology also raises serious ethical questions, especially around editing embryos in ways that could be passed to future generations.',
      "In 2018, a scientist's claim to have edited human embryos sparked global outrage and led to new international guidelines.",
      'Off-target edits, where the tool cuts an unintended location, remain a real safety concern researchers are still working to minimize.',
      "CRISPR's discoverers won the Nobel Prize in Chemistry in 2020, recognition of how quickly the tool reshaped modern biology.",
    ],
    questions: [
      {
        id: 'crispr-gene-editing-q1',
        question: 'What natural system was CRISPR adapted from, according to the passage?',
        options: [
          'A human immune response',
          'A defense mechanism bacteria use against viruses',
          "A plant's drought resistance",
          "A virus's own replication process",
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'crispr-gene-editing-q2',
        question: 'What has CRISPR already been used to correct in several patients, per the passage?',
        options: ['The common cold', 'The mutation behind sickle cell disease', 'Broken bones', 'Vision loss'],
        correctOptionIndex: 1,
      },
      {
        id: 'crispr-gene-editing-q3',
        question: "According to the passage, what did CRISPR's discoverers win in 2020?",
        options: ['The Nobel Prize in Physics', 'The Nobel Prize in Chemistry', 'A Turing Award', 'No formal recognition'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'brain-computer-interfaces',
    label: 'Machines That Read Minds',
    sentences: [
      "A brain-computer interface creates a direct communication pathway between the brain's electrical activity and an external device.",
      'Early versions relied on electrodes placed on the scalp, picking up faint electrical signals through the skull and skin.',
      'These non-invasive systems are safe and easy to use, but the signal they capture is relatively noisy and imprecise.',
      'Implanted systems, placed directly on or inside the brain, capture far cleaner signals at the cost of invasive surgery.',
      'Some implants have already allowed paralyzed patients to move a robotic arm or a computer cursor using thought alone.',
      'Others have restored a rough form of communication to people who lost the ability to speak after a stroke or injury.',
      'The brain does not naturally think in the language a computer understands, so decoding intention requires sophisticated pattern-recognition software.',
      "Machine learning models are trained to recognize the specific neural patterns associated with an individual's intended movement or word.",
      'Over time, some systems adapt to the user just as the user adapts to the system, a genuinely two-way learning process.',
      'Several companies are now racing to develop implants ambitious enough to restore vision or even enhance healthy cognitive function.',
      'Ethical questions loom large, particularly around mental privacy, since a device reading neural activity edges close to reading raw thought itself.',
      'Long-term safety remains uncertain too, since implanted electrodes can trigger scar tissue that gradually degrades signal quality over years.',
      'Despite these hurdles, brain-computer interfaces represent one of the most direct bridges ever built between biological and digital systems.',
      'What once belonged strictly to science fiction is now, in early and limited form, a genuine and active field of medicine.',
    ],
    questions: [
      {
        id: 'brain-computer-interfaces-q1',
        question: 'According to the passage, what is the tradeoff of implanted brain-computer interface systems?',
        options: [
          'They are safer but less accurate than scalp electrodes',
          'They capture cleaner signals at the cost of invasive surgery',
          'They require no software at all',
          'They only work on healthy volunteers',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'brain-computer-interfaces-q2',
        question: 'What have some implants already allowed paralyzed patients to do, per the passage?',
        options: [
          'Regrow damaged nerves',
          'Move a robotic arm or computer cursor using thought alone',
          'Instantly cure their paralysis',
          'See in complete darkness',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'brain-computer-interfaces-q3',
        question: 'Per the passage, what can implanted electrodes trigger over years that degrades signal quality?',
        options: ['Scar tissue', 'Improved conductivity', 'Faster healing', 'No change at all'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'renewable-energy-revolution',
    label: 'The Renewable Energy Revolution',
    sentences: [
      "For over a century, fossil fuels powered the overwhelming majority of the world's homes, factories, and vehicles.",
      'That balance is now shifting faster than most forecasters predicted even a decade ago.',
      'Solar panel costs have fallen by roughly ninety percent over the past ten years, driven by manufacturing scale and steady technical improvement.',
      'Wind turbines have grown dramatically taller and more efficient, capturing stronger, steadier winds found at greater heights above the ground.',
      'In many regions, new solar and wind installations are now cheaper than building a new fossil fuel power plant from scratch.',
      'The biggest remaining challenge is not generation but storage, since the sun does not always shine and the wind does not always blow.',
      'Battery technology has improved rapidly, but grid-scale storage capable of covering days of low renewable output remains genuinely difficult and expensive.',
      'Some regions are experimenting with pumped hydro storage, using surplus renewable power to pump water uphill for release later as electricity.',
      'Green hydrogen, produced by splitting water using renewable electricity, is being explored as a way to store and transport clean energy.',
      'Electric vehicles are accelerating this shift too, since a growing fleet of cars can double as flexible, distributed battery storage for the grid.',
      'Aging power grids, originally designed around a handful of large centralized plants, often struggle to handle many small, scattered renewable sources.',
      'Upgrading this infrastructure is proving just as important, and just as costly, as building the renewable generation itself.',
      'Critics point out that mining materials for batteries and panels carries its own real environmental and human costs.',
      'Even accounting for these tradeoffs, most energy analysts now consider a renewable-dominant grid a question of when, not if.',
    ],
    questions: [
      {
        id: 'renewable-energy-revolution-q1',
        question: 'By roughly how much have solar panel costs fallen over the past ten years, per the passage?',
        options: ['Ten percent', 'Fifty percent', 'Ninety percent', 'They have not changed'],
        correctOptionIndex: 2,
      },
      {
        id: 'renewable-energy-revolution-q2',
        question: 'According to the passage, what is the biggest remaining challenge for renewable energy?',
        options: ['Generation capacity', 'Storage', 'Public support', 'Turbine height'],
        correctOptionIndex: 1,
      },
      {
        id: 'renewable-energy-revolution-q3',
        question: 'What does the passage say a growing fleet of electric vehicles can double as for the grid?',
        options: ['A source of pollution only', 'Flexible, distributed battery storage', 'A replacement for wind turbines', 'A new fossil fuel source'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'lost-library-alexandria',
    label: 'The Lost Library of Alexandria',
    sentences: [
      'Ancient Alexandria once housed what may have been the greatest concentration of written knowledge the ancient world had ever assembled.',
      'Founded under the Ptolemaic dynasty, the library aimed to collect a copy of every significant text then in existence.',
      'Ships arriving in the harbor were reportedly searched for scrolls, which were copied before the originals were sometimes kept and the copies returned.',
      "Scholars from across the Mediterranean traveled to Alexandria to study, debate, and add to its enormous, ever-growing collection.",
      "Estimates of the library's total holdings vary wildly, ranging from tens of thousands to several hundred thousand scrolls.",
      "Despite its fame, remarkably little is known for certain about the library's exact size, layout, or organization.",
      'Its destruction is often blamed on a single dramatic fire, but historical evidence points instead to a slower, more complicated decline.',
      "Julius Caesar's forces reportedly set fire to ships in the harbor in 48 BCE, and flames may have spread to nearby buildings.",
      'Political instability, funding cuts, and shifting religious and imperial priorities likely eroded the institution gradually over subsequent centuries.',
      'A related library at the nearby Serapeum temple was destroyed later, during a period of religious conflict in late antiquity.',
      'Many texts were likely lost simply through neglect, as fragile papyrus scrolls decayed faster than they could be recopied.',
      "The library's true legacy may be less about the specific texts lost and more about the ideal it represented.",
      'It stood as an early symbol of the belief that gathering and preserving knowledge was a task worth immense public investment.',
      'Modern digital archiving projects are sometimes described, only half-jokingly, as attempts to build a library of Alexandria that can never burn.',
    ],
    questions: [
      {
        id: 'lost-library-alexandria-q1',
        question: 'What did the library at Alexandria reportedly do with scrolls found on arriving ships, per the passage?',
        options: [
          'Destroyed them immediately',
          'Copied them, sometimes keeping the originals and returning the copies',
          'Ignored them entirely',
          'Sold them to other cities',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lost-library-alexandria-q2',
        question: "According to the passage, what does historical evidence suggest about the library's destruction?",
        options: [
          'It was destroyed instantly by one dramatic fire',
          'It declined slowly through a combination of factors',
          'It was never actually destroyed',
          'It was moved intact to another city',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'lost-library-alexandria-q3',
        question: "Per the passage, what role did Julius Caesar's forces reportedly play in 48 BCE?",
        options: [
          'They rebuilt the library',
          'They set fire to ships in the harbor, with flames possibly spreading to nearby buildings',
          'They donated new scrolls',
          'They founded the library',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-antikythera-mechanism',
    label: 'The Antikythera Mechanism',
    sentences: [
      'In 1901, divers searching a Roman-era shipwreck off a small Greek island pulled up a corroded lump of bronze gears.',
      'For decades, the object sat largely unstudied, its true complexity hidden beneath centuries of marine corrosion.',
      'Advanced X-ray imaging eventually revealed an astonishingly intricate mechanism containing over thirty precisely interlocking bronze gears.',
      'Researchers determined the device was built to track astronomical cycles, including the positions of the sun, moon, and possibly several planets.',
      "It could reportedly predict eclipses years in advance and even accounted for the moon's slightly irregular orbital speed.",
      'The mechanism is believed to date to around the second century BCE, making it far older than any comparably complex device known.',
      'Nothing of similar mechanical sophistication is known to have existed again in Europe for well over a thousand years afterward.',
      'This enormous gap raises real questions about how much other ancient engineering knowledge may have simply been lost to history.',
      'Some researchers suspect the Antikythera mechanism was not unique, but rather one surviving example of a broader, now-vanished tradition.',
      'Ancient texts do mention similar geared devices, lending some support to the idea that it was not an isolated invention.',
      "The device's exact purpose remains debated, though most experts agree it combined astronomical prediction with a kind of portable ceremonial calendar.",
      'Modern reconstructions have shown the mechanism actually works, turning smoothly to display astronomical positions exactly as its ancient designers intended.',
      "It is often described as the world's first known analog computer, a phrase that captures both its age and its genuine sophistication.",
      'The Antikythera mechanism remains a humbling reminder that ancient engineering could be far more advanced than popular imagination usually assumes.',
    ],
    questions: [
      {
        id: 'the-antikythera-mechanism-q1',
        question: 'Where was the Antikythera mechanism found, according to the passage?',
        options: ['In an Egyptian tomb', 'In a Roman-era shipwreck off a Greek island', 'Buried under Rome', 'In a museum archive'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-antikythera-mechanism-q2',
        question: 'What did the device reportedly predict years in advance, per the passage?',
        options: ['Earthquakes', 'Eclipses', 'Wars', 'Harvest yields'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-antikythera-mechanism-q3',
        question: 'According to the passage, what is the Antikythera mechanism often described as?',
        options: ['A simple toy', "The world's first known analog computer", 'A weapon of war', 'A musical instrument'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'rosetta-stone-decoded',
    label: 'Cracking the Rosetta Stone',
    sentences: [
      'For nearly fifteen hundred years after the last people who could read them died out, Egyptian hieroglyphs remained a complete mystery.',
      'Scholars could see the intricate carved symbols everywhere across Egypt, yet had no reliable way to understand what any of them meant.',
      'That changed in 1799, when French soldiers discovered a broken slab of dark stone near the town of Rosetta.',
      'The stone bore the same official decree carved three times, in hieroglyphic script, a later Egyptian script called Demotic, and ancient Greek.',
      'Because scholars could still read ancient Greek fluently, the stone offered a genuine key for decoding the two Egyptian scripts beside it.',
      'Progress was still slow and difficult, since hieroglyphs mix symbols representing sounds, whole words, and abstract concepts all at once.',
      'A French scholar named Jean-François Champollion pursued the puzzle obsessively for years, building on work by several earlier researchers.',
      'He is often credited with the decisive breakthrough in 1822, correctly identifying the sounds behind royal names encircled in oval cartouches.',
      "His success unlocked a systematic method for reading hieroglyphs generally, not just the specific text carved onto the Rosetta Stone itself.",
      'Suddenly, thousands of temple walls, tombs, and papyrus documents across Egypt became genuinely readable for the first time in over a millennium.',
      'This unlocked detailed knowledge of ancient Egyptian religion, governance, daily life, and history that had simply been inaccessible before.',
      'The Rosetta Stone itself is a fairly modest, somewhat unremarkable decree about tax relief for temple priests, not a dramatic royal proclamation.',
      'Its true significance lies entirely in its role as a translation key, not in the mundane content it happens to record.',
      'Today it sits in the British Museum, one of the most famous single artifacts in the entire history of archaeology.',
    ],
    questions: [
      {
        id: 'rosetta-stone-decoded-q1',
        question: 'In what three scripts was the same decree carved on the Rosetta Stone, per the passage?',
        options: [
          'Latin, Greek, and Arabic',
          'Hieroglyphic, Demotic, and ancient Greek',
          'Hebrew, Greek, and hieroglyphic',
          'Only hieroglyphic, repeated three times',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'rosetta-stone-decoded-q2',
        question: 'Who is often credited with the decisive breakthrough in decoding hieroglyphs in 1822, according to the passage?',
        options: ['A group of French soldiers', 'Jean-François Champollion', 'An anonymous Egyptian scribe', 'A British Museum curator'],
        correctOptionIndex: 1,
      },
      {
        id: 'rosetta-stone-decoded-q3',
        question: "According to the passage, what is the Rosetta Stone's actual inscribed content?",
        options: [
          'A dramatic royal proclamation of war',
          'A fairly modest decree about tax relief for temple priests',
          'A detailed star chart',
          'A love poem',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-voynich-manuscript',
    label: 'The Voynich Manuscript',
    sentences: [
      'Tucked inside a Yale University library sits one of the strangest books ever studied, filled from cover to cover with writing no one can read.',
      'Known as the Voynich Manuscript, it is named after the antique book dealer who acquired it in 1912.',
      "Radiocarbon dating places the manuscript's parchment to the early 1400s, confirming it is a genuine medieval artifact, not a modern hoax.",
      'Its pages are covered in flowing, elegant script written in an alphabet that matches no known language on Earth.',
      'Strange illustrations fill the margins, including unidentifiable plants, elaborate diagrams, and small nude figures bathing in green liquid.',
      'Codebreakers, linguists, and amateur enthusiasts have spent over a century trying to crack its script, so far without any confirmed success.',
      'Statistical analysis shows the text follows patterns consistent with a real language, rather than pure random gibberish.',
      'This has fueled the leading theory that it encodes a genuine, if now-lost or deliberately obscured, language or coding system.',
      'Some researchers argue it is an elaborate hoax, designed centuries ago to fool a wealthy buyer into paying handsomely for a mysterious book.',
      'Others propose it may be written in an unusually disguised or abbreviated form of a known European language.',
      "Even the codebreakers who cracked Germany's Enigma cipher during the Second World War reportedly attempted and failed to decode it.",
      'Modern computer analysis has ruled out several proposed solutions, but has not yet produced one that scholars broadly accept.',
      'The manuscript’s true subject, whether it concerns medicine, astronomy, or something else entirely, remains just as uncertain as its language.',
      "Until it is genuinely solved, the Voynich Manuscript stands as one of history's most stubborn and fascinating unsolved puzzles.",
    ],
    questions: [
      {
        id: 'the-voynich-manuscript-q1',
        question: 'According to the passage, what does radiocarbon dating confirm about the Voynich Manuscript?',
        options: [
          'It is a modern hoax',
          'Its parchment dates to the early 1400s, confirming it is a genuine medieval artifact',
          'It was written in the 1900s',
          'It has no confirmed date at all',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'the-voynich-manuscript-q2',
        question: 'Who reportedly attempted and failed to decode the manuscript, per the passage?',
        options: [
          'Ancient Egyptian priests',
          "The codebreakers who cracked Germany's Enigma cipher",
          'The book dealer who found it',
          'Modern computer scientists only',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'the-voynich-manuscript-q3',
        question: 'What does statistical analysis of the text suggest, according to the passage?',
        options: [
          'It is pure random gibberish',
          'It follows patterns consistent with a real language',
          'It is written in modern English',
          'It contains no repeated patterns at all',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'habit-stacking',
    label: 'Habit Stacking',
    sentences: [
      'Building a brand-new habit from scratch is notoriously difficult, since the brain has no existing cue reliably prompting the new behavior.',
      'Habit stacking offers a simple workaround: attaching a new habit directly onto a routine that already happens automatically every day.',
      'The formula is deceptively simple: after this current habit, I will do this new one, linking the two together explicitly.',
      'Brushing your teeth, making morning coffee, or sitting down at a desk are common anchor points, since they rarely get skipped.',
      'Because the anchor habit is already automatic, it becomes a reliable, built-in reminder that requires no extra willpower to notice.',
      "Over repeated use, the new behavior gradually borrows some of the anchor habit's own automatic momentum.",
      'Researchers studying habit formation note that consistency, not raw intensity, is what ultimately cements a new behavior into place.',
      'Stacking works especially well for habits that feel easy to skip, like stretching, gratitude journaling, or a few minutes of reading.',
      'Choosing an anchor that happens at a similar time and place each day makes the new stacked habit far more reliable.',
      'Some people chain several small habits together in a longer sequence, sometimes called a habit stack rather than a single stacked pair.',
      'The technique deliberately keeps the added habit small at first, since a tiny addition is far easier to sustain than a dramatic one.',
      'Once the small version feels automatic, it can gradually be expanded without risking the fragile new habit collapsing altogether.',
      'Habit stacking does not require extra time carved out of an already busy schedule, which is part of why it tends to stick.',
      'By borrowing structure that already exists, it turns willpower from the main engine of change into a much smaller supporting player.',
    ],
    questions: [
      {
        id: 'habit-stacking-q1',
        question: 'What is the basic formula behind habit stacking, according to the passage?',
        options: [
          'Do the new habit before anything else',
          'After this current habit, I will do this new one',
          'Never repeat the same habit twice',
          'Replace an old habit entirely with a new one',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'habit-stacking-q2',
        question: 'According to the passage, what ultimately cements a new behavior into place?',
        options: ['Raw intensity', 'Consistency', 'A single dramatic effort', 'Punishment for missing a day'],
        correctOptionIndex: 1,
      },
      {
        id: 'habit-stacking-q3',
        question: 'Per the passage, why does the technique deliberately keep the added habit small at first?',
        options: [
          'Small habits are more impressive',
          'A tiny addition is far easier to sustain than a dramatic one',
          "Large habits are against the method's rules",
          'It saves money',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-pratfall-effect',
    label: 'The Pratfall Effect',
    sentences: [
      'Common sense suggests that making a mistake in front of others should make a person seem less impressive, not more.',
      'A classic study from the 1960s found something surprisingly counterintuitive happening instead, at least under the right conditions.',
      'Psychologist Elliot Aronson had participants listen to recordings of a highly competent quiz contestant, some of whom then clumsily spilled coffee.',
      'Participants rated the competent contestant who spilled the coffee as more likable than the equally competent one who did not.',
      'This became known as the pratfall effect, since a small blunder appeared to humanize an otherwise intimidatingly perfect performance.',
      'The effect only worked for people already perceived as highly competent; when an average performer made the same mistake, likability actually dropped.',
      'Researchers concluded that a minor flaw makes a highly skilled person seem more relatable, closing the emotional distance others feel toward them.',
      'For an already-struggling performer, the same mistake instead confirms an existing doubt rather than adding endearing imperfection.',
      'The pratfall effect has since been applied well beyond psychology labs, influencing marketing, public speaking, and brand communication strategy.',
      'Companies sometimes admit small, low-stakes flaws deliberately, aiming to seem more human and trustworthy rather than falsely flawless.',
      'Public figures often share minor personal blunders for a similar reason, softening an image that might otherwise feel unapproachable.',
      'The effect has clear limits; a genuinely serious mistake damages credibility regardless of how competent someone appeared beforehand.',
      'Timing and context matter enormously, since a poorly chosen moment for admitting a flaw can undercut trust instead of building it.',
      'The core lesson is subtle: perfection can quietly create distance, while an occasional, well-placed imperfection can build genuine connection.',
    ],
    questions: [
      {
        id: 'the-pratfall-effect-q1',
        question: 'Who conducted the classic 1960s pratfall effect study, according to the passage?',
        options: ['B.F. Skinner', 'Elliot Aronson', 'Sigmund Freud', 'Daniel Kahneman'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-pratfall-effect-q2',
        question: 'What happened to likability ratings when an average performer, not a highly competent one, made the same mistake, per the passage?',
        options: ['It increased sharply', 'It stayed exactly the same', 'It actually dropped', 'It was not measured'],
        correctOptionIndex: 2,
      },
      {
        id: 'the-pratfall-effect-q3',
        question: 'According to the passage, why do some companies deliberately admit small, low-stakes flaws?',
        options: [
          'To reduce their marketing budget',
          'To seem more human and trustworthy rather than falsely flawless',
          'Because regulations require it',
          'To confuse competitors',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-endowment-effect',
    label: 'Why We Overvalue What We Own',
    sentences: [
      "Classical economic theory assumes an object's value should stay the same regardless of who happens to own it.",
      'Behavioral research has repeatedly found something quite different: people consistently value things more highly the moment they own them.',
      'This pattern is known as the endowment effect, and it shows up in decisions ranging from mugs to houses to stock portfolios.',
      'In a famous experiment, participants given a coffee mug demanded a far higher price to sell it than other participants were willing to pay to buy an identical one.',
      "Nothing about the mug itself changed; only the simple fact of ownership shifted how participants perceived its worth.",
      'Researchers link the effect partly to loss aversion, since giving up an owned item feels psychologically like suffering a genuine loss.',
      'Losses tend to feel more painful than equivalent gains feel pleasurable, which inflates the price an owner feels is fair to accept.',
      'The endowment effect appears even with items held only briefly, suggesting ownership itself, not lasting attachment, is doing much of the work.',
      'It helps explain why negotiations over a family home or an old car so often stall on price far more than a stranger would expect.',
      'Retailers sometimes exploit the effect deliberately, offering free trial periods so a product starts to feel owned before any purchase is finalized.',
      'Once something feels owned, even temporarily, giving it back can trigger the same reluctance seen in the classic mug experiments.',
      'The effect weakens somewhat among experienced traders, who often learn through repeated practice to treat owned goods more like interchangeable inventory.',
      "Understanding the endowment effect offers a practical lesson: a fair market price and an owner's personal, felt value can genuinely differ.",
      'Recognizing that gap can lead to calmer, more clear-headed decisions when it comes time to sell, trade, or simply let something go.',
    ],
    questions: [
      {
        id: 'the-endowment-effect-q1',
        question: 'In the famous mug experiment, what did participants who owned the mug do, according to the passage?',
        options: [
          'Demanded a far higher price to sell it than buyers were willing to pay',
          'Gave the mug away for free',
          'Refused to touch the mug at all',
          'Valued it the same as non-owners',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'the-endowment-effect-q2',
        question: 'What effect do retailers sometimes exploit by offering free trial periods, per the passage?',
        options: [
          'Loss aversion causing a product to feel owned before purchase',
          'The pratfall effect',
          'Decision fatigue',
          'The availability heuristic',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'the-endowment-effect-q3',
        question: 'According to the passage, how does the endowment effect change among experienced traders?',
        options: [
          'It gets much stronger',
          'It weakens somewhat, as they learn to treat owned goods like interchangeable inventory',
          'It disappears the instant they start trading',
          'It only applies to houses',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'implementation-intentions',
    label: 'The If-Then Trick',
    sentences: [
      'Simply wanting to change a behavior is rarely enough; good intentions famously and routinely fail to translate into real, consistent action.',
      'Psychologist Peter Gollwitzer studied a simple planning technique that measurably closes much of this gap, called implementation intentions.',
      'The format follows a specific, deliberately concrete structure: if situation X happens, then I will do behavior Y.',
      'Unlike a vague goal such as "exercise more," an implementation intention specifies an exact cue and an exact response in advance.',
      'For example, "if it is seven a.m. on a weekday, then I will put on my running shoes" removes ambiguity about when to start.',
      'By deciding in advance, the plan shifts effortful, in-the-moment willpower onto a much simpler, near-automatic trigger response instead.',
      'Studies across many domains, including exercise, healthy eating, and voting turnout, have found implementation intentions reliably boost follow-through.',
      'One well-known study found that specifying exactly when and where to get a flu shot substantially increased vaccination rates.',
      'The technique appears to work partly by mentally rehearsing the moment of action well before it actually arrives.',
      'That rehearsal makes the intended behavior feel more familiar and automatic once the real cue genuinely shows up.',
      'Implementation intentions are especially useful for moments prone to procrastination or distraction, when a vague plan is most likely to quietly dissolve.',
      'They can also specify how to handle an obstacle directly, as in "if I feel too tired, then I will do just five minutes."',
      'This obstacle-focused version helps prevent an entire habit from collapsing the first time motivation genuinely dips.',
      'The strategy costs almost nothing to try, requiring only a few minutes of concrete planning rather than any new resource or tool.',
    ],
    questions: [
      {
        id: 'implementation-intentions-q1',
        question: 'Who studied the implementation intentions technique, according to the passage?',
        options: ['Elliot Aronson', 'Peter Gollwitzer', 'Anders Ericsson', 'Daniel Kahneman'],
        correctOptionIndex: 1,
      },
      {
        id: 'implementation-intentions-q2',
        question: 'What is the specific structure an implementation intention follows, per the passage?',
        options: ['A vague general goal', 'If situation X happens, then I will do behavior Y', 'A yearly resolution list', 'A reward-only system'],
        correctOptionIndex: 1,
      },
      {
        id: 'implementation-intentions-q3',
        question: 'According to the passage, what did specifying exactly when and where to get a flu shot do?',
        options: ['Had no measurable effect', 'Substantially increased vaccination rates', 'Decreased vaccination rates', 'Only worked for exercise habits'],
        correctOptionIndex: 1,
      },
    ],
  },
] as const

export const TOTAL_SENTENCE_READING_MODE_CATEGORIES = SENTENCE_READING_MODE_CATEGORIES.length

// One ReadingUnit per COMPLETE sentence — preserves this mode's own
// established convention (see this file's header comment); unlike Phrase
// Reading Mode or Vertical Chunk Sliding, content is never chunked further.
export function buildUnitsForCategory(category: SentenceReadingModeCategory): readonly ReadingUnit[] {
  return category.sentences.map((text, index) => ({ id: `${category.id}-sentence-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-sentence-reading-mode-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses (Vertical Chunk Sliding, Phrase Reading Mode,
// Vertical Word Reading, Flash Recall Sprint) — client-only, called only
// from a useEffect in the Experience orchestrator, never a lazy useState
// initializer, so the server-rendered 'settings' phase and the client's
// first paint always match before this ever runs.
export function pickSessionCategory(): SentenceReadingModeCategory {
  const categories = SENTENCE_READING_MODE_CATEGORIES
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
      // Best-effort only — a failed write just means rotation resets, never
      // a crash.
    }
  }

  return picked
}

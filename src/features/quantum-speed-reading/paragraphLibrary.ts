// Paragraph Reading™ Library — Meaning Block Recognition™'s content model.
// Each paragraph is authored as an ARRAY OF LINES (never one flowing
// string), one real sentence/clause per line, sized to fill the ~700-760px
// reading width (~12-18 words/line) — the same proven shape
// multiLineParagraphDataset.ts already uses for Multi-Line Reading, here
// extended to 8-18 lines for this mission's 120-260 word range. This is a
// deliberate choice over runtime DOM measurement (scrollHeight/
// getComputedStyle): line count is a known, deterministic dataset
// property, so the reading-guide overlay can track real authored lines
// without any font-loading-timing or zoom/browser fragility.
//
// Every paragraph expresses ONE central idea — every line supports that
// same idea, never a bag of unrelated facts — per the brief's "Meaning
// Block Design" requirement. All 8 Brain Challenge field-groups are
// authored PER PARAGRAPH, never pooled cross-paragraph (a paragraph's main
// idea/cause-effect is inherently anchored to its own content, and this
// pack's 5-per-level pool is too thematically narrow to safely cross-pool
// without theme leakage — same reasoning Sentence Reading's chapters use).
// `lineIndex`/`lineIndexA/B` fields exist only for authoring traceability
// (every correct answer is anchored to real paragraph content) — never
// surfaced in a question prompt.
//
// Scope, disclosed: 5 unique paragraphs per level × 5 levels = 25 total,
// not the 50 a design pass suggested — verified against
// multiLineParagraphDataset.ts that per-unit content here (title + lines +
// 8 full question-type field-groups, ~32 authored option strings) is an
// order of magnitude larger than that mission's per-paragraph load, so
// matching its per-level COUNT while multiplying per-unit content 8x isn't
// comparable cost. 5/level still gives zero repeats across a first pass
// through a level's 4 missions (5 pool, 4 drawn, 1 spare for Try-Again).

import type { ParagraphReadingLevel } from './paragraphDifficulty'

export type ParagraphTopic =
  | 'human-brain' | 'forests' | 'ocean-life' | 'space' | 'healthy-habits'
  | 'memory' | 'creativity' | 'technology' | 'history' | 'science'

export const PARAGRAPH_TOPIC_NAME: Record<ParagraphTopic, string> = {
  'human-brain': 'The Human Brain',
  forests: 'Forests',
  'ocean-life': 'Ocean Life',
  space: 'Space',
  'healthy-habits': 'Healthy Habits',
  memory: 'Memory',
  creativity: 'Creativity',
  technology: 'Technology',
  history: 'History',
  science: 'Science',
}

export type ParagraphChallengeData = {
  mainIdea: { correctIdea: string; distractors: readonly [string, string, string] }
  supportingDetail: { lineIndex: number; correctDetail: string; distractors: readonly [string, string, string] }
  inference: { correctInference: string; distractors: readonly [string, string, string] }
  causeEffect: { lineIndex: number; cause: string; distractors: readonly [string, string, string] }
  vocabularyInContext: { word: string; lineIndex: number; contextualMeaning: string; distractors: readonly [string, string, string] }
  bestTitle: { distractorTitles: readonly [string, string, string] }
  summarySelection: { correctSummary: string; distractors: readonly [string, string, string] }
  meaningRelationship: {
    lineIndexA: number
    lineIndexB: number
    relationshipType: 'supports' | 'causes' | 'contrasts' | 'exemplifies'
    correctRelationshipStatement: string
    distractors: readonly [string, string, string]
  }
}

export type ParagraphContent = ParagraphChallengeData & {
  id: string
  level: ParagraphReadingLevel
  topic: ParagraphTopic
  title: string
  lines: readonly string[]
  wordCount: number
}

type RawParagraph = ParagraphChallengeData & {
  id: string
  level: ParagraphReadingLevel
  topic: ParagraphTopic
  title: string
  lines: readonly string[]
}

function wordCount(lines: readonly string[]): number {
  return lines.join(' ').trim().split(/\s+/).filter(Boolean).length
}

function resolve(raw: readonly RawParagraph[]): ParagraphContent[] {
  return raw.map((p) => ({ ...p, wordCount: wordCount(p.lines) }))
}

// ── Level 1 — ~120 words ────────────────────────────────────────────────

const LEVEL_1_RAW: readonly RawParagraph[] = [
  {
    id: 'l1-human-brain', level: 1, topic: 'human-brain', title: 'The Command Center of the Body',
    lines: [
      'The human brain controls nearly everything the body does every single day.',
      'It sends signals through billions of nerve cells called neurons constantly.',
      'These neurons communicate using tiny electrical and chemical signals at incredible speed.',
      'The brain manages breathing, movement, memory, emotion, and conscious thought together.',
      'Different regions of the brain handle different specific jobs and tasks.',
      'The frontal lobe helps with decisions, planning, and controlling behavior wisely.',
      'The brain uses about twenty percent of the body’s total daily energy.',
      'Protecting the brain through sleep and exercise supports lifelong mental health.',
      'Scientists continue studying the brain to understand memory, learning, and disease.',
    ],
    mainIdea: { correctIdea: 'The brain controls the body through networks of communicating neurons.', distractors: ['How the digestive system breaks down food', 'Why muscles grow stronger with exercise', 'How the skin protects the body from infection'] },
    supportingDetail: { lineIndex: 6, correctDetail: 'The brain consumes about twenty percent of the body’s daily energy.', distractors: ['The brain uses less energy than any other organ.', 'The heart uses more energy than the brain does.', 'The brain’s energy use decreases sharply with age.'] },
    inference: { correctInference: 'Because different regions handle different jobs, damage to one area may affect only specific abilities.', distractors: ['Damage to any part of the brain affects the whole body equally.', 'The brain stops changing once a person reaches adulthood.', 'Every brain region performs the exact same function.'] },
    causeEffect: { lineIndex: 7, cause: 'Getting enough sleep and regular exercise', distractors: ['Eating spicy food every day', 'Listening to loud music often', 'Spending more time outdoors in winter'] },
    vocabularyInContext: { word: 'neurons', lineIndex: 1, contextualMeaning: 'specialized nerve cells that transmit signals', distractors: ['blood cells that carry oxygen', 'muscle fibers that contract', 'hormones released into the bloodstream'] },
    bestTitle: { distractorTitles: ['A Guide to Healthy Eating', 'The History of Medicine', 'How Muscles Build Strength'] },
    summarySelection: { correctSummary: 'The brain runs the body’s functions through fast-communicating neurons across specialized regions.', distractors: ['The body relies mainly on the heart to coordinate movement.', 'Muscles work independently of the nervous system.', 'The skin is the body’s primary control center.'] },
    meaningRelationship: { lineIndexA: 4, lineIndexB: 5, relationshipType: 'exemplifies', correctRelationshipStatement: 'Line 6 gives a specific example of the general idea in Line 5.', distractors: ['Line 6 contradicts the claim made in Line 5.', 'Line 6 describes a topic unrelated to Line 5.', 'Line 6 explains what caused Line 5.'] },
  },
  {
    id: 'l1-forests', level: 1, topic: 'forests', title: 'Why Forests Matter',
    lines: [
      'Forests cover about thirty percent of the Earth’s total land surface.',
      'Trees absorb carbon dioxide and release fresh oxygen back into the air.',
      'Forest roots hold soil firmly in place during heavy storms and rain.',
      'Countless animal and plant species depend on forests for shelter and food.',
      'Rainforests alone are home to more than half of all known species.',
      'Cutting down forests too quickly disrupts these fragile natural systems badly.',
      'Replanting trees and protecting old forests helps restore balance over time.',
      'Healthy forests also cool the surrounding air and store fresh water.',
    ],
    mainIdea: { correctIdea: 'Forests support life on Earth by producing oxygen and sheltering species.', distractors: ['How cities plan new public parks', 'Why deserts have very little rainfall', 'How farmers rotate crops each season'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Rainforests hold more than half of all known species.', distractors: ['Deserts contain the greatest number of species.', 'Rainforests have fewer species than any other habitat.', 'Most species live only in the ocean.'] },
    inference: { correctInference: 'Because so many species depend on forests, losing forests likely threatens biodiversity.', distractors: ['Cutting down forests has no effect on wildlife.', 'Animals easily relocate whenever a forest disappears.', 'Forests regrow completely within a single year.'] },
    causeEffect: { lineIndex: 2, cause: 'Tree roots holding soil in place', distractors: ['Animals digging small burrows', 'Rain falling directly on rooftops', 'Wind blowing across open fields'] },
    vocabularyInContext: { word: 'fragile', lineIndex: 5, contextualMeaning: 'easily damaged or disrupted', distractors: ['extremely strong and durable', 'growing at a rapid pace', 'colorful and visually striking'] },
    bestTitle: { distractorTitles: ['The Basics of Ocean Currents', 'A Short History of Farming', 'How Volcanoes Form'] },
    summarySelection: { correctSummary: 'Forests sustain global life through oxygen production, soil protection, and habitat, but need protection from overcutting.', distractors: ['Forests exist mainly for producing timber and paper.', 'Forests have little effect on air or water quality.', 'Most forest species can survive equally well without trees.'] },
    meaningRelationship: { lineIndexA: 1, lineIndexB: 3, relationshipType: 'supports', correctRelationshipStatement: 'Line 4 supports Line 2 by showing another way forests sustain living things.', distractors: ['Line 4 contradicts the claim made in Line 2.', 'Line 4 describes the cause of Line 2.', 'Line 4 is unrelated to the idea in Line 2.'] },
  },
  {
    id: 'l1-ocean-life', level: 1, topic: 'ocean-life', title: 'Life Beneath the Waves',
    lines: [
      'The ocean covers more than seventy percent of the entire planet.',
      'Countless species of fish, mammals, and plants live within its waters.',
      'Sunlight only reaches the ocean’s upper layers near the surface.',
      'Deeper waters stay dark, cold, and under immense water pressure.',
      'Coral reefs shelter thousands of colorful fish and other small creatures.',
      'Whales and dolphins are mammals that must surface regularly to breathe.',
      'Ocean currents move heat around the planet and shape global weather.',
      'Protecting ocean life requires reducing pollution and limiting overfishing worldwide.',
    ],
    mainIdea: { correctIdea: 'The ocean hosts diverse life forms adapted to very different depths.', distractors: ['How mountains form over millions of years', 'Why deserts receive so little rainfall', 'How farmers irrigate dry cropland'] },
    supportingDetail: { lineIndex: 5, correctDetail: 'Whales and dolphins must surface regularly to breathe.', distractors: ['Whales and dolphins breathe underwater like fish.', 'Coral reefs contain no living creatures at all.', 'Sunlight reaches every depth of the ocean equally.'] },
    inference: { correctInference: 'Because deep waters lack sunlight, creatures there likely rely on senses other than sight.', distractors: ['All ocean creatures depend equally on bright sunlight.', 'The deep ocean is completely empty of life.', 'Coral reefs only exist in the deepest waters.'] },
    causeEffect: { lineIndex: 6, cause: 'Ocean currents moving heat around the planet', distractors: ['Coral reefs growing near the surface', 'Whales surfacing to breathe air', 'Fish swimming in large schools'] },
    vocabularyInContext: { word: 'immense', lineIndex: 3, contextualMeaning: 'extremely great in size or degree', distractors: ['barely noticeable or small', 'gradually decreasing over time', 'evenly distributed throughout'] },
    bestTitle: { distractorTitles: ['A Guide to Desert Wildlife', 'How Volcanoes Erupt', 'The History of Aviation'] },
    summarySelection: { correctSummary: 'Ocean life ranges from sunlit reefs to dark, high-pressure depths, and needs protection from pollution and overfishing.', distractors: ['The ocean is a mostly lifeless body of water.', 'Ocean pollution has little effect on marine life.', 'All ocean creatures live near the surface.'] },
    meaningRelationship: { lineIndexA: 2, lineIndexB: 3, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 4 contrasts with Line 3 by describing the opposite conditions found deeper in the ocean.', distractors: ['Line 4 restates the same idea as Line 3.', 'Line 4 gives an example of Line 3.', 'Line 4 explains what caused Line 3.'] },
  },
  {
    id: 'l1-space', level: 1, topic: 'space', title: 'Our Place in Space',
    lines: [
      'Earth is one of eight planets that orbit the Sun.',
      'Our solar system sits within a much larger galaxy called the Milky Way.',
      'The Sun is a star that provides the light and heat Earth needs.',
      'The Moon orbits Earth and affects our planet’s ocean tides directly.',
      'Other planets, like Mars and Jupiter, differ greatly in size and climate.',
      'Space itself is mostly empty, with enormous distances between stars and planets.',
      'Telescopes allow scientists to study distant stars, galaxies, and planets closely.',
      'Space exploration continues to reveal new details about our vast universe.',
    ],
    mainIdea: { correctIdea: 'Earth is one small part of a vast solar system and universe.', distractors: ['How weather patterns form on Earth', 'Why volcanoes erupt occasionally', 'How rivers shape the landscape'] },
    supportingDetail: { lineIndex: 3, correctDetail: 'The Moon’s orbit affects Earth’s ocean tides.', distractors: ['The Moon has no effect on Earth’s oceans.', 'Mars is closer to Earth than the Moon is.', 'The Sun orbits around the Earth.'] },
    inference: { correctInference: 'Because space is mostly empty with enormous distances, traveling between stars would take a very long time.', distractors: ['Stars are located very close to one another.', 'Space travel between planets takes only minutes.', 'The universe contains almost no empty space.'] },
    causeEffect: { lineIndex: 2, cause: 'The Sun providing light and heat', distractors: ['The Moon orbiting the Earth', 'Mars having a different climate', 'Telescopes observing distant galaxies'] },
    vocabularyInContext: { word: 'vast', lineIndex: 7, contextualMeaning: 'extremely large in size or extent', distractors: ['small and easily measured', 'artificial and human-made', 'quickly changing and unstable'] },
    bestTitle: { distractorTitles: ['The Basics of Ocean Currents', 'How Forests Support Wildlife', 'A Guide to Healthy Eating'] },
    summarySelection: { correctSummary: 'Earth orbits the Sun within a vast galaxy, and telescopes continue to reveal more about the universe.', distractors: ['Earth is the only planet within the solar system.', 'The Sun orbits around the planets.', 'Space exploration has revealed nothing new in decades.'] },
    meaningRelationship: { lineIndexA: 0, lineIndexB: 1, relationshipType: 'supports', correctRelationshipStatement: 'Line 2 supports Line 1 by placing our solar system within an even larger structure.', distractors: ['Line 2 contradicts the claim made in Line 1.', 'Line 2 describes an unrelated topic from Line 1.', 'Line 2 explains what caused Line 1.'] },
  },
  {
    id: 'l1-healthy-habits', level: 1, topic: 'healthy-habits', title: 'Small Habits, Big Results',
    lines: [
      'Small daily habits often shape long-term health more than occasional big efforts.',
      'Drinking enough water each day keeps the body’s cells working properly.',
      'Regular movement, even short walks, supports a healthy heart and mind.',
      'Getting consistent sleep each night helps the body repair and recover.',
      'Eating a balanced variety of foods gives the body needed nutrients.',
      'Managing daily stress calmly protects both mental and physical wellbeing.',
      'Small, repeated choices add up gradually into lasting healthy patterns.',
      'Building one habit at a time makes lasting change far easier.',
    ],
    mainIdea: { correctIdea: 'Small, consistent daily habits build long-term health more than occasional effort.', distractors: ['How doctors diagnose rare diseases', 'Why hospitals schedule surgeries in advance', 'How pharmacies store medication safely'] },
    supportingDetail: { lineIndex: 1, correctDetail: 'Drinking enough water keeps the body’s cells working properly.', distractors: ['Drinking water has little effect on the body’s cells.', 'The body functions better with less water.', 'Water only affects digestion, not overall health.'] },
    inference: { correctInference: 'Because small choices add up gradually, starting with one habit is likely more sustainable than changing everything at once.', distractors: ['Only large, dramatic changes ever produce real results.', 'Habits form instantly with no need for repetition.', 'Sleep has no connection to physical recovery.'] },
    causeEffect: { lineIndex: 3, cause: 'Getting consistent sleep each night', distractors: ['Eating dessert occasionally', 'Watching television before bed', 'Skipping breakfast on weekends'] },
    vocabularyInContext: { word: 'wellbeing', lineIndex: 5, contextualMeaning: 'a state of being healthy and content', distractors: ['a type of medical treatment', 'a measurement of physical strength', 'a schedule of daily meals'] },
    bestTitle: { distractorTitles: ['The History of Modern Medicine', 'A Guide to Ocean Wildlife', 'How Telescopes Work'] },
    summarySelection: { correctSummary: 'Consistent small habits around water, movement, sleep, food, and stress build lasting health.', distractors: ['Health depends mostly on occasional intense effort.', 'Sleep and stress have no real effect on health.', 'Balanced eating matters less than daily exercise alone.'] },
    meaningRelationship: { lineIndexA: 6, lineIndexB: 0, relationshipType: 'supports', correctRelationshipStatement: 'Line 7 supports Line 1 by explaining how small choices accumulate into the pattern Line 1 describes.', distractors: ['Line 7 contradicts the claim made in Line 1.', 'Line 7 introduces a completely new, unrelated idea.', 'Line 7 describes what caused Line 1.'] },
  },
]

// ── Level 2 — ~150 words ────────────────────────────────────────────────

const LEVEL_2_RAW: readonly RawParagraph[] = [
  {
    id: 'l2-memory', level: 2, topic: 'memory', title: 'How Memory Works',
    lines: [
      'Memory is not a single process but a series of connected steps in the brain.',
      'First, the brain encodes new information as it is experienced or learned.',
      'Next, that information must be stored, either briefly or for the long term.',
      'Finally, retrieval brings stored information back into conscious awareness when needed.',
      'Short-term memory holds only a small amount of information for a short time.',
      'Long-term memory can hold vast amounts of information for years or decades.',
      'Repetition and meaningful connections help move information into long-term storage.',
      'Sleep plays an important role in consolidating memories formed during the day.',
      'Forgetting happens naturally when memories are rarely retrieved or reinforced.',
      'Understanding how memory works helps people study and learn more effectively.',
    ],
    mainIdea: { correctIdea: 'Memory forms through encoding, storage, and retrieval, strengthened by repetition.', distractors: ['How the immune system fights infection', 'Why muscles need protein to grow', 'How the eye focuses light onto the retina'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Short-term memory holds only a small amount of information briefly.', distractors: ['Short-term memory can store information for decades.', 'Long-term memory holds less information than short-term memory.', 'Short-term memory never fades or weakens.'] },
    inference: { correctInference: 'Because sleep helps consolidate memories, poor sleep likely weakens how well new information is remembered.', distractors: ['Sleep has no connection to how memories form.', 'Forgetting only happens during sleep, never while awake.', 'Long-term memory forms instantly without any repetition.'] },
    causeEffect: { lineIndex: 6, cause: 'Repetition and meaningful connections', distractors: ['Sudden loud noises nearby', 'Reading in dim lighting', 'Skipping breakfast in the morning'] },
    vocabularyInContext: { word: 'consolidating', lineIndex: 7, contextualMeaning: 'strengthening and stabilizing over time', distractors: ['erasing completely and permanently', 'randomly rearranging in order', 'converting into a different sense'] },
    bestTitle: { distractorTitles: ['The Basics of Digestion', 'A Guide to Weather Patterns', 'How Bridges Are Built'] },
    summarySelection: { correctSummary: 'Memory works through encoding, storage, and retrieval, and is strengthened by repetition and sleep.', distractors: ['Memory is a single, unchanging process in the brain.', 'Long-term memory forms without any need for repetition.', 'Sleep has no measurable effect on memory formation.'] },
    meaningRelationship: { lineIndexA: 1, lineIndexB: 3, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 4 contrasts with Line 2 by describing the final step rather than the first step of memory.', distractors: ['Line 4 restates the same idea as Line 2.', 'Line 4 explains what caused Line 2.', 'Line 4 is entirely unrelated to Line 2.'] },
  },
  {
    id: 'l2-creativity', level: 2, topic: 'creativity', title: 'The Nature of Creativity',
    lines: [
      'Creativity is often misunderstood as a rare talent only some people possess.',
      'In reality, creativity is more about combining existing ideas in new ways.',
      'Every creative breakthrough builds on knowledge, skills, or ideas that came before.',
      'Curiosity and a willingness to explore unfamiliar territory support creative thinking.',
      'Constraints, surprisingly, can actually push people toward more creative solutions.',
      'Working within limits forces the mind to search beyond obvious answers.',
      'Practice and exposure to diverse fields also strengthen creative ability over time.',
      'Many inventors credit their best ideas to connecting fields that seemed unrelated.',
      'Anyone can strengthen their creativity through deliberate practice and curiosity.',
    ],
    mainIdea: { correctIdea: 'Creativity comes from combining existing ideas in new ways, not just innate talent.', distractors: ['How companies calculate quarterly profits', 'Why airplanes require long runways', 'How farmers rotate crops each season'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Working within constraints can push people toward more creative solutions.', distractors: ['Constraints always prevent creative thinking entirely.', 'Creativity only appears when there are no limits at all.', 'Limits have no measurable effect on problem-solving.'] },
    inference: { correctInference: 'Because creativity draws on combining prior knowledge, exposure to diverse fields likely broadens creative potential.', distractors: ['Creativity has no connection to prior knowledge at all.', 'Only specialists in one narrow field can be creative.', 'Curiosity actively weakens the ability to think creatively.'] },
    causeEffect: { lineIndex: 5, cause: 'Working within limits', distractors: ['Having unlimited time and resources', 'Working entirely alone without input', 'Following the exact same routine daily'] },
    vocabularyInContext: { word: 'constraints', lineIndex: 4, contextualMeaning: 'limitations or restrictions', distractors: ['unlimited resources and freedom', 'creative breakthroughs and ideas', 'skilled and experienced people'] },
    bestTitle: { distractorTitles: ['The History of Ancient Trade', 'A Guide to Ocean Currents', 'How Vaccines Are Developed'] },
    summarySelection: { correctSummary: 'Creativity grows from combining existing ideas, curiosity, and even useful limits, and can be strengthened through practice.', distractors: ['Creativity is a fixed trait that cannot be developed.', 'Limits always reduce the quality of creative work.', 'Only rare geniuses are capable of creative thinking.'] },
    meaningRelationship: { lineIndexA: 3, lineIndexB: 4, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 5 contrasts with Line 4 by showing that limits, not just openness, can also support creativity.', distractors: ['Line 5 restates the same idea as Line 4.', 'Line 5 explains what caused Line 4.', 'Line 5 is unrelated to the idea in Line 4.'] },
  },
  {
    id: 'l2-technology', level: 2, topic: 'technology', title: 'Technology’s Quiet Revolution',
    lines: [
      'Everyday technology has transformed daily life more quietly than most people realize.',
      'Smartphones now combine a camera, computer, and phone into a single device.',
      'Instant access to information has changed how people learn and make decisions.',
      'Communication that once took days now happens in a matter of seconds.',
      'Online tools let people work, shop, and connect from nearly anywhere.',
      'This constant connectivity brings real convenience, but also new challenges.',
      'Managing screen time and digital distraction has become a modern skill.',
      'Understanding both the benefits and costs of technology helps people use it wisely.',
    ],
    mainIdea: { correctIdea: 'Everyday technology has quietly transformed communication and access to information.', distractors: ['How volcanoes form beneath the Earth’s crust', 'Why coral reefs need warm water', 'How farmers irrigate dry cropland'] },
    supportingDetail: { lineIndex: 1, correctDetail: 'Smartphones combine a camera, computer, and phone into one device.', distractors: ['Smartphones can only be used for phone calls.', 'Cameras and computers cannot be combined into one device.', 'Smartphones were invented before computers existed.'] },
    inference: { correctInference: 'Because constant connectivity brings new challenges, managing screen time is likely becoming more important over time.', distractors: ['Screen time has no real effect on daily life.', 'Digital distraction was a bigger problem in the past.', 'Online tools have made communication slower overall.'] },
    causeEffect: { lineIndex: 3, cause: 'Modern communication technology', distractors: ['A shortage of postal workers', 'Slower internet connections worldwide', 'Fewer people owning telephones'] },
    vocabularyInContext: { word: 'connectivity', lineIndex: 5, contextualMeaning: 'the state of being connected, especially digitally', distractors: ['a type of physical exercise', 'a measurement of screen brightness', 'a method of storing paper files'] },
    bestTitle: { distractorTitles: ['A Guide to Ancient Architecture', 'The Basics of Plant Biology', 'How Rivers Shape Landscapes'] },
    summarySelection: { correctSummary: 'Everyday devices like smartphones have reshaped communication and access to information, bringing both convenience and new challenges.', distractors: ['Technology has changed almost nothing about daily communication.', 'Smartphones are used mainly for entertainment, not information.', 'Digital tools have made learning slower and harder.'] },
    meaningRelationship: { lineIndexA: 4, lineIndexB: 5, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 6 contrasts with Line 5 by pointing out challenges alongside the convenience Line 5 describes.', distractors: ['Line 6 restates the same idea as Line 5.', 'Line 6 gives an example of Line 5.', 'Line 6 explains what caused Line 5.'] },
  },
  {
    id: 'l2-history', level: 2, topic: 'history', title: 'Lessons From the Past',
    lines: [
      'History is more than a record of dates, names, and distant events.',
      'Studying history reveals patterns in how societies rise, change, and sometimes collapse.',
      'Past decisions, both wise and disastrous, offer lessons for present-day choices.',
      'Understanding earlier conflicts can help leaders avoid repeating similar mistakes.',
      'Historical records also show how ideas about fairness and rights have evolved.',
      'Even ordinary daily life in the past reveals how much has changed.',
      'Comparing different time periods helps people see today’s issues more clearly.',
      'Without studying history, societies risk repeating errors already made before.',
    ],
    mainIdea: { correctIdea: 'Studying history reveals patterns that help us understand and avoid past mistakes.', distractors: ['How satellites orbit the Earth', 'Why certain metals conduct electricity', 'How plants convert sunlight into energy'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Historical records show how ideas about fairness and rights have evolved.', distractors: ['Ideas about fairness have never changed throughout history.', 'History reveals nothing about how societies have changed.', 'Rights and fairness are topics history does not address.'] },
    inference: { correctInference: 'Because past decisions offer lessons, ignoring history likely increases the risk of repeating past mistakes.', distractors: ['History has no relevance to modern decision-making.', 'Every past mistake has already been permanently solved.', 'Studying history guarantees no future conflicts will occur.'] },
    causeEffect: { lineIndex: 3, cause: 'Understanding earlier conflicts', distractors: ['Ignoring historical records entirely', 'Focusing only on recent events', 'Avoiding comparisons between time periods'] },
    vocabularyInContext: { word: 'evolved', lineIndex: 4, contextualMeaning: 'gradually developed or changed over time', distractors: ['remained exactly the same', 'disappeared completely and permanently', 'were invented all at once'] },
    bestTitle: { distractorTitles: ['A Guide to Modern Cooking', 'The Basics of Cloud Storage', 'How Muscles Recover After Exercise'] },
    summarySelection: { correctSummary: 'History reveals patterns in how societies change, offering lessons that help avoid repeating past mistakes.', distractors: ['History is only useful for memorizing dates and names.', 'Past conflicts have no connection to present-day decisions.', 'Societies never repeat mistakes made in earlier periods.'] },
    meaningRelationship: { lineIndexA: 1, lineIndexB: 2, relationshipType: 'exemplifies', correctRelationshipStatement: 'Line 3 gives a specific example of the patterns described generally in Line 2.', distractors: ['Line 3 contradicts the claim made in Line 2.', 'Line 3 is unrelated to the idea in Line 2.', 'Line 3 explains what caused Line 2.'] },
  },
  {
    id: 'l2-science', level: 2, topic: 'science', title: 'How Science Builds Knowledge',
    lines: [
      'Science advances through a careful cycle of observation, testing, and review.',
      'A scientist typically begins with a question and a testable hypothesis.',
      'Careful experiments are then designed to test whether that hypothesis holds true.',
      'Collected data either supports the hypothesis or reveals it needs revision.',
      'Peer review allows other scientists to check the work for errors.',
      'Findings that survive this scrutiny become part of accepted scientific knowledge.',
      'Even accepted ideas remain open to revision if new evidence emerges.',
      'This willingness to revise, rather than defend old ideas, is science’s core strength.',
    ],
    mainIdea: { correctIdea: 'Science advances through observation, testing, and peer review.', distractors: ['How musicians compose new melodies', 'Why cities plan public transportation routes', 'How chefs develop restaurant menus'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Peer review allows other scientists to check work for errors.', distractors: ['Peer review means one scientist works entirely alone.', 'Findings are accepted without any outside review.', 'Peer review happens only after publication, never before.'] },
    inference: { correctInference: 'Because science stays open to revision, accepted ideas are likely to change as new evidence appears.', distractors: ['Once accepted, scientific ideas can never be changed.', 'Hypotheses are always proven true on the first test.', 'Peer review guarantees a finding is permanently correct.'] },
    causeEffect: { lineIndex: 3, cause: 'Data that fails to support a hypothesis', distractors: ['A scientist publishing a paper', 'Other scientists reading the research', 'A hypothesis being written down clearly'] },
    vocabularyInContext: { word: 'scrutiny', lineIndex: 5, contextualMeaning: 'close, careful examination', distractors: ['a quick, casual glance', 'a public celebration of results', 'a financial reward for research'] },
    bestTitle: { distractorTitles: ['A Guide to Public Speaking', 'The History of Painting', 'How Airlines Schedule Flights'] },
    summarySelection: { correctSummary: 'Scientific knowledge grows through testing hypotheses and peer review, staying open to revision as evidence changes.', distractors: ['Scientific ideas are fixed and never revised.', 'Hypotheses require no testing before being accepted.', 'Peer review is an unnecessary step in research.'] },
    meaningRelationship: { lineIndexA: 5, lineIndexB: 6, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 7 contrasts with Line 6 by noting that even accepted findings can still be revised later.', distractors: ['Line 7 restates the same idea as Line 6.', 'Line 7 explains what caused Line 6.', 'Line 7 is unrelated to the idea in Line 6.'] },
  },
]

// ── Level 3 — ~180 words ────────────────────────────────────────────────

const LEVEL_3_RAW: readonly RawParagraph[] = [
  {
    id: 'l3-human-brain', level: 3, topic: 'human-brain', title: 'Neuroplasticity and Change',
    lines: [
      'For much of the twentieth century, scientists believed the adult brain was essentially fixed.',
      'Once a person reached adulthood, its structure was thought to stop changing meaningfully.',
      'Modern research has overturned that view through the discovery of neuroplasticity.',
      'Neuroplasticity is the brain’s remarkable ability to reorganize itself throughout life.',
      'New experiences, learning, and even injury can physically reshape neural connections.',
      'Practicing a skill repeatedly strengthens the specific pathways involved in that skill.',
      'Musicians and athletes often show measurable brain changes tied to their training.',
      'This flexibility also helps some patients recover abilities after a stroke.',
      'Nearby healthy brain regions can sometimes take over lost functions gradually.',
      'Neuroplasticity does tend to decline somewhat with age, though it never fully disappears.',
      'This discovery has reshaped how doctors approach rehabilitation and lifelong learning.',
    ],
    mainIdea: { correctIdea: 'The brain can reorganize and rewire itself throughout life, not just in childhood.', distractors: ['How the digestive system absorbs nutrients', 'Why bones become denser during childhood', 'How the immune system identifies threats'] },
    supportingDetail: { lineIndex: 7, correctDetail: 'Some stroke patients recover abilities as nearby brain regions take over.', distractors: ['Stroke patients never recover any lost abilities.', 'Only the exact damaged region can ever recover function.', 'Rehabilitation has no effect on stroke recovery.'] },
    inference: { correctInference: 'Because practicing a skill strengthens related pathways, consistent practice likely produces greater brain change than occasional effort.', distractors: ['Practicing a skill has no effect on brain structure.', 'The adult brain is completely incapable of change.', 'Neuroplasticity only affects children, never adults.'] },
    causeEffect: { lineIndex: 5, cause: 'Practicing a skill repeatedly', distractors: ['Taking a single short break', 'Reading in a quiet room', 'Sleeping for exactly eight hours'] },
    vocabularyInContext: { word: 'neuroplasticity', lineIndex: 3, contextualMeaning: 'the brain’s ability to reorganize and change', distractors: ['a disease affecting brain tissue', 'a type of medical scanning technology', 'a fixed, unchangeable brain structure'] },
    bestTitle: { distractorTitles: ['The History of Modern Medicine', 'A Guide to Muscle Recovery', 'How Vaccines Protect the Body'] },
    summarySelection: { correctSummary: 'Neuroplasticity shows the brain can reorganize throughout life, aiding learning, skill-building, and recovery from injury.', distractors: ['The adult brain stops changing entirely after childhood.', 'Stroke recovery never involves changes in the brain.', 'Skill practice has no measurable effect on the brain.'] },
    meaningRelationship: { lineIndexA: 0, lineIndexB: 2, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 3 contrasts with Line 1 by overturning the older belief the paragraph opens with.', distractors: ['Line 3 restates the same idea as Line 1.', 'Line 3 gives a specific example of Line 1.', 'Line 3 explains what caused Line 1.'] },
  },
  {
    id: 'l3-forests', level: 3, topic: 'forests', title: 'The Rainforest’s Hidden Complexity',
    lines: [
      'Tropical rainforests are among the most biologically complex ecosystems on Earth.',
      'A single hectare of rainforest can contain hundreds of different tree species.',
      'This complexity exists partly because rainforests are organized into distinct vertical layers.',
      'The emergent layer rises above the main canopy, catching direct sunlight.',
      'Below it, the dense canopy layer blocks most light from reaching the ground.',
      'The understory survives on dim, filtered light and thrives in humid shade.',
      'At the forest floor, decomposing matter recycles nutrients back into the soil.',
      'Each layer supports different animals adapted to its specific light and temperature.',
      'This layered structure allows an extraordinary number of species to coexist.',
      'Losing even part of a rainforest can disrupt this delicate, interconnected balance.',
    ],
    mainIdea: { correctIdea: 'Rainforests support extraordinary biodiversity through distinct, layered ecosystems.', distractors: ['How deserts form in dry climate zones', 'Why glaciers move slowly over time', 'How rivers carve canyons over centuries'] },
    supportingDetail: { lineIndex: 3, correctDetail: 'The emergent layer rises above the canopy and catches direct sunlight.', distractors: ['The emergent layer receives no sunlight at all.', 'The forest floor receives the most direct sunlight.', 'The canopy layer is the tallest part of the forest.'] },
    inference: { correctInference: 'Because each layer supports different adapted animals, disrupting one layer likely affects the species that depend on it.', distractors: ['Every layer of the rainforest supports identical species.', 'Removing one layer has no effect on the ecosystem.', 'Animals easily adapt to any layer of the forest.'] },
    causeEffect: { lineIndex: 5, cause: 'Filtered, dim light reaching the understory', distractors: ['Direct sunlight reaching the forest floor', 'Strong winds at the canopy level', 'Heavy rainfall in the emergent layer'] },
    vocabularyInContext: { word: 'coexist', lineIndex: 8, contextualMeaning: 'to exist together at the same time', distractors: ['to compete until only one survives', 'to migrate to a different region', 'to reproduce at a faster rate'] },
    bestTitle: { distractorTitles: ['A Guide to Desert Survival', 'The Basics of Ocean Tides', 'How Cities Manage Traffic'] },
    summarySelection: { correctSummary: 'Rainforests organize into vertical layers, each supporting different species, creating extraordinary biodiversity that is easily disrupted.', distractors: ['Rainforests contain very few distinct plant or animal species.', 'All rainforest layers receive the same amount of sunlight.', 'Rainforest ecosystems are simple and resistant to disruption.'] },
    meaningRelationship: { lineIndexA: 1, lineIndexB: 2, relationshipType: 'causes', correctRelationshipStatement: 'Line 3 explains a cause behind the complexity described in Line 2 — the forest’s layered structure.', distractors: ['Line 3 contradicts the claim made in Line 2.', 'Line 3 is unrelated to the idea in Line 2.', 'Line 3 restates the same idea as Line 2.'] },
  },
  {
    id: 'l3-ocean-life', level: 3, topic: 'ocean-life', title: 'The Deep Ocean’s Mysteries',
    lines: [
      'Below about two hundred meters, sunlight can no longer penetrate ocean water.',
      'This vast, dark region is known as the deep sea, or the abyss.',
      'Despite crushing pressure and near-freezing temperatures, life still thrives there.',
      'Many deep-sea creatures produce their own light through a process called bioluminescence.',
      'This glow helps them attract prey, find mates, or startle predators.',
      'Some species have evolved highly flexible jaws to swallow rare, large meals.',
      'Because food is scarce, deep-sea animals often grow and reproduce very slowly.',
      'Hydrothermal vents release mineral-rich, heated water that supports unique ecosystems.',
      'Around these vents, bacteria convert chemicals into energy instead of using sunlight.',
      'Scientists have only explored a small fraction of this vast, hidden world.',
    ],
    mainIdea: { correctIdea: 'Deep ocean creatures survive extreme pressure and darkness through unique adaptations.', distractors: ['How coral reefs form near tropical coastlines', 'Why hurricanes gain strength over warm water', 'How fishing boats track ocean currents'] },
    supportingDetail: { lineIndex: 7, correctDetail: 'Hydrothermal vents release mineral-rich heated water supporting unique ecosystems.', distractors: ['Hydrothermal vents release only cold, clear water.', 'Deep-sea ecosystems exist without any energy source.', 'Vents are found only near the ocean surface.'] },
    inference: { correctInference: 'Because food is scarce in the deep sea, slow growth likely helps conserve limited energy.', distractors: ['Food is more abundant in the deep sea than near the surface.', 'Deep-sea creatures grow faster than surface species.', 'Energy scarcity has no effect on deep-sea life.'] },
    causeEffect: { lineIndex: 4, cause: 'Bioluminescence produced by deep-sea creatures', distractors: ['Sunlight penetrating deep ocean water', 'Cold temperatures near the surface', 'Strong currents near hydrothermal vents'] },
    vocabularyInContext: { word: 'abyss', lineIndex: 1, contextualMeaning: 'a deep, dark region of the ocean', distractors: ['a shallow coastal reef', 'a warm surface current', 'a small tidal pool'] },
    bestTitle: { distractorTitles: ['A Guide to Mountain Ecosystems', 'The History of Sailing Ships', 'How Rainfall Patterns Change'] },
    summarySelection: { correctSummary: 'Deep-sea creatures survive extreme darkness and pressure through bioluminescence, slow growth, and vent-based ecosystems.', distractors: ['The deep sea contains no living creatures at all.', 'Sunlight fully illuminates every depth of the ocean.', 'Deep-sea animals rely entirely on surface plants for food.'] },
    meaningRelationship: { lineIndexA: 7, lineIndexB: 8, relationshipType: 'exemplifies', correctRelationshipStatement: 'Line 9 gives a specific example of how the vent ecosystem in Line 8 actually functions.', distractors: ['Line 9 contradicts the claim made in Line 8.', 'Line 9 is unrelated to the idea in Line 8.', 'Line 9 explains what caused Line 8.'] },
  },
  {
    id: 'l3-space', level: 3, topic: 'space', title: 'The Search for Exoplanets',
    lines: [
      'Astronomers have confirmed the existence of thousands of planets outside our solar system.',
      'These distant worlds are known as exoplanets, orbiting stars other than the Sun.',
      'Because exoplanets are so far away, scientists rarely observe them directly.',
      'Instead, astronomers detect tiny dips in starlight as a planet passes in front.',
      'This method, called the transit technique, reveals a planet’s size and orbit.',
      'Some exoplanets orbit within a star’s habitable zone, where liquid water could exist.',
      'Liquid water is considered essential for life as we currently understand it.',
      'Not every planet in a habitable zone will actually support life, however.',
      'Atmosphere, composition, and countless other factors also strongly influence habitability.',
      'Future telescopes aim to study exoplanet atmospheres for possible signs of life.',
    ],
    mainIdea: { correctIdea: 'Astronomers search for planets outside our solar system that might support life.', distractors: ['How airplanes maintain altitude during flight', 'Why ocean tides rise and fall daily', 'How satellites transmit television signals'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'The transit technique reveals a planet’s size and orbit through dips in starlight.', distractors: ['The transit technique requires directly photographing the planet.', 'Dips in starlight reveal nothing about a planet.', 'Exoplanets are always visible without any special method.'] },
    inference: { correctInference: 'Because habitable-zone location alone doesn’t guarantee life, atmosphere and composition likely matter just as much.', distractors: ['Every planet in a habitable zone definitely supports life.', 'Liquid water has no connection to supporting life.', 'Atmosphere has no influence on whether a planet is habitable.'] },
    causeEffect: { lineIndex: 3, cause: 'A planet passing in front of its star', distractors: ['A star increasing in overall brightness', 'A telescope being pointed elsewhere', 'A planet’s atmosphere changing color'] },
    vocabularyInContext: { word: 'habitability', lineIndex: 8, contextualMeaning: 'the suitability of a place to support life', distractors: ['the exact distance between two stars', 'the brightness of a distant star', 'the speed at which a planet orbits'] },
    bestTitle: { distractorTitles: ['A Guide to Deep-Sea Creatures', 'The History of Bridge Engineering', 'How Muscles Repair After Injury'] },
    summarySelection: { correctSummary: 'Astronomers detect exoplanets through starlight dips and study habitable-zone worlds for possible signs of life.', distractors: ['Astronomers can photograph every exoplanet directly.', 'Every exoplanet found so far definitely supports life.', 'Habitable-zone location is the only factor that matters for life.'] },
    meaningRelationship: { lineIndexA: 5, lineIndexB: 7, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 8 contrasts with Line 6 by cautioning that a habitable zone alone doesn’t guarantee life.', distractors: ['Line 8 restates the same idea as Line 6.', 'Line 8 gives a specific example of Line 6.', 'Line 8 explains what caused Line 6.'] },
  },
  {
    id: 'l3-healthy-habits', level: 3, topic: 'healthy-habits', title: 'The Science of Sustainable Habits',
    lines: [
      'Most people who try to change their health habits rely mainly on willpower.',
      'Willpower alone, however, tends to be an unreliable and limited resource.',
      'Research on habit formation instead points toward small, consistent, repeated actions.',
      'A new behavior becomes automatic once it is linked to a specific daily cue.',
      'For example, drinking water right after waking up ties the habit to a clear moment.',
      'Over time, repeating this cue-behavior pattern makes the habit feel effortless.',
      'Removing friction, like keeping walking shoes by the door, also helps consistency.',
      'Tracking progress, even loosely, reinforces motivation during the early, harder weeks.',
      'Setbacks are normal and do not erase the progress already made.',
      'Sustainable habits form gradually, not through a single dramatic burst of effort.',
    ],
    mainIdea: { correctIdea: 'Lasting habits form through small consistent actions rather than relying on willpower alone.', distractors: ['How doctors prescribe medication dosages', 'Why hospitals schedule routine checkups', 'How pharmacies track prescription refills'] },
    supportingDetail: { lineIndex: 6, correctDetail: 'Removing friction, like keeping walking shoes by the door, helps consistency.', distractors: ['Adding more obstacles always improves habit consistency.', 'Friction has no effect on whether a habit sticks.', 'Habits form fastest without any environmental changes.'] },
    inference: { correctInference: 'Because willpower is unreliable, habits tied to consistent cues are likely more sustainable than relying on motivation alone.', distractors: ['Willpower is the most reliable tool for lasting change.', 'Habits form instantly regardless of any daily cue.', 'Setbacks always permanently undo prior habit progress.'] },
    causeEffect: { lineIndex: 3, cause: 'Linking a behavior to a specific daily cue', distractors: ['Relying purely on motivation each morning', 'Changing multiple habits all at once', 'Avoiding any tracking of progress'] },
    vocabularyInContext: { word: 'friction', lineIndex: 6, contextualMeaning: 'obstacles that make an action harder to do', distractors: ['a source of extra motivation', 'a type of physical exercise', 'a measurement of daily progress'] },
    bestTitle: { distractorTitles: ['A Guide to Home Renovation', 'The History of Modern Transportation', 'How Telescopes Detect Light'] },
    summarySelection: { correctSummary: 'Lasting habits form through small, cue-linked actions and reduced friction, not through willpower or dramatic effort alone.', distractors: ['Willpower alone is sufficient to build lasting habits.', 'Habits only stick when changed all at once.', 'Tracking progress has no effect on early motivation.'] },
    meaningRelationship: { lineIndexA: 1, lineIndexB: 2, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 3 contrasts with Line 2 by offering a more reliable alternative to willpower.', distractors: ['Line 3 restates the same idea as Line 2.', 'Line 3 gives a specific example of Line 2.', 'Line 3 explains what caused Line 2.'] },
  },
]

// ── Level 4 — ~220 words ────────────────────────────────────────────────

const LEVEL_4_RAW: readonly RawParagraph[] = [
  {
    id: 'l4-memory', level: 4, topic: 'memory', title: 'Memory and the Aging Brain',
    lines: [
      'As people age, it is common to notice certain changes in how memory functions.',
      'Retrieving names or recent details can take slightly longer than it once did.',
      'This is often a normal part of aging rather than a sign of serious decline.',
      'The brain’s processing speed naturally slows somewhat as the decades pass.',
      'However, many forms of memory, particularly long-held knowledge, tend to remain strong.',
      'Vocabulary and accumulated life experience often stay stable or even continue improving.',
      'Certain lifestyle habits appear to meaningfully protect memory and cognitive function.',
      'Regular physical exercise increases blood flow and supports healthy brain tissue.',
      'Staying socially engaged and mentally active also appears to build resilience.',
      'Learning new skills, even later in life, continues to stimulate brain connections.',
      'Chronic stress and poor sleep, by contrast, can accelerate cognitive decline.',
      'Researchers emphasize that aging and memory loss are not the same thing.',
      'Significant memory loss that disrupts daily life may signal an underlying condition.',
      'Understanding this distinction helps people respond appropriately rather than assume the worst.',
    ],
    mainIdea: { correctIdea: 'Memory changes with age, but certain habits help protect cognitive function.', distractors: ['How bones heal after a fracture', 'Why blood pressure varies throughout the day', 'How the digestive system processes fiber'] },
    supportingDetail: { lineIndex: 7, correctDetail: 'Regular physical exercise increases blood flow and supports healthy brain tissue.', distractors: ['Physical exercise has no measurable effect on the brain.', 'Exercise decreases blood flow to brain tissue.', 'Only mental activity, never physical activity, protects the brain.'] },
    inference: { correctInference: 'Because chronic stress and poor sleep can accelerate decline, managing them is likely important for protecting memory.', distractors: ['Stress and sleep have no connection to memory health.', 'All memory loss is a normal, harmless part of aging.', 'Learning new skills later in life provides no benefit.'] },
    causeEffect: { lineIndex: 10, cause: 'Chronic stress and poor sleep', distractors: ['Regular physical exercise', 'Learning a new skill', 'Staying socially engaged with friends'] },
    vocabularyInContext: { word: 'resilience', lineIndex: 8, contextualMeaning: 'the ability to recover from or withstand difficulty', distractors: ['a sudden decline in ability', 'a type of memory test', 'a measurement of blood pressure'] },
    bestTitle: { distractorTitles: ['A Guide to Bone Density', 'The History of Vaccination', 'How Muscles Generate Energy'] },
    summarySelection: { correctSummary: 'Aging brings normal memory changes, but exercise, social engagement, and learning help protect cognitive health over time.', distractors: ['Memory always declines sharply and unavoidably with age.', 'Lifestyle habits have no effect on cognitive aging.', 'Long-held knowledge fades faster than recent memories with age.'] },
    meaningRelationship: { lineIndexA: 2, lineIndexB: 4, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 5 contrasts with Line 3 by noting that some memory types remain strong despite general slowing.', distractors: ['Line 5 restates the same idea as Line 3.', 'Line 5 gives a specific example of Line 3.', 'Line 5 explains what caused Line 3.'] },
  },
  {
    id: 'l4-creativity', level: 4, topic: 'creativity', title: 'Creativity Under Constraint',
    lines: [
      'It might seem logical that unlimited freedom would produce the most creative results.',
      'In practice, however, research often shows the opposite pattern taking hold.',
      'When people face too many open options, creative output can actually decrease.',
      'Too much freedom can leave the mind overwhelmed rather than genuinely inspired.',
      'A well-chosen constraint, by contrast, gives creative thinking a useful starting point.',
      'Designers often report their best work emerging from strict client requirements.',
      'A tight budget or a short deadline can force unusually inventive solutions.',
      'Writers frequently use structural rules, like a fixed word count, to sharpen focus.',
      'These limits eliminate countless directions, narrowing attention toward a smaller, workable space.',
      'This narrowing seems to help the brain generate options more efficiently.',
      'Of course, constraints that are too extreme can still stifle creative thinking entirely.',
      'The most productive limits tend to challenge without completely blocking exploration.',
      'Finding that balance is itself considered a valuable creative skill.',
      'Many creative fields now deliberately use constraints as a practical training tool.',
    ],
    mainIdea: { correctIdea: 'Limitations often boost creative problem-solving rather than block it.', distractors: ['How companies calculate employee salaries', 'Why airports schedule flights around weather', 'How supermarkets manage inventory levels'] },
    supportingDetail: { lineIndex: 6, correctDetail: 'A tight budget or short deadline can force unusually inventive solutions.', distractors: ['Unlimited budgets always produce the most inventive solutions.', 'Deadlines have no measurable effect on creative output.', 'Tight budgets only ever reduce the quality of work.'] },
    inference: { correctInference: 'Because extreme constraints can stifle creativity, there is likely a balance point where limits are most helpful.', distractors: ['More constraints always produce better creative results without limit.', 'Constraints have no effect on creative thinking at all.', 'Only complete freedom can ever produce inventive solutions.'] },
    causeEffect: { lineIndex: 2, cause: 'Facing too many open options', distractors: ['Working under a tight deadline', 'Following a fixed word count', 'Receiving strict client requirements'] },
    vocabularyInContext: { word: 'stifle', lineIndex: 10, contextualMeaning: 'to suppress or prevent from developing', distractors: ['to strongly encourage and support', 'to measure or evaluate precisely', 'to publicly celebrate an achievement'] },
    bestTitle: { distractorTitles: ['A Guide to Airport Scheduling', 'The Basics of Inventory Management', 'How Salaries Are Calculated'] },
    summarySelection: { correctSummary: 'Well-chosen constraints, like tight deadlines or fixed rules, often boost creativity by narrowing focus, though extreme limits can backfire.', distractors: ['Unlimited freedom always produces the most creative results.', 'Constraints never have any effect on creative work.', 'Only professional designers benefit from creative limitations.'] },
    meaningRelationship: { lineIndexA: 3, lineIndexB: 4, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 5 contrasts with Line 4 by showing constraints as helpful rather than overwhelming.', distractors: ['Line 5 restates the same idea as Line 4.', 'Line 5 gives a specific example of Line 4.', 'Line 5 explains what caused Line 4.'] },
  },
  {
    id: 'l4-technology', level: 4, topic: 'technology', title: 'Artificial Intelligence and Everyday Life',
    lines: [
      'Artificial intelligence has moved from science fiction into everyday, practical use.',
      'These systems learn patterns by analyzing enormous amounts of existing data.',
      'Rather than following fixed rules, AI adjusts its behavior based on examples.',
      'Recommendation systems suggest movies, products, or songs based on past behavior.',
      'Voice assistants interpret spoken language and respond using trained language models.',
      'In healthcare, AI tools help doctors detect patterns in medical images faster.',
      'Self-driving vehicle systems rely on AI to interpret sensor data in real time.',
      'These systems must make rapid decisions to navigate safely among other traffic.',
      'Despite this progress, AI systems can still make confident but incorrect predictions.',
      'They generally lack true understanding, relying instead on statistical patterns in data.',
      'Bias present in training data can also lead to unfair or skewed outcomes.',
      'Researchers continue working to make these systems more transparent and accountable.',
      'As AI becomes more embedded in daily decisions, understanding its limits matters.',
      'Thoughtful use of AI depends on recognizing both its power and its limits.',
    ],
    mainIdea: { correctIdea: 'AI systems learn from data and increasingly shape everyday decisions.', distractors: ['How bridges distribute structural weight', 'Why ocean currents affect coastal weather', 'How farmers rotate crops between seasons'] },
    supportingDetail: { lineIndex: 5, correctDetail: 'AI tools help doctors detect patterns in medical images faster.', distractors: ['AI has no application in the medical field.', 'Doctors no longer review any medical images themselves.', 'Medical imaging requires no data analysis at all.'] },
    inference: { correctInference: 'Because AI relies on statistical patterns rather than true understanding, it can produce confident but incorrect predictions.', distractors: ['AI systems always understand context exactly like a human would.', 'AI predictions are never affected by the data used to train them.', 'Bias in training data has no effect on AI outcomes.'] },
    causeEffect: { lineIndex: 10, cause: 'Bias present in training data', distractors: ['Transparent, well-documented systems', 'Careful review by researchers', 'Slower, more deliberate decision-making'] },
    vocabularyInContext: { word: 'accountable', lineIndex: 11, contextualMeaning: 'responsible and answerable for outcomes', distractors: ['fast and efficient at processing', 'expensive to build and maintain', 'entirely automated without oversight'] },
    bestTitle: { distractorTitles: ['A Guide to Bridge Engineering', 'The History of Coastal Weather', 'How Crop Rotation Improves Soil'] },
    summarySelection: { correctSummary: 'AI learns from data to power everyday tools like assistants and diagnostics, but still risks bias and confident errors.', distractors: ['AI systems always produce perfectly accurate results.', 'AI has no meaningful role in healthcare or transportation.', 'Bias in training data is not a real concern.'] },
    meaningRelationship: { lineIndexA: 8, lineIndexB: 9, relationshipType: 'causes', correctRelationshipStatement: 'Line 10 explains a cause behind the problem described in Line 9 — a lack of true understanding.', distractors: ['Line 10 contradicts the claim made in Line 9.', 'Line 10 is unrelated to the idea in Line 9.', 'Line 10 restates the same idea as Line 9.'] },
  },
  {
    id: 'l4-history', level: 4, topic: 'history', title: 'How Trade Shaped Civilizations',
    lines: [
      'Long before modern shipping, ancient trade routes connected distant civilizations.',
      'The Silk Road linked merchants across Asia, the Middle East, and Europe.',
      'Traders carried silk, spices, precious metals, and countless other valuable goods.',
      'These physical goods, however, were far from the only thing exchanged.',
      'Ideas, religious beliefs, and technologies traveled alongside the merchant caravans.',
      'Papermaking techniques spread westward largely through these same overland trade networks.',
      'Cities positioned along major trade routes often grew wealthy and influential.',
      'Marketplaces became melting pots where different languages and customs intermingled.',
      'This constant contact gradually reshaped art, cuisine, and even architectural styles.',
      'Maritime trade routes later extended this exchange across entire oceans.',
      'European, African, and Asian ports became linked through growing sea trade.',
      'Trade also carried unintended consequences, including the spread of disease.',
      'Understanding these ancient networks helps explain how interconnected societies became.',
      'Many modern trade patterns still echo routes established many centuries ago.',
    ],
    mainIdea: { correctIdea: 'Trade routes spread goods, ideas, and culture across ancient civilizations.', distractors: ['How volcanic eruptions affect the atmosphere', 'Why certain metals resist corrosion', 'How modern satellites communicate with Earth'] },
    supportingDetail: { lineIndex: 5, correctDetail: 'Papermaking techniques spread westward through overland trade networks.', distractors: ['Papermaking was invented independently in every region.', 'Trade routes had no role in spreading technology.', 'Papermaking spread only by sea, never by land.'] },
    inference: { correctInference: 'Because trade carried disease alongside goods, expanding trade networks likely increased the spread of illness across regions.', distractors: ['Trade routes had no connection to the spread of disease.', 'Disease only spread through maritime trade, never overland.', 'Ancient trade eliminated the risk of illness entirely.'] },
    causeEffect: { lineIndex: 6, cause: 'A city’s position along a major trade route', distractors: ['A city’s distance from the ocean', 'A city’s climate and rainfall', 'A city’s population density alone'] },
    vocabularyInContext: { word: 'intermingled', lineIndex: 7, contextualMeaning: 'mixed together closely', distractors: ['remained completely separate', 'disappeared without a trace', 'competed violently for dominance'] },
    bestTitle: { distractorTitles: ['A Guide to Volcanic Activity', 'The Basics of Satellite Communication', 'How Metals Resist Corrosion'] },
    summarySelection: { correctSummary: 'Ancient trade routes like the Silk Road spread goods, ideas, technology, and culture, shaping interconnected civilizations.', distractors: ['Ancient trade routes carried only physical goods, never ideas.', 'Trade routes had little lasting influence on culture.', 'Maritime trade began before overland trade routes existed.'] },
    meaningRelationship: { lineIndexA: 2, lineIndexB: 4, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 5 contrasts with Line 3 by showing that non-physical things, not just goods, traveled along trade routes.', distractors: ['Line 5 restates the same idea as Line 3.', 'Line 5 gives a specific example of Line 3.', 'Line 5 explains what caused Line 3.'] },
  },
  {
    id: 'l4-science', level: 4, topic: 'science', title: 'The Scientific Method in Practice',
    lines: [
      'The scientific method is often taught as a simple, tidy, linear sequence of steps.',
      'In actual research, the process is usually far messier and more iterative.',
      'Scientists frequently revisit earlier steps as new information reshapes their questions.',
      'A promising hypothesis might be abandoned entirely after unexpected results appear.',
      'Replication, repeating an experiment to confirm results, plays a crucial role.',
      'A single study, however striking, rarely settles a scientific question on its own.',
      'Independent researchers must be able to reproduce findings using the same methods.',
      'When results fail to replicate, it raises important questions about the original study.',
      'Peer review adds another layer of scrutiny before findings reach publication.',
      'Reviewers examine methods, statistics, and reasoning for weaknesses or errors.',
      'Even published, peer-reviewed findings can later be revised or overturned.',
      'This built-in openness to correction distinguishes rigorous science from speculation.',
      'Trusting a scientific claim usually depends on this larger web of verification.',
      'No single experiment, no matter how compelling, stands entirely on its own.',
    ],
    mainIdea: { correctIdea: 'Rigorous testing and peer review separate reliable science from speculation.', distractors: ['How museums curate historical exhibits', 'Why airlines set ticket prices dynamically', 'How chefs balance flavors in a dish'] },
    supportingDetail: { lineIndex: 4, correctDetail: 'Replication means repeating an experiment to confirm its results.', distractors: ['Replication means publishing a study only once.', 'A single study is always sufficient to confirm a result.', 'Replication has no role in the scientific process.'] },
    inference: { correctInference: 'Because findings can be revised even after publication, scientific knowledge is likely always somewhat provisional.', distractors: ['Once published, a scientific finding can never be questioned again.', 'Peer review guarantees that a study contains no errors.', 'A single experiment is always enough to prove a claim.'] },
    causeEffect: { lineIndex: 7, cause: 'Results that fail to replicate', distractors: ['A study passing peer review smoothly', 'Independent researchers reproducing a finding', 'A hypothesis being confirmed on the first attempt'] },
    vocabularyInContext: { word: 'iterative', lineIndex: 1, contextualMeaning: 'involving repeated cycles of revision', distractors: ['completed in a single fixed step', 'entirely random and unpredictable', 'strictly controlled by one person'] },
    bestTitle: { distractorTitles: ['A Guide to Museum Curation', 'The Basics of Airline Pricing', 'How Chefs Balance Flavor'] },
    summarySelection: { correctSummary: 'Real scientific practice is iterative, relying on replication and peer review rather than a single tidy experiment.', distractors: ['The scientific method always follows a simple, fixed sequence.', 'A single study is enough to settle any question.', 'Peer review is an optional, rarely used step.'] },
    meaningRelationship: { lineIndexA: 8, lineIndexB: 10, relationshipType: 'supports', correctRelationshipStatement: 'Line 11 supports Line 9 by showing that scrutiny continues even after publication and peer review.', distractors: ['Line 11 contradicts the claim made in Line 9.', 'Line 11 is unrelated to the idea in Line 9.', 'Line 11 explains what caused Line 9.'] },
  },
]

// ── Level 5 — ~260 words ────────────────────────────────────────────────

const LEVEL_5_RAW: readonly RawParagraph[] = [
  {
    id: 'l5-human-brain', level: 5, topic: 'human-brain', title: 'Consciousness and the Limits of Understanding',
    lines: [
      'Despite remarkable advances in neuroscience, consciousness remains one of science’s deepest unsolved puzzles.',
      'Researchers can now map which brain regions activate during specific thoughts or sensations.',
      'Advanced imaging reveals correlations between neural activity and reported subjective experience.',
      'Yet correlation alone does not fully explain how physical brain activity produces experience itself.',
      'This gap between measurable brain activity and felt experience is often called the hard problem.',
      'Why should electrical signals in tissue give rise to the feeling of seeing red?',
      'Some theories propose that consciousness emerges from sufficiently complex information processing.',
      'Others argue that consciousness might be a more fundamental feature of the universe.',
      'Neither view currently commands universal agreement among philosophers or neuroscientists.',
      'Studying disorders of consciousness, like coma or vegetative states, offers valuable clues.',
      'These cases help researchers distinguish wakefulness from genuine conscious awareness.',
      'Artificial intelligence research has added new urgency to these old philosophical questions.',
      'If a sufficiently advanced system processes information in complex ways, is it conscious?',
      'Most researchers currently believe today’s AI systems are not conscious in any meaningful sense.',
      'Still, the question forces clearer thinking about what consciousness actually requires.',
      'Progress continues, but a complete, agreed-upon theory remains firmly out of reach.',
      'This humility, acknowledging what remains unknown, is itself considered good scientific practice.',
    ],
    mainIdea: { correctIdea: 'Despite advances, scientists still don’t fully understand what produces conscious experience.', distractors: ['How the immune system distinguishes friend from foe', 'Why bones repair themselves after a fracture', 'How the heart regulates its own rhythm'] },
    supportingDetail: { lineIndex: 9, correctDetail: 'Studying disorders of consciousness, like coma, offers valuable research clues.', distractors: ['Disorders of consciousness offer no useful research information.', 'Coma and wakefulness are considered identical states.', 'Consciousness research ignores medical case studies entirely.'] },
    inference: { correctInference: 'Because correlation doesn’t explain causation, mapping brain activity alone is likely insufficient to fully explain consciousness.', distractors: ['Mapping brain activity fully explains consciousness on its own.', 'Consciousness has already been completely explained by neuroscience.', 'Subjective experience has no relationship to brain activity at all.'] },
    causeEffect: { lineIndex: 4, cause: 'The gap between measurable brain activity and felt experience', distractors: ['Advances in brain imaging technology', 'Agreement among philosophers and scientists', 'Progress in artificial intelligence research'] },
    vocabularyInContext: { word: 'fundamental', lineIndex: 7, contextualMeaning: 'basic and essential, forming a foundation', distractors: ['rare and temporary', 'artificially created', 'easily measured'] },
    bestTitle: { distractorTitles: ['A Guide to Bone Healing', 'The History of Cardiac Medicine', 'How the Immune System Fights Infection'] },
    summarySelection: { correctSummary: 'Despite mapping brain activity, scientists still cannot fully explain how physical processes produce conscious experience.', distractors: ['Neuroscience has fully solved the mystery of consciousness.', 'Brain imaging alone explains why experience feels the way it does.', 'AI systems are now widely agreed to be conscious.'] },
    meaningRelationship: { lineIndexA: 2, lineIndexB: 3, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 4 contrasts with Line 3 by pointing out that correlation is not the same as full explanation.', distractors: ['Line 4 restates the same idea as Line 3.', 'Line 4 gives a specific example of Line 3.', 'Line 4 explains what caused Line 3.'] },
  },
  {
    id: 'l5-forests', level: 5, topic: 'forests', title: 'Forests as Climate Regulators',
    lines: [
      'Forests play a far larger role in regulating Earth’s climate than many people realize.',
      'Through photosynthesis, trees absorb carbon dioxide and store it within their wood and roots.',
      'This process makes forests one of the planet’s most significant natural carbon reservoirs.',
      'Tropical rainforests alone are estimated to store enormous amounts of carbon.',
      'When forests are cleared or burned, that stored carbon returns to the atmosphere.',
      'Deforestation therefore contributes significantly to rising global greenhouse gas levels.',
      'Beyond carbon storage, forests also influence rainfall patterns across entire regions.',
      'Trees release water vapor through their leaves in a process called transpiration.',
      'This moisture can travel great distances, contributing to rainfall far from the forest itself.',
      'The Amazon rainforest, for example, generates rainfall reaching well beyond South America.',
      'Losing large sections of forest can therefore disrupt distant agricultural regions.',
      'Forests additionally moderate local temperatures by providing shade and releasing moisture.',
      'Urban areas near forested land often experience measurably cooler summer temperatures.',
      'Protecting existing forests is considered one of the most cost-effective climate strategies.',
      'Reforestation efforts, while valuable, take decades to match a mature forest’s benefits.',
      'For this reason, many scientists emphasize preventing further deforestation above all else.',
    ],
    mainIdea: { correctIdea: 'Forests play a critical, measurable role in stabilizing the global climate.', distractors: ['How airplanes generate lift during flight', 'Why certain rocks form crystalline structures', 'How power grids distribute electricity'] },
    supportingDetail: { lineIndex: 9, correctDetail: 'The Amazon rainforest generates rainfall reaching well beyond South America.', distractors: ['The Amazon has no measurable effect on rainfall elsewhere.', 'Rainforest moisture never travels beyond its own region.', 'The Amazon rainforest reduces rainfall in nearby regions.'] },
    inference: { correctInference: 'Because reforestation takes decades to match a mature forest, preventing deforestation is likely more effective than replanting alone.', distractors: ['Reforestation instantly replaces the benefits of a lost mature forest.', 'Deforestation has no measurable effect on the climate.', 'Newly planted forests store as much carbon as old ones immediately.'] },
    causeEffect: { lineIndex: 4, cause: 'Forests being cleared or burned', distractors: ['Forests being carefully protected', 'Trees releasing water vapor', 'Rainfall increasing across a region'] },
    vocabularyInContext: { word: 'reservoirs', lineIndex: 2, contextualMeaning: 'large stores or supplies of something', distractors: ['rapid processes of decay', 'small, temporary containers', 'measurements of temperature'] },
    bestTitle: { distractorTitles: ['A Guide to Urban Architecture', 'The Basics of Electrical Grids', 'How Crystals Form in Rock'] },
    summarySelection: { correctSummary: 'Forests regulate climate by storing carbon, shaping rainfall patterns, and cooling nearby regions, making their protection critical.', distractors: ['Forests have little measurable effect on global climate.', 'Deforestation has no connection to greenhouse gas levels.', 'Reforestation immediately matches the benefits of mature forests.'] },
    meaningRelationship: { lineIndexA: 7, lineIndexB: 9, relationshipType: 'exemplifies', correctRelationshipStatement: 'Line 10 gives a specific example of the distant rainfall effect described generally in Line 9.', distractors: ['Line 10 contradicts the claim made in Line 9.', 'Line 10 is unrelated to the idea in Line 9.', 'Line 10 explains what caused Line 9.'] },
  },
  {
    id: 'l5-ocean-life', level: 5, topic: 'ocean-life', title: 'Coral Reefs Under Threat',
    lines: [
      'Coral reefs occupy less than one percent of the ocean floor, yet support enormous biodiversity.',
      'An estimated quarter of all marine species rely on reefs at some point in their lives.',
      'Coral itself is a living organism, built by tiny animals called polyps.',
      'These polyps form hard calcium carbonate skeletons that gradually build up over centuries.',
      'Within their tissue, corals host algae that supply them with essential nutrients.',
      'This partnership also gives healthy coral its characteristic vivid coloration.',
      'Rising ocean temperatures can stress this delicate relationship between coral and algae.',
      'Under prolonged heat stress, corals expel their algae in a process called bleaching.',
      'Bleached coral turns white and becomes far more vulnerable to disease and death.',
      'If temperatures cool quickly enough, some bleached coral can eventually recover.',
      'Prolonged or repeated bleaching events, however, often prove fatal to entire reefs.',
      'Ocean acidification, caused by absorbed carbon dioxide, adds a second serious threat.',
      'More acidic water makes it harder for coral to build its calcium skeleton.',
      'Pollution and destructive fishing practices compound these already significant pressures.',
      'Some regions have established protected marine areas to reduce direct human impact.',
      'Scientists are also researching heat-resistant coral strains that might survive warmer oceans.',
      'Protecting remaining healthy reefs is considered urgent given how slowly coral rebuilds.',
    ],
    mainIdea: { correctIdea: 'Coral reefs face mounting threats but remain vital to marine biodiversity.', distractors: ['How glaciers carve valleys over centuries', 'Why deserts experience extreme temperature swings', 'How volcanic islands form over time'] },
    supportingDetail: { lineIndex: 11, correctDetail: 'Ocean acidification makes it harder for coral to build its calcium skeleton.', distractors: ['Ocean acidification has no effect on coral skeletons.', 'More acidic water makes coral skeletons form faster.', 'Acidification only affects fish, never coral itself.'] },
    inference: { correctInference: 'Because coral rebuilds slowly over centuries, repeated bleaching events likely pose a greater long-term threat than a single event.', distractors: ['Coral rebuilds itself within a few days after damage.', 'Bleaching events have no lasting effect on a reef.', 'Reefs recover instantly once temperatures cool at all.'] },
    causeEffect: { lineIndex: 7, cause: 'Prolonged heat stress on coral', distractors: ['Cooler than average ocean temperatures', 'A reduction in ocean acidity', 'An increase in protected marine areas'] },
    vocabularyInContext: { word: 'compound', lineIndex: 13, contextualMeaning: 'to make a problem worse by adding to it', distractors: ['to completely resolve a problem', 'to measure something precisely', 'to slow down a natural process'] },
    bestTitle: { distractorTitles: ['A Guide to Glacier Formation', 'The Basics of Volcanic Islands', 'How Deserts Regulate Temperature'] },
    summarySelection: { correctSummary: 'Coral reefs support vast biodiversity but face threats from warming, acidification, and pollution that outpace their slow recovery.', distractors: ['Coral reefs are unaffected by rising ocean temperatures.', 'Bleached coral always recovers quickly and fully.', 'Ocean acidification poses no real threat to coral.'] },
    meaningRelationship: { lineIndexA: 6, lineIndexB: 11, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 12 contrasts with Line 7 by introducing a second, separate threat beyond rising temperatures.', distractors: ['Line 12 restates the same idea as Line 7.', 'Line 12 gives a specific example of Line 7.', 'Line 12 explains what caused Line 7.'] },
  },
  {
    id: 'l5-space', level: 5, topic: 'space', title: 'The Challenge of Interstellar Travel',
    lines: [
      'Traveling to even the nearest star beyond our solar system presents enormous physical challenges.',
      'Proxima Centauri, the closest known star, lies more than four light-years from Earth.',
      'At the speed of today’s fastest spacecraft, such a journey would take tens of thousands of years.',
      'Reaching even a meaningful fraction of light speed would require staggering amounts of energy.',
      'Current propulsion technology, built mostly on chemical rockets, falls drastically short.',
      'Some researchers propose nuclear propulsion as a way to dramatically increase spacecraft speed.',
      'Others explore theoretical concepts like solar sails, pushed forward by focused light.',
      'Even with breakthroughs, relativistic effects complicate travel as speeds approach light speed.',
      'Time would pass differently for travelers moving at extreme velocities compared to those on Earth.',
      'This means a multi-year journey for astronauts could correspond to decades back home.',
      'Radiation exposure during a long interstellar journey also poses serious risks to human health.',
      'Shielding a spacecraft adequately would add significant mass and engineering complexity.',
      'Some scientists instead propose sending small, unmanned probes rather than crewed missions.',
      'Miniaturized probes could theoretically be accelerated to a meaningful fraction of light speed.',
      'Communicating with such a probe would still involve years of signal delay each way.',
      'Given these combined obstacles, most scientists view interstellar travel as centuries away.',
      'Even so, ongoing research continues to explore whether new physics might change that outlook.',
    ],
    mainIdea: { correctIdea: 'Current physics makes travel beyond our solar system extraordinarily difficult.', distractors: ['How commercial airlines optimize fuel efficiency', 'Why ocean liners use ballast for stability', 'How trains manage speed on curved tracks'] },
    supportingDetail: { lineIndex: 10, correctDetail: 'Radiation exposure during a long interstellar journey poses serious health risks.', distractors: ['Radiation poses no risk during interstellar travel.', 'Spacecraft require no shielding for long journeys.', 'Radiation exposure only affects unmanned probes, not astronauts.'] },
    inference: { correctInference: 'Because relativistic time differs at extreme speeds, a fast interstellar journey could mean returning to a very different Earth.', distractors: ['Time passes identically for travelers and those left on Earth.', 'Relativistic effects only matter for unmanned probes.', 'Faster-than-light travel is already technologically achievable today.'] },
    causeEffect: { lineIndex: 4, cause: 'Reliance on chemical rocket propulsion', distractors: ['The use of nuclear propulsion systems', 'The development of solar sail technology', 'Advances in spacecraft shielding design'] },
    vocabularyInContext: { word: 'relativistic', lineIndex: 7, contextualMeaning: 'relating to effects that occur near the speed of light', distractors: ['relating to family connections', 'relating to chemical reactions', 'relating to atmospheric pressure'] },
    bestTitle: { distractorTitles: ['A Guide to Commercial Aviation', 'The Basics of Railway Engineering', 'How Ocean Liners Stay Balanced'] },
    summarySelection: { correctSummary: 'Reaching even the nearest star requires overcoming enormous energy, time-dilation, and radiation challenges beyond current technology.', distractors: ['Interstellar travel is already achievable with current rockets.', 'The nearest star is only a short journey away.', 'Radiation and time dilation pose no real obstacles to travel.'] },
    meaningRelationship: { lineIndexA: 4, lineIndexB: 5, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 6 contrasts with Line 5 by proposing an alternative to the chemical propulsion described as falling short.', distractors: ['Line 6 restates the same idea as Line 5.', 'Line 6 gives a specific example of Line 5.', 'Line 6 explains what caused Line 5.'] },
  },
  {
    id: 'l5-healthy-habits', level: 5, topic: 'healthy-habits', title: 'The Compounding Effect of Daily Choices',
    lines: [
      'A single healthy choice, viewed in isolation, rarely seems significant enough to matter much.',
      'Skipping one dessert or taking one extra walk feels almost negligible in the moment.',
      'Yet research on habit formation suggests these small choices compound significantly over time.',
      'Much like financial interest, small consistent gains accumulate into substantial long-term results.',
      'A daily habit repeated for a full year represents hundreds of individual repetitions.',
      'Each repetition slightly strengthens the neural pathways associated with that behavior.',
      'This is part of why habits eventually start to feel automatic rather than effortful.',
      'The compounding effect also applies in the opposite, less helpful direction.',
      'Small unhealthy choices, repeated consistently, can gradually accumulate into serious health effects.',
      'This is precisely why occasional indulgence differs meaningfully from a persistent daily pattern.',
      'Behavioral researchers emphasize consistency over intensity when building lasting change.',
      'A modest, sustainable habit practiced daily often outperforms an intense but short-lived effort.',
      'This is because sustainable habits are far more likely to actually continue long-term.',
      'Motivation naturally fluctuates, but well-established systems continue functioning during low-motivation periods.',
      'Designing an environment that supports good choices reduces reliance on willpower.',
      'Over months and years, these accumulated choices meaningfully shape long-term health outcomes.',
      'Recognizing this compounding effect can make small daily choices feel genuinely worthwhile.',
    ],
    mainIdea: { correctIdea: 'Small daily health choices compound into significant long-term outcomes.', distractors: ['How banks calculate mortgage interest rates', 'Why airlines adjust ticket prices seasonally', 'How factories schedule production shifts'] },
    supportingDetail: { lineIndex: 10, correctDetail: 'Researchers emphasize consistency over intensity when building lasting change.', distractors: ['Researchers emphasize intensity over consistency for lasting change.', 'Consistency has no measurable effect on habit formation.', 'A single intense effort always outperforms daily consistency.'] },
    inference: { correctInference: 'Because motivation naturally fluctuates, relying on systems rather than willpower alone likely produces more consistent results.', distractors: ['Motivation remains perfectly constant for most people.', 'Willpower alone is sufficient for lasting behavior change.', 'Environmental design has no effect on daily choices.'] },
    causeEffect: { lineIndex: 5, cause: 'Repeating a daily habit many times', distractors: ['Skipping a habit for a single day', 'Relying on motivation instead of routine', 'Designing an unsupportive environment'] },
    vocabularyInContext: { word: 'negligible', lineIndex: 1, contextualMeaning: 'too small to be significant', distractors: ['extremely important and central', 'measured with great precision', 'repeated many times over'] },
    bestTitle: { distractorTitles: ['A Guide to Mortgage Interest', 'The Basics of Factory Scheduling', 'How Airlines Set Ticket Prices'] },
    summarySelection: { correctSummary: 'Small daily choices, repeated consistently, compound into major long-term health outcomes, more reliably than occasional intense effort.', distractors: ['Only large, dramatic health changes ever produce real results.', 'Daily habits have no meaningful effect on long-term health.', 'Motivation, not consistency, is the key to lasting change.'] },
    meaningRelationship: { lineIndexA: 2, lineIndexB: 7, relationshipType: 'contrasts', correctRelationshipStatement: 'Line 8 contrasts with Line 3 by applying the same compounding idea to unhealthy rather than healthy choices.', distractors: ['Line 8 restates the same idea as Line 3.', 'Line 8 gives a specific example of Line 3.', 'Line 8 explains what caused Line 3.'] },
  },
]

export const PARAGRAPH_LIBRARY: Record<ParagraphReadingLevel, readonly ParagraphContent[]> = {
  1: resolve(LEVEL_1_RAW),
  2: resolve(LEVEL_2_RAW),
  3: resolve(LEVEL_3_RAW),
  4: resolve(LEVEL_4_RAW),
  5: resolve(LEVEL_5_RAW),
}

// Picks one paragraph for a level, preferring one not already used this
// session so consecutive missions within the same level feel different.
// Falls back to the full level pool (allowing reuse) rather than failing —
// the same "never fabricate, degrade gracefully" principle every dataset
// in this codebase follows.
export function getParagraphForLevel(
  level: ParagraphReadingLevel,
  excludeIds: ReadonlySet<string> = new Set(),
  seed = 1,
): ParagraphContent {
  const pool = PARAGRAPH_LIBRARY[level]
  const fresh = pool.filter((p) => !excludeIds.has(p.id))
  const candidatePool = fresh.length > 0 ? fresh : pool
  const index = Math.abs(Math.floor(Math.sin(seed) * 10000)) % candidatePool.length
  return candidatePool[index]!
}

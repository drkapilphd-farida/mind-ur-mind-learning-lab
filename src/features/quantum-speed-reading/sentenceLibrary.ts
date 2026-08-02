// Sentence Reading™ Library — the "Mini Learning Chapter" content model.
// This is a full architectural replacement of the mission's earlier
// standalone-sentence dataset: content is no longer a flat pool of
// interchangeable sentences, it's THEMED CHAPTERS — exactly 5 complete
// sentences per chapter, all belonging to the level's single locked
// theme, read together before any question appears. Every Brain
// Challenge question tests comprehension of the WHOLE chapter, never an
// individual sentence in isolation.
//
// Theme lock: the brief lists ~20 example themes in the abstract, but its
// own "Level Progression" section locks exactly 5 to real levels — those
// 5 are what's built. The wider list is documented here as future
// vocabulary (for levels/missions beyond this pack's current 5), not
// implemented.
//
// Every whole-chapter distractor field is authored PER CHAPTER, never
// pooled across chapters — a chapter's "true statement" or "cause and
// effect" is inherently anchored to its own 5 sentences, and pooling
// across chapters would either leak a different theme's content or
// require same-theme cross-chapter pooling too small to be meaningful at
// this dataset's size. `notMentioned` is the one inverted-logic type: its
// correct answer (`absentIdea`) is a hand-authored, plausible-but-
// genuinely-absent fact; its 3 wrong options are pulled MECHANICALLY from
// `sentences[i].gloss` via `mentionedGlossIndices` — guaranteeing they're
// always real, traceable chapter content, never re-typed or at risk of
// drifting out of sync with the actual sentences.
//
// Scope, disclosed: 2 chapters per level (10 total), not 3 — each chapter
// requires ~30 coordinated pieces of hand-authored content (5 sentences +
// title + 4 field-groups of 1-correct-plus-3-distractors + 1 notMentioned
// pair), a materially larger per-unit authoring load than a standalone
// sentence ever was. 2/level still gives genuine retry variety (a
// Try-Again pulls the other chapter) while keeping total authored volume
// realistic — the same "quality over aspirational quantity" judgment
// every dataset in this pack already applies.

import type { SentenceReadingLevel } from './sentenceDifficulty'

export type SentenceReadingTheme = 'nature' | 'science' | 'health' | 'technology' | 'psychology'

export const SENTENCE_THEME_BY_LEVEL: Record<SentenceReadingLevel, SentenceReadingTheme> = {
  1: 'nature',
  2: 'science',
  3: 'health',
  4: 'technology',
  5: 'psychology',
}

export const SENTENCE_THEME_NAME: Record<SentenceReadingTheme, string> = {
  nature: 'Nature',
  science: 'Science',
  health: 'Health',
  technology: 'Technology',
  psychology: 'Psychology',
}

export type ChapterSentence = {
  text: string
  gloss: string
}

// QSR-ENGINE-SWAP-1 — every field below except `sentences` is now
// OPTIONAL. Every existing hardcoded chapter still provides all of them
// (unaffected — a fully-populated object satisfies an optional-field
// type exactly as it satisfied a required one), so no hardcoded content
// or behavior changes. This is what lets a real-per-document chapter
// (built from `SentenceAsset[]`, which has no theme/title/distractor
// content) supply only `sentences`, with sentenceEngine.ts's own new
// presence guards (mirroring phraseEngine.ts's existing
// resolveUsableChallengeType) skipping any type whose field is absent —
// never fabricating one.
export type SentenceChapter = {
  id: string
  level: SentenceReadingLevel
  theme?: SentenceReadingTheme
  chapterTitle?: string
  sentences: readonly [ChapterSentence, ChapterSentence, ChapterSentence, ChapterSentence, ChapterSentence]
  trueStatement?: {
    sentenceIndex: 0 | 1 | 2 | 3 | 4
    trueParaphrase: string
    falseStatements: readonly [string, string, string]
  }
  chapterSummary?: {
    correctSummary: string
    distractors: readonly [string, string, string]
  }
  mainIdea?: {
    correctIdea: string
    distractors: readonly [string, string, string]
  }
  notMentioned?: {
    absentIdea: string
    mentionedGlossIndices: readonly [0 | 1 | 2 | 3 | 4, 0 | 1 | 2 | 3 | 4, 0 | 1 | 2 | 3 | 4]
  }
  bestTitle?: {
    distractorTitles: readonly [string, string, string]
  }
  causeEffect?: {
    sentenceIndex: 0 | 1 | 2 | 3 | 4
    cause: string
    distractors: readonly [string, string, string]
  }
  meaningMatch?: {
    sentenceIndex: 0 | 1 | 2 | 3 | 4
    correctParaphrase: string
    distractors: readonly [string, string, string]
  }
}

// ── Level 1 — Nature — 6-8 words/sentence ──────────────────────────────
const NATURE_1: SentenceChapter = {
  id: 'nature-1', level: 1, theme: 'nature', chapterTitle: "Nature's Balance",
  sentences: [
    { text: 'Birds build nests in tall forest trees.', gloss: 'Birds build nests' },
    { text: 'Plants need plenty of sunlight to grow.', gloss: 'Plants need sunlight' },
    { text: 'Rain fills rivers and lakes each year.', gloss: 'Rain fills rivers' },
    { text: 'Trees quietly produce fresh oxygen for animals.', gloss: 'Trees produce oxygen' },
    { text: 'Colorful leaves fall gently during cool autumn.', gloss: 'Leaves fall in autumn' },
  ],
  trueStatement: {
    sentenceIndex: 1,
    trueParaphrase: 'Plants require sunlight to grow properly.',
    falseStatements: ['Plants grow better in complete darkness.', 'Trees absorb oxygen instead of producing it.', 'Rain has no effect on rivers or lakes.'],
  },
  chapterSummary: {
    correctSummary: 'Nature relies on sunlight, rain, and trees to thrive.',
    distractors: ['A new smartphone was released this month.', 'The football team won the championship game.', 'Investors raised funds for a new startup.'],
  },
  mainIdea: {
    correctIdea: 'How nature sustains itself',
    distractors: ['How computers process information', 'How athletes train for competitions', 'How companies raise money'],
  },
  notMentioned: {
    absentIdea: 'Deserts receive very little rainfall',
    mentionedGlossIndices: [0, 2, 4],
  },
  bestTitle: {
    distractorTitles: ['Building a Business Plan', 'Training for a Marathon', 'Learning to Cook Pasta'],
  },
  causeEffect: {
    sentenceIndex: 2,
    cause: 'Rain falling regularly',
    distractors: ['Strong winds blowing daily', 'Trees losing their leaves', 'Birds migrating each winter'],
  },
  meaningMatch: {
    sentenceIndex: 3,
    correctParaphrase: 'Trees generate oxygen that animals need.',
    distractors: ['Trees consume oxygen produced by animals.', 'Animals produce oxygen for trees.', 'Trees have no effect on oxygen levels.'],
  },
}

const NATURE_2: SentenceChapter = {
  id: 'nature-2', level: 1, theme: 'nature', chapterTitle: 'Life in the Wild',
  sentences: [
    { text: 'Wolves usually hunt together in small packs.', gloss: 'Wolves hunt in packs' },
    { text: 'Bees carry pollen from flower to flower.', gloss: 'Bees carry pollen' },
    { text: 'Mountains form slowly over many long years.', gloss: 'Mountains form slowly' },
    { text: 'Coral reefs shelter countless small sea creatures.', gloss: 'Reefs shelter sea life' },
    { text: 'Deserts stay extremely dry throughout the year.', gloss: 'Deserts stay dry' },
  ],
  trueStatement: {
    sentenceIndex: 0,
    trueParaphrase: 'Wolves typically hunt as a group.',
    falseStatements: ['Wolves always hunt completely alone.', 'Bees never interact with flowers.', 'Mountains form within a single day.'],
  },
  chapterSummary: {
    correctSummary: 'Wild habitats each support their own unique forms of life.',
    distractors: ['A company launched a new mobile app.', 'Fans cheered at the basketball final.', 'The city opened a new shopping mall.'],
  },
  mainIdea: {
    correctIdea: 'How wild habitats support life',
    distractors: ['How factories manufacture products', 'How teams win sports championships', 'How stores attract more customers'],
  },
  notMentioned: {
    absentIdea: 'Rivers flow faster during the spring',
    mentionedGlossIndices: [1, 2, 3],
  },
  bestTitle: {
    distractorTitles: ['Managing a Household Budget', 'Preparing for a Job Interview', 'Choosing the Right Laptop'],
  },
  causeEffect: {
    sentenceIndex: 1,
    cause: 'Bees moving between flowers',
    distractors: ['Wolves traveling in packs', 'Mountains rising over time', 'Deserts losing moisture'],
  },
  meaningMatch: {
    sentenceIndex: 3,
    correctParaphrase: 'Coral reefs provide a home for sea life.',
    distractors: ['Coral reefs are dangerous to all sea life.', 'Sea creatures destroy coral reefs completely.', 'Coral reefs exist only on dry land.'],
  },
}

// ── Level 2 — Science — 8-10 words/sentence ────────────────────────────
const SCIENCE_1: SentenceChapter = {
  id: 'science-1', level: 2, theme: 'science', chapterTitle: 'The Scientific Method',
  sentences: [
    { text: 'Scientists test their ideas using careful, repeated experiments.', gloss: 'Scientists test ideas' },
    { text: 'A hypothesis is simply an idea waiting to be tested.', gloss: 'Hypotheses need testing' },
    { text: 'Data collected from experiments reveals important scientific patterns.', gloss: 'Data reveals patterns' },
    { text: 'Peer review helps confirm that research findings are accurate.', gloss: 'Peer review confirms findings' },
    { text: 'Curiosity drives scientists to keep asking new questions.', gloss: 'Curiosity drives discovery' },
  ],
  trueStatement: {
    sentenceIndex: 1,
    trueParaphrase: 'A hypothesis is an idea that must be tested.',
    falseStatements: ['A hypothesis is always proven true immediately.', 'Scientists never test their own ideas.', 'Data collection has no role in science.'],
  },
  chapterSummary: {
    correctSummary: 'Science advances through testing, evidence, and careful review.',
    distractors: ['A chef prepared a new seasonal menu.', 'A band released their newest album.', 'A city built a new sports stadium.'],
  },
  mainIdea: {
    correctIdea: 'How the scientific method works',
    distractors: ['How musicians write new songs', 'How chefs plan restaurant menus', 'How cities design public parks'],
  },
  notMentioned: {
    absentIdea: 'Laboratories must always be kept extremely cold',
    mentionedGlossIndices: [0, 2, 3],
  },
  bestTitle: {
    distractorTitles: ['A Guide to Home Gardening', 'The History of Jazz Music', 'Tips for Better Sleep'],
  },
  causeEffect: {
    sentenceIndex: 3,
    cause: 'Other scientists reviewing the research',
    distractors: ['A shortage of laboratory funding', 'A change in university leadership', 'A delay in publishing the journal'],
  },
  meaningMatch: {
    sentenceIndex: 4,
    correctParaphrase: 'Curiosity pushes scientists to keep questioning.',
    distractors: ['Curiosity stops scientists from asking questions.', 'Scientists avoid curiosity during research.', 'Questions prevent scientific curiosity entirely.'],
  },
}

const SCIENCE_2: SentenceChapter = {
  id: 'science-2', level: 2, theme: 'science', chapterTitle: 'Matter and Energy',
  sentences: [
    { text: 'All atoms combine together to form every material substance.', gloss: 'Atoms form matter' },
    { text: 'Energy cannot simply be created or ever destroyed.', gloss: 'Energy is conserved' },
    { text: 'Heat always flows naturally from hot to cold objects.', gloss: 'Heat flows to cold' },
    { text: 'Light travels incredibly fast through empty outer space.', gloss: 'Light travels fast' },
    { text: 'Gravity pulls every object steadily toward the ground.', gloss: 'Gravity pulls objects down' },
  ],
  trueStatement: {
    sentenceIndex: 2,
    trueParaphrase: 'Heat moves naturally from hot objects to cold ones.',
    falseStatements: ['Heat always flows from cold objects to hot ones.', 'Light travels slower than sound in space.', 'Gravity pushes objects away from the ground.'],
  },
  chapterSummary: {
    correctSummary: 'Physical laws govern matter, energy, heat, light, and gravity.',
    distractors: ['A restaurant introduced a new dessert menu.', 'A team signed a new star player.', 'An airline launched a new travel route.'],
  },
  mainIdea: {
    correctIdea: 'The basic laws of physics',
    distractors: ['The rules of professional sports', 'The steps of baking bread', 'The stages of building a house'],
  },
  notMentioned: {
    absentIdea: 'Sound waves travel slower underwater than in air',
    mentionedGlossIndices: [0, 1, 3],
  },
  bestTitle: {
    distractorTitles: ['Planning a Summer Vacation', 'How to Write a Resume', 'The Basics of Photography'],
  },
  causeEffect: {
    sentenceIndex: 4,
    cause: 'The force of gravity',
    distractors: ['A sudden gust of wind', 'A change in air temperature', 'The rotation of the Earth'],
  },
  meaningMatch: {
    sentenceIndex: 1,
    correctParaphrase: 'Energy is always conserved, never created or destroyed.',
    distractors: ['Energy can be created freely at any time.', 'Energy disappears completely over time.', 'Energy has no relationship to physics.'],
  },
}

// ── Level 3 — Health — 10-12 words/sentence ────────────────────────────
const HEALTH_1: SentenceChapter = {
  id: 'health-1', level: 3, theme: 'health', chapterTitle: 'Foundations of Good Health',
  sentences: [
    { text: 'Regular exercise strengthens the heart and improves overall blood circulation.', gloss: 'Exercise strengthens the heart' },
    { text: 'Drinking enough water each day keeps the body properly hydrated.', gloss: 'Water keeps the body hydrated' },
    { text: 'A balanced diet provides the nutrients the body truly needs.', gloss: 'Diet provides nutrients' },
    { text: 'Quality sleep allows the brain and body to fully recover.', gloss: 'Sleep allows recovery' },
    { text: 'Managing daily stress calmly protects both mental and physical health.', gloss: 'Managing stress protects health' },
  ],
  trueStatement: {
    sentenceIndex: 3,
    trueParaphrase: 'Good sleep helps the brain and body recover fully.',
    falseStatements: ['Sleep has no effect on brain recovery.', 'Drinking water dehydrates the body over time.', 'Exercise weakens the heart with regular use.'],
  },
  chapterSummary: {
    correctSummary: 'Good health depends on exercise, hydration, diet, sleep, and stress control.',
    distractors: ['A software company released a new update.', 'A museum opened a new art exhibit.', 'A city expanded its public transit system.'],
  },
  mainIdea: {
    correctIdea: 'The habits that build good health',
    distractors: ['The habits that grow a business', 'The habits that improve public transit', 'The habits that create great art'],
  },
  notMentioned: {
    absentIdea: 'Sunlight exposure improves vitamin D levels',
    mentionedGlossIndices: [0, 2, 4],
  },
  bestTitle: {
    distractorTitles: ['A History of Modern Architecture', 'Strategies for Winning Chess', 'The Rise of Online Shopping'],
  },
  causeEffect: {
    sentenceIndex: 0,
    cause: 'Regular exercise',
    distractors: ['A sudden change in weather', 'A new work schedule', 'A shift in daily commute'],
  },
  meaningMatch: {
    sentenceIndex: 1,
    correctParaphrase: "Staying hydrated keeps the body functioning properly.",
    distractors: ["Drinking water harms the body's hydration.", "The body needs no water to function.", 'Hydration has no link to daily health.'],
  },
}

const HEALTH_2: SentenceChapter = {
  id: 'health-2', level: 3, theme: 'health', chapterTitle: 'Understanding the Human Body',
  sentences: [
    { text: 'The human heart pumps blood throughout the entire body constantly.', gloss: 'The heart pumps blood' },
    { text: 'Lungs absorb oxygen and release carbon dioxide with every breath.', gloss: 'Lungs exchange oxygen' },
    { text: 'Bones support the body and protect its most delicate organs.', gloss: 'Bones protect organs' },
    { text: 'Muscles slowly contract and relax to produce controlled physical movement.', gloss: 'Muscles produce movement' },
    { text: 'The brain constantly processes signals sent from every body part.', gloss: 'The brain processes signals' },
  ],
  trueStatement: {
    sentenceIndex: 1,
    trueParaphrase: 'Lungs take in oxygen and release carbon dioxide.',
    falseStatements: ['Lungs release oxygen and absorb carbon dioxide.', 'Bones have no role in protecting organs.', 'The heart does not pump blood at all.'],
  },
  chapterSummary: {
    correctSummary: "The body's heart, lungs, bones, muscles, and brain work together.",
    distractors: ['A new car model was unveiled this week.', 'A retailer announced a holiday sale.', 'A film won several major awards.'],
  },
  mainIdea: {
    correctIdea: "How the body's systems work together",
    distractors: ['How retailers plan sales events', 'How films win major awards', 'How car companies design new models'],
  },
  notMentioned: {
    absentIdea: 'Skin protects the body from harmful bacteria',
    mentionedGlossIndices: [0, 2, 4],
  },
  bestTitle: {
    distractorTitles: ["A Beginner's Guide to Painting", 'The Art of Public Speaking', 'Tips for Effective Networking'],
  },
  causeEffect: {
    sentenceIndex: 3,
    cause: 'Muscles contracting and relaxing',
    distractors: ['A sudden drop in body temperature', 'An increase in daily screen time', 'A change in sleeping position'],
  },
  meaningMatch: {
    sentenceIndex: 4,
    correctParaphrase: 'The brain constantly interprets signals from the body.',
    distractors: ['The brain ignores all signals from the body.', 'The body sends no signals to the brain.', 'Signals only travel from the brain outward.'],
  },
}

// ── Level 4 — Technology — 12-16 words/sentence ────────────────────────
const TECHNOLOGY_1: SentenceChapter = {
  id: 'technology-1', level: 4, theme: 'technology', chapterTitle: 'How Modern Technology Works',
  sentences: [
    { text: 'Computers process enormous amounts of information using millions of tiny electronic circuits.', gloss: 'Computers process information' },
    { text: 'The internet connects billions of devices across the entire world almost instantly.', gloss: 'The internet connects devices' },
    { text: 'Smartphones combine a camera, a computer, and a phone into one small device.', gloss: 'Smartphones combine many tools' },
    { text: 'Artificial intelligence carefully learns patterns from data to make increasingly accurate predictions.', gloss: 'AI learns from data' },
    { text: 'Cloud storage lets people safely save their files on distant remote servers.', gloss: 'Cloud storage saves files remotely' },
  ],
  trueStatement: {
    sentenceIndex: 3,
    trueParaphrase: 'Artificial intelligence uses data to improve its predictions over time.',
    falseStatements: ['Artificial intelligence never learns from any data.', 'Smartphones cannot combine multiple functions into one device.', 'The internet only connects devices within a single country.'],
  },
  chapterSummary: {
    correctSummary: 'Modern technology connects devices, processes data, and learns from patterns.',
    distractors: ['A farmer harvested crops early this season.', 'A theater premiered a new stage production.', 'A gym opened a new fitness class.'],
  },
  mainIdea: {
    correctIdea: 'How modern technology connects and processes information',
    distractors: ["How farmers plan their harvest schedule", 'How theaters produce new stage shows', 'How gyms design fitness programs'],
  },
  notMentioned: {
    absentIdea: 'Robots are now used to build most furniture',
    mentionedGlossIndices: [0, 2, 4],
  },
  bestTitle: {
    distractorTitles: ['A Complete Guide to Baking Bread', 'The History of Ancient Trade Routes', 'Tips for Growing Indoor Plants'],
  },
  causeEffect: {
    sentenceIndex: 1,
    cause: 'The internet connecting billions of devices',
    distractors: ['A rise in printed newspaper sales', 'A shortage of computer manufacturing parts', 'A change in international shipping routes'],
  },
  meaningMatch: {
    sentenceIndex: 2,
    correctParaphrase: 'A smartphone merges several devices into just one.',
    distractors: ['A smartphone can only be used as a phone.', 'Cameras and computers cannot fit into phones.', 'Smartphones replaced cameras entirely worldwide.'],
  },
}

const TECHNOLOGY_2: SentenceChapter = {
  id: 'technology-2', level: 4, theme: 'technology', chapterTitle: 'The Rise of Automation',
  sentences: [
    { text: 'Factories increasingly use robotic arms to assemble products with remarkable speed and precision.', gloss: 'Robots assemble products quickly' },
    { text: 'Self-driving cars use sensors and cameras to navigate busy city streets safely.', gloss: 'Self-driving cars use sensors' },
    { text: 'Automated software now handles repetitive tasks that once required many human workers.', gloss: 'Software automates repetitive tasks' },
    { text: 'Voice assistants respond instantly to spoken commands using advanced speech recognition technology.', gloss: 'Voice assistants recognize speech' },
    { text: 'Drones deliver packages quickly by flying directly over congested city traffic below.', gloss: 'Drones deliver packages by air' },
  ],
  trueStatement: {
    sentenceIndex: 2,
    trueParaphrase: 'Automated software now performs tasks once done by people.',
    falseStatements: ['Automated software cannot handle any repetitive tasks.', 'Voice assistants ignore all spoken commands entirely.', 'Drones are unable to fly over city traffic.'],
  },
  chapterSummary: {
    correctSummary: 'Automation is reshaping factories, driving, software, and delivery systems.',
    distractors: ['A bakery introduced a new bread recipe.', 'A stadium hosted a major concert event.', "A library expanded its children's book section."],
  },
  mainIdea: {
    correctIdea: 'How automation is changing everyday tasks',
    distractors: ['How bakeries develop new recipes', 'How stadiums plan concert events', 'How libraries organize their book sections'],
  },
  notMentioned: {
    absentIdea: 'Wearable devices now track heart rate continuously',
    mentionedGlossIndices: [1, 3, 4],
  },
  bestTitle: {
    distractorTitles: ['A Guide to Classical Literature', 'The Fundamentals of Interior Design', 'Preparing for a Long Road Trip'],
  },
  causeEffect: {
    sentenceIndex: 0,
    cause: 'Robotic arms in factories',
    distractors: ['A shortage of factory floor space', 'A change in product packaging design', 'An increase in factory operating hours'],
  },
  meaningMatch: {
    sentenceIndex: 3,
    correctParaphrase: 'Voice assistants understand and react to spoken words quickly.',
    distractors: ['Voice assistants cannot understand spoken words.', 'Spoken commands slow down voice assistants.', 'Voice assistants only respond to typed text.'],
  },
}

// ── Level 5 — Psychology — 16-22 words/sentence ────────────────────────
const PSYCHOLOGY_1: SentenceChapter = {
  id: 'psychology-1', level: 5, theme: 'psychology', chapterTitle: 'How the Mind Learns',
  sentences: [
    { text: 'Psychologists have found that people who write down their goals are significantly more likely to achieve them.', gloss: 'Writing goals improves achievement' },
    { text: 'Repeated, consistent practice gradually strengthens the neural connections responsible for forming lasting long-term memories over time.', gloss: 'Practice strengthens memory' },
    { text: 'People who pause briefly before responding under real pressure tend to make noticeably better decisions overall.', gloss: 'Pausing improves decisions' },
    { text: 'A genuinely positive mindset can meaningfully influence how a person handles unexpected daily stress and setbacks.', gloss: 'Mindset affects stress response' },
    { text: 'Strong social connection with friends and family plays a powerful role in supporting long-term mental wellbeing.', gloss: 'Social connection supports wellbeing' },
  ],
  trueStatement: {
    sentenceIndex: 0,
    trueParaphrase: 'Writing down goals makes people more likely to reach them.',
    falseStatements: ['Writing down goals makes people less likely to achieve them.', 'Practice has no effect on memory formation.', 'Pausing before deciding always leads to worse choices.'],
  },
  chapterSummary: {
    correctSummary: 'The mind learns and adapts through practice, mindset, pausing, and connection.',
    distractors: ['An airline expanded its international flight routes.', 'A construction company finished a new office tower.', 'A retailer opened several new store locations.'],
  },
  mainIdea: {
    correctIdea: 'How psychological habits shape learning and wellbeing',
    distractors: ['How airlines plan new flight routes', 'How construction companies finish major projects', 'How retailers choose new store locations'],
  },
  notMentioned: {
    absentIdea: 'Bright lighting improves short-term memory recall',
    mentionedGlossIndices: [0, 2, 4],
  },
  bestTitle: {
    distractorTitles: ['A Practical Guide to Home Renovation', 'The Economics of International Trade', 'Techniques for Landscape Photography'],
  },
  causeEffect: {
    sentenceIndex: 1,
    cause: 'Repeated, consistent practice',
    distractors: ['A sudden change in daily schedule', 'A shift in classroom seating arrangement', 'An increase in background noise levels'],
  },
  meaningMatch: {
    sentenceIndex: 3,
    correctParaphrase: 'A positive outlook shapes how someone copes with stress.',
    distractors: ['Mindset has no influence on handling stress.', 'A positive mindset always eliminates all stress.', 'Stress only affects people with negative mindsets.'],
  },
}

const PSYCHOLOGY_2: SentenceChapter = {
  id: 'psychology-2', level: 5, theme: 'psychology', chapterTitle: 'The Psychology of Motivation',
  sentences: [
    { text: 'Researchers have discovered that intrinsic motivation often produces far more lasting effort than external rewards alone.', gloss: 'Intrinsic motivation lasts longer' },
    { text: 'Small, consistent daily habits tend to build lasting change more effectively than occasional bursts of intense effort.', gloss: 'Small habits build lasting change' },
    { text: 'People generally feel more motivated when they clearly understand the deeper purpose behind their daily work.', gloss: 'Purpose increases motivation' },
    { text: 'Setting specific, measurable goals tends to improve focus far more than vague, general intentions ever do.', gloss: 'Specific goals improve focus' },
    { text: 'Celebrating small wins along the way often helps sustain motivation during long and genuinely difficult projects.', gloss: 'Small wins sustain motivation' },
  ],
  trueStatement: {
    sentenceIndex: 0,
    trueParaphrase: 'Intrinsic motivation tends to produce longer-lasting effort than rewards.',
    falseStatements: ['External rewards always outlast intrinsic motivation.', 'Small daily habits have no impact on lasting change.', 'Vague goals improve focus more than specific ones.'],
  },
  chapterSummary: {
    correctSummary: 'Motivation grows through purpose, habits, clear goals, and small celebrated wins.',
    distractors: ['A shipping company opened a new warehouse facility.', 'A film studio announced its next major release.', "A university expanded its downtown campus buildings."],
  },
  mainIdea: {
    correctIdea: 'What sustains genuine motivation over time',
    distractors: ['What shipping companies need for new warehouses', 'What film studios plan for major releases', 'What universities need for campus expansion'],
  },
  notMentioned: {
    absentIdea: 'Group competition always increases individual motivation',
    mentionedGlossIndices: [1, 2, 3],
  },
  bestTitle: {
    distractorTitles: ['An Introduction to Wine Tasting', 'The History of Bridge Engineering', "A Beginner's Guide to Chess Strategy"],
  },
  causeEffect: {
    sentenceIndex: 4,
    cause: 'Celebrating small wins along the way',
    distractors: ['A reduction in overall project scope', 'A change in team leadership structure', 'An increase in project deadlines'],
  },
  meaningMatch: {
    sentenceIndex: 2,
    correctParaphrase: 'Understanding the purpose behind work increases motivation.',
    distractors: ['Purpose has no connection to motivation levels.', 'Motivation decreases when purpose is understood.', 'Daily work requires no sense of purpose.'],
  },
}

export const SENTENCE_CHAPTERS: Record<SentenceReadingLevel, readonly SentenceChapter[]> = {
  1: [NATURE_1, NATURE_2],
  2: [SCIENCE_1, SCIENCE_2],
  3: [HEALTH_1, HEALTH_2],
  4: [TECHNOLOGY_1, TECHNOLOGY_2],
  5: [PSYCHOLOGY_1, PSYCHOLOGY_2],
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Picks one chapter for a level, preferring one not already used this
// session so a retry feels different. Falls back to the full level pool
// (allowing reuse) rather than failing — the same "never fabricate,
// degrade gracefully" principle every dataset in this codebase follows.
export function getChapterForLevel(
  level: SentenceReadingLevel,
  excludeIds: ReadonlySet<string> = new Set(),
  seed = 1,
): SentenceChapter {
  const pool = SENTENCE_CHAPTERS[level]
  const fresh = pool.filter((c) => !excludeIds.has(c.id))
  const candidatePool = fresh.length > 0 ? fresh : pool
  const index = Math.abs(Math.floor(Math.sin(seed) * 10000)) % candidatePool.length
  return candidatePool[index]!
}

// QSR-ENGINE-SWAP-1 — additive sibling to getChapterForLevel, same exact
// selection logic, sourced from a caller-supplied pool of real-document
// chapters instead of SENTENCE_CHAPTERS[level]. Mirrors
// getPhraseClustersFromPool/getContentFromPool's own real precedent — the
// hardcoded per-level path above is completely untouched.
export function getChapterFromPool(pool: readonly SentenceChapter[], excludeIds: ReadonlySet<string> = new Set(), seed = 1): SentenceChapter {
  const fresh = pool.filter((c) => !excludeIds.has(c.id))
  const candidatePool = fresh.length > 0 ? fresh : pool
  const index = Math.abs(Math.floor(Math.sin(seed) * 10000)) % candidatePool.length
  return candidatePool[index]!
}

export { wordCount as sentenceWordCount }

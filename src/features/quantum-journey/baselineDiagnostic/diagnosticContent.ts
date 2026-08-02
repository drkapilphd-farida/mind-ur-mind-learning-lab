// 30-Second Baseline Speed & Comprehension Diagnostic™ — a small,
// dedicated content set shown exactly once per user, before their Day 1
// of the 21-Day Transformation Journey. Deliberately separate from
// ../readingContent's 8-category rotation (that pool is anti-repeat
// across 21 real journey days; this one is a single, one-time diagnostic
// moment, so it needs its own fresh topics rather than risking a passage
// the user then sees again days later in the real rotation). Same safe
// authoring discipline as every other content module in this project:
// `correctAnswer` is real option text, never a hand-placed index —
// buildQuestion shuffles options and derives the index automatically.
export type DiagnosticMCQ = { question: string; options: readonly [string, string, string, string]; correctIndex: number }

export type DiagnosticPassage = {
  id: string
  text: string
  questions: readonly [DiagnosticMCQ, DiagnosticMCQ]
}

type DiagnosticQuestionDef = { question: string; options: readonly [string, string, string, string]; correctAnswer: string }
type DiagnosticPassageDef = {
  id: string
  text: string
  questions: readonly [DiagnosticQuestionDef, DiagnosticQuestionDef]
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copy[i]
    copy[i] = copy[j] as T
    copy[j] = temp as T
  }
  return copy
}

function buildQuestion(def: DiagnosticQuestionDef): DiagnosticMCQ {
  const shuffledOptions = shuffle(def.options)
  const correctIndex = shuffledOptions.indexOf(def.correctAnswer)
  if (correctIndex === -1) {
    throw new Error(`buildQuestion: correctAnswer "${def.correctAnswer}" not found among options for "${def.question}"`)
  }
  return { question: def.question, options: shuffledOptions as [string, string, string, string], correctIndex }
}

function buildPassage(def: DiagnosticPassageDef): DiagnosticPassage {
  return { id: def.id, text: def.text, questions: [buildQuestion(def.questions[0]), buildQuestion(def.questions[1])] }
}

const DIAGNOSTIC_PASSAGE_DEFS: readonly DiagnosticPassageDef[] = [
  {
    id: 'diagnostic-indian-railways',
    text: 'Indian Railways is one of the largest railway networks in the world, carrying more than twenty million passengers every single day across a web of tracks that stretches over sixty-eight thousand kilometers. It began in 1853, when the first passenger train ran a short distance between Bombay and Thane, and has grown since into a system that connects nearly every district in the country. Beyond simply moving people, the railway also employs over a million workers directly, making it one of the largest employers anywhere in the world. Its trains range from ultra-modern high-speed services to slow, crowded local trains that city commuters depend on every morning. Freight matters just as much as passengers: coal, food grain, and cement move across the country by rail far more cheaply than by road. Many Indians describe the railway as a quiet thread stitching together a vast and diverse country, since a single line can carry a farmer, a student, and a software engineer through the very same carriage on their very different journeys.',
    questions: [
      { question: 'Where did the first Indian passenger train run between?', options: ['Delhi and Agra', 'Bombay and Thane', 'Chennai and Bangalore', 'Kolkata and Patna'], correctAnswer: 'Bombay and Thane' },
      { question: 'In what year did Indian Railways begin?', options: ['1853', '1901', '1947', '1820'], correctAnswer: '1853' },
    ],
  },
  {
    id: 'diagnostic-isro-space-program',
    text: 'The Indian Space Research Organisation, known as ISRO, has built a global reputation for achieving ambitious space missions at a remarkably low cost. In 2014, its Mars Orbiter Mission reached Mars on its very first attempt, a feat only a handful of space agencies had ever managed, and it did so at a fraction of the cost of comparable missions elsewhere. In 2023, ISRO successfully landed its Chandrayaan-3 spacecraft near the Moon\'s south pole, making India the first country ever to achieve a soft landing in that specific region. The mission carried a rover named Pragyan, which spent its mission gathering data about the lunar soil and surface temperature. ISRO also regularly launches satellites for other countries, generating revenue while helping smaller nations access space technology they could not otherwise afford to develop themselves. Engineers there are known for resourceful, low-cost designs, often adapting existing components rather than building expensive new ones from scratch, a reputation that has earned ISRO admiration well beyond India\'s own borders.',
    questions: [
      { question: 'What did India achieve first among all countries in 2023?', options: ['A crewed Moon landing', 'A soft landing near the Moon\'s south pole', 'A mission to Mars', 'The first satellite launch'], correctAnswer: 'A soft landing near the Moon\'s south pole' },
      { question: 'What is the name of the Chandrayaan-3 rover?', options: ['Vikram', 'Pragyan', 'Aryabhata', 'Mangalyaan'], correctAnswer: 'Pragyan' },
    ],
  },
  {
    id: 'diagnostic-monsoon-season',
    text: 'The monsoon is the single most important weather event in India every year, arriving from the southwest around June and gradually moving across the country before retreating by late September. More than half of India\'s farmland has no other reliable source of water, so a monsoon that arrives late, or brings far less rain than usual, can directly affect how much food the entire country grows that year. Farmers, economists, and government planners all watch the same early forecasts closely each spring, since a weak monsoon tends to push up food prices within just a few months. The rains also refill rivers and reservoirs that cities depend on for drinking water long after the season ends. Culturally, the monsoon\'s arrival is celebrated in art, music, and festivals across many regions, associated with relief from summer heat and the start of the planting season. Meteorologists today use satellites and ocean-temperature data to predict its behavior earlier and more accurately than the simple rain-gauge records of a century ago ever allowed.',
    questions: [
      { question: 'When does the monsoon typically arrive in India?', options: ['Around June', 'Around December', 'Around March', 'Around October'], correctAnswer: 'Around June' },
      { question: 'Why does a weak monsoon worry economists?', options: ['It affects food prices', 'It cancels festivals', 'It changes train schedules', 'It stops satellite launches'], correctAnswer: 'It affects food prices' },
    ],
  },
  {
    id: 'diagnostic-yoga-tradition',
    text: 'Yoga originated in India thousands of years ago as a practice combining physical postures, breathing techniques, and meditation, long before it became a popular form of exercise around the world. Ancient texts describe it as a path toward mental clarity and self-discipline, not merely a set of stretches, with physical postures originally seen as just one part of a much broader practice. In 2014, the United Nations declared June 21st as International Yoga Day, chosen because it is the longest day of the year in the Northern Hemisphere, and the first celebration in 2015 saw millions of people practicing together in cities worldwide. Modern research has since studied yoga\'s effects on stress, flexibility, and sleep, lending scientific support to benefits practitioners had described for centuries. Today, yoga is taught everywhere from small village courtyards in India to large fitness studios in cities abroad, with styles ranging from slow, gentle sessions to physically demanding ones. Its global spread is often cited as one of India\'s most widely adopted cultural exports.',
    questions: [
      { question: 'Why was June 21st chosen as International Yoga Day?', options: ['It is India\'s Independence Day', 'It is the longest day of the year', 'It marks yoga\'s founding date', 'It is a religious holiday'], correctAnswer: 'It is the longest day of the year' },
      { question: 'In what year did the UN declare International Yoga Day?', options: ['2010', '2014', '2018', '2020'], correctAnswer: '2014' },
    ],
  },
]

export const DIAGNOSTIC_PASSAGES: readonly DiagnosticPassage[] = DIAGNOSTIC_PASSAGE_DEFS.map(buildPassage)

export function pickDiagnosticPassage(): DiagnosticPassage {
  const index = Math.floor(Math.random() * DIAGNOSTIC_PASSAGES.length)
  return DIAGNOSTIC_PASSAGES[index]!
}

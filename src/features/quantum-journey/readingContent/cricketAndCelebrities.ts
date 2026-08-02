import type { JourneyReadingSetDef } from './types'

// Cricketers & Celebrities — real public figures, restricted strictly to
// well-known, publicly documented sporting achievements (career records,
// tournament results). No personal-life claims, no fabricated quotes,
// nothing beyond easily verifiable public sports history.
export const CRICKET_AND_CELEBRITIES: readonly JourneyReadingSetDef[] = [
  {
    id: 'cricket-kapil-1983',
    category: 'cricket-and-celebrities',
    lengthTier: 'short',
    text: 'In 1983, Kapil Dev captained the Indian cricket team to its first-ever Cricket World Cup title, defeating the two-time defending champions West Indies in the final at Lord’s. India had been given little chance against a West Indies side considered one of the most dominant teams in cricket history. The victory is widely credited with transforming cricket’s popularity in India, inspiring a generation of players who would go on to shape the sport for decades afterward.',
    comprehensionQuestions: [
      { question: 'Who captained India to the 1983 World Cup win?', options: ['Sunil Gavaskar', 'Kapil Dev', 'Sachin Tendulkar', 'MS Dhoni'], correctAnswer: 'Kapil Dev' },
      { question: 'Which team did India defeat in the final?', options: ['Australia', 'England', 'West Indies', 'Pakistan'], correctAnswer: 'West Indies' },
    ],
    retentionQuestions: [
      { question: 'Where was the 1983 final played?', options: ['Eden Gardens', 'Lord’s', 'The MCG', 'Wankhede Stadium'], correctAnswer: 'Lord’s' },
      { question: 'What is the 1983 win widely credited with?', options: ['Ending Test cricket', 'Transforming cricket’s popularity in India', 'Creating the IPL', 'Introducing T20 cricket'], correctAnswer: 'Transforming cricket’s popularity in India' },
    ],
  },
  {
    id: 'cricket-sachin-100-centuries',
    category: 'cricket-and-celebrities',
    lengthTier: 'short',
    text: 'Sachin Tendulkar, often called the "Master Blaster," is the only cricketer in history to score 100 international centuries across Test and One Day International cricket combined, a record widely regarded as one of the hardest in the sport to ever break. He also remains the leading run-scorer in both Test and ODI cricket. Tendulkar made his international debut at just sixteen years old and went on to play for 24 years, retiring from international cricket in 2013 after his 200th Test match.',
    comprehensionQuestions: [
      { question: 'What is Sachin Tendulkar’s well-known nickname?', options: ['The Wall', 'The Master Blaster', 'Captain Cool', 'The Turbanator'], correctAnswer: 'The Master Blaster' },
      { question: 'How many international centuries did he score?', options: ['50', '75', '100', '120'], correctAnswer: '100' },
    ],
    retentionQuestions: [
      { question: 'At what age did Tendulkar make his international debut?', options: ['16', '18', '21', '25'], correctAnswer: '16' },
      { question: 'In what year did he retire from international cricket?', options: ['2011', '2013', '2015', '2007'], correctAnswer: '2013' },
    ],
  },
  {
    id: 'cricket-dhoni-captaincy',
    category: 'cricket-and-celebrities',
    lengthTier: 'medium',
    text: 'MS Dhoni, known for his calm demeanor under pressure that earned him the nickname "Captain Cool," is the only captain in cricket history to win all three major ICC limited-overs trophies: the T20 World Cup in 2007, the Cricket World Cup in 2011, and the Champions Trophy in 2013. His finishing six in the 2011 World Cup final against Sri Lanka, hit at the Wankhede Stadium in Mumbai, remains one of the most replayed moments in Indian cricket history. Beyond his captaincy, Dhoni is also widely regarded as one of the finest wicketkeepers the sport has produced, known especially for his lightning-fast stumpings.',
    comprehensionQuestions: [
      { question: 'What is MS Dhoni’s well-known nickname?', options: ['Captain Cool', 'The Wall', 'Master Blaster', 'The Hitman'], correctAnswer: 'Captain Cool' },
      { question: 'What unique achievement does Dhoni hold as captain?', options: ['Most Test wins', 'Winning all three major ICC limited-overs trophies', 'Most sixes hit', 'Longest career as captain'], correctAnswer: 'Winning all three major ICC limited-overs trophies' },
    ],
    retentionQuestions: [
      { question: 'Where did Dhoni hit his famous finishing six in 2011?', options: ['Eden Gardens', 'Wankhede Stadium', 'Lord’s', 'The MCG'], correctAnswer: 'Wankhede Stadium' },
      { question: 'What is Dhoni especially known for as a wicketkeeper?', options: ['Slow reflexes', 'Lightning-fast stumpings', 'Never dropping catches', 'Bowling spin'], correctAnswer: 'Lightning-fast stumpings' },
    ],
  },
  {
    id: 'cricket-kohli-records',
    category: 'cricket-and-celebrities',
    lengthTier: 'medium',
    text: 'Virat Kohli is widely regarded as one of the greatest run-chasers in One Day International history, holding the record for the most centuries scored by any batsman while chasing a target. Known for his intense fitness regimen, Kohli is often credited with transforming the fitness culture of the entire Indian cricket team, pushing teammates to adopt stricter training and diet standards during his years as captain. He has also won the ICC Cricketer of the Year award multiple times, a rare honor reflecting sustained excellence across formats over many years rather than a single standout season.',
    comprehensionQuestions: [
      { question: 'What specific batting record is Virat Kohli known for?', options: ['Most sixes in T20s', 'Most centuries while chasing a target', 'Most wickets taken', 'Fastest double century'], correctAnswer: 'Most centuries while chasing a target' },
      { question: 'What is Kohli often credited with transforming?', options: ['The scoring rules of cricket', 'The fitness culture of the Indian team', 'The format of the IPL', 'Cricket bat design'], correctAnswer: 'The fitness culture of the Indian team' },
    ],
    retentionQuestions: [
      { question: 'What award has Kohli won multiple times?', options: ['ICC Cricketer of the Year', 'Olympic gold medal', 'Grammy Award', 'Padma Vibhushan'], correctAnswer: 'ICC Cricketer of the Year' },
      { question: 'What does winning that award multiple times reflect?', options: ['A single great season', 'Sustained excellence across many years', 'Luck in one tournament', 'Retirement plans'], correctAnswer: 'Sustained excellence across many years' },
    ],
  },
  {
    id: 'cricket-ipl-founding',
    category: 'cricket-and-celebrities',
    lengthTier: 'long',
    text: 'The Indian Premier League, launched in 2008 by the Board of Control for Cricket in India, transformed cricket into a fast, franchise-based spectacle unlike anything the sport had seen before. Built around the shorter Twenty20 format, where each team faces only twenty overs, the league brought together international superstars and uncapped young domestic players on the very same team rosters, giving talented but unknown cricketers a stage to be noticed by national selectors almost overnight. The auction system, where franchises bid competitively for players in a televised event, became a spectacle in its own right, drawing as much public attention as the matches themselves. Within just a few years, the IPL became one of the most-watched sporting leagues in the world by average viewership, and its financial success reshaped how cricket boards around the globe thought about scheduling, broadcasting rights, and player contracts. Several international cricket boards subsequently launched their own T20 franchise leagues modeled closely on the IPL’s format, hoping to replicate its commercial success. Beyond the business side, the league is often credited with accelerating the development of young Indian talent, since players as young as seventeen or eighteen now regularly share a dressing room with some of the most experienced cricketers in the world, learning directly from them in a way that domestic cricket alone had rarely offered before.',
    comprehensionQuestions: [
      { question: 'In what year was the IPL launched?', options: ['2003', '2008', '2012', '1998'], correctAnswer: '2008' },
      { question: 'What cricket format is the IPL built around?', options: ['Test cricket', 'One Day Internationals', 'Twenty20', 'Five-day matches'], correctAnswer: 'Twenty20' },
    ],
    retentionQuestions: [
      { question: 'What made the player auction a spectacle of its own?', options: ['It was held in secret', 'Franchises bid competitively in a televised event', 'Players chose their own teams', 'It happened only once'], correctAnswer: 'Franchises bid competitively in a televised event' },
      { question: 'What is the IPL often credited with accelerating?', options: ['The decline of Test cricket', 'The development of young Indian talent', 'The end of domestic cricket', 'International bans on cricketers'], correctAnswer: 'The development of young Indian talent' },
    ],
  },
]

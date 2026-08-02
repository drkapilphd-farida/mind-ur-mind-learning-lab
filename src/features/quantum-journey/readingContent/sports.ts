import type { JourneyReadingSetDef } from './types'

export const SPORTS: readonly JourneyReadingSetDef[] = [
  {
    id: 'sports-kabaddi-origins',
    category: 'sports',
    lengthTier: 'short',
    text: 'Kabaddi is a contact team sport with roots tracing back thousands of years in the Indian subcontinent, requiring no equipment at all — just a marked court and pure athleticism. A single "raider" crosses into the opposing team’s half and must tag as many defenders as possible while chanting "kabaddi, kabaddi" in one continuous breath, then return to their own side without being tackled. The Pro Kabaddi League, launched in 2014, transformed the sport’s popularity in India, turning it into one of the most-watched domestic leagues in the country.',
    comprehensionQuestions: [
      { question: 'What must a raider chant while raiding?', options: ['Their own name', '"Kabaddi, kabaddi"', 'The team’s slogan', 'Nothing at all'], correctAnswer: '"Kabaddi, kabaddi"' },
      { question: 'What does kabaddi require to play?', options: ['Expensive equipment', 'No equipment, just a marked court', 'A large stadium only', 'Special shoes'], correctAnswer: 'No equipment, just a marked court' },
    ],
    retentionQuestions: [
      { question: 'When was the Pro Kabaddi League launched?', options: ['2005', '2014', '2020', '1999'], correctAnswer: '2014' },
      { question: 'What must the raider do without being tackled?', options: ['Score a goal', 'Return to their own side', 'Sit down', 'Pass the ball'], correctAnswer: 'Return to their own side' },
    ],
  },
  {
    id: 'sports-badminton-sindhu',
    category: 'sports',
    lengthTier: 'short',
    text: 'PV Sindhu became the first Indian woman to win an Olympic silver medal in badminton at the 2016 Rio Olympics, and she followed it up with a bronze medal at the 2020 Tokyo Olympics, making her the first Indian to win two individual Olympic medals. Her rise inspired a wave of interest in badminton across India, especially among young girls taking up the sport competitively. She has also won multiple World Championship medals, including a gold in 2019.',
    comprehensionQuestions: [
      { question: 'What medal did PV Sindhu win at the 2016 Rio Olympics?', options: ['Gold', 'Silver', 'Bronze', 'No medal'], correctAnswer: 'Silver' },
      { question: 'What makes Sindhu’s Olympic record unique among Indians?', options: ['She is the only Indian to compete', 'She is the first Indian with two individual Olympic medals', 'She won every match ever played', 'She is the youngest Olympian ever'], correctAnswer: 'She is the first Indian with two individual Olympic medals' },
    ],
    retentionQuestions: [
      { question: 'What medal did she win at the 2020 Tokyo Olympics?', options: ['Gold', 'Silver', 'Bronze', 'None'], correctAnswer: 'Bronze' },
      { question: 'In what year did she win a World Championship gold?', options: ['2016', '2018', '2019', '2021'], correctAnswer: '2019' },
    ],
  },
  {
    id: 'sports-hockey-golden-era',
    category: 'sports',
    lengthTier: 'medium',
    text: 'India’s field hockey team dominated the Olympics for decades in the mid-20th century, winning six consecutive gold medals from 1928 to 1956, a streak still considered one of the most remarkable in Olympic history across any team sport. Legendary player Dhyan Chand, part of that era, was so skilled that opposing teams reportedly once broke his hockey stick mid-match to check whether a magnet was hidden inside it. After decades without Olympic gold, the Indian men’s hockey team ended a 41-year wait by winning bronze at the Tokyo 2020 Olympics, a result celebrated across the country as a sign of the sport’s revival.',
    comprehensionQuestions: [
      { question: 'How many consecutive Olympic golds did India’s hockey team win from 1928-1956?', options: ['Three', 'Four', 'Six', 'Eight'], correctAnswer: 'Six' },
      { question: 'What did opposing teams reportedly do to Dhyan Chand’s stick?', options: ['Praised it publicly', 'Broke it to check for a hidden magnet', 'Bought it as a souvenir', 'Banned it from matches'], correctAnswer: 'Broke it to check for a hidden magnet' },
    ],
    retentionQuestions: [
      { question: 'What medal did India’s men’s hockey team win at Tokyo 2020?', options: ['Gold', 'Silver', 'Bronze', 'No medal'], correctAnswer: 'Bronze' },
      { question: 'How many years had India waited for an Olympic hockey medal before Tokyo 2020?', options: ['21 years', '41 years', '10 years', '60 years'], correctAnswer: '41 years' },
    ],
  },
  {
    id: 'sports-chess-viswanathan-anand',
    category: 'sports',
    lengthTier: 'medium',
    text: 'Viswanathan Anand became India’s first chess Grandmaster in 1988 and went on to become World Chess Champion five times, a feat that helped popularize chess across the country and inspired a wave of young Indian players who would go on to dominate the sport decades later. Known for his exceptionally fast calculation speed at the board, Anand earned the nickname "Lightning Kid" early in his career. His success is often cited as a key influence behind India’s current generation of elite young grandmasters, some of whom began playing chess after watching him compete on television.',
    comprehensionQuestions: [
      { question: 'What title did Viswanathan Anand first earn in 1988?', options: ['World Champion', 'India’s first Grandmaster', 'Olympic medalist', 'National coach'], correctAnswer: 'India’s first Grandmaster' },
      { question: 'How many times did he become World Chess Champion?', options: ['Twice', 'Three times', 'Five times', 'Once'], correctAnswer: 'Five times' },
    ],
    retentionQuestions: [
      { question: 'What nickname did Anand earn early in his career?', options: ['The Wall', 'Lightning Kid', 'The Tiger', 'Master Blaster'], correctAnswer: 'Lightning Kid' },
      { question: 'What is Anand’s success cited as influencing?', options: ['India’s cricket team', 'A new generation of elite young grandmasters', 'The Olympic committee', 'Foreign chess federations only'], correctAnswer: 'A new generation of elite young grandmasters' },
    ],
  },
  {
    id: 'sports-neeraj-chopra-javelin',
    category: 'sports',
    lengthTier: 'long',
    text: 'For over a century of Olympic history, India had won individual gold only once, when Abhinav Bindra took shooting gold in 2008. That changed at the Tokyo 2020 Olympics when Neeraj Chopra won gold in the javelin throw, becoming the first Indian to win an Olympic gold medal in track and field athletics, a discipline that had produced no Indian medal of any color in over a hundred years of participation. His winning throw of 87.58 meters came on his very first attempt of the final, a rare feat that instantly put him in medal contention before his competitors had even taken their turns. Chopra’s path to that moment was unusual: he took up javelin partly to lose weight as a overweight child in rural Haryana, training initially on a modest local ground before his talent was noticed and he was moved into more structured coaching. His victory sparked a surge of interest in track and field across India, with sports academies reporting a noticeable rise in young athletes specifically requesting javelin training in the months that followed, and state governments in several regions announcing new funding for athletics infrastructure partly in response to the achievement. Chopra continued his dominance afterward, winning the World Athletics Championship gold in 2023, becoming the first Indian to win that particular title.',
    comprehensionQuestions: [
      { question: 'What event did Neeraj Chopra win gold in at Tokyo 2020?', options: ['100m sprint', 'Javelin throw', 'Long jump', 'Shot put'], correctAnswer: 'Javelin throw' },
      { question: 'What was historically notable about his win?', options: ['It was India’s first team gold', 'It was India’s first track and field gold ever', 'It was the first Olympics India attended', 'It was a shared medal'], correctAnswer: 'It was India’s first track and field gold ever' },
    ],
    retentionQuestions: [
      { question: 'What was the distance of his winning throw?', options: ['80.12 meters', '87.58 meters', '90.00 meters', '75.40 meters'], correctAnswer: '87.58 meters' },
      { question: 'What title did Chopra win in 2023?', options: ['Olympic gold again', 'World Athletics Championship gold', 'Asian Games silver', 'Commonwealth bronze'], correctAnswer: 'World Athletics Championship gold' },
    ],
  },
]

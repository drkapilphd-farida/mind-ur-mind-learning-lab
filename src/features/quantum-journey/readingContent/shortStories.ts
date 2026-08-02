import type { JourneyReadingSetDef } from './types'

export const SHORT_STORIES: readonly JourneyReadingSetDef[] = [
  {
    id: 'story-the-kite-maker',
    category: 'short-stories',
    lengthTier: 'short',
    text: 'Old Rahim had made kites for forty years in his tiny Lucknow shop. When plastic kites flooded the market, customers stopped coming. His grandson wanted him to quit. But one Makar Sankranti morning, a young girl walked in asking for a paper kite exactly like the one her late grandfather used to fly. Rahim smiled, picked up his bamboo strips, and got to work. That afternoon, the girl flew the kite from her rooftop, laughing as it dipped and soared. Word spread. By evening, five more children stood at his door.',
    comprehensionQuestions: [
      { question: 'What was Rahim’s trade?', options: ['Selling sweets', 'Making kites', 'Weaving carpets', 'Fixing bicycles'], correctAnswer: 'Making kites' },
      { question: 'Why had customers stopped coming to his shop?', options: ['He raised his prices', 'Plastic kites flooded the market', 'The shop moved location', 'He retired for a year'], correctAnswer: 'Plastic kites flooded the market' },
    ],
    retentionQuestions: [
      { question: 'What festival is mentioned in the story?', options: ['Diwali', 'Makar Sankranti', 'Holi', 'Eid'], correctAnswer: 'Makar Sankranti' },
      { question: 'What did the girl ask for?', options: ['A kite like her grandfather’s', 'A discount', 'A repair', 'A gift for a friend'], correctAnswer: 'A kite like her grandfather’s' },
    ],
  },
  {
    id: 'story-the-tiffin-mixup',
    category: 'short-stories',
    lengthTier: 'short',
    text: 'Every day, Mumbai’s dabbawalas deliver over 200,000 lunchboxes with almost zero errors, using nothing but colored codes and bicycles. One Monday, a new dabbawala named Suresh swapped two tiffins by mistake. A stockbroker got a spicy home-style thali meant for a schoolteacher, and the teacher got a bland diet meal meant for the broker. Both complained loudly — until the broker, missing his usual bland lunch, admitted the spicy meal was the best thing he’d eaten all month. He asked to keep the "mistake" going every Monday from then on.',
    comprehensionQuestions: [
      { question: 'What do dabbawalas deliver?', options: ['Newspapers', 'Lunchboxes', 'Mail', 'Medicines'], correctAnswer: 'Lunchboxes' },
      { question: 'What mistake did Suresh make?', options: ['He was late', 'He swapped two tiffins', 'He dropped a tiffin', 'He forgot a delivery'], correctAnswer: 'He swapped two tiffins' },
    ],
    retentionQuestions: [
      { question: 'What city is this story set in?', options: ['Delhi', 'Mumbai', 'Chennai', 'Kolkata'], correctAnswer: 'Mumbai' },
      { question: 'How did the broker react to his new lunch?', options: ['He complained to management', 'He wanted it to continue', 'He refused to eat it', 'He asked for a refund'], correctAnswer: 'He wanted it to continue' },
    ],
  },
  {
    id: 'story-monsoon-exam',
    category: 'short-stories',
    lengthTier: 'medium',
    text: 'Priya had exactly one week to prepare for her board exams when the monsoon flooded her neighborhood in Chennai. Her books were soaked, the power was out, and her phone had no charge. Instead of panicking, she walked to the community center where dozens of families had taken shelter. An elderly retired professor, also stranded there, noticed her worry and offered to help her revise by memory alone — no books, just questions and answers by candlelight. For five nights, they went over concepts aloud while rain hammered the roof. When the exam came, Priya realized she understood the material better than ever, because she had been forced to truly explain it, not just read it.',
    comprehensionQuestions: [
      { question: 'What natural event disrupted Priya’s studies?', options: ['An earthquake', 'A flood', 'A heatwave', 'A cyclone warning'], correctAnswer: 'A flood' },
      { question: 'Who helped Priya revise?', options: ['Her mother', 'A retired professor', 'Her classmate', 'A librarian'], correctAnswer: 'A retired professor' },
    ],
    retentionQuestions: [
      { question: 'What city is the story set in?', options: ['Chennai', 'Pune', 'Jaipur', 'Bhopal'], correctAnswer: 'Chennai' },
      { question: 'How did they study without books?', options: ['Using an old radio', 'By memory and spoken questions', 'Using a borrowed tablet', 'By singing songs'], correctAnswer: 'By memory and spoken questions' },
    ],
  },
  {
    id: 'story-grandmothers-recipe',
    category: 'short-stories',
    lengthTier: 'medium',
    text: 'When Ananya’s grandmother passed away, she left behind no written recipes — only memories of her legendary Hyderabadi biryani, cooked entirely by instinct. Ananya, a software engineer with no cooking experience, decided to recreate it for her grandmother’s first death anniversary. She called five aunts, compared six conflicting versions of the recipe, and ruined three batches of rice before getting the layering right. On the day of the ceremony, relatives took one bite and went silent. Then her oldest uncle said quietly, "That’s her biryani." Ananya realized that some things aren’t written down because they are meant to be rebuilt, generation after generation, through trial and love.',
    comprehensionQuestions: [
      { question: 'What dish was Ananya trying to recreate?', options: ['Butter chicken', 'Hyderabadi biryani', 'Rajma chawal', 'Masala dosa'], correctAnswer: 'Hyderabadi biryani' },
      { question: 'What was Ananya’s profession?', options: ['Chef', 'Software engineer', 'Teacher', 'Doctor'], correctAnswer: 'Software engineer' },
    ],
    retentionQuestions: [
      { question: 'How many batches of rice did she ruin?', options: ['One', 'Two', 'Three', 'Five'], correctAnswer: 'Three' },
      { question: 'Who confirmed the biryani tasted right?', options: ['Her mother', 'Her oldest uncle', 'A neighbor', 'Her father'], correctAnswer: 'Her oldest uncle' },
    ],
  },
  {
    id: 'story-the-night-bus',
    category: 'short-stories',
    lengthTier: 'long',
    text: 'The last bus from Manali to Delhi was nearly empty except for Arjun, a college dropout heading home to face his parents after failing his final year, and an old army veteran named Colonel Rawat sitting two rows ahead. Somewhere past midnight, the bus broke down on a mountain pass, and while the driver worked on the engine, the two struck up a conversation neither had planned. Rawat spoke of failing his officer training exam twice before finally passing on his third attempt at nearly thirty years old — a fact he had never told his own children, afraid it would make him seem weak. Arjun spoke of the shame he felt walking back home, certain his family would see him as a failure. By the time the engine roared back to life at dawn, something had shifted. Rawat wrote his phone number on a torn bus ticket and told Arjun to call anytime he needed someone who understood exactly what starting over felt like. Arjun kept that ticket in his wallet for years, long after he had rebuilt his life, as a reminder that setbacks were never the end of the story, only a difficult chapter in the middle of it.',
    comprehensionQuestions: [
      { question: 'Why was Arjun going home?', options: ['For a wedding', 'After failing his final year', 'For a job interview', 'To visit his grandparents'], correctAnswer: 'After failing his final year' },
      { question: 'What had Colonel Rawat never told his children?', options: ['That he failed the officer exam twice', 'That he was retiring', 'That he disliked the army', 'That he wanted to move abroad'], correctAnswer: 'That he failed the officer exam twice' },
    ],
    retentionQuestions: [
      { question: 'Where did the bus break down?', options: ['In a city', 'On a mountain pass', 'At a train station', 'Near a river'], correctAnswer: 'On a mountain pass' },
      { question: 'What did Rawat give Arjun?', options: ['A book', 'His phone number on a torn ticket', 'A medal', 'Money for the bus fare'], correctAnswer: 'His phone number on a torn ticket' },
    ],
  },
  {
    id: 'story-the-chess-champion',
    category: 'short-stories',
    lengthTier: 'long',
    text: 'In a small government school in rural Odisha with no electricity most afternoons, a teacher named Mrs. Das taught chess using a board she had drawn on the floor with chalk, and bottle caps as pieces because the school could not afford a real set. One of her students, a shy girl named Meena who rarely spoke in class, turned out to have an extraordinary memory for positions and a calm patience none of the other children had. Mrs. Das began staying late every day, teaching Meena openings from an old, torn chess book she had borrowed from a library forty kilometers away. Three years later, Meena won her district championship using nothing but the fundamentals that chalk board had taught her. A journalist covering the tournament asked her what equipment had made the difference. Meena said only that she had never needed expensive equipment, only someone patient enough to keep showing up. Mrs. Das, standing quietly at the back of the crowd, said nothing, but everyone in the room understood exactly who she meant.',
    comprehensionQuestions: [
      { question: 'What did Mrs. Das use as chess pieces?', options: ['Plastic figures', 'Bottle caps', 'Coins', 'Stones'], correctAnswer: 'Bottle caps' },
      { question: 'What made Meena good at chess?', options: ['Expensive coaching', 'An extraordinary memory and patience', 'A private tutor', 'Watching television matches'], correctAnswer: 'An extraordinary memory and patience' },
    ],
    retentionQuestions: [
      { question: 'Where is the school located?', options: ['Rural Odisha', 'Urban Mumbai', 'Rural Punjab', 'Urban Delhi'], correctAnswer: 'Rural Odisha' },
      { question: 'What did Meena say made the difference?', options: ['A new chess set', 'Someone patient enough to keep showing up', 'A scholarship', 'Online lessons'], correctAnswer: 'Someone patient enough to keep showing up' },
    ],
  },
]

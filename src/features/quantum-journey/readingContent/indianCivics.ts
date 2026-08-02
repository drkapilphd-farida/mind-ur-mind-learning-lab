import type { JourneyReadingSetDef } from './types'

// Indian Civics & Governance — deliberately factual, historical, and
// institutional (how government works, the Constitution, the freedom
// movement) rather than current-events partisan commentary. Real dates
// and facts only, never a fabricated statistic or contested claim.
export const INDIAN_CIVICS: readonly JourneyReadingSetDef[] = [
  {
    id: 'civics-constitution-day',
    category: 'indian-civics',
    lengthTier: 'short',
    text: 'India’s Constitution was adopted by the Constituent Assembly on 26 November 1949 and came into effect on 26 January 1950, which is why that date is celebrated every year as Republic Day. Dr. B.R. Ambedkar chaired the Drafting Committee and is widely regarded as the chief architect of the document. At the time, it was the longest written constitution of any sovereign country in the world, combining ideas from constitutions across the globe while addressing India’s own diverse needs.',
    comprehensionQuestions: [
      { question: 'When was the Constitution adopted?', options: ['15 August 1947', '26 November 1949', '26 January 1950', '2 October 1948'], correctAnswer: '26 November 1949' },
      { question: 'Who chaired the Drafting Committee?', options: ['Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Sardar Patel', 'Mahatma Gandhi'], correctAnswer: 'Dr. B.R. Ambedkar' },
    ],
    retentionQuestions: [
      { question: 'What date does India celebrate as Republic Day?', options: ['15 August', '26 January', '2 October', '26 November'], correctAnswer: '26 January' },
      { question: 'What was notable about the Constitution at the time?', options: ['It was the shortest in the world', 'It was the longest written constitution of any sovereign country', 'It had no amendments', 'It was unwritten'], correctAnswer: 'It was the longest written constitution of any sovereign country' },
    ],
  },
  {
    id: 'civics-three-branches',
    category: 'indian-civics',
    lengthTier: 'short',
    text: 'India’s government is organized into three branches that check and balance each other. The Legislature, made up of Parliament (the Lok Sabha and Rajya Sabha), makes laws. The Executive, headed by the Prime Minister and Council of Ministers, implements those laws and runs the day-to-day administration. The Judiciary, headed by the Supreme Court, interprets laws and ensures they align with the Constitution. This separation of powers is designed so that no single branch can hold unchecked authority over the country.',
    comprehensionQuestions: [
      { question: 'Which branch makes laws?', options: ['The Executive', 'The Legislature', 'The Judiciary', 'The Election Commission'], correctAnswer: 'The Legislature' },
      { question: 'What does the Judiciary do?', options: ['Implements laws', 'Interprets laws and checks against the Constitution', 'Collects taxes', 'Runs elections'], correctAnswer: 'Interprets laws and checks against the Constitution' },
    ],
    retentionQuestions: [
      { question: 'What are the two houses of Parliament called?', options: ['Lok Sabha and Rajya Sabha', 'Senate and Congress', 'Assembly and Council', 'Upper and Lower Court'], correctAnswer: 'Lok Sabha and Rajya Sabha' },
      { question: 'Who heads the Judiciary?', options: ['The President', 'The Supreme Court', 'The Prime Minister', 'The Parliament'], correctAnswer: 'The Supreme Court' },
    ],
  },
  {
    id: 'civics-election-commission',
    category: 'indian-civics',
    lengthTier: 'medium',
    text: 'The Election Commission of India is an independent constitutional body responsible for conducting free and fair elections across the country, at every level from the Lok Sabha down to local panchayats. Established in 1950, it oversees the world’s largest democratic exercise: India’s general elections involve hundreds of millions of voters across a huge range of terrains, from Himalayan villages to remote islands. To ensure every citizen can vote, the Commission has set up polling stations in extraordinarily remote locations, including one built solely for a single voter deep inside a forest reserve. The Commission also enforces a Model Code of Conduct during campaigns, restricting what governments and candidates can do to maintain fairness while voting is underway.',
    comprehensionQuestions: [
      { question: 'What is the Election Commission responsible for?', options: ['Writing laws', 'Conducting free and fair elections', 'Running courts', 'Collecting income tax'], correctAnswer: 'Conducting free and fair elections' },
      { question: 'When was the Election Commission established?', options: ['1947', '1950', '1962', '1991'], correctAnswer: '1950' },
    ],
    retentionQuestions: [
      { question: 'What is the Model Code of Conduct?', options: ['A tax law', 'Rules restricting campaign behavior during elections', 'A voting machine', 'A court ruling'], correctAnswer: 'Rules restricting campaign behavior during elections' },
      { question: 'What extreme example shows the Commission’s commitment to access?', options: ['Online-only voting', 'A polling station built for a single voter', 'Voting by mail only', 'Skipping remote areas'], correctAnswer: 'A polling station built for a single voter' },
    ],
  },
  {
    id: 'civics-fundamental-rights',
    category: 'indian-civics',
    lengthTier: 'medium',
    text: 'The Indian Constitution guarantees six Fundamental Rights to all citizens: the Right to Equality, the Right to Freedom, the Right against Exploitation, the Right to Freedom of Religion, Cultural and Educational Rights, and the Right to Constitutional Remedies. These rights are enforceable in court, meaning a citizen can directly approach the Supreme Court or a High Court if any of these rights are violated. The Right to Constitutional Remedies is often called the "heart and soul" of the Constitution, a phrase used by Dr. B.R. Ambedkar himself, because without a legal mechanism to enforce them, the other rights would exist only on paper.',
    comprehensionQuestions: [
      { question: 'How many Fundamental Rights does the Constitution guarantee?', options: ['Four', 'Five', 'Six', 'Eight'], correctAnswer: 'Six' },
      { question: 'What can a citizen do if a Fundamental Right is violated?', options: ['Nothing can be done', 'Approach the Supreme Court or a High Court', 'Only write a letter to Parliament', 'Wait for the next election'], correctAnswer: 'Approach the Supreme Court or a High Court' },
    ],
    retentionQuestions: [
      { question: 'Which right is called the "heart and soul" of the Constitution?', options: ['Right to Equality', 'Right to Constitutional Remedies', 'Right to Freedom', 'Right against Exploitation'], correctAnswer: 'Right to Constitutional Remedies' },
      { question: 'Who used the phrase "heart and soul"?', options: ['Jawaharlal Nehru', 'Dr. B.R. Ambedkar', 'Mahatma Gandhi', 'Sardar Patel'], correctAnswer: 'Dr. B.R. Ambedkar' },
    ],
  },
]

// Passage Selection™ dataset — Sprint 1 of the Quantum Speed Reading™
// session setup flow. Self-contained, never registry-pooled (same
// reasoning `multiLineParagraphDataset.ts`/`paragraphLibrary.ts` already
// established — a passage's category is inherent to its own content).
//
// Every passage is authored as an array of lines (the same proven
// pre-authored-lines convention every reading dataset in this pack uses),
// real, curated, never lorem ipsum. `wordCount` is derived once from the
// authored lines, never hand-counted — so Passage Selection's "Word Count"
// card field is always accurate.
//
// Scope, disclosed: 8 categories × 3 difficulties (Easy/Medium/Hard) = 24
// passages, one distinct real topic per slot — confirmed with the user as
// the right size for a foundation sprint (Adaptive is a real difficulty
// tier in the product but has no content yet; the UI shows it disabled
// rather than this file fabricating placeholder passages for it).

export type PassageCategory =
  | 'science' | 'history' | 'psychology' | 'biography'
  | 'business' | 'technology' | 'motivation' | 'general-knowledge'

export type Passage = {
  id: string
  category: PassageCategory
  difficulty: 'easy' | 'medium' | 'hard'
  title: string
  lines: readonly string[]
  wordCount: number
}

type RawPassage = Omit<Passage, 'wordCount'>

function wordCount(lines: readonly string[]): number {
  return lines.join(' ').trim().split(/\s+/).filter(Boolean).length
}

function resolve(raw: readonly RawPassage[]): Passage[] {
  return raw.map((p) => ({ ...p, wordCount: wordCount(p.lines) }))
}

const RAW_PASSAGES: readonly RawPassage[] = [
  // ── Science ──────────────────────────────────────────────────────────
  {
    id: 'science-easy-1', category: 'science', difficulty: 'easy', title: 'How Rainbows Form',
    lines: [
      'A rainbow appears when sunlight passes through drops of rain in the air.',
      'Each droplet bends the light and splits it into its different colors.',
      'Red, orange, yellow, green, blue, and violet always appear in that order.',
      'You can only see a rainbow when the sun is behind you.',
      'The rain itself must be falling somewhere in front of you.',
      'This is why rainbows often appear after a storm passes through.',
      'No two people ever see the exact same rainbow at once.',
    ],
  },
  {
    id: 'science-medium-1', category: 'science', difficulty: 'medium', title: 'The Water Cycle',
    lines: [
      'The water cycle describes how water moves continuously around our planet.',
      'Heat from the sun causes water in oceans and lakes to evaporate.',
      'This water vapor rises into the atmosphere and begins to cool.',
      'As it cools, the vapor condenses into tiny droplets that form clouds.',
      'When enough droplets gather together, they fall back to Earth as rain or snow.',
      'Some of this water soaks into the ground and refills underground reserves.',
      'The rest flows into rivers and streams, eventually returning to the ocean.',
      'This entire process repeats endlessly, with no water ever truly lost.',
    ],
  },
  {
    id: 'science-hard-1', category: 'science', difficulty: 'hard', title: 'How Vaccines Train the Immune System',
    lines: [
      'Vaccines work by teaching the immune system to recognize a specific threat.',
      'They contain a weakened, inactivated, or partial piece of a virus or bacterium.',
      'This piece cannot cause the actual disease, but it still resembles the real pathogen.',
      'When injected, the immune system detects this piece as something foreign.',
      'Specialized cells called antibodies form to specifically target that exact invader.',
      'The body also creates memory cells that remain long after the vaccine is given.',
      'These memory cells can recognize the real pathogen if it appears later.',
      'Because of this memory, the immune system responds much faster the second time.',
      'This rapid response often stops the infection before symptoms ever develop.',
      'This is the basic principle behind nearly every vaccine used today.',
    ],
  },

  // ── History ──────────────────────────────────────────────────────────
  {
    id: 'history-easy-1', category: 'history', difficulty: 'easy', title: 'The Great Wall of China',
    lines: [
      'The Great Wall of China is one of the largest structures ever built.',
      'It was constructed over many centuries by different Chinese dynasties.',
      'The wall was built mainly to protect against invasions from the north.',
      'Soldiers used the wall to watch for approaching enemies from a distance.',
      'Signal fires along the wall could warn distant cities within hours.',
      'Today the wall stretches for thousands of miles across northern China.',
      'Millions of visitors now walk sections of the wall every single year.',
    ],
  },
  {
    id: 'history-medium-1', category: 'history', difficulty: 'medium', title: 'The Printing Press Revolution',
    lines: [
      'Before the printing press, every book had to be copied by hand.',
      'This made books extremely expensive and available only to the wealthy few.',
      'In the 1440s, Johannes Gutenberg developed a printing press using movable metal type.',
      'His invention allowed identical pages to be printed quickly and repeatedly.',
      'Books suddenly became far cheaper to produce and much easier to distribute widely.',
      'Literacy rates across Europe began to slowly rise as books grew more common.',
      'New ideas could now spread between cities faster than ever before.',
      'Historians consider the printing press one of the most important inventions in human history.',
    ],
  },
  {
    id: 'history-hard-1', category: 'history', difficulty: 'hard', title: 'The Fall of the Roman Empire',
    lines: [
      'The Roman Empire once controlled vast territory stretching across Europe, Africa, and Asia.',
      'By the fourth century, the empire had grown too large to govern from one center.',
      'It was eventually split into a Western and an Eastern half for easier administration.',
      'The Western Empire faced constant pressure from various tribes migrating across its borders.',
      'Economic troubles, including heavy taxation and a weakening currency, strained the empire further.',
      'Political instability grew as emperors were frequently overthrown or assassinated by rivals.',
      'In 476 CE, a Germanic leader removed the last Western Roman emperor from power.',
      'This event is often cited as the symbolic end of the Western Roman Empire.',
      'The Eastern half, later called the Byzantine Empire, survived for another thousand years.',
      'Historians still debate exactly which factor mattered most in the empire’s decline.',
    ],
  },

  // ── Psychology ───────────────────────────────────────────────────────
  {
    id: 'psychology-easy-1', category: 'psychology', difficulty: 'easy', title: 'Why We Forget',
    lines: [
      'Forgetting is a completely normal part of how human memory works.',
      'Not every experience the brain encounters gets stored as a lasting memory.',
      'Information that is never reviewed again tends to fade relatively quickly.',
      'This is why cramming for a test often leads to fast forgetting.',
      'Repeating information over several days helps it move into long-term memory.',
      'Sleep also plays an important role in helping memories become more permanent.',
      'Forgetting unimportant details actually helps the brain focus on what matters.',
    ],
  },
  {
    id: 'psychology-medium-1', category: 'psychology', difficulty: 'medium', title: 'The Power of Habit Loops',
    lines: [
      'Psychologists describe most habits as following a simple three-part loop.',
      'The loop begins with a cue, a trigger that tells the brain to act.',
      'Next comes the routine, the actual behavior the habit consists of.',
      'Finally, a reward reinforces the behavior, making it more likely to repeat.',
      'Over time, this loop becomes automatic and requires very little conscious thought.',
      'This is why habits can feel almost impossible to break through willpower alone.',
      'Changing a habit often works best by keeping the same cue and reward.',
      'Only the routine in the middle needs to change to build a new habit.',
    ],
  },
  {
    id: 'psychology-hard-1', category: 'psychology', difficulty: 'hard', title: 'Cognitive Biases and Decision-Making',
    lines: [
      'Cognitive biases are systematic patterns of thinking that can distort human judgment.',
      'They often develop as mental shortcuts that help the brain process information quickly.',
      'Confirmation bias, for example, leads people to favor information that supports existing beliefs.',
      'This can cause someone to ignore evidence that contradicts what they already think.',
      'Anchoring bias occurs when an initial piece of information influences all later judgments.',
      'A first price offered in a negotiation, for instance, can shape the entire outcome.',
      'These biases evolved because quick decisions were often more useful than perfectly accurate ones.',
      'In complex modern situations, however, these same shortcuts can lead to real errors.',
      'Recognizing a bias does not automatically eliminate its influence on a decision.',
      'Structured decision-making processes can help reduce, though rarely fully remove, these effects.',
    ],
  },

  // ── Biography ────────────────────────────────────────────────────────
  {
    id: 'biography-easy-1', category: 'biography', difficulty: 'easy', title: 'Marie Curie’s Discovery',
    lines: [
      'Marie Curie was a scientist known for her groundbreaking research on radioactivity.',
      'She was born in Poland and later moved to France to continue her studies.',
      'Working closely with her husband, she discovered two new radioactive elements.',
      'She named one of these elements polonium, after her home country.',
      'Curie became the first woman ever to win a Nobel Prize.',
      'She later became the first person to win the prize in two different sciences.',
      'Her discoveries helped lead to major advances in modern medicine.',
    ],
  },
  {
    id: 'biography-medium-1', category: 'biography', difficulty: 'medium', title: 'The Wright Brothers’ First Flight',
    lines: [
      'Orville and Wilbur Wright were brothers who ran a small bicycle shop in Ohio.',
      'In their spare time, they became deeply fascinated with the idea of human flight.',
      'They studied birds carefully and tested numerous glider designs over several years.',
      'Unlike earlier inventors, they focused heavily on solving the problem of control.',
      'Their gliders let a pilot adjust the wings to stay balanced in the air.',
      'In December 1903, they successfully flew a powered aircraft for the first time.',
      'The flight lasted only twelve seconds but proved that powered flight was possible.',
      'Their work laid the foundation for the entire modern aviation industry.',
    ],
  },
  {
    id: 'biography-hard-1', category: 'biography', difficulty: 'hard', title: 'Nelson Mandela’s Long Walk to Freedom',
    lines: [
      'Nelson Mandela spent much of his early adult life fighting against racial segregation in South Africa.',
      'As a young lawyer, he joined the African National Congress to organize peaceful resistance.',
      'When peaceful protest was met with violent suppression, the movement shifted its strategy.',
      'Mandela was eventually arrested and sentenced to life in prison for his activism.',
      'He spent twenty-seven years imprisoned, much of it on the isolated Robben Island.',
      'Despite his imprisonment, he remained a powerful symbol of resistance around the world.',
      'International pressure on the South African government grew steadily throughout the 1980s.',
      'Mandela was finally released from prison in 1990, to global celebration.',
      'Four years later, he was elected as South Africa’s first Black president.',
      'His leadership emphasized reconciliation over revenge, shaping the nation’s transition to democracy.',
    ],
  },

  // ── Business ─────────────────────────────────────────────────────────
  {
    id: 'business-easy-1', category: 'business', difficulty: 'easy', title: 'What Makes a Good Business Plan',
    lines: [
      'A good business plan clearly explains what a company will actually sell.',
      'It also identifies exactly who the ideal customer for that product is.',
      'The plan should honestly describe how the business intends to make money.',
      'It usually includes a realistic estimate of expected costs and revenue.',
      'A strong plan also considers what competitors are already doing well.',
      'Investors often use this plan to decide whether to fund a company.',
      'Without a clear plan, even a good idea can struggle to succeed.',
    ],
  },
  {
    id: 'business-medium-1', category: 'business', difficulty: 'medium', title: 'The Rise of E-Commerce',
    lines: [
      'E-commerce refers to the buying and selling of goods over the internet.',
      'Early online stores in the 1990s were slow and often felt unfamiliar to shoppers.',
      'Over time, faster internet connections made online shopping far more convenient.',
      'Secure payment systems also helped customers feel safer entering their financial information.',
      'Companies began offering detailed product photos, reviews, and easy return policies.',
      'This combination of trust and convenience drove rapid growth across the industry.',
      'Today, many shoppers compare prices online even while standing inside physical stores.',
      'E-commerce has permanently changed how most people around the world choose to shop.',
    ],
  },
  {
    id: 'business-hard-1', category: 'business', difficulty: 'hard', title: 'How Compound Interest Builds Wealth',
    lines: [
      'Compound interest is often described as one of the most powerful forces in finance.',
      'Unlike simple interest, compound interest is calculated on both the original amount and past interest earned.',
      'This means that over time, growth accelerates rather than staying constant.',
      'A small amount invested early can eventually outgrow a larger amount invested later.',
      'This happens because the early investment has more time for interest to compound.',
      'Even a modest annual return can lead to significant growth over several decades.',
      'This is why financial advisors frequently emphasize starting to save as early as possible.',
      'Waiting even a few years to begin can meaningfully reduce the final outcome.',
      'The same principle can also work against people who carry compounding debt.',
      'Understanding this effect is considered a foundational concept in personal finance.',
    ],
  },

  // ── Technology ───────────────────────────────────────────────────────
  {
    id: 'technology-easy-1', category: 'technology', difficulty: 'easy', title: 'How Smartphones Changed Communication',
    lines: [
      'Smartphones combine a phone, a camera, and a computer into one device.',
      'Before smartphones, people had to use separate devices for each of these tasks.',
      'Sending a message or photo used to take much longer than it does now.',
      'Today, people can video call someone on the other side of the world instantly.',
      'Smartphones also give instant access to maps, news, and countless other tools.',
      'This constant connectivity has changed how people work, shop, and stay in touch.',
      'Many people now check their smartphone dozens of times throughout the day.',
    ],
  },
  {
    id: 'technology-medium-1', category: 'technology', difficulty: 'medium', title: 'The Basics of Artificial Intelligence',
    lines: [
      'Artificial intelligence refers to computer systems designed to perform tasks that typically require human thought.',
      'Many modern AI systems learn by studying large amounts of existing data.',
      'Rather than following a fixed set of rules, they identify patterns within that data.',
      'These patterns allow the system to make predictions or decisions about new situations.',
      'Voice assistants, recommendation systems, and translation tools all rely on this approach.',
      'AI systems generally perform well on tasks similar to their training data.',
      'They can struggle, however, with situations that differ significantly from what they learned.',
      'Researchers continue working to make these systems more reliable and easier to understand.',
    ],
  },
  {
    id: 'technology-hard-1', category: 'technology', difficulty: 'hard', title: 'How the Internet Actually Works',
    lines: [
      'The internet is a vast network of interconnected computers that communicate using shared protocols.',
      'When you visit a website, your device sends a request across this network.',
      'That request travels through several intermediate devices called routers before reaching its destination.',
      'Each router examines the request and forwards it along the most efficient available path.',
      'Data is broken into small packets before being sent, then reassembled once it arrives.',
      'This packet-based system allows information to travel efficiently even across long distances.',
      'Domain names, like a website address, are translated into numerical addresses by a system called DNS.',
      'This translation lets people use memorable names instead of long strings of numbers.',
      'Despite feeling instantaneous, this entire process involves many coordinated steps happening in milliseconds.',
      'No single company or country owns the internet as a whole.',
    ],
  },

  // ── Motivation ───────────────────────────────────────────────────────
  {
    id: 'motivation-easy-1', category: 'motivation', difficulty: 'easy', title: 'Small Steps, Big Change',
    lines: [
      'Large goals can often feel overwhelming when viewed all at once.',
      'Breaking a big goal into smaller steps makes it feel far more manageable.',
      'Each small step completed builds real momentum toward the larger goal.',
      'Progress, even in tiny amounts, is still genuine and meaningful progress.',
      'Consistency over time usually matters more than occasional bursts of intense effort.',
      'Celebrating small wins along the way helps sustain long-term motivation.',
      'Big changes are almost always the result of many small steps combined.',
    ],
  },
  {
    id: 'motivation-medium-1', category: 'motivation', difficulty: 'medium', title: 'The Discipline Behind Motivation',
    lines: [
      'Motivation is often described as a feeling, but discipline is what sustains real progress.',
      'Feelings of motivation naturally rise and fall depending on mood and circumstances.',
      'Discipline, however, allows someone to keep taking action even when motivation fades.',
      'Building a consistent routine reduces reliance on feeling motivated in any given moment.',
      'A fixed schedule removes the daily decision of whether to start or not.',
      'Over time, this consistency itself often becomes a genuine source of motivation.',
      'People who rely only on motivation frequently struggle during difficult stretches.',
      'Those who build discipline tend to continue moving forward regardless of how they feel.',
    ],
  },
  {
    id: 'motivation-hard-1', category: 'motivation', difficulty: 'hard', title: 'Turning Setbacks Into Growth',
    lines: [
      'Setbacks are an unavoidable part of pursuing any meaningful, long-term goal.',
      'How a person interprets a setback often matters more than the setback itself.',
      'Viewing failure as evidence of permanent inability tends to reduce future effort.',
      'Viewing the same failure as useful feedback tends to encourage continued persistence.',
      'This difference in interpretation is closely linked to what psychologists call a growth mindset.',
      'People with a growth mindset believe abilities can improve through effort and practice.',
      'This belief makes setbacks feel like temporary information rather than fixed verdicts.',
      'Reflecting specifically on what went wrong often reveals genuinely useful lessons.',
      'These lessons can then be applied directly to the next attempt at the goal.',
      'Over time, this cycle of setback, reflection, and adjustment often produces real growth.',
    ],
  },

  // ── General Knowledge ────────────────────────────────────────────────
  {
    id: 'general-knowledge-easy-1', category: 'general-knowledge', difficulty: 'easy', title: 'Why the Sky Is Blue',
    lines: [
      'Sunlight looks white, but it actually contains every color of the rainbow.',
      'As sunlight enters our atmosphere, it collides with countless tiny gas molecules.',
      'These collisions scatter shorter wavelengths of light, like blue, much more than others.',
      'Because blue light scatters in every direction, it reaches our eyes from all parts of the sky.',
      'This is why the sky appears blue during most of the day.',
      'At sunset, light travels through more atmosphere, scattering away most of the blue.',
      'This leaves behind the reds and oranges we often see at sunset.',
    ],
  },
  {
    id: 'general-knowledge-medium-1', category: 'general-knowledge', difficulty: 'medium', title: 'How Time Zones Work',
    lines: [
      'The Earth rotates once every twenty-four hours, causing day and night to cycle.',
      'Because the sun only lights one side of the Earth at a time, different regions experience different times.',
      'To standardize this, the world is divided into roughly twenty-four time zones.',
      'Each zone generally represents about one hour of difference from its neighbors.',
      'Time zones mostly follow lines of longitude, though borders often bend for convenience.',
      'Many countries adjust their clocks for daylight saving time during part of the year.',
      'This shifts daylight hours to better match typical daily activity for that season.',
      'Coordinating events across time zones can require careful planning for global businesses.',
    ],
  },
  {
    id: 'general-knowledge-hard-1', category: 'general-knowledge', difficulty: 'hard', title: 'The Story Behind the Modern Calendar',
    lines: [
      'The calendar most of the world uses today is called the Gregorian calendar.',
      'It was introduced in 1582 by Pope Gregory the Thirteenth to correct an earlier system.',
      'The previous Julian calendar slightly overestimated the length of a solar year.',
      'Over many centuries, this small error had gradually pushed important dates out of alignment.',
      'The Gregorian reform adjusted the rules for leap years to correct this drift.',
      'Not every leap year divisible by four is actually a leap year under this system.',
      'Years divisible by one hundred are skipped, unless they are also divisible by four hundred.',
      'This more precise rule keeps the calendar closely aligned with the actual solar year.',
      'Different countries adopted the new calendar at different times, sometimes centuries apart.',
      'This staggered adoption occasionally caused confusion when comparing historical dates across regions.',
    ],
  },
]

export const PASSAGE_LIBRARY: readonly Passage[] = resolve(RAW_PASSAGES)

export function getPassagesByCategory(category: PassageCategory): readonly Passage[] {
  return PASSAGE_LIBRARY.filter((passage) => passage.category === category)
}

export function getPassageById(id: string): Passage | null {
  return PASSAGE_LIBRARY.find((passage) => passage.id === id) ?? null
}

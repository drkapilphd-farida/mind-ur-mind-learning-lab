// Reading Speed Test™ passage pool — draws its 24 real passages directly
// from the actual product's Passage Selection dataset (passageLibrary.ts,
// 8 categories × 3 difficulties), rather than re-authoring or duplicating
// passage text. Only the two comprehension questions per passage are new
// here — each written to be answerable strictly from that passage's own
// lines, matching the same "real, curated, never fabricated" discipline
// speedTestContent.ts already established for the two hand-picked
// passages this pool replaces.
import { PASSAGE_LIBRARY } from "@/features/quantum-speed-reading/passageLibrary";
import type { SpeedTestPassage, SpeedTestQuestion } from "./speedTestContent";

const QUESTIONS_BY_PASSAGE_ID: Record<string, readonly [SpeedTestQuestion, SpeedTestQuestion]> = {
  "science-easy-1": [
    {
      question: "What must be true for you to see a rainbow, per the passage?",
      options: ["It must be raining directly overhead", "The sun must be behind you", "You must be facing the sun"],
      correctIndex: 1,
    },
    {
      question: "Which color always appears first in a rainbow?",
      options: ["Violet", "Blue", "Red"],
      correctIndex: 2,
    },
  ],
  "science-medium-1": [
    {
      question: "What causes water to evaporate in the water cycle?",
      options: ["Heat from the sun", "Wind blowing across oceans", "Cold temperatures at night"],
      correctIndex: 0,
    },
    {
      question: "What happens to water vapor as it rises and cools?",
      options: ["It turns directly into snow", "It disappears completely", "It condenses into droplets that form clouds"],
      correctIndex: 2,
    },
  ],
  "science-hard-1": [
    {
      question: "What do memory cells allow the immune system to do?",
      options: ["Destroy healthy cells by mistake", "Recognize the real pathogen if it appears later", "Prevent the vaccine from working"],
      correctIndex: 1,
    },
    {
      question: "Why can't the piece of virus in a vaccine cause the actual disease?",
      options: ["It is weakened, inactivated, or only a partial piece", "It bypasses the immune system entirely", "It is chemically identical to antibodies"],
      correctIndex: 0,
    },
  ],
  "history-easy-1": [
    {
      question: "What was the Great Wall mainly built to do?",
      options: ["Serve as a trade route", "Protect against invasions from the north", "Mark the border with the ocean"],
      correctIndex: 1,
    },
    {
      question: "How did soldiers warn distant cities of approaching enemies?",
      options: ["Carrier pigeons", "Sending runners on horseback", "Signal fires along the wall"],
      correctIndex: 2,
    },
  ],
  "history-medium-1": [
    {
      question: "Who developed the printing press with movable metal type?",
      options: ["Marie Curie", "Johannes Gutenberg", "Pope Gregory"],
      correctIndex: 1,
    },
    {
      question: "What was true about books before the printing press, per the passage?",
      options: ["They were mass-produced cheaply", "They were mainly religious texts only", "They were extremely expensive since every copy was made by hand"],
      correctIndex: 2,
    },
  ],
  "history-hard-1": [
    {
      question: "What event is often cited as the symbolic end of the Western Roman Empire?",
      options: ["The founding of the Byzantine Empire", "A Germanic leader removing the last Western Roman emperor in 476 CE", "The empire splitting in two"],
      correctIndex: 1,
    },
    {
      question: "What happened to the Eastern half of the empire?",
      options: ["It survived for another thousand years as the Byzantine Empire", "It collapsed at the same time as the West", "It merged with the Western half"],
      correctIndex: 0,
    },
  ],
  "psychology-easy-1": [
    {
      question: "Why does cramming for a test often lead to fast forgetting, per the passage?",
      options: ["The brain rejects new information under stress", "Information that isn't reviewed again tends to fade quickly", "Cramming permanently damages memory"],
      correctIndex: 1,
    },
    {
      question: "What role does sleep play, per the passage?",
      options: ["It helps memories become more permanent", "It has no effect on memory", "It erases unimportant memories only"],
      correctIndex: 0,
    },
  ],
  "psychology-medium-1": [
    {
      question: "What are the three parts of a habit loop?",
      options: ["Trigger, thought, and action", "Cue, routine, and reward", "Habit, willpower, and change"],
      correctIndex: 1,
    },
    {
      question: "According to the passage, what's the best way to change a habit?",
      options: ["Remove the cue entirely", "Change the reward but keep the routine", "Keep the same cue and reward, change only the routine"],
      correctIndex: 2,
    },
  ],
  "psychology-hard-1": [
    {
      question: "What is confirmation bias, per the passage?",
      options: ["A bias that only affects negotiations", "Favoring information that supports existing beliefs", "Always trusting the first price offered"],
      correctIndex: 1,
    },
    {
      question: "What does anchoring bias describe?",
      options: ["An initial piece of information influencing all later judgments", "The tendency to forget information quickly", "A bias with no real-world effect"],
      correctIndex: 0,
    },
  ],
  "biography-easy-1": [
    {
      question: "What was Marie Curie's area of research?",
      options: ["Astronomy", "Radioactivity", "Genetics"],
      correctIndex: 1,
    },
    {
      question: "What made Marie Curie's Nobel Prize achievement unique?",
      options: ["She refused her Nobel Prize", "She won the Nobel Prize for Literature", "She was the first person to win the prize in two different sciences"],
      correctIndex: 2,
    },
  ],
  "biography-medium-1": [
    {
      question: "What did the Wright brothers focus heavily on solving, unlike earlier inventors?",
      options: ["The problem of engine power", "The problem of control", "The problem of landing gear"],
      correctIndex: 1,
    },
    {
      question: "How long did their first powered flight last?",
      options: ["One hour", "Twelve minutes", "Twelve seconds"],
      correctIndex: 2,
    },
  ],
  "biography-hard-1": [
    {
      question: "How many years was Mandela imprisoned?",
      options: ["Ten years", "Twenty-seven years", "Four years"],
      correctIndex: 1,
    },
    {
      question: "What did Mandela's leadership emphasize after his release?",
      options: ["Strict punishment of past oppressors", "Withdrawal from politics", "Reconciliation over revenge"],
      correctIndex: 2,
    },
  ],
  "business-easy-1": [
    {
      question: "What does a good business plan clearly explain, per the passage?",
      options: ["The founder's personal history", "What the company will actually sell", "The company's office location"],
      correctIndex: 1,
    },
    {
      question: "Who often uses a business plan to decide whether to fund a company?",
      options: ["Investors", "Competitors", "Customers"],
      correctIndex: 0,
    },
  ],
  "business-medium-1": [
    {
      question: "What helped customers feel safer shopping online, per the passage?",
      options: ["Slower internet connections", "Fewer product reviews", "Secure payment systems"],
      correctIndex: 2,
    },
    {
      question: "What do many shoppers do today, per the passage?",
      options: ["Compare prices online even inside physical stores", "Avoid using the internet to shop", "Only shop in physical stores"],
      correctIndex: 0,
    },
  ],
  "business-hard-1": [
    {
      question: "How is compound interest different from simple interest, per the passage?",
      options: ["It only applies to large investments", "It's calculated on both the original amount and past interest earned", "It decreases over time"],
      correctIndex: 1,
    },
    {
      question: "Why can a small amount invested early outgrow a larger amount invested later?",
      options: ["Early investments always have higher interest rates", "Later investments are taxed more heavily", "The early investment has more time for interest to compound"],
      correctIndex: 2,
    },
  ],
  "technology-easy-1": [
    {
      question: "What three devices does a smartphone combine into one, per the passage?",
      options: ["A camera, a printer, and a calculator", "A phone, a camera, and a computer", "A phone, a radio, and a television"],
      correctIndex: 1,
    },
    {
      question: "What has constant connectivity changed, per the passage?",
      options: ["Only how people make phone calls", "Nothing significant", "How people work, shop, and stay in touch"],
      correctIndex: 2,
    },
  ],
  "technology-medium-1": [
    {
      question: "How do many modern AI systems learn, per the passage?",
      options: ["By following a fixed set of rules only", "By studying large amounts of existing data", "By copying human brain cells"],
      correctIndex: 1,
    },
    {
      question: "When do AI systems tend to struggle, per the passage?",
      options: ["Only during voice recognition tasks", "When given too little data", "With situations that differ significantly from their training data"],
      correctIndex: 2,
    },
  ],
  "technology-hard-1": [
    {
      question: "What does DNS do, per the passage?",
      options: ["Breaks data into packets", "Translates domain names into numerical addresses", "Physically connects routers together"],
      correctIndex: 1,
    },
    {
      question: "What happens to data before it's sent across the internet?",
      options: ["It's translated into a foreign language", "It's compressed into a single large file", "It's broken into small packets, then reassembled on arrival"],
      correctIndex: 2,
    },
  ],
  "motivation-easy-1": [
    {
      question: "What does breaking a big goal into smaller steps do, per the passage?",
      options: ["Makes the goal take longer to finish", "Makes it feel far more manageable", "Removes the need for consistency"],
      correctIndex: 1,
    },
    {
      question: "What does the passage say usually matters more than occasional bursts of effort?",
      options: ["Setting bigger goals", "Natural talent", "Consistency over time"],
      correctIndex: 2,
    },
  ],
  "motivation-medium-1": [
    {
      question: "What does the passage say sustains real progress, unlike motivation?",
      options: ["Luck", "Discipline", "Talent"],
      correctIndex: 1,
    },
    {
      question: "What does building a consistent routine reduce reliance on, per the passage?",
      options: ["Having clear goals", "Feeling motivated in any given moment", "Sleeping enough"],
      correctIndex: 1,
    },
  ],
  "motivation-hard-1": [
    {
      question: "What does a growth mindset lead people to believe, per the passage?",
      options: ["Ability is fixed and cannot change", "Setbacks should always be avoided", "Abilities can improve through effort and practice"],
      correctIndex: 2,
    },
    {
      question: "What often matters more than the setback itself, per the passage?",
      options: ["How a person interprets the setback", "How severe the setback was", "Who caused the setback"],
      correctIndex: 0,
    },
  ],
  "general-knowledge-easy-1": [
    {
      question: "Why does the sky appear blue, per the passage?",
      options: ["The atmosphere is naturally blue-colored", "Blue light scatters in every direction and reaches our eyes from all parts of the sky", "Blue light travels slower than other colors"],
      correctIndex: 1,
    },
    {
      question: "Why does the sky turn red and orange at sunset, per the passage?",
      options: ["Clouds block all colors except red", "The sun itself turns red at sunset", "Light travels through more atmosphere, scattering away most of the blue"],
      correctIndex: 2,
    },
  ],
  "general-knowledge-medium-1": [
    {
      question: "Roughly how many time zones is the world divided into, per the passage?",
      options: ["Twelve", "Twenty-four", "Seven"],
      correctIndex: 1,
    },
    {
      question: "What do many countries adjust for part of the year, per the passage?",
      options: ["Their time zone boundaries permanently", "The length of an hour", "Their clocks, for daylight saving time"],
      correctIndex: 2,
    },
  ],
  "general-knowledge-hard-1": [
    {
      question: "What calendar does most of the world use today, per the passage?",
      options: ["The Julian calendar", "The Lunar calendar", "The Gregorian calendar"],
      correctIndex: 2,
    },
    {
      question: "Under the Gregorian rule described, which century years are NOT leap years?",
      options: ["Years divisible by 100 unless also divisible by 400", "All years divisible by 100", "No century year is ever skipped"],
      correctIndex: 0,
    },
  ],
};

export const SPEED_TEST_PASSAGE_POOL: readonly SpeedTestPassage[] = PASSAGE_LIBRARY.filter(
  (passage) => passage.id in QUESTIONS_BY_PASSAGE_ID,
).map((passage) => ({
  text: passage.lines.join(" "),
  questions: QUESTIONS_BY_PASSAGE_ID[passage.id] as [SpeedTestQuestion, SpeedTestQuestion],
}));

function pickTwoDistinctRandomIndices(length: number): [number, number] {
  const first = Math.floor(Math.random() * length);
  let second = Math.floor(Math.random() * (length - 1));
  if (second >= first) second += 1;
  return [first, second];
}

// Real randomness, verified in speedTestPassagePool.test.ts — always two
// distinct passages from the full pool, never a fixed index.
export function pickRandomPassagePair(): [SpeedTestPassage, SpeedTestPassage] {
  const [i, j] = pickTwoDistinctRandomIndices(SPEED_TEST_PASSAGE_POOL.length);
  const first = SPEED_TEST_PASSAGE_POOL[i];
  const second = SPEED_TEST_PASSAGE_POOL[j];
  if (first === undefined || second === undefined) {
    throw new Error("SPEED_TEST_PASSAGE_POOL is unexpectedly empty");
  }
  return [first, second];
}

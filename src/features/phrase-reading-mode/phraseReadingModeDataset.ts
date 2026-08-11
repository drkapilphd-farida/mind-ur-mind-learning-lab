import type { ReadingUnit } from '@/features/reading-engine/types'

// Phrase Reading Mode™ dataset — Quantum Speed Reading™ V2, Master Reading
// Engine mode #2. Deliberately its own folder/content, separate from the
// unrelated, protected V1 "Phrase Reading™" exercise
// (src/features/phrase-reading/) — no shared files, no route collision.
//
// 10/10 Overhaul — a genuine 25-category library of real, hand-authored,
// multi-sentence reading passages (no AI, no lorem ipsum, no random word
// combinations), spanning quantum principles, cognitive habits, deep
// history, neuroscience, and adjacent fascinating domains. Each sentence is
// split into natural 2-4 word syntactic phrase chunks (subject group / verb
// group / prepositional phrase) — the same shape the original dataset
// established with its "The quick brown" / "fox jumps over" / "the lazy
// dog" example — so Phrase Reading trains chunk recognition, not
// word-by-word reading, across genuinely substantial content instead of a
// handful of short throwaway lines.
export type PhraseReadingModeCategory = {
  id: string
  label: string
  sentences: readonly (readonly string[])[]
}

export const PHRASE_READING_MODE_CATEGORIES: readonly PhraseReadingModeCategory[] = [
  {
    id: 'quantum-principles',
    label: 'Quantum Principles',
    sentences: [
      ['Quantum particles exist', 'in multiple states', 'at once until', 'they are measured'],
      ['This strange behavior', 'is called superposition', 'and it defies', 'everyday intuition'],
      ['Two entangled particles', 'can influence each other', 'instantly across', 'vast distances'],
      ['Einstein famously called', 'this effect spooky', 'action at', 'a distance'],
      ['Observing a quantum system', 'changes its behavior', 'in fundamental ways'],
      ['Quantum computers exploit', 'these properties', 'to solve certain problems', 'exponentially faster'],
      ['Tiny uncertainties', 'at this scale', 'ripple outward', 'into the visible world'],
    ],
  },
  {
    id: 'cognitive-habits',
    label: 'Cognitive Habits',
    sentences: [
      ['Small daily habits', 'compound into', 'massive changes', 'over months and years'],
      ['The brain automates', 'repeated behavior', 'to conserve', 'valuable mental energy'],
      ['A habit loop', 'consists of', 'a cue a routine', 'and a reward'],
      ['Willpower alone', 'rarely sustains change', 'without supportive', 'environmental design'],
      ['Breaking a habit', 'is easier when', 'you replace it', 'with another'],
      ['Consistency matters more', 'than intensity', 'when building', 'lasting behavior'],
      ['Tracking small wins', 'keeps motivation alive', 'during difficult stretches'],
    ],
  },
  {
    id: 'ancient-civilizations',
    label: 'Ancient Civilizations',
    sentences: [
      ['The city of Uruk', 'in Mesopotamia', 'is among the oldest', 'known urban centers'],
      ['Sumerians invented', 'cuneiform script', 'to record', 'trade and temple accounts'],
      ['The Indus Valley civilization', 'built cities', 'with remarkably advanced', 'drainage systems'],
      ['Ancient Egyptians aligned', 'the pyramids', 'with extraordinary', 'astronomical precision'],
      ['Trade networks connected', 'civilizations separated', 'by thousands', 'of miles'],
      ['Written law codes', 'emerged to bring', 'order to growing', 'city states'],
      ['Many ancient innovations', 'still quietly shape', 'modern daily life'],
    ],
  },
  {
    id: 'neuroscience',
    label: 'Neuroscience',
    sentences: [
      ['The human brain', 'contains roughly', 'eighty six billion', 'individual neurons'],
      ['Neurons communicate', 'through electrical impulses', 'and chemical messengers', 'called neurotransmitters'],
      ['Synaptic connections', 'strengthen or weaken', 'based on', 'repeated experience'],
      ['This adaptability', 'is known as', 'neuroplasticity and', 'it never fully stops'],
      ['The hippocampus plays', 'a central role', 'in forming', 'new memories'],
      ['Sleep allows the brain', 'to consolidate', 'and organize', "the day's learning"],
      ['Chronic stress can', 'measurably shrink', 'regions responsible', 'for memory'],
    ],
  },
  {
    id: 'behavioral-psychology',
    label: 'Behavioral Psychology',
    sentences: [
      ['People often value', 'avoiding losses', 'more than acquiring', 'equivalent gains'],
      ['This tendency', 'is known as', 'loss aversion', 'in behavioral economics'],
      ['Social proof strongly', 'influences decisions', 'when situations', 'feel uncertain'],
      ['Anchoring causes', 'an initial number', 'to bias', 'later judgments'],
      ['Present bias leads', 'people to favor', 'smaller immediate rewards'],
      ['Awareness of these biases', 'can noticeably improve', 'everyday decisions'],
      ['Small nudges', 'in choice design', 'can shift behavior', 'at scale'],
    ],
  },
  {
    id: 'space-astrophysics',
    label: 'Space & Astrophysics',
    sentences: [
      ['Light from distant galaxies', 'can take', 'billions of years', 'to reach us'],
      ['A single teaspoon', 'of neutron star material', 'would weigh', 'billions of tons'],
      ['Black holes warp', 'space and time', 'so strongly that', 'light cannot escape'],
      ['Our sun is', 'one among roughly', 'two hundred billion stars'],
      ['The Milky Way itself', 'is just one galaxy', 'among countless others'],
      ['Cosmic microwave background', 'radiation is', 'the afterglow', 'of the early universe'],
      ['Studying starlight reveals', 'the chemical fingerprints', 'of distant worlds'],
    ],
  },
  {
    id: 'evolutionary-biology',
    label: 'Evolutionary Biology',
    sentences: [
      ['Natural selection favors', 'traits that improve', 'survival and reproduction'],
      ['Small genetic variations', 'accumulate gradually', 'across many generations'],
      ['Convergent evolution can', 'produce similar traits', 'in unrelated species'],
      ['The fossil record', 'reveals a slow', 'branching tree', 'of life'],
      ['Camouflage evolved independently', 'in countless different', 'animal lineages'],
      ['Cooperation and altruism', 'can offer surprising', 'evolutionary advantages'],
      ['Even bacteria evolve', 'rapidly enough', 'to be observed', 'in a lab'],
    ],
  },
  {
    id: 'philosophy-of-mind',
    label: 'Philosophy of Mind',
    sentences: [
      ['Philosophers still debate', 'whether consciousness', 'can ever be', 'fully explained'],
      ['The mind body problem', 'asks how thoughts', 'relate to', 'physical brains'],
      ['Some argue that', 'subjective experience', 'cannot be reduced', 'to mere neurons'],
      ['Others believe', 'consciousness naturally emerges', 'from sufficient complexity'],
      ['Thought experiments help', 'sharpen difficult questions', 'about identity and self'],
      ['Free will remains', "one of philosophy's", 'most contested puzzles'],
      ['Every new theory', 'of mind reshapes', 'how we understand ourselves'],
    ],
  },
  {
    id: 'ancient-philosophy',
    label: 'Ancient Philosophy',
    sentences: [
      ['Socrates taught', 'through relentless questioning', 'rather than', 'direct answers'],
      ['Plato believed', 'physical objects were', 'imperfect shadows', 'of ideal forms'],
      ['Aristotle grounded', 'his philosophy', 'in careful observation', 'of nature'],
      ['Stoic philosophers taught', 'that peace comes', "from controlling one's reactions"],
      ['Ancient thinkers debated', 'virtue, justice, and', 'the nature', 'of a good life'],
      ['Many modern ideas', 'still trace directly', 'back to', 'these early debates'],
      ['Their questions remain', 'remarkably relevant', 'more than', 'two thousand years later'],
    ],
  },
  {
    id: 'age-of-exploration',
    label: 'Age of Exploration',
    sentences: [
      ['European sailors risked', 'months at sea', 'guided only by', 'stars and instinct'],
      ['New navigational tools', 'like the astrolabe', 'transformed long', 'ocean voyages'],
      ['Trade routes reshaped', 'economies and connected', 'once isolated continents'],
      ['Explorers often returned', 'with maps that', 'rewrote existing views', 'of the world'],
      ['These voyages carried', 'plants, animals,', 'and diseases', 'across the oceans'],
      ['Entire cultures collided', 'as new sea routes', 'opened rapidly'],
      ['The era permanently', 'altered the political', 'map of the world'],
    ],
  },
  {
    id: 'memory-learning-science',
    label: 'Memory & Learning Science',
    sentences: [
      ['Spaced repetition', 'strengthens memory', 'far better than', 'last minute cramming'],
      ['Retrieval practice forces', 'the brain', 'to actively rebuild', 'a memory'],
      ['Sleep plays', 'an essential role', 'in locking new', 'learning into place'],
      ['Emotional experiences are', 'often remembered', 'more vividly', 'than neutral ones'],
      ['Teaching a concept', 'to someone else', 'deepens your own understanding'],
      ['Interleaving different topics', 'improves long term', 'retention surprisingly well'],
      ['Forgetting is not', 'always failure, it', 'can even strengthen', 'future recall'],
    ],
  },
  {
    id: 'artificial-intelligence',
    label: 'Artificial Intelligence',
    sentences: [
      ['Modern neural networks', 'loosely mimic', 'the layered structure', 'of the brain'],
      ['Machine learning systems', 'improve their accuracy', 'through repeated exposure', 'to data'],
      ['Pattern recognition allows', 'algorithms to detect', 'subtle hidden trends'],
      ['Training these systems', 'requires enormous amounts', 'of computing power'],
      ['Reinforcement learning teaches', 'machines through rewards', 'and gentle penalties'],
      ['AI systems can', 'now translate, summarize,', 'and generate', 'original text'],
      ['Understanding these systems', 'is becoming a', 'genuinely essential', 'modern skill'],
    ],
  },
  {
    id: 'earth-systems',
    label: 'Earth Systems',
    sentences: [
      ["Earth's atmosphere is", 'a thin fragile layer', 'compared to', "the planet's size"],
      ['Ocean currents redistribute', 'heat around', 'the entire globe continuously'],
      ['Plate tectonics slowly', 'reshapes continents', 'over millions', 'of years'],
      ['The carbon cycle', 'links oceans, forests,', 'soil, and', 'the atmosphere'],
      ['Volcanic eruptions can', 'measurably cool', 'the planet', 'for several years'],
      ['Ice cores preserve', 'a detailed record', 'of the ancient climate'],
      ['Small systemic shifts', 'can cascade into', 'large global consequences'],
    ],
  },
  {
    id: 'behavioral-economics',
    label: 'Behavioral Economics',
    sentences: [
      ['People are not', 'always the perfectly', 'rational actors', 'classical models assume'],
      ['Framing a choice', 'differently can', 'dramatically change', 'what people decide'],
      ['Scarcity narrows attention', 'and can distort', 'otherwise careful judgment'],
      ['Default options quietly', 'shape outcomes', 'far more than', 'most realize'],
      ['Mental accounting causes', 'people to treat', 'money differently', 'by source'],
      ['Overconfidence often leads', 'to costly and', 'avoidable financial mistakes'],
      ['Understanding these patterns', 'helps design fairer', 'and smarter systems'],
    ],
  },
  {
    id: 'ancient-egypt',
    label: 'Ancient Egypt & Mythology',
    sentences: [
      ['Ancient Egyptians believed', 'the heart, not', 'the brain, held', "a person's thoughts"],
      ["The Nile's predictable", 'floods shaped', 'the entire rhythm', 'of Egyptian life'],
      ['Elaborate burial rituals', 'reflected deep beliefs', 'about a life', 'after death'],
      ['Hieroglyphs combined', 'pictures and sounds', 'into a rich', 'written language'],
      ['Pharaohs were viewed', 'as living intermediaries', 'between gods and people'],
      ['Massive monuments were', 'built using', 'remarkably coordinated', 'human labor'],
      ['Egyptian mythology wove', 'creation, order,', 'and chaos into', 'a single worldview'],
    ],
  },
  {
    id: 'roman-empire',
    label: 'Roman Empire',
    sentences: [
      ['Roman roads once', 'connected an empire', 'spanning three', 'separate continents'],
      ['Engineering innovations', 'like concrete allowed', 'structures to endure', 'for millennia'],
      ['A complex legal system', 'influenced law', 'across much', 'of the modern world'],
      ['Roman aqueducts carried', 'fresh water', 'across incredible', 'engineered distances'],
      ["The empire's vast size", 'eventually made it', 'difficult to govern'],
      ['Latin, its official', 'language, still echoes', 'through many', 'modern tongues'],
      ["Rome's rise and fall", 'remains a case study', 'in imperial power'],
    ],
  },
  {
    id: 'renaissance-innovation',
    label: 'Renaissance Innovation',
    sentences: [
      ['The Renaissance blended', 'art, science,', 'and philosophy into', 'a single pursuit'],
      ['Artists studied', 'human anatomy', 'to paint the body', 'with new precision'],
      ['The printing press', 'rapidly accelerated', 'the spread', 'of new ideas'],
      ['Patrons funded', 'ambitious projects', 'that once seemed', 'impossibly expensive'],
      ['Scientific observation slowly', 'began to challenge', 'long held', 'ancient assumptions'],
      ['Curiosity itself', 'was treated as', 'a genuinely', 'admirable virtue'],
      ["This era's spirit", 'still quietly shapes', 'how we value', 'creativity today'],
    ],
  },
  {
    id: 'ocean-mysteries',
    label: 'Ocean Mysteries',
    sentences: [
      ['More of', 'the ocean floor', 'has been mapped', 'on the moon', 'than on Earth'],
      ['Bioluminescent creatures create', 'their own', 'eerie light', 'in total darkness'],
      ['Deep sea vents', 'host entire ecosystems', 'that never see sunlight'],
      ['Ocean currents move', 'heat and nutrients', 'across the entire planet'],
      ['Some deep sea', 'organisms can survive', 'crushing, extreme', 'water pressure'],
      ['Coral reefs support', 'a staggering share', 'of all marine species'],
      ['Vast stretches', 'of open ocean', 'remain almost', 'completely unexplored'],
    ],
  },
  {
    id: 'genetics-dna',
    label: 'Genetics & DNA',
    sentences: [
      ['A single strand', 'of human DNA', 'would stretch nearly', 'two meters if unwound'],
      ['Genes carry instructions', 'that guide how', 'proteins are built', 'and used'],
      ['Most human DNA', 'is remarkably similar', 'across every population', 'on Earth'],
      ['Small genetic mutations', 'can sometimes lead', 'to significant', 'new traits'],
      ['Epigenetics shows', 'that environment can', 'influence how genes', 'are expressed'],
      ['Twin studies help', 'scientists separate', 'genetic from', 'environmental influence'],
      ['Modern gene editing', 'tools raise', 'powerful new', 'ethical questions'],
    ],
  },
  {
    id: 'sleep-science',
    label: 'Sleep Science',
    sentences: [
      ['Deep sleep triggers', 'the release', 'of hormones essential', 'for growth and repair'],
      ['REM sleep is', 'closely linked', 'to vivid dreaming', 'and emotional processing'],
      ['Chronic sleep deprivation', 'measurably impairs', 'memory, mood,', 'and judgment'],
      ["The body's internal clock", 'relies heavily', 'on consistent', 'light exposure'],
      ['Sleep debt cannot', 'be fully repaid', 'by a single', "long night's rest"],
      ['Consistent sleep schedules', 'improve both focus', 'and long term health'],
      ['Even mild sleep loss', 'can quietly and', 'significantly slow', 'reaction time'],
    ],
  },
  {
    id: 'habit-formation',
    label: 'Habit Formation & Willpower',
    sentences: [
      ['Motivation is unreliable,', 'but consistent systems', 'produce dependable', 'long term results'],
      ['Environment design often', 'matters more than', 'raw personal discipline'],
      ['Habits form faster', 'when the very', 'first step feels', 'effortlessly easy'],
      ['Immediate rewards reinforce', 'behavior far more', 'strongly than', 'distant ones'],
      ['Identity based habits', 'tend to stick', 'more firmly than', 'goal based ones'],
      ['Removing friction is', 'often more effective', 'than adding', 'sheer willpower'],
      ['Small wins build', 'the confidence needed', 'to sustain', 'much larger change'],
    ],
  },
  {
    id: 'focus-deep-work',
    label: 'Focus & Deep Work',
    sentences: [
      ['Deep, undistracted work', 'produces disproportionately', 'more value than', 'shallow busywork'],
      ['Constant task switching', 'carries a measurable', 'and often hidden', 'cognitive cost'],
      ['Attention is', 'a genuinely finite', 'resource that must', 'be deliberately protected'],
      ['Scheduled focus blocks', 'train the mind', 'to concentrate', 'on command'],
      ['Boredom often precedes', 'the deepest and', 'most valuable', 'creative insights'],
      ['Digital distractions are', 'specifically engineered', 'to fragment', 'sustained attention'],
      ['Protecting long stretches', 'of quiet time', 'is a rare', 'competitive advantage'],
    ],
  },
  {
    id: 'silk-road-trade',
    label: 'Silk Road Trade',
    sentences: [
      ['The Silk Road was', 'less a single road', 'than a vast', 'interconnected network'],
      ['Silk, spices,', 'and ideas traveled', 'together across', 'thousands of miles'],
      ['Religions, languages,', 'and technologies spread', 'quietly along these', 'ancient trade routes'],
      ['Merchants relied on', 'relay networks rather', 'than any single', 'continuous journey'],
      ['Oasis cities grew', 'wealthy as vital', 'hubs along', 'these desert paths'],
      ['Diseases as well', 'as goods often', 'traveled along', 'the very same routes'],
      ['This ancient network', 'quietly foreshadowed', "today's deeply connected", 'global economy'],
    ],
  },
  {
    id: 'cosmology-big-bang',
    label: 'Cosmology & The Big Bang',
    sentences: [
      ['The universe began', 'expanding rapidly', 'from an extraordinarily', 'hot dense state'],
      ['Space itself has', 'been stretching outward', 'for roughly', 'fourteen billion years'],
      ['The cosmic microwave', 'background offers', 'a faint snapshot', 'of the infant universe'],
      ['Galaxies formed as', 'gravity slowly pulled', 'early matter into', 'dense clumps'],
      ['Most of', "the universe's mass", 'and energy remains', 'genuinely invisible to us'],
      ['Dark matter and', 'dark energy shape', 'the cosmos in ways', 'still poorly understood'],
      ['Every atom', 'in your body', 'was ultimately forged', 'inside ancient dying stars'],
    ],
  },
  {
    id: 'emotional-intelligence',
    label: 'Emotional Intelligence',
    sentences: [
      ['Naming an emotion', 'precisely can', 'measurably reduce', 'its immediate intensity'],
      ['Self awareness forms', 'the essential foundation', 'for genuine', 'emotional intelligence'],
      ['Empathy requires', 'genuinely imagining', 'a situation from', "another person's perspective"],
      ['Emotional regulation is', 'a learnable skill,', 'not a fixed', 'inborn trait'],
      ['Reacting instead', 'of responding often', 'quietly escalates', 'minor daily conflicts'],
      ['Strong relationships', 'consistently rely on', 'clear and honest communication'],
      ['Emotional intelligence often', 'predicts life outcomes', 'as strongly as', 'raw IQ'],
    ],
  },
] as const

export const TOTAL_PHRASE_READING_MODE_CATEGORIES = PHRASE_READING_MODE_CATEGORIES.length

export function buildUnitsForCategory(category: PhraseReadingModeCategory): readonly ReadingUnit[] {
  return category.sentences.flat().map((text, index) => ({ id: `${category.id}-phrase-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-phrase-reading-mode-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses (Vertical Chunk Sliding, Flash Recall Sprint,
// Vertical Flash Recall, Vertical Word Reading) — client-only, called only
// from a useEffect in the Experience orchestrator, never a lazy useState
// initializer, so the server-rendered 'settings' phase and the client's
// first paint always match before this ever runs.
export function pickSessionCategory(): PhraseReadingModeCategory {
  const categories = PHRASE_READING_MODE_CATEGORIES
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

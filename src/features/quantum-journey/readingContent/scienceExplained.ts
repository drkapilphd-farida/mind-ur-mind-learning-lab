import type { JourneyReadingSetDef } from './types'

export const SCIENCE_EXPLAINED: readonly JourneyReadingSetDef[] = [
  {
    id: 'science-why-sky-blue',
    category: 'science-explained',
    lengthTier: 'short',
    text: 'Sunlight looks white, but it is actually made of every color mixed together. As it passes through Earth’s atmosphere, tiny gas molecules scatter blue light far more than red or yellow light, because blue waves are shorter and bounce around more easily. This scattered blue light reaches your eyes from every direction in the sky, which is why the sky looks blue instead of white. At sunset, sunlight travels through more atmosphere, scattering away most of the blue and leaving the reds and oranges you see.',
    comprehensionQuestions: [
      { question: 'Why does blue light scatter more than red light?', options: ['It is brighter', 'It has shorter waves', 'It is warmer', 'It travels slower'], correctAnswer: 'It has shorter waves' },
      { question: 'Why does the sky look red at sunset?', options: ['The sun changes color', 'Sunlight travels through more atmosphere', 'Clouds turn red', 'The moon reflects red light'], correctAnswer: 'Sunlight travels through more atmosphere' },
    ],
    retentionQuestions: [
      { question: 'What is sunlight actually made of?', options: ['Only yellow light', 'Every color mixed together', 'Only blue light', 'Invisible rays'], correctAnswer: 'Every color mixed together' },
      { question: 'What scatters the sunlight in the sky?', options: ['Water droplets', 'Tiny gas molecules', 'Dust storms', 'Ice crystals'], correctAnswer: 'Tiny gas molecules' },
    ],
  },
  {
    id: 'science-how-vaccines-work',
    category: 'science-explained',
    lengthTier: 'short',
    text: 'A vaccine works by showing your immune system a harmless piece of a virus or bacteria, without ever causing the real disease. Your body treats this piece as a threat and builds antibodies to fight it, the same way it would during a real infection. Some immune cells then "remember" this threat for years. If the real virus ever enters your body later, your immune system recognizes it instantly and destroys it before you get seriously sick — often before you notice any symptoms at all.',
    comprehensionQuestions: [
      { question: 'What does a vaccine show your immune system?', options: ['A full-strength virus', 'A harmless piece of a virus or bacteria', 'A random chemical', 'Nothing at all'], correctAnswer: 'A harmless piece of a virus or bacteria' },
      { question: 'What does your body build in response?', options: ['Antibodies', 'New blood cells', 'Extra bones', 'More muscle'], correctAnswer: 'Antibodies' },
    ],
    retentionQuestions: [
      { question: 'What do immune cells do after vaccination?', options: ['Forget the threat quickly', 'Remember the threat for years', 'Attack healthy cells', 'Disappear'], correctAnswer: 'Remember the threat for years' },
      { question: 'What happens if the real virus enters later?', options: ['The body ignores it', 'The immune system recognizes and destroys it', 'The vaccine stops working', 'Nothing changes'], correctAnswer: 'The immune system recognizes and destroys it' },
    ],
  },
  {
    id: 'science-why-we-yawn',
    category: 'science-explained',
    lengthTier: 'medium',
    text: 'Scientists once believed yawning was simply the body’s way of getting more oxygen, but that theory has largely been disproven — holding your breath doesn’t make you yawn more, and breathing pure oxygen doesn’t make you yawn less. A newer theory suggests yawning helps cool down the brain. Studies found people yawn more often in warm environments and less in cold ones, and yawning increases blood flow and stretches the jaw muscles in a way that may help regulate brain temperature. Yawning is also strangely contagious: seeing someone else yawn, or even reading about yawning, can trigger your own yawn, which some researchers link to empathy and social bonding between people who are paying close attention to each other.',
    comprehensionQuestions: [
      { question: 'What older theory about yawning has been mostly disproven?', options: ['That it cools the brain', 'That it is about getting more oxygen', 'That it is contagious', 'That it happens only at night'], correctAnswer: 'That it is about getting more oxygen' },
      { question: 'What does the newer theory suggest yawning helps with?', options: ['Digestion', 'Cooling the brain', 'Building muscle', 'Improving eyesight'], correctAnswer: 'Cooling the brain' },
    ],
    retentionQuestions: [
      { question: 'In what kind of environments do people yawn more?', options: ['Cold environments', 'Warm environments', 'Dark rooms', 'Loud places'], correctAnswer: 'Warm environments' },
      { question: 'What can trigger contagious yawning?', options: ['Eating food', 'Seeing someone else yawn', 'Loud noises', 'Bright light'], correctAnswer: 'Seeing someone else yawn' },
    ],
  },
  {
    id: 'science-monsoon-formation',
    category: 'science-explained',
    lengthTier: 'medium',
    text: 'India’s monsoon exists because land and ocean heat up at very different speeds. In summer, the Indian landmass heats up much faster than the surrounding Indian Ocean, creating a large area of low pressure over land. Moist ocean air rushes in to fill that low pressure, carrying huge amounts of water vapor toward the subcontinent. As this moist air is forced upward over the Western Ghats and the Himalayas, it cools rapidly and releases its moisture as heavy rainfall. This same pattern reverses in winter: the land cools faster than the ocean, pressure builds over land instead, and dry winds blow outward from India toward the sea, which is why winters across most of the country stay largely dry.',
    comprehensionQuestions: [
      { question: 'Why does low pressure form over India in summer?', options: ['The ocean heats faster than land', 'The land heats faster than the ocean', 'Cold winds blow in from the north', 'The Himalayas block all wind'], correctAnswer: 'The land heats faster than the ocean' },
      { question: 'What causes the moist air to release rain?', options: ['It cools rapidly rising over mountains', 'It mixes with desert sand', 'It is struck by lightning', 'It freezes over the ocean'], correctAnswer: 'It cools rapidly rising over mountains' },
    ],
    retentionQuestions: [
      { question: 'What mountain ranges force the moist air upward?', options: ['The Aravallis and Vindhyas', 'The Western Ghats and Himalayas', 'The Nilgiris only', 'The Satpuras and Ghats'], correctAnswer: 'The Western Ghats and Himalayas' },
      { question: 'Why does winter stay dry in most of India?', options: ['Pressure builds over the ocean instead', 'Dry winds blow outward from India', 'The sun disappears', 'Rain clouds move to Africa'], correctAnswer: 'Dry winds blow outward from India' },
    ],
  },
  {
    id: 'science-how-memory-works',
    category: 'science-explained',
    lengthTier: 'long',
    text: 'Memory is not stored in one single place in the brain like a file in a folder — it is reconstructed each time you recall it, using pieces scattered across different brain regions. When you first learn something, the hippocampus acts like a temporary assembly point, binding together the sights, sounds, and emotions of an experience into a single memory trace. Over the following days and weeks, especially during deep sleep, that memory is gradually transferred to the cortex for longer-term storage, a process scientists call consolidation. This is part of why sleep is so critical for learning: cutting sleep short after studying can prevent a memory from being properly saved at all. Interestingly, every time you recall an old memory, your brain briefly makes it unstable again before re-storing it, a process called reconsolidation. This means memories can subtly change slightly every time you remember them, shaped a little by your current mood, new information, or even how the memory was described to you afterward. This is also why eyewitness testimony, despite feeling completely certain to the person recalling it, is often less reliable than people assume.',
    comprehensionQuestions: [
      { question: 'What role does the hippocampus play in forming memories?', options: ['It deletes old memories', 'It temporarily binds a new experience into a trace', 'It controls breathing', 'It stores memories permanently forever'], correctAnswer: 'It temporarily binds a new experience into a trace' },
      { question: 'What is consolidation?', options: ['Forgetting information quickly', 'Transferring memory to the cortex over time', 'Reading faster', 'A type of eye movement'], correctAnswer: 'Transferring memory to the cortex over time' },
    ],
    retentionQuestions: [
      { question: 'Why is sleep important for memory, according to the passage?', options: ['It has no real effect', 'Consolidation happens especially during deep sleep', 'It only affects short-term memory', 'It prevents dreaming'], correctAnswer: 'Consolidation happens especially during deep sleep' },
      { question: 'What is reconsolidation?', options: ['A memory becoming unstable and re-stored each time it is recalled', 'A permanent, unchangeable memory', 'A brain scan technique', 'The process of falling asleep'], correctAnswer: 'A memory becoming unstable and re-stored each time it is recalled' },
    ],
  },
]

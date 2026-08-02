// Reading Discovery™ Paragraph Dataset — short (70–90 word) paragraphs,
// each with exactly one linked comprehension question.
//
// A new lane, not a duplicate: paragraphLibrary.ts already exists but is a
// completely different shape — 120–260 words per paragraph, authored as an
// array of lines, with 8 mandatory challenge-types each, built for the
// separate, heavier Paragraph Reading™ exercise. Reusing it here would
// visibly overflow Reading Discovery's already-approved, no-scroll
// ParagraphCard layout — a UX regression even with zero component code
// touched. This dataset fills the gap through the platform's existing
// registration mechanism instead.
//
// The question lives in metadata on the SAME record as its paragraph —
// never a separate pool joined by id — so a paragraph and its question can
// never be pooled/mixed independently.
//
// Sprint-2.6B FIX-16 — every record's `correctOptionIndex` (always the
// authored index of the genuinely correct main-idea paraphrase, option 0
// in every record here) is a real, internal-only signal for the new
// Reading Intelligence Model's comprehension/question-accuracy inputs.
// Reading Discovery still never shows right/wrong in the UI — this never
// surfaces as visible feedback, only as one input among several that
// shape the final "Effective Reading Performance" result.
//
// Reading Runtime Engine™ (Sprint-2 Part-2) — expanded from 10 to 30 real,
// hand-authored records (6 per tier) so Paragraph Sprint™'s continuous
// runtime (2-4 real paragraphs per session) and Meaning Sprint™ (which
// reuses these same real questions) can honestly avoid repeats across
// several real sessions, per your own explicit "curated local content
// library for Version-1" direction. Every record now also carries a real
// `origin: 'authored'` field — the seam a future, separate sprint's
// offline/background AI-expansion job writes `'ai-generated-offline'`
// records into, without this dataset's shape or any caller changing.

import { createDataset } from '@/lib/exercise-engine/contentEngine'

export const READING_DISCOVERY_PARAGRAPH_DATASET = createDataset({
  id: 'en-reading-discovery-paragraphs',
  locale: 'en',
  contentType: 'paragraph',
  rawItems: [
    // Beginner
    {
      content:
        'On Saturday morning, Maya opened her window and felt the cool breeze drift into her room. ' +
        'Sunlight spread slowly across the wooden floor, and the smell of fresh coffee rose from the ' +
        'kitchen downstairs. She could hear birds calling from the tall oak tree outside, and somewhere ' +
        'further away, a dog barked twice before going quiet again. Maya smiled, stretched her arms, and ' +
        'decided that today would be a good day to sit outside and read for a while.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What was the main idea?',
        options: ['A calm Saturday morning at home', 'A busy day at work', 'A trip to another city'],
      },
    },
    {
      content:
        'Every afternoon, Leo walked his small dog around the quiet park near his house. The grass ' +
        'was soft and green, and a few children played near the pond, tossing bread to the ducks. Leo ' +
        'liked to sit on a wooden bench and watch the clouds drift slowly across the sky. His dog would ' +
        'rest beside him, tail wagging gently. By the time they walked home, the sky had turned a soft ' +
        'shade of orange, and dinner was already on the stove.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['A relaxing afternoon walk with a dog', 'A trip to the grocery store', 'A soccer game at the park'],
      },
    },
    {
      content:
        'Sam had never baked anything before, but on a rainy Sunday he decided to try making cookies. ' +
        'He read the recipe twice, measured the flour carefully, and mixed everything in a big blue bowl. ' +
        'The kitchen slowly filled with a warm, sweet smell as the cookies baked. When they finally came ' +
        'out of the oven, a little crooked but golden brown, Sam felt proud of what he had made all by ' +
        'himself, and he saved the first one for his mother.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['A first attempt at baking cookies', 'A trip to a bakery', 'A recipe that failed completely'],
      },
    },
    {
      content:
        'The old library on Maple Street had tall wooden shelves that seemed to reach the ceiling. Every ' +
        'Saturday, Priya would climb the small step stool to reach the books on the top shelf, where the ' +
        'oldest stories were kept. Dust floated gently in the light from the tall windows, and the room ' +
        'always smelled like paper and quiet afternoons. Priya never minded spending hours there, ' +
        'losing track of time between the pages of a good story.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['A love of spending time in a library', 'Building new library shelves', 'A library that recently closed'],
      },
    },
    {
      content:
        'On the first cold morning of autumn, Ben pulled his warmest sweater from the closet and made a ' +
        'cup of hot tea before school. Outside, the leaves had turned bright orange and red, covering the ' +
        'sidewalk in a crunchy carpet. Ben liked kicking through the piles on his walk, listening to the ' +
        'leaves crackle under his shoes. By the time he reached the school gate, his cheeks were pink from ' +
        'the cold, and he was smiling.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Enjoying a cold autumn morning', 'A snowstorm during winter', 'Getting ready for a summer trip'],
      },
    },
    {
      content:
        'Nina loved visiting her grandfather on weekends because he always had a new story to tell. ' +
        'They would sit together on the porch, and he would describe places he had traveled long ago, ' +
        'from busy cities to quiet mountain villages. Nina listened closely, imagining each place as he ' +
        'spoke. Sometimes she asked questions, and he always answered with a smile, happy that she wanted ' +
        'to know more about the world he remembered.',
      difficulty: 'beginner',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ["Listening to a grandfather's travel stories", 'Planning a family vacation', 'Learning to read a map'],
      },
    },

    // Easy
    {
      content:
        'Reading a little every day can quietly change the way your mind works. At first, the habit ' +
        'feels small, almost unnoticeable, but over weeks it starts to shape how easily you understand ' +
        'new ideas. People who read regularly often find that their attention holds steady for longer ' +
        'periods, and unfamiliar words become easier to recognize. It is not about reading quickly or ' +
        'reading a lot at once. It is simply about returning to the page, a little at a time, again and again.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How daily reading gradually builds understanding', 'How to read as fast as possible', 'Why libraries are important for communities'],
      },
    },
    {
      content:
        'Before Elena learned to cook, she thought recipes were only for people with special talent. ' +
        'Her grandmother showed her otherwise, guiding her through one simple dish at a time. They started ' +
        'with scrambled eggs, then moved to soup, then finally a full dinner with rice and vegetables. ' +
        'Elena discovered that cooking was less about talent and more about patience and repetition. Each ' +
        'attempt taught her something new, and mistakes became lessons rather than failures worth worrying about.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Learning to cook through patient practice', "A grandmother's favorite recipes", 'The history of home cooking'],
      },
    },
    {
      content:
        'Learning to play an instrument rarely feels rewarding in the first few weeks. The fingers feel ' +
        'clumsy, the notes sound uneven, and progress seems painfully slow. Most beginners quit during this ' +
        'stage, discouraged by how far they seem from playing anything recognizable. Yet those who continue ' +
        'often describe a turning point, a moment when the instrument suddenly starts to feel familiar, as ' +
        'though the difficult early weeks had quietly been building toward it all along.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Pushing through a difficult early stage of learning', 'Choosing the right instrument to learn', 'Why music lessons are expensive'],
      },
    },
    {
      content:
        'Maria used to dread cleaning her apartment, always putting it off until the mess felt ' +
        'overwhelming. She began trying a new approach: spending just ten minutes tidying each evening, ' +
        'rather than waiting for one big weekend cleanup. At first the change felt too small to matter, but ' +
        'after a month her apartment stayed noticeably tidier, and cleaning no longer felt like a chore she ' +
        'needed to avoid.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Small daily habits replacing a dreaded chore', 'A guide to deep cleaning an apartment', 'Why Maria moved to a new home'],
      },
    },
    {
      content:
        'When Jordan started running, he could barely finish a single mile without stopping to catch his ' +
        'breath. Instead of giving up, he set a small goal: run just a little farther each week, even if it ' +
        'was only a few extra steps. Slowly, his stamina improved, and what once felt impossible became ' +
        'routine. Six months later, Jordan finished his first five-mile run, surprised at how far small, ' +
        'steady progress had carried him.',
      difficulty: 'easy',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Building stamina through small, steady progress', 'Training for a professional marathon', 'An injury that ended a running habit'],
      },
    },
    {
      content:
        'Diego noticed that he understood books much better when he paused occasionally to think about ' +
        'what he had just read. Instead of rushing to the next page, he would ask himself simple questions: ' +
        'What just happened? Why did that character make that choice? These small pauses slowed his reading ' +
        'down slightly, but they made the story feel far more vivid and memorable than reading straight ' +
        'through ever had.',
      difficulty: 'easy',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Pausing while reading to improve understanding', 'Reading as quickly as possible', 'Choosing books based on their length'],
      },
    },

    // Medium
    {
      content:
        'Memory does not work like a filing cabinet, storing information in neat, permanent folders. ' +
        'Instead, each time a memory is recalled, the brain reconstructs it, blending old details with ' +
        'present context. This is why two people can remember the same event quite differently, each ' +
        'shaped by what they noticed or felt at the time. Researchers have found that memories can even ' +
        'shift slightly each time they are retrieved, strengthening some details while letting others fade.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How memory reconstructs itself each time it is recalled', 'Why some people have better memories than others', 'How to improve memory through diet'],
      },
    },
    {
      content:
        'Attention is a limited resource, and the brain is constantly deciding what deserves it. In a ' +
        'world filled with notifications and passing thoughts, focusing on a single task requires ' +
        'deliberate effort rather than simple willpower. Psychologists suggest that attention functions ' +
        'more like a muscle than a fixed trait, meaning it can be trained through consistent practice. ' +
        'Short, focused sessions tend to build this ability more effectively than long, unfocused stretches.',
      difficulty: 'medium',
      categories: ['reading', 'focus'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How attention can be trained like a muscle', 'The dangers of using smartphones', 'Why multitasking improves productivity'],
      },
    },
    {
      content:
        'When people learn a new skill, they often overestimate how much they will remember without ' +
        'practice and underestimate how much repetition it actually takes. This mismatch, sometimes called ' +
        'the illusion of competence, explains why a concept can feel clear during a single study session ' +
        "yet vanish entirely a week later. Genuine retention tends to come not from feeling confident in " +
        "the moment, but from being tested on the material again after enough time has passed to make it feel challenging.",
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why feeling confident while studying can be misleading', 'The best age to start learning new skills', 'Why some subjects are harder than others'],
      },
    },
    {
      content:
        'A story becomes easier to follow once a reader identifies its underlying structure: who wants ' +
        'something, what stands in their way, and how they respond to that obstacle. Even complex, ' +
        'nonlinear stories tend to hide this simple shape somewhere beneath the surface. Readers who ' +
        'instinctively search for this structure, often without realizing they are doing it, tend to ' +
        'follow unfamiliar or difficult narratives with far less effort than those who read purely for ' +
        'individual sentences.',
      difficulty: 'medium',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How recognizing story structure aids comprehension', 'Why nonlinear stories should be avoided', 'The history of storytelling'],
      },
    },
    {
      content:
        'Working in short, focused bursts followed by brief breaks tends to outperform long, unbroken ' +
        'stretches of effort for most cognitive tasks. This is partly because sustained concentration draws ' +
        'on a limited mental resource that gradually depletes, similar to physical fatigue. A short pause, ' +
        'even just a few minutes, appears to allow that resource to partially recover, which is why many ' +
        'people find their best ideas arrive shortly after stepping away from a problem rather than while ' +
        'staring directly at it.',
      difficulty: 'medium',
      categories: ['focus'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why short breaks can improve focused work', 'Why multitasking increases productivity', 'The ideal length of a workday'],
      },
    },
    {
      content:
        'People often assume that highlighting or underlining text while reading helps them remember it ' +
        'better, but research suggests this feeling of engagement can be misleading. Passive marking of a ' +
        'page requires very little real mental effort, and the resulting sense of familiarity can be ' +
        'mistaken for true understanding. More effective strategies tend to involve actively summarizing a ' +
        'passage in one\'s own words or explaining it aloud, both of which force the brain to genuinely ' +
        'process the material rather than simply recognize it.',
      difficulty: 'medium',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why highlighting text is a weaker study strategy than active recall', 'Why highlighting should be done in multiple colors', 'How to choose the right textbook'],
      },
    },

    // Advanced
    {
      content:
        'The relationship between sleep and learning is more intricate than simple rest allows for. ' +
        "During certain stages of sleep, the brain actively replays and reorganizes the day's experiences, " +
        'strengthening the neural connections tied to newly acquired skills and information. This process, ' +
        'often described as consolidation, helps explain why a difficult problem sometimes feels more ' +
        "manageable after a full night's sleep. Interrupting this cycle, even briefly, can measurably " +
        'reduce how much the brain is able to retain.',
      difficulty: 'advanced',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How sleep helps consolidate learning and memory', 'The ideal number of hours to sleep', 'Common causes of insomnia'],
      },
    },
    {
      content:
        'Expertise is often mistaken for raw talent, yet research into skill acquisition tells a more ' +
        'nuanced story. Across fields as different as chess, music, and surgery, deep expertise tends to ' +
        'emerge from thousands of hours of deliberate, feedback-driven practice rather than innate ability ' +
        'alone. What distinguishes effective practice from mere repetition is its structure: specific goals, ' +
        "immediate feedback, and a willingness to work at the edge of one's current ability, rather than " +
        'comfortably within it.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How deliberate practice builds expertise over time', 'Why some people are born talented', 'The best age to start learning a skill'],
      },
    },
    {
      content:
        'Reading comprehension is sometimes described as an act of prediction as much as perception. ' +
        'Skilled readers continuously generate expectations about what a sentence or paragraph will say ' +
        'next, drawing on grammar, prior knowledge, and context, then quickly adjust when those predictions ' +
        'turn out to be wrong. This constant cycle of anticipating and revising happens so quickly that it ' +
        'remains largely invisible to the reader, yet it is one of the clearest differences between fluent ' +
        'and struggling readers.',
      difficulty: 'advanced',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How fluent reading relies on constant prediction and revision', 'Why grammar rules should be memorized', 'How vocabulary size determines reading skill'],
      },
    },
    {
      content:
        'Emotional state exerts a surprisingly strong influence over what the brain chooses to encode ' +
        'into long-term memory. Events tied to a strong feeling, whether excitement, fear, or surprise, tend ' +
        'to be remembered in far more vivid detail than emotionally neutral ones, even years later. This is ' +
        'thought to be an evolutionary shortcut: emotionally significant information was, throughout human ' +
        'history, disproportionately likely to matter for survival, so the brain prioritized holding on to it.',
      difficulty: 'advanced',
      categories: ['memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why emotional events are remembered more vividly', 'How to suppress unwanted memories', 'Why memory declines with age'],
      },
    },
    {
      content:
        'Deep focus is often disrupted not by a single major distraction but by the residue left behind ' +
        'after switching away from a task, even briefly. Cognitive scientists refer to this as attention ' +
        'residue: part of the mind remains occupied with the previous task for some time after switching, ' +
        'quietly reducing performance on whatever comes next. This helps explain why frequent, brief check-ins ' +
        'on email or messages can feel harmless in the moment yet meaningfully slow down the work that follows.',
      difficulty: 'advanced',
      categories: ['focus'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How switching tasks leaves lingering attention residue', 'Why email should be checked more often', 'How to eliminate all distractions at work'],
      },
    },
    {
      content:
        'Fluent readers process most familiar words so automatically that the act of decoding letters ' +
        'into sounds barely registers as conscious effort. This automaticity frees up mental resources that ' +
        'can instead be devoted to interpreting meaning, tracking a narrative, or evaluating an argument. ' +
        'Struggling readers, by contrast, often spend so much conscious effort simply recognizing words that ' +
        'little cognitive capacity remains for genuine comprehension, even when their vocabulary is otherwise adequate.',
      difficulty: 'advanced',
      categories: ['reading', 'focus'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How automatic word recognition frees capacity for comprehension', 'Why vocabulary size is the only factor in reading skill', 'How to teach children the alphabet'],
      },
    },

    // Expert
    {
      content:
        "Metacognition, broadly defined as thinking about one's own thinking, plays a disproportionately " +
        'large role in effective learning compared to raw intelligence alone. Learners who regularly ' +
        'monitor their own understanding, recognizing when a concept remains unclear rather than assuming ' +
        'comprehension, tend to allocate their study time far more efficiently. This self-awareness ' +
        'transforms learning from a passive absorption of information into an active, iterative process, ' +
        'one in which small gaps are identified and addressed before they compound into larger confusion.',
      difficulty: 'expert',
      categories: ['reading'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How metacognition improves the efficiency of learning', 'The measurement of human intelligence', 'Techniques for memorizing large amounts of text'],
      },
    },
    {
      content:
        'The spacing effect, one of the most robust findings in cognitive psychology, demonstrates that ' +
        'information reviewed at increasing intervals over time is retained far more durably than ' +
        'information crammed within a single session. Counterintuitively, the very forgetting that occurs ' +
        'between spaced reviews appears to strengthen eventual retention, since retrieving a fading memory ' +
        'requires more effortful reconstruction, which in turn deepens the underlying trace. Despite decades ' +
        'of supporting evidence, most classrooms still favor last-minute, massed study over this approach.',
      difficulty: 'expert',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How spaced review strengthens long-term memory', 'The best study environment for students', 'Why exams should be eliminated'],
      },
    },
    {
      content:
        'Dual-coding theory proposes that information encoded through both verbal and visual channels ' +
        'simultaneously is retained more robustly than information encoded through either channel alone, ' +
        'since the brain builds two partially independent, mutually reinforcing representations rather than ' +
        'a single fragile one. This principle helps explain why a diagram paired with an explanatory caption ' +
        'often outperforms either a diagram or a paragraph of text presented in isolation, even when both ' +
        'convey identical information.',
      difficulty: 'expert',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why combining visual and verbal information strengthens memory', 'Why diagrams are always superior to text', 'How images are processed differently from words'],
      },
    },
    {
      content:
        'The generation effect refers to the finding that information a learner actively produces, such as ' +
        'completing a partial word or answering a question before seeing the solution, tends to be retained ' +
        'more durably than information passively received in complete form. This appears to hold even when ' +
        'the initial, self-generated attempt is incorrect, suggesting that the act of effortful retrieval ' +
        'itself, rather than the accuracy of the guess, is what strengthens the underlying memory trace.',
      difficulty: 'expert',
      categories: ['memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why actively generating information strengthens memory more than receiving it', 'Why guessing incorrectly should always be avoided', 'How memory differs between children and adults'],
      },
    },
    {
      content:
        'Executive function, an umbrella term covering working memory, inhibitory control, and cognitive ' +
        'flexibility, underlies much of what is colloquially called "focus." Rather than a single unified ' +
        'faculty, sustained attention depends on the coordinated interaction of these distinct subsystems, ' +
        'which is part of why interventions aimed at improving focus in one narrow way, such as removing ' +
        'visual distractions, often produce only modest gains: the deeper limiting factor frequently lies ' +
        'elsewhere in this coordinated system.',
      difficulty: 'expert',
      categories: ['focus'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['How focus depends on several coordinated cognitive subsystems', 'Why removing distractions always solves focus problems', 'The definition of working memory alone'],
      },
    },
    {
      content:
        'Transfer of learning, the degree to which a skill acquired in one context generalizes to a novel ' +
        'one, remains one of the most persistently difficult outcomes to achieve in education. Near transfer, ' +
        'applying a skill to a highly similar new situation, occurs relatively readily, but far transfer, ' +
        'applying an underlying principle to a superficially unrelated domain, is rare without deliberate, ' +
        'structured practice explicitly designed to highlight the abstract principle beneath the original, ' +
        'concrete example.',
      difficulty: 'expert',
      categories: ['reading', 'memory'],
      metadata: {
        origin: 'authored', correctOptionIndex: 0,
        question: 'What is the paragraph mainly about?',
        options: ['Why applying learned skills to new situations is difficult without deliberate practice', 'Why all learning transfers automatically', 'The difference between near and far vision'],
      },
    },
  ],
})

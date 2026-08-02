// Comprehension Intelligence Engine™ — real, hand-authored questions
// against every passage in passageLibrary.ts (never modified — this file
// only reads its `PassageCategory`/difficulty types). Each of the 24
// passages gets exactly 5 questions: Main Idea, Key Detail, Vocabulary,
// and Inference always appear; the 5th rotates between Sequence and
// Cause-and-Effect, whichever genuinely fits that passage's content.
// Response formats (true-false, multi-select, ordering) are distributed
// across the corpus rather than forced onto every passage.

import type { ComprehensionQuestionSet } from './comprehensionTypes'

const QUESTION_SETS: readonly ComprehensionQuestionSet[] = [
  // ── Science ──────────────────────────────────────────────────────────
  {
    passageId: 'science-easy-1',
    questions: [
      {
        id: 'science-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How sunlight and raindrops together create the colors of a rainbow', 'Why storms are dangerous', 'How to photograph a rainbow', 'The history of rainbow mythology'],
        correctIndex: 0,
        explanation: "The passage explains step by step how sunlight bends and splits inside raindrops to create a rainbow's colors.",
      },
      {
        id: 'science-easy-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: The colors of a rainbow always appear in the same order.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'The passage states red, orange, yellow, green, blue, and violet "always appear in that order."',
      },
      {
        id: 'science-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why can you only see a rainbow when the sun is behind you?',
        options: ['Because the rain must be falling somewhere in front of you for the bent light to reach your eyes', 'Because rainbows only form at night', 'Because clouds block sunlight from the front', 'Because rainbows need lightning to form'],
        correctIndex: 0,
        explanation: 'The passage says you must have the sun behind you and rain in front of you — that geometry is what lets bent light reach your eyes.',
      },
      {
        id: 'science-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "In the passage, what does the word 'droplet' mean?",
        options: ['A tiny drop of water', 'A type of cloud', 'A beam of sunlight', 'A color of the rainbow'],
        correctIndex: 0,
        explanation: 'The passage uses "droplet" to describe a small drop of rain that bends and splits the light.',
      },
      {
        id: 'science-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably conclude about two people standing far apart during the same rainbow?',
        options: ['They are each seeing a slightly different rainbow made from different raindrops', 'They are seeing an identical rainbow', 'Only one of them can actually see the rainbow', 'The rainbow will disappear for one of them'],
        correctIndex: 0,
        explanation: 'The passage says no two people ever see the exact same rainbow at once, which follows from each person’s own angle to the sun and raindrops.',
      },
    ],
  },
  {
    passageId: 'science-medium-1',
    questions: [
      {
        id: 'science-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ["How water continuously moves between the Earth's surface and atmosphere", 'How to conserve water at home', 'Why oceans are salty', 'How rivers are formed'],
        correctIndex: 0,
        explanation: 'The passage describes the water cycle: evaporation, condensation, precipitation, and return to the ocean, repeating endlessly.',
      },
      {
        id: 'science-medium-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what happens to water vapor as it rises into the atmosphere?',
        options: ['It cools and condenses into droplets that form clouds', 'It immediately turns into rain', 'It disappears completely', 'It turns into ice caps'],
        correctIndex: 0,
        explanation: 'The passage states rising vapor "begins to cool," then "condenses into tiny droplets that form clouds."',
      },
      {
        id: 'science-medium-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these steps of the water cycle in the order they happen.',
        options: ['Water evaporates from oceans and lakes', 'Water vapor cools and condenses into clouds', 'Water falls back to Earth as rain or snow', 'Water flows into rivers and returns to the ocean'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes evaporation, then condensation into clouds, then precipitation, then water flowing back to the ocean, in that order.',
      },
      {
        id: 'science-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'evaporate' mean as used in the passage?",
        options: ['To turn from liquid into vapor due to heat', 'To freeze solid', 'To flow downhill', 'To become polluted'],
        correctIndex: 0,
        explanation: 'The passage says "heat from the sun causes water...to evaporate," meaning it turns into vapor.',
      },
      {
        id: 'science-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: "What can you reasonably infer from the passage's statement that the water cycle 'repeats endlessly, with no water ever truly lost'?",
        options: ['The same water on Earth is continually reused, not created or destroyed', 'New water is constantly created by the sun', 'Water eventually runs out despite the cycle', 'Only ocean water is part of the cycle'],
        correctIndex: 0,
        explanation: 'If the cycle repeats endlessly with no water lost, existing water is simply reused, not generated fresh or destroyed.',
      },
    ],
  },
  {
    passageId: 'science-hard-1',
    questions: [
      {
        id: 'science-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How vaccines teach the immune system to recognize and fight a specific pathogen', 'How viruses mutate over time', 'How antibiotics work', 'How to manufacture vaccines in a factory'],
        correctIndex: 0,
        explanation: 'The passage explains that vaccines expose the immune system to a harmless piece of a pathogen so it can learn to recognize the real thing.',
      },
      {
        id: 'science-hard-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: A vaccine can cause the actual disease it protects against.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage explicitly says the piece inside a vaccine "cannot cause the actual disease."',
      },
      {
        id: 'science-hard-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why does the immune system respond faster the second time it encounters the real pathogen after vaccination?',
        options: ['Because memory cells created by the vaccine can recognize the pathogen and react quickly', 'Because the vaccine weakens the pathogen permanently', 'Because antibiotics remain in the bloodstream', 'Because the body becomes immune to all diseases at once'],
        correctIndex: 0,
        explanation: 'The passage states memory cells "remain long after the vaccine is given" and can recognize the real pathogen, causing a faster response.',
      },
      {
        id: 'science-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "In this passage, what does 'pathogen' most likely mean?",
        options: ['A disease-causing organism such as a virus or bacterium', 'A type of antibody', 'A vaccine ingredient that is always safe', 'A symptom of illness'],
        correctIndex: 0,
        explanation: 'The passage uses "pathogen" to refer to the virus or bacterium the vaccine trains the immune system to recognize.',
      },
      {
        id: 'science-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ["A vaccinated person's immune system can react to a real infection before symptoms develop", 'Memory cells are created only during the illness itself, never from a vaccine', 'The weakened piece in a vaccine still resembles the real pathogen enough for the immune system to learn from it', 'Vaccines guarantee a person will never get sick again from anything'],
        correctIndices: [0, 2],
        explanation: 'The passage says memory cells let the immune system often stop infection "before symptoms ever develop," and the vaccine piece "still resembles the real pathogen" — but it does not claim memory cells only form during illness, nor that vaccines guarantee total future immunity.',
      },
    ],
  },

  // ── History ──────────────────────────────────────────────────────────
  {
    passageId: 'history-easy-1',
    questions: [
      {
        id: 'history-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['The purpose and history of the Great Wall of China', 'The daily life of ancient Chinese farmers', 'The invention of fireworks', 'Modern Chinese architecture'],
        correctIndex: 0,
        explanation: 'The passage describes why and how the Great Wall was built and how it is used today.',
      },
      {
        id: 'history-easy-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what was the Great Wall mainly built to do?',
        options: ['Protect against invasions from the north', 'Serve as a trade route', 'Mark the border for tax collection', "Provide housing for soldiers' families"],
        correctIndex: 0,
        explanation: 'The passage states the wall "was built mainly to protect against invasions from the north."',
      },
      {
        id: 'history-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why could signal fires along the wall warn distant cities within hours?',
        options: ['Because a chain of fires could relay a warning quickly across long distances', 'Because messengers on horseback carried the fires', 'Because the fires were visible from space', 'Because cities were connected by tunnels'],
        correctIndex: 0,
        explanation: 'The passage says "signal fires along the wall could warn distant cities within hours," implying a fast relay system along the wall.',
      },
      {
        id: 'history-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does the word 'invasions' mean in this passage?",
        options: ['Attacks by outside forces entering a territory', 'Peaceful trade agreements', 'Natural disasters', 'Religious ceremonies'],
        correctIndex: 0,
        explanation: 'The passage describes the wall protecting against "invasions from the north," meaning attacks by outside forces.',
      },
      {
        id: 'history-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'What can you reasonably infer about why the wall was built over many centuries rather than all at once?',
        options: ['Different dynasties added to and maintained it over a long span of time', 'It was built entirely in a single decade', 'It was abandoned and rebuilt from scratch each century', 'No construction took place until modern times'],
        correctIndex: 0,
        explanation: 'The passage says it "was constructed over many centuries by different Chinese dynasties," implying ongoing, extended construction.',
      },
    ],
  },
  {
    passageId: 'history-medium-1',
    questions: [
      {
        id: 'history-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How the invention of the printing press changed access to books and ideas', 'The biography of Johannes Gutenberg', 'How paper is manufactured', 'Modern digital publishing'],
        correctIndex: 0,
        explanation: 'The passage explains how the printing press made books cheaper and helped ideas and literacy spread.',
      },
      {
        id: 'history-medium-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: Before the printing press, books were mainly available only to wealthy people.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'The passage says hand-copied books "made books extremely expensive and available only to the wealthy few."',
      },
      {
        id: 'history-medium-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why did literacy rates across Europe begin to rise after the printing press was invented?',
        options: ['Books became cheaper to produce and easier to distribute, making them more common', 'Schools were built for the first time', 'Governments required citizens to read', 'The printing press eliminated the need for teachers'],
        correctIndex: 0,
        explanation: 'The passage links cheaper, more available books to rising literacy as "books grew more common."',
      },
      {
        id: 'history-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "In this passage, what does 'movable type' most likely refer to?",
        options: ['Individual, reusable letter pieces that can be rearranged to print different pages', 'A type of paper used only in Germany', 'A method of hand-copying manuscripts', 'A tool used to bind books together'],
        correctIndex: 0,
        explanation: 'The passage says Gutenberg’s press used "movable metal type" that let "identical pages...be printed quickly and repeatedly," implying reusable, rearrangeable letter pieces.',
      },
      {
        id: 'history-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about the spread of new ideas after the printing press was invented?',
        options: ['Ideas could travel between cities faster than they could before', 'Ideas stopped spreading between regions', 'Only religious texts could be printed', 'Ideas spread only within Germany'],
        correctIndex: 0,
        explanation: 'The passage states "new ideas could now spread between cities faster than ever before" as a direct result of the printing press.',
      },
    ],
  },
  {
    passageId: 'history-hard-1',
    questions: [
      {
        id: 'history-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['The combination of factors that led to the decline and fall of the Western Roman Empire', 'The founding of the city of Rome', 'The daily life of Roman soldiers', 'The construction of Roman roads'],
        correctIndex: 0,
        explanation: 'The passage describes the split of the empire, the pressures the Western half faced, and its eventual fall.',
      },
      {
        id: 'history-hard-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what happened in 476 CE?',
        options: ['A Germanic leader removed the last Western Roman emperor from power', 'Rome was founded', 'The empire reached its largest size', 'The Eastern Empire collapsed'],
        correctIndex: 0,
        explanation: 'The passage states, "In 476 CE, a Germanic leader removed the last Western Roman emperor from power."',
      },
      {
        id: 'history-hard-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these events in the order described in the passage.',
        options: ['The empire is split into Western and Eastern halves', 'The Western Empire faces pressure from migrating tribes and economic troubles', 'A Germanic leader removes the last Western Roman emperor', 'The Eastern half survives for another thousand years as the Byzantine Empire'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes the split first, then the pressures that weakened the Western half, then its fall in 476 CE, then the Eastern Empire’s long survival afterward.',
      },
      {
        id: 'history-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'administration' mean as used in the phrase 'split...for easier administration'?",
        options: ['The act of managing and governing', 'A military attack', 'A form of currency', 'A religious ceremony'],
        correctIndex: 0,
        explanation: 'The passage uses "administration" to mean governing the empire, which splitting made easier.',
      },
      {
        id: 'history-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['The fall of the Western Empire resulted from multiple combined pressures, not one single cause', 'The Eastern Empire fell at the same time as the Western Empire', "Historians agree on exactly one cause of Rome's decline", 'Governing an empire that large from a single center created real challenges'],
        correctIndices: [0, 3],
        explanation: 'The passage lists several contributing factors and says the empire "had grown too large to govern from one center" — but historians still debate which factor mattered most, and the Eastern half survived long after the Western half fell.',
      },
    ],
  },

  // ── Psychology ───────────────────────────────────────────────────────
  {
    passageId: 'psychology-easy-1',
    questions: [
      {
        id: 'psychology-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['Why forgetting is a normal part of memory and how memories become long-lasting', 'How to diagnose memory disorders', 'The anatomy of the brain', 'Why sleep is required for survival'],
        correctIndex: 0,
        explanation: 'The passage explains that forgetting is normal and describes what helps information move into long-term memory.',
      },
      {
        id: 'psychology-easy-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, sleep plays a role in making memories more permanent.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'The passage states, "Sleep also plays an important role in helping memories become more permanent."',
      },
      {
        id: 'psychology-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why does cramming for a test often lead to fast forgetting, according to the passage?',
        options: ['Because information that is never reviewed again tends to fade quickly, and cramming skips spaced review', 'Because cramming causes physical exhaustion', 'Because tests are designed to be forgotten', 'Because the brain rejects information learned quickly'],
        correctIndex: 0,
        explanation: 'The passage links cramming directly to fast forgetting, following the point that unreviewed information "tends to fade relatively quickly."',
      },
      {
        id: 'psychology-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'fade' mean as used in this passage?",
        options: ['To gradually weaken or disappear', 'To suddenly increase in strength', 'To become permanently stored', 'To repeat automatically'],
        correctIndex: 0,
        explanation: 'The passage says unreviewed information "tends to fade relatively quickly," meaning it gradually weakens or is lost.',
      },
      {
        id: 'psychology-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what is the most reasonable strategy for remembering information long-term?',
        options: ['Reviewing the information repeatedly over several days', 'Reading it once very carefully', 'Studying only the night before a test', 'Avoiding sleep to study longer'],
        correctIndex: 0,
        explanation: 'The passage states, "Repeating information over several days helps it move into long-term memory."',
      },
    ],
  },
  {
    passageId: 'psychology-medium-1',
    questions: [
      {
        id: 'psychology-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['The three-part loop that makes up most habits, and how to change them', 'The history of psychology as a science', 'Why people have different personalities', 'How memory works'],
        correctIndex: 0,
        explanation: 'The passage describes the cue-routine-reward habit loop and how to change a habit.',
      },
      {
        id: 'psychology-medium-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what are the three parts of a habit loop, in order?',
        options: ['Cue, routine, reward', 'Reward, cue, routine', 'Routine, reward, cue', 'Cue, reward, routine'],
        correctIndex: 0,
        explanation: 'The passage states, "The loop begins with a cue...next comes the routine...finally, a reward reinforces the behavior."',
      },
      {
        id: 'psychology-medium-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these parts of the habit loop in the order the passage describes them.',
        options: ['A cue triggers the brain to act', 'The routine, the actual behavior, occurs', 'A reward reinforces the behavior', 'The loop becomes automatic over time'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes the cue first, then the routine, then the reward, and finally notes the loop becomes automatic over time.',
      },
      {
        id: 'psychology-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'reinforces' mean as used in 'a reward reinforces the behavior'?",
        options: ['Strengthens or makes more likely to repeat', 'Weakens or discourages', 'Completely erases', 'Delays temporarily'],
        correctIndex: 0,
        explanation: 'The passage explains the reward makes the behavior "more likely to repeat," which is what "reinforces" means here.',
      },
      {
        id: 'psychology-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'According to the passage, what is the most effective way to change an existing habit?',
        options: ['Keep the same cue and reward, and change only the routine in the middle', 'Remove the cue entirely', 'Eliminate the reward and keep everything else the same', 'Rely purely on willpower to resist the cue'],
        correctIndex: 0,
        explanation: 'The passage states, "Changing a habit often works best by keeping the same cue and reward. Only the routine in the middle needs to change."',
      },
    ],
  },
  {
    passageId: 'psychology-hard-1',
    questions: [
      {
        id: 'psychology-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How cognitive biases form as mental shortcuts and can distort decision-making', 'How to conduct a scientific experiment', 'The history of psychology as a field', 'How memory storage works in the brain'],
        correctIndex: 0,
        explanation: 'The passage explains what cognitive biases are, gives examples, and discusses how they affect decisions.',
      },
      {
        id: 'psychology-hard-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, simply recognizing a bias automatically eliminates its influence on a decision.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage explicitly states, "Recognizing a bias does not automatically eliminate its influence on a decision."',
      },
      {
        id: 'psychology-hard-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'Why does confirmation bias cause someone to ignore contradicting evidence, according to the passage?',
        options: ['Because it leads people to favor information that supports beliefs they already hold', 'Because people are naturally dishonest', 'Because contradicting evidence is usually false', 'Because the brain cannot process new information'],
        correctIndex: 0,
        explanation: 'The passage says confirmation bias "leads people to favor information that supports existing beliefs," causing them to ignore what contradicts it.',
      },
      {
        id: 'psychology-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'anchoring' most likely mean in this passage?",
        options: ['Letting an initial piece of information disproportionately influence later judgments', 'Refusing to make any decision', 'Verifying information through research', 'Forgetting a previous decision entirely'],
        correctIndex: 0,
        explanation: 'The passage defines anchoring bias directly: "an initial piece of information influences all later judgments."',
      },
      {
        id: 'psychology-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['Cognitive biases can still affect experts who are aware they exist', 'Structured decision-making can reduce bias but not guarantee its complete removal', 'Cognitive biases only appear in negotiations', 'Biases evolved because they were sometimes useful for making fast decisions'],
        correctIndices: [0, 1, 3],
        explanation: 'The passage says recognizing a bias doesn’t remove its influence, that structured processes "rarely fully remove" bias, and that biases evolved because "quick decisions were often more useful" — but negotiation is only given as one example, not a limit on where biases occur.',
      },
    ],
  },

  // ── Biography ────────────────────────────────────────────────────────
  {
    passageId: 'biography-easy-1',
    questions: [
      {
        id: 'biography-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ["Marie Curie's scientific discoveries and historic achievements", 'The geography of Poland', 'The invention of the telescope', 'The history of the Nobel Prize organization'],
        correctIndex: 0,
        explanation: "The passage describes Curie's research on radioactivity and her historic Nobel Prize achievements.",
      },
      {
        id: 'biography-easy-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what did Marie Curie name one of the elements she discovered, and why?',
        options: ['Polonium, after her home country', 'Curium, after herself', 'Francium, after France', 'Radium, after radioactivity'],
        correctIndex: 0,
        explanation: 'The passage states, "She named one of these elements polonium, after her home country."',
      },
      {
        id: 'biography-easy-1-q3', type: 'sequence', format: 'ordering',
        prompt: "Arrange these events from Marie Curie's life in the order described in the passage.",
        options: ['She is born in Poland', 'She moves to France to continue her studies', 'She discovers two new radioactive elements with her husband', 'She becomes the first person to win a Nobel Prize in two different sciences'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes her birth in Poland, her move to France, her discoveries, and finally her historic second Nobel Prize, in that order.',
      },
      {
        id: 'biography-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'radioactivity' refer to in this passage?",
        options: ['A property of certain elements related to the energy they emit', 'A type of scientific award', 'A French research institution', 'A method of chemical naming'],
        correctIndex: 0,
        explanation: 'The passage introduces Curie as known for "her groundbreaking research on radioactivity."',
      },
      {
        id: 'biography-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: "What can you reasonably infer about Marie Curie's significance based on the passage?",
        options: ['She achieved recognition in science that was extremely rare for anyone at the time', 'She is remembered mainly for her work in literature', 'Her work had no lasting impact', 'She worked entirely alone with no collaborators'],
        correctIndex: 0,
        explanation: 'The passage notes she was "the first woman ever to win a Nobel Prize" and "the first person to win the prize in two different sciences," both historically rare.',
      },
    ],
  },
  {
    passageId: 'biography-medium-1',
    questions: [
      {
        id: 'biography-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How the Wright brothers achieved the first successful powered flight', 'The history of bicycle manufacturing', 'Modern commercial airline travel', "The physics of birds' wings"],
        correctIndex: 0,
        explanation: 'The passage describes how the Wright brothers studied flight and achieved the first powered flight in 1903.',
      },
      {
        id: 'biography-medium-1-q2', type: 'key-detail', format: 'true-false',
        prompt: "True or False: According to the passage, the Wright brothers' first powered flight lasted several hours.",
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states the flight "lasted only twelve seconds."',
      },
      {
        id: 'biography-medium-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these events in the order the passage describes them.',
        options: ['The Wright brothers run a bicycle shop in Ohio', 'They study birds and test glider designs', 'They focus on solving the problem of control in flight', 'They successfully fly a powered aircraft in December 1903'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage moves from their bicycle shop, to studying birds and gliders, to solving control, to the historic 1903 flight.',
      },
      {
        id: 'biography-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'control' most likely mean in the phrase 'the problem of control'?",
        options: ['The ability to steer and balance an aircraft during flight', 'The ownership of a company', 'A legal restriction on flying', 'The speed of an aircraft'],
        correctIndex: 0,
        explanation: 'The passage explains gliders "let a pilot adjust the wings to stay balanced," clarifying that "control" refers to steering and balance.',
      },
      {
        id: 'biography-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, why were the Wright brothers different from earlier inventors who attempted flight?',
        options: ['They focused heavily on solving control, rather than just building an engine or wings', 'They were the first to attempt any form of flight', 'They used designs identical to previous inventors', 'They avoided studying birds entirely'],
        correctIndex: 0,
        explanation: 'The passage states, "Unlike earlier inventors, they focused heavily on solving the problem of control."',
      },
    ],
  },
  {
    passageId: 'biography-hard-1',
    questions: [
      {
        id: 'biography-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ["Nelson Mandela's long fight against segregation and his path to becoming president", 'The geography of South Africa', 'The founding of the African National Congress', "South Africa's economy in the 1990s"],
        correctIndex: 0,
        explanation: "The passage traces Mandela's activism, imprisonment, release, and eventual presidency.",
      },
      {
        id: 'biography-hard-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, how long was Mandela imprisoned?',
        options: ['Twenty-seven years', 'Four years', 'Ten years', 'One year'],
        correctIndex: 0,
        explanation: 'The passage states, "He spent twenty-seven years imprisoned, much of it on the isolated Robben Island."',
      },
      {
        id: 'biography-hard-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these events in the order described in the passage.',
        options: ['Mandela joins the African National Congress as a young lawyer', 'Mandela is arrested and sentenced to life in prison', 'Mandela is released from prison to global celebration', "Mandela is elected as South Africa's first Black president"],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes his early activism, then his arrest, then his 1990 release, then his election four years later.',
      },
      {
        id: 'biography-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'reconciliation' mean as used in 'his leadership emphasized reconciliation over revenge'?",
        options: ['The restoring of friendly relations after conflict', 'A legal punishment', 'A type of election', 'A military strategy'],
        correctIndex: 0,
        explanation: 'The passage contrasts "reconciliation" with "revenge," meaning restoring relations rather than retaliation.',
      },
      {
        id: 'biography-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ["International pressure was one factor that contributed to Mandela's release", "Mandela's movement never changed its approach throughout the struggle", 'Mandela remained an influential symbol even while imprisoned', 'Mandela became president immediately after his release from prison'],
        correctIndices: [0, 2],
        explanation: 'The passage says international pressure "grew steadily throughout the 1980s" before his release, and that he "remained a powerful symbol of resistance" while imprisoned — but the movement did shift strategy, and he became president four years after release, not immediately.',
      },
    ],
  },

  // ── Business ─────────────────────────────────────────────────────────
  {
    passageId: 'business-easy-1',
    questions: [
      {
        id: 'business-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['The key elements that make up a good business plan', 'How to file taxes for a small business', 'The history of entrepreneurship', 'How to hire employees'],
        correctIndex: 0,
        explanation: 'The passage lists what a strong business plan should include and why it matters.',
      },
      {
        id: 'business-easy-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, a good business plan does not need to consider competitors.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states, "A strong plan also considers what competitors are already doing well."',
      },
      {
        id: 'business-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why might even a good business idea fail to succeed?',
        options: ['Without a clear plan, it can struggle to succeed', 'Because investors always reject new ideas', 'Because competitors are illegal to study', 'Because good ideas never need planning'],
        correctIndex: 0,
        explanation: 'The passage directly states, "Without a clear plan, even a good idea can struggle to succeed."',
      },
      {
        id: 'business-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'revenue' mean as used in this passage?",
        options: ['The income a business earns from its activities', 'The total number of employees', 'A type of legal document', "A competitor's market share"],
        correctIndex: 0,
        explanation: 'The passage mentions "expected costs and revenue," using "revenue" to mean the money a business brings in.',
      },
      {
        id: 'business-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, why do investors often want to see a business plan before funding a company?',
        options: ['It helps them judge whether the business is likely to succeed and make money', 'It is a legal requirement in every country', 'It guarantees the business will succeed', 'It replaces the need for a product'],
        correctIndex: 0,
        explanation: 'The passage says, "Investors often use this plan to decide whether to fund a company," implying they use it to judge viability.',
      },
    ],
  },
  {
    passageId: 'business-medium-1',
    questions: [
      {
        id: 'business-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How e-commerce grew from an unfamiliar idea into a dominant way people shop', 'The invention of the internet', 'How to start an online store', 'The history of physical retail stores'],
        correctIndex: 0,
        explanation: 'The passage traces how trust and convenience helped online shopping grow over time.',
      },
      {
        id: 'business-medium-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what helped customers feel safer shopping online?',
        options: ['Secure payment systems', 'Lower product prices', 'Faster shipping only', 'Government regulation'],
        correctIndex: 0,
        explanation: 'The passage states, "Secure payment systems also helped customers feel safer entering their financial information."',
      },
      {
        id: 'business-medium-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, what combination of factors drove rapid growth in e-commerce?',
        options: ['Trust and convenience together', 'Only lower prices', 'Only faster shipping', 'Government subsidies'],
        correctIndex: 0,
        explanation: 'The passage states, "This combination of trust and convenience drove rapid growth across the industry."',
      },
      {
        id: 'business-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'e-commerce' mean as defined in the passage?",
        options: ['The buying and selling of goods over the internet', 'A type of in-store discount', 'A shipping company', 'A tax on online purchases'],
        correctIndex: 0,
        explanation: 'The passage opens by defining e-commerce as "the buying and selling of goods over the internet."',
      },
      {
        id: 'business-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: "What can you reasonably infer from the passage's statement that shoppers 'compare prices online even while standing inside physical stores'?",
        options: ['Online and in-store shopping now influence each other rather than existing separately', 'Physical stores have completely disappeared', 'Online shopping is always more expensive', 'Shoppers no longer use smartphones in stores'],
        correctIndex: 0,
        explanation: 'This detail shows online shopping behavior now blends into the in-store experience, implying the two are connected.',
      },
    ],
  },
  {
    passageId: 'business-hard-1',
    questions: [
      {
        id: 'business-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How compound interest accelerates growth over time and why starting early matters', 'How to calculate taxes on investments', 'The history of banking', 'How stock markets are regulated'],
        correctIndex: 0,
        explanation: 'The passage explains how compound interest works and why early investing has an advantage.',
      },
      {
        id: 'business-hard-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, compound interest is calculated only on the original amount invested, never on past interest earned.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states compound interest "is calculated on both the original amount and past interest earned."',
      },
      {
        id: 'business-hard-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why can a small amount invested early eventually outgrow a larger amount invested later?',
        options: ['Because the earlier investment has more time for interest to compound', 'Because early investors receive higher interest rates by law', 'Because later investments are always riskier', 'Because smaller amounts grow faster regardless of time'],
        correctIndex: 0,
        explanation: 'The passage explains, "This happens because the early investment has more time for interest to compound."',
      },
      {
        id: 'business-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'compound' mean as used in this passage?",
        options: ['To grow based on both the original amount and previously accumulated interest', 'To remain fixed and unchanging', 'To decrease steadily over time', 'To convert into a different currency'],
        correctIndex: 0,
        explanation: 'The passage explains growth "accelerates" because interest builds on both principal and prior interest — that self-building growth is what "compound" means here.',
      },
      {
        id: 'business-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['Delaying investment even by a few years can meaningfully reduce long-term growth', 'Compound interest can also work against someone who carries debt that compounds', 'Simple interest and compound interest always produce identical growth', 'Time is a meaningful factor in how much an investment can grow'],
        correctIndices: [0, 1, 3],
        explanation: 'The passage states waiting "even a few years...can meaningfully reduce the final outcome," that the principle "can also work against people who carry compounding debt," and that time lets interest compound — but it explicitly distinguishes compound interest from simple interest.',
      },
    ],
  },

  // ── Technology ───────────────────────────────────────────────────────
  {
    passageId: 'technology-easy-1',
    questions: [
      {
        id: 'technology-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How smartphones combined multiple devices and changed communication', 'The history of the telephone', 'How cameras were invented', 'The design of computer processors'],
        correctIndex: 0,
        explanation: 'The passage describes how smartphones combined devices and changed how people stay connected.',
      },
      {
        id: 'technology-easy-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what three devices does a smartphone combine into one?',
        options: ['A phone, a camera, and a computer', 'A radio, a television, and a calculator', 'A camera, a printer, and a scanner', 'A phone, a map, and a clock'],
        correctIndex: 0,
        explanation: 'The passage states, "Smartphones combine a phone, a camera, and a computer into one device."',
      },
      {
        id: 'technology-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: "According to the passage, what effect has constant smartphone connectivity had on people's lives?",
        options: ['It has changed how people work, shop, and stay in touch', 'It has made communication slower', 'It has eliminated the need for computers entirely', 'It has reduced access to news and information'],
        correctIndex: 0,
        explanation: 'The passage states, "This constant connectivity has changed how people work, shop, and stay in touch."',
      },
      {
        id: 'technology-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'connectivity' mean as used in this passage?",
        options: ['The ability to stay linked to networks, people, and information', 'The physical size of a device', 'The price of a smartphone', 'The battery life of a device'],
        correctIndex: 0,
        explanation: 'The passage uses "constant connectivity" to describe smartphones’ ongoing ability to connect people to tools and information.',
      },
      {
        id: 'technology-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about communication before smartphones existed?',
        options: ['Sending a message or photo generally took more time and required separate devices', 'People communicated only in person', 'Phones did not exist at all before smartphones', 'Video calls were common before smartphones'],
        correctIndex: 0,
        explanation: 'The passage states people "had to use separate devices" and that sending things "used to take much longer than it does now."',
      },
    ],
  },
  {
    passageId: 'technology-medium-1',
    questions: [
      {
        id: 'technology-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How modern AI systems learn from data and where their limitations lie', 'The history of computer hardware', 'How to become a software engineer', 'The invention of the internet'],
        correctIndex: 0,
        explanation: 'The passage explains how AI systems learn patterns from data and where they tend to struggle.',
      },
      {
        id: 'technology-medium-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, most modern AI systems follow a fixed set of rules rather than learning from data.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states AI systems learn "rather than following a fixed set of rules," identifying patterns in data instead.',
      },
      {
        id: 'technology-medium-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why do AI systems sometimes struggle with new situations?',
        options: ['Because those situations differ significantly from the data the system was trained on', 'Because AI systems have no data at all', 'Because AI systems are only used for translation', 'Because researchers intentionally limit AI performance'],
        correctIndex: 0,
        explanation: 'The passage states systems "can struggle...with situations that differ significantly from what they learned."',
      },
      {
        id: 'technology-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'patterns' mean as used in this passage?",
        options: ['Recurring structures or relationships found within data', 'Physical shapes drawn by a computer', 'A type of computer virus', 'A fixed list of instructions'],
        correctIndex: 0,
        explanation: 'The passage explains AI systems "identify patterns within...data" to make predictions.',
      },
      {
        id: 'technology-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about an AI translation tool given a sentence very different from anything in its training data?',
        options: ['It may perform less reliably than on sentences similar to its training data', 'It will always translate perfectly regardless of the input', 'It will refuse to respond at all', 'It will only work with spoken language, not text'],
        correctIndex: 0,
        explanation: 'The passage states AI systems "perform well on tasks similar to their training data" but "struggle...with situations that differ significantly."',
      },
    ],
  },
  {
    passageId: 'technology-hard-1',
    questions: [
      {
        id: 'technology-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How data travels across the internet from request to destination', 'How to build a website', 'The invention of the personal computer', 'How email spam filters work'],
        correctIndex: 0,
        explanation: 'The passage describes the steps involved when a device requests a website, including routers, packets, and DNS.',
      },
      {
        id: 'technology-hard-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what does DNS do?',
        options: ['Translates memorable domain names into numerical addresses', 'Breaks data into packets', 'Encrypts financial information', 'Powers the routers that forward data'],
        correctIndex: 0,
        explanation: 'The passage states, "Domain names...are translated into numerical addresses by a system called DNS."',
      },
      {
        id: 'technology-hard-1-q3', type: 'sequence', format: 'ordering',
        prompt: 'Arrange these steps in the order the passage describes them when you visit a website.',
        options: ['Your device sends a request across the network', 'The request travels through several routers', 'Data is broken into packets and sent toward its destination', 'The packets are reassembled once they arrive'],
        correctOrder: [0, 1, 2, 3],
        explanation: 'The passage describes the request being sent, passing through routers, being broken into packets, and finally being reassembled at the destination.',
      },
      {
        id: 'technology-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'protocols' mean as used in 'communicate using shared protocols'?",
        options: ['Agreed-upon rules that allow systems to exchange information consistently', 'Physical cables connecting computers', 'A type of computer virus', 'A brand of router'],
        correctIndex: 0,
        explanation: 'The passage describes the internet as computers that "communicate using shared protocols," meaning common rules for exchanging data.',
      },
      {
        id: 'technology-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['Visiting a website involves multiple coordinated technical steps, even though it feels instant', 'A single company owns and controls the entire internet', 'Routers help data take an efficient path to its destination', "Domain names exist mainly so people don't have to remember long strings of numbers"],
        correctIndices: [0, 2, 3],
        explanation: 'The passage says the process "feels instantaneous" but "involves many coordinated steps," that routers forward requests "along the most efficient available path," and that DNS lets "people use memorable names" — but it explicitly states "no single company or country owns the internet as a whole."',
      },
    ],
  },

  // ── Motivation ───────────────────────────────────────────────────────
  {
    passageId: 'motivation-easy-1',
    questions: [
      {
        id: 'motivation-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How breaking large goals into small steps makes progress more achievable', 'How to set a large goal', 'Why big goals should be avoided entirely', 'The psychology of competition'],
        correctIndex: 0,
        explanation: 'The passage explains how small steps build momentum toward larger goals.',
      },
      {
        id: 'motivation-easy-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, consistency over time usually matters more than occasional bursts of intense effort.',
        options: ['True', 'False'],
        correctIndex: 0,
        explanation: 'The passage states, "Consistency over time usually matters more than occasional bursts of intense effort."',
      },
      {
        id: 'motivation-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why does breaking a big goal into smaller steps help?',
        options: ['It makes the goal feel far more manageable and builds momentum', 'It makes the goal disappear entirely', 'It removes the need for any effort', 'It guarantees the goal will be reached instantly'],
        correctIndex: 0,
        explanation: 'The passage states breaking a goal into steps "makes it feel far more manageable" and "builds real momentum."',
      },
      {
        id: 'motivation-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'momentum' mean as used in this passage?",
        options: ['A building sense of forward progress that makes continuing easier', 'A sudden stop in progress', 'A type of large goal', 'A feeling of overwhelm'],
        correctIndex: 0,
        explanation: 'The passage says completing small steps "builds real momentum toward the larger goal," meaning a growing forward push.',
      },
      {
        id: 'motivation-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what would it most reasonably suggest about someone who only celebrates the final completion of a big goal, never the small steps along the way?',
        options: ['They may find it harder to sustain motivation than someone who celebrates small wins', 'They will definitely reach their goal faster', 'They are following the exact method the passage recommends', 'They avoid overwhelm better than others'],
        correctIndex: 0,
        explanation: 'The passage says "celebrating small wins along the way helps sustain long-term motivation," implying skipping this could make sustaining motivation harder.',
      },
    ],
  },
  {
    passageId: 'motivation-medium-1',
    questions: [
      {
        id: 'motivation-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How discipline, not just motivation, sustains long-term progress', 'How to become famous', 'The definition of happiness', 'How schedules are created in schools'],
        correctIndex: 0,
        explanation: 'The passage contrasts fleeting motivation with discipline that keeps action going.',
      },
      {
        id: 'motivation-medium-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what removes the daily decision of whether to start a task or not?',
        options: ['A fixed schedule', 'A strong feeling of motivation', 'A reward system', 'A sudden burst of energy'],
        correctIndex: 0,
        explanation: 'The passage states, "A fixed schedule removes the daily decision of whether to start or not."',
      },
      {
        id: 'motivation-medium-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why do people who rely only on motivation often struggle during difficult stretches?',
        options: ['Because motivation naturally rises and falls depending on mood and circumstances', 'Because motivation always stays constant', 'Because discipline is easier to build than motivation', 'Because difficult stretches remove the need for motivation'],
        correctIndex: 0,
        explanation: 'The passage explains "feelings of motivation naturally rise and fall," leaving gaps during hard periods.',
      },
      {
        id: 'motivation-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'sustains' mean as used in 'discipline is what sustains real progress'?",
        options: ['Keeps something going over time', 'Suddenly stops something', 'Makes something disappear', 'Measures something precisely'],
        correctIndex: 0,
        explanation: 'The passage contrasts fleeting motivation with discipline that keeps progress going.',
      },
      {
        id: 'motivation-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about someone who builds a consistent daily routine around a goal?',
        options: ['They may become less dependent on feeling motivated in order to keep making progress', 'They will feel motivated every single day without exception', 'They no longer need any form of discipline', 'Their routine will have no effect on their consistency'],
        correctIndex: 0,
        explanation: 'The passage states, "Building a consistent routine reduces reliance on feeling motivated in any given moment."',
      },
    ],
  },
  {
    passageId: 'motivation-hard-1',
    questions: [
      {
        id: 'motivation-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How interpreting setbacks as feedback rather than failure supports long-term growth', 'How to avoid making mistakes entirely', 'The biology of stress responses', 'How competitive sports build character'],
        correctIndex: 0,
        explanation: 'The passage explains how interpreting setbacks as feedback, linked to a growth mindset, supports persistence.',
      },
      {
        id: 'motivation-hard-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, people with a growth mindset believe abilities are fixed and cannot improve.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states people with a growth mindset "believe abilities can improve through effort and practice."',
      },
      {
        id: 'motivation-hard-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why does viewing a setback as feedback (rather than proof of permanent inability) encourage someone to keep trying?',
        options: ['Because it makes the setback feel like temporary information rather than a fixed verdict on ability', 'Because it removes the setback from memory entirely', 'Because it proves the person will definitely succeed next time', 'Because it eliminates the need for reflection'],
        correctIndex: 0,
        explanation: 'The passage states this belief "makes setbacks feel like temporary information rather than fixed verdicts."',
      },
      {
        id: 'motivation-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'persistence' mean as used in this passage?",
        options: ['Continuing to try despite difficulty or setbacks', 'Giving up immediately after failure', 'A fixed, unchangeable trait', 'A sudden burst of talent'],
        correctIndex: 0,
        explanation: 'The passage contrasts reduced future effort with encouraged "continued persistence."',
      },
      {
        id: 'motivation-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['Reflecting specifically on a setback can reveal lessons that improve a future attempt', 'A growth mindset means someone never experiences setbacks', 'How a person interprets a setback can influence how much effort they put in afterward', 'The passage describes an ongoing cycle of setback, reflection, and adjustment'],
        correctIndices: [0, 2, 3],
        explanation: 'The passage states reflecting "often reveals genuinely useful lessons," that interpretation "matters more than the setback itself" for future effort, and describes "this cycle of setback, reflection, and adjustment" — but a growth mindset does not mean avoiding setbacks, which the passage calls "unavoidable."',
      },
    ],
  },

  // ── General Knowledge ────────────────────────────────────────────────
  {
    passageId: 'general-knowledge-easy-1',
    questions: [
      {
        id: 'general-knowledge-easy-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['Why the sky appears blue due to how sunlight scatters in the atmosphere', 'How rainbows form', "The composition of the atmosphere's gases", 'Why the ocean is blue'],
        correctIndex: 0,
        explanation: 'The passage explains how light scattering in the atmosphere causes the sky to appear blue.',
      },
      {
        id: 'general-knowledge-easy-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, which color of light scatters the most when it enters the atmosphere?',
        options: ['Blue', 'Red', 'Orange', 'All colors scatter equally'],
        correctIndex: 0,
        explanation: 'The passage states collisions "scatter shorter wavelengths of light, like blue, much more than others."',
      },
      {
        id: 'general-knowledge-easy-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why does the sky often appear red or orange at sunset?',
        options: ['Because light travels through more atmosphere at sunset, scattering away most of the blue and leaving reds and oranges', 'Because the sun changes color at sunset', 'Because clouds turn red at night', 'Because blue light disappears completely at night'],
        correctIndex: 0,
        explanation: 'The passage states, "At sunset, light travels through more atmosphere, scattering away most of the blue. This leaves behind the reds and oranges."',
      },
      {
        id: 'general-knowledge-easy-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'scatter' mean as used in this passage?",
        options: ['To spread light in many different directions', 'To absorb light completely', 'To reflect light in a single direction only', 'To block light from passing through'],
        correctIndex: 0,
        explanation: 'The passage says blue light "scatters in every direction," meaning it spreads outward.',
      },
      {
        id: 'general-knowledge-easy-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about how the sky would look if Earth had no atmosphere?',
        options: ['The sky would likely not appear blue, since scattering happens when light collides with gas molecules in the atmosphere', 'The sky would look exactly the same as it does now', 'The sky would appear rainbow-colored at all times', 'The sun would stop producing light'],
        correctIndex: 0,
        explanation: 'Since the passage explains blue skies result from sunlight colliding with atmospheric gas molecules, removing the atmosphere would remove the cause of that scattering.',
      },
    ],
  },
  {
    passageId: 'general-knowledge-medium-1',
    questions: [
      {
        id: 'general-knowledge-medium-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How and why the world is divided into time zones', 'How the seasons change', 'The history of clock-making', 'How satellites orbit the Earth'],
        correctIndex: 0,
        explanation: "The passage explains why time zones exist and how they're organized.",
      },
      {
        id: 'general-knowledge-medium-1-q2', type: 'key-detail', format: 'true-false',
        prompt: 'True or False: According to the passage, time zone borders always follow perfectly straight lines of longitude with no exceptions.',
        options: ['True', 'False'],
        correctIndex: 1,
        explanation: 'The passage states zones "mostly follow lines of longitude, though borders often bend for convenience."',
      },
      {
        id: 'general-knowledge-medium-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why do different regions of Earth experience different times of day at the same moment?',
        options: ['Because the sun only lights one side of the Earth at a time as it rotates', 'Because clocks are set differently for cultural reasons only', "Because the Earth's orbit around the sun changes speed", 'Because time zones are entirely arbitrary with no natural cause'],
        correctIndex: 0,
        explanation: 'The passage states, "Because the sun only lights one side of the Earth at a time, different regions experience different times."',
      },
      {
        id: 'general-knowledge-medium-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'longitude' most likely refer to in this passage?",
        options: ['Imaginary lines running north-south used to measure position around the Earth', 'A measurement of temperature', 'A unit of time', 'The distance from the equator'],
        correctIndex: 0,
        explanation: 'The passage says time zones "mostly follow lines of longitude," referring to the reference lines used to divide the globe.',
      },
      {
        id: 'general-knowledge-medium-1-q5', type: 'inference', format: 'single-choice',
        prompt: 'Based on the passage, what can you reasonably infer about scheduling a meeting between people in several different countries?',
        options: ['It likely requires careful planning since participants may be in different time zones', 'It requires no planning since all countries share the same time', 'Daylight saving time never affects such scheduling', 'Time zones only matter for weather forecasting'],
        correctIndex: 0,
        explanation: 'The passage directly states, "Coordinating events across time zones can require careful planning for global businesses."',
      },
    ],
  },
  {
    passageId: 'general-knowledge-hard-1',
    questions: [
      {
        id: 'general-knowledge-hard-1-q1', type: 'main-idea', format: 'single-choice',
        prompt: 'What is this passage mainly about?',
        options: ['How and why the Gregorian calendar was created to correct the older Julian calendar', "The history of Pope Gregory's papacy", 'How ancient civilizations tracked the seasons', 'The invention of the modern clock'],
        correctIndex: 0,
        explanation: 'The passage explains the Julian calendar’s error and how the Gregorian reform corrected it.',
      },
      {
        id: 'general-knowledge-hard-1-q2', type: 'key-detail', format: 'single-choice',
        prompt: 'According to the passage, what problem did the Julian calendar have?',
        options: ['It slightly overestimated the length of a solar year', 'It had too many months', 'It used a different alphabet', 'It ignored leap years entirely'],
        correctIndex: 0,
        explanation: 'The passage states, "The previous Julian calendar slightly overestimated the length of a solar year."',
      },
      {
        id: 'general-knowledge-hard-1-q3', type: 'cause-effect', format: 'single-choice',
        prompt: 'According to the passage, why are years divisible by 100 (but not 400) not leap years under the Gregorian calendar?',
        options: ["This more precise rule corrects the small drift the Julian calendar's simpler rule caused", 'Because the Pope disliked the number 100', 'Because those years have fewer days by nature', 'Because leap years were abolished in those years'],
        correctIndex: 0,
        explanation: 'The passage explains this exception is part of "a more precise rule" that "keeps the calendar closely aligned with the actual solar year."',
      },
      {
        id: 'general-knowledge-hard-1-q4', type: 'vocabulary', format: 'single-choice',
        prompt: "What does 'drift' mean as used in the passage's description of the calendar gradually falling out of alignment?",
        options: ['A gradual shift away from correct alignment over time', 'A sudden, one-time jump in dates', 'An improvement in accuracy', 'A type of religious ceremony'],
        correctIndex: 0,
        explanation: 'The passage describes the error as gradually pushing "dates out of alignment," a slow shift away from accuracy.',
      },
      {
        id: 'general-knowledge-hard-1-q5', type: 'inference', format: 'multi-select',
        prompt: 'Which of the following are reasonable conclusions based on the passage? (Select all that apply)',
        options: ['Comparing historical dates across countries can be confusing because of when each adopted the Gregorian calendar', 'Every country adopted the Gregorian calendar at the exact same time', 'The year 2000 was a leap year because it is divisible by both 100 and 400', 'The Julian calendar was perfectly accurate and never needed correction'],
        correctIndices: [0, 2],
        explanation: 'The passage states adoption happened "at different times, sometimes centuries apart," causing confusion, and since 2000 is divisible by 400 it remains a leap year under the stated rule — but countries did not adopt at the same time, and the Julian calendar did need correction.',
      },
    ],
  },
]

const COMPREHENSION_QUESTIONS: Record<string, ComprehensionQuestionSet> = QUESTION_SETS.reduce(
  (acc, set) => ({ ...acc, [set.passageId]: set }),
  {} as Record<string, ComprehensionQuestionSet>,
)

export function getComprehensionQuestions(passageId: string): ComprehensionQuestionSet | null {
  return COMPREHENSION_QUESTIONS[passageId] ?? null
}

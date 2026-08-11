import type { ReadingUnit } from '@/features/reading-engine/types'

// Paragraph Reading Mode™ dataset — Quantum Speed Reading™ V2, Master
// Reading Engine mode #4. Deliberately its own folder/content, separate
// from the unrelated, protected V1 "Paragraph Reading™" mission-gated
// exercise (src/features/quantum-speed-reading/components/
// ParagraphReadingExperience.tsx) — no shared files, no route collision.
//
// 10/10 Overhaul — a genuine 22-category library of real, hand-authored,
// full-length passages (no AI, no lorem ipsum), spanning psychology,
// science, history, and deep philosophy. Each category is a single
// ~280-330 word passage (verified in this file's own test suite) — a true
// full paragraph, not a handful of disconnected aphorisms — followed by
// exactly 3 real comprehension questions, each answerable only by having
// actually read that category's own passage. `text` stays one continuous
// string (not pre-split into sentences) since both Canvases derive their
// own word-level ReadingUnits from it via buildUnitsForCategory below —
// the engine paces word-by-word, exactly like the pre-overhaul version,
// just now streamed continuously instead of held static with a hopping
// highlight.
export type ParagraphReadingModeQuizQuestion = {
  id: string
  question: string
  options: readonly string[]
  correctOptionIndex: number
}

export type ParagraphReadingModeCategory = {
  id: string
  label: string
  text: string
  questions: readonly ParagraphReadingModeQuizQuestion[]
}

export const PARAGRAPH_READING_MODE_CATEGORIES: readonly ParagraphReadingModeCategory[] = [
  {
    id: 'the-psychology-of-procrastination',
    label: 'Why We Procrastinate',
    text: 'Procrastination is often mistaken for simple laziness, but psychologists increasingly describe it as an emotional regulation problem rather than a time management one. The mind is not avoiding the task itself so much as the uncomfortable feeling the task provokes, whether that feeling is anxiety, boredom, self-doubt, or frustration. Delaying the work offers instant relief from that discomfort, and the brain quickly learns to repeat whatever behavior brings relief fastest. This creates a short-term reward that steadily undermines long-term goals, since the relief never actually removes the underlying task, only postpones the moment it must finally be faced. Research shows that people with a stronger present bias, an outsized preference for immediate comfort over future benefit, tend to procrastinate more consistently across nearly every area of life. Perfectionism plays a surprisingly large role too; a task that feels impossible to do flawlessly can feel safer to avoid altogether than to attempt imperfectly. Ironically, procrastination often increases stress rather than reducing it, since the postponed task keeps quietly occupying mental space in the background. Studies using functional brain imaging suggest chronic procrastinators show heightened activity in regions associated with threat detection when confronting demanding tasks, treating the work almost like a genuine danger to avoid. Effective interventions rarely rely on willpower alone; breaking a task into smaller, less emotionally loaded steps tends to work far better than simply resolving to try harder. Self-compassion, oddly enough, also reduces procrastination more reliably than self-criticism, since guilt and shame tend to deepen the very avoidance they are meant to prevent. Understanding procrastination as an emotional pattern, not a character flaw, offers a far more practical path toward actually finishing what gets postponed.',
    questions: [
      {
        id: 'the-psychology-of-procrastination-q1',
        question: 'According to the passage, procrastination is increasingly described by psychologists as what kind of problem?',
        options: ['A time management problem', 'An emotional regulation problem', 'A memory problem', 'A physical health problem'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-psychology-of-procrastination-q2',
        question: 'What does the passage say chronic procrastinators show heightened activity in, according to brain imaging studies?',
        options: ['Regions associated with threat detection', 'Regions associated with long-term memory', 'Regions associated with vision', 'Regions associated with hunger'],
        correctOptionIndex: 0,
      },
      {
        id: 'the-psychology-of-procrastination-q3',
        question: 'According to the passage, what tends to reduce procrastination more reliably than self-criticism?',
        options: ['Stricter deadlines', 'Self-compassion', 'Public shaming', 'Ignoring the task entirely'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-bystander-effect',
    label: 'The Bystander Effect',
    text: 'In 1964, a young woman named Kitty Genovese was attacked outside her New York apartment building while, according to widely reported early accounts, numerous neighbors did nothing to intervene. Although later research complicated many details of that specific case, it sparked a wave of psychological study into why people so often fail to help someone in visible distress when others are nearby. Researchers John Darley and Bibb Latané proposed an explanation now known as the bystander effect: the more people who witness an emergency, the less likely any single person is to step in and help. This happens partly through diffusion of responsibility, where each witness assumes someone else will act, quietly spreading accountability thin enough that no one individual feels compelled to move first. Ambiguity worsens the effect considerably; if a situation is not obviously an emergency, bystanders often look to others’ reactions to decide how to interpret it, and a room full of hesitant, uncertain faces can convince everyone that inaction is the appropriate response. This is sometimes called pluralistic ignorance, a shared and mistaken assumption that everyone else understands the situation better than you do. Laboratory experiments have repeatedly demonstrated the effect, showing that a lone bystander is often far more likely to help than someone standing in a crowd of others. Fear of embarrassment also plays a role, since acting decisively in an ambiguous situation risks looking foolish if the emergency turns out to be nothing serious. Understanding these mechanics has practical value beyond psychology textbooks; safety trainers now teach people to counteract the effect directly, for instance by pointing at a specific individual and assigning them a specific task during an emergency, which reliably breaks the diffusion of responsibility that otherwise keeps a crowd frozen in place.',
    questions: [
      {
        id: 'the-bystander-effect-q1',
        question: 'Who proposed the explanation now known as the bystander effect, according to the passage?',
        options: ['Leon Festinger', 'Walter Mischel', 'John Darley and Bibb Latané', 'Philippa Foot'],
        correctOptionIndex: 2,
      },
      {
        id: 'the-bystander-effect-q2',
        question: "According to the passage, what is 'diffusion of responsibility'?",
        options: [
          'Each witness assuming someone else will act',
          'A type of physical diffusion in chemistry',
          'A legal term for shared blame',
          'A method for training police officers',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'the-bystander-effect-q3',
        question: 'Per the passage, what technique reliably breaks the diffusion of responsibility during an emergency?',
        options: [
          'Shouting for help generally',
          'Calling the police only',
          'Pointing at a specific individual and assigning them a task',
          'Waiting for someone else to act first',
        ],
        correctOptionIndex: 2,
      },
    ],
  },
  {
    id: 'cognitive-dissonance',
    label: 'The Discomfort of Contradiction',
    text: 'Psychologist Leon Festinger proposed one of the most influential ideas in modern psychology after studying a small group convinced the world would end on a specific date. When the date passed uneventfully, rather than abandoning their belief, many members of the group became even more convinced of it, reinterpreting the failed prophecy as evidence their faith had somehow saved the world instead. Festinger called the underlying discomfort cognitive dissonance: the uncomfortable mental tension that arises when a person holds two contradictory beliefs, or when new evidence conflicts sharply with an existing belief or self-image. The mind strongly prefers internal consistency, and when consistency breaks, it will often reach for whatever explanation restores comfort fastest, even if that explanation requires distorting the evidence rather than the belief. This helps explain why people so rarely change their minds after being shown clear, factual evidence that contradicts a strongly held position; the discomfort of being wrong can feel worse than the discomfort of ignoring inconvenient facts. Dissonance shows up constantly in ordinary life, not just in dramatic prophecy failures. A person who smokes despite knowing the health risks might downplay the danger, emphasize a relative who smoked for decades without issue, or simply avoid thinking about it altogether, all in service of reducing the tension between behavior and belief. Advertisers and negotiators exploit this tendency deliberately, since getting someone to take even a small action consistent with a desired belief often makes them more likely to adopt that belief fully afterward, to keep their thoughts and actions aligned. Recognizing cognitive dissonance in oneself is difficult precisely because the mind is actively working to hide the contradiction rather than expose it, but that awareness remains one of the more reliable tools for genuinely revising a mistaken belief rather than merely defending it.',
    questions: [
      {
        id: 'cognitive-dissonance-q1',
        question: 'According to the passage, what event did Leon Festinger study that led to his theory?',
        options: ['A stock market crash', 'A group convinced the world would end on a specific date', 'A war between two nations', 'A famous court trial'],
        correctOptionIndex: 1,
      },
      {
        id: 'cognitive-dissonance-q2',
        question: 'What does the passage say cognitive dissonance is?',
        options: ['A memory disorder', 'The uncomfortable mental tension from holding two contradictory beliefs', 'A fear of public speaking', 'A type of visual illusion'],
        correctOptionIndex: 1,
      },
      {
        id: 'cognitive-dissonance-q3',
        question: 'According to the passage, what often happens when someone takes even a small action consistent with a desired belief?',
        options: ['They become less likely to believe it', 'They become more likely to adopt that belief fully afterward', 'Nothing changes at all', 'They forget the belief entirely'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-marshmallow-test',
    label: 'The Marshmallow Test',
    text: 'In the late 1960s, psychologist Walter Mischel ran a deceptively simple experiment on young children at a preschool connected to Stanford University. Each child was offered a marshmallow and given a choice: eat it immediately, or wait alone in the room for several minutes without eating it, in exchange for a second marshmallow as a reward for waiting. The footage of children struggling to resist, covering their eyes, sitting on their hands, or talking to the marshmallow as though negotiating with it, became one of psychology’s most recognizable images. Mischel’s initial interest was in willpower itself, but a follow-up decades later produced the study’s most famous and most debated finding: children who waited longer as preschoolers tended, on average, to show better life outcomes years later, including higher academic performance and stronger self-reported wellbeing. This led to a popular narrative that early self-control alone predicts lifelong success. Later research complicated that story considerably. A larger, more diverse replication found the correlation was much weaker once a family’s economic background was accounted for, since a child’s environment strongly shapes whether waiting for a second marshmallow even feels like a reasonable bet. A child accustomed to promises going unfulfilled has good reason to take the guaranteed treat immediately rather than trust an uncertain future reward. Rather than proving willpower is fixed and innate, the more nuanced modern reading suggests self-control is heavily shaped by context, trust, and circumstance, and can be taught and supported rather than simply possessed or lacked. The marshmallow test endures not because its original conclusion held up perfectly, but because it captured, vividly and memorably, just how early the tension between present comfort and future reward begins to shape a life.',
    questions: [
      {
        id: 'the-marshmallow-test-q1',
        question: 'Who ran the original marshmallow experiment, according to the passage?',
        options: ['Leon Festinger', 'Walter Mischel', 'Jean-Paul Sartre', 'Judith Jarvis Thomson'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-marshmallow-test-q2',
        question: 'According to the passage, what did a larger, more diverse replication find about the original correlation?',
        options: ['It was even stronger than first reported', "It was much weaker once family economic background was accounted for", 'It completely disappeared', 'It only applied to adults'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-marshmallow-test-q3',
        question: 'Per the passage, why might a child accustomed to broken promises take the guaranteed treat immediately?',
        options: ['They dislike marshmallows', 'They have good reason not to trust an uncertain future reward', 'They were told to by the researcher', 'They cannot count to two'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-placebo-effect',
    label: 'The Placebo Effect',
    text: 'A placebo is, by definition, a treatment with no active therapeutic ingredient, yet patients given one regularly report genuine improvement in symptoms ranging from pain to fatigue to depression. This is not simply patients imagining relief or lying to please a researcher; measurable physiological changes, including altered brain activity and the release of the body’s own natural painkillers, have been documented in placebo responders. The effect appears to depend heavily on expectation and context. A placebo pill described as expensive produces stronger reported relief than an identical pill described as cheap. An injection tends to outperform a pill, and a pill with a recognizable brand name outperforms a generic-looking one, even though none of these versions contain any active medicine at all. The color and even the number of pills taken can subtly shift outcomes, suggesting the brain is responding to the ritual and expectation of treatment as much as to any physical substance. Perhaps most surprising, studies have found measurable improvement even in so-called open-label placebos, where patients are told plainly and honestly that the pill contains no medicine, yet still experience real symptom relief simply from the structured ritual of taking it. This has led some researchers to argue the placebo effect is not a nuisance to be eliminated from drug trials but a genuine, if partial, healing mechanism the body possesses, activated by belief, trust in a caregiver, and the expectation of getting better. Modern clinical trials rely on placebo comparison groups precisely because this effect is powerful enough to convincingly mimic real treatment, meaning any new drug must outperform not just no treatment, but the surprisingly strong power of a sugar pill and a confident doctor.',
    questions: [
      {
        id: 'the-placebo-effect-q1',
        question: 'According to the passage, which tends to produce a stronger reported placebo effect?',
        options: ['A cheap-described pill', 'An expensive-described pill', 'No pill at all', 'A pill with no color'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-placebo-effect-q2',
        question: "What does the passage say about 'open-label' placebos?",
        options: ['They never produce any effect', 'Patients told honestly the pill contains no medicine still experience real relief', 'They are illegal in most countries', 'They only work on children'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-placebo-effect-q3',
        question: 'According to the passage, why do modern clinical trials rely on placebo comparison groups?',
        options: ['Because placebos are cheaper to manufacture', 'Because the placebo effect is powerful enough to mimic real treatment', 'Because patients prefer placebos', 'Because it is legally required in all cases'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'impostor-syndrome',
    label: 'Impostor Syndrome',
    text: 'Despite genuine, well-documented achievements, many capable people privately believe they are frauds who have simply managed, so far, to fool everyone around them. Psychologists Pauline Clance and Suzanne Imes first described this pattern in 1978 after noticing it repeatedly among high-achieving women, though later research confirmed it appears widely across genders, professions, and cultures. The feeling typically intensifies rather than fades with success, since each new achievement can feel less like earned proof of competence and more like a narrower escape that raises the stakes of eventually being caught out. Sufferers often attribute their accomplishments to luck, timing, or the ability to charm other people, while attributing any failure directly to their own genuine lack of ability, a pattern researchers call an asymmetric explanatory style. This creates a self-reinforcing loop: success gets explained away, so it never actually updates the person’s underlying sense of their own competence, no matter how much real evidence accumulates. Perfectionism frequently travels alongside impostor feelings, since an unreasonably high personal bar makes even strong performance feel like falling short of what a "real" expert would have done. Transitions seem to trigger the feeling especially sharply, including starting a demanding new job, entering a prestigious program, or being promoted into unfamiliar responsibility, moments when a person is surrounded by new peers whose own private doubts remain, by definition, invisible to them. This invisibility matters enormously; comparing one’s own known anxieties against everyone else’s confident exterior creates a deeply misleading picture, since nearly everyone in the room may be quietly experiencing some version of the same doubt. Simply learning how common the feeling is, and how poorly it tracks actual competence, is often the single most effective first step toward loosening its grip.',
    questions: [
      {
        id: 'impostor-syndrome-q1',
        question: 'Who first described the pattern now known as impostor syndrome, according to the passage?',
        options: ['Pauline Clance and Suzanne Imes', 'Walter Mischel', 'Leon Festinger', 'John Darley and Bibb Latané'],
        correctOptionIndex: 0,
      },
      {
        id: 'impostor-syndrome-q2',
        question: 'According to the passage, how do impostor feelings typically change with continued success?',
        options: ['They fade away completely', 'They typically intensify rather than fade', 'They have no relationship to success', 'They only appear after failure'],
        correctOptionIndex: 1,
      },
      {
        id: 'impostor-syndrome-q3',
        question: 'Per the passage, what moments seem to trigger impostor feelings especially sharply?',
        options: ['Routine, unchanging daily tasks', 'Transitions like a new job or promotion', 'Vacations', 'Retirement only'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-double-slit-experiment',
    label: 'The Experiment That Broke Reality',
    text: 'Fire a stream of particles at a barrier with two narrow slits cut into it, and place a detector screen behind the barrier to record where each particle lands. This simple setup, first used with light and later with electrons and even large molecules, produced one of the strangest and most consequential results in the history of physics. When both slits are open and nothing observes which slit a particle passes through, the particles collectively build up an interference pattern on the screen, alternating bands of high and low density, exactly the pattern light waves produce when they overlap and interfere with each other. This suggests each individual particle is somehow passing through both slits at once, interfering with itself like a wave, rather than traveling cleanly through one slit like a simple object. Stranger still, if a detector is placed at the slits to measure which one each particle actually passes through, the interference pattern vanishes entirely, replaced by two simple bands directly behind each slit, exactly as particles behaving like ordinary objects would produce. The mere act of measurement appears to collapse the particle’s wave-like behavior into ordinary, particle-like behavior. This result, replicated countless times since the early twentieth century, sits at the heart of quantum mechanics and remains genuinely unsettling even to physicists who work with it daily. It suggests that at the smallest scales, reality does not have fully determined properties until those properties are actually measured or observed in some physical sense. Numerous interpretations attempt to explain what is really happening, from the idea of a fundamentally probabilistic universe to more exotic proposals involving countless branching realities, and physicists still disagree sharply about which interpretation, if any, captures what is truly going on beneath the equations.',
    questions: [
      {
        id: 'the-double-slit-experiment-q1',
        question: 'According to the passage, what happens to the interference pattern when a detector measures which slit a particle passes through?',
        options: ['It becomes stronger', 'It vanishes entirely', 'It doubles in intensity', 'It has no effect at all'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-double-slit-experiment-q2',
        question: 'What does the interference pattern suggest about each individual particle, per the passage?',
        options: ['It is passing through both slits at once, like a wave', 'It is being destroyed at the barrier', 'It never actually reaches the screen', 'It splits into two separate particles'],
        correctOptionIndex: 0,
      },
      {
        id: 'the-double-slit-experiment-q3',
        question: 'According to the passage, what field of physics does this experiment sit at the heart of?',
        options: ['Classical mechanics', 'Quantum mechanics', 'Thermodynamics', 'Astronomy'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'cern-large-hadron-collider',
    label: 'Inside the Machine That Recreates the Big Bang',
    text: 'Buried roughly one hundred meters beneath the border of France and Switzerland sits a ring of superconducting magnets twenty-seven kilometers in circumference, cooled to a temperature colder than deep space. This is the Large Hadron Collider, the most powerful particle accelerator ever built, designed to smash protons together at velocities approaching the speed of light. Each collision briefly recreates conditions last seen a fraction of a second after the Big Bang, releasing bursts of energy dense enough to conjure exotic particles that do not otherwise exist in the universe today. Thousands of scientists from dozens of countries collaborate on experiments here, sifting through the wreckage of trillions of collisions for statistically significant patterns hidden among an overwhelming amount of ordinary background noise. In 2012, two independent detector teams announced they had found strong evidence for the Higgs boson, a particle predicted decades earlier as the mechanism that gives other fundamental particles their mass. Its discovery confirmed the last missing piece of the Standard Model, physics’ best current description of the fundamental particles and forces that build the observable universe. Operating the collider requires enormous engineering precision; the magnets must be cooled with liquid helium to maintain superconductivity, and the beams of protons travel through a vacuum emptier than interplanetary space to avoid colliding with stray air molecules. Despite its scale, the collider explores only a narrow window of achievable energy, and many of the deepest open questions in physics, including the true nature of dark matter and dark energy, remain stubbornly unanswered by the data collected so far. Planned upgrades aim to push collision rates even higher, in the hope that rarer, still-undiscovered phenomena might finally reveal themselves within the debris.',
    questions: [
      {
        id: 'cern-large-hadron-collider-q1',
        question: 'According to the passage, where is the Large Hadron Collider located?',
        options: ['Beneath the border of France and Switzerland', 'In the United States', 'In Japan', 'In outer space'],
        correctOptionIndex: 0,
      },
      {
        id: 'cern-large-hadron-collider-q2',
        question: 'What particle did two detector teams announce strong evidence for in 2012, per the passage?',
        options: ['The electron', 'The Higgs boson', 'The neutrino', 'The photon'],
        correctOptionIndex: 1,
      },
      {
        id: 'cern-large-hadron-collider-q3',
        question: "According to the passage, what temperature must the collider's magnets be cooled to?",
        options: ['Room temperature', 'Colder than deep space', 'Exactly zero degrees Celsius', 'The temperature of the sun'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-human-microbiome',
    label: 'The Hidden Ecosystem Inside You',
    text: 'The human body hosts trillions of microorganisms, bacteria, viruses, fungi, and other microbes, collectively known as the microbiome, with the greatest concentration living quietly inside the gut. Early estimates suggested these microbial cells might outnumber human cells by ten to one; more careful recent counts place the ratio closer to roughly one to one, though the microbiome’s genetic material still vastly outnumbers the human genome in sheer diversity. Far from being passive hitchhikers, these microbes perform genuine metabolic work the human body cannot manage alone, breaking down complex fibers, synthesizing certain vitamins, and training the immune system to distinguish real threats from harmless substances. Disruptions to this internal ecosystem, whether from antibiotics, poor diet, or chronic stress, have been linked to a surprisingly wide range of conditions, including digestive disorders, allergies, and even some mood disturbances, through what researchers now call the gut-brain axis. This axis works partly through the vagus nerve, a direct communication line between gut and brain, and partly through microbial byproducts that influence inflammation and neurotransmitter activity throughout the body. Diet appears to be one of the fastest and most powerful levers for reshaping this ecosystem; studies have found measurable shifts in gut bacterial composition within just days of a significant dietary change. Diversity, rather than any single "superfood" microbe, seems to matter most for a resilient, well-functioning gut community, since a more varied ecosystem tends to recover more easily from disruption. Fecal microbiota transplants, in which a healthy donor’s gut bacteria are transferred to a patient, have shown striking success treating certain stubborn infections, offering a vivid demonstration of just how much influence this invisible internal ecosystem holds over overall health.',
    questions: [
      {
        id: 'the-human-microbiome-q1',
        question: 'According to the passage, where does the gut microbiome communicate directly with the brain?',
        options: ['Through the spinal cord only', 'Through the vagus nerve', 'Through the optic nerve', 'There is no direct communication'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-human-microbiome-q2',
        question: 'What does the passage say matters most for a resilient gut community?',
        options: ["A single 'superfood' microbe", 'Diversity of the microbial ecosystem', 'Eating only one type of food', 'Avoiding all bacteria entirely'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-human-microbiome-q3',
        question: 'According to the passage, what have fecal microbiota transplants shown success treating?',
        options: ['Broken bones', 'Certain stubborn infections', 'Common colds', 'Vision loss'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'octopus-intelligence',
    label: 'The Alien Intelligence of the Octopus',
    text: 'Octopuses diverged from the evolutionary line leading to vertebrates roughly five hundred million years ago, long before anything resembling a complex brain had evolved on either branch. Despite this enormous evolutionary distance, octopuses display problem-solving abilities that rival many vertebrates, including opening jars, navigating mazes, and recognizing individual human faces after only brief exposure. Their intelligence is structured almost nothing like a human brain. Roughly two-thirds of an octopus’s neurons live not in its central brain but distributed throughout its eight arms, each capable of independently sensing, tasting, and reacting to its environment with a surprising degree of autonomy. An octopus can lose an arm and grow a new one, and studies suggest a severed arm can still respond reflexively to stimuli for a short time afterward, hinting at just how distributed its nervous system truly is. Octopuses can also change the color, pattern, and texture of their skin almost instantly, using specialized cells to blend seamlessly into their surroundings or communicate mood, all without any input from their central brain governing the process directly. Many researchers now consider octopuses among the strongest real-world candidates for genuinely alien-like intelligence, since their cognitive abilities evolved along a completely separate evolutionary path from every other animal commonly studied for intelligence. Captive octopuses have been documented squirting water at lights to short them out, escaping enclosures through impossibly narrow gaps, and, in several well-documented aquarium incidents, appearing to specifically target and harass staff members they seemed to dislike. Their short lifespans, often only one to two years, remain one of biology’s more puzzling mysteries, since such sophisticated intelligence seems, at least from a human perspective, almost wasted on a creature that lives so briefly.',
    questions: [
      {
        id: 'octopus-intelligence-q1',
        question: "According to the passage, where do roughly two-thirds of an octopus's neurons live?",
        options: ['In its central brain', 'Distributed throughout its eight arms', 'In its eyes', 'In its skin only'],
        correctOptionIndex: 1,
      },
      {
        id: 'octopus-intelligence-q2',
        question: 'What have octopuses been documented doing in aquariums, per the passage?',
        options: ['Squirting water at lights to short them out', 'Building complex tools', 'Communicating with dolphins', 'Refusing to eat entirely'],
        correctOptionIndex: 0,
      },
      {
        id: 'octopus-intelligence-q3',
        question: 'According to the passage, roughly how long do octopuses typically live?',
        options: ['Fifty years', 'Only one to two years', 'Ten to twenty years', 'Their entire evolutionary history'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-james-webb-telescope',
    label: 'Seeing the Edge of Time',
    text: 'Launched on Christmas Day in 2021 after decades of development and repeated delays, the James Webb Space Telescope unfolded itself in stages during its month-long journey to a gravitationally stable point nearly one million miles from Earth. Unlike its predecessor Hubble, which observes primarily in visible light, Webb is tuned mainly to infrared wavelengths, allowing it to peer through clouds of cosmic dust that would otherwise block visible light entirely, and to detect the faint, stretched light of the earliest galaxies in the universe. As the universe expands, light traveling toward us from extremely distant objects gets stretched toward longer, redder wavelengths, a phenomenon called redshift; the most distant galaxies are shifted so far that only infrared instruments can detect them at all. Webb’s primary mirror, over six meters across, is built from eighteen hexagonal gold-coated segments that had to unfold and align with nanometer-level precision after launch, since the whole assembly was folded to fit inside the rocket that carried it. A five-layer sunshield roughly the size of a tennis court keeps the telescope’s instruments at extraordinarily cold temperatures, essential because any stray heat would flood its infrared detectors with useless noise. Within months of becoming operational, Webb had already identified galaxy candidates from far earlier in cosmic history than astronomers had expected to find, challenging some existing models of how quickly galaxies formed after the Big Bang. It has also directly analyzed the atmospheres of planets orbiting distant stars, searching for chemical signatures that might hint at habitability. Because Webb orbits far from Earth rather than close to it like Hubble, no astronaut servicing mission is possible if something breaks, making its flawless deployment sequence one of the most closely watched engineering events in recent space history.',
    questions: [
      {
        id: 'the-james-webb-telescope-q1',
        question: 'According to the passage, what wavelengths is the James Webb Space Telescope mainly tuned to?',
        options: ['Visible light', 'Infrared', 'X-rays', 'Radio waves'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-james-webb-telescope-q2',
        question: "What is Webb's primary mirror made of, according to the passage?",
        options: ['A single piece of solid glass', 'Eighteen hexagonal gold-coated segments', 'Plastic panels', 'Silver-coated steel'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-james-webb-telescope-q3',
        question: 'According to the passage, why is no astronaut servicing mission possible for Webb if something breaks?',
        options: ['It orbits far from Earth, unlike Hubble', 'It is too small to service', 'NASA has no more astronauts', 'It was never designed to be repaired on Earth'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'photosynthesis-efficiency',
    label: "Nature's Solar Engine",
    text: 'Every green leaf performs a feat modern engineering still cannot fully replicate: converting sunlight, water, and carbon dioxide into stored chemical energy with remarkable reliability, using little more than a thin layer of specialized cells. Inside each leaf, structures called chloroplasts contain chlorophyll, a pigment that absorbs mostly red and blue light while reflecting green light, which is why most plants appear green to the human eye. Captured light energy drives a sequence of reactions that split water molecules, releasing oxygen as a byproduct, while the extracted energy is used to convert carbon dioxide into glucose, a simple sugar the plant uses for growth and stores for later use. This entire process depends on a delicate balance of temperature, water availability, and light intensity, and remarkably little of the sunlight that strikes a leaf, often only around one to two percent, actually ends up converted into usable chemical energy. That seemingly low efficiency has intrigued scientists for decades, since it initially seems wasteful compared to modern solar panels, which can convert a much higher percentage of sunlight into electricity. Plants, however, are not optimizing purely for raw energy capture; they are balancing that capture against water loss, heat stress, and the risk of damage from excess light, constraints a solar panel does not have to manage. Researchers studying photosynthesis hope to eventually engineer crops with modestly improved efficiency, since even small gains, multiplied across global agriculture, could meaningfully increase food production without requiring additional farmland. Some laboratories are also studying artificial photosynthesis directly, attempting to mimic the plant’s chemistry to produce clean fuel from little more than sunlight, water, and carbon dioxide, a goal that remains promising but has so far proven difficult to scale efficiently outside carefully controlled conditions.',
    questions: [
      {
        id: 'photosynthesis-efficiency-q1',
        question: 'According to the passage, roughly what percentage of sunlight striking a leaf ends up converted into usable chemical energy?',
        options: ['Around fifty percent', 'Around one to two percent', 'Nearly one hundred percent', 'None at all'],
        correctOptionIndex: 1,
      },
      {
        id: 'photosynthesis-efficiency-q2',
        question: 'What byproduct is released when water molecules are split during photosynthesis, per the passage?',
        options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen gas only'],
        correctOptionIndex: 1,
      },
      {
        id: 'photosynthesis-efficiency-q3',
        question: 'According to the passage, what are plants balancing capture of sunlight against, unlike solar panels?',
        options: ['Cost and manufacturing', 'Water loss, heat stress, and risk of light damage', 'Battery storage limits', 'Government regulations'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-fall-of-constantinople',
    label: 'The Fall of Constantinople',
    text: 'For over a thousand years, the massive land walls of Constantinople had repelled every army that dared besiege them, protecting the last surviving remnant of the once-vast Roman Empire long after Rome itself had fallen. By 1453, the city was a shadow of its former self, its population and resources dramatically diminished, yet its ancient fortifications still stood as one of the most formidable defensive systems in the medieval world. Sultan Mehmed II, only twenty-one years old, assembled an enormous Ottoman army and, crucially, a set of massive bronze cannons built specifically to batter down walls that centuries of conventional siege warfare had never managed to breach. The city’s defenders, vastly outnumbered, held out for nearly two months, repairing damaged sections of wall overnight and repelling repeated assaults. In one particularly bold move, the Ottomans transported dozens of ships overland on greased logs to bypass a chain blocking the city’s harbor, catching the defenders by surprise from a direction they had considered secure. On the twenty-ninth of May, after weeks of relentless bombardment had finally opened breaches in the ancient walls, Ottoman forces broke through, and the city fell within hours. Emperor Constantine XI reportedly died fighting in the chaos, and Constantinople, renamed Istanbul, became the new capital of the expanding Ottoman Empire. The fall sent shockwaves through Europe, cutting off long-established overland trade routes to Asia and pushing European powers to seek new sea routes instead, a search that would eventually help drive the Age of Exploration. Historians often mark 1453 as a symbolic close to the medieval period, the moment the last living continuation of the ancient Roman Empire, nearly two thousand years after its founding, finally came to an end.',
    questions: [
      {
        id: 'the-fall-of-constantinople-q1',
        question: 'According to the passage, how old was Sultan Mehmed II when he besieged Constantinople?',
        options: ['Thirty-five', 'Twenty-one', 'Fifty', 'Sixty'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-fall-of-constantinople-q2',
        question: "What tactic did the Ottomans use to bypass the chain blocking the city's harbor, per the passage?",
        options: ['They tunneled underground', 'They transported ships overland on greased logs', 'They bribed the harbor guards', 'They built a second harbor'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-fall-of-constantinople-q3',
        question: 'According to the passage, what did the fall of Constantinople push European powers to seek?',
        options: ['New sea routes to Asia', 'Alliance with the Ottoman Empire', 'A new religion', 'A return to hand-copied manuscripts'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'the-manhattan-project',
    label: 'The Manhattan Project',
    text: 'In 1942, amid the uncertainty of a global war, the United States launched a secret research effort so vast it would eventually employ more than one hundred thousand people across dozens of sites, most of whom had no idea what they were actually helping to build. The Manhattan Project, named for its early administrative offices in New York, brought together an extraordinary concentration of scientific talent, including physicists who had fled fascism in Europe, to solve the theoretical and practical challenges of building an atomic weapon before Nazi Germany could build one first. Secret cities sprang up almost overnight at Los Alamos, Oak Ridge, and Hanford, purpose-built to enrich uranium, produce plutonium, and design a working weapon, all under extraordinary secrecy that kept even senior government officials only partially informed. Physicist J. Robert Oppenheimer led the scientific team at Los Alamos, coordinating theoretical work with engineering challenges that had genuinely never been solved before. On July 16, 1945, the project’s culmination arrived in the New Mexico desert with the Trinity test, the first-ever detonation of a nuclear weapon, producing a fireball and shockwave that stunned even the scientists who had spent years calculating exactly what to expect. Less than a month later, atomic bombs were dropped on the Japanese cities of Hiroshima and Nagasaki, killing well over one hundred thousand people and hastening Japan’s surrender, bringing the Second World War to its end. The project’s legacy remains fiercely debated among historians to this day, weighing the lives the bombings ended against the argument that they ultimately shortened a devastating war. It also permanently reshaped global politics, launching an arms race and a nuclear age whose consequences, including the constant background risk of nuclear conflict, the world still lives with today.',
    questions: [
      {
        id: 'the-manhattan-project-q1',
        question: 'According to the passage, who led the scientific team at Los Alamos?',
        options: ['Albert Einstein', 'J. Robert Oppenheimer', 'Neil Armstrong', 'Leon Festinger'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-manhattan-project-q2',
        question: 'What was the Trinity test, per the passage?',
        options: ['A failed rocket launch', 'The first-ever detonation of a nuclear weapon', 'A submarine test', 'A radar experiment'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-manhattan-project-q3',
        question: "According to the passage, roughly how many people worked across the Manhattan Project's sites?",
        options: ['A few hundred', 'More than one hundred thousand', 'Exactly one thousand', 'Ten million'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-black-death',
    label: 'The Black Death',
    text: 'Between 1347 and 1351, a pandemic swept across Europe, the Middle East, and North Africa with a speed and lethality that left entire towns nearly empty within weeks of the disease’s arrival. Modern genetic analysis of ancient dental remains has confirmed the culprit as Yersinia pestis, a bacterium carried primarily by fleas that infested black rats, which traveled easily along the busy trade routes connecting medieval Europe to Central Asia. Contemporary accounts describe painful, swollen lymph nodes called buboes, along with fever, exhaustion, and, in many cases, death within days of the first symptoms appearing. Estimates vary, but historians generally believe the pandemic killed between a third and half of Europe’s entire population, an almost incomprehensible death toll that left deep, lasting scars on medieval society. With so much of the workforce suddenly gone, surviving laborers found themselves in an unprecedented position of leverage, and wages for peasants and skilled workers rose sharply as landowners competed for a suddenly scarce labor supply. Some historians argue this shift helped weaken the rigid feudal system that had structured European society for centuries, contributing indirectly to social and economic changes that would unfold over the following generations. The pandemic also triggered horrifying waves of scapegoating, as frightened, grieving communities blamed marginalized groups, particularly Jewish communities, for causing the disease, leading to devastating persecution across much of Europe during and after the outbreak. Religious institutions faced their own crisis of authority, since prayer and ritual so clearly failed to stop the disease’s spread, prompting some historians to trace early cracks in unquestioned religious authority partly back to this period. The Black Death was not a single, isolated event either; the same bacterium caused repeated, smaller outbreaks across Europe for centuries afterward, a grim recurring backdrop to daily life well into the early modern era.',
    questions: [
      {
        id: 'the-black-death-q1',
        question: 'According to the passage, what bacterium caused the Black Death?',
        options: ['Yersinia pestis', 'Vibrio cholerae', 'Mycobacterium tuberculosis', 'Salmonella typhi'],
        correctOptionIndex: 0,
      },
      {
        id: 'the-black-death-q2',
        question: 'Per the passage, what happened to wages for surviving laborers after the pandemic?',
        options: ['They dropped sharply', 'They rose sharply due to scarce labor', 'They stayed exactly the same', 'They were abolished entirely'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-black-death-q3',
        question: "According to the passage, roughly what fraction of Europe's population did the pandemic kill?",
        options: ['One in a hundred', 'Between a third and half', 'Nearly everyone', 'Less than one percent'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-berlin-wall',
    label: 'The Wall That Divided a City',
    text: 'In the early hours of August 13, 1961, residents of Berlin woke to find their city physically split in two, as East German soldiers and workers strung barbed wire along the border separating the Soviet-controlled eastern half of the city from the Western-controlled sectors. Within days, the barbed wire was reinforced with concrete, and over the following decades the barrier grew into an elaborate system of walls, guard towers, floodlights, and a heavily monitored no-man’s-land nicknamed the death strip. Officially described by East German authorities as an "anti-fascist protective barrier," its true purpose was to stop the steady flow of East Germans fleeing to the more prosperous, freer West, a migration that had drained the East of hundreds of thousands of skilled workers in the years before the wall went up. Families were separated overnight, sometimes with relatives on opposite sides of a single street suddenly unable to visit one another, and an estimated one hundred forty people or more died over the following decades attempting to cross the heavily fortified border. The wall became one of the twentieth century’s most potent symbols of the Cold War’s ideological divide, a physical, unmistakable line between two competing visions of society. Its unexpected collapse came on November 9, 1989, after a confused press conference announcement about relaxed travel restrictions led crowds of East Berliners to gather at checkpoints, overwhelming guards who, lacking clear orders to use force, simply opened the gates. Jubilant crowds climbed and dismantled sections of the wall by hand in the days that followed, images broadcast around the world as one of the defining moments marking the end of the Cold War. Germany formally reunified less than a year later, though economic and cultural differences between former East and West are still measurable in the country today, decades after the physical wall itself came down.',
    questions: [
      {
        id: 'the-berlin-wall-q1',
        question: 'According to the passage, when did the Berlin Wall first go up?',
        options: ['August 13, 1961', 'November 9, 1989', '1945', '1975'],
        correctOptionIndex: 0,
      },
      {
        id: 'the-berlin-wall-q2',
        question: "What was the wall's true purpose, according to the passage, despite its official description?",
        options: ['To stop the flow of East Germans fleeing to the West', 'To protect against a foreign invasion', 'To create a new trade route', 'To celebrate reunification'],
        correctOptionIndex: 0,
      },
      {
        id: 'the-berlin-wall-q3',
        question: 'According to the passage, what led crowds to gather at checkpoints on November 9, 1989?',
        options: ['A declared war', 'A confused press conference announcement about relaxed travel restrictions', 'An economic collapse', 'A scheduled celebration'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-apollo-11-landing',
    label: 'The Eagle Has Landed',
    text: 'On July 20, 1969, roughly six hundred million people, an estimated fifth of the entire world’s population at the time, watched or listened as Apollo 11’s lunar module Eagle descended toward the surface of the Moon. The landing was far more dangerous than the calm radio transmissions suggested; as the module approached the surface, an onboard computer began flashing unfamiliar alarm codes, later traced to it being overloaded with more data than it was designed to process at once, forcing mission control in Houston to make split-second decisions about whether to continue. Commander Neil Armstrong, noticing the automated guidance system was steering toward a boulder-strewn crater, took manual control of the module with fuel reserves running dangerously low, ultimately touching down safely with, according to later analysis, less than thirty seconds of fuel remaining. His first words upon stepping onto the surface, "That’s one small step for man, one giant leap for mankind," were heard live around the world, becoming one of the most recognized sentences in human history. Armstrong and fellow astronaut Buzz Aldrin spent roughly two and a half hours outside the module, collecting lunar samples, planting an American flag, and leaving behind a plaque intended to mark the achievement for any future visitors, while command module pilot Michael Collins orbited alone above them, further from another human being than anyone in history to that point. The mission fulfilled a goal President Kennedy had set less than a decade earlier, a commitment made when the technology required to achieve it did not yet fully exist. Achieving it required inventing new materials, new guidance software, and new life-support systems essentially from scratch, all coordinated across hundreds of thousands of engineers and contractors. Five more crewed missions would land on the Moon over the following three years, but none captured public imagination quite like humanity’s very first footsteps on another world.',
    questions: [
      {
        id: 'the-apollo-11-landing-q1',
        question: 'According to the passage, who took manual control of the lunar module during the risky final descent?',
        options: ['Buzz Aldrin', 'Michael Collins', 'Neil Armstrong', 'Mission Control in Houston'],
        correctOptionIndex: 2,
      },
      {
        id: 'the-apollo-11-landing-q2',
        question: 'Per the passage, roughly how much fuel remained when Eagle touched down?',
        options: ["Several hours' worth", "Less than thirty seconds' worth", 'A full tank', 'None — it ran out mid-landing'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-apollo-11-landing-q3',
        question: 'According to the passage, what was Michael Collins doing during the moon landing?',
        options: ['Walking on the lunar surface', 'Orbiting alone above the Moon in the command module', 'Monitoring from Earth', 'Piloting the lunar module with Armstrong'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-printing-press-revolution',
    label: 'The Machine That Rewired the World',
    text: 'Around 1440, a German goldsmith named Johannes Gutenberg combined several existing technologies, oil-based ink, a wooden press adapted from wine and olive presses, and durable, reusable metal type, into a printing system that could reproduce written text far faster and more cheaply than any method that came before it. Prior to Gutenberg, books were copied laboriously by hand, often by monks working for months or years on a single volume, meaning books were rare, expensive, and largely confined to wealthy institutions and individuals. Movable type changed the underlying economics of information almost overnight; a single press could produce hundreds of identical copies of a text in the time it once took to copy a single page by hand. Within just fifty years of Gutenberg’s press, an estimated twenty million books had been printed across Europe, an explosive increase that historians consider one of the most consequential technological shifts in human history. Ideas that once traveled slowly through scarce hand-copied manuscripts could now spread rapidly and cheaply across borders, fueling the Renaissance, accelerating scientific collaboration, and giving ordinary literate people direct access to texts previously reserved for religious or academic elites. The printing press also played a central role in the Protestant Reformation, allowing Martin Luther’s writings to spread across Germany and beyond far faster than any authority could realistically suppress them, fundamentally altering the religious landscape of Europe within a single generation. Standardized, widely available texts additionally helped stabilize spelling and grammar across regional dialects, gradually shaping the more uniform national languages that would later underpin modern nation-states. Some historians argue that no single invention did more to accelerate the pace of human intellectual progress, since it did not just spread existing knowledge faster, it fundamentally changed how quickly new ideas could build on one another across an entire continent.',
    questions: [
      {
        id: 'the-printing-press-revolution-q1',
        question: 'According to the passage, who combined existing technologies into the printing press around 1440?',
        options: ['Martin Luther', 'Johannes Gutenberg', 'Leon Festinger', 'Plato'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-printing-press-revolution-q2',
        question: "Per the passage, roughly how many books had been printed across Europe within fifty years of Gutenberg's press?",
        options: ['A few thousand', 'An estimated twenty million', 'Under one hundred', 'Half a million'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-printing-press-revolution-q3',
        question: 'According to the passage, what religious movement did the printing press help spread rapidly?',
        options: ['The Protestant Reformation', 'Ancient Roman paganism', "Early Christianity's founding", 'Buddhism in Europe'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'the-ship-of-theseus',
    label: 'The Ship of Theseus',
    text: 'According to ancient legend, the ship that carried the hero Theseus safely home was preserved by the Athenians for centuries afterward, with each rotting plank replaced over time by a fresh one as the old wood decayed. Eventually, every single original plank had been replaced at least once, leaving the philosopher Plutarch to ask a deceptively simple question: was the fully repaired ship still, genuinely, the same ship that Theseus had originally sailed? The puzzle, now known as the Ship of Theseus, has occupied philosophers for roughly two thousand years, because it strikes directly at a question that seems obvious until examined closely: what actually makes an object, or a person, the same thing over time despite constant physical change. A later variation sharpens the puzzle further: imagine someone collected every original discarded plank and reassembled them into a second ship. Which vessel, if either, deserves to be called the true original, the continuously repaired ship or the one rebuilt entirely from its original material? Philosophers have proposed several competing answers. Some argue identity depends on continuity of form and function rather than continuity of specific matter, meaning the repaired ship remains the "real" one because it never stopped serving as Theseus’s ship throughout the process. Others argue identity depends on the actual physical material, favoring the reassembled ship built from the true original planks. Still others reject the question’s premise entirely, suggesting that strict, unchanging identity over time is something human intuition simply craves but reality does not actually provide. The puzzle echoes directly in questions about human identity, since nearly every cell and much of the memory a person carries changes measurably over a typical lifetime, leaving philosophers to ask, in essentially the same spirit, what it truly means to remain the same person across an entire life.',
    questions: [
      {
        id: 'the-ship-of-theseus-q1',
        question: 'According to the passage, who first posed the question about the fully repaired ship?',
        options: ['Plato', 'Plutarch', 'Sartre', 'Aristotle'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-ship-of-theseus-q2',
        question: 'What does the later variation of the puzzle add, per the passage?',
        options: ['A second ship rebuilt entirely from the original discarded planks', 'A talking ship', 'A shipwreck at sea', "A second philosopher's competing legend"],
        correctOptionIndex: 0,
      },
      {
        id: 'the-ship-of-theseus-q3',
        question: 'According to the passage, what do some philosophers argue identity depends on, rather than exact matter?',
        options: ['Continuity of form and function', "The ship's color", 'Its country of origin', 'Its market value'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'the-trolley-problem',
    label: 'The Trolley Problem',
    text: 'Imagine a runaway trolley speeding down a track toward five people who will certainly be killed unless something changes course. You are standing beside a lever that, if pulled, diverts the trolley onto a side track, where it will kill only one person instead of five. Most people, when asked, say they would pull the lever, reasoning that saving five lives at the cost of one is the better outcome even though pulling the lever makes you directly responsible for that one death. Philosopher Philippa Foot introduced this scenario in 1967 to probe a genuine tension within moral reasoning, and a later variation by Judith Jarvis Thomson sharpened the puzzle considerably. In the second version, the only way to stop the trolley from killing five people is to push a large stranger off a bridge directly into its path, using his body to physically block the trolley. The outcome in terms of raw numbers is mathematically identical, one death prevents five, yet most people who would readily pull the lever recoil strongly from pushing the stranger, even though a strict, outcome-focused calculation treats both actions as equivalent. This gap reveals something important about how moral judgment actually works in most people: intent, physical directness, and the difference between an action and an omission all seem to matter deeply, not just the final numerical outcome. Philosophers use the trolley problem and its many variations as a diagnostic tool, testing where different ethical frameworks agree and where they sharply diverge, particularly between consequentialist reasoning, which judges actions purely by their outcomes, and deontological reasoning, which holds that certain actions remain wrong regardless of the good they might produce. The scenario has taken on new, unexpectedly literal relevance in recent years, as engineers designing self-driving cars must now translate exactly this kind of split-second moral tradeoff into concrete, pre-programmed rules a machine will actually follow.',
    questions: [
      {
        id: 'the-trolley-problem-q1',
        question: 'Who introduced the original trolley scenario in 1967, according to the passage?',
        options: ['Judith Jarvis Thomson', 'Philippa Foot', 'Jean-Paul Sartre', 'Plato'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-trolley-problem-q2',
        question: 'In the bridge variation, what must be done to stop the trolley, per the passage?',
        options: ['Pull a lever', 'Push a large stranger off a bridge into its path', 'Call for help', 'Do nothing at all'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-trolley-problem-q3',
        question: 'According to the passage, what does the gap between the two scenarios reveal about moral judgment?',
        options: ['People only care about final numerical outcomes', 'Intent and physical directness matter deeply, not just outcomes', 'Most people refuse to answer either version', 'The two scenarios are judged identically by everyone'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'platos-allegory-of-the-cave',
    label: "Plato's Cave",
    text: 'In one of philosophy’s most enduring images, Plato describes a group of prisoners who have lived their entire lives chained inside a dark cave, facing a blank wall, unable to turn their heads to look in any other direction. Behind them burns a fire, and between the fire and the prisoners, unseen figures carry objects whose shadows fall onto the wall the prisoners are forced to watch. Having never seen anything else, the prisoners naturally mistake these flickering shadows for the whole of reality itself, naming them, discussing them, and treating them as the complete and genuine truth of the world. Plato then imagines one prisoner freed and dragged, painfully and reluctantly, out of the cave into blinding daylight. At first overwhelmed and disoriented, the freed prisoner gradually adjusts, eventually seeing the real objects that had only ever cast shadows before, and finally the sun itself, the ultimate source of all the light and objects he had previously mistaken for the whole of reality. Plato uses this ascent to represent the philosopher’s own difficult journey toward genuine understanding, moving from comfortable but mistaken appearances toward a far more difficult, more demanding, and ultimately more truthful grasp of reality. The allegory’s final, sharper twist comes when the freed prisoner returns to the cave to share what he has learned. Rather than welcoming this new understanding, the prisoners still chained inside mock him, insist their shadows are the only real world, and may even turn violently against him for suggesting otherwise. Plato intended this as a warning about how deeply uncomfortable, and how often unwelcome, genuine insight can be to those who have built an entire understanding of the world around comfortable illusions. More than two thousand years later, the allegory remains a standard reference point for discussing perception, illusion, education, and the frequently painful cost of confronting a deeper truth.',
    questions: [
      {
        id: 'platos-allegory-of-the-cave-q1',
        question: 'According to the passage, what do the prisoners in the cave mistake for reality?',
        options: ['The fire itself', 'Shadows cast on the wall', 'Their own reflections', 'The voices of the guards'],
        correctOptionIndex: 1,
      },
      {
        id: 'platos-allegory-of-the-cave-q2',
        question: 'What happens when the freed prisoner returns to share what he has learned, per the passage?',
        options: ['The other prisoners celebrate him', 'The other prisoners mock him and may turn against him', 'He is immediately believed by everyone', 'He forgets what he learned'],
        correctOptionIndex: 1,
      },
      {
        id: 'platos-allegory-of-the-cave-q3',
        question: 'According to the passage, what does the freed prisoner eventually see as the ultimate source of light?',
        options: ['A torch', 'The sun', 'A mirror', 'The cave wall'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'the-existentialist-leap',
    label: 'The Weight of Absolute Freedom',
    text: 'Existentialist philosophers, most prominently Jean-Paul Sartre, built their entire framework around a single, unsettling starting point: human beings exist first, without any built-in purpose or fixed nature, and only afterward define themselves through the choices they actually make. Sartre summarized this with the phrase "existence precedes essence," directly rejecting the older idea that humans, like manufactured objects, are created according to some predetermined design they are simply meant to fulfill. Without a predetermined nature to fall back on, and without appeal to a divine plan Sartre believed did not exist, human beings are, in his framework, radically and inescapably free, responsible for inventing their own values and their own meaning entirely from scratch. This freedom, rather than feeling liberating, often produces what Sartre called anguish, the dizzying, uncomfortable weight of realizing that no external authority can ever validate a choice or relieve a person of full responsibility for having made it. Many people, Sartre argued, respond to this discomfort through what he called bad faith, a kind of self-deception in which a person pretends their choices were forced by circumstance, role, or nature, denying their own underlying freedom in order to avoid the anxiety that freedom brings. A waiter who behaves as though being a waiter is his entire fixed identity, rather than a role he continues choosing moment to moment, is, in Sartre’s famous example, quietly practicing exactly this kind of self-deception. Existentialism does not offer comfort so much as a demanding kind of honesty, insisting that meaning is never discovered ready-made in the world but must be actively created through committed action and genuine choice. Critics have argued the philosophy can feel bleak when taken to its logical extreme, but its advocates counter that fully accepting this radical freedom, rather than fleeing from it, is precisely what allows a person to live authentically rather than merely following a script written by someone else.',
    questions: [
      {
        id: 'the-existentialist-leap-q1',
        question: 'According to the passage, what phrase did Sartre use to summarize his starting point?',
        options: ["'Existence precedes essence'", "'I think, therefore I am'", "'The unexamined life is not worth living'", "'Knowledge is power'"],
        correctOptionIndex: 0,
      },
      {
        id: 'the-existentialist-leap-q2',
        question: 'What did Sartre call the self-deception where people pretend their choices were forced by circumstance?',
        options: ['Cognitive dissonance', 'Bad faith', 'The bystander effect', 'Impostor syndrome'],
        correctOptionIndex: 1,
      },
      {
        id: 'the-existentialist-leap-q3',
        question: "According to the passage, what does Sartre's philosophy insist meaning must be?",
        options: ['Discovered ready-made in the world', 'Actively created through committed action and genuine choice', 'Assigned by religious authority', 'Fixed and unchangeable from birth'],
        correctOptionIndex: 1,
      },
    ],
  },
] as const

export const TOTAL_PARAGRAPH_READING_MODE_CATEGORIES = PARAGRAPH_READING_MODE_CATEGORIES.length

// Word-level ReadingUnits, split from the category's one continuous
// passage — preserves this mode's own established pacing convention (the
// engine paces word-by-word, unchanged from the pre-overhaul version), now
// consumed by a continuous streaming Canvas instead of a static block with
// a hopping highlight.
export function buildUnitsForCategory(category: ParagraphReadingModeCategory): readonly ReadingUnit[] {
  const words = category.text.trim().split(/\s+/).filter(Boolean)
  return words.map((text, index) => ({ id: `${category.id}-word-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-paragraph-reading-mode-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses (Vertical Chunk Sliding, Phrase Reading Mode,
// Sentence Reading Mode, Vertical Word Reading) — client-only, called only
// from a useEffect in the Experience orchestrator, never a lazy useState
// initializer, so the server-rendered 'settings' phase and the client's
// first paint always match before this ever runs.
export function pickSessionCategory(): ParagraphReadingModeCategory {
  const categories = PARAGRAPH_READING_MODE_CATEGORIES
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

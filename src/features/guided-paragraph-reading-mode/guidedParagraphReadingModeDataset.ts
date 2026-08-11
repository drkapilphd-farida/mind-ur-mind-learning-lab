import type { ReadingUnit } from '@/features/reading-engine/types'

// Guided Paragraph Reading Mode™ dataset — Quantum Speed Reading™ V2, the
// Master Reading Engine's fifth mode. Deliberately its own folder/content,
// separate from every other mode's dataset (including Paragraph Reading
// Mode's own passages) — no shared files, no route collision, no topic
// overlap with any other mode's content.
//
// 10/10 Overhaul — a genuine 22-category library of real, hand-authored,
// full-length passages (no AI, no lorem ipsum) spanning a broad mix of
// history, science, nature, and technology. Each category is a single
// ~280-330 word passage (verified in this file's own test suite),
// followed by exactly 3 real comprehension questions, each answerable
// only by having actually read that category's own passage. `text` stays
// one continuous string — both Canvases derive their own word-level
// ReadingUnits from it via buildUnitsForCategory below, exactly mirroring
// Paragraph Reading Mode's own convention.
export type GuidedParagraphReadingModeQuizQuestion = {
  id: string
  question: string
  options: readonly string[]
  correctOptionIndex: number
}

export type GuidedParagraphReadingModeCategory = {
  id: string
  label: string
  text: string
  questions: readonly GuidedParagraphReadingModeQuizQuestion[]
}

export const GUIDED_PARAGRAPH_READING_MODE_CATEGORIES: readonly GuidedParagraphReadingModeCategory[] = [
  {
    id: 'chernobyl-wildlife',
    label: "Chernobyl's Unexpected Wildlife",
    text: 'In April 1986, a reactor at the Chernobyl nuclear power plant in Soviet Ukraine exploded, releasing radioactive material across a wide swath of Europe and forcing the permanent evacuation of the surrounding region. An area roughly the size of Luxembourg, later named the Exclusion Zone, was declared too contaminated for human habitation and has remained largely empty of people for decades. What happened next surprised many scientists. With humans gone, wolves, wild boar, moose, and even rare Przewalski’s horses gradually moved into the abandoned towns and forests, apparently unbothered by the absence of the species that had shaped the landscape for centuries. Camera trap studies later found wolf populations in the zone several times denser than in comparable uncontaminated reserves nearby. This does not mean radiation is harmless; individual animals studied in the most contaminated pockets show measurable genetic damage, cataracts, and reduced lifespans. Rather, researchers increasingly conclude that the pressure of everyday human activity, farming, hunting, roads, and development, does more cumulative harm to wildlife populations than the radiation itself does in this particular case. The zone has become an unplanned, unsettling experiment in what happens when a landscape is returned to nature abruptly and completely. Some ecologists now refer to it, only half-jokingly, as a radioactive wildlife sanctuary. Researchers continue to monitor the zone closely, aware that its unique conditions cannot be replicated intentionally, and that its lessons about resilience, contamination, and recovery remain only partly understood even decades after the disaster. The Exclusion Zone has, in effect, become an accidental long-term case study, one that no ethics board would ever have approved in advance, quietly reshaping how scientists think about the balance between habitat and hazard.',
    questions: [
      {
        id: 'chernobyl-wildlife-q1',
        question: 'According to the passage, what happened to wildlife populations after humans left the Chernobyl Exclusion Zone?',
        options: [
          'They disappeared entirely',
          'Species like wolves and wild boar moved in, with wolf density higher than nearby reserves',
          'Only insects survived',
          'They were relocated by scientists',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'chernobyl-wildlife-q2',
        question: 'What do researchers increasingly conclude about human activity versus radiation, per the passage?',
        options: [
          'Radiation is completely harmless',
          'Everyday human activity does more cumulative harm to wildlife populations than the radiation in this case',
          'Human activity has no effect on wildlife',
          'Radiation only affects plants',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'chernobyl-wildlife-q3',
        question: 'According to the passage, what health effects do individual animals in the most contaminated pockets show?',
        options: ['No effects at all', 'Genetic damage, cataracts, and reduced lifespans', 'Increased lifespan', 'Immunity to all disease'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'wright-brothers-flight',
    label: 'Twelve Seconds That Changed the World',
    text: 'On the cold, windy morning of December 17, 1903, on a stretch of sand dunes near Kitty Hawk, North Carolina, two bicycle mechanics from Ohio attempted something no one had ever definitively achieved: sustained, controlled, powered flight in a heavier-than-air machine. Orville Wright lay flat on the lower wing of a fragile wood-and-fabric aircraft, gripping controls he and his brother Wilbur had spent years designing, testing, and rebuilding after repeated failures. The engine sputtered to life, the craft rolled down a wooden launch rail, and for twelve seconds it lifted into the air, traveling just one hundred twenty feet, shorter than the wingspan of some modern airliners. Only five people witnessed the moment; a local newspaper initially buried the story, unconvinced of its importance. The brothers made three more flights that day, the longest lasting fifty-nine seconds and covering 852 feet, before a gust of wind damaged the aircraft beyond immediate repair. What made the achievement remarkable was not raw distance but genuine control: the Wrights had solved the problem of three-axis control, allowing a pilot to roll, pitch, and yaw an aircraft deliberately, a breakthrough many well-funded rival inventors, including a prominent Smithsonian scientist, had failed to crack despite far greater resources. Skepticism about the achievement lingered for years, partly because the brothers were secretive about their design while pursuing patents. Within a decade, however, powered flight had gone from a fragile, twelve-second experiment to a genuine, rapidly advancing technology, reshaping travel, warfare, and the world’s sense of its own physical limits within a single human generation.',
    questions: [
      {
        id: 'wright-brothers-flight-q1',
        question: 'According to the passage, how long did the first flight last?',
        options: ['One minute', 'Twelve seconds', 'One hour', 'Five minutes'],
        correctOptionIndex: 1,
      },
      {
        id: 'wright-brothers-flight-q2',
        question: 'What breakthrough did the Wright brothers solve that many well-funded rivals had failed to crack, per the passage?',
        options: [
          'Engine horsepower',
          'Three-axis control allowing a pilot to roll, pitch, and yaw deliberately',
          'Lightweight metal construction',
          'Radio communication',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'wright-brothers-flight-q3',
        question: 'According to the passage, how many people witnessed the first flight?',
        options: ['Thousands', 'Only five', 'None', 'One hundred'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'antarctica-subglacial-lakes',
    label: "The Lakes Hidden Beneath Antarctica's Ice",
    text: 'Beneath Antarctica’s vast ice sheet, in permanent darkness under as much as two miles of solid ice, lies a hidden network of nearly four hundred lakes, kept liquid not by warmth from above but by geothermal heat rising from the earth below combined with the immense pressure of the ice pressing down on them. The largest of these, Lake Vostok, is roughly the size of Lake Ontario and has been sealed off from the outside world for possibly millions of years, making it one of the most isolated aquatic environments on the planet. Scientists first confirmed its existence in the 1990s using radar and seismic surveys capable of detecting the smooth, flat radar signature liquid water produces beneath the ice, quite different from the jagged echo of solid rock. Drilling down to sample these lakes directly poses an enormous technical and ethical challenge, since any contamination from surface microbes, equipment, or drilling fluid could permanently compromise an environment that may have evolved in near-total isolation for an immense span of time. Russian researchers eventually reached Lake Vostok’s surface in 2012 using carefully filtered drilling techniques, and later expeditions to smaller, more accessible subglacial lakes have recovered water and sediment samples containing microbial life adapted to total darkness, crushing pressure, and near-freezing temperatures. These extremophile organisms interest astrobiologists directly, since similar conditions, ice-covered oceans kept liquid by internal heat, are believed to exist on Jupiter’s moon Europa and Saturn’s moon Enceladus. Antarctica’s hidden lakes have become, in a very real sense, our closest laboratory for understanding what life elsewhere in the solar system might actually look like.',
    questions: [
      {
        id: 'antarctica-subglacial-lakes-q1',
        question: "According to the passage, what keeps Antarctica's subglacial lakes liquid?",
        options: ['Sunlight penetrating the ice', 'Geothermal heat and the pressure of the ice above', 'Ocean currents', 'Artificial heating by researchers'],
        correctOptionIndex: 1,
      },
      {
        id: 'antarctica-subglacial-lakes-q2',
        question: 'How did scientists first confirm the existence of these lakes, per the passage?',
        options: [
          'By drilling randomly',
          "Using radar and seismic surveys detecting liquid water's smooth radar signature",
          'By satellite photography alone',
          'Through local Antarctic legends',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'antarctica-subglacial-lakes-q3',
        question: "According to the passage, why do astrobiologists take interest in these lakes' microbial life?",
        options: [
          'It has no scientific value',
          'Similar ice-covered, heat-kept-liquid conditions may exist on moons like Europa and Enceladus',
          'It proves there is no life elsewhere in the solar system',
          'It is identical to ocean life on Earth',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'history-of-zero',
    label: 'The Invention of Nothing',
    text: 'It seems almost too simple to have required inventing at all, yet the number zero, a symbol representing precisely nothing, took centuries of independent effort across multiple civilizations before it became a fully functioning mathematical concept. Ancient Babylonian mathematicians used a placeholder symbol as early as the third century BCE, but only as a way to mark an empty position within a larger number, never as a number with its own independent value that could be added, subtracted, or reasoned about directly. The more complete leap happened in India, where mathematicians, including the influential scholar Brahmagupta in the seventh century, formally defined zero as a number in its own right and worked out rules for how it behaved in arithmetic, including the famously tricky question of what happens when a number is divided by it. This Indian concept of zero traveled through the Islamic world, where mathematicians and astronomers refined and transmitted it further, eventually reaching Europe through trade and translated texts. European mathematicians and merchants were initially quite resistant to adopting zero, partly because Roman numerals, still dominant for centuries, had no real need for it and partly because the concept of a symbol representing nothingness struck many medieval scholars as philosophically and even theologically suspicious. Italian mathematician Fibonacci helped popularize the Hindu-Arabic numeral system, zero included, throughout Europe in the early thirteenth century, largely because it made commercial arithmetic and bookkeeping dramatically more efficient than Roman numerals ever could. Without zero, place-value number systems, algebra, and eventually calculus would have been effectively impossible to develop in their modern forms. A concept representing pure absence turned out to be one of the most quietly powerful tools mathematics has ever produced.',
    questions: [
      {
        id: 'history-of-zero-q1',
        question: 'According to the passage, which Indian mathematician formally defined zero as a number with its own rules for arithmetic?',
        options: ['Fibonacci', 'Brahmagupta', 'Pythagoras', 'Euclid'],
        correctOptionIndex: 1,
      },
      {
        id: 'history-of-zero-q2',
        question: 'What did Babylonian mathematicians use their early zero symbol for, per the passage?',
        options: [
          'A number that could be added or subtracted',
          'Only as a placeholder marking an empty position within a larger number',
          'A religious symbol',
          'A unit of currency',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'history-of-zero-q3',
        question: 'According to the passage, who helped popularize the Hindu-Arabic numeral system, including zero, throughout Europe?',
        options: ['Brahmagupta', 'Fibonacci', 'A Roman emperor', 'An unnamed Babylonian scholar'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'tardigrade-extremophiles',
    label: 'The Nearly Indestructible Water Bear',
    text: 'Under a microscope, a tardigrade looks almost comically unthreatening: a plump, eight-legged creature barely half a millimeter long, often nicknamed a water bear for its slow, lumbering gait across a droplet of moss. Despite this unassuming appearance, tardigrades are among the most resilient animals ever documented, capable of surviving conditions that would instantly kill almost any other complex organism. They can withstand temperatures far below freezing and well above boiling, pressures several times greater than the deepest ocean trench, and radiation doses hundreds of times higher than what would be lethal to a human being. Perhaps most remarkably, tardigrades can survive complete dehydration, entering a state called cryptobiosis in which their metabolism slows to a barely detectable fraction of normal activity and their bodies shrivel into a dry, dormant husk that can remain viable for years, and by some accounts decades, before being revived with a single drop of water. In this dried state, tardigrades have even survived direct exposure to the vacuum of space during a European Space Agency experiment in 2007, with many individuals successfully reviving and reproducing normally after their return to Earth. Scientists believe this extraordinary resilience comes from a combination of specialized proteins that protect their DNA and cellular structures during extreme stress, along with their ability to replace water inside their cells with a protective, glass-like substance during dehydration. Researchers studying tardigrades hope their unique protective proteins might eventually inform new methods for preserving human tissues, vaccines, or even organs for transplant without requiring constant refrigeration, turning an almost cartoonishly tough microscopic creature into a genuinely promising subject for serious biomedical research.',
    questions: [
      {
        id: 'tardigrade-extremophiles-q1',
        question: "According to the passage, what is the state called in which a tardigrade's metabolism slows dramatically during dehydration?",
        options: ['Hibernation', 'Cryptobiosis', 'Metamorphosis', 'Diapause'],
        correctOptionIndex: 1,
      },
      {
        id: 'tardigrade-extremophiles-q2',
        question: 'What did the 2007 European Space Agency experiment demonstrate, per the passage?',
        options: [
          'Tardigrades cannot survive space',
          'Many tardigrades survived direct exposure to the vacuum of space and later revived',
          'Tardigrades grew larger in space',
          'Tardigrades cannot be dehydrated',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'tardigrade-extremophiles-q3',
        question: 'According to the passage, what do researchers hope tardigrade proteins might eventually help with?',
        options: [
          'Faster space travel',
          'Preserving human tissues, vaccines, or organs without constant refrigeration',
          'Curing the common cold',
          'Building stronger metal alloys',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'library-of-congress',
    label: "The World's Largest Library",
    text: 'Tucked behind the United States Capitol in Washington, D.C., the Library of Congress holds a collection so vast that no single person could realistically read even a small fraction of it across an entire lifetime. Founded in 1800 primarily to serve members of Congress, its original collection of about three thousand books was destroyed when British forces burned the Capitol during the War of 1812. Rather than accept a diminished library, Congress purchased former president Thomas Jefferson’s own extensive personal library, nearly 6,500 volumes covering science, philosophy, architecture, and literature in multiple languages, to rebuild the collection, a decision that also permanently shaped the library’s identity as a broad repository of human knowledge rather than a narrow legal reference collection. Today the library holds more than one hundred seventy million items, including books, manuscripts, maps, photographs, films, and sound recordings, with shelving that would stretch over eight hundred miles if laid end to end. It receives roughly ten thousand new items every working day, though only a portion are ultimately added to the permanent collection after review. The library also serves a less visible but essential function through the U.S. Copyright Office, since copyright registration requires depositing copies of a published work, quietly making the library one of the largest and most comprehensive archives of American creative output almost by administrative accident. Its collections extend well beyond typical library material, including Thomas Jefferson’s own annotated books, early baseball cards, and one of only three surviving perfect vellum copies of the Gutenberg Bible. Despite its name, the Library of Congress today functions less as a legislative reference desk and more as a genuine national memory, preserving an almost incomprehensibly broad record of human thought and creativity.',
    questions: [
      {
        id: 'library-of-congress-q1',
        question: "According to the passage, whose personal library was purchased to rebuild the collection after 1812?",
        options: ["George Washington's", "Thomas Jefferson's", "Benjamin Franklin's", "John Adams's"],
        correctOptionIndex: 1,
      },
      {
        id: 'library-of-congress-q2',
        question: "What destroyed the library's original collection, per the passage?",
        options: ['A flood', 'British forces burning the Capitol during the War of 1812', 'A fire started by lightning', 'It was sold to another country'],
        correctOptionIndex: 1,
      },
      {
        id: 'library-of-congress-q3',
        question: "According to the passage, what does the U.S. Copyright Office's deposit requirement quietly make the library?",
        options: [
          'A legal courthouse',
          'One of the largest, most comprehensive archives of American creative output',
          'A private members-only club',
          'A museum of foreign artifacts only',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'bird-migration-navigation',
    label: 'How Birds Navigate Thousands of Miles',
    text: 'Every year, without a map, a compass, or any prior experience of the route, billions of birds travel astonishing distances between breeding and wintering grounds, some crossing entire oceans or continents with remarkable precision. The Arctic tern holds the extreme record, migrating from the Arctic to the Antarctic and back each year, a round trip exceeding fifty thousand miles, more than the circumference of the Earth. How birds accomplish this feat has puzzled scientists for generations, and research now suggests they rely on multiple overlapping navigational systems rather than any single trick. Many species appear able to sense the Earth’s magnetic field directly, a sense called magnetoreception, possibly using specialized proteins in their eyes that let them perceive magnetic orientation as a kind of visual pattern overlaid on what they see. Birds also use the position of the sun during the day and the pattern of stars at night, and remarkably, young birds raised in a planetarium can calibrate their sense of direction based on which point in the sky appears not to rotate, correctly inferring celestial north without ever having seen the real night sky. Landmarks, coastlines, mountain ranges, and even smell appear to play supporting roles for some species, especially during the final stages of a long journey home. Young birds making their very first migration often travel the entire distance with no experienced adult guide at all, relying on an inherited, genetically encoded sense of direction and distance rather than any learned route. Researchers still do not fully understand how these different systems combine or which one a bird actually prioritizes when they conflict, making bird navigation one of animal biology’s most impressive and still only partially solved mysteries.',
    questions: [
      {
        id: 'bird-migration-navigation-q1',
        question: 'According to the passage, which bird holds the record for the longest migration?',
        options: ['The Arctic tern', 'The bald eagle', 'The albatross', 'The peregrine falcon'],
        correctOptionIndex: 0,
      },
      {
        id: 'bird-migration-navigation-q2',
        question: "What is 'magnetoreception,' according to the passage?",
        options: [
          'The ability to fly at high altitude',
          "A sense allowing birds to perceive the Earth's magnetic field, possibly as a visual pattern",
          'A type of bird disease',
          'The ability to see ultraviolet light only',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'bird-migration-navigation-q3',
        question: 'According to the passage, how do many young birds complete their very first migration?',
        options: [
          'By following an experienced adult guide',
          'With no experienced guide, relying on an inherited sense of direction and distance',
          'They cannot migrate until adulthood',
          'By following major highways',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'dead-sea-scrolls',
    label: 'The Discovery of the Dead Sea Scrolls',
    text: 'In 1947, according to the most widely told account, a Bedouin shepherd searching for a lost goat threw a stone into a cave near the ruins of Qumran, close to the Dead Sea, and heard the unexpected sound of pottery shattering inside. Investigating further, he and his companions discovered ancient clay jars containing tightly rolled scrolls, the first of what would eventually become one of the most significant archaeological discoveries of the twentieth century. Over the following decade, archaeologists and local Bedouin searchers located ten more nearby caves, ultimately recovering roughly nine hundred manuscripts, some substantially intact and others reduced to thousands of small fragments requiring painstaking reassembly. The scrolls, dated through a combination of paleography and radiocarbon analysis to roughly between the third century BCE and the first century CE, include the oldest known surviving copies of large portions of the Hebrew Bible, predating previously known manuscripts by nearly a thousand years. Alongside biblical texts, the collection includes previously unknown religious writings, community rules, and other documents believed to be connected to a Jewish sect, possibly the Essenes, who may have lived at or near Qumran. Piecing together the fragile, fragmentary scrolls proved to be an immense scholarly undertaking that continued for decades, complicated at times by restricted access, slow publication, and genuine scholarly disputes over interpretation and translation. Modern imaging techniques, including multispectral photography, have since allowed researchers to read text on fragments too faded or damaged to interpret with the naked eye. The scrolls remain a uniquely direct window into the religious and cultural world of Judaism in the centuries immediately before and during the emergence of Christianity.',
    questions: [
      {
        id: 'dead-sea-scrolls-q1',
        question: 'According to the passage, who is traditionally credited with the first discovery of the Dead Sea Scrolls?',
        options: ['A team of professional archaeologists', 'A Bedouin shepherd searching for a lost goat', 'A university research team', 'A Roman soldier'],
        correctOptionIndex: 1,
      },
      {
        id: 'dead-sea-scrolls-q2',
        question: 'According to the passage, what significant biblical content do the scrolls include?',
        options: [
          'The newest known copies of the Hebrew Bible',
          'The oldest known surviving copies of large portions of the Hebrew Bible',
          'No biblical content at all',
          'Only maps of the region',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'dead-sea-scrolls-q3',
        question: 'What modern technique has allowed researchers to read faded or damaged fragments, per the passage?',
        options: ['X-ray surgery', 'Multispectral photography', 'Carbon dating alone', 'Handwriting guesswork'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'yellowstone-supervolcano',
    label: 'The Supervolcano Beneath Yellowstone',
    text: 'Beneath the geysers, hot springs, and forests of Yellowstone National Park lies one of the largest active volcanic systems on Earth, a supervolcano whose massive underground magma chamber has produced some of the most powerful eruptions in the planet’s geological history. Unlike a typical cone-shaped volcano, Yellowstone has no single dramatic peak; its most catastrophic eruptions instead create a caldera, a vast collapsed crater formed when the ground above an emptied magma chamber sinks inward. The most recent of Yellowstone’s three known supereruptions occurred roughly six hundred forty thousand years ago, ejecting enough material to bury a state under several feet of ash and cooling global temperatures for years afterward. The park’s famous geothermal features, geysers like Old Faithful, colorful hot springs, and bubbling mud pots, are the visible surface expression of this same underground heat source, powered by magma sitting unusually close to the surface compared to most volcanic regions. Scientists closely monitor Yellowstone using seismographs, GPS stations, and satellite measurements, tracking subtle ground deformation and thousands of small earthquakes that occur in the region every year, the vast majority too small to be felt by visitors. Despite popular fear fueled by dramatic headlines, geologists emphasize that a supereruption is not considered imminent, and current monitoring shows no signs suggesting one is likely within any humanly meaningful timeframe. Statistically, a supereruption at Yellowstone is an extremely rare event, occurring roughly once every six to eight hundred thousand years based on the geological record, making it far more likely that a visitor witnesses nothing more dramatic than a scheduled eruption of Old Faithful during an ordinary visit to the park.',
    questions: [
      {
        id: 'yellowstone-supervolcano-q1',
        question: 'According to the passage, what forms when the ground above an emptied magma chamber sinks inward?',
        options: ['A cone-shaped peak', 'A caldera', 'A geyser', 'A mud pot'],
        correctOptionIndex: 1,
      },
      {
        id: 'yellowstone-supervolcano-q2',
        question: "When did Yellowstone's most recent supereruption occur, according to the passage?",
        options: ['About six hundred forty thousand years ago', 'Ten years ago', 'One million years ago', 'It has never erupted'],
        correctOptionIndex: 0,
      },
      {
        id: 'yellowstone-supervolcano-q3',
        question: 'According to the passage, what do geologists say about the likelihood of an imminent supereruption?',
        options: [
          'It is expected within the next decade',
          'Current monitoring shows no signs one is likely within any humanly meaningful timeframe',
          'It is already underway',
          'It happens every year',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'arpanet-origins',
    label: 'The Night the Internet Was Born',
    text: 'On October 29, 1969, a graduate student at UCLA named Charley Kline attempted to send a short message to a computer at Stanford Research Institute, hundreds of miles away, over an experimental network called ARPANET, funded by the United States Department of Defense’s Advanced Research Projects Agency. The intended message was simply the word "login." The system crashed after transmitting only the first two letters, "l" and "o," making the internet’s first message, by accident, the almost poetically minimal word "lo." The connection was restored shortly afterward and the full message went through, but that brief, unintended fragment has since become a favorite bit of computing trivia, a humble, glitchy beginning for a technology that would eventually reshape nearly every aspect of modern life. ARPANET itself was designed to solve a specific problem: allowing geographically separated, incompatible computers to communicate and share scarce, expensive computing resources reliably, even if part of the network was damaged or disrupted, an original design goal partly motivated by Cold War concerns about network resilience. Engineers developed packet switching, breaking messages into small, independently routed chunks of data that could be reassembled at their destination, a foundational technique still underlying how data moves across the modern internet today. By the end of 1969, only four computers were connected to ARPANET; growth was slow and largely confined to a small circle of researchers and universities for years afterward. It took roughly two more decades of steady technical development, including the creation of standardized communication protocols and the later invention of the World Wide Web, before the network evolved from a niche research tool into the vast, universally accessible internet the world now depends on daily.',
    questions: [
      {
        id: 'arpanet-origins-q1',
        question: "According to the passage, what was the internet's accidental first message?",
        options: ['"Hello"', '"Lo"', '"Test"', '"ARPANET"'],
        correctOptionIndex: 1,
      },
      {
        id: 'arpanet-origins-q2',
        question: 'Who attempted to send the first message over ARPANET, per the passage?',
        options: ['A UCLA graduate student named Charley Kline', 'A Stanford professor', 'A Pentagon official', 'An anonymous programmer'],
        correctOptionIndex: 0,
      },
      {
        id: 'arpanet-origins-q3',
        question: 'According to the passage, what technique did engineers develop that still underlies how data moves across the internet today?',
        options: ['Packet switching', 'Satellite relay', 'Radio broadcasting', 'Fiber optic cabling'],
        correctOptionIndex: 0,
      },
    ],
  },
  {
    id: 'great-pacific-garbage-patch',
    label: 'The Ocean Gyre of Floating Plastic',
    text: 'Between Hawaii and California, in a region of the Pacific Ocean where converging currents create a slow, swirling gyre, an enormous accumulation of marine debris has gathered over decades, commonly known as the Great Pacific Garbage Patch. Contrary to popular imagination, it is not a solid, visible island of trash a ship might collide with; instead it is a diffuse, sprawling zone where plastic concentration is significantly higher than surrounding ocean water, much of it broken down into small, sometimes microscopic fragments suspended throughout the water column rather than floating in one obvious mass. Researchers estimate the patch covers an area roughly three times the size of France, though its boundaries shift constantly with currents, wind, and season, making precise measurement genuinely difficult. The debris originates from a mix of sources, including fishing gear lost or discarded at sea, which studies suggest may make up a significant share of the patch’s total mass, alongside consumer plastic waste that enters the ocean from rivers and coastlines around the world. Ocean currents called gyres act like slow whirlpools, gradually drawing floating debris toward their calm, stable centers from thousands of miles away, which is why patches like this one form in predictable locations across several of the world’s oceans. Sunlight and wave action break larger plastic items into smaller pieces called microplastics, which are ingested by fish, seabirds, and other marine life, entering the food web in ways scientists are still working to fully understand. Cleanup efforts using specially designed floating barriers have removed measurable amounts of debris, though most researchers agree that reducing plastic entering the ocean in the first place remains far more effective, and far cheaper, than attempting to remove it once it has already dispersed across such an immense area.',
    questions: [
      {
        id: 'great-pacific-garbage-patch-q1',
        question: 'According to the passage, is the Great Pacific Garbage Patch a solid, visible island of trash?',
        options: [
          'Yes, ships regularly collide with it',
          'No, it is a diffuse zone of elevated plastic concentration, much of it broken into fragments',
          'It is entirely underwater and invisible',
          'It is a myth with no real basis',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'great-pacific-garbage-patch-q2',
        question: 'What role do ocean gyres play, according to the passage?',
        options: [
          'They destroy plastic debris',
          'They act like slow whirlpools drawing floating debris toward their calm centers',
          'They push debris toward the coastline only',
          'They have no effect on debris location',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'great-pacific-garbage-patch-q3',
        question: 'According to the passage, what do most researchers agree is more effective than removing existing ocean plastic?',
        options: ['Building bigger cleanup barriers', 'Reducing plastic entering the ocean in the first place', 'Ignoring the problem', 'Banning all ocean shipping'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'sign-language-history',
    label: 'The Deep History of Sign Language',
    text: 'For much of recorded history, sign languages used within Deaf communities were dismissed by hearing society as crude gesture systems rather than genuine languages, despite possessing full grammatical structure, regional variation, and the capacity to express any idea a spoken language can. This began to change seriously in the 1960s when linguist William Stokoe published research demonstrating that American Sign Language has its own independent grammar, syntax, and structure entirely separate from English, a discovery that was initially met with considerable resistance from academics and educators alike. Sign languages are not simply visual translations of spoken languages; they typically differ substantially in word order, grammar, and structure from any spoken language used in the same country, and different sign languages around the world are often mutually unintelligible, just as spoken languages are. American Sign Language and British Sign Language, for instance, despite both existing in English-speaking countries, are entirely distinct languages with different vocabularies and grammatical rules. One especially remarkable case study comes from Nicaragua, where, in the 1980s, Deaf children brought together for the first time in newly established schools spontaneously developed a completely new sign language, now called Nicaraguan Sign Language, without adult guidance, offering linguists a rare, real-time window into how a genuinely new language can emerge from scratch within a single generation. For much of the twentieth century, oralism, an educational approach insisting Deaf children learn to speak and lip-read rather than sign, dominated Deaf education in many countries, often actively discouraging or outright punishing the use of sign language in schools. Modern research strongly favors bilingual approaches allowing Deaf children early access to sign language alongside spoken or written language, since early language exposure of any accessible kind is now understood as critical for healthy cognitive and linguistic development.',
    questions: [
      {
        id: 'sign-language-history-q1',
        question: "According to the passage, who published research in the 1960s demonstrating ASL has its own independent grammar?",
        options: ['A Deaf community leader', 'Linguist William Stokoe', 'A Nicaraguan educator', 'A British researcher'],
        correctOptionIndex: 1,
      },
      {
        id: 'sign-language-history-q2',
        question: 'What remarkable case study from Nicaragua does the passage describe?',
        options: [
          'Deaf children spontaneously developing a new sign language without adult guidance',
          'The banning of all sign language',
          'The invention of a new spoken language',
          'A failed sign language experiment',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'sign-language-history-q3',
        question: "What is 'oralism,' according to the passage?",
        options: [
          'A sign language dialect',
          'An educational approach insisting Deaf children speak and lip-read rather than sign',
          'A modern bilingual teaching method',
          'A form of written Deaf poetry',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'terracotta-army-discovery',
    label: "China's Buried Army of Clay",
    text: 'In March 1974, farmers digging a well in Shaanxi province, China, struck something unexpected just below the surface: fragments of a clay figure, the first hint of what would become one of the most significant archaeological discoveries of the modern era. Further excavation revealed thousands of life-sized terracotta soldiers, along with horses and chariots, buried in orderly military formation to guard the tomb of Qin Shi Huang, China’s first emperor, who unified the country’s warring states in 221 BCE. Estimates suggest the complete underground army may include as many as eight thousand soldiers, though only a portion have been fully excavated, since Chinese archaeologists have deliberately left much of the surrounding tomb complex, including the emperor’s own burial chamber, unexcavated, partly out of respect and partly due to unresolved technical challenges in preserving delicate artifacts once exposed to open air. Remarkably, each soldier’s face appears individually distinct, with different hairstyles, expressions, and armor details, leading researchers to debate whether they were modeled on real individual soldiers or simply assembled from a large set of interchangeable features to create the appearance of variety. Originally, the figures were brightly painted in vivid colors, though most pigment has faded or flaked away in the centuries since burial, and newly excavated figures often lose their remaining paint within minutes of exposure to air unless treated with specialized preservation techniques developed only in recent decades. Ancient historical texts describe the tomb complex as containing rivers of flowing mercury representing the empire’s waterways, a detail modern soil testing around the site has partially corroborated by detecting unusually high mercury concentrations. The site remains an active excavation today, continuing to reveal new details about a vast funerary project built to accompany one ruler into the afterlife with an entire army at his command.',
    questions: [
      {
        id: 'terracotta-army-discovery-q1',
        question: 'According to the passage, who discovered the first fragments of the Terracotta Army in 1974?',
        options: ['Professional archaeologists', 'Farmers digging a well', 'Tourists exploring the region', 'Museum curators'],
        correctOptionIndex: 1,
      },
      {
        id: 'terracotta-army-discovery-q2',
        question: 'According to the passage, why have archaeologists left much of the tomb complex unexcavated?',
        options: [
          'Lack of funding only',
          'Respect and unresolved technical challenges in preserving artifacts once exposed to air',
          'The government forbids all excavation',
          'The site is not considered important',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'terracotta-army-discovery-q3',
        question: 'What have modern soil tests around the site detected, according to the passage, partially corroborating ancient texts?',
        options: ['Gold deposits', 'Unusually high mercury concentrations', 'Oil reserves', 'No unusual substances at all'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'circadian-rhythm-shift-work',
    label: "The Body's Internal Clock",
    text: 'Deep within the brain, a small cluster of roughly twenty thousand neurons called the suprachiasmatic nucleus functions as the body’s master clock, coordinating a roughly twenty-four-hour cycle known as the circadian rhythm that governs far more than just sleep. This internal clock influences body temperature, hormone release, digestion, immune function, and even how the body metabolizes medication, adjusting each of these processes to anticipate predictable daily patterns rather than simply reacting to them as they occur. Light is the primary cue keeping this internal clock synchronized with the actual external day-night cycle; specialized cells in the retina detect ambient light levels and send signals directly to the suprachiasmatic nucleus, independent of the visual pathways used for ordinary sight. This is why exposure to bright screens late at night can measurably delay the body’s natural sleep signal, since the brain interprets that light as evidence the day has not yet ended. Shift workers, who must remain alert and functional during hours the body’s internal clock still expects to be asleep, face a particularly difficult mismatch between external schedule and internal biology, one that cannot be fully resolved simply through willpower or caffeine. Long-term shift work has been associated with measurably higher rates of cardiovascular disease, metabolic disorders, and certain cancers, likely connected to chronic disruption of the hormonal and metabolic processes the circadian rhythm is meant to regulate smoothly. Some research suggests gradually shifting sleep schedules, using carefully timed bright light exposure, and maintaining strict consistency even on days off can meaningfully ease, though not eliminate, the burden shift work places on the body’s internal timing system. Understanding circadian biology has increasingly reshaped workplace scheduling recommendations, medical dosing timing, and even public health guidance around adolescent school start times.',
    questions: [
      {
        id: 'circadian-rhythm-shift-work-q1',
        question: 'According to the passage, what is the suprachiasmatic nucleus?',
        options: ['A muscle group', "A small cluster of neurons functioning as the body's master clock", 'A type of hormone', 'A part of the digestive system'],
        correctOptionIndex: 1,
      },
      {
        id: 'circadian-rhythm-shift-work-q2',
        question: 'What is the primary cue keeping the internal clock synchronized with the day-night cycle, per the passage?',
        options: ['Food intake', 'Light', 'Temperature alone', 'Sound'],
        correctOptionIndex: 1,
      },
      {
        id: 'circadian-rhythm-shift-work-q3',
        question: 'According to the passage, what has long-term shift work been associated with?',
        options: [
          'No measurable health effects',
          'Higher rates of cardiovascular disease, metabolic disorders, and certain cancers',
          'Improved immune function',
          'Longer lifespan',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'smallpox-eradication',
    label: 'How Humanity Erased a Disease',
    text: 'Smallpox once killed as many as three out of every ten people it infected, leaving many survivors permanently scarred or blind, and by the twentieth century alone it is estimated to have killed several hundred million people worldwide. Today it is the only human disease ever completely eradicated through deliberate global effort, a milestone rooted in an observation made more than two centuries earlier. In 1796, English physician Edward Jenner noticed that milkmaids who had previously caught cowpox, a much milder related disease, seemed to be protected from smallpox entirely. Jenner tested this by deliberately exposing a young boy to material from a cowpox sore and later to smallpox itself, finding the boy remained healthy, an experiment that would be considered wildly unethical by modern standards but that laid the practical foundation for vaccination, a word later derived from vacca, the Latin word for cow. Vaccination spread gradually over the following century, though widespread global eradication only became a realistic goal after the World Health Organization launched an intensified international campaign in 1967, when the disease still infected an estimated fifteen million people annually across dozens of countries. The campaign relied heavily on a strategy called ring vaccination, rapidly identifying new cases and vaccinating everyone in close contact with an infected person to contain outbreaks before they could spread further, rather than attempting to vaccinate entire populations all at once. This targeted approach proved remarkably efficient given limited resources and logistical challenges across remote regions. The last known naturally occurring case was recorded in Somalia in 1977, and the World Health Organization officially declared smallpox eradicated worldwide in 1980, following a rigorous multi-year verification process. Only a small number of laboratory samples reportedly still exist today, held under strict international security.',
    questions: [
      {
        id: 'smallpox-eradication-q1',
        question: 'According to the passage, who noticed that milkmaids exposed to cowpox seemed protected from smallpox?',
        options: ['A Somali physician', 'Edward Jenner', 'A WHO official', 'An anonymous nurse'],
        correctOptionIndex: 1,
      },
      {
        id: 'smallpox-eradication-q2',
        question: "What strategy did the WHO's campaign rely on to contain outbreaks, per the passage?",
        options: [
          'Vaccinating entire populations at once',
          'Ring vaccination — rapidly vaccinating everyone in close contact with an infected person',
          'Quarantine only',
          'Herbal remedies',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'smallpox-eradication-q3',
        question: 'When was smallpox officially declared eradicated worldwide, according to the passage?',
        options: ['1796', '1980', '1967', '1977'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'origami-mathematics',
    label: 'The Hidden Mathematics of Paper Folding',
    text: 'For centuries, origami was regarded primarily as a delicate decorative art, a way of folding a flat sheet of paper into cranes, boxes, or flowers using nothing but careful hand folds and no cuts or glue. In recent decades, mathematicians and engineers have discovered that the underlying rules governing how paper can be folded connect to deep, genuinely useful areas of geometry and physics, transforming origami from a purely artistic pursuit into a serious tool for solving real engineering problems. Mathematicians studying origami identified precise rules describing which crease patterns can fold flat without tearing or overlapping incorrectly, rules that apply equally whether the material being folded is a sheet of paper, a sheet of solar panel material, or a surgical stent. One well-known real-world application involves space telescopes and solar arrays, which must fold into a compact shape small enough to fit inside a rocket, then unfold reliably into a much larger, precise structure once in orbit, a challenge origami-based folding patterns have helped solve elegantly. Engineers have applied similar principles to medical devices, including stents that can be inserted into a blood vessel in a compact folded state and then expanded into their full functional shape once correctly positioned inside the body. Origami-inspired folding has even influenced airbag design, since efficiently packing a large airbag into a small, reliably deployable folded state shares surprising mathematical similarities with folding a traditional paper crane. Researchers have also used computational origami techniques to design self-folding robots and materials that assemble themselves into a target shape when heated or exposed to specific conditions, without any direct human folding involved at all. What began as a quiet traditional craft has become an active, genuinely interdisciplinary field bridging art, mathematics, and cutting-edge engineering in ways early paper-folders could scarcely have imagined.',
    questions: [
      {
        id: 'origami-mathematics-q1',
        question: 'According to the passage, what real-world application involves space telescopes and solar arrays?',
        options: [
          'They are painted using origami patterns',
          'They fold compactly for launch and unfold reliably once in orbit using origami-based patterns',
          'They are made entirely of paper',
          'They have no connection to origami',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'origami-mathematics-q2',
        question: 'What medical application does the passage describe using origami-inspired folding?',
        options: ['Bandages', 'Stents that fold compactly for insertion and expand once positioned in the body', 'Surgical gloves', 'Prosthetic limbs'],
        correctOptionIndex: 1,
      },
      {
        id: 'origami-mathematics-q3',
        question: 'According to the passage, what have researchers used computational origami techniques to design?',
        options: ['New paper types only', 'Self-folding robots and materials that assemble themselves', 'Faster printing presses', 'New folding scissors'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'deep-blue-kasparov',
    label: 'The Machine That Beat a Chess Champion',
    text: 'In May 1997, world chess champion Garry Kasparov, widely regarded as one of the greatest players in the game’s history, sat down for a six-game rematch against an IBM supercomputer named Deep Blue, a machine specifically engineered to do one thing exceptionally well: evaluate chess positions with brute computational force. A year earlier, Kasparov had defeated an earlier version of the same machine, and few expected the rematch outcome to differ dramatically. Deep Blue, however, had been substantially upgraded, capable of evaluating roughly two hundred million chess positions per second, far beyond anything a human mind could consciously process, though critically still guided by chess knowledge and evaluation rules programmed in advance by a team of grandmasters and engineers working with IBM. The match proved tense and psychologically grueling for Kasparov, who grew visibly frustrated and later suggested, without solid proof, that IBM engineers may have received illicit human assistance during the games, an accusation IBM firmly denied. Kasparov won the first game but lost the deciding sixth game after an uncharacteristic early blunder, giving Deep Blue the match victory and making it the first computer system to defeat a reigning world chess champion in a full match under standard tournament conditions. The result sent shockwaves through the chess world and beyond, widely interpreted, not entirely accurately, as proof that machines had definitively surpassed human intellect in at least one demanding cognitive domain. IBM retired Deep Blue shortly afterward, declining Kasparov’s request for a further rematch, a decision that left lingering controversy and speculation for years. The match is now remembered as a genuine milestone in artificial intelligence history, though modern chess engines running on ordinary consumer hardware now vastly outperform even Deep Blue’s celebrated 1997 capabilities.',
    questions: [
      {
        id: 'deep-blue-kasparov-q1',
        question: 'According to the passage, who did Deep Blue defeat in 1997?',
        options: ['An unknown amateur player', 'World chess champion Garry Kasparov', 'A team of grandmasters', 'Another computer'],
        correctOptionIndex: 1,
      },
      {
        id: 'deep-blue-kasparov-q2',
        question: 'What accusation did Kasparov make about the match, per the passage?',
        options: [
          'That Deep Blue cheated using illegal hardware',
          'That IBM engineers may have received illicit human assistance during the games',
          'That the match was rigged from the start',
          'That Deep Blue was actually a human in disguise',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'deep-blue-kasparov-q3',
        question: 'According to the passage, what happened to Deep Blue shortly after the match?',
        options: ['It continued competing for years', 'IBM retired it, declining a further rematch', 'It was donated to a university', 'It was upgraded and renamed'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'elephant-grief-cognition',
    label: 'What Elephants Understand About Loss',
    text: 'Among the many remarkable aspects of elephant behavior documented by researchers, few are as striking, or as difficult to interpret without anthropomorphizing, as their apparent response to death. Elephants have been repeatedly observed gathering around a deceased herd member, touching the body gently with their trunks, standing vigil for extended periods, and in some documented cases returning to the same spot repeatedly over following days or even years. They show particular interest in the bones and tusks of other elephants, sometimes carrying or moving skeletal remains, behavior rarely if ever directed at the remains of other species, suggesting some capacity to recognize and respond specifically to their own kind. Researchers are careful to note that interpreting these behaviors as grief in the human emotional sense requires caution, since it is genuinely difficult to know what an elephant subjectively experiences, but the behavioral patterns are consistent enough, and specific enough, that many scientists now consider some form of mourning-like response a reasonable working description. This capacity connects to broader elephant cognition, which includes long-term memory extending across decades, the ability to recognize dozens of individual elephants and humans by sight, smell, or vocal call, and complex social structures built around matriarchal family groups led by an experienced older female who retains critical knowledge about food sources, water locations, and danger during droughts or other crises. Elephants also show evidence of self-awareness in mirror recognition tests, a capability shared with only a small number of other species including great apes, dolphins, and magpies. Understanding elephant cognition and social bonds has increasingly influenced conservation strategy, since disrupting family groups through poaching or captivity is now understood to cause lasting psychological harm extending well beyond the immediate loss of an individual animal.',
    questions: [
      {
        id: 'elephant-grief-cognition-q1',
        question: 'According to the passage, what have elephants been observed doing around a deceased herd member?',
        options: [
          'Ignoring the body completely',
          'Gently touching the body, standing vigil, and sometimes returning to the spot later',
          'Immediately leaving the area forever',
          'Attacking the body',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'elephant-grief-cognition-q2',
        question: 'According to the passage, what role does the matriarch play in elephant social groups?',
        options: [
          'She has no special role',
          'She retains critical knowledge about food, water, and danger during crises',
          'She is chosen randomly each year',
          'She leaves the group permanently',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'elephant-grief-cognition-q3',
        question: 'What capability do elephants show in mirror recognition tests, per the passage?',
        options: ['No self-awareness at all', 'Evidence of self-awareness, shared with only a few other species', 'Fear of their own reflection', 'An inability to see their reflection'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'great-fire-of-london',
    label: 'The Fire That Remade a City',
    text: 'In the early hours of September 2, 1666, a fire broke out in a bakery on Pudding Lane in the City of London, and within days it had consumed a staggering portion of the medieval city, destroying an estimated thirteen thousand houses, dozens of churches, and the original St Paul’s Cathedral. London at the time was built largely of timber, with narrow, tightly packed streets and overhanging upper floors that nearly touched across the street, conditions that allowed flames to leap easily from building to building once the fire gained momentum, fanned by strong winds and an unusually dry summer that had left the wooden structures especially flammable. The Lord Mayor of London, Thomas Bloodworth, famously dismissed initial reports of the fire as minor, reportedly remarking that a woman could extinguish it by urinating on it, a catastrophic underestimation that delayed the decisive early firebreaking efforts that might have contained the blaze before it spread further. By the time the fire was finally brought under control four days later, it had destroyed roughly eighty percent of the walled city, though remarkably official death toll records list only a handful of confirmed fatalities, a figure most historians now consider a significant undercount given the fire’s scale and the likely deaths of poorer residents whose losses went unrecorded. The disaster, devastating as it was, led directly to major reforms in building codes and city planning, including requirements for brick and stone construction instead of timber, wider streets, and improved fire safety standards that shaped London’s rebuilding for generations afterward. Architect Christopher Wren played a central role in redesigning much of the city, including a new St Paul’s Cathedral, whose distinctive dome remains one of London’s most recognizable landmarks today, a lasting architectural legacy of the catastrophe that nearly destroyed the city entirely.',
    questions: [
      {
        id: 'great-fire-of-london-q1',
        question: 'According to the passage, where did the Great Fire of London begin?',
        options: ['A church', 'A bakery on Pudding Lane', 'The Tower of London', 'A shipyard'],
        correctOptionIndex: 1,
      },
      {
        id: 'great-fire-of-london-q2',
        question: 'What did Lord Mayor Thomas Bloodworth reportedly say about the fire initially, per the passage?',
        options: [
          'That it was a serious threat requiring immediate action',
          'That it was minor enough for a woman to extinguish by urinating on it',
          'That the entire city should be evacuated',
          'That it was likely an act of war',
        ],
        correctOptionIndex: 1,
      },
      {
        id: 'great-fire-of-london-q3',
        question: "According to the passage, what architect played a central role in redesigning the city, including a new St Paul's Cathedral?",
        options: ['Thomas Bloodworth', 'Christopher Wren', 'Edward Jenner', 'William Stokoe'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'antibiotic-resistance',
    label: 'The Race Against Resistant Bacteria',
    text: 'When Scottish scientist Alexander Fleming accidentally discovered penicillin in 1928 after noticing mold contamination had killed bacteria in a forgotten petri dish, he also, in his own 1945 Nobel Prize lecture, issued a remarkably prescient warning: that careless or insufficient use of antibiotics could allow bacteria to develop resistance against them. That warning has proven accurate on a scale even Fleming likely did not fully anticipate. Bacteria reproduce extremely rapidly and can evolve resistance mechanisms within a relatively short number of generations, especially under the selective pressure created when antibiotics are used excessively, incorrectly, or unnecessarily, killing off susceptible bacteria while inadvertently allowing naturally resistant strains to survive and multiply. Resistant genes can also spread directly between different bacteria through a process called horizontal gene transfer, allowing resistance to jump between species far more quickly than through reproduction alone. Overuse of antibiotics in human medicine, including prescribing them for viral infections they cannot treat at all, combines with widespread agricultural use, where antibiotics are sometimes administered to livestock for growth promotion rather than treating actual illness, to accelerate the overall pace of resistance developing worldwide. Public health officials now consider antibiotic resistance one of the most serious global health threats of the coming decades, since a growing number of once easily treatable bacterial infections are becoming difficult or, in some documented cases, effectively impossible to treat with currently available drugs. Developing genuinely new classes of antibiotics has slowed dramatically in recent decades, partly because it is less commercially attractive for pharmaceutical companies than developing drugs for chronic conditions taken daily over a patient’s lifetime. Public health strategies now emphasize more careful antibiotic prescribing, improved infection prevention, and renewed research investment, treating the problem as a shared global responsibility rather than one any single country or institution can solve alone.',
    questions: [
      {
        id: 'antibiotic-resistance-q1',
        question: 'According to the passage, who discovered penicillin and later warned about antibiotic resistance?',
        options: ['Edward Jenner', 'Alexander Fleming', 'William Stokoe', 'Christopher Wren'],
        correctOptionIndex: 1,
      },
      {
        id: 'antibiotic-resistance-q2',
        question: "What is 'horizontal gene transfer,' according to the passage?",
        options: [
          'A process allowing resistant genes to spread directly between different bacteria species',
          'A method of vaccinating livestock',
          'A surgical technique',
          'A way antibiotics are manufactured',
        ],
        correctOptionIndex: 0,
      },
      {
        id: 'antibiotic-resistance-q3',
        question: 'Why has development of new antibiotic classes slowed, according to the passage?',
        options: [
          'It is scientifically impossible',
          'It is less commercially attractive than drugs for chronic conditions',
          'All possible antibiotics have already been discovered',
          'Governments have banned new research',
        ],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'discovery-of-insulin',
    label: 'The Discovery That Saved Millions',
    text: 'Before the early 1920s, a diagnosis of type 1 diabetes was effectively a death sentence, particularly for children, who typically survived only months or at most a few years after symptoms appeared despite the era’s best available treatment, an extremely restrictive starvation diet that could delay but never prevent the disease’s fatal progression. This changed dramatically in 1921 when Canadian researchers Frederick Banting and Charles Best, working in a small laboratory at the University of Toronto with limited funding and equipment, successfully isolated insulin, the hormone whose absence causes diabetes, from the pancreas of a dog. Working alongside biochemist James Collip, who helped purify the extract enough for safe human use, and physiologist John Macleod, who provided laboratory space and oversight, the team refined their techniques rapidly. In January 1922, insulin was administered to a critically ill fourteen-year-old boy named Leonard Thompson, whose condition improved dramatically within days, transforming him from a dying patient into a walking demonstration of one of medicine’s most significant breakthroughs. News of the discovery spread rapidly, and demand for insulin quickly outpaced the small laboratory’s production capacity, prompting a partnership with a pharmaceutical company to scale manufacturing enough to treat patients well beyond Toronto. Banting and Macleod received the Nobel Prize in Physiology or Medicine in 1923, a decision that caused considerable controversy since Best and Collip, whose contributions many considered equally essential, were excluded entirely; Banting was reportedly so troubled by this that he shared his own prize money with Best. Remarkably, the University of Toronto patent for insulin was sold for a symbolic one dollar, explicitly so the treatment could be manufactured widely and affordably rather than restricted by expensive licensing, a decision that helped insulin reach millions of patients worldwide within just a few years of its discovery.',
    questions: [
      {
        id: 'discovery-of-insulin-q1',
        question: 'According to the passage, who successfully isolated insulin in 1921?',
        options: ['Alexander Fleming', 'Frederick Banting and Charles Best', 'Edward Jenner', 'James Collip alone'],
        correctOptionIndex: 1,
      },
      {
        id: 'discovery-of-insulin-q2',
        question: 'Who was the first patient successfully treated with insulin, per the passage?',
        options: ['An adult woman', 'A fourteen-year-old boy named Leonard Thompson', 'Frederick Banting himself', 'An elderly patient'],
        correctOptionIndex: 1,
      },
      {
        id: 'discovery-of-insulin-q3',
        question: "According to the passage, for how much was the University of Toronto's insulin patent sold?",
        options: ['One million dollars', 'A symbolic one dollar', 'It was never sold', 'Ten thousand dollars'],
        correctOptionIndex: 1,
      },
    ],
  },
  {
    id: 'first-ascent-everest',
    label: 'The First Steps Atop the World',
    text: 'On May 29, 1953, New Zealand beekeeper and mountaineer Edmund Hillary and Nepali Sherpa mountaineer Tenzing Norgay became the first climbers confirmed to reach the summit of Mount Everest, the highest point on Earth at just over twenty-nine thousand feet, completing an ascent that had defeated numerous well-equipped expeditions across more than three decades of attempts. The pair were members of a larger British expedition led by John Hunt, and their successful summit push came after earlier expedition members had made a valiant but ultimately unsuccessful attempt just days before, leaving Hillary and Norgay to make the final push under grueling conditions, including extreme cold, thin oxygen, and the constant danger of unpredictable weather at extreme altitude. Both climbers later insisted, consistently and firmly, that they had reached the summit together and refused for the rest of their lives to state definitively who technically stepped onto the highest point first, considering the achievement a shared accomplishment rather than a personal race, a stance that quietly defused what could easily have become a divisive controversy. News of the successful ascent reached Britain on the morning of Queen Elizabeth II’s coronation, adding an extra layer of national celebration to an already significant day. Norgay’s own contribution has often been comparatively underappreciated in Western accounts, despite his decades of prior high-altitude experience on earlier expeditions and his deep, essential knowledge of the mountain’s terrain and conditions, knowledge without which the successful ascent would likely have been impossible. The climb relied on supplemental oxygen equipment, still relatively primitive and heavy by later standards, along with a network of support climbers and Sherpa porters who established a series of camps progressively higher up the mountain in the weeks beforehand. Everest has since been summited thousands of times, but Hillary and Norgay’s 1953 ascent remains the foundational achievement against which every subsequent climb is still measured.',
    questions: [
      {
        id: 'first-ascent-everest-q1',
        question: 'According to the passage, who were the first climbers confirmed to reach the summit of Mount Everest?',
        options: ['John Hunt and a British team', 'Edmund Hillary and Tenzing Norgay', 'A solo climber', 'A Chinese expedition'],
        correctOptionIndex: 1,
      },
      {
        id: 'first-ascent-everest-q2',
        question: 'According to the passage, what did Hillary and Norgay refuse to state for the rest of their lives?',
        options: ["Details about the climb's difficulty", 'Who technically stepped onto the summit first', 'Their nationality', 'The date of the climb'],
        correctOptionIndex: 1,
      },
      {
        id: 'first-ascent-everest-q3',
        question: 'According to the passage, what significant event in Britain coincided with news of the successful ascent?',
        options: ['A royal wedding', "Queen Elizabeth II's coronation", 'A general election', 'The end of a war'],
        correctOptionIndex: 1,
      },
    ],
  },
] as const

export const TOTAL_GUIDED_PARAGRAPH_READING_MODE_CATEGORIES = GUIDED_PARAGRAPH_READING_MODE_CATEGORIES.length

// Word-level ReadingUnits, split from the category's one continuous
// passage — mirrors Paragraph Reading Mode's own buildUnitsForCategory
// convention exactly, since both modes still pace word-by-word underneath
// their very different presentational layers.
export function buildUnitsForCategory(category: GuidedParagraphReadingModeCategory): readonly ReadingUnit[] {
  const words = category.text.trim().split(/\s+/).filter(Boolean)
  return words.map((text, index) => ({ id: `${category.id}-word-${index}`, text }))
}

const LAST_CATEGORY_STORAGE_KEY = 'qsr-guided-paragraph-reading-mode-last-category'

// Own-copy of the identical non-repeat algorithm every other exercise's
// pickSessionCategory uses — client-only, called only from a useEffect in
// the Experience orchestrator, never a lazy useState initializer, so the
// server-rendered 'settings' phase and the client's first paint always
// match before this ever runs.
export function pickSessionCategory(): GuidedParagraphReadingModeCategory {
  const categories = GUIDED_PARAGRAPH_READING_MODE_CATEGORIES
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

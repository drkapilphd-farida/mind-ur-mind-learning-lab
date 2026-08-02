import type { JourneyReadingSetDef } from './types'

export const GEOGRAPHY: readonly JourneyReadingSetDef[] = [
  {
    id: 'geo-ganga-source',
    category: 'geography',
    lengthTier: 'short',
    text: 'The Ganga, one of India’s most sacred and important rivers, originates at Gaumukh, a glacier cave near the Gangotri Glacier in Uttarakhand, high in the Himalayas. From there it flows over 2,500 kilometers across the northern plains, passing through Rishikesh, Varanasi, and Patna before joining the Bay of Bengal in a vast delta shared with Bangladesh. The Gangetic plain it feeds is one of the most fertile and densely populated regions on Earth, supporting hundreds of millions of people through agriculture.',
    comprehensionQuestions: [
      { question: 'Where does the Ganga originate?', options: ['Gaumukh near Gangotri Glacier', 'Kanyakumari', 'The Thar Desert', 'Kashmir Valley'], correctAnswer: 'Gaumukh near Gangotri Glacier' },
      { question: 'Where does the Ganga finally empty?', options: ['The Arabian Sea', 'The Bay of Bengal', 'The Indian Ocean directly', 'Lake Chilika'], correctAnswer: 'The Bay of Bengal' },
    ],
    retentionQuestions: [
      { question: 'Roughly how long is the Ganga’s flow?', options: ['500 km', '1,000 km', 'Over 2,500 km', '10,000 km'], correctAnswer: 'Over 2,500 km' },
      { question: 'What does the Gangetic plain support?', options: ['Mostly desert farming', 'Hundreds of millions through agriculture', 'Only fishing villages', 'Mining towns'], correctAnswer: 'Hundreds of millions through agriculture' },
    ],
  },
  {
    id: 'geo-thar-desert',
    category: 'geography',
    lengthTier: 'short',
    text: 'The Thar Desert, also called the Great Indian Desert, spans much of Rajasthan and stretches into Gujarat, Punjab, and Haryana, as well as across the border into Pakistan. Despite receiving very little rainfall, it is one of the most densely populated deserts in the world. Local communities have adapted over centuries with techniques like building deep step-wells and cultivating drought-resistant crops such as bajra (pearl millet). The desert is also home to the Great Indian Bustard, a critically endangered bird found almost nowhere else.',
    comprehensionQuestions: [
      { question: 'What is another name for the Thar Desert?', options: ['The Rajasthan Sands', 'The Great Indian Desert', 'The Deccan Waste', 'The Gujarat Flats'], correctAnswer: 'The Great Indian Desert' },
      { question: 'What crop is commonly grown there?', options: ['Rice', 'Bajra (pearl millet)', 'Sugarcane', 'Tea'], correctAnswer: 'Bajra (pearl millet)' },
    ],
    retentionQuestions: [
      { question: 'What endangered bird lives in the Thar Desert?', options: ['Peacock', 'Great Indian Bustard', 'Sarus Crane', 'Flamingo'], correctAnswer: 'Great Indian Bustard' },
      { question: 'What water structures have locals built to adapt?', options: ['Dams', 'Deep step-wells', 'Canals', 'Reservoirs only'], correctAnswer: 'Deep step-wells' },
    ],
  },
  {
    id: 'geo-western-ghats',
    category: 'geography',
    lengthTier: 'medium',
    text: 'The Western Ghats form a nearly continuous mountain range running along India’s western coast, stretching roughly 1,600 kilometers from Gujarat down to Kerala. Older than the Himalayas, this range is a UNESCO World Heritage Site recognized as one of the world’s eight "hottest hotspots" of biological diversity. It influences the monsoon by forcing moisture-laden winds upward, causing heavy rainfall on its western slopes while leaving the eastern side comparatively dry — a phenomenon called the rain-shadow effect. The Ghats are home to thousands of species found nowhere else on Earth, including the Nilgiri tahr and the lion-tailed macaque, and they feed major rivers like the Godavari and Krishna that flow eastward across the peninsula.',
    comprehensionQuestions: [
      { question: 'How long is the Western Ghats range?', options: ['About 400 km', 'About 1,600 km', 'About 5,000 km', 'About 800 km'], correctAnswer: 'About 1,600 km' },
      { question: 'What effect causes dry land on the eastern side?', options: ['The rain-shadow effect', 'Desertification', 'Ocean currents', 'Volcanic activity'], correctAnswer: 'The rain-shadow effect' },
    ],
    retentionQuestions: [
      { question: 'Which is older, the Western Ghats or the Himalayas?', options: ['The Himalayas', 'The Western Ghats', 'They formed at the same time', 'Neither is a mountain range'], correctAnswer: 'The Western Ghats' },
      { question: 'Name a species found in the Western Ghats.', options: ['Snow leopard', 'Lion-tailed macaque', 'Polar bear', 'Arctic fox'], correctAnswer: 'Lion-tailed macaque' },
    ],
  },
  {
    id: 'geo-sundarbans',
    category: 'geography',
    lengthTier: 'medium',
    text: 'The Sundarbans, shared between India and Bangladesh, is the largest mangrove forest in the world, formed where the Ganga, Brahmaputra, and Meghna rivers meet the Bay of Bengal. Its name is thought to come from the sundari tree, one of the dominant mangrove species found there. This unique ecosystem of tidal waterways and forested islands is the only mangrove habitat on Earth known to support a significant population of Bengal tigers, which have adapted to swim between islands and even hunt in brackish water. The forest also acts as a natural barrier, protecting millions of people inland from cyclones and storm surges that regularly form in the Bay of Bengal.',
    comprehensionQuestions: [
      { question: 'What is the Sundarbans known as the largest example of?', options: ['A coral reef', 'A mangrove forest', 'A desert oasis', 'A glacier system'], correctAnswer: 'A mangrove forest' },
      { question: 'Which three rivers meet near the Sundarbans?', options: ['Ganga, Yamuna, Godavari', 'Ganga, Brahmaputra, Meghna', 'Indus, Sutlej, Beas', 'Krishna, Kaveri, Tungabhadra'], correctAnswer: 'Ganga, Brahmaputra, Meghna' },
    ],
    retentionQuestions: [
      { question: 'What animal uniquely adapted to swim between the Sundarbans’ islands?', options: ['Elephants', 'Bengal tigers', 'Rhinos', 'Leopards'], correctAnswer: 'Bengal tigers' },
      { question: 'What natural role does the forest play for inland areas?', options: ['It has no protective role', 'It buffers against cyclones and storm surges', 'It causes flooding', 'It blocks all rainfall'], correctAnswer: 'It buffers against cyclones and storm surges' },
    ],
  },
  {
    id: 'geo-himalayan-formation',
    category: 'geography',
    lengthTier: 'long',
    text: 'The Himalayas exist because two massive pieces of Earth’s crust are still colliding in extreme slow motion. Around 50 million years ago, the Indian tectonic plate, which had been drifting northward across an ancient ocean for tens of millions of years, finally slammed into the much larger Eurasian plate. Because both plates were made of relatively light continental crust, neither could sink beneath the other the way ocean floor rock normally does at a collision zone. Instead, the crust crumpled and folded upward, layer upon layer, over millions of years, eventually pushing rock that once sat on an ancient seabed to heights of over 8,000 meters — which is why fossils of ancient sea creatures have been found near the summit of Mount Everest. This collision has never actually stopped. India continues to push northward into Asia at a rate of about five centimeters per year, roughly the speed fingernails grow, which means the Himalayas are technically still rising today, even as wind and water simultaneously wear the peaks back down. This ongoing collision is also why the region experiences frequent earthquakes, as stress continues to build and release along fault lines beneath the mountains.',
    comprehensionQuestions: [
      { question: 'What caused the Himalayas to form?', options: ['A volcanic eruption', 'The Indian and Eurasian tectonic plates colliding', 'A meteor impact', 'Rapid erosion of flat land'], correctAnswer: 'The Indian and Eurasian tectonic plates colliding' },
      { question: 'Why did the crust fold upward instead of sinking?', options: ['Both plates were made of light continental crust', 'The ocean floor was too deep', 'Volcanic rock is always lighter', 'Rock stayed flat, not folded'], correctAnswer: 'Both plates were made of light continental crust' },
    ],
    retentionQuestions: [
      { question: 'What evidence shows Everest once sat under the sea?', options: ['Ocean fossils found near its summit', 'Salt deposits in nearby towns', 'Ancient shipwrecks', 'Coral reefs at base camp'], correctAnswer: 'Ocean fossils found near its summit' },
      { question: 'At roughly what rate does India still push into Asia?', options: ['5 meters per year', 'About 5 centimeters per year', '1 kilometer per year', 'It has completely stopped'], correctAnswer: 'About 5 centimeters per year' },
    ],
  },
]

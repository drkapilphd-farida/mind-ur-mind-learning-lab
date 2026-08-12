// Sensory Hologram Builder™ — the 50+ item bilingual (English/Hindi)
// life-goals and sensory-anchor database this exercise's guided journey
// draws from. Real, hand-authored content throughout (no AI, no API, no
// lorem ipsum) — every English line has its own genuine Hindi
// translation, not a machine pass, matching this app's established
// content-authoring standard for every dataset in this codebase.
//
// Each goal carries one short sensory line per sense (sight/touch/taste
// or smell) plus a closing affirmation — these are spliced into the fixed
// narration script in hologramNarrationScript.ts, which owns the
// session's actual spoken framing. This file only owns WHAT gets
// visualized, never HOW the session speaks — keeping the (large) content
// authoring surface separate from the (small, reusable) script structure.
export type HologramCategory =
  | 'career'
  | 'material'
  | 'home-family'
  | 'health-vitality'
  | 'inner-peace'
  | 'adventure-travel'
  | 'creativity'
  | 'relationships'
  | 'sensory-anchor'

export const HOLOGRAM_CATEGORIES: readonly HologramCategory[] = [
  'career',
  'material',
  'home-family',
  'health-vitality',
  'inner-peace',
  'adventure-travel',
  'creativity',
  'relationships',
  'sensory-anchor',
]

export const HOLOGRAM_CATEGORY_LABELS: Record<HologramCategory, { en: string; hi: string }> = {
  career: { en: 'Career & Success', hi: 'करियर और सफलता' },
  material: { en: 'Material & Luxury', hi: 'भौतिक सुख और विलासिता' },
  'home-family': { en: 'Home & Family', hi: 'घर और परिवार' },
  'health-vitality': { en: 'Health & Vitality', hi: 'स्वास्थ्य और जीवंतता' },
  'inner-peace': { en: 'Inner Peace & Spirituality', hi: 'आंतरिक शांति और आध्यात्म' },
  'adventure-travel': { en: 'Adventure & Travel', hi: 'साहसिक यात्रा' },
  creativity: { en: 'Creativity & Expression', hi: 'रचनात्मकता और अभिव्यक्ति' },
  relationships: { en: 'Relationships & Love', hi: 'रिश्ते और प्रेम' },
  'sensory-anchor': { en: 'Sensory Anchors', hi: 'संवेदी आधार' },
}

export type HologramSensoryLine = { en: string; hi: string }

export type HologramGoal = {
  id: string
  category: HologramCategory
  titleEn: string
  titleHi: string
  sight: HologramSensoryLine
  touch: HologramSensoryLine
  tasteSmell: HologramSensoryLine
  affirmation: HologramSensoryLine
}

export const HOLOGRAM_GOALS: readonly HologramGoal[] = [
  // ---- Career & Success ----
  {
    id: 'dream-job-offer',
    category: 'career',
    titleEn: 'Your Dream Job Offer',
    titleHi: 'आपकी सपनों की नौकरी का प्रस्ताव',
    sight: {
      en: 'You see the offer letter in your hands, your name printed clearly at the top, the company logo gleaming.',
      hi: 'आप अपने हाथों में नियुक्ति पत्र देखते हैं, ऊपर आपका नाम स्पष्ट रूप से लिखा हुआ है, कंपनी का लोगो चमक रहा है।',
    },
    touch: {
      en: 'You feel the crisp paper between your fingers, and a warm handshake sealing the deal.',
      hi: 'आप अपनी उंगलियों के बीच कड़े कागज़ को महसूस करते हैं, और एक गर्मजोशी भरा हाथ मिलाना इस सौदे को पक्का करता है।',
    },
    tasteSmell: {
      en: 'The air smells of fresh coffee and new beginnings in a bright, modern office.',
      hi: 'हवा में ताज़ी कॉफी और नई शुरुआत की खुशबू है, एक रोशन, आधुनिक कार्यालय में।',
    },
    affirmation: {
      en: 'This opportunity is already yours. You are exactly where you are meant to be.',
      hi: 'यह अवसर पहले से ही आपका है। आप बिल्कुल वहीं हैं जहाँ आपको होना चाहिए।',
    },
  },
  {
    id: 'well-deserved-promotion',
    category: 'career',
    titleEn: 'A Well-Deserved Promotion',
    titleHi: 'एक योग्य पदोन्नति',
    sight: {
      en: 'You see your new title on the door, and your team applauding with genuine pride.',
      hi: 'आप अपने नए पद का नाम दरवाज़े पर देखते हैं, और आपकी टीम सच्चे गर्व के साथ तालियाँ बजा रही है।',
    },
    touch: {
      en: 'You feel the solid handshake of your manager, and new responsibility sitting comfortably on your shoulders.',
      hi: 'आप अपने प्रबंधक का दृढ़ हाथ मिलाना महसूस करते हैं, और नई ज़िम्मेदारी आपके कंधों पर आराम से बैठी है।',
    },
    tasteSmell: {
      en: "There's a small celebration — the sweetness of cake, and laughter filling the room.",
      hi: 'एक छोटा सा उत्सव है — केक की मिठास, और कमरे में भरी हुई हँसी।',
    },
    affirmation: {
      en: 'Your hard work is seen and rewarded. You have earned this moment.',
      hi: 'आपकी मेहनत देखी और सराही जाती है। आपने यह पल कमाया है।',
    },
  },
  {
    id: 'thriving-business',
    category: 'career',
    titleEn: 'Your Thriving Business',
    titleHi: 'आपका फलता-फूलता व्यवसाय',
    sight: {
      en: "You see your company's name on the storefront, customers walking in with smiles.",
      hi: 'आप अपनी दुकान पर अपनी कंपनी का नाम देखते हैं, ग्राहक मुस्कुराते हुए अंदर आ रहे हैं।',
    },
    touch: {
      en: 'You feel the smooth surface of your desk, covered in plans that are finally becoming real.',
      hi: 'आप अपनी मेज़ की चिकनी सतह को महसूस करते हैं, जो उन योजनाओं से ढकी है जो आखिरकार सच हो रही हैं।',
    },
    tasteSmell: {
      en: 'The scent of fresh paint and new furniture fills your growing workspace.',
      hi: 'ताज़े रंग और नए फर्नीचर की खुशबू आपके बढ़ते हुए कार्यक्षेत्र में भरी है।',
    },
    affirmation: {
      en: 'You built this with your own hands. Success flows to you naturally.',
      hi: 'आपने इसे अपने ही हाथों से बनाया है। सफलता स्वाभाविक रूप से आपकी ओर बहती है।',
    },
  },
  {
    id: 'published-book',
    category: 'career',
    titleEn: 'Holding Your Published Book',
    titleHi: 'अपनी प्रकाशित पुस्तक को थामे हुए',
    sight: {
      en: 'You see your name on the cover, the pages crisp and fresh from the press.',
      hi: 'आप कवर पर अपना नाम देखते हैं, पन्ने प्रेस से एकदम ताज़े और कड़े हैं।',
    },
    touch: {
      en: 'You feel the weight of the book in your hands, its cover smooth beneath your palm.',
      hi: 'आप अपने हाथों में किताब का भार महसूस करते हैं, इसका कवर आपकी हथेली के नीचे चिकना है।',
    },
    tasteSmell: {
      en: 'The paper carries that unmistakable scent of a brand-new book.',
      hi: 'कागज़ में एक नई किताब की वह खास पहचानी जाने वाली खुशबू है।',
    },
    affirmation: {
      en: 'Your story matters, and the world is ready to read it.',
      hi: 'आपकी कहानी मायने रखती है, और दुनिया इसे पढ़ने के लिए तैयार है।',
    },
  },
  {
    id: 'respected-expert',
    category: 'career',
    titleEn: 'Recognized as a Respected Expert',
    titleHi: 'एक सम्मानित विशेषज्ञ के रूप में पहचान',
    sight: {
      en: 'You see a room full of people listening closely as you speak with quiet confidence.',
      hi: 'आप एक कमरा देखते हैं, लोग शांत आत्मविश्वास के साथ बोलते हुए आपको ध्यान से सुन रहे हैं।',
    },
    touch: {
      en: 'You feel steady and grounded at the podium, your notes light in your hand.',
      hi: 'आप मंच पर स्थिर और आत्मविश्वासी महसूस करते हैं, आपके नोट्स आपके हाथ में हल्के हैं।',
    },
    tasteSmell: {
      en: 'A glass of water sits nearby, cool and fresh, as the room hums with attention.',
      hi: 'पास में एक गिलास पानी रखा है, ठंडा और ताज़ा, जबकि कमरा ध्यान से गूंज रहा है।',
    },
    affirmation: {
      en: 'Your knowledge has value. People trust and respect what you bring.',
      hi: 'आपके ज्ञान का मूल्य है। लोग आपके योगदान पर भरोसा और सम्मान करते हैं।',
    },
  },
  {
    id: 'financial-freedom',
    category: 'career',
    titleEn: 'True Financial Freedom',
    titleHi: 'सच्ची आर्थिक स्वतंत्रता',
    sight: {
      en: 'You see your savings grow steadily on the screen, each number a little more secure.',
      hi: 'आप स्क्रीन पर अपनी बचत को लगातार बढ़ते हुए देखते हैं, हर संख्या थोड़ी और सुरक्षित है।',
    },
    touch: {
      en: 'You feel the lightness of a mind no longer weighed down by money worries.',
      hi: 'आप एक ऐसे मन की हल्कापन महसूस करते हैं जो अब पैसों की चिंता से दबा हुआ नहीं है।',
    },
    tasteSmell: {
      en: 'You savor a quiet, unhurried breakfast, with nowhere urgent you have to be.',
      hi: 'आप एक शांत, बिना जल्दबाज़ी वाला नाश्ता चखते हैं, जहाँ आपको कहीं जल्दी नहीं जाना है।',
    },
    affirmation: {
      en: 'Abundance flows to you easily. You are free to live life on your own terms.',
      hi: 'समृद्धि आपकी ओर आसानी से बहती है। आप अपनी शर्तों पर जीवन जीने के लिए स्वतंत्र हैं।',
    },
  },
  {
    id: 'award-recognition',
    category: 'career',
    titleEn: 'Standing on Stage to Receive an Award',
    titleHi: 'एक पुरस्कार लेने के लिए मंच पर खड़े होना',
    sight: {
      en: 'You see the bright stage lights, and the audience rising for a standing ovation.',
      hi: 'आप मंच की तेज़ रोशनी देखते हैं, और दर्शक खड़े होकर तालियाँ बजा रहे हैं।',
    },
    touch: {
      en: "You feel the cool, solid weight of the trophy as it's placed in your hands.",
      hi: 'आप ट्रॉफी का ठंडा, ठोस भार महसूस करते हैं जब इसे आपके हाथों में रखा जाता है।',
    },
    tasteSmell: {
      en: 'The scent of fresh flowers on stage mixes with the electric energy of the crowd.',
      hi: 'मंच पर ताज़े फूलों की खुशबू भीड़ की जीवंत ऊर्जा के साथ मिल जाती है।',
    },
    affirmation: {
      en: 'Your dedication has been recognized. This moment is proof of your journey.',
      hi: 'आपके समर्पण को पहचाना गया है। यह पल आपकी यात्रा का प्रमाण है।',
    },
  },
  {
    id: 'entrepreneurial-launch',
    category: 'career',
    titleEn: 'Your Successful Product Launch',
    titleHi: 'आपके उत्पाद का सफल शुभारंभ',
    sight: {
      en: 'You see your creation finally in customers’ hands, exactly as you imagined it.',
      hi: 'आप अपनी रचना को आखिरकार ग्राहकों के हाथों में देखते हैं, बिल्कुल वैसे ही जैसे आपने सोचा था।',
    },
    touch: {
      en: 'You feel a rush of excitement as the first orders start coming in.',
      hi: 'जैसे ही पहले ऑर्डर आने लगते हैं, आप उत्साह की एक लहर महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'You share a toast with your team, the drink cool and celebratory.',
      hi: 'आप अपनी टीम के साथ एक टोस्ट साझा करते हैं, पेय ठंडा और उत्सवपूर्ण है।',
    },
    affirmation: {
      en: 'You turned an idea into reality. This is only the beginning.',
      hi: 'आपने एक विचार को हकीकत में बदल दिया। यह तो बस शुरुआत है।',
    },
  },

  // ---- Material & Luxury ----
  {
    id: 'luxury-car',
    category: 'material',
    titleEn: 'Your Luxury Car',
    titleHi: 'आपकी शानदार लक्ज़री कार',
    sight: {
      en: 'You see its polished body gleaming under the sun, every curve flawless.',
      hi: 'आप इसकी चमकदार बॉडी को धूप में चमकते हुए देखते हैं, हर मोड़ बेदाग है।',
    },
    touch: {
      en: 'You feel the smooth leather seat as you slide behind the wheel.',
      hi: 'जैसे ही आप स्टीयरिंग व्हील के पीछे बैठते हैं, आप चिकनी चमड़े की सीट को महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The interior carries that rich, unmistakable scent of brand new leather.',
      hi: 'इंटीरियर में नए चमड़े की वह समृद्ध, खास पहचान वाली खुशबू है।',
    },
    affirmation: {
      en: 'You deserve this. Every detail of this life is within your reach.',
      hi: 'आप इसके हकदार हैं। इस जीवन का हर विवरण आपकी पहुँच में है।',
    },
  },
  {
    id: 'dream-home',
    category: 'material',
    titleEn: 'Your Dream Home',
    titleHi: 'आपका सपनों का घर',
    sight: {
      en: 'You see sunlight pouring through wide windows, lighting up every room you love.',
      hi: 'आप चौड़ी खिड़कियों से सूरज की रोशनी बहती हुई देखते हैं, जो हर कमरे को रोशन करती है।',
    },
    touch: {
      en: 'You feel the smooth banister under your hand as you walk through your own front door.',
      hi: 'जैसे ही आप अपने घर के दरवाज़े से अंदर चलते हैं, आप अपने हाथ के नीचे चिकनी रेलिंग महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The kitchen smells of something warm and homemade, filling every corner with comfort.',
      hi: 'रसोई से कुछ गर्म और घर का बना हुआ स्वाद आता है, जो हर कोने को आराम से भर देता है।',
    },
    affirmation: {
      en: 'This is your sanctuary. You have built a place that is truly home.',
      hi: 'यह आपका आश्रय है। आपने एक ऐसी जगह बनाई है जो सच में घर है।',
    },
  },
  {
    id: 'private-jet',
    category: 'material',
    titleEn: 'Flying in Your Private Jet',
    titleHi: 'अपने निजी जेट में उड़ान भरना',
    sight: {
      en: 'You see the clouds drifting below as the cabin glows with soft golden light.',
      hi: 'आप बादलों को नीचे बहते हुए देखते हैं, जबकि केबिन नरम सुनहरी रोशनी से चमक रहा है।',
    },
    touch: {
      en: 'You feel the plush leather seat cradle you as the engines hum steadily.',
      hi: 'आप चमड़े की मुलायम सीट को अपने चारों ओर महसूस करते हैं, जबकि इंजन स्थिर रूप से गुनगुना रहे हैं।',
    },
    tasteSmell: {
      en: 'A fresh glass of juice sits beside you, crisp and cool in the quiet cabin.',
      hi: 'आपके पास एक ताज़ा गिलास जूस रखा है, शांत केबिन में ठंडा और ताज़ा।',
    },
    affirmation: {
      en: 'The whole world is open to you. You move through life with true freedom.',
      hi: 'पूरी दुनिया आपके लिए खुली है। आप सच्ची स्वतंत्रता के साथ जीवन में आगे बढ़ते हैं।',
    },
  },
  {
    id: 'designer-wardrobe',
    category: 'material',
    titleEn: 'Your Beautiful Designer Wardrobe',
    titleHi: 'आपकी सुंदर डिज़ाइनर अलमारी',
    sight: {
      en: 'You see rows of perfectly tailored clothes, each one chosen with care.',
      hi: 'आप बड़े करीने से सिले हुए कपड़ों की पंक्तियाँ देखते हैं, हर एक को ध्यान से चुना गया है।',
    },
    touch: {
      en: 'You feel the soft, fine fabric glide over your skin as you dress with confidence.',
      hi: 'जैसे ही आप आत्मविश्वास के साथ तैयार होते हैं, आप त्वचा पर मुलायम, बारीक कपड़े को सरकते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'A light, elegant fragrance lingers in the air of your dressing room.',
      hi: 'आपके ड्रेसिंग रूम की हवा में एक हल्की, सुरुचिपूर्ण खुशबू बनी रहती है।',
    },
    affirmation: {
      en: 'You carry yourself with grace. You feel confident, polished, and truly yourself.',
      hi: 'आप खुद को शालीनता के साथ प्रस्तुत करते हैं। आप आत्मविश्वासी, निखरे हुए और सच में खुद जैसा महसूस करते हैं।',
    },
  },
  {
    id: 'waterfront-villa',
    category: 'material',
    titleEn: 'Your Waterfront Villa',
    titleHi: 'आपका जलतटीय विला',
    sight: {
      en: 'You see the ocean stretching endlessly from your private terrace, waves catching the light.',
      hi: 'आप अपने निजी छत से समुद्र को अनंत तक फैला हुआ देखते हैं, लहरें रोशनी को पकड़ रही हैं।',
    },
    touch: {
      en: 'You feel warm stone tiles beneath your bare feet as you step outside.',
      hi: 'जैसे ही आप बाहर कदम रखते हैं, आप अपने नंगे पैरों के नीचे गर्म पत्थर की टाइलें महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The salty ocean breeze mixes with the fragrance of blooming garden flowers.',
      hi: 'नमकीन समुद्री हवा बगीचे में खिले फूलों की खुशबू के साथ मिल जाती है।',
    },
    affirmation: {
      en: 'You have created a life of peace and beauty. This is truly yours.',
      hi: 'आपने शांति और सुंदरता से भरा जीवन बनाया है। यह सच में आपका है।',
    },
  },
  {
    id: 'art-collection',
    category: 'material',
    titleEn: 'Your Growing Art Collection',
    titleHi: 'आपका बढ़ता हुआ कला संग्रह',
    sight: {
      en: 'You see vivid canvases lining your walls, each piece telling its own story.',
      hi: 'आप अपनी दीवारों पर जीवंत कैनवस देखते हैं, हर टुकड़ा अपनी अनूठी कहानी कहता है।',
    },
    touch: {
      en: 'You feel the raised texture of paint under your fingertips as you admire a favorite piece.',
      hi: 'जैसे ही आप अपनी पसंदीदा कृति की सराहना करते हैं, आप अपनी उंगलियों के नीचे रंग की उभरी हुई बनावट महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The gallery air carries a faint scent of oil paint and polished wood.',
      hi: 'गैलरी की हवा में तेल के रंग और पॉलिश की हुई लकड़ी की हल्की खुशबू है।',
    },
    affirmation: {
      en: 'Beauty surrounds you. Your taste and vision reflect who you truly are.',
      hi: 'सुंदरता आपको घेरे हुए है। आपकी पसंद और दृष्टि दर्शाती है कि आप वास्तव में कौन हैं।',
    },
  },
  {
    id: 'yacht',
    category: 'material',
    titleEn: 'Sailing on Your Own Yacht',
    titleHi: 'अपनी खुद की नौका पर नौकायन',
    sight: {
      en: 'You see the deep blue water stretching to the horizon as the sails catch the wind.',
      hi: 'आप गहरे नीले पानी को क्षितिज तक फैला हुआ देखते हैं जबकि पाल हवा को पकड़ रहे हैं।',
    },
    touch: {
      en: 'You feel the gentle rock of the deck beneath your feet, steady and calming.',
      hi: 'आप अपने पैरों के नीचे डेक की हल्की सी हलचल महसूस करते हैं, स्थिर और शांतिदायक।',
    },
    tasteSmell: {
      en: 'The fresh sea air fills your lungs, clean and boundless.',
      hi: 'ताज़ी समुद्री हवा आपके फेफड़ों को भर देती है, स्वच्छ और असीम।',
    },
    affirmation: {
      en: 'You are free to explore. Life feels open, vast, and full of possibility.',
      hi: 'आप स्वतंत्र रूप से खोज कर सकते हैं। जीवन खुला, विशाल और संभावनाओं से भरा महसूस होता है।',
    },
  },
  {
    id: 'watch-collection',
    category: 'material',
    titleEn: 'Your Fine Watch Collection',
    titleHi: 'आपका उत्तम घड़ी संग्रह',
    sight: {
      en: 'You see the intricate craftsmanship gleaming on your wrist, every detail precise.',
      hi: 'आप अपनी कलाई पर बारीक शिल्पकारी को चमकते हुए देखते हैं, हर विवरण सटीक है।',
    },
    touch: {
      en: 'You feel the cool metal band settle comfortably against your skin.',
      hi: 'आप ठंडे धातु के पट्टे को अपनी त्वचा के आराम से टिका हुआ महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The case opens with a faint, satisfying scent of fine leather and polish.',
      hi: 'बॉक्स खुलते ही महीन चमड़े और पॉलिश की एक हल्की, संतोषजनक खुशबू आती है।',
    },
    affirmation: {
      en: 'You appreciate quality and craftsmanship. Every detail of your life reflects that care.',
      hi: 'आप गुणवत्ता और शिल्पकारी की सराहना करते हैं। आपके जीवन का हर विवरण उस देखभाल को दर्शाता है।',
    },
  },

  // ---- Home & Family ----
  {
    id: 'cozy-family-gathering',
    category: 'home-family',
    titleEn: 'A Warm Family Gathering',
    titleHi: 'एक गर्मजोशी भरा पारिवारिक मिलन',
    sight: {
      en: 'You see everyone you love gathered around the table, faces glowing with warmth.',
      hi: 'आप अपने सभी प्रियजनों को मेज़ के चारों ओर इकट्ठा देखते हैं, चेहरे गर्मजोशी से चमक रहे हैं।',
    },
    touch: {
      en: 'You feel a familiar hand resting gently on your shoulder.',
      hi: 'आप अपने कंधे पर धीरे से टिके हुए एक जाना-पहचाना हाथ महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The smell of a home-cooked meal fills the air, rich and comforting.',
      hi: 'घर के बने भोजन की खुशबू हवा में भरी है, समृद्ध और सुकून देने वाली।',
    },
    affirmation: {
      en: 'You are surrounded by love. This connection is a true gift.',
      hi: 'आप प्यार से घिरे हुए हैं। यह जुड़ाव एक सच्चा उपहार है।',
    },
  },
  {
    id: 'garden-sanctuary',
    category: 'home-family',
    titleEn: 'Your Peaceful Garden Sanctuary',
    titleHi: 'आपका शांत बगीचा',
    sight: {
      en: 'You see flowers blooming in every color along a winding stone path.',
      hi: 'आप एक घुमावदार पत्थर के रास्ते पर हर रंग में खिले फूल देखते हैं।',
    },
    touch: {
      en: 'You feel soft grass beneath your feet, and cool morning dew on your skin.',
      hi: 'आप अपने पैरों के नीचे मुलायम घास और अपनी त्वचा पर ठंडी सुबह की ओस महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The fragrance of blooming jasmine drifts gently on the morning air.',
      hi: 'खिले हुए चमेली की खुशबू सुबह की हवा में धीरे-धीरे बहती है।',
    },
    affirmation: {
      en: 'This is your quiet place. Peace grows here, just as freely as the flowers.',
      hi: 'यह आपकी शांत जगह है। यहाँ शांति उतनी ही स्वतंत्र रूप से उगती है जितने फूल।',
    },
  },
  {
    id: 'childs-first-steps',
    category: 'home-family',
    titleEn: "Witnessing a Child's First Steps",
    titleHi: 'एक बच्चे के पहले कदम देखना',
    sight: {
      en: 'You see tiny, wobbly steps carrying so much joy and pride.',
      hi: 'आप छोटे, डगमगाते कदम देखते हैं जो इतनी खुशी और गर्व लेकर चलते हैं।',
    },
    touch: {
      en: 'You feel tiny fingers wrap around yours, warm and trusting.',
      hi: 'आप छोटी-छोटी उंगलियों को अपनी उंगलियों के चारों ओर लिपटते हुए महसूस करते हैं, गर्म और भरोसेमंद।',
    },
    tasteSmell: {
      en: 'The soft, sweet scent of a child fills the room with pure tenderness.',
      hi: 'एक बच्चे की मुलायम, मीठी खुशबू कमरे को शुद्ध कोमलता से भर देती है।',
    },
    affirmation: {
      en: 'This moment is precious beyond words. You are exactly where you belong.',
      hi: 'यह पल शब्दों से परे अनमोल है। आप बिल्कुल वहीं हैं जहाँ आपको होना चाहिए।',
    },
  },
  {
    id: 'wedding-day',
    category: 'home-family',
    titleEn: 'Your Joyful Wedding Day',
    titleHi: 'आपका खुशियों भरा विवाह दिवस',
    sight: {
      en: 'You see loved ones smiling through happy tears as you take this important step.',
      hi: 'आप इस महत्वपूर्ण कदम को उठाते हुए प्रियजनों को खुशी के आंसुओं के साथ मुस्कुराते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel a warm hand gently holding yours, steady and full of promise.',
      hi: 'आप अपने हाथ में एक गर्म हाथ को धीरे से थामे हुए महसूस करते हैं, स्थिर और वादों से भरा।',
    },
    tasteSmell: {
      en: 'Fresh flowers and sweet celebration fill the air around you.',
      hi: 'ताज़े फूल और मीठा उत्सव आपके चारों ओर हवा को भर देते हैं।',
    },
    affirmation: {
      en: 'This is a beginning built on love. You are cherished and complete.',
      hi: 'यह प्रेम पर बना एक नया आरंभ है। आप प्रिय और परिपूर्ण हैं।',
    },
  },
  {
    id: 'reunion-loved-ones',
    category: 'home-family',
    titleEn: 'Reuniting With a Loved One',
    titleHi: 'एक प्रियजन से पुनर्मिलन',
    sight: {
      en: 'You see their familiar smile from across the room, and your heart lifts instantly.',
      hi: 'आप कमरे के उस पार उनकी जानी-पहचानी मुस्कान देखते हैं, और आपका दिल तुरंत खिल उठता है।',
    },
    touch: {
      en: 'You feel a long, warm embrace, as if no time has passed at all.',
      hi: 'आप एक लंबा, गर्मजोशी भरा आलिंगन महसूस करते हैं, जैसे कोई समय बीता ही न हो।',
    },
    tasteSmell: {
      en: 'The familiar scent of their presence brings a rush of comfort and belonging.',
      hi: 'उनकी उपस्थिति की जानी-पहचानी खुशबू आराम और अपनेपन की एक लहर लाती है।',
    },
    affirmation: {
      en: 'Connection like this never truly fades. You are home in this moment.',
      hi: 'इस तरह का जुड़ाव कभी सच में फीका नहीं पड़ता। आप इस पल में घर पर हैं।',
    },
  },
  {
    id: 'peaceful-morning-home',
    category: 'home-family',
    titleEn: 'A Peaceful Morning at Home',
    titleHi: 'घर पर एक शांत सुबह',
    sight: {
      en: 'You see soft morning light spilling across your favorite quiet corner of the house.',
      hi: 'आप घर के अपने पसंदीदा शांत कोने में सुबह की नरम रोशनी फैली हुई देखते हैं।',
    },
    touch: {
      en: 'You feel a warm mug resting comfortably in your hands.',
      hi: 'आप अपने हाथों में आराम से टिके हुए एक गर्म मग को महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The rich aroma of your favorite morning drink rises gently around you.',
      hi: 'आपके पसंदीदा सुबह के पेय की समृद्ध सुगंध आपके चारों ओर धीरे से उठती है।',
    },
    affirmation: {
      en: 'This quiet is yours. You are exactly where you need to be, right now.',
      hi: 'यह शांति आपकी है। आप अभी बिल्कुल वहीं हैं जहाँ आपको होना चाहिए।',
    },
  },

  // ---- Health & Vitality ----
  {
    id: 'radiant-health',
    category: 'health-vitality',
    titleEn: 'Radiant, Effortless Health',
    titleHi: 'उज्ज्वल, सहज स्वास्थ्य',
    sight: {
      en: 'You see yourself in the mirror, eyes bright and skin glowing with vitality.',
      hi: 'आप खुद को आईने में देखते हैं, आँखें चमकदार हैं और त्वचा जीवंतता से दमक रही है।',
    },
    touch: {
      en: 'You feel strength and ease in every movement of your body.',
      hi: 'आप अपने शरीर की हर गतिविधि में शक्ति और सहजता महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'You savor a fresh, nourishing meal that leaves you feeling light and energized.',
      hi: 'आप एक ताज़ा, पोषक भोजन का आनंद लेते हैं जो आपको हल्का और ऊर्जावान महसूस कराता है।',
    },
    affirmation: {
      en: 'Your body is strong and capable. You feel truly, fully alive.',
      hi: 'आपका शरीर मजबूत और सक्षम है। आप सच में, पूरी तरह जीवंत महसूस करते हैं।',
    },
  },
  {
    id: 'morning-run-energy',
    category: 'health-vitality',
    titleEn: 'The Energy of a Morning Run',
    titleHi: 'सुबह की दौड़ की ऊर्जा',
    sight: {
      en: 'You see the sun rising over the path ahead, painting the sky in gold.',
      hi: 'आप आगे के रास्ते पर उगते सूरज को देखते हैं, जो आकाश को सुनहरा रंग दे रहा है।',
    },
    touch: {
      en: 'You feel your heart beating strong and steady, your legs light beneath you.',
      hi: 'आप अपने दिल को मज़बूती और स्थिरता से धड़कता हुआ महसूस करते हैं, आपके पैर हल्के हैं।',
    },
    tasteSmell: {
      en: 'The crisp morning air fills your lungs with every deep breath.',
      hi: 'हर गहरी साँस के साथ ताज़ी सुबह की हवा आपके फेफड़ों को भर देती है।',
    },
    affirmation: {
      en: 'Your body moves with strength and joy. You feel unstoppable.',
      hi: 'आपका शरीर शक्ति और खुशी के साथ चलता है। आप अजेय महसूस करते हैं।',
    },
  },
  {
    id: 'deep-restful-sleep',
    category: 'health-vitality',
    titleEn: "A Deep, Restful Night's Sleep",
    titleHi: 'एक गहरी, आरामदायक रात की नींद',
    sight: {
      en: 'You see soft moonlight resting gently on your peaceful, quiet room.',
      hi: 'आप अपने शांत, स्थिर कमरे पर नरम चांदनी को धीरे से टिकी हुई देखते हैं।',
    },
    touch: {
      en: 'You feel your body sink into soft, comfortable sheets, completely relaxed.',
      hi: 'आप अपने शरीर को मुलायम, आरामदायक चादरों में डूबता हुआ महसूस करते हैं, पूरी तरह से शिथिल।',
    },
    tasteSmell: {
      en: 'A faint scent of lavender lingers softly in the calm night air.',
      hi: 'शांत रात की हवा में लैवेंडर की एक हल्की खुशबू धीरे से बनी रहती है।',
    },
    affirmation: {
      en: 'Rest comes easily to you. You wake up refreshed and renewed.',
      hi: 'आराम आपके पास आसानी से आता है। आप तरोताज़ा और नवीनीकृत होकर जागते हैं।',
    },
  },
  {
    id: 'flexible-strong-body',
    category: 'health-vitality',
    titleEn: 'A Flexible, Strong Body',
    titleHi: 'एक लचीला, मजबूत शरीर',
    sight: {
      en: 'You see yourself move with ease, every stretch smooth and controlled.',
      hi: 'आप खुद को आसानी से चलते हुए देखते हैं, हर खिंचाव सहज और नियंत्रित है।',
    },
    touch: {
      en: 'You feel your muscles lengthen and release, calm and completely in control.',
      hi: 'आप अपनी मांसपेशियों को फैलते और ढीला होते महसूस करते हैं, शांत और पूरी तरह नियंत्रण में।',
    },
    tasteSmell: {
      en: 'The quiet studio smells faintly of fresh air and clean wood floors.',
      hi: 'शांत स्टूडियो में ताज़ी हवा और साफ लकड़ी के फर्श की हल्की खुशबू है।',
    },
    affirmation: {
      en: 'Your body serves you well. You move through life with strength and grace.',
      hi: 'आपका शरीर आपकी अच्छी सेवा करता है। आप जीवन में शक्ति और सुंदरता के साथ आगे बढ़ते हैं।',
    },
  },
  {
    id: 'clear-focused-mind',
    category: 'health-vitality',
    titleEn: 'A Clear, Focused Mind',
    titleHi: 'एक स्पष्ट, केंद्रित मन',
    sight: {
      en: 'You see your thoughts arrange themselves calmly, one clear idea at a time.',
      hi: 'आप अपने विचारों को शांति से व्यवस्थित होते हुए देखते हैं, एक समय में एक स्पष्ट विचार।',
    },
    touch: {
      en: 'You feel a lightness in your mind, free of clutter and noise.',
      hi: 'आप अपने मन में एक हल्कापन महसूस करते हैं, अव्यवस्था और शोर से मुक्त।',
    },
    tasteSmell: {
      en: 'A sip of cool water feels crisp and clarifying with each breath.',
      hi: 'हर साँस के साथ ठंडे पानी का एक घूँट ताज़ा और स्पष्टता देने वाला महसूस होता है।',
    },
    affirmation: {
      en: 'Your mind is clear and sharp. You think with ease and confidence.',
      hi: 'आपका मन स्पष्ट और तीक्ष्ण है। आप सहजता और आत्मविश्वास के साथ सोचते हैं।',
    },
  },
  {
    id: 'glowing-skin-vitality',
    category: 'health-vitality',
    titleEn: 'Glowing, Healthy Vitality',
    titleHi: 'चमकती, स्वस्थ जीवंतता',
    sight: {
      en: 'You see a healthy glow reflected in the mirror, warm and naturally radiant.',
      hi: 'आप आईने में एक स्वस्थ चमक देखते हैं, गर्म और स्वाभाविक रूप से उज्ज्वल।',
    },
    touch: {
      en: 'You feel smooth, nourished skin beneath your fingertips.',
      hi: 'आप अपनी उंगलियों के नीचे मुलायम, पोषित त्वचा महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The air smells fresh and clean, like right after a gentle morning rain.',
      hi: 'हवा ताज़ी और स्वच्छ महकती है, जैसे सुबह की हल्की बारिश के ठीक बाद।',
    },
    affirmation: {
      en: 'You radiate wellness from the inside out. You feel truly well.',
      hi: 'आप अंदर से बाहर तक स्वास्थ्य से चमकते हैं। आप सच में स्वस्थ महसूस करते हैं।',
    },
  },

  // ---- Inner Peace & Spirituality ----
  {
    id: 'meditation-stillness',
    category: 'inner-peace',
    titleEn: 'Deep Meditative Stillness',
    titleHi: 'गहरी ध्यानपूर्ण शांति',
    sight: {
      en: 'You see a soft golden light glowing gently behind your closed eyes.',
      hi: 'आप अपनी बंद आँखों के पीछे एक नरम सुनहरी रोशनी को धीरे से चमकते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel your breath rise and fall, slow and completely natural.',
      hi: 'आप अपनी साँस को उठते और गिरते हुए महसूस करते हैं, धीमी और पूरी तरह स्वाभाविक।',
    },
    tasteSmell: {
      en: 'A faint scent of sandalwood drifts through the quiet, still air.',
      hi: 'शांत, स्थिर हवा में चंदन की एक हल्की खुशबू बहती है।',
    },
    affirmation: {
      en: 'In this stillness, you find everything you need. You are completely at peace.',
      hi: 'इस शांति में, आपको वह सब मिलता है जिसकी आपको ज़रूरत है। आप पूरी तरह शांत हैं।',
    },
  },
  {
    id: 'deep-gratitude',
    category: 'inner-peace',
    titleEn: 'A Wave of Deep Gratitude',
    titleHi: 'गहरे आभार की एक लहर',
    sight: {
      en: 'You see the faces of everyone who has helped shape your journey, one by one.',
      hi: 'आप उन सभी चेहरों को देखते हैं जिन्होंने आपकी यात्रा को आकार देने में मदद की, एक-एक करके।',
    },
    touch: {
      en: 'You feel warmth spreading gently through your chest.',
      hi: 'आप अपनी छाती में धीरे से गर्माहट फैलती हुई महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The air feels soft and sweet, like the quiet after a heartfelt thank you.',
      hi: 'हवा नरम और मीठी महसूस होती है, जैसे दिल से कहे गए धन्यवाद के बाद की शांति।',
    },
    affirmation: {
      en: 'You have so much to be thankful for. Gratitude fills you completely.',
      hi: 'आपके पास आभार व्यक्त करने के लिए बहुत कुछ है। कृतज्ञता आपको पूरी तरह भर देती है।',
    },
  },
  {
    id: 'forgiveness-release',
    category: 'inner-peace',
    titleEn: 'The Release of Forgiveness',
    titleHi: 'क्षमा की मुक्ति',
    sight: {
      en: 'You see an old weight lifting slowly, like fog clearing under the morning sun.',
      hi: 'आप एक पुराने बोझ को धीरे-धीरे उठते हुए देखते हैं, जैसे सुबह के सूरज के नीचे कोहरा साफ होता है।',
    },
    touch: {
      en: 'You feel your shoulders drop, lighter than they have been in a long time.',
      hi: 'आप अपने कंधों को गिरते हुए महसूस करते हैं, बहुत लंबे समय बाद इतने हल्के।',
    },
    tasteSmell: {
      en: 'The air tastes clean and new, like the start of something fresh.',
      hi: 'हवा साफ और नई महसूस होती है, जैसे कुछ नए की शुरुआत।',
    },
    affirmation: {
      en: 'You release what no longer serves you. You are free to move forward.',
      hi: 'आप उसे छोड़ देते हैं जो अब आपके काम का नहीं है। आप आगे बढ़ने के लिए स्वतंत्र हैं।',
    },
  },
  {
    id: 'spiritual-connection',
    category: 'inner-peace',
    titleEn: 'A Deep Spiritual Connection',
    titleHi: 'एक गहरा आध्यात्मिक जुड़ाव',
    sight: {
      en: 'You see soft light filtering through leaves in a quiet, sacred space.',
      hi: 'आप एक शांत, पवित्र स्थान में पत्तियों के बीच से नरम रोशनी छनती हुई देखते हैं।',
    },
    touch: {
      en: 'You feel a gentle presence surrounding you, calm and deeply reassuring.',
      hi: 'आप अपने चारों ओर एक कोमल उपस्थिति महसूस करते हैं, शांत और गहरा आश्वासन देने वाली।',
    },
    tasteSmell: {
      en: 'The faint scent of incense rises softly into the still air.',
      hi: 'धूप की हल्की खुशबू शांत हवा में धीरे से उठती है।',
    },
    affirmation: {
      en: 'You are connected to something greater than yourself. You are never truly alone.',
      hi: 'आप अपने से बड़ी किसी चीज़ से जुड़े हुए हैं। आप कभी सच में अकेले नहीं हैं।',
    },
  },
  {
    id: 'self-acceptance',
    category: 'inner-peace',
    titleEn: 'Complete Self-Acceptance',
    titleHi: 'पूर्ण आत्म-स्वीकृति',
    sight: {
      en: 'You see yourself clearly, without judgment, exactly as you truly are.',
      hi: 'आप खुद को स्पष्ट रूप से देखते हैं, बिना किसी निर्णय के, बिल्कुल वैसे ही जैसे आप सच में हैं।',
    },
    touch: {
      en: 'You feel a gentle hand of kindness resting on your own heart.',
      hi: 'आप अपने ही दिल पर दया का एक कोमल हाथ टिका हुआ महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The air feels warm and gentle, like a quiet, comforting embrace.',
      hi: 'हवा गर्म और कोमल महसूस होती है, जैसे एक शांत, सुकूनदायक आलिंगन।',
    },
    affirmation: {
      en: 'You are enough, exactly as you are. You accept yourself fully and completely.',
      hi: 'आप बिल्कुल वैसे ही पर्याप्त हैं जैसे आप हैं। आप खुद को पूरी तरह और पूर्णता से स्वीकार करते हैं।',
    },
  },
  {
    id: 'inner-calm',
    category: 'inner-peace',
    titleEn: 'A Deep, Unshakeable Inner Calm',
    titleHi: 'एक गहरी, अटल आंतरिक शांति',
    sight: {
      en: 'You see a still, glassy lake reflecting a perfectly clear sky.',
      hi: 'आप एक शांत, चिकनी झील देखते हैं जो एक बिल्कुल साफ आकाश को प्रतिबिंबित करती है।',
    },
    touch: {
      en: 'You feel completely settled, as if nothing could disturb this quiet center within you.',
      hi: 'आप पूरी तरह से स्थिर महसूस करते हैं, जैसे कुछ भी आपके भीतर के इस शांत केंद्र को हिला न सके।',
    },
    tasteSmell: {
      en: 'The air is still and clean, carrying not a single trace of hurry.',
      hi: 'हवा शांत और स्वच्छ है, इसमें जल्दबाज़ी का कोई निशान नहीं है।',
    },
    affirmation: {
      en: 'This calm lives within you always. You can return to it anytime you choose.',
      hi: 'यह शांति हमेशा आपके भीतर रहती है। आप जब चाहें इसमें वापस लौट सकते हैं।',
    },
  },

  // ---- Adventure & Travel ----
  {
    id: 'mountain-summit',
    category: 'adventure-travel',
    titleEn: 'Reaching the Mountain Summit',
    titleHi: 'पर्वत की चोटी तक पहुँचना',
    sight: {
      en: 'You see endless peaks stretching below you, bathed in golden morning light.',
      hi: 'आप अपने नीचे अनंत चोटियों को फैला हुआ देखते हैं, सुनहरी सुबह की रोशनी में नहाई हुई।',
    },
    touch: {
      en: 'You feel the cold, crisp mountain wind against your face, sharp and alive.',
      hi: 'आप अपने चेहरे पर ठंडी, तीखी पहाड़ी हवा महसूस करते हैं, तेज़ और जीवंत।',
    },
    tasteSmell: {
      en: 'The thin mountain air smells clean, pure, and completely untouched.',
      hi: 'पतली पहाड़ी हवा स्वच्छ, शुद्ध और पूरी तरह अछूती महकती है।',
    },
    affirmation: {
      en: 'You climbed this far through sheer determination. You can achieve anything you set your mind to.',
      hi: 'आप शुद्ध दृढ़ संकल्प से यहाँ तक चढ़े हैं। आप जो भी ठान लें, वह हासिल कर सकते हैं।',
    },
  },
  {
    id: 'tropical-beach',
    category: 'adventure-travel',
    titleEn: 'A Perfect Tropical Beach',
    titleHi: 'एक आदर्श उष्णकटिबंधीय समुद्र तट',
    sight: {
      en: 'You see turquoise water stretching out beneath a bright, cloudless sky.',
      hi: 'आप एक चमकीले, बादल रहित आकाश के नीचे फिरोज़ी पानी को फैला हुआ देखते हैं।',
    },
    touch: {
      en: 'You feel warm sand shifting softly beneath your bare feet.',
      hi: 'आप अपने नंगे पैरों के नीचे गर्म रेत को धीरे से खिसकते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The salty ocean breeze carries a hint of coconut and warm sun.',
      hi: 'नमकीन समुद्री हवा में नारियल और गर्म धूप की हल्की महक है।',
    },
    affirmation: {
      en: 'You are exactly where you are meant to be — free, relaxed, and at ease.',
      hi: 'आप बिल्कुल वहीं हैं जहाँ आपको होना चाहिए — स्वतंत्र, शांत, और सहज।',
    },
  },
  {
    id: 'northern-lights',
    category: 'adventure-travel',
    titleEn: 'Watching the Northern Lights Dance',
    titleHi: 'उत्तरी रोशनी को नाचते हुए देखना',
    sight: {
      en: 'You see ribbons of green and violet light swirling silently across the night sky.',
      hi: 'आप हरे और बैंगनी रंग की रोशनी की रिबन को रात के आकाश में चुपचाप घूमते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel the cold, still night air settle gently around you, wrapped in warmth as you watch.',
      hi: 'गर्माहट में लिपटे हुए, आप देखते हुए अपने चारों ओर ठंडी, स्थिर रात की हवा को धीरे से बसते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The air is crisp, sharp, and utterly silent under the vast open sky.',
      hi: 'विशाल खुले आकाश के नीचे हवा तीखी, साफ और पूरी तरह शांत है।',
    },
    affirmation: {
      en: 'You are witnessing true wonder. The world holds magic, and you are part of it.',
      hi: 'आप सच्चे आश्चर्य के साक्षी हैं। दुनिया में जादू है, और आप उसका हिस्सा हैं।',
    },
  },
  {
    id: 'ancient-ruins',
    category: 'adventure-travel',
    titleEn: 'Exploring Ancient Ruins',
    titleHi: 'प्राचीन खंडहरों की खोज',
    sight: {
      en: 'You see weathered stone columns rising against a warm, sun-drenched sky.',
      hi: 'आप गर्म, धूप से सराबोर आकाश के सामने खड़े मौसम की मार झेले हुए पत्थर के स्तंभों को देखते हैं।',
    },
    touch: {
      en: 'You feel the rough, ancient stone beneath your fingertips, worn smooth by centuries.',
      hi: 'आप अपनी उंगलियों के नीचे खुरदुरे, प्राचीन पत्थर को महसूस करते हैं, जो सदियों से चिकना हो चुका है।',
    },
    tasteSmell: {
      en: 'The dry, warm air carries the faint scent of dust and history.',
      hi: 'सूखी, गर्म हवा में धूल और इतिहास की हल्की खुशबू है।',
    },
    affirmation: {
      en: 'You are walking through time itself. Every step reveals something new about the world.',
      hi: 'आप समय के भीतर से गुज़र रहे हैं। हर कदम दुनिया के बारे में कुछ नया प्रकट करता है।',
    },
  },
  {
    id: 'road-trip-freedom',
    category: 'adventure-travel',
    titleEn: 'The Freedom of an Open Road Trip',
    titleHi: 'एक खुली सड़क यात्रा की स्वतंत्रता',
    sight: {
      en: 'You see the open highway stretching endlessly toward a wide, golden horizon.',
      hi: 'आप खुली सड़क को एक विशाल, सुनहरे क्षितिज की ओर अनंत तक फैली हुई देखते हैं।',
    },
    touch: {
      en: 'You feel warm wind rushing through your hair with the windows down.',
      hi: 'खिड़कियाँ खुली होने पर आप अपने बालों में तेज़ी से बहती गर्म हवा महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The fresh air outside smells of open fields and new adventure.',
      hi: 'बाहर की ताज़ी हवा खुले खेतों और नए साहस की खुशबू महकती है।',
    },
    affirmation: {
      en: 'The road ahead is entirely yours. Every mile brings new freedom.',
      hi: 'आगे की सड़क पूरी तरह आपकी है। हर मील एक नई स्वतंत्रता लाता है।',
    },
  },
  {
    id: 'scuba-diving-reef',
    category: 'adventure-travel',
    titleEn: 'Diving Into a Vivid Coral Reef',
    titleHi: 'एक जीवंत मूँगे की चट्टान में गोता लगाना',
    sight: {
      en: 'You see a burst of color beneath the water — fish, coral, and light dancing together.',
      hi: 'आप पानी के नीचे रंगों का एक विस्फोट देखते हैं — मछलियाँ, मूँगा, और रोशनी साथ में नाचते हुए।',
    },
    touch: {
      en: 'You feel weightless, floating gently in the cool, clear water.',
      hi: 'आप वज़नहीन महसूस करते हैं, ठंडे, साफ पानी में धीरे से तैरते हुए।',
    },
    tasteSmell: {
      en: 'You taste the faint salt of the sea with every calm, steady breath.',
      hi: 'हर शांत, स्थिर साँस के साथ आप समुद्र की हल्की नमकीनी चखते हैं।',
    },
    affirmation: {
      en: 'You are exploring a whole new world. Wonder is always within your reach.',
      hi: 'आप एक बिल्कुल नई दुनिया की खोज कर रहे हैं। आश्चर्य हमेशा आपकी पहुँच में है।',
    },
  },

  // ---- Creativity & Expression ----
  {
    id: 'painting-masterpiece',
    category: 'creativity',
    titleEn: 'Painting Your Masterpiece',
    titleHi: 'अपनी उत्कृष्ट कृति चित्रित करना',
    sight: {
      en: 'You see colors blend on the canvas exactly as you imagined them.',
      hi: 'आप कैनवास पर रंगों को बिल्कुल वैसे ही मिलते हुए देखते हैं जैसे आपने सोचा था।',
    },
    touch: {
      en: 'You feel the brush glide smoothly across the canvas beneath your hand.',
      hi: 'आप अपने हाथ के नीचे ब्रश को कैनवास पर आसानी से सरकते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The studio smells of fresh paint and quiet, focused creativity.',
      hi: 'स्टूडियो में ताज़े रंग और शांत, केंद्रित रचनात्मकता की खुशबू है।',
    },
    affirmation: {
      en: 'Your creativity flows freely. What you make matters, simply because you made it.',
      hi: 'आपकी रचनात्मकता स्वतंत्र रूप से बहती है। आपने जो बनाया वह मायने रखता है, बस इसलिए क्योंकि आपने इसे बनाया है।',
    },
  },
  {
    id: 'playing-music',
    category: 'creativity',
    titleEn: 'Playing Music That Moves You',
    titleHi: 'ऐसा संगीत बजाना जो आपको छू जाए',
    sight: {
      en: 'You see your hands move naturally, finding each note with ease.',
      hi: 'आप अपने हाथों को स्वाभाविक रूप से चलते हुए देखते हैं, आसानी से हर सुर पाते हुए।',
    },
    touch: {
      en: 'You feel the instrument vibrate gently beneath your fingers.',
      hi: 'आप अपनी उंगलियों के नीचे वाद्ययंत्र को धीरे से कंपित होते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The room fills with warm, rich sound, wrapping around you like a soft blanket.',
      hi: 'कमरा गर्म, समृद्ध ध्वनि से भर जाता है, जो आपके चारों ओर एक मुलायम कंबल की तरह लिपट जाती है।',
    },
    affirmation: {
      en: 'Music lives inside you. When you play, you speak a language beyond words.',
      hi: 'संगीत आपके भीतर बसता है। जब आप बजाते हैं, तो आप शब्दों से परे एक भाषा बोलते हैं।',
    },
  },
  {
    id: 'writing-flow',
    category: 'creativity',
    titleEn: 'Writing in Perfect, Effortless Flow',
    titleHi: 'पूर्ण, सहज प्रवाह में लिखना',
    sight: {
      en: 'You see words appear easily on the page, one thought leading naturally to the next.',
      hi: 'आप शब्दों को पन्ने पर आसानी से आते हुए देखते हैं, एक विचार स्वाभाविक रूप से अगले की ओर ले जाता है।',
    },
    touch: {
      en: 'You feel your pen move smoothly, as if the words were simply waiting to be found.',
      hi: 'आप अपनी कलम को आसानी से चलते हुए महसूस करते हैं, जैसे शब्द बस मिलने का इंतज़ार कर रहे थे।',
    },
    tasteSmell: {
      en: 'A warm cup of tea sits nearby, filling the quiet room with gentle comfort.',
      hi: 'पास में एक गर्म चाय का कप रखा है, जो शांत कमरे को कोमल आराम से भर देता है।',
    },
    affirmation: {
      en: 'Your voice matters. What you have to say is worth putting into the world.',
      hi: 'आपकी आवाज़ मायने रखती है। आपके पास जो कहने को है, वह दुनिया के सामने रखने लायक है।',
    },
  },
  {
    id: 'dancing-joy',
    category: 'creativity',
    titleEn: 'Dancing With Pure Joy',
    titleHi: 'शुद्ध खुशी के साथ नृत्य करना',
    sight: {
      en: 'You see lights swirling softly as your body moves freely to the rhythm.',
      hi: 'आप अपने शरीर को लय के साथ स्वतंत्र रूप से चलते हुए देखते हैं, जबकि रोशनी धीरे से घूमती है।',
    },
    touch: {
      en: 'You feel your body loosen with every beat, light and completely unrestrained.',
      hi: 'आप हर बीट के साथ अपने शरीर को ढीला होते हुए महसूस करते हैं, हल्का और पूरी तरह मुक्त।',
    },
    tasteSmell: {
      en: 'The warm air hums with music, energy, and pure celebration.',
      hi: 'गर्म हवा संगीत, ऊर्जा और शुद्ध उत्सव से गूंजती है।',
    },
    affirmation: {
      en: 'Joy moves through you freely. In this moment, you are completely, wonderfully alive.',
      hi: 'खुशी आपके भीतर स्वतंत्र रूप से बहती है। इस पल में, आप पूरी तरह, अद्भुत रूप से जीवंत हैं।',
    },
  },
  {
    id: 'designing-beauty',
    category: 'creativity',
    titleEn: 'Designing Something Truly Beautiful',
    titleHi: 'कुछ सच में सुंदर डिज़ाइन करना',
    sight: {
      en: 'You see your vision take shape, every line and detail exactly as you pictured.',
      hi: 'आप अपनी सोच को आकार लेते हुए देखते हैं, हर रेखा और विवरण बिल्कुल वैसा जैसा आपने कल्पना की थी।',
    },
    touch: {
      en: 'You feel the satisfying click of every piece falling perfectly into place.',
      hi: 'आप हर टुकड़े के सही जगह पर बैठने की संतोषजनक आवाज़ महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The workspace smells of fresh materials and quiet, purposeful focus.',
      hi: 'कार्यक्षेत्र में ताज़ी सामग्री और शांत, उद्देश्यपूर्ण एकाग्रता की खुशबू है।',
    },
    affirmation: {
      en: 'You see beauty where others see the ordinary. Your vision shapes the world around you.',
      hi: 'जहाँ दूसरे सामान्य देखते हैं, वहाँ आप सुंदरता देखते हैं। आपकी दृष्टि आपके आस-पास की दुनिया को आकार देती है।',
    },
  },

  // ---- Relationships & Love ----
  {
    id: 'deep-love-connection',
    category: 'relationships',
    titleEn: 'A Deep, Effortless Love Connection',
    titleHi: 'एक गहरा, सहज प्रेम जुड़ाव',
    sight: {
      en: 'You see warmth in familiar eyes that look back at you with complete understanding.',
      hi: 'आप जानी-पहचानी आँखों में गर्माहट देखते हैं जो आपको पूरी समझ के साथ देख रही हैं।',
    },
    touch: {
      en: 'You feel a hand gently intertwined with yours, warm and completely safe.',
      hi: 'आप अपने हाथ में धीरे से गुंथे हुए एक हाथ को महसूस करते हैं, गर्म और पूरी तरह सुरक्षित।',
    },
    tasteSmell: {
      en: 'The air feels soft, calm, and quietly full of trust.',
      hi: 'हवा नरम, शांत, और चुपचाप विश्वास से भरी महसूस होती है।',
    },
    affirmation: {
      en: 'You are deeply loved, exactly as you are. This connection nourishes your whole heart.',
      hi: 'आप गहराई से प्रिय हैं, बिल्कुल वैसे ही जैसे आप हैं। यह जुड़ाव आपके पूरे दिल को पोषण देता है।',
    },
  },
  {
    id: 'true-friendship',
    category: 'relationships',
    titleEn: 'The Warmth of True Friendship',
    titleHi: 'सच्ची दोस्ती की गर्माहट',
    sight: {
      en: 'You see genuine laughter light up a familiar, trusted face.',
      hi: 'आप एक जानी-पहचानी, भरोसेमंद चेहरे पर सच्ची हँसी को खिलते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel an easy, comfortable closeness, with nothing left unsaid.',
      hi: 'आप एक सहज, आरामदायक निकटता महसूस करते हैं, जिसमें कुछ भी अनकहा नहीं रह जाता।',
    },
    tasteSmell: {
      en: 'You share a simple meal together, familiar and full of easy comfort.',
      hi: 'आप एक साथ एक साधारण भोजन साझा करते हैं, जाना-पहचाना और सहज आराम से भरा।',
    },
    affirmation: {
      en: 'True friendship is a rare gift. You are grateful for those who truly know you.',
      hi: 'सच्ची दोस्ती एक दुर्लभ उपहार है। आप उनके आभारी हैं जो वाकई आपको जानते हैं।',
    },
  },
  {
    id: 'mentors-guidance',
    category: 'relationships',
    titleEn: "Receiving a Mentor's Wisdom",
    titleHi: 'एक गुरु की बुद्धिमत्ता प्राप्त करना',
    sight: {
      en: 'You see calm, knowing eyes that have walked the path before you.',
      hi: 'आप शांत, जानी-मानी आँखें देखते हैं जो आपसे पहले इस रास्ते पर चल चुकी हैं।',
    },
    touch: {
      en: 'You feel a reassuring hand on your shoulder, steady and encouraging.',
      hi: 'आप अपने कंधे पर एक आश्वस्त करने वाला हाथ महसूस करते हैं, स्थिर और प्रोत्साहित करने वाला।',
    },
    tasteSmell: {
      en: 'You share a quiet cup of tea while wisdom is passed gently between you.',
      hi: 'आप एक शांत कप चाय साझा करते हैं जबकि बुद्धिमत्ता आपके बीच धीरे से बहती है।',
    },
    affirmation: {
      en: 'You are guided and supported. You do not have to find your way alone.',
      hi: 'आपका मार्गदर्शन और समर्थन किया जा रहा है। आपको अकेले अपना रास्ता नहीं खोजना है।',
    },
  },
  {
    id: 'community-belonging',
    category: 'relationships',
    titleEn: 'A Deep Sense of Belonging',
    titleHi: 'अपनेपन की गहरी भावना',
    sight: {
      en: 'You see familiar faces welcoming you with open arms and genuine warmth.',
      hi: 'आप जानी-पहचानी चेहरों को खुली बाहों और सच्ची गर्मजोशी से आपका स्वागत करते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel completely at ease, wrapped in a sense of shared understanding.',
      hi: 'आप पूरी तरह सहज महसूस करते हैं, साझा समझ की भावना में लिपटे हुए।',
    },
    tasteSmell: {
      en: 'The air carries the shared warmth of good food and easy conversation.',
      hi: 'हवा में अच्छे भोजन और सहज बातचीत की साझा गर्माहट है।',
    },
    affirmation: {
      en: 'You belong here, exactly as you are. This community holds a place just for you.',
      hi: 'आप यहाँ के हैं, बिल्कुल वैसे ही जैसे आप हैं। यह समुदाय आपके लिए एक जगह रखता है।',
    },
  },
  {
    id: 'laughter-with-friends',
    category: 'relationships',
    titleEn: 'Easy Laughter With Close Friends',
    titleHi: 'करीबी दोस्तों के साथ सहज हँसी',
    sight: {
      en: 'You see bright smiles and tears of laughter around a table full of joy.',
      hi: 'आप खुशी से भरी मेज़ के चारों ओर उज्ज्वल मुस्कानें और हँसी के आँसू देखते हैं।',
    },
    touch: {
      en: 'You feel your chest warm with the simple joy of being fully present.',
      hi: 'आप पूरी तरह मौजूद होने की सरल खुशी से अपनी छाती को गर्म महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The table is full of shared food, familiar and delicious.',
      hi: 'मेज़ साझा किए गए भोजन से भरी है, जाना-पहचाना और स्वादिष्ट।',
    },
    affirmation: {
      en: "These simple moments are life's greatest treasures. You are exactly where joy lives.",
      hi: 'ये सरल पल जीवन के सबसे बड़े खज़ाने हैं। आप बिल्कुल वहीं हैं जहाँ खुशी बसती है।',
    },
  },

  // ---- Sensory Anchors (foundational, object-level) ----
  {
    id: 'crisp-apple',
    category: 'sensory-anchor',
    titleEn: 'A Crisp, Fresh Apple',
    titleHi: 'एक कुरकुरा, ताज़ा सेब',
    sight: {
      en: 'You see its bright red skin, smooth and glossy under soft light.',
      hi: 'आप इसकी चमकदार लाल त्वचा देखते हैं, नरम रोशनी में चिकनी और चमकदार।',
    },
    touch: {
      en: 'You feel its cool, firm surface resting in the palm of your hand.',
      hi: 'आप इसकी ठंडी, दृढ़ सतह को अपनी हथेली में टिकी हुई महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'You bite in, and taste a burst of sweet, crisp juice.',
      hi: 'आप एक काट लेते हैं, और मीठे, कुरकुरे रस का एक विस्फोट चखते हैं।',
    },
    affirmation: {
      en: 'Even the simplest things hold real beauty, when you truly pay attention.',
      hi: 'जब आप वाकई ध्यान देते हैं, तो सबसे साधारण चीज़ों में भी सच्ची सुंदरता होती है।',
    },
  },
  {
    id: 'ocean-waves',
    category: 'sensory-anchor',
    titleEn: 'The Rhythm of Ocean Waves',
    titleHi: 'समुद्र की लहरों की लय',
    sight: {
      en: 'You see waves rolling in steadily, white foam catching the light.',
      hi: 'आप लहरों को लगातार लुढ़कते हुए देखते हैं, सफेद झाग रोशनी को पकड़ रहा है।',
    },
    touch: {
      en: 'You feel cool water wash gently over your bare feet.',
      hi: 'आप ठंडे पानी को अपने नंगे पैरों पर धीरे से बहते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The salty sea air fills your lungs with every steady breath.',
      hi: 'हर स्थिर साँस के साथ नमकीन समुद्री हवा आपके फेफड़ों को भर देती है।',
    },
    affirmation: {
      en: 'Like the waves, you can always return to a steady, natural rhythm.',
      hi: 'लहरों की तरह, आप हमेशा एक स्थिर, स्वाभाविक लय में वापस लौट सकते हैं।',
    },
  },
  {
    id: 'candle-flame',
    category: 'sensory-anchor',
    titleEn: 'A Single, Steady Candle Flame',
    titleHi: 'एक अकेली, स्थिर मोमबत्ती की लौ',
    sight: {
      en: 'You see a small flame flickering gently, warm gold against the quiet dark.',
      hi: 'आप एक छोटी सी लौ को धीरे से टिमटिमाते हुए देखते हैं, शांत अंधेरे के सामने गर्म सुनहरी।',
    },
    touch: {
      en: 'You feel its gentle warmth reaching softly toward your skin.',
      hi: 'आप इसकी कोमल गर्माहट को अपनी त्वचा की ओर धीरे से पहुँचते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'A faint, warm scent of melting wax drifts softly through the air.',
      hi: 'पिघलते मोम की एक हल्की, गर्म खुशबू हवा में धीरे से बहती है।',
    },
    affirmation: {
      en: 'Like this flame, your inner light stays steady, even in the quiet dark.',
      hi: 'इस लौ की तरह, आपकी भीतरी रोशनी शांत अंधेरे में भी स्थिर बनी रहती है।',
    },
  },
  {
    id: 'fresh-rain',
    category: 'sensory-anchor',
    titleEn: 'The Scent of Fresh Rain',
    titleHi: 'ताज़ी बारिश की खुशबू',
    sight: {
      en: 'You see raindrops tracing gentle paths down a cool windowpane.',
      hi: 'आप बारिश की बूंदों को एक ठंडी खिड़की पर धीरे-धीरे रास्ता बनाते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel a cool mist settle softly on your skin.',
      hi: 'आप एक ठंडी फुहार को अपनी त्वचा पर धीरे से बसती हुई महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'You breathe in that unmistakable, earthy scent of rain on warm ground.',
      hi: 'आप गर्म ज़मीन पर बारिश की उस खास, मिट्टी जैसी खुशबू को अंदर खींचते हैं।',
    },
    affirmation: {
      en: 'Renewal comes gently, like rain after a long, dry season.',
      hi: 'नवीनीकरण धीरे से आता है, जैसे एक लंबे, सूखे मौसम के बाद बारिश।',
    },
  },
  {
    id: 'warm-sunlight',
    category: 'sensory-anchor',
    titleEn: 'Warm Sunlight on Your Skin',
    titleHi: 'आपकी त्वचा पर गर्म धूप',
    sight: {
      en: 'You see golden light spilling softly across everything it touches.',
      hi: 'आप सुनहरी रोशनी को हर उस चीज़ पर धीरे से फैलती हुई देखते हैं जिसे यह छूती है।',
    },
    touch: {
      en: 'You feel gentle warmth spreading slowly across your skin.',
      hi: 'आप कोमल गर्माहट को अपनी त्वचा पर धीरे-धीरे फैलते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'The warm air carries the faint, sweet scent of a sunlit afternoon.',
      hi: 'गर्म हवा में एक धूप भरी दोपहर की हल्की, मीठी खुशबू है।',
    },
    affirmation: {
      en: 'Warmth and light are always available to you, simply by turning toward them.',
      hi: 'गर्माहट और रोशनी हमेशा आपके लिए उपलब्ध हैं, बस उनकी ओर मुड़ने भर से।',
    },
  },
  {
    id: 'mountain-breeze',
    category: 'sensory-anchor',
    titleEn: 'A Cool, Gentle Mountain Breeze',
    titleHi: 'एक ठंडी, कोमल पहाड़ी हवा',
    sight: {
      en: 'You see tall pine trees swaying gently against a clear, open sky.',
      hi: 'आप ऊँचे चीड़ के पेड़ों को एक साफ, खुले आकाश के सामने धीरे से झूमते हुए देखते हैं।',
    },
    touch: {
      en: 'You feel cool, fresh air brushing softly against your face.',
      hi: 'आप ठंडी, ताज़ी हवा को अपने चेहरे को धीरे से छूते हुए महसूस करते हैं।',
    },
    tasteSmell: {
      en: 'You breathe in clean, pine-scented air, crisp and completely refreshing.',
      hi: 'आप स्वच्छ, चीड़ की खुशबू वाली हवा अंदर खींचते हैं, तीखी और पूरी तरह तरोताज़ा करने वाली।',
    },
    affirmation: {
      en: 'Clarity comes easily here, carried gently on every breath of fresh air.',
      hi: 'यहाँ स्पष्टता आसानी से आती है, ताज़ी हवा की हर साँस पर धीरे से सवार होकर।',
    },
  },
] as const

export const TOTAL_HOLOGRAM_GOALS = HOLOGRAM_GOALS.length

export function getHologramGoalById(id: string): HologramGoal | undefined {
  return HOLOGRAM_GOALS.find((goal) => goal.id === id)
}

export function groupHologramGoalsByCategory(): Record<HologramCategory, HologramGoal[]> {
  const grouped = Object.fromEntries(HOLOGRAM_CATEGORIES.map((category) => [category, [] as HologramGoal[]])) as Record<
    HologramCategory,
    HologramGoal[]
  >
  for (const goal of HOLOGRAM_GOALS) {
    grouped[goal.category].push(goal)
  }
  return grouped
}

export type Lang = "en" | "hi";

export const translations = {
  en: {
    nav: {
      links: [
        { label: "Speed Reading", href: "#tier-1" },
        { label: "Retreats", href: "#tier-2" },
        { label: "Mentoring", href: "#tier-3" },
        { label: "Habit App", href: "#tier-4" },
      ],
      ctaSecondary: "Try Habit App",
      ctaPrimary: "Explore Speed Reading",
    },
    hero: {
      eyebrow: "Dr. Kapil Dev Sharma — Mind Ur Mind",
      headline: "Read at the speed of thought.",
      headlineEm: "Then go further — into psychic and spiritual mastery.",
      sub: "The core transformation is Quantum Speed Reading — a full mental performance rebuild. Beyond it: advanced Psychic & Spiritual Masterminds for those going deeper. If you're not ready to commit, the Habit App is a free, low-pressure way to start.",
      ctaPrimary: "Explore Quantum Speed Reading",
      ctaSecondary: "Try the Habit App — Free",
      portraitName: "Dr. Kapil Dev Sharma",
      portraitTitle: "Founder, Mind Ur Mind",
      stats: [
        { value: "30-Day Streak", label: "Quantum Speed Reading" },
        { value: "11 Days, Monthly", label: "Online Psychic & Spiritual Retreat" },
        { value: "3–4× / Year", label: "Residential · Rishikesh & Lonavala" },
        { value: "1-on-1", label: "Personal Class" },
        { value: "7 Days Free, Then ₹99", label: "Habit App" },
      ],
    },
    tier1: {
      eyebrow: "Tier 01 · Prime Flagship",
      title: "Quantum Speed Reading",
      titleEm: "30-Day Masterclass",
      desc: "Not a webinar. A 30-day rebuild of how your mind processes information — for students, professionals, and lifelong learners of every age.",
      features: [
        "30-day progressive app streak with daily drills",
        "7 live masterclass sessions with Dr. Sharma",
        "WPM & comprehension tracking, not just raw speed",
        "Designed for every age group and reading level",
      ],
      cta: "View Curriculum & Enroll",
      visualCaption: "Day 22 of 30 · Streak Active",
    },
    tier2: {
      eyebrow: "Tier 02 · Deep Immersive Retreats",
      title: "Go beyond technique —",
      titleEm: "into direct experience",
      desc: "For those ready to move past reading and into the psychic and spiritual dimensions of the mind, online or in person.",
      online: {
        tag: "Online · Monthly Batch",
        title: "11-Day Online Psychic & Spiritual & Mastery Retreat",
        desc: "An intensive, live, 11-day journey through the core psychic and spiritual disciplines — guided daily by Dr. Sharma.",
        pills: [
          "Telepathy Send/Receive",
          "Aura Scanning & Reading",
          "Samadhi Meditation",
          "Chakra Activation & Enlightenment",
          "Kundalini Meditation",
          "Astral Projection",
        ],
        cta: "See Next Batch Dates",
      },
      residential: {
        tag: "In-Person · 3–4× a Year",
        title: "Residential Retreats",
        desc: "Small-group, fully immersive retreats held in Rishikesh and Lonavala — the deepest format Mind Ur Mind offers.",
        pills: ["Rishikesh", "Lonavala", "Small Group, Exclusive", "Full Immersion"],
        cta: "View Upcoming Dates",
      },
    },
    tier3: {
      eyebrow: "Tier 03 · Specialized & 1-on-1",
      title: "Precise work for a",
      titleEm: "specific problem",
      desc: "Not everyone needs a retreat. Some people need one mind fixed on one thing — starting with their own.",
      mentoring: {
        tag: "Private · Custom Intensity",
        title: "Personal Class — 1-on-1 Intensive Mentoring",
        desc: "Direct, private mentoring with Dr. Sharma, fully customized — for stress, anxiety, or a specific spiritual breakthrough.",
        pills: ["Stress & Anxiety", "Spiritual Breakthroughs", "Fully Customized"],
        cta: "Apply for Personal Class",
      },
      course: {
        tag: "21-Day Program",
        title: "Overthinking Mastery Course",
        desc: "A focused, 21-day course built to interrupt the overthinking loop — practical, daily, specific.",
        pills: ["Daily Practice", "21 Days", "Mental Clarity Focus"],
        cta: "Start the 21-Day Course",
      },
    },
    tier4: {
      eyebrow: "Not Ready to Commit Yet?",
      title: "Habit App — Build the Daily Practice First",
      desc: "7 days completely free, then a one-time ₹99 to keep full access. No subscription, no pressure — just a clean, low-friction way to start a daily mindfulness habit.",
      cta: "Start Free 7 Days",
    },
    testimonials: {
      eyebrow: "Real People, Real Shifts",
      title: "What changes when the mind changes",
      desc: "A few of the people who moved through these programs — in their own words.",
      viewAll: "Watch More Stories",
      items: [
        {
          name: "Ananya R.",
          program: "Quantum Speed Reading",
          quote: "I finished two books in the time it used to take me to finish one chapter.",
        },
        {
          name: "Vikram S.",
          program: "11-Day Online Retreat",
          quote: "The Kundalini sessions alone were worth the entire eleven days.",
        },
        {
          name: "Priya M.",
          program: "Personal Class",
          quote: "Six private sessions did what years of general advice never managed.",
        },
        {
          name: "Rohan K.",
          program: "Overthinking Mastery",
          quote: "Twenty-one days, and the loop in my head finally went quiet.",
        },
      ],
    },
    footer: {
      blurb: "Quantum Speed Reading and advanced Psychic & Spiritual training under Dr. Kapil Dev Sharma.",
      columns: {
        programs: {
          heading: "Programs",
          links: [{ label: "Quantum Speed Reading", href: "/programs/quantum-speed-reading" }],
        },
        retreats: {
          heading: "Retreats",
          links: [
            { label: "Online 11-Day Retreat", href: "/retreats/online-11-day" },
            { label: "Residential Retreats", href: "/retreats/residential" },
          ],
        },
        mentoring: {
          heading: "Mentoring",
          links: [
            { label: "Personal Class (1-on-1)", href: "/mentoring/personal-class" },
            { label: "Overthinking Mastery", href: "/courses/overthinking-mastery" },
          ],
        },
        habitApp: {
          heading: "Habit App",
          links: [{ label: "7 Days Free, Then ₹99", href: "/app/habit-app" }],
        },
        philosophy: {
          heading: "Dr. Kapil's Philosophy",
          links: [
            { label: "About Dr. Sharma", href: "/about" },
            { label: "Contact", href: "/contact" },
          ],
        },
      },
      copyright: "© Mind Ur Mind. mindurmind.org.in",
      location: "Delhi, India",
    },
  },

  hi: {
    nav: {
      links: [
        { label: "स्पीड रीडिंग", href: "#tier-1" },
        { label: "रिट्रीट्स", href: "#tier-2" },
        { label: "मेंटरिंग", href: "#tier-3" },
        { label: "हैबिट ऐप", href: "#tier-4" },
      ],
      ctaSecondary: "हैबिट ऐप आज़माएं",
      ctaPrimary: "स्पीड रीडिंग एक्सप्लोर करें",
    },
    hero: {
      eyebrow: "डॉ. कपिल देव शर्मा — माइंड उर माइंड",
      headline: "विचार की गति से पढ़ें।",
      headlineEm: "फिर उससे भी आगे — मानसिक और आध्यात्मिक सिद्धि की ओर।",
      sub: "मूल रूपांतरण है क्वांटम स्पीड रीडिंग — आपके मानसिक प्रदर्शन का संपूर्ण पुनर्निर्माण। इससे आगे हैं उन्नत साइकिक और स्पिरिचुअल मास्टरमाइंड कार्यक्रम, गहराई तक जाने वालों के लिए। यदि आप अभी प्रतिबद्ध होने के लिए तैयार नहीं हैं, तो हैबिट ऐप शुरुआत करने का एक मुफ़्त, सहज तरीका है।",
      ctaPrimary: "क्वांटम स्पीड रीडिंग एक्सप्लोर करें",
      ctaSecondary: "हैबिट ऐप मुफ़्त में आज़माएं",
      portraitName: "डॉ. कपिल देव शर्मा",
      portraitTitle: "संस्थापक, माइंड उर माइंड",
      stats: [
        { value: "30-दिन की स्ट्रीक", label: "क्वांटम स्पीड रीडिंग" },
        { value: "11 दिन, मासिक", label: "ऑनलाइन साइकिक एंड स्पिरिचुअल रिट्रीट" },
        { value: "वर्ष में 3–4 बार", label: "रेजिडेंशियल · ऋषिकेश और लोनावला" },
        { value: "1-ऑन-1", label: "पर्सनल क्लास" },
        { value: "7 दिन मुफ़्त, फिर ₹99", label: "हैबिट ऐप" },
      ],
    },
    tier1: {
      eyebrow: "टियर 01 · प्रमुख फ्लैगशिप",
      title: "क्वांटम स्पीड रीडिंग",
      titleEm: "30-दिवसीय मास्टरक्लास",
      desc: "यह कोई वेबिनार नहीं है। यह हर आयु वर्ग के विद्यार्थियों, पेशेवरों और आजीवन सीखने वालों के लिए, आपके मस्तिष्क की सूचना प्रोसेस करने की क्षमता का 30-दिवसीय पुनर्निर्माण है।",
      features: [
        "दैनिक अभ्यास के साथ 30-दिवसीय प्रगतिशील ऐप स्ट्रीक",
        "डॉ. शर्मा के साथ 7 लाइव मास्टरक्लास सत्र",
        "केवल गति नहीं, बल्कि WPM और समझ (comprehension) की ट्रैकिंग",
        "हर आयु वर्ग और पठन-स्तर के लिए उपयुक्त",
      ],
      cta: "पाठ्यक्रम देखें और नामांकन करें",
      visualCaption: "30 में से दिन 22 · स्ट्रीक सक्रिय",
    },
    tier2: {
      eyebrow: "टियर 02 · गहन इमर्सिव रिट्रीट",
      title: "तकनीक से आगे —",
      titleEm: "प्रत्यक्ष अनुभव की ओर",
      desc: "जो लोग रीडिंग से आगे बढ़कर मन के साइकिक और आध्यात्मिक आयामों में जाने के लिए तैयार हैं, उनके लिए — ऑनलाइन या व्यक्तिगत रूप से।",
      online: {
        tag: "ऑनलाइन · मासिक बैच",
        title: "11-दिवसीय ऑनलाइन साइकिक एंड स्पिरिचुअल एंड मास्टरी रिट्रीट",
        desc: "मुख्य साइकिक और आध्यात्मिक अनुशासनों के माध्यम से एक गहन, लाइव, 11-दिवसीय यात्रा — प्रतिदिन डॉ. शर्मा द्वारा मार्गदर्शित।",
        pills: [
          "टेलीपैथी भेजना/प्राप्त करना",
          "आभा स्कैनिंग और रीडिंग",
          "समाधि ध्यान",
          "चक्र सक्रियण और ज्ञानोदय",
          "कुंडलिनी ध्यान",
          "एस्ट्रल प्रोजेक्शन",
        ],
        cta: "अगले बैच की तारीखें देखें",
      },
      residential: {
        tag: "व्यक्तिगत उपस्थिति · वर्ष में 3–4 बार",
        title: "रेजिडेंशियल रिट्रीट",
        desc: "ऋषिकेश और लोनावला में आयोजित छोटे-समूह, पूर्ण-विसर्जन रिट्रीट — माइंड उर माइंड का सबसे गहन प्रारूप।",
        pills: ["ऋषिकेश", "लोनावला", "छोटा समूह, एक्सक्लूसिव", "पूर्ण विसर्जन"],
        cta: "आगामी तारीखें देखें",
      },
    },
    tier3: {
      eyebrow: "टियर 03 · विशेष एवं 1-ऑन-1",
      title: "एक विशिष्ट समस्या के लिए",
      titleEm: "सटीक कार्य",
      desc: "हर किसी को रिट्रीट की ज़रूरत नहीं होती। कुछ लोगों को बस एक चीज़ पर केंद्रित मन चाहिए होता है — अपने ही मन से शुरुआत करते हुए।",
      mentoring: {
        tag: "निजी · कस्टम इंटेंसिटी",
        title: "पर्सनल क्लास — 1-ऑन-1 इंटेंसिव मेंटरिंग",
        desc: "डॉ. शर्मा के साथ सीधा, निजी मार्गदर्शन, पूरी तरह कस्टमाइज़्ड — तनाव, चिंता, या किसी विशेष आध्यात्मिक सफलता के लिए।",
        pills: ["तनाव और चिंता", "आध्यात्मिक सफलताएं", "पूरी तरह कस्टमाइज़्ड"],
        cta: "पर्सनल क्लास के लिए आवेदन करें",
      },
      course: {
        tag: "21-दिवसीय कार्यक्रम",
        title: "ओवरथिंकिंग मास्टरी कोर्स",
        desc: "ओवरथिंकिंग के चक्र को तोड़ने के लिए बनाया गया एक केंद्रित, 21-दिवसीय कोर्स — व्यावहारिक, दैनिक, विशिष्ट।",
        pills: ["दैनिक अभ्यास", "21 दिन", "मानसिक स्पष्टता पर केंद्रित"],
        cta: "21-दिवसीय कोर्स शुरू करें",
      },
    },
    tier4: {
      eyebrow: "अभी प्रतिबद्ध होने के लिए तैयार नहीं?",
      title: "हैबिट ऐप — पहले दैनिक अभ्यास बनाएं",
      desc: "7 दिन पूरी तरह मुफ़्त, फिर पूर्ण एक्सेस के लिए एकमुश्त ₹99। कोई सब्सक्रिप्शन नहीं, कोई दबाव नहीं — बस दैनिक माइंडफुलनेस की आदत शुरू करने का एक सहज तरीका।",
      cta: "7 दिन मुफ़्त शुरू करें",
    },
    testimonials: {
      eyebrow: "वास्तविक लोग, वास्तविक बदलाव",
      title: "जब मन बदलता है, तो क्या बदलता है",
      desc: "इन कार्यक्रमों से गुज़रे कुछ लोग — उन्हीं के शब्दों में।",
      viewAll: "और कहानियां देखें",
      items: [
        {
          name: "अनन्या आर.",
          program: "क्वांटम स्पीड रीडिंग",
          quote: "जितने समय में पहले एक अध्याय पूरा होता था, अब उतने समय में दो किताबें पूरी हो जाती हैं।",
        },
        {
          name: "विक्रम एस.",
          program: "11-दिवसीय ऑनलाइन रिट्रीट",
          quote: "अकेले कुंडलिनी सत्र ही पूरे ग्यारह दिनों के लायक थे।",
        },
        {
          name: "प्रिया एम.",
          program: "पर्सनल क्लास",
          quote: "छह निजी सत्रों ने वह कर दिखाया जो वर्षों की सामान्य सलाह कभी नहीं कर पाई।",
        },
        {
          name: "रोहन के.",
          program: "ओवरथिंकिंग मास्टरी",
          quote: "इक्कीस दिन, और आखिरकार मेरे सिर का शोर शांत हो गया।",
        },
      ],
    },
    footer: {
      blurb: "डॉ. कपिल देव शर्मा के मार्गदर्शन में क्वांटम स्पीड रीडिंग और उन्नत साइकिक व स्पिरिचुअल प्रशिक्षण।",
      columns: {
        programs: {
          heading: "प्रोग्राम्स",
          links: [{ label: "क्वांटम स्पीड रीडिंग", href: "/programs/quantum-speed-reading" }],
        },
        retreats: {
          heading: "रिट्रीट्स",
          links: [
            { label: "ऑनलाइन 11-दिवसीय रिट्रीट", href: "/retreats/online-11-day" },
            { label: "रेजिडेंशियल रिट्रीट", href: "/retreats/residential" },
          ],
        },
        mentoring: {
          heading: "मेंटरिंग",
          links: [
            { label: "पर्सनल क्लास (1-ऑन-1)", href: "/mentoring/personal-class" },
            { label: "ओवरथिंकिंग मास्टरी", href: "/courses/overthinking-mastery" },
          ],
        },
        habitApp: {
          heading: "हैबिट ऐप",
          links: [{ label: "7 दिन मुफ़्त, फिर ₹99", href: "/app/habit-app" }],
        },
        philosophy: {
          heading: "डॉ. कपिल का दर्शन",
          links: [
            { label: "डॉ. शर्मा के बारे में", href: "/about" },
            { label: "संपर्क करें", href: "/contact" },
          ],
        },
      },
      copyright: "© माइंड उर माइंड। mindurmind.org.in",
      location: "दिल्ली, भारत",
    },
  },
};

// Deliberately no `as const` on the object above — that would infer each
// language's own literal string values (e.g. "Speed Reading" vs
// "स्पीड रीडिंग") as two structurally-incompatible types, since
// Translations is keyed off the English variant specifically. Every
// consumer only ever displays or iterates these values, never branches
// on their exact literal text, so widening to plain `string` throughout
// (the natural inference without `as const`) is correct here.
export type Translations = typeof translations['en'];

export type Lang = "en" | "hi";

export const translations = {
  en: {
    nav: {
      links: [
        { label: "Quantum Reading", href: "#tier-1" },
        { label: "Retreats", href: "#tier-2" },
        { label: "Mentoring", href: "#tier-3" },
        { label: "FAQ", href: "#faq" },
      ],
      ctaPrimary: "Explore Speed Reading",
    },
    // Shared, not nested under qsrLanding/retreatLanding — the exact same
    // trust line and policy link appear next to every primary Razorpay
    // CTA across both pages, so one translated copy avoids drift between
    // them (see CheckoutTrustLine.tsx).
    checkoutTrust: {
      line: "Payments secured by Razorpay. 100% safe & encrypted — we never store your card details.",
      refundLabel: "Refund & Cancellation Policy",
    },
    // Shared, not nested under a page — the same three-part access story
    // (free window / live masterclass / continue plan) appears on the
    // homepage and the QSR landing page, so one translated copy avoids
    // the two pages drifting out of sync (see AccessModelStrip.tsx).
    accessModel: {
      freeLabel: "Free for 60 Days",
      freeDesc: "The full 30-day QSR curriculum and daily app practice — no payment required to start.",
      masterclassLabel: "Live Masterclass — ₹4,999",
      masterclassDesc: "Join a live batch with Dr. Sharma — 7 sessions, certificate, one-time.",
      continueLabel: "Or Continue — ₹499/mo",
      continueDesc: "Keep practicing after your free window without joining a live batch.",
    },
    hero: {
      eyebrow: "Dr. Kapil Dev Sharma — Mind Ur Mind",
      credentials: [
        "English Professor (15+ Years Experience)",
        "India's First QSR Pioneer (Since 2015)",
        "10,000+ Students Guided",
      ],
      headline: "Drowning in information. Starving for meaning.",
      headlineEm: "Read at the speed of thought — then go beyond thought entirely.",
      sub: "If your mind feels foggy, overloaded, and stuck in the same loops, you don't need more information — you need a different mind. In 30 days, Quantum Speed Reading rebuilds how you read, think, and retain. For those ready to go further, advanced Psychic & Spiritual Mastery training waits beyond it.",
      ctaPrimary: "Unlock Quantum Speed Reading",
      ctaSecondary: "Start Free — 60 Days On Us",
      portraitName: "Dr. Kapil Dev Sharma",
      portraitTitle: "Founder, Mind Ur Mind",
      stats: [
        { value: "60 Days Free", label: "New Signups" },
        { value: "30-Day Streak", label: "Quantum Speed Reading" },
        { value: "11 Days, Monthly", label: "Online Psychic & Spiritual Retreat" },
        { value: "3–4× / Year", label: "Residential · Rishikesh & Lonavala" },
        { value: "1-on-1", label: "Personal Class" },
      ],
    },
    tier1: {
      eyebrow: "Tier 01 · Prime Flagship",
      audienceTag: "For Students & Professionals",
      title: "Quantum Speed Reading",
      titleEm: "30-Day Masterclass",
      desc: "Not a webinar. A 30-day rebuild of how your mind processes information — for students, professionals, and lifelong learners of every age.",
      features: [
        "30-day progressive app streak with daily drills",
        "7 live masterclass sessions with Dr. Sharma",
        "WPM & comprehension tracking, not just raw speed",
        "Designed for every age group and reading level",
      ],
      trustQuote: {
        quote: "I finished two books in the time it used to take me to finish one chapter.",
        name: "Ananya R.",
      },
      cta: "Unlock 30-Day Masterclass",
      visualCaption: "Day 22 of 30 · Streak Active",
    },
    tier2: {
      eyebrow: "Tier 02 · Deep Immersive Retreats",
      title: "Go beyond technique —",
      titleEm: "into direct experience",
      desc: "For those ready to move past reading and into the psychic and spiritual dimensions of the mind, online or in person.",
      online: {
        tag: "Online · Monthly Batch",
        audienceTag: "For Deep Seekers",
        urgency: "Small Cohort · Limited Enrollment",
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
        trustQuote: {
          quote: "The Kundalini sessions alone were worth the entire eleven days.",
          name: "Vikram S.",
        },
        cta: "Secure Your Batch Spot",
      },
      residential: {
        tag: "In-Person · 3–4× a Year",
        audienceTag: "For Deep Seekers",
        urgency: "Small Group · Limited Seats",
        title: "Residential Retreats",
        desc: "Small-group, fully immersive retreats held in Rishikesh and Lonavala — the deepest format Mind Ur Mind offers.",
        pills: ["Rishikesh", "Lonavala", "Small Group, Exclusive", "Full Immersion"],
        cta: "Secure Your Retreat Seat",
      },
    },
    tier3: {
      eyebrow: "Tier 03 · Specialized & 1-on-1",
      title: "Precise work for a",
      titleEm: "specific problem",
      desc: "Not everyone needs a retreat. Some people need one mind fixed on one thing — starting with their own.",
      mentoring: {
        tag: "Private · Custom Intensity",
        audienceTag: "Customized 1-on-1",
        title: "Personal Class — 1-on-1 Intensive Mentoring",
        desc: "Direct, private mentoring with Dr. Sharma, fully customized — for stress, anxiety, or a specific spiritual breakthrough.",
        pills: ["Stress & Anxiety", "Spiritual Breakthroughs", "Fully Customized"],
        trustQuote: {
          quote: "Six private sessions did what years of general advice never managed.",
          name: "Priya M.",
        },
        cta: "Apply for 1-on-1 Mentoring",
      },
      course: {
        tag: "21-Day Program",
        audienceTag: "For Overthinkers",
        title: "Overthinking Mastery Course",
        desc: "A focused, 21-day course built to interrupt the overthinking loop — practical, daily, specific.",
        pills: ["Daily Practice", "21 Days", "Mental Clarity Focus"],
        cta: "Begin Your 21-Day Reset",
      },
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
    faq: {
      eyebrow: "Before You Reach Out",
      title: "Questions people ask before starting",
      desc: "Straight answers to the things most people hesitate on. Still unsure? Message us directly below.",
      items: [
        {
          question: "I'm completely new to speed reading or meditation — is this really for beginners?",
          answer:
            "Yes. Every program starts from zero. Quantum Speed Reading assumes no prior skill, and the Psychic & Spiritual Retreats build up gradually — Dr. Sharma has guided 10,000+ students from complete beginners to advanced practitioners since 2014.",
        },
        {
          question: "What age group are these programs designed for?",
          answer:
            "Students, working professionals, and lifelong learners of every age go through these programs — from teenagers preparing for exams to retirees exploring meditation for the first time. Each track is paced to fit where you are.",
        },
        {
          question: "How much does the Quantum Speed Reading Masterclass cost?",
          answer:
            "Every new signup gets 60 days of free practice access — the full 30-day QSR curriculum and daily app practice (WPM and comprehension tracking), no payment required to start. To join a Live Masterclass batch with Dr. Sharma — 7 sessions plus a certificate — it's ₹4,999, one-time. If you'd rather just keep practicing after your free window without joining a live batch, continued app access is ₹499/month. The Retreats and 1-on-1 Mentoring are priced by program; message us on WhatsApp for exact pricing and current batch availability.",
        },
        {
          question: "When is the next online retreat or residential batch?",
          answer:
            "The 11-Day Online Retreat runs monthly; Residential Retreats in Rishikesh and Lonavala run 3–4 times a year in small groups. Chat with us on WhatsApp for the next confirmed date and remaining seats.",
        },
        {
          question: "Do I need to believe in anything specific — is this religious?",
          answer:
            "No particular belief system is required. The psychic and spiritual work draws on meditation, breathwork, and awareness practices — you bring your own openness, we guide the method.",
        },
        {
          question: "What if I have a question this didn't answer?",
          answer: "Message Dr. Kapil's team directly on WhatsApp for a real, direct answer — no bots.",
        },
      ],
      ctaLabel: "Ask on WhatsApp",
    },
    whatsapp: {
      bubble: "Have questions about retreats or masterclasses? Chat directly with Dr. Kapil's team.",
      button: "Chat on WhatsApp",
      ariaLabel: "Chat with Dr. Kapil's team on WhatsApp",
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
          heading: "Quantum Mind App",
          links: [{ label: "Free for 60 Days, Then ₹499/mo", href: "/programs/quantum-speed-reading" }],
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
    qsrLanding: {
      hero: {
        eyebrow: "30-Day Quantum Speed Reading Masterclass",
        headline: "Read 5x Faster. Retain 100%.",
        headlineEm: "Master any book.",
        sub: "Not a webinar. A 30-day psychological and cognitive rebuild of how your mind processes, absorbs, and retains information. Guided live by Dr. Kapil Dev Sharma.",
        ctaPrimary: "Secure Your Batch Spot",
        ctaPrimaryMeta: "₹4,999 · One-Time Enrollment",
        ctaSecondary: "Start Free — 60 Days On Us",
        trustLine: "For students, professionals, and lifelong learners of every age group.",
        visualCaption: "Your 30-Day Streak Starts Day 1",
      },
      trustBadge: {
        title: "Personally Confirmed, Not Automated",
        desc: "Every enrollment is confirmed by Dr. Kapil's own team within 24 hours of checkout — a real person, not a bot.",
        secondaryLine: "Secure checkout via Razorpay · 10,000+ students since 2014",
      },
      brainScience: {
        eyebrow: "The Science Behind It",
        title: "Why this works when other methods don't",
        desc: "Quantum Speed Reading isn't a trick — it retrains four specific cognitive systems most reading habits never touch.",
        cards: [
          {
            title: "Right-Brain Capabilities",
            desc: "Traditional reading leans almost entirely on the brain's language-processing side. This training brings the right hemisphere's parallel processing and pattern recognition into the process — so you absorb in parallel, not word by word.",
          },
          {
            title: "Visualization & Intuition",
            desc: "Once the right brain is engaged, information anchors as vivid mental imagery instead of abstract text. That's what makes it stick — and what most people mean when they say they finally \"see\" what they read.",
          },
          {
            title: "Peripheral Vision",
            desc: "Most readers only take in the handful of letters directly in their focal point. Widening your peripheral visual span lets your eyes capture whole phrases, sometimes whole lines, in a single fixation.",
          },
          {
            title: "Deep Concentration",
            desc: "None of the above holds without sustained, distraction-free focus. The same daily drills that build reading speed also train your ability to hold attention on one task for longer stretches.",
          },
        ],
      },
      appPreview: {
        eyebrow: "Inside the App",
        title: "What your daily drill actually looks like",
        desc: "Every day of the 30-day streak opens the same way — a short, focused session the app tracks automatically.",
        drillLabel: "Today's Drill",
        drillValue: "Peripheral Expansion",
        stats: [
          { label: "Session Length", value: "~10 min" },
          { label: "Current WPM", value: "412" },
          { label: "Comprehension", value: "91%" },
        ],
        caption: "Illustrative preview — your real numbers start from your own Day 1 baseline.",
      },
      ageGroups: {
        eyebrow: "Built For Every Age",
        title: "One Masterclass, Tailored for Every Age Group",
        desc: "The same core training, expressed through two real, verified pathways — because a child and a working professional don't learn the same way, and this program doesn't ask them to.",
        pathways: [
          {
            title: "For Children",
            tag: "High Neuroplasticity",
            desc: "Younger minds have exceptional neuroplasticity — the raw capacity to build entirely new sensory pathways. With guided training, many children develop intuitive vision and read successfully with blindfolds, a real, verified skill visible in our student video reviews.",
          },
          {
            title: "For Adults & Professionals",
            tag: "Rapid Open-Eye Reading",
            desc: "Adult training focuses on rapid, open-eye visual reading — expanding ocular fixation and peripheral vision to take in full lines and pages at high speed, without a blindfold, so a full book is finished in a fraction of the usual time.",
          },
        ],
        unifyingLine:
          "Different expression, same underlying training: peripheral vision, deep concentration, and right-brain engagement — every skill covered in \"The Science Behind It\" above. Whichever path a student takes, that's what they're building.",
        ctaLabel: "Watch Real Student Videos",
      },
      authority: {
        eyebrow: "Direct From The Source",
        title: "Learn From The Person Who Brought QSR To India",
        desc: "Not a licensed instructor teaching someone else's system — the person who introduced it.",
        cards: [
          {
            title: "English Professor (15+ Years Experience)",
            desc: "15+ years of academic teaching experience in English.",
          },
          {
            title: "India's First QSR Pioneer (Since 2015)",
            desc: "Introduced Quantum Speed Reading to India — the origin point for the method taught in this Masterclass.",
          },
          {
            title: "10,000+ Students Guided",
            desc: "Personally guided thousands of students from complete beginners to advanced practitioners.",
          },
          {
            title: "500+ Workshops Delivered",
            desc: "Conducting live teaching workshops since 2014, across schools, colleges, and corporate audiences.",
          },
        ],
      },
      founderVideo: {
        eyebrow: "From Dr. Kapil, Directly",
        title: "Why Quantum Speed Reading is different",
        desc: "A short introduction from Dr. Kapil Dev Sharma — an English Professor with 15+ years of teaching experience, and India's first QSR pioneer, who introduced Quantum Speed Reading to the country in 2015. You're learning directly from the originator of the method, not a licensed instructor teaching someone else's system.",
        placeholderLabel: "Video coming soon",
        ctaLabel: "Ask a Question Instead",
      },
      videoTestimonials: {
        eyebrow: "Watch Real Students",
        title: "200+ video reviews, not paid actors",
        desc: "Every video in this playlist is a real student, filmed after finishing the program — unscripted.",
        ctaLabel: "Watch All 200+ Stories",
        moreLabel: "More real students, across our other programs",
      },
      mechanics: {
        eyebrow: "How It Works",
        title: "Two systems, one transformation",
        desc: "A daily app streak that trains the skill, and live sessions that install the mindset behind it.",
        app: {
          tag: "Daily · In the App",
          title: "The 30-Day App Streak",
          desc: "Progressive cognitive drills you do at your own pace, every day, right inside the Quantum Mind app.",
          bullets: [
            "WPM (words-per-minute) tracked every session, not just once",
            "Comprehension scored alongside speed — never one without the other",
            "Progressive difficulty — Day 30 asks more of you than Day 1",
            "Every completed day stays open — practice it again anytime",
            "About 10 minutes a day",
          ],
        },
        live: {
          tag: "Weekly · Live with Dr. Sharma",
          title: "The 7 Live Masterclasses",
          desc: "Interactive sessions across the 30 days where Dr. Sharma personally walks you through the technique in real time.",
          bullets: [
            "Right-brain visual reading, taught live, not pre-recorded",
            "Direct Q&A — ask about your own specific sticking point",
            "Group accountability with your live batch cohort",
            "Recordings available if you miss a session",
          ],
        },
      },
      curriculum: {
        eyebrow: "The Curriculum",
        title: "What the 30 days actually look like",
        desc: "Four structured phases. Each one builds directly on the last — nothing here is optional filler.",
        weeks: [
          {
            range: "Days 1–7",
            title: "Breaking Ocular Fixation",
            desc: "Retrain how your eyes physically move across a page — expanding peripheral vision and eliminating the stop-start fixation habit that caps most readers under 250 WPM.",
          },
          {
            range: "Days 8–14",
            title: "Bypassing Sub-Vocalization",
            desc: "Interrupt the inner voice that silently narrates every word as you read. This single shift is usually where your reading speed jumps the most.",
          },
          {
            range: "Days 15–21",
            title: "Photographic Memory Anchoring",
            desc: "Layer in visual and multi-sensory memory techniques so what you read fast, you also retain — full-page and multi-layer data intake.",
          },
          {
            range: "Days 22–30",
            title: "Full-Book Synthesis & Mastery",
            desc: "Apply everything to a real, full-length book, speed-test your final numbers, and complete your Mastery Certification.",
          },
        ],
      },
      audience: {
        eyebrow: "Who This Is Built For",
        title: "Three kinds of people take this Masterclass",
        groups: [
          {
            title: "Students",
            desc: "Preparing for competitive exams where syllabus volume, not intelligence, is the real bottleneck.",
          },
          {
            title: "Professionals",
            desc: "Drowning in reports, research, and email — information overload that no productivity app has fixed.",
          },
          {
            title: "Lifelong Learners",
            desc: "Anyone chasing elite cognitive performance, at any age, who wants their mind to do more with what it reads.",
          },
        ],
      },
      faq: {
        eyebrow: "Before You Enroll",
        title: "Questions people ask before Day 1",
        items: [
          {
            question: "Is this hard for a complete beginner?",
            answer:
              "No. The 30-day structure assumes zero prior skill and starts from your true baseline — Dr. Sharma has guided 10,000+ students through it since 2014, most of them starting as complete beginners.",
          },
          {
            question: "What's the time commitment per day?",
            answer:
              "About 10 minutes a day inside the app, plus one live masterclass session a week with Dr. Sharma. It's designed to fit around a full-time job or study schedule, not compete with it.",
          },
          {
            question: "Does this work for every age group?",
            answer:
              "Yes — students preparing for exams, working professionals, and lifelong learners of every age have all completed this Masterclass. The pace adapts to where you're starting from.",
          },
          {
            question: "Is any of this actually free?",
            answer:
              "Yes — every new signup gets 60 days of free practice access: the full 30-day QSR curriculum and daily app practice, no payment required. Completed days stay unlocked too, so you can replay any day as many times as you want during those 60 days. Joining a Live Masterclass batch with Dr. Sharma is ₹4,999, one-time; if you'd rather just keep practicing after your free window without a live batch, continued access is ₹499/month.",
          },
          {
            question: "What exactly do I get for ₹4,999?",
            answer:
              "The full 30-day progressive app curriculum, all 7 live masterclass sessions with Dr. Sharma, and WPM & comprehension tracking throughout — a one-time enrollment, not a subscription. Your first 60 days of app access are free either way; the ₹4,999 is specifically for joining a live batch.",
          },
          {
            question: "What happens right after I pay?",
            answer:
              "Enrollment is confirmed personally by Dr. Kapil's team, not an automated system — you'll hear from us with your batch schedule shortly after checkout.",
          },
          {
            question: "What if I have a question this didn't answer?",
            answer: "Message Dr. Kapil's team directly on WhatsApp before you enroll — a real person, not a bot.",
          },
        ],
        ctaLabel: "Ask on WhatsApp",
      },
      finalCta: {
        eyebrow: "Ready When You Are",
        title: "Your 30 Days Start With One Decision",
        desc: "Enrollment is confirmed personally by Dr. Kapil's own team, not an automated system.",
        cta: "Secure Your Batch Spot",
        ctaMeta: "₹4,999 · One-Time Enrollment",
        batchNoticeLabel: "Next Batch Starts",
        cadenceLine: "New batches begin twice a month — the 7th and the 25th.",
        structureLine: "7 live classes across your 30 days · daily practice through the app",
      },
      stickyBar: {
        text: "30-Day Quantum Speed Reading Masterclass",
        price: "₹4,999 · One-Time",
        cta: "Secure Your Batch Spot",
      },
      whatsapp: {
        bubble: "Have questions about the QSR batch? Chat with Dr. Kapil's team instantly.",
        button: "Chat on WhatsApp",
        ariaLabel: "Chat with Dr. Kapil's team on WhatsApp about the Quantum Speed Reading Masterclass",
      },
    },
    retreatLanding: {
      hero: {
        eyebrow: "Online · Since 2014 · Small Cohort",
        headline: "Awaken Your Higher Mind",
        headlineEm: "The 11-Day Online Psychic & Spiritual Retreat",
        sub: "Not another meditation app that leaves you exactly where you started. An intensive, live, 11-day journey into authentic Kriya Yoga, Prana, and cosmic energy — guided nightly by Dr. Kapil Dev Sharma, personally teaching this path since 2014.",
        ctaPrimary: "Secure Your Retreat Spot",
        ctaPrimaryMeta: "Secure Checkout via Razorpay",
        ctaSecondary: "See the 11-Day Curriculum",
        ctaTertiary: "Not ready to book? Watch real student stories first",
        trustLine: "For burnt-out professionals, chronic overthinkers, and real spiritual seekers — tired of theory, ready for a tangible inner experience.",
        visualPlaceholderLabel: "Retreat Introduction — Coming Soon",
      },
      coreProblem: {
        eyebrow: "Why Meditation Apps Don't Work",
        title: "Your mind isn't broken. It's untrained — and undernourished.",
        desc: "You've tried the apps. The breathing exercises. The ten-minute guided sessions with rain sounds. The loop in your head is still there five minutes later.",
        painPoints: [
          "Chronic stress doesn't respond to a soothing voice — it responds to something that actually moves energy, not just attention.",
          "You don't need another relaxation technique. You need contact with something real — your own life force, not a distraction from its absence.",
          "Every app promises calm. Almost none explain what's actually happening inside you, or give you a real method to change it.",
        ],
        solution:
          "This retreat isn't built on modern wellness trends. It's rooted in Kriya Yoga — a real, centuries-old discipline for working directly with Prana, your own life force, through cosmic energy and cosmic fusion, not just your attention span. What you practice for 11 nights produces a felt, physical shift, not five quieter minutes.",
      },
      schedule: {
        eyebrow: "Batch Schedule",
        title: "Reserve Your Spot in the Next Batch",
        desc: "A new batch begins on the 10th of every month and runs for 11 days — the same daily window for everyone in that batch.",
        durationLabel: "Duration",
        durationValue: "11 Days · Day 10 – Day 20",
        cadenceLabel: "Batch Cadence",
        cadenceValue: "Monthly, Online",
        timingLabel: "Daily Live Session",
        timingValue: "7:30 PM – 10:30 PM",
        nextBatchLabel: "Next Batch",
        cta: "Secure Your Retreat Spot",
        ctaMeta: "Secure Checkout via Razorpay",
        badges: [
          { title: "Secure Payment", desc: "Checkout is handled by Razorpay, a trusted payment gateway." },
          { title: "Personally Confirmed", desc: "A real person on Dr. Kapil's team confirms your batch and schedule — not a bot." },
          { title: "Small Cohort", desc: "Each batch is kept deliberately small — limited enrollment, not a mass webinar." },
        ],
      },
      disciplines: {
        eyebrow: "What You Will Master",
        title: "Six disciplines, one 11-day journey",
        desc: "Each night builds on the last, guided live by Dr. Sharma — never a theory you read about, always a practice you feel.",
        items: [
          {
            title: "Telepathy Send & Receive",
            desc: "Experience silent, direct mind-to-mind resonance — a depth of connection words were never built to carry.",
          },
          {
            title: "Aura Scanning & Reading",
            desc: "Learn to perceive the energy fields around you, protect your own, and read what people's words don't say.",
          },
          {
            title: "Samadhi Meditation",
            desc: "Quiet the mental loops that won't switch off, and touch a stillness underneath them that's been there the whole time.",
          },
          {
            title: "Chakra Activation & Enlightenment",
            desc: "Clear energetic blockages you've carried for years, and let real vitality — not caffeine, not willpower — move through your body again.",
          },
          {
            title: "Kundalini Meditation",
            desc: "Safely awaken the dormant energy at the base of your spine, and let it move you, not shake you.",
          },
          {
            title: "Astral Projection",
            desc: "Step beyond the edges of the physical plane — and come back changed by what you find there.",
          },
        ],
      },
      authority: {
        eyebrow: "A Proven Path, Not A Trend",
        title: "Guided by the same teacher, for over a decade",
        desc: "Real years, real students, real reviews — not a program that launched last quarter.",
        cards: [
          {
            title: "Teaching Since 2014",
            desc: "12+ years personally guiding students through this exact path — not a recently-launched program chasing a trend.",
          },
          {
            title: "150+ Real Student Reviews",
            desc: "Written and video reviews from real participants, not stock footage or paid actors.",
          },
          {
            title: "Small Cohort, Every Batch",
            desc: "Every batch is kept deliberately small so Dr. Sharma can actually guide you, not lecture at a crowd.",
          },
          {
            title: "Personally Led, Every Night",
            desc: "Not pre-recorded, not delegated to an assistant instructor — Dr. Sharma, live, all 11 nights.",
          },
        ],
      },
      liveStructure: {
        eyebrow: "How The 11 Nights Work",
        title: "Live guidance, not a pre-recorded course",
        desc: "Every one of the 11 nights, 7:30 PM to 10:30 PM, you're live with Dr. Sharma — not a video library you work through whenever it's convenient.",
        points: [
          {
            title: "Nightly Live Session",
            desc: "A live guided session with Dr. Sharma every night of the retreat, 7:30 PM – 10:30 PM — real-time, not pre-recorded.",
          },
          {
            title: "Interactive Practice",
            desc: "Structured practice time for that day's discipline, with direct feedback instead of a checklist to self-grade.",
          },
          {
            title: "Direct Mentorship",
            desc: "Questions answered directly by Dr. Sharma during the retreat, not routed through a support ticket.",
          },
        ],
      },
      outcomes: {
        eyebrow: "After The 11 Nights",
        title: "What changes when the retreat ends",
        items: [
          "The mental loops finally go quiet — not suppressed, resolved",
          "A felt sense of your own energy, not just an idea of it",
          "Real emotional steadiness under the pressure that used to flatten you",
          "A lasting shift in how you experience your own mind — not an 11-day high that fades by day 12",
        ],
      },
      videoTestimonials: {
        eyebrow: "Watch Real Students",
        title: "150+ real reviews, from 12+ years of real retreats",
        desc: "Every video in this playlist is a real student, filmed after finishing a program — unscripted.",
        ctaLabel: "Watch All Stories",
        moreLabel: "More real students, across our other programs",
      },
      faq: {
        eyebrow: "Before You Enroll",
        title: "Questions people ask before Day 1",
        items: [
          {
            question: "Do I need any prior experience with meditation or psychic work?",
            answer:
              "No particular belief system or prior experience is required. Kriya Yoga builds up gradually across the 11 nights — you bring your own openness, Dr. Sharma guides the method, step by step.",
          },
          {
            question: "What is Kriya Yoga, exactly?",
            answer:
              "Kriya Yoga is a real, centuries-old discipline for working directly with Prana — your own life force — through breath and specific inner techniques, not a philosophy you only read about. It's the foundation this entire 11-day retreat is built on.",
          },
          {
            question: "What's the daily time commitment?",
            answer:
              "Each day includes a live session with Dr. Sharma from 7:30 PM to 10:30 PM, plus guided practice — the same window every day of the 11-day batch.",
          },
          {
            question: "What time are the live sessions held?",
            answer:
              "7:30 PM to 10:30 PM, daily, for all 11 days of the batch — the same window for every batch, so you can plan around it in advance.",
          },
          {
            question: "What do I need technically to join?",
            answer:
              "Just a stable internet connection and a device with camera and audio. The live session link is shared directly with confirmed participants closer to the start date.",
          },
          {
            question: "Is this religious, or tied to a specific belief system?",
            answer:
              "No particular belief system is required. The work draws on meditation, breathwork, and awareness practices — you bring your own openness, we guide the method.",
          },
          {
            question: "When is the next batch, and how many seats are left?",
            answer:
              "A new batch starts on the 10th of every month and runs through the 20th. Message us on WhatsApp for the current batch's remaining seats.",
          },
        ],
        ctaLabel: "Ask on WhatsApp",
      },
      finalCta: {
        eyebrow: "Ready When You Are",
        title: "Your Awakening Starts With One Decision",
        desc: "Enrollment is confirmed personally by Dr. Kapil's own team — not an automated system. Twelve years, 150+ real students, one small cohort at a time. Book your spot in the next batch.",
        cta: "Secure Your Retreat Spot",
      },
      stickyBar: {
        text: "11-Day Online Psychic & Spiritual Retreat",
        price: "Small Cohort · Limited Enrollment",
        cta: "Secure Your Retreat Spot",
      },
      whatsapp: {
        bubble: "Have questions about the 11-Day Retreat? Chat with Dr. Kapil's team instantly.",
        button: "Chat on WhatsApp",
        ariaLabel: "Chat with Dr. Kapil's team on WhatsApp about the 11-Day Retreat",
      },
    },
    residentialLanding: {
      hero: {
        eyebrow: "Residential Retreats · Since 2014 · Small Cohorts",
        headline: "Leave the Room That Broke You Down.",
        headlineEm: "Residential Retreats in Lonavala & Rishikesh",
        sub: "You've meditated in bed, in traffic, with an app telling you to just breathe. It didn't work — not because you failed at it, but because a 10-minute recording was never built to reach where the exhaustion actually lives. This is Dr. Kapil Dev Sharma, in the room with you, for days — Kriya Yoga, Prana, and cosmic energy work, guided directly, since 2014.",
        ctaPrimary: "Secure Your Residential Seat",
        ctaPrimaryMeta: "Personally confirmed by Dr. Kapil's team",
        ctaSecondary: "See the 2026–27 Roadmap",
        trustLine: "For burnt-out professionals, chronic overthinkers, and real spiritual seekers — ready to leave, not just log off.",
      },
      roadmap: {
        eyebrow: "The Official Schedule",
        title: "Four Journeys. Two Sacred Grounds. One Path.",
        desc: "Every residential retreat is deliberately small, deliberately seasonal, and spaced apart — so each one can go deep instead of wide.",
        items: [
          { when: "November 2026", where: "Lonavala", theme: "Mountain & Nature Deep Immersion" },
          { when: "February 2027", where: "Rishikesh", theme: "The Spiritual Capital by the Ganges" },
          { when: "June 2027", where: "Lonavala", theme: "Monsoon Soul Retreat" },
          { when: "November 2027", where: "Lonavala", theme: "Winter Deep Practice" },
        ],
        ctaLabel: "Apply for This Date",
      },
      coreProblem: {
        eyebrow: "Why Even Online Isn't Enough",
        title: "Your mind doesn't need more information. It needs distance.",
        desc: "You've tried the apps. Maybe even a live online session. The loop softens for an hour, then your inbox opens and it's back.",
        painPoints: [
          "An app competes with a nervous system that's been in low-grade alarm for years — and loses, every time, because it's still running in the same noisy environment that created the exhaustion.",
          "Even a live online retreat still has your phone on the desk beside you. Real disconnect doesn't happen through a screen, no matter how good the guidance is.",
          "Deep energy work — Kundalini, Samadhi, direct Pranic activation — is safest and strongest with a teacher physically present to see exactly where you are, not guessing from a video call.",
        ],
        solution:
          "This is why the residential format exists. Real Kriya Yoga, worked directly with Prana — your own life force — through cosmic energy and cosmic fusion, in a room with no notifications, no inbox, and a living teacher who can actually see you. What happens over these days produces a felt, physical shift, not a temporary calm that fades on the drive home.",
      },
      advantage: {
        eyebrow: "The Part No App Can Replicate",
        title: "Four Things That Only Happen in the Room",
        desc: "This is the entire reason the retreat is residential, not optional.",
        items: [
          {
            title: "Total Disconnect",
            desc: "No notifications, no inbox, no \"just checking one thing.\" Your nervous system gets to fully stand down — often for the first time in years.",
          },
          {
            title: "Direct Energy Transmission",
            desc: "There's a real, felt difference between a recording of a teacher and sitting in the same room as one. This cannot be digitized.",
          },
          {
            title: "Small, Exclusive Cohorts",
            desc: "Not a stadium event. Every retreat is kept deliberately small, so Dr. Kapil can actually see your posture, your breath, your resistance — and correct it in real time.",
          },
          {
            title: "Personal Vetting",
            desc: "Every applicant is reviewed before confirmation. A room this intimate only works if everyone in it is genuinely ready to do the work.",
          },
        ],
      },
      journey: {
        eyebrow: "The Work Itself",
        title: "A Structured, Multi-Day Immersion",
        desc: "Each residential retreat unfolds as a deliberate arc — grounding first, then energy activation, then deep stillness, then integration — so the shift has time to actually settle.",
        items: [
          {
            title: "Grounding & Arrival",
            desc: "Breath realignment and nervous system down-regulation — arriving fully before the deeper work begins.",
          },
          {
            title: "Kriya Yoga & Pranic Activation",
            desc: "The core technique, taught in structured, safe progression, corrected in person.",
          },
          {
            title: "Energy & Chakra Work",
            desc: "Direct, guided practice — not theory read off a slide.",
          },
          {
            title: "Deep Stillness & Samadhi Practice",
            desc: "The state everything else in the retreat has been quietly building toward.",
          },
          {
            title: "Integration & Closing",
            desc: "So what you've built doesn't dissolve the moment you're back home.",
          },
        ],
      },
      gallery: {
        eyebrow: "Inside the Retreat",
        title: "What It Actually Looks Like",
        desc: "A glimpse of the environment, the group, and the practice — real photos dropped in as each retreat happens.",
      },
      authority: {
        eyebrow: "A Proven Path, Not A Trend",
        title: "Guided by the same teacher, for over a decade",
        desc: "Real years, real students, real reviews — not a retreat that launched last quarter.",
        cards: [
          {
            title: "Teaching Since 2014",
            desc: "Over a decade personally guiding residential retreats — not a recently-launched retreat business chasing a trend.",
          },
          {
            title: "150+ Real Student Reviews",
            desc: "Written and video reviews from real participants, not stock footage or paid actors.",
          },
          {
            title: "Small Cohort, Every Retreat",
            desc: "Every retreat is kept deliberately small so Dr. Kapil can actually guide you, not lecture at a crowd.",
          },
          {
            title: "Personally Led, In Person",
            desc: "Not delegated to an assistant instructor — Dr. Kapil, physically present, for the full retreat.",
          },
        ],
      },
      venues: {
        eyebrow: "Where It Happens",
        title: "Two Sacred Grounds",
        desc: "Every location is chosen on purpose — the terrain is part of the practice.",
        locations: [
          {
            name: "Dream Holiday Resort, Tungarli",
            address: "Tungarli, Lonavala, Maharashtra",
            note: "Hosts three of the four 2026–27 retreats — November 2026, June 2027, and November 2027.",
          },
          {
            name: "Hotel Krishna Cottage",
            address: "Jonk, Swargashram, Rishikesh",
            note: "Hosts the February 2027 retreat — on the banks of the Ganges, in the spiritual capital of the Himalayas.",
          },
        ],
      },
      pricing: {
        eyebrow: "Choose Your Room",
        title: "One Price, No Surprises",
        desc: "Same rate across all four 2026–27 dates — per person, food and stay included.",
        tiers: [
          {
            name: "Sharing Room",
            price: "₹35,000",
            priceNote: "per person",
            features: [
              "Full residential retreat, all sessions included",
              "Shared deluxe accommodation",
              "Pure satvik meals, included",
              "Direct, in-person guidance from Dr. Kapil",
            ],
            cta: "Book Sharing Room",
          },
          {
            name: "Private Room",
            price: "₹45,000",
            priceNote: "per person",
            features: [
              "Full residential retreat, all sessions included",
              "Private, non-sharing accommodation",
              "Pure satvik meals, included",
              "Direct, in-person guidance from Dr. Kapil",
            ],
            cta: "Book Private Room",
          },
        ],
        note: "Seats are confirmed personally by Dr. Kapil's team, not by automated checkout — message us on WhatsApp with your preferred date to begin.",
      },
      videoTestimonials: {
        eyebrow: "Watch Real Students",
        title: "150+ real reviews, from over a decade of real retreats",
        desc: "Every video below is a real student, filmed after finishing a retreat — unscripted.",
        ctaLabel: "Watch More Real Stories",
      },
      audience: {
        eyebrow: "Be Honest With Yourself Here",
        title: "This Isn't for Everyone. It's for You If —",
        items: [
          "You're a high-performer who's quietly burnt out — successful on paper, exhausted underneath it",
          "You're a chronic overthinker — the loop doesn't stop just because your circumstances are fine",
          "You've tried the apps, the books, the podcasts — and gotten temporary relief, never real change",
          "You're a genuine spiritual seeker — ready for real practice, not more content to consume",
          "You can commit fully for the retreat's duration — this only works if you actually leave",
        ],
        disclaimer: "If you're looking for a relaxing holiday with some yoga on the side, this isn't it. If you're ready for real, structured inner work with a teacher watching closely, you're in the right place.",
      },
      faq: {
        eyebrow: "Before You Apply",
        title: "Questions people ask before booking",
        items: [
          {
            question: "Is this suitable for complete beginners?",
            answer: "Yes. No prior experience with Kriya Yoga, meditation, or energy work is required. Every practice is taught from the ground up, in safe, structured progression.",
          },
          {
            question: "Is the energy work — Kundalini, Samadhi — actually safe?",
            answer: "Yes. Every technique is taught step by step, under direct in-person supervision, with a progression designed to be safe for genuine beginners.",
          },
          {
            question: "How is this different from your 11-Day Online Retreat?",
            answer: "The online retreat is a live, guided journey you join from home. The Residential Retreat requires you to physically travel and stay on-site — full disconnect, direct in-person energy transmission, and a small in-person cohort the online format can't replicate.",
          },
          {
            question: "What's included in the price?",
            answer: "Both room options — ₹35,000 sharing, ₹45,000 private — include the full residential retreat, all sessions, pure satvik meals, and your stay at the venue.",
          },
          {
            question: "What should I bring?",
            answer: "Comfortable clothing, a journal, and an open mind. A full essentials list is shared after your seat is confirmed.",
          },
          {
            question: "Are meals accommodating of dietary needs?",
            answer: "Yes — pure satvik vegetarian meals are standard, with Jain, gluten-free, and allergy-friendly options available on request.",
          },
        ],
        ctaLabel: "Ask on WhatsApp",
      },
      finalCta: {
        eyebrow: "Four Dates. Limited Seats Each.",
        title: "The Room Is Small on Purpose. Don't Wait to Apply.",
        desc: "Every one of the four 2026–2027 residential retreats has a hard cap on seats, because the entire method depends on Dr. Kapil being able to actually see every person in the room. Seats are confirmed in the order applications arrive.",
        cta: "Secure Your Residential Seat",
      },
      stickyBar: {
        text: "Residential Retreats — Lonavala & Rishikesh",
        price: "From ₹35,000 per person",
        cta: "Secure Your Seat",
      },
      whatsapp: {
        bubble: "Have questions about a Residential Retreat? Chat with Dr. Kapil's team instantly.",
        button: "Chat on WhatsApp",
        ariaLabel: "Chat with Dr. Kapil's team on WhatsApp about the Residential Retreats",
      },
    },
  },

  hi: {
    nav: {
      links: [
        { label: "क्वांटम रीडिंग", href: "#tier-1" },
        { label: "रिट्रीट्स", href: "#tier-2" },
        { label: "मेंटरिंग", href: "#tier-3" },
        { label: "सवाल-जवाब", href: "#faq" },
      ],
      ctaPrimary: "स्पीड रीडिंग एक्सप्लोर करें",
    },
    checkoutTrust: {
      line: "भुगतान Razorpay द्वारा सुरक्षित। 100% सुरक्षित और एन्क्रिप्टेड — हम कभी आपके कार्ड की जानकारी संग्रहीत नहीं करते।",
      refundLabel: "रिफंड और कैंसिलेशन नीति",
    },
    accessModel: {
      freeLabel: "60 दिनों के लिए मुफ़्त",
      freeDesc: "पूरा 30-दिवसीय QSR पाठ्यक्रम और दैनिक ऐप अभ्यास — शुरू करने के लिए किसी भुगतान की आवश्यकता नहीं।",
      masterclassLabel: "लाइव मास्टरक्लास — ₹4,999",
      masterclassDesc: "डॉ. शर्मा के साथ एक लाइव बैच जॉइन करें — 7 सेशन, सर्टिफिकेट, एकमुश्त।",
      continueLabel: "या जारी रखें — ₹499/माह",
      continueDesc: "लाइव बैच जॉइन किए बिना, अपनी मुफ़्त अवधि के बाद अभ्यास जारी रखें।",
    },
    hero: {
      eyebrow: "डॉ. कपिल देव शर्मा — माइंड उर माइंड",
      credentials: [
        "इंग्लिश प्रोफेसर (15+ वर्षों का अनुभव)",
        "भारत में QSR के प्रणेता (2015 से)",
        "10,000+ विद्यार्थियों का मार्गदर्शन",
      ],
      headline: "जानकारी की बाढ़ में डूबते हुए। अर्थ के लिए तरसते हुए।",
      headlineEm: "विचार की गति से पढ़ें — फिर विचार से भी आगे निकल जाएं।",
      sub: "अगर आपका मन धुंधला, अत्यधिक बोझिल, और वही पुराने चक्रों में फंसा हुआ महसूस होता है — तो आपको और जानकारी नहीं, एक अलग मन चाहिए। 30 दिनों में, क्वांटम स्पीड रीडिंग आपके पढ़ने, सोचने और याद रखने के तरीके का पुनर्निर्माण करती है। और जो आगे जाने के लिए तैयार हैं, उनके लिए इससे परे उन्नत साइकिक और स्पिरिचुअल मास्टरी प्रशिक्षण प्रतीक्षा में है।",
      ctaPrimary: "क्वांटम स्पीड रीडिंग अनलॉक करें",
      ctaSecondary: "मुफ़्त शुरू करें — 60 दिन हमारी ओर से",
      portraitName: "डॉ. कपिल देव शर्मा",
      portraitTitle: "संस्थापक, माइंड उर माइंड",
      stats: [
        { value: "60 दिन मुफ़्त", label: "नए साइन-अप के लिए" },
        { value: "30-दिन की स्ट्रीक", label: "क्वांटम स्पीड रीडिंग" },
        { value: "11 दिन, मासिक", label: "ऑनलाइन साइकिक एंड स्पिरिचुअल रिट्रीट" },
        { value: "वर्ष में 3–4 बार", label: "रेजिडेंशियल · ऋषिकेश और लोनावला" },
        { value: "1-ऑन-1", label: "पर्सनल क्लास" },
      ],
    },
    tier1: {
      eyebrow: "टियर 01 · प्रमुख फ्लैगशिप",
      audienceTag: "विद्यार्थियों और पेशेवरों के लिए",
      title: "क्वांटम स्पीड रीडिंग",
      titleEm: "30-दिवसीय मास्टरक्लास",
      desc: "यह कोई वेबिनार नहीं है। यह हर आयु वर्ग के विद्यार्थियों, पेशेवरों और आजीवन सीखने वालों के लिए, आपके मस्तिष्क की सूचना प्रोसेस करने की क्षमता का 30-दिवसीय पुनर्निर्माण है।",
      features: [
        "दैनिक अभ्यास के साथ 30-दिवसीय प्रगतिशील ऐप स्ट्रीक",
        "डॉ. शर्मा के साथ 7 लाइव मास्टरक्लास सत्र",
        "केवल गति नहीं, बल्कि WPM और समझ (comprehension) की ट्रैकिंग",
        "हर आयु वर्ग और पठन-स्तर के लिए उपयुक्त",
      ],
      trustQuote: {
        quote: "जितने समय में पहले एक अध्याय पूरा होता था, अब उतने समय में दो किताबें पूरी हो जाती हैं।",
        name: "अनन्या आर.",
      },
      cta: "30-दिवसीय मास्टरक्लास अनलॉक करें",
      visualCaption: "30 में से दिन 22 · स्ट्रीक सक्रिय",
    },
    tier2: {
      eyebrow: "टियर 02 · गहन इमर्सिव रिट्रीट",
      title: "तकनीक से आगे —",
      titleEm: "प्रत्यक्ष अनुभव की ओर",
      desc: "जो लोग रीडिंग से आगे बढ़कर मन के साइकिक और आध्यात्मिक आयामों में जाने के लिए तैयार हैं, उनके लिए — ऑनलाइन या व्यक्तिगत रूप से।",
      online: {
        tag: "ऑनलाइन · मासिक बैच",
        audienceTag: "गहरी खोज करने वालों के लिए",
        urgency: "छोटा समूह · सीमित नामांकन",
        title: "11-दिवसीय ऑनलाइन साइकिक एंड स्पिरिचुअल एंड मास्टरी रिट्रीट",
        desc: "मुख्य साइकिक और आध्यात्मिक अनुशासनों के माध्यम से एक गहन, लाइव, 11-दिवसीय यात्रा — प्रतिदिन डॉ. शर्मा द्वारा मार्गदर्शित।",
        pills: [
          "मानसिक तरंग संचार (टेलीपैथी)",
          "आभा स्कैनिंग और रीडिंग",
          "समाधि ध्यान",
          "चक्र सक्रियण और ज्ञानोदय",
          "कुंडलिनी ध्यान",
          "सूक्ष्म शरीर यात्रा",
        ],
        trustQuote: {
          quote: "अकेले कुंडलिनी सत्र ही पूरे ग्यारह दिनों के लायक थे।",
          name: "विक्रम एस.",
        },
        cta: "अपनी बैच सीट सुरक्षित करें",
      },
      residential: {
        tag: "व्यक्तिगत उपस्थिति · वर्ष में 3–4 बार",
        audienceTag: "गहरी खोज करने वालों के लिए",
        urgency: "छोटा समूह · सीमित सीटें",
        title: "रेजिडेंशियल रिट्रीट",
        desc: "ऋषिकेश और लोनावला में आयोजित छोटे-समूह, पूर्ण-विसर्जन रिट्रीट — माइंड उर माइंड का सबसे गहन प्रारूप।",
        pills: ["ऋषिकेश", "लोनावला", "छोटा समूह, एक्सक्लूसिव", "पूर्ण विसर्जन"],
        cta: "अपनी रिट्रीट सीट सुरक्षित करें",
      },
    },
    tier3: {
      eyebrow: "टियर 03 · विशेष एवं 1-ऑन-1",
      title: "एक विशिष्ट समस्या के लिए",
      titleEm: "सटीक कार्य",
      desc: "हर किसी को रिट्रीट की ज़रूरत नहीं होती। कुछ लोगों को बस एक चीज़ पर केंद्रित मन चाहिए होता है — अपने ही मन से शुरुआत करते हुए।",
      mentoring: {
        tag: "निजी · कस्टम इंटेंसिटी",
        audienceTag: "पूरी तरह कस्टमाइज़्ड 1-ऑन-1",
        title: "पर्सनल क्लास — 1-ऑन-1 इंटेंसिव मेंटरिंग",
        desc: "डॉ. शर्मा के साथ सीधा, निजी मार्गदर्शन, पूरी तरह कस्टमाइज़्ड — तनाव, चिंता, या किसी विशेष आध्यात्मिक सफलता के लिए।",
        pills: ["तनाव और चिंता", "आध्यात्मिक सफलताएं", "पूरी तरह कस्टमाइज़्ड"],
        trustQuote: {
          quote: "छह निजी सत्रों ने वह कर दिखाया जो वर्षों की सामान्य सलाह कभी नहीं कर पाई।",
          name: "प्रिया एम.",
        },
        cta: "1-ऑन-1 मेंटरिंग के लिए आवेदन करें",
      },
      course: {
        tag: "21-दिवसीय कार्यक्रम",
        audienceTag: "अति-चिंतन करने वालों के लिए",
        title: "ओवरथिंकिंग मास्टरी कोर्स",
        desc: "ओवरथिंकिंग के चक्र को तोड़ने के लिए बनाया गया एक केंद्रित, 21-दिवसीय कोर्स — व्यावहारिक, दैनिक, विशिष्ट।",
        pills: ["दैनिक अभ्यास", "21 दिन", "मानसिक स्पष्टता पर केंद्रित"],
        cta: "अपना 21-दिवसीय रीसेट शुरू करें",
      },
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
    faq: {
      eyebrow: "संपर्क करने से पहले",
      title: "शुरू करने से पहले लोग जो सवाल पूछते हैं",
      desc: "ज़्यादातर लोग जिन बातों पर हिचकिचाते हैं, उनके सीधे जवाब। फिर भी असमंजस में हैं? नीचे सीधे हमसे संपर्क करें।",
      items: [
        {
          question: "मुझे स्पीड रीडिंग या ध्यान का कोई अनुभव नहीं है — क्या यह वाकई शुरुआती लोगों के लिए है?",
          answer:
            "हां, बिल्कुल। हर कार्यक्रम शून्य से शुरू होता है। क्वांटम स्पीड रीडिंग में किसी पूर्व कौशल की ज़रूरत नहीं, और साइकिक एंड स्पिरिचुअल रिट्रीट धीरे-धीरे आगे बढ़ते हैं — डॉ. शर्मा ने 2014 से अब तक 10,000+ विद्यार्थियों को पूर्ण शुरुआती से उन्नत अभ्यासी तक मार्गदर्शन दिया है।",
        },
        {
          question: "ये कार्यक्रम किस आयु वर्ग के लिए बने हैं?",
          answer:
            "विद्यार्थी, कामकाजी पेशेवर, और हर उम्र के जीवन-पर्यंत सीखने वाले इन कार्यक्रमों से गुज़रते हैं — परीक्षा की तैयारी करने वाले किशोरों से लेकर पहली बार ध्यान करने वाले रिटायर्ड लोगों तक। हर ट्रैक आपकी स्थिति के अनुसार गति में रहता है।",
        },
        {
          question: "क्वांटम स्पीड रीडिंग मास्टरक्लास की कीमत कितनी है?",
          answer:
            "हर नए साइन-अप को 60 दिनों का मुफ़्त अभ्यास एक्सेस मिलता है — पूरा 30-दिवसीय QSR पाठ्यक्रम और दैनिक ऐप अभ्यास (WPM और समझ ट्रैकिंग), शुरू करने के लिए किसी भुगतान की आवश्यकता नहीं। डॉ. शर्मा के साथ एक लाइव मास्टरक्लास बैच जॉइन करने के लिए — 7 सेशन और एक सर्टिफिकेट — इसकी कीमत ₹4,999 है, एकमुश्त। अगर आप लाइव बैच जॉइन किए बिना अपनी मुफ़्त अवधि के बाद बस अभ्यास जारी रखना चाहते हैं, तो निरंतर ऐप एक्सेस ₹499/माह है। रिट्रीट्स और 1-ऑन-1 मेंटरिंग की कीमत कार्यक्रम अनुसार अलग होती है; सटीक कीमत और मौजूदा बैच उपलब्धता के लिए हमें WhatsApp पर संदेश भेजें।",
        },
        {
          question: "अगला ऑनलाइन रिट्रीट या रेजिडेंशियल बैच कब है?",
          answer:
            "11-दिवसीय ऑनलाइन रिट्रीट हर महीने चलता है; ऋषिकेश और लोनावला में रेजिडेंशियल रिट्रीट वर्ष में 3–4 बार छोटे समूहों में आयोजित होते हैं। अगली पक्की तारीख और बची हुई सीटों के लिए हमसे WhatsApp पर बात करें।",
        },
        {
          question: "क्या मुझे किसी विशेष चीज़ में विश्वास रखना ज़रूरी है — क्या यह धार्मिक है?",
          answer:
            "किसी विशेष विश्वास प्रणाली की आवश्यकता नहीं है। साइकिक और आध्यात्मिक कार्य ध्यान, श्वास-अभ्यास, और जागरूकता की तकनीकों पर आधारित है — आप अपना खुलापन लाएं, विधि हम बताएंगे।",
        },
        {
          question: "अगर मेरा सवाल यहां नहीं है तो?",
          answer: "डॉ. कपिल की टीम को सीधे WhatsApp पर संदेश भेजें — असली, सीधा जवाब मिलेगा, कोई बॉट नहीं।",
        },
      ],
      ctaLabel: "WhatsApp पर पूछें",
    },
    whatsapp: {
      bubble: "रिट्रीट्स या मास्टरक्लास के बारे में सवाल हैं? डॉ. कपिल की टीम से सीधे बात करें।",
      button: "WhatsApp पर चैट करें",
      ariaLabel: "डॉ. कपिल की टीम से WhatsApp पर चैट करें",
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
          heading: "क्वांटम माइंड ऐप",
          links: [{ label: "60 दिन मुफ़्त, फिर ₹499/माह", href: "/programs/quantum-speed-reading" }],
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
    qsrLanding: {
      hero: {
        eyebrow: "30-दिवसीय क्वांटम स्पीड रीडिंग मास्टरक्लास",
        headline: "5 गुना तेज़ पढ़ें। 100% याद रखें।",
        headlineEm: "कोई भी किताब मास्टर करें।",
        sub: "यह कोई वेबिनार नहीं है। यह 30 दिनों में आपके मस्तिष्क के सूचना ग्रहण करने, समझने और याद रखने के तरीके का एक मनोवैज्ञानिक और संज्ञानात्मक पुनर्निर्माण है — डॉ. कपिल देव शर्मा द्वारा लाइव मार्गदर्शित।",
        ctaPrimary: "अपनी बैच सीट सुरक्षित करें",
        ctaPrimaryMeta: "₹4,999 · एकमुश्त नामांकन",
        ctaSecondary: "मुफ़्त शुरू करें — 60 दिन हमारी ओर से",
        trustLine: "विद्यार्थियों, पेशेवरों, और हर आयु वर्ग के आजीवन सीखने वालों के लिए।",
        visualCaption: "आपकी 30-दिवसीय स्ट्रीक दिन 1 से शुरू होती है",
      },
      trustBadge: {
        title: "व्यक्तिगत रूप से पुष्टि, कोई ऑटोमेशन नहीं",
        desc: "हर नामांकन की पुष्टि चेकआउट के 24 घंटों के भीतर डॉ. कपिल की अपनी टीम करती है — एक असली व्यक्ति, कोई बॉट नहीं।",
        secondaryLine: "Razorpay के ज़रिए सुरक्षित चेकआउट · 2014 से 10,000+ विद्यार्थी",
      },
      brainScience: {
        eyebrow: "इसके पीछे का विज्ञान",
        title: "यह तरीका क्यों काम करता है, जब बाकी तरीके नहीं करते",
        desc: "क्वांटम स्पीड रीडिंग कोई तिकड़म नहीं है — यह चार खास संज्ञानात्मक प्रणालियों को फिर से प्रशिक्षित करती है, जिन्हें ज़्यादातर पढ़ने की आदतें कभी छूती ही नहीं।",
        cards: [
          {
            title: "राइट-ब्रेन क्षमताएं",
            desc: "पारंपरिक पढ़ाई लगभग पूरी तरह मस्तिष्क के भाषा-प्रोसेसिंग वाले हिस्से पर निर्भर करती है। यह प्रशिक्षण दायें गोलार्ध की समानांतर प्रोसेसिंग और पैटर्न पहचान को भी इसमें शामिल करता है — ताकि आप एक-एक शब्द नहीं, बल्कि समानांतर रूप में ग्रहण करें।",
          },
          {
            title: "विज़ुअलाइज़ेशन और अंतर्ज्ञान",
            desc: "जब राइट-ब्रेन सक्रिय होता है, तो जानकारी सार अक्षरों की बजाय जीवंत मानसिक चित्रों के रूप में जुड़ जाती है। यही इसे याद रखने लायक बनाता है — और यही वह अनुभव है जब ज़्यादातर लोग कहते हैं कि वे आखिरकार जो पढ़ रहे हैं उसे \"देख\" पा रहे हैं।",
          },
          {
            title: "पेरिफेरल विज़न",
            desc: "ज़्यादातर पाठक केवल अपने केंद्र-बिंदु पर मौजूद कुछ अक्षर ही ग्रहण करते हैं। अपने पेरिफेरल दृष्टि क्षेत्र का विस्तार करने से आपकी आंखें एक ही फिक्सेशन में पूरे वाक्यांश — कभी-कभी पूरी पंक्तियां — ग्रहण कर पाती हैं।",
          },
          {
            title: "गहन एकाग्रता",
            desc: "ऊपर बताई गई कोई भी बात बिना निरंतर, विकर्षण-मुक्त फोकस के टिक नहीं पाती। वही दैनिक अभ्यास जो पढ़ने की गति बढ़ाते हैं, आपकी लंबे समय तक एक ही काम पर ध्यान केंद्रित करने की क्षमता को भी प्रशिक्षित करते हैं।",
          },
        ],
      },
      appPreview: {
        eyebrow: "ऐप के भीतर",
        title: "आपका दैनिक अभ्यास वास्तव में कैसा दिखता है",
        desc: "30-दिवसीय स्ट्रीक का हर दिन एक जैसे शुरू होता है — एक छोटा, केंद्रित सत्र जिसे ऐप अपने आप ट्रैक करता है।",
        drillLabel: "आज का अभ्यास",
        drillValue: "पेरिफेरल विस्तार",
        stats: [
          { label: "सत्र की अवधि", value: "~10 मिनट" },
          { label: "वर्तमान WPM", value: "412" },
          { label: "समझ", value: "91%" },
        ],
        caption: "उदाहरण के तौर पर पूर्वावलोकन — आपके असली आंकड़े आपके अपने दिन 1 के आधार-स्तर से शुरू होंगे।",
      },
      ageGroups: {
        eyebrow: "हर उम्र के लिए बनाया गया",
        title: "एक मास्टरक्लास, हर आयु वर्ग के लिए अनुकूलित",
        desc: "एक ही मूल प्रशिक्षण, दो असली और सत्यापित तरीकों में — क्योंकि एक बच्चा और एक कामकाजी पेशेवर एक जैसे नहीं सीखते, और यह कार्यक्रम उनसे ऐसा करने को नहीं कहता।",
        pathways: [
          {
            title: "बच्चों के लिए",
            tag: "उच्च न्यूरोप्लास्टिसिटी",
            desc: "युवा मस्तिष्क में असाधारण न्यूरोप्लास्टिसिटी होती है — बिल्कुल नए संवेदी मार्ग बनाने की मूल क्षमता। सही मार्गदर्शन के साथ, कई बच्चे सहज दृष्टि (intuitive vision) विकसित करते हैं और आंखों पर पट्टी बांधकर सफलतापूर्वक पढ़ते हैं — यह एक असली, सत्यापित कौशल है, जो हमारे विद्यार्थियों के वीडियो रिव्यूज़ में देखा जा सकता है।",
          },
          {
            title: "वयस्कों और पेशेवरों के लिए",
            tag: "तेज़ ओपन-आई रीडिंग",
            desc: "वयस्कों का प्रशिक्षण तेज़, खुली आंखों से पढ़ने पर केंद्रित है — ऑकुलर फिक्सेशन और पेरिफेरल विज़न का विस्तार करके पूरी पंक्तियां और पन्ने तेज़ गति से ग्रहण करना, बिना आंखों पर पट्टी बांधे — ताकि एक पूरी किताब सामान्य समय के एक अंश में पूरी हो जाए।",
          },
        ],
        unifyingLine:
          "अलग अभिव्यक्ति, लेकिन एक ही अंतर्निहित प्रशिक्षण: पेरिफेरल विज़न, गहन एकाग्रता, और राइट-ब्रेन एंगेजमेंट — वही कौशल जो ऊपर \"इसके पीछे का विज्ञान\" में बताए गए हैं। विद्यार्थी चाहे कोई भी रास्ता चुनें, वही बुनियाद बन रही होती है।",
        ctaLabel: "असली विद्यार्थियों के वीडियो देखें",
      },
      authority: {
        eyebrow: "सीधे मूल स्रोत से",
        title: "भारत में QSR लाने वाले व्यक्ति से सीखें",
        desc: "किसी लाइसेंस-प्राप्त प्रशिक्षक से नहीं जो किसी और की प्रणाली सिखा रहा हो — बल्कि उस व्यक्ति से जिसने इसे शुरू किया।",
        cards: [
          {
            title: "इंग्लिश प्रोफेसर (15+ वर्षों का अनुभव)",
            desc: "इंग्लिश विषय में 15+ वर्षों का शैक्षणिक शिक्षण अनुभव।",
          },
          {
            title: "भारत में QSR के प्रणेता (2015 से)",
            desc: "भारत में क्वांटम स्पीड रीडिंग की शुरुआत की — इस मास्टरक्लास में पढ़ाई जाने वाली विधि का मूल स्रोत।",
          },
          {
            title: "10,000+ विद्यार्थियों का मार्गदर्शन",
            desc: "हज़ारों विद्यार्थियों को पूर्ण शुरुआती से उन्नत अभ्यासी तक व्यक्तिगत रूप से मार्गदर्शन दिया।",
          },
          {
            title: "500+ वर्कशॉप्स आयोजित",
            desc: "2014 से स्कूलों, कॉलेजों, और कॉर्पोरेट दर्शकों के लिए लाइव शिक्षण वर्कशॉप्स आयोजित कर रहे हैं।",
          },
        ],
      },
      founderVideo: {
        eyebrow: "डॉ. कपिल की ओर से, सीधे",
        title: "क्वांटम स्पीड रीडिंग अलग क्यों है",
        desc: "डॉ. कपिल देव शर्मा की ओर से एक संक्षिप्त परिचय — एक इंग्लिश प्रोफेसर, जिनके पास 15+ वर्षों का शिक्षण अनुभव है, और भारत में QSR के प्रणेता, जिन्होंने 2015 में देश में क्वांटम स्पीड रीडिंग की शुरुआत की। आप सीधे इस विधि के प्रणेता से सीख रहे हैं, किसी और की प्रणाली सिखाने वाले लाइसेंस-प्राप्त प्रशिक्षक से नहीं।",
        placeholderLabel: "वीडियो जल्द आ रहा है",
        ctaLabel: "इसके बजाय सवाल पूछें",
      },
      videoTestimonials: {
        eyebrow: "असली विद्यार्थियों को देखें",
        title: "200+ वीडियो रिव्यूज़, कोई पेड एक्टर नहीं",
        desc: "इस प्लेलिस्ट का हर वीडियो एक असली विद्यार्थी का है, जो प्रोग्राम पूरा करने के बाद फिल्माया गया — बिना किसी स्क्रिप्ट के।",
        ctaLabel: "सभी 200+ कहानियां देखें",
        moreLabel: "हमारे अन्य कार्यक्रमों के असली विद्यार्थी",
      },
      mechanics: {
        eyebrow: "यह कैसे काम करता है",
        title: "दो प्रणालियां, एक बदलाव",
        desc: "एक दैनिक ऐप स्ट्रीक जो कौशल सिखाती है, और लाइव सत्र जो उसके पीछे की मानसिकता स्थापित करते हैं।",
        app: {
          tag: "प्रतिदिन · ऐप में",
          title: "30-दिवसीय ऐप स्ट्रीक",
          desc: "आपकी अपनी गति से, हर दिन, क्वांटम माइंड ऐप के भीतर ही प्रगतिशील संज्ञानात्मक अभ्यास।",
          bullets: [
            "हर सत्र में WPM (शब्द प्रति मिनट) ट्रैक होता है, केवल एक बार नहीं",
            "गति के साथ-साथ समझ का भी स्कोर — कभी एक के बिना दूसरा नहीं",
            "प्रगतिशील कठिनाई — दिन 30, दिन 1 से कहीं ज़्यादा मांग करता है",
            "हर पूरा किया गया दिन खुला रहता है — जब चाहें दोबारा अभ्यास करें",
            "लगभग 10 मिनट प्रतिदिन",
          ],
        },
        live: {
          tag: "साप्ताहिक · डॉ. शर्मा के साथ लाइव",
          title: "7 लाइव मास्टरक्लास सत्र",
          desc: "30 दिनों में फैले इंटरैक्टिव सत्र, जहां डॉ. शर्मा व्यक्तिगत रूप से रीयल-टाइम में आपको तकनीक सिखाते हैं।",
          bullets: [
            "राइट-ब्रेन विज़ुअल रीडिंग — लाइव सिखाई जाती है, पहले से रिकॉर्ड नहीं",
            "सीधा प्रश्नोत्तर — अपनी खास अटकी हुई समस्या के बारे में पूछें",
            "अपने लाइव बैच समूह के साथ ग्रुप एकाउंटेबिलिटी",
            "सत्र छूट जाने पर रिकॉर्डिंग उपलब्ध",
          ],
        },
      },
      curriculum: {
        eyebrow: "पाठ्यक्रम",
        title: "30 दिन वास्तव में कैसे दिखते हैं",
        desc: "चार संरचित चरण। हर चरण पिछले पर सीधे आधारित है — यहां कुछ भी वैकल्पिक फिलर नहीं है।",
        weeks: [
          {
            range: "दिन 1–7",
            title: "ऑकुलर फिक्सेशन तोड़ना",
            desc: "आपकी आंखें पन्ने पर शारीरिक रूप से कैसे चलती हैं, इसे फिर से प्रशिक्षित करें — पेरिफेरल विज़न का विस्तार, और उस रुक-रुक कर पढ़ने की आदत को खत्म करना जो ज़्यादातर पाठकों को 250 WPM से नीचे रोके रखती है।",
          },
          {
            range: "दिन 8–14",
            title: "सब-वोकलाइज़ेशन को बायपास करना",
            desc: "उस भीतरी आवाज़ को रोकें जो पढ़ते समय चुपचाप हर शब्द बोलती है। यही एक बदलाव आमतौर पर आपकी पढ़ने की गति में सबसे बड़ी छलांग लाता है।",
          },
          {
            range: "दिन 15–21",
            title: "फोटोग्राफिक मेमोरी एंकरिंग",
            desc: "विज़ुअल और मल्टी-सेंसरी मेमोरी तकनीकों की परतें जोड़ें, ताकि जो आप तेज़ी से पढ़ें, वह याद भी रहे — पूरे पन्ने और बहु-स्तरीय जानकारी का ग्रहण।",
          },
          {
            range: "दिन 22–30",
            title: "पूर्ण-पुस्तक संश्लेषण और मास्टरी",
            desc: "सब कुछ एक असली, पूर्ण-लंबाई की किताब पर लागू करें, अपने अंतिम आंकड़ों की स्पीड-टेस्टिंग करें, और अपना मास्टरी सर्टिफिकेशन पूरा करें।",
          },
        ],
      },
      audience: {
        eyebrow: "यह किसके लिए बना है",
        title: "तीन तरह के लोग यह मास्टरक्लास लेते हैं",
        groups: [
          {
            title: "विद्यार्थी",
            desc: "प्रतियोगी परीक्षाओं की तैयारी करने वाले, जहां सिलेबस की मात्रा — न कि बुद्धिमत्ता — असली रुकावट है।",
          },
          {
            title: "पेशेवर",
            desc: "रिपोर्ट्स, रिसर्च, और ईमेल में डूबे हुए — सूचना का वह बोझ जिसे किसी प्रोडक्टिविटी ऐप ने ठीक नहीं किया।",
          },
          {
            title: "आजीवन सीखने वाले",
            desc: "किसी भी उम्र में उत्कृष्ट संज्ञानात्मक प्रदर्शन चाहने वाला कोई भी व्यक्ति, जो चाहता है कि उसका मन जो पढ़े उसका ज़्यादा उपयोग कर सके।",
          },
        ],
      },
      faq: {
        eyebrow: "नामांकन से पहले",
        title: "दिन 1 से पहले लोग जो सवाल पूछते हैं",
        items: [
          {
            question: "क्या यह पूर्ण शुरुआती के लिए मुश्किल है?",
            answer:
              "नहीं। 30-दिवसीय संरचना यह मानकर चलती है कि आपको कोई पूर्व कौशल नहीं है और आपकी असली शुरुआत से आरंभ होती है — डॉ. शर्मा ने 2014 से अब तक 10,000+ विद्यार्थियों को इसमें मार्गदर्शन दिया है, जिनमें अधिकांश पूर्ण शुरुआती थे।",
          },
          {
            question: "प्रतिदिन कितना समय देना होगा?",
            answer:
              "ऐप में लगभग 10 मिनट प्रतिदिन, साथ ही डॉ. शर्मा के साथ सप्ताह में एक लाइव मास्टरक्लास सत्र। यह पूर्णकालिक नौकरी या पढ़ाई के शेड्यूल के साथ फिट होने के लिए बनाया गया है, उससे टकराने के लिए नहीं।",
          },
          {
            question: "क्या यह हर आयु वर्ग के लिए काम करता है?",
            answer:
              "हां — परीक्षा की तैयारी करने वाले विद्यार्थियों, कामकाजी पेशेवरों, और हर उम्र के आजीवन सीखने वालों ने यह मास्टरक्लास पूरा किया है। गति आपकी शुरुआती स्थिति के अनुसार ढल जाती है।",
          },
          {
            question: "क्या इसमें से कुछ वास्तव में मुफ़्त है?",
            answer:
              "हां — हर नए साइन-अप को 60 दिनों का मुफ़्त अभ्यास एक्सेस मिलता है: पूरा 30-दिवसीय QSR पाठ्यक्रम और दैनिक ऐप अभ्यास, किसी भुगतान की आवश्यकता नहीं। पूरे किए गए दिन भी खुले रहते हैं, तो आप इन 60 दिनों के दौरान किसी भी दिन को जितनी बार चाहें दोबारा अभ्यास कर सकते हैं। डॉ. शर्मा के साथ एक लाइव मास्टरक्लास बैच जॉइन करना ₹4,999 है, एकमुश्त; अगर आप लाइव बैच के बिना बस अपनी मुफ़्त अवधि के बाद अभ्यास जारी रखना चाहते हैं, तो निरंतर एक्सेस ₹499/माह है।",
          },
          {
            question: "₹4,999 में मुझे वास्तव में क्या मिलता है?",
            answer:
              "पूरा 30-दिवसीय प्रगतिशील ऐप पाठ्यक्रम, डॉ. शर्मा के साथ सभी 7 लाइव मास्टरक्लास सत्र, और पूरे समय WPM व समझ की ट्रैकिंग — एक एकमुश्त नामांकन, कोई सब्सक्रिप्शन नहीं। आपके पहले 60 दिनों का ऐप एक्सेस वैसे भी मुफ़्त है; ₹4,999 विशेष रूप से एक लाइव बैच जॉइन करने के लिए है।",
          },
          {
            question: "भुगतान के तुरंत बाद क्या होता है?",
            answer:
              "नामांकन की पुष्टि डॉ. कपिल की टीम व्यक्तिगत रूप से करती है, कोई ऑटोमेटेड सिस्टम नहीं — चेकआउट के तुरंत बाद हम आपसे आपके बैच शेड्यूल के साथ संपर्क करेंगे।",
          },
          {
            question: "अगर मेरा सवाल यहां नहीं है तो?",
            answer: "नामांकन से पहले डॉ. कपिल की टीम को सीधे WhatsApp पर संदेश भेजें — असली व्यक्ति से बात होगी, कोई बॉट नहीं।",
          },
        ],
        ctaLabel: "WhatsApp पर पूछें",
      },
      finalCta: {
        eyebrow: "जब आप तैयार हों",
        title: "आपके 30 दिन एक फैसले से शुरू होते हैं",
        desc: "नामांकन की पुष्टि डॉ. कपिल की अपनी टीम व्यक्तिगत रूप से करती है, कोई ऑटोमेटेड सिस्टम नहीं।",
        cta: "अपनी बैच सीट सुरक्षित करें",
        ctaMeta: "₹4,999 · एकमुश्त नामांकन",
        batchNoticeLabel: "अगला बैच शुरू होता है",
        cadenceLine: "नए बैच महीने में दो बार शुरू होते हैं — 7 तारीख और 25 तारीख को।",
        structureLine: "आपके 30 दिनों में 7 लाइव क्लासेज़ · दैनिक अभ्यास ऐप के ज़रिए",
      },
      stickyBar: {
        text: "30-दिवसीय क्वांटम स्पीड रीडिंग मास्टरक्लास",
        price: "₹4,999 · एकमुश्त",
        cta: "अपनी बैच सीट सुरक्षित करें",
      },
      whatsapp: {
        bubble: "QSR बैच के बारे में सवाल हैं? डॉ. कपिल की टीम से तुरंत बात करें।",
        button: "WhatsApp पर चैट करें",
        ariaLabel: "क्वांटम स्पीड रीडिंग मास्टरक्लास के बारे में डॉ. कपिल की टीम से WhatsApp पर चैट करें",
      },
    },
    retreatLanding: {
      hero: {
        eyebrow: "ऑनलाइन · 2014 से · छोटा समूह",
        headline: "अपने उच्च मन को जगाएं",
        headlineEm: "11-दिवसीय ऑनलाइन साइकिक एंड स्पिरिचुअल रिट्रीट",
        sub: "कोई और मेडिटेशन ऐप नहीं, जो आपको वहीं छोड़ दे जहां से आपने शुरुआत की थी। यह असली क्रिया योग, प्राण, और ब्रह्मांडीय ऊर्जा में एक गहन, लाइव, 11-दिवसीय यात्रा है — प्रतिरात डॉ. कपिल देव शर्मा द्वारा मार्गदर्शित, जो 2014 से व्यक्तिगत रूप से यह मार्ग सिखा रहे हैं।",
        ctaPrimary: "अपनी रिट्रीट सीट सुरक्षित करें",
        ctaPrimaryMeta: "Razorpay के ज़रिए सुरक्षित चेकआउट",
        ctaSecondary: "11-दिवसीय पाठ्यक्रम देखें",
        ctaTertiary: "बुक करने के लिए तैयार नहीं हैं? पहले असली विद्यार्थियों की कहानियां देखें",
        trustLine: "थके हुए पेशेवरों, लगातार ओवरथिंक करने वालों, और असली आध्यात्मिक खोजियों के लिए — जो सिद्धांत से थक चुके हैं और एक वास्तविक आंतरिक अनुभव के लिए तैयार हैं।",
        visualPlaceholderLabel: "रिट्रीट परिचय — जल्द आ रहा है",
      },
      coreProblem: {
        eyebrow: "मेडिटेशन ऐप्स क्यों काम नहीं करते",
        title: "आपका मन टूटा हुआ नहीं है। यह अप्रशिक्षित है — और अपोषित है।",
        desc: "आपने ऐप्स आज़माए हैं। सांस लेने के अभ्यास। बारिश की आवाज़ों वाले दस-मिनट के गाइडेड सेशन। पांच मिनट बाद भी आपके दिमाग़ का वह चक्र वहीं है।",
        painPoints: [
          "पुराना तनाव किसी शांत आवाज़ से ठीक नहीं होता — यह किसी ऐसी चीज़ से ठीक होता है जो वास्तव में ऊर्जा को गति देती है, सिर्फ ध्यान को नहीं।",
          "आपको एक और रिलैक्सेशन तकनीक की ज़रूरत नहीं है। आपको किसी असली चीज़ से संपर्क चाहिए — अपनी खुद की जीवन-शक्ति, उसकी अनुपस्थिति से ध्यान भटकाने वाली चीज़ नहीं।",
          "हर ऐप शांति का वादा करता है। लगभग कोई नहीं बताता कि आपके भीतर वास्तव में क्या हो रहा है, या इसे बदलने का कोई असली तरीका देता है।",
        ],
        solution:
          "यह रिट्रीट आधुनिक वेलनेस ट्रेंड्स पर आधारित नहीं है। यह क्रिया योग में निहित है — प्राण, आपकी अपनी जीवन-शक्ति, के साथ सीधे काम करने की एक असली, सदियों पुरानी विधि — ब्रह्मांडीय ऊर्जा और ब्रह्मांडीय संलयन के ज़रिए — सिर्फ आपके ध्यान की अवधि नहीं। 11 रातों तक जो आप अभ्यास करते हैं, वह एक महसूस होने वाला, वास्तविक बदलाव लाता है, पांच शांत मिनट नहीं।",
      },
      schedule: {
        eyebrow: "बैच शेड्यूल",
        title: "अगले बैच में अपनी सीट सुरक्षित करें",
        desc: "हर महीने की 10 तारीख को एक नया बैच शुरू होता है और 11 दिनों तक चलता है — उस बैच में सभी के लिए एक ही दैनिक समय।",
        durationLabel: "अवधि",
        durationValue: "11 दिन · दिन 10 – दिन 20",
        cadenceLabel: "बैच आवृत्ति",
        cadenceValue: "मासिक, ऑनलाइन",
        timingLabel: "दैनिक लाइव सत्र",
        timingValue: "शाम 7:30 – रात 10:30",
        nextBatchLabel: "अगला बैच",
        cta: "अपनी रिट्रीट सीट सुरक्षित करें",
        ctaMeta: "Razorpay के ज़रिए सुरक्षित चेकआउट",
        badges: [
          { title: "सुरक्षित भुगतान", desc: "चेकआउट Razorpay द्वारा संभाला जाता है, एक भरोसेमंद पेमेंट गेटवे।" },
          { title: "व्यक्तिगत रूप से पुष्टि", desc: "डॉ. कपिल की टीम का एक असली व्यक्ति आपके बैच और शेड्यूल की पुष्टि करता है — कोई बॉट नहीं।" },
          { title: "छोटा समूह", desc: "हर बैच जानबूझकर छोटा रखा जाता है — सीमित नामांकन, कोई बड़ा वेबिनार नहीं।" },
        ],
      },
      disciplines: {
        eyebrow: "आप क्या सीखेंगे",
        title: "छह अनुशासन, एक 11-दिवसीय यात्रा",
        desc: "हर रात पिछली रात पर आधारित होती है, डॉ. शर्मा द्वारा लाइव मार्गदर्शित — कभी कोई सिद्धांत नहीं जिसे आप सिर्फ पढ़ें, हमेशा एक अभ्यास जिसे आप महसूस करें।",
        items: [
          {
            title: "मानसिक तरंग संचार (टेलीपैथी)",
            desc: "मौन, प्रत्यक्ष मन-से-मन तालमेल का अनुभव करें — एक ऐसा गहरा जुड़ाव जिसे शब्द कभी व्यक्त नहीं कर सकते।",
          },
          {
            title: "आभा स्कैनिंग और रीडिंग",
            desc: "अपने चारों ओर की ऊर्जा को महसूस करना सीखें, अपनी ऊर्जा की रक्षा करें, और वह पढ़ें जो लोगों के शब्द नहीं बताते।",
          },
          {
            title: "समाधि ध्यान",
            desc: "उन मानसिक चक्रों को शांत करें जो रुकते ही नहीं, और उनके नीचे छिपी उस स्थिरता को छुएं जो हमेशा से वहां थी।",
          },
          {
            title: "चक्र सक्रियण और ज्ञानोदय",
            desc: "वर्षों से ढोए जा रहे ऊर्जा अवरोधों को दूर करें, और असली जीवन-शक्ति — कैफीन नहीं, इच्छाशक्ति नहीं — को फिर से अपने शरीर में प्रवाहित होने दें।",
          },
          {
            title: "कुंडलिनी ध्यान",
            desc: "रीढ़ के आधार पर सुप्त ऊर्जा को सुरक्षित रूप से जगाएं और उसे आपको हिलाने नहीं, बल्कि आगे बढ़ाने दें।",
          },
          {
            title: "सूक्ष्म शरीर यात्रा",
            desc: "भौतिक सीमाओं से आगे कदम रखें — और जो वहां मिले उससे बदलकर लौटें।",
          },
        ],
      },
      authority: {
        eyebrow: "एक सिद्ध मार्ग, कोई ट्रेंड नहीं",
        title: "एक दशक से अधिक समय से, एक ही शिक्षक द्वारा मार्गदर्शित",
        desc: "असली साल, असली विद्यार्थी, असली समीक्षाएं — कोई ऐसा कार्यक्रम नहीं जो पिछली तिमाही में लॉन्च हुआ हो।",
        cards: [
          {
            title: "2014 से पढ़ा रहे हैं",
            desc: "इसी मार्ग पर विद्यार्थियों का व्यक्तिगत रूप से 12+ वर्षों से मार्गदर्शन — कोई हाल ही में शुरू हुआ ट्रेंड-आधारित कार्यक्रम नहीं।",
          },
          {
            title: "150+ असली विद्यार्थी समीक्षाएं",
            desc: "असली प्रतिभागियों की लिखित और वीडियो समीक्षाएं — कोई स्टॉक फुटेज या पेड एक्टर नहीं।",
          },
          {
            title: "हर बैच में छोटा समूह",
            desc: "हर बैच जानबूझकर छोटा रखा जाता है ताकि डॉ. शर्मा वास्तव में आपका मार्गदर्शन कर सकें, किसी भीड़ को भाषण न दे रहे हों।",
          },
          {
            title: "हर रात व्यक्तिगत रूप से मार्गदर्शित",
            desc: "कोई पहले से रिकॉर्ड नहीं, किसी सहायक प्रशिक्षक को नहीं सौंपा गया — डॉ. शर्मा, लाइव, सभी 11 रातें।",
          },
        ],
      },
      liveStructure: {
        eyebrow: "11 रातें कैसे काम करती हैं",
        title: "लाइव मार्गदर्शन, कोई पहले से रिकॉर्डेड कोर्स नहीं",
        desc: "11 में से हर रात, शाम 7:30 से रात 10:30 तक, आप डॉ. शर्मा के साथ लाइव होते हैं — कोई वीडियो लाइब्रेरी नहीं जिसे आप जब सुविधाजनक हो तब पूरा करें।",
        points: [
          {
            title: "प्रतिरात लाइव सत्र",
            desc: "रिट्रीट की हर रात डॉ. शर्मा के साथ एक लाइव मार्गदर्शित सत्र, शाम 7:30 – रात 10:30 — रीयल-टाइम में, पहले से रिकॉर्ड नहीं।",
          },
          {
            title: "इंटरैक्टिव अभ्यास",
            desc: "उस दिन के अनुशासन के लिए संरचित अभ्यास समय, खुद जांचने वाली चेकलिस्ट की बजाय सीधी प्रतिक्रिया के साथ।",
          },
          {
            title: "सीधा मार्गदर्शन",
            desc: "रिट्रीट के दौरान सवालों के जवाब सीधे डॉ. शर्मा देते हैं, किसी सपोर्ट टिकट के ज़रिए नहीं।",
          },
        ],
      },
      outcomes: {
        eyebrow: "11 रातों के बाद",
        title: "रिट्रीट खत्म होने पर क्या बदलता है",
        items: [
          "मानसिक चक्र आखिरकार शांत हो जाते हैं — दबाए नहीं जाते, सुलझ जाते हैं",
          "अपनी ऊर्जा का एक महसूस होने वाला एहसास, सिर्फ एक विचार नहीं",
          "उस दबाव में असली भावनात्मक स्थिरता जो पहले आपको तोड़ देता था",
          "अपने मन को अनुभव करने के तरीके में एक स्थायी बदलाव — दिन 12 तक ख़त्म होने वाला 11-दिवसीय उत्साह नहीं",
        ],
      },
      videoTestimonials: {
        eyebrow: "असली विद्यार्थियों को देखें",
        title: "12+ वर्षों के असली रिट्रीट्स से, 150+ असली समीक्षाएं",
        desc: "इस प्लेलिस्ट का हर वीडियो एक असली विद्यार्थी का है, जो प्रोग्राम पूरा करने के बाद फिल्माया गया — बिना किसी स्क्रिप्ट के।",
        ctaLabel: "सभी कहानियां देखें",
        moreLabel: "हमारे अन्य कार्यक्रमों के असली विद्यार्थी",
      },
      faq: {
        eyebrow: "नामांकन से पहले",
        title: "दिन 1 से पहले लोग जो सवाल पूछते हैं",
        items: [
          {
            question: "क्या मुझे ध्यान या साइकिक कार्य का कोई पूर्व अनुभव चाहिए?",
            answer:
              "किसी विशेष विश्वास प्रणाली या पूर्व अनुभव की ज़रूरत नहीं है। क्रिया योग 11 रातों में धीरे-धीरे आगे बढ़ता है — आप अपना खुलापन लाएं, डॉ. शर्मा हर कदम पर विधि बताएंगे।",
          },
          {
            question: "क्रिया योग वास्तव में क्या है?",
            answer:
              "क्रिया योग प्राण — आपकी अपनी जीवन-शक्ति — के साथ सीधे काम करने की एक असली, सदियों पुरानी विधि है, सांस और विशेष आंतरिक तकनीकों के ज़रिए, कोई ऐसा दर्शनशास्त्र नहीं जिसे आप सिर्फ पढ़ें। यही पूरे 11-दिवसीय रिट्रीट की नींव है।",
          },
          {
            question: "प्रतिदिन कितना समय देना होगा?",
            answer:
              "हर दिन में डॉ. शर्मा के साथ शाम 7:30 से रात 10:30 तक एक लाइव सत्र और मार्गदर्शित अभ्यास शामिल है — 11-दिवसीय बैच के हर दिन यही समय।",
          },
          {
            question: "लाइव सत्र किस समय होते हैं?",
            answer:
              "शाम 7:30 से रात 10:30 तक, प्रतिदिन, बैच के सभी 11 दिनों के लिए — हर बैच के लिए यही समय, ताकि आप पहले से योजना बना सकें।",
          },
          {
            question: "जुड़ने के लिए तकनीकी रूप से क्या चाहिए?",
            answer:
              "बस एक स्थिर इंटरनेट कनेक्शन और कैमरा व ऑडियो वाला एक डिवाइस। लाइव सत्र लिंक शुरुआत की तारीख के करीब पुष्ट प्रतिभागियों के साथ सीधे साझा किया जाता है।",
          },
          {
            question: "क्या यह धार्मिक है, या किसी विशेष विश्वास प्रणाली से जुड़ा है?",
            answer:
              "किसी विशेष विश्वास प्रणाली की आवश्यकता नहीं है। यह कार्य ध्यान, श्वास-अभ्यास, और जागरूकता की तकनीकों पर आधारित है — आप अपना खुलापन लाएं, विधि हम बताएंगे।",
          },
          {
            question: "अगला बैच कब है, और कितनी सीटें बची हैं?",
            answer:
              "11-दिवसीय ऑनलाइन रिट्रीट हर महीने की 10 तारीख को शुरू होकर 20 तारीख तक चलता है। मौजूदा बैच की बची हुई सीटों के लिए हमें WhatsApp पर संदेश भेजें।",
          },
        ],
        ctaLabel: "WhatsApp पर पूछें",
      },
      finalCta: {
        eyebrow: "जब आप तैयार हों",
        title: "आपका जागरण एक फैसले से शुरू होता है",
        desc: "नामांकन की पुष्टि डॉ. कपिल की अपनी टीम व्यक्तिगत रूप से करती है — कोई ऑटोमेटेड सिस्टम नहीं। बारह साल, 150+ असली विद्यार्थी, एक समय में एक छोटा समूह। अगले बैच में अपनी सीट बुक करें।",
        cta: "अपनी रिट्रीट सीट सुरक्षित करें",
      },
      stickyBar: {
        text: "11-दिवसीय ऑनलाइन साइकिक एंड स्पिरिचुअल रिट्रीट",
        price: "छोटा समूह · सीमित नामांकन",
        cta: "अपनी रिट्रीट सीट सुरक्षित करें",
      },
      whatsapp: {
        bubble: "11-दिवसीय रिट्रीट के बारे में सवाल हैं? डॉ. कपिल की टीम से तुरंत बात करें।",
        button: "WhatsApp पर चैट करें",
        ariaLabel: "11-दिवसीय रिट्रीट के बारे में डॉ. कपिल की टीम से WhatsApp पर चैट करें",
      },
    },
    residentialLanding: {
      hero: {
        eyebrow: "रेजिडेंशियल रिट्रीट्स · 2014 से · छोटे समूह",
        headline: "उस कमरे को छोड़ दें जिसने आपको तोड़ दिया।",
        headlineEm: "लोनावला और ऋषिकेश में रेजिडेंशियल रिट्रीट्स",
        sub: "आपने बिस्तर पर मेडिटेशन किया, ट्रैफिक में किया, एक ऐप के साथ किया जो कहता रहा बस सांस लें। यह काम नहीं आया — इसलिए नहीं कि आप असफल हुए, बल्कि इसलिए कि एक 10-मिनट की रिकॉर्डिंग वहां तक कभी नहीं पहुंच सकती जहां थकान असल में रहती है। यह डॉ. कपिल देव शर्मा हैं, आपके साथ उसी कमरे में, कई दिनों तक — क्रिया योग, प्राण, और ब्रह्मांडीय ऊर्जा का काम, सीधे मार्गदर्शन में, 2014 से।",
        ctaPrimary: "अपनी रेजिडेंशियल सीट सुरक्षित करें",
        ctaPrimaryMeta: "डॉ. कपिल की टीम द्वारा व्यक्तिगत रूप से पुष्टि",
        ctaSecondary: "2026–27 का शेड्यूल देखें",
        trustLine: "थके हुए पेशेवरों, लगातार ओवरथिंक करने वालों, और असली आध्यात्मिक खोजियों के लिए — जो सिर्फ लॉग ऑफ नहीं, वाकई छोड़ने के लिए तैयार हैं।",
      },
      roadmap: {
        eyebrow: "आधिकारिक शेड्यूल",
        title: "चार यात्राएं। दो पवित्र स्थान। एक मार्ग।",
        desc: "हर रेजिडेंशियल रिट्रीट जानबूझकर छोटा, जानबूझकर मौसमी, और जानबूझकर अलग-अलग समय पर रखा गया है — ताकि हर एक गहराई तक जा सके, फैलाव में नहीं।",
        items: [
          { when: "नवंबर 2026", where: "लोनावला", theme: "पर्वत और प्रकृति में गहन विसर्जन" },
          { when: "फरवरी 2027", where: "ऋषिकेश", theme: "गंगा के किनारे आध्यात्मिक राजधानी" },
          { when: "जून 2027", where: "लोनावला", theme: "मानसून सोल रिट्रीट" },
          { when: "नवंबर 2027", where: "लोनावला", theme: "विंटर डीप प्रैक्टिस" },
        ],
        ctaLabel: "इस तारीख के लिए आवेदन करें",
      },
      coreProblem: {
        eyebrow: "ऑनलाइन भी क्यों पर्याप्त नहीं है",
        title: "आपके मन को और जानकारी नहीं चाहिए। उसे दूरी चाहिए।",
        desc: "आपने ऐप्स आज़माए। शायद एक लाइव ऑनलाइन सेशन भी। एक घंटे के लिए लूप हल्का होता है, फिर इनबॉक्स खुलता है और वापस आ जाता है।",
        painPoints: [
          "एक ऐप उस नर्वस सिस्टम से मुकाबला करता है जो वर्षों से हल्के अलार्म में रहा है — और हर बार हार जाता है, क्योंकि वह अब भी उसी शोरगुल वाले माहौल में चल रहा है जिसने थकान पैदा की।",
          "एक लाइव ऑनलाइन रिट्रीट में भी आपका फोन मेज़ पर बगल में रखा होता है। असली डिस्कनेक्ट स्क्रीन के ज़रिए कभी नहीं होता, मार्गदर्शन चाहे जितना अच्छा हो।",
          "गहन ऊर्जा कार्य — कुंडलिनी, समाधि, सीधा प्राणिक सक्रियण — सबसे सुरक्षित और सशक्त तब होता है जब गुरु शारीरिक रूप से मौजूद हों और ठीक-ठीक देख सकें आप कहां हैं, वीडियो कॉल से अंदाज़ा लगाने के बजाय।",
        ],
        solution:
          "इसीलिए रेजिडेंशियल फॉर्मैट मौजूद है। असली क्रिया योग, सीधे प्राण के साथ काम — आपकी अपनी जीवन शक्ति — ब्रह्मांडीय ऊर्जा और कॉस्मिक फ्यूज़न के ज़रिए, एक ऐसे कमरे में जहां कोई नोटिफिकेशन नहीं, कोई इनबॉक्स नहीं, और एक जीवित गुरु जो वाकई आपको देख सकते हैं। इन दिनों में जो होता है वह एक महसूस होने वाला, भौतिक बदलाव पैदा करता है, न कि घर लौटते ही मिटने वाली अस्थायी शांति।",
      },
      advantage: {
        eyebrow: "वह हिस्सा जो कोई ऐप दोहरा नहीं सकता",
        title: "चार चीज़ें जो सिर्फ उस कमरे में होती हैं",
        desc: "यही पूरी वजह है कि यह रिट्रीट रेजिडेंशियल है, वैकल्पिक नहीं।",
        items: [
          {
            title: "पूर्ण डिस्कनेक्ट",
            desc: "कोई नोटिफिकेशन नहीं, कोई इनबॉक्स नहीं, कोई \"बस एक चीज़ देख लूं\" नहीं। आपका नर्वस सिस्टम पूरी तरह शांत हो पाता है — अक्सर वर्षों में पहली बार।",
          },
          {
            title: "सीधा ऊर्जा संचरण",
            desc: "एक गुरु की रिकॉर्डिंग और उसी कमरे में बैठने में एक वास्तविक, महसूस होने वाला अंतर है। इसे डिजिटल नहीं किया जा सकता।",
          },
          {
            title: "छोटे, विशिष्ट समूह",
            desc: "यह कोई भीड़ भरा आयोजन नहीं। हर रिट्रीट जानबूझकर छोटा रखा जाता है, ताकि डॉ. कपिल वाकई आपकी मुद्रा, आपकी सांस, आपका प्रतिरोध देख सकें — और उसे तुरंत सुधार सकें।",
          },
          {
            title: "व्यक्तिगत जांच",
            desc: "हर आवेदक की पुष्टि से पहले समीक्षा होती है। इतना अंतरंग कमरा तभी काम करता है जब उसमें मौजूद हर व्यक्ति वाकई काम करने के लिए तैयार हो।",
          },
        ],
      },
      journey: {
        eyebrow: "काम खुद",
        title: "एक संरचित, बहु-दिवसीय विसर्जन",
        desc: "हर रेजिडेंशियल रिट्रीट एक जानबूझकर बनाई गई यात्रा के रूप में खुलता है — पहले ग्राउंडिंग, फिर ऊर्जा सक्रियण, फिर गहन स्थिरता, फिर एकीकरण — ताकि बदलाव को वाकई बैठने का समय मिले।",
        items: [
          {
            title: "ग्राउंडिंग और आगमन",
            desc: "सांस पुनर्संतुलन और नर्वस सिस्टम को शांत करना — गहरे काम की शुरुआत से पहले पूरी तरह उपस्थित होना।",
          },
          {
            title: "क्रिया योग और प्राणिक सक्रियण",
            desc: "मूल तकनीक, संरचित, सुरक्षित क्रम में सिखाई गई, व्यक्तिगत रूप से सुधारी गई।",
          },
          {
            title: "ऊर्जा और चक्र कार्य",
            desc: "सीधा, निर्देशित अभ्यास — किसी स्लाइड पर पढ़ा गया सिद्धांत नहीं।",
          },
          {
            title: "गहन स्थिरता और समाधि अभ्यास",
            desc: "वह अवस्था जिसकी ओर रिट्रीट का बाकी हर हिस्सा चुपचाप बढ़ रहा था।",
          },
          {
            title: "एकीकरण और समापन",
            desc: "ताकि जो आपने बनाया वह घर लौटते ही टूट न जाए।",
          },
        ],
      },
      gallery: {
        eyebrow: "रिट्रीट के अंदर",
        title: "यह वास्तव में कैसा दिखता है",
        desc: "माहौल, समूह, और अभ्यास की एक झलक — हर रिट्रीट के बाद असली तस्वीरें यहां जोड़ी जाएंगी।",
      },
      authority: {
        eyebrow: "एक सिद्ध मार्ग, कोई ट्रेंड नहीं",
        title: "एक दशक से अधिक समय से एक ही गुरु द्वारा मार्गदर्शित",
        desc: "असली साल, असली विद्यार्थी, असली समीक्षाएं — कोई पिछली तिमाही में शुरू हुआ रिट्रीट नहीं।",
        cards: [
          {
            title: "2014 से पढ़ा रहे हैं",
            desc: "एक दशक से अधिक समय से व्यक्तिगत रूप से रेजिडेंशियल रिट्रीट्स का मार्गदर्शन — कोई हाल में शुरू हुआ रिट्रीट व्यवसाय ट्रेंड के पीछे नहीं भाग रहा।",
          },
          {
            title: "150+ असली विद्यार्थी समीक्षाएं",
            desc: "असली प्रतिभागियों की लिखित और वीडियो समीक्षाएं, कोई स्टॉक फुटेज या पेड एक्टर नहीं।",
          },
          {
            title: "हर रिट्रीट में छोटा समूह",
            desc: "हर रिट्रीट जानबूझकर छोटा रखा जाता है ताकि डॉ. कपिल वाकई आपका मार्गदर्शन कर सकें, भीड़ को लेक्चर न दें।",
          },
          {
            title: "व्यक्तिगत रूप से, स्वयं मौजूद",
            desc: "किसी सहायक प्रशिक्षक को नहीं सौंपा गया — डॉ. कपिल, पूरे रिट्रीट के दौरान शारीरिक रूप से मौजूद।",
          },
        ],
      },
      venues: {
        eyebrow: "यह कहां होता है",
        title: "दो पवित्र स्थान",
        desc: "हर स्थान जानबूझकर चुना गया है — भूमि खुद अभ्यास का हिस्सा है।",
        locations: [
          {
            name: "ड्रीम हॉलिडे रिज़ॉर्ट, तुंगार्ली",
            address: "तुंगार्ली, लोनावला, महाराष्ट्र",
            note: "चार में से तीन 2026–27 रिट्रीट्स की मेज़बानी — नवंबर 2026, जून 2027, और नवंबर 2027।",
          },
          {
            name: "होटल कृष्णा कॉटेज",
            address: "जोंक, स्वर्गाश्रम, ऋषिकेश",
            note: "फरवरी 2027 के रिट्रीट की मेज़बानी — गंगा के किनारे, हिमालय की आध्यात्मिक राजधानी में।",
          },
        ],
      },
      pricing: {
        eyebrow: "अपना कमरा चुनें",
        title: "एक कीमत, कोई आश्चर्य नहीं",
        desc: "सभी चार 2026–27 तारीखों पर एक समान दर — प्रति व्यक्ति, भोजन और ठहरना शामिल।",
        tiers: [
          {
            name: "शेयरिंग रूम",
            price: "₹35,000",
            priceNote: "प्रति व्यक्ति",
            features: [
              "पूरा रेजिडेंशियल रिट्रीट, सभी सेशन शामिल",
              "शेयर्ड डीलक्स आवास",
              "शुद्ध सात्विक भोजन, शामिल",
              "डॉ. कपिल का सीधा, व्यक्तिगत मार्गदर्शन",
            ],
            cta: "शेयरिंग रूम बुक करें",
          },
          {
            name: "प्राइवेट रूम",
            price: "₹45,000",
            priceNote: "प्रति व्यक्ति",
            features: [
              "पूरा रेजिडेंशियल रिट्रीट, सभी सेशन शामिल",
              "प्राइवेट, नॉन-शेयरिंग आवास",
              "शुद्ध सात्विक भोजन, शामिल",
              "डॉ. कपिल का सीधा, व्यक्तिगत मार्गदर्शन",
            ],
            cta: "प्राइवेट रूम बुक करें",
          },
        ],
        note: "सीटें डॉ. कपिल की टीम द्वारा व्यक्तिगत रूप से पुष्टि की जाती हैं, ऑटोमेटेड चेकआउट से नहीं — शुरू करने के लिए अपनी पसंदीदा तारीख के साथ हमें WhatsApp पर मैसेज करें।",
      },
      videoTestimonials: {
        eyebrow: "असली विद्यार्थियों को देखें",
        title: "एक दशक से अधिक के असली रिट्रीट्स से, 150+ असली समीक्षाएं",
        desc: "नीचे हर वीडियो एक असली विद्यार्थी का है, रिट्रीट पूरा करने के बाद फिल्माया गया — बिना किसी स्क्रिप्ट के।",
        ctaLabel: "और असली कहानियां देखें",
      },
      audience: {
        eyebrow: "यहां खुद से ईमानदार रहें",
        title: "यह सबके लिए नहीं है। यह आपके लिए है अगर —",
        items: [
          "आप एक हाई-परफॉर्मर हैं जो चुपचाप बर्नआउट में हैं — कागज़ पर सफल, अंदर से थके हुए",
          "आप लगातार ओवरथिंक करते हैं — हालात ठीक होने से लूप रुकता नहीं",
          "आपने ऐप्स, किताबें, पॉडकास्ट आज़माए हैं — और अस्थायी राहत मिली, असली बदलाव कभी नहीं",
          "आप एक असली आध्यात्मिक खोजी हैं — असली अभ्यास के लिए तैयार, और कंटेंट के लिए नहीं",
          "आप रिट्रीट की पूरी अवधि के लिए पूरी तरह प्रतिबद्ध हो सकते हैं — यह तभी काम करता है जब आप वाकई निकलें",
        ],
        disclaimer: "अगर आप थोड़े योग के साथ एक आरामदायक छुट्टी ढूंढ रहे हैं, तो यह वह नहीं है। अगर आप एक गुरु की करीबी निगरानी में असली, संरचित आंतरिक काम के लिए तैयार हैं, तो आप सही जगह हैं।",
      },
      faq: {
        eyebrow: "आवेदन करने से पहले",
        title: "बुकिंग से पहले लोग जो सवाल पूछते हैं",
        items: [
          {
            question: "क्या यह पूर्ण शुरुआती लोगों के लिए उपयुक्त है?",
            answer: "हां। क्रिया योग, मेडिटेशन, या ऊर्जा कार्य का कोई पूर्व अनुभव आवश्यक नहीं। हर अभ्यास शुरुआत से सिखाया जाता है, सुरक्षित, संरचित क्रम में।",
          },
          {
            question: "क्या ऊर्जा कार्य — कुंडलिनी, समाधि — वाकई सुरक्षित है?",
            answer: "हां। हर तकनीक चरण-दर-चरण सिखाई जाती है, सीधी व्यक्तिगत निगरानी में, एक ऐसे क्रम के साथ जो वाकई शुरुआती लोगों के लिए सुरक्षित बनाया गया है।",
          },
          {
            question: "यह आपके 11-दिवसीय ऑनलाइन रिट्रीट से कैसे अलग है?",
            answer: "ऑनलाइन रिट्रीट एक लाइव, निर्देशित यात्रा है जिसे आप घर से जुड़ते हैं। रेजिडेंशियल रिट्रीट में आपको शारीरिक रूप से यात्रा करनी और वहां ठहरना होता है — पूर्ण डिस्कनेक्ट, सीधा व्यक्तिगत ऊर्जा संचरण, और एक छोटा व्यक्तिगत समूह जो ऑनलाइन फॉर्मैट दोहरा नहीं सकता।",
          },
          {
            question: "कीमत में क्या शामिल है?",
            answer: "दोनों रूम विकल्प — ₹35,000 शेयरिंग, ₹45,000 प्राइवेट — में पूरा रेजिडेंशियल रिट्रीट, सभी सेशन, शुद्ध सात्विक भोजन, और वेन्यू पर आपका ठहरना शामिल है।",
          },
          {
            question: "मुझे क्या साथ लाना चाहिए?",
            answer: "आरामदायक कपड़े, एक डायरी, और एक खुला मन। पूरी ज़रूरी सामान की सूची आपकी सीट की पुष्टि होने के बाद साझा की जाती है।",
          },
          {
            question: "क्या भोजन में आहार संबंधी ज़रूरतों का ध्यान रखा जाता है?",
            answer: "हां — शुद्ध सात्विक शाकाहारी भोजन मानक है, जैन, ग्लूटेन-फ्री, और एलर्जी-फ्रेंडली विकल्प अनुरोध पर उपलब्ध हैं।",
          },
        ],
        ctaLabel: "WhatsApp पर पूछें",
      },
      finalCta: {
        eyebrow: "चार तारीखें। हर एक में सीमित सीटें।",
        title: "कमरा जानबूझकर छोटा है। आवेदन करने में देर न करें।",
        desc: "चारों 2026–2027 रेजिडेंशियल रिट्रीट्स में सीटों की एक सख्त सीमा है, क्योंकि पूरी विधि इस पर निर्भर करती है कि डॉ. कपिल वाकई कमरे में मौजूद हर व्यक्ति को देख सकें। सीटें आवेदन आने के क्रम में पुष्टि की जाती हैं।",
        cta: "अपनी रेजिडेंशियल सीट सुरक्षित करें",
      },
      stickyBar: {
        text: "रेजिडेंशियल रिट्रीट्स — लोनावला और ऋषिकेश",
        price: "₹35,000 प्रति व्यक्ति से शुरू",
        cta: "अपनी सीट सुरक्षित करें",
      },
      whatsapp: {
        bubble: "रेजिडेंशियल रिट्रीट के बारे में सवाल हैं? डॉ. कपिल की टीम से तुरंत बात करें।",
        button: "WhatsApp पर चैट करें",
        ariaLabel: "रेजिडेंशियल रिट्रीट्स के बारे में डॉ. कपिल की टीम से WhatsApp पर चैट करें",
      },
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

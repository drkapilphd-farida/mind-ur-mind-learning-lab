import type { JourneyReadingSetDef } from './types'

export const SOCIAL_MEDIA: readonly JourneyReadingSetDef[] = [
  {
    id: 'social-attention-economy',
    category: 'social-media',
    lengthTier: 'short',
    text: 'Every time you open a social media app, you are entering what researchers call the "attention economy" — a system where companies compete for the scarcest resource of all: your focus. Features like infinite scroll, autoplay videos, and notification badges are not accidents; they are deliberately designed based on psychology research to keep you engaged for just a little longer. Understanding this design does not mean you have to quit these apps, but it does mean you can use them more intentionally, on your own terms, instead of theirs.',
    comprehensionQuestions: [
      { question: 'What do companies compete for in the "attention economy"?', options: ['Your money directly', 'Your focus and time', 'Your location data only', 'Your friends list'], correctAnswer: 'Your focus and time' },
      { question: 'What is infinite scroll an example of?', options: ['An accident in app design', 'A deliberate engagement feature', 'A battery-saving feature', 'A privacy setting'], correctAnswer: 'A deliberate engagement feature' },
    ],
    retentionQuestions: [
      { question: 'What does understanding this design allow you to do?', options: ['Nothing useful', 'Use apps more intentionally', 'Delete all apps immediately', 'Ignore notifications forever'], correctAnswer: 'Use apps more intentionally' },
      { question: 'What field of research shapes these app features?', options: ['Psychology', 'Astronomy', 'Chemistry', 'Geology'], correctAnswer: 'Psychology' },
    ],
  },
  {
    id: 'social-viral-content',
    category: 'social-media',
    lengthTier: 'short',
    text: 'Content researchers have found that posts triggering strong emotion — whether joy, outrage, or surprise — spread far faster online than neutral information, regardless of whether that information is accurate. This is partly because sharing an emotionally charged post feels like a form of self-expression, signaling to others what we care about. It is also why misinformation often travels faster than corrections: a shocking false claim usually feels more shareable in the moment than a calm, detailed fact-check published hours or days later.',
    comprehensionQuestions: [
      { question: 'What kind of posts spread fastest online?', options: ['Neutral, factual posts', 'Posts triggering strong emotion', 'Long, detailed posts', 'Posts with no images'], correctAnswer: 'Posts triggering strong emotion' },
      { question: 'Why does sharing emotional content feel appealing?', options: ['It feels like self-expression', 'It earns direct payment', 'It is required by the app', 'It has no real reason'], correctAnswer: 'It feels like self-expression' },
    ],
    retentionQuestions: [
      { question: 'Why does misinformation often spread faster than corrections?', options: ['Corrections are usually banned', 'Shocking claims feel more shareable in the moment', 'Corrections are always false', 'Misinformation is illegal'], correctAnswer: 'Shocking claims feel more shareable in the moment' },
      { question: 'Does accuracy determine how fast something spreads, per the passage?', options: ['Yes, only accurate posts spread', 'No, emotional impact matters more', 'Yes, but only for news', 'No, spread is completely random'], correctAnswer: 'No, emotional impact matters more' },
    ],
  },
  {
    id: 'social-digital-detox',
    category: 'social-media',
    lengthTier: 'medium',
    text: 'A "digital detox" refers to a deliberate period of time spent away from screens, especially social media, to reset habits and reduce stress. Studies on the practice show mixed but interesting results: many people report improved mood and better sleep after just a few days without their phone, while others feel a temporary spike in anxiety, sometimes called "phantom vibration syndrome," where they repeatedly reach for a phone that isn’t buzzing at all. Experts increasingly suggest that a full detox is less important than building small, sustainable habits, such as keeping phones out of the bedroom at night or turning off non-essential notifications, since these smaller changes are far easier to maintain long-term than an all-or-nothing break.',
    comprehensionQuestions: [
      { question: 'What is a digital detox?', options: ['Buying a new phone', 'A deliberate period away from screens', 'Deleting your social media account permanently', 'Increasing screen time'], correctAnswer: 'A deliberate period away from screens' },
      { question: 'What is "phantom vibration syndrome"?', options: ['A phone hardware defect', 'Reaching for a phone that isn’t buzzing', 'A type of internet virus', 'A social media algorithm'], correctAnswer: 'Reaching for a phone that isn’t buzzing' },
    ],
    retentionQuestions: [
      { question: 'What do experts increasingly recommend instead of a full detox?', options: ['Buying a second phone', 'Small, sustainable habit changes', 'Working longer hours', 'Ignoring the issue entirely'], correctAnswer: 'Small, sustainable habit changes' },
      { question: 'What example of a small habit change is given?', options: ['Keeping phones out of the bedroom at night', 'Charging the phone twice a day', 'Watching more videos before bed', 'Turning on all notifications'], correctAnswer: 'Keeping phones out of the bedroom at night' },
    ],
  },
  {
    id: 'social-algorithm-bubble',
    category: 'social-media',
    lengthTier: 'long',
    text: 'When you open a social media feed, what you see is not a neutral timeline of everything happening — it is a ranking produced by an algorithm trained to predict which posts will keep you watching, tapping, and scrolling the longest. Over time, this creates what researchers call a "filter bubble": because the algorithm keeps showing you more of whatever you already engaged with, your feed gradually narrows toward content that confirms opinions you already hold, while opposing viewpoints appear less and less often. This isn’t necessarily a deliberate attempt to manipulate anyone’s beliefs; it is simply the natural result of optimizing purely for engagement rather than for balance or accuracy. The effect can be subtle enough that most users never notice their feed has changed at all, since the shift happens gradually, one recommendation at a time, rather than through any single dramatic moment. Some platforms have experimented with deliberately injecting a small percentage of opposing viewpoints into feeds to counteract this effect, though results have been mixed — occasionally, seeing an opposing view without context can make people defend their original position even more strongly, a phenomenon researchers call the "backfire effect." Being aware that a feed is curated, rather than neutral, is often the simplest first step toward using these platforms more critically.',
    comprehensionQuestions: [
      { question: 'What determines what you see in a social media feed?', options: ['A strict chronological order', 'An algorithm predicting engagement', 'A random shuffle', 'A panel of human editors'], correctAnswer: 'An algorithm predicting engagement' },
      { question: 'What is a "filter bubble"?', options: ['A physical device', 'A feed narrowing toward content that confirms existing views', 'A type of internet virus', 'A privacy setting'], correctAnswer: 'A feed narrowing toward content that confirms existing views' },
    ],
    retentionQuestions: [
      { question: 'What is the "backfire effect" mentioned in the passage?', options: ['Feeds loading slower over time', 'Opposing views making people defend their position more strongly', 'Algorithms crashing', 'Users leaving the platform'], correctAnswer: 'Opposing views making people defend their position more strongly' },
      { question: 'What is suggested as a simple first step toward using platforms more critically?', options: ['Deleting the app entirely', 'Recognizing the feed is curated, not neutral', 'Posting more content', 'Turning off the internet'], correctAnswer: 'Recognizing the feed is curated, not neutral' },
    ],
  },
]

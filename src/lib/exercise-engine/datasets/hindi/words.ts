// Hindi Words dataset — architecture demonstration for multilingual support.
// 30 common Hindi words in Latin transliteration with English translations.
// Locale: 'hi' — getItemsByLanguage('hi') returns these items.
//
// In production, this dataset would contain 500+ words across all tiers,
// sourced from curated educational content or admin upload.
// The structure here is production-ready; only the volume is demo-scale.

import { createDataset } from '../../contentEngine'

export const HINDI_WORDS_DATASET = createDataset({
  id: 'hi-words-foundation',
  locale: 'hi',
  contentType: 'word',
  rawItems: [
    // ── Beginner (10 items: common everyday words) ──
    { content: 'paani',  difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'water',  phonetic: 'pā-nī',    script: 'पानी' } },
    { content: 'ghar',   difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'home',   phonetic: 'ghar',      script: 'घर'   } },
    { content: 'roti',   difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'bread',  phonetic: 'ro-ṭī',    script: 'रोटी' } },
    { content: 'chai',   difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'tea',    phonetic: 'chaī',      script: 'चाय' } },
    { content: 'kitab',  difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'book',   phonetic: 'ki-tāb',   script: 'किताब'} },
    { content: 'dost',   difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'friend', phonetic: 'dost',      script: 'दोस्त'} },
    { content: 'naam',   difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'name',   phonetic: 'nām',       script: 'नाम' } },
    { content: 'aankh',  difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'eye',    phonetic: 'ān-kh',     script: 'आँख' } },
    { content: 'haath',  difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'hand',   phonetic: 'hāth',      script: 'हाथ' } },
    { content: 'din',    difficulty: 'beginner', categories: ['reading', 'memory'], metadata: { translation: 'day',    phonetic: 'din',       script: 'दिन' } },

    // ── Easy (10 items: common adjectives and action words) ──
    { content: 'sundar', difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'beautiful', phonetic: 'sun-dar', script: 'सुन्दर' } },
    { content: 'achha',  difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'good',      phonetic: 'ach-chā', script: 'अच्छा' } },
    { content: 'bada',   difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'big',       phonetic: 'ba-ḍā',  script: 'बड़ा'  } },
    { content: 'naya',   difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'new',       phonetic: 'na-yā',  script: 'नया'   } },
    { content: 'kaam',   difficulty: 'easy', categories: ['reading', 'focus'],  metadata: { translation: 'work',      phonetic: 'kām',    script: 'काम'   } },
    { content: 'samay',  difficulty: 'easy', categories: ['reading', 'focus'],  metadata: { translation: 'time',      phonetic: 'sa-may', script: 'समय'   } },
    { content: 'raat',   difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'night',     phonetic: 'rāt',    script: 'रात'   } },
    { content: 'safar',  difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'journey',   phonetic: 'sa-far', script: 'सफर'   } },
    { content: 'mitra',  difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'friend',    phonetic: 'mi-tra', script: 'मित्र' } },
    { content: 'vidya',  difficulty: 'easy', categories: ['reading', 'memory'], metadata: { translation: 'knowledge', phonetic: 'vid-yā', script: 'विद्या'} },

    // ── Medium (7 items: compound or educational words) ──
    { content: 'shiksha', difficulty: 'medium', categories: ['reading', 'memory'], metadata: { translation: 'education',  script: 'शिक्षा'  } },
    { content: 'prakash', difficulty: 'medium', categories: ['reading', 'memory'], metadata: { translation: 'light',       script: 'प्रकाश' } },
    { content: 'gyaan',   difficulty: 'medium', categories: ['reading', 'memory'], metadata: { translation: 'wisdom',      script: 'ज्ञान'  } },
    { content: 'swaasth', difficulty: 'medium', categories: ['memory'],            metadata: { translation: 'health',      script: 'स्वास्थ्य'} },
    { content: 'dhyan',   difficulty: 'medium', categories: ['focus', 'memory'],  metadata: { translation: 'attention',   script: 'ध्यान'  } },
    { content: 'smriti',  difficulty: 'medium', categories: ['memory'],            metadata: { translation: 'memory',      script: 'स्मृति' } },
    { content: 'shakti',  difficulty: 'medium', categories: ['focus', 'memory'],  metadata: { translation: 'strength',    script: 'शक्ति'  } },

    // ── Advanced (3 items: philosophical/academic vocabulary) ──
    { content: 'vivek',       difficulty: 'advanced', categories: ['memory'], metadata: { translation: 'wisdom/conscience', script: 'विवेक'    } },
    { content: 'buddhi',      difficulty: 'advanced', categories: ['memory'], metadata: { translation: 'intellect',          script: 'बुद्धि'   } },
    { content: 'chetna',      difficulty: 'advanced', categories: ['memory'], metadata: { translation: 'consciousness',      script: 'चेतना'    } },
  ],
})

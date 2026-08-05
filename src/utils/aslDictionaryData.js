/**
 * Comprehensive 44-Class Sign Language Reference Dictionary
 * Matches gesture_db.db from Sign-Language dataset
 */

export const GESTURE_DICTIONARY = [
  // Alphabets A-Z (ID 0 to 25)
  ...Array.from({ length: 26 }, (_, i) => {
    const letter = String.fromCharCode(65 + i);
    return {
      id: `ALPHABET_${letter}`,
      class_id: i,
      name: `Letter ${letter}`,
      category: 'Alphabet',
      description: `ASL Alphabet sign posture for letter '${letter}'.`,
      handShape: letter,
      tips: `Form gesture posture for ASL letter ${letter}.`,
      confidenceRequirement: 'High'
    };
  }),

  // Numbers 0-9 (ID 26 to 35)
  ...Array.from({ length: 10 }, (_, i) => {
    return {
      id: `NUM_${i}`,
      class_id: 26 + i,
      name: `Number ${i}`,
      category: 'Number',
      description: `Sign gesture for digit ${i}.`,
      handShape: `${i}️⃣`,
      tips: `Extend digits to represent number ${i}.`,
      confidenceRequirement: 'High'
    };
  }),

  // Key Phrases (ID 36 to 43)
  {
    id: 'PHRASE_BEST_OF_LUCK',
    class_id: 36,
    name: 'Best of Luck',
    category: 'Phrase',
    description: 'Fingers crossed / thumbs up gesture indicating good luck wish.',
    handShape: '🤞',
    tips: 'Cross index and middle finger with palm facing front.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_YOU',
    class_id: 37,
    name: 'You',
    category: 'Phrase',
    description: 'Index finger pointing forward towards recipient.',
    handShape: '👉',
    tips: 'Point index finger clearly forward.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_I_ME',
    class_id: 38,
    name: 'I / Me',
    category: 'Phrase',
    description: 'Index finger or fist pointing towards chest / self.',
    handShape: '👤',
    tips: 'Point finger towards chest area.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_LIKE',
    class_id: 39,
    name: 'Like',
    category: 'Phrase',
    description: 'Thumb and middle finger touching near chest and pulling outwards.',
    handShape: '👍',
    tips: 'Pinch thumb & middle finger then extend out.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_REMEMBER',
    class_id: 40,
    name: 'Remember',
    class_id: 40,
    name: 'Remember',
    category: 'Phrase',
    description: 'Thumb touching forehead then moving down to meet non-dominant thumb.',
    handShape: '🧠',
    tips: 'Touch temple area then bring thumb down.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_LOVE',
    class_id: 41,
    name: 'Love',
    category: 'Phrase',
    description: 'Both arms crossed over chest forming an X in front of heart.',
    handShape: '❤️',
    tips: 'Cross wrists or hands across chest.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_I_LOVE_YOU',
    class_id: 43,
    name: 'I Love You',
    category: 'Phrase',
    description: 'Thumb, index, and pinky extended simultaneously.',
    handShape: '🤟',
    tips: 'Combine letters I, L, and Y.',
    confidenceRequirement: 'High'
  }
];

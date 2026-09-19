/**
 * Comprehensive 50+ Class Sign Language Reference Dictionary
 * Synthesized from RP datasets (ASL 44-Class, Kaggle Alphabet Controls, and Action Gestures)
 */

export const GESTURE_DICTIONARY = [
  // Control Gestures (Space, Delete)
  {
    id: 'CONTROL_SPACE',
    class_id: 100,
    name: 'Space Bar',
    category: 'Control',
    description: 'Flat open palm held horizontally to insert a space between words.',
    handShape: '⎵',
    tips: 'Hold flat hand horizontally facing camera to trigger word space.',
    confidenceRequirement: 'High'
  },
  {
    id: 'CONTROL_DELETE',
    class_id: 101,
    name: 'Delete / Backspace',
    category: 'Control',
    description: 'Pinch gesture with thumb and index tip touching to delete last character.',
    handShape: '⌫',
    tips: 'Pinch thumb and index finger together to delete previous character.',
    confidenceRequirement: 'High'
  },

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

  // Key Phrases & Action Gestures (ID 36 to 45)
  {
    id: 'PHRASE_BEST_OF_LUCK',
    class_id: 36,
    name: 'Best of Luck',
    category: 'Phrase',
    description: 'Fingers crossed / peace gesture indicating good luck wish.',
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
    description: 'Index finger or thumb pointing towards chest / self.',
    handShape: '👤',
    tips: 'Point finger towards chest area.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_LIKE',
    class_id: 39,
    name: 'Like / Thumbs Up',
    category: 'Phrase',
    description: 'Fist with thumb pointing straight up.',
    handShape: '👍',
    tips: 'Raise thumb straight up.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_DISLIKE',
    class_id: 42,
    name: 'Dislike / Thumbs Down',
    category: 'Phrase',
    description: 'Fist with thumb pointing straight down.',
    handShape: '👎',
    tips: 'Point thumb straight down.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_REMEMBER',
    class_id: 40,
    name: 'Remember',
    category: 'Phrase',
    description: 'Thumb touching temple area then moving down.',
    handShape: '🧠',
    tips: 'Touch temple area then bring thumb down.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_LOVE',
    class_id: 41,
    name: 'Love',
    category: 'Phrase',
    description: 'Both arms or hands crossed over chest forming an X in front of heart.',
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
  },
  {
    id: 'PHRASE_HELP',
    class_id: 44,
    name: 'Help',
    category: 'Phrase',
    description: 'Closed fist with thumb up placed over non-dominant flat palm.',
    handShape: '🆘',
    tips: 'Place thumbs up fist on palm and lift upward.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_WATER',
    class_id: 45,
    name: 'Water',
    category: 'Phrase',
    description: 'W sign (3 fingers extended) tapping chin twice.',
    handShape: '💧',
    tips: 'Form W shape and tap index finger against chin.',
    confidenceRequirement: 'High'
  },
  {
    id: 'PHRASE_THANK_YOU',
    class_id: 46,
    name: 'Thank You',
    category: 'Phrase',
    description: 'Flat hand fingertips touching lips then extending forward toward person.',
    handShape: '🙏',
    tips: 'Touch fingers to chin/lips and move hand forward.',
    confidenceRequirement: 'High'
  }
];

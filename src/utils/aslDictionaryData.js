/**
 * Comprehensive Sign Language Reference Dictionary
 */

export const GESTURE_DICTIONARY = [
  // Common Signs / Phrases
  {
    id: "HELLO",
    name: "Hello / Open Hand",
    category: "Phrase",
    description: "Open palm facing forward with all 5 fingers fully extended and spread slightly.",
    handShape: "🖐️",
    tips: "Keep palm flat towards camera with fingers erect.",
    confidenceRequirement: "High"
  },
  {
    id: "PEACE",
    name: "Peace / Victory (V)",
    category: "Phrase",
    description: "Index and middle fingers extended upward forming a V, while thumb holds ring and pinky fingers down.",
    handShape: "✌️",
    tips: "Keep index and middle finger separated in V shape.",
    confidenceRequirement: "High"
  },
  {
    id: "THUMBS_UP",
    name: "Thumbs Up (Like / Good / Yes)",
    category: "Phrase",
    description: "Fist closed with thumb pointing straight up into the air.",
    handShape: "👍",
    tips: "Extend thumb clearly upward above closed fingers.",
    confidenceRequirement: "High"
  },
  {
    id: "THUMBS_DOWN",
    name: "Thumbs Down (Bad / No)",
    category: "Phrase",
    description: "Fist closed with thumb pointing straight down.",
    handShape: "👎",
    tips: "Point thumb downwards clearly below wrist line.",
    confidenceRequirement: "High"
  },
  {
    id: "I_LOVE_YOU",
    name: "I Love You (ILY)",
    category: "Phrase",
    description: "Thumb, index finger, and pinky finger extended simultaneously. Middle and ring fingers folded into palm.",
    handShape: "🤟",
    tips: "Combines letters I, L, and Y into one universal sign.",
    confidenceRequirement: "High"
  },
  {
    id: "ROCK_ON",
    name: "Rock On / Sign of Horns",
    category: "Phrase",
    description: "Index and pinky fingers extended upward. Thumb holding middle and ring fingers flat.",
    handShape: "🤘",
    tips: "Keep thumb pressed against middle & ring knuckles.",
    confidenceRequirement: "Medium"
  },
  {
    id: "OK_SIGN",
    name: "OK Sign / Letter F",
    category: "Phrase",
    description: "Thumb tip and index finger tip touching to form a circle. Middle, ring, and pinky fingers extended straight.",
    handShape: "👌",
    tips: "Form a circle with thumb & index while keeping other 3 fingers raised.",
    confidenceRequirement: "High"
  },
  {
    id: "POINTING",
    name: "Pointing Up / One / Letter D",
    category: "Phrase",
    description: "Index finger extended straight up. Thumb folded over middle, ring, and pinky fingers.",
    handShape: "☝️",
    tips: "Keep index finger pointing straight up towards ceiling.",
    confidenceRequirement: "High"
  },
  {
    id: "FIST",
    name: "Fist / Power / Letter S",
    category: "Phrase",
    description: "All 5 fingers tightly curled into a solid fist with thumb tucked over index/middle fingers.",
    handShape: "✊",
    tips: "Make a tight fist facing camera.",
    confidenceRequirement: "High"
  },
  {
    id: "CALL_ME",
    name: "Call Me / Phone / Letter Y",
    category: "Phrase",
    description: "Thumb and pinky fingers extended out sideways. Index, middle, and ring fingers folded down.",
    handShape: "🤙",
    tips: "Thumb points right/left while pinky points out.",
    confidenceRequirement: "High"
  },
  {
    id: "PINCH",
    name: "Pinch / Little Bit",
    category: "Phrase",
    description: "Thumb tip and index tip close together with small space between them.",
    handShape: "🤏",
    tips: "Bring thumb and index tips within 1-2 cm of each other.",
    confidenceRequirement: "Medium"
  },

  // ASL Numbers
  {
    id: "NUM_0",
    name: "Number 0 / Letter O",
    category: "Number",
    description: "All finger tips curved to touch thumb tip, forming an 'O' shape.",
    handShape: "0️⃣",
    tips: "Form a rounded O ring with fingers and thumb.",
    confidenceRequirement: "High"
  },
  {
    id: "NUM_1",
    name: "Number 1",
    category: "Number",
    description: "Index finger extended straight up, all other fingers closed into palm.",
    handShape: "1️⃣",
    tips: "Single index finger erect.",
    confidenceRequirement: "High"
  },
  {
    id: "NUM_2",
    name: "Number 2",
    category: "Number",
    description: "Index and middle fingers extended up, remaining fingers folded.",
    handShape: "2️⃣",
    tips: "Similar to V sign.",
    confidenceRequirement: "High"
  },
  {
    id: "NUM_3",
    name: "Number 3",
    category: "Number",
    description: "Thumb, index, and middle fingers extended out.",
    handShape: "3️⃣",
    tips: "Extend thumb along with index and middle fingers.",
    confidenceRequirement: "High"
  },
  {
    id: "NUM_4",
    name: "Number 4",
    category: "Number",
    description: "4 fingers (Index, Middle, Ring, Pinky) extended straight up; thumb folded inside palm.",
    handShape: "4️⃣",
    tips: "Tuck thumb into palm, raise 4 fingers.",
    confidenceRequirement: "High"
  },
  {
    id: "NUM_5",
    name: "Number 5",
    category: "Number",
    description: "All 5 fingers extended and spread wide.",
    handShape: "5️⃣",
    tips: "Open palm with all 5 digits extended.",
    confidenceRequirement: "High"
  },

  // ASL Alphabet Key Highlights
  {
    id: "ALPHABET_A",
    name: "Letter A",
    category: "Alphabet",
    description: "Fist closed with thumb upright resting flat against the side of index finger.",
    handShape: "🅰️",
    tips: "Fist closed, thumb pointing up along side of index.",
    confidenceRequirement: "High"
  },
  {
    id: "ALPHABET_B",
    name: "Letter B",
    category: "Alphabet",
    description: "4 fingers extended straight up together; thumb tucked across palm.",
    handShape: "🅱️",
    tips: "Fingers held together straight up.",
    confidenceRequirement: "High"
  },
  {
    id: "ALPHABET_C",
    name: "Letter C",
    category: "Alphabet",
    description: "Hand curved into a clear 'C' shape facing sideways.",
    handShape: "©️",
    tips: "Form arc with palm and thumb.",
    confidenceRequirement: "High"
  },
  {
    id: "ALPHABET_L",
    name: "Letter L",
    category: "Alphabet",
    description: "Thumb and index finger extended at right angles, forming an 'L'. Other fingers curled.",
    handShape: "🇱",
    tips: "Form clean L shape with index & thumb.",
    confidenceRequirement: "High"
  },
  {
    id: "ALPHABET_W",
    name: "Letter W",
    category: "Alphabet",
    description: "Index, middle, and ring fingers extended upward in W shape; thumb holds pinky down.",
    handShape: "🇼",
    tips: "Raise 3 middle fingers erect.",
    confidenceRequirement: "High"
  }
];

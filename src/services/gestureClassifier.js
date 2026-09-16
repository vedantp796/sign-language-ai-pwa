/**
 * AI Real-Time Hand Landmark & Multi-Mode Classifier
 * Classifies 21 MediaPipe 3D hand landmarks with mode-scoped geometric rules:
 * - Alphabets Mode (A-Z)
 * - Numbers Mode (0-9)
 * - Phrases Mode (Common Signs)
 * - All Gestures Mode (Full 44-Class Evaluation)
 */

import {
  getDistance,
  getAngle,
  normalizeLandmarks,
  isFingerExtended,
  isThumbExtended
} from '../utils/mathHelpers';

// 44 Gesture Class Labels mapping matching gesture_db.db
export const GESTURE_MAP_44 = {
  0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
  10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
  20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z',
  26: '0', 27: '1', 28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7', 34: '8', 35: '9',
  36: 'Best of Luck', 37: 'You', 38: 'I/Me', 39: 'Like', 40: 'Remember', 41: 'Love', 42: 'Dislike', 43: 'I love you'
};

/**
 * Main Classifier Function
 * @param {Array} rawLandmarks 21 MediaPipe landmark points {x, y, z}
 * @param {string} handedness 'Right' or 'Left'
 * @param {string} recognitionMode 'alphabets' | 'numbers' | 'phrases' | 'all'
 */
export function classifyGesture(rawLandmarks, handedness = 'Right', recognitionMode = 'alphabets') {
  if (!rawLandmarks || rawLandmarks.length < 21) {
    return {
      class_id: -1,
      name: 'Searching...',
      text: '',
      confidence: 0,
      category: 'Standby',
      symbol: '🖐️',
      description: 'Position hand inside green frame'
    };
  }

  const p = rawLandmarks;
  const norm = normalizeLandmarks(p);

  // 1. Calculate Extension State of Each Digit
  const thumbExt = isThumbExtended(p, handedness);
  const indexExt = isFingerExtended(p, 5, 6, 7, 8);
  const middleExt = isFingerExtended(p, 9, 10, 11, 12);
  const ringExt = isFingerExtended(p, 13, 14, 15, 16);
  const pinkyExt = isFingerExtended(p, 17, 18, 19, 20);

  // Count total extended fingers (excluding thumb)
  const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // Normalized Distances (relative to hand scale wrist p[0] to middle MCP p[9])
  const distThumbIndex = getDistance(norm[4], norm[8]);
  const distThumbMiddle = getDistance(norm[4], norm[12]);
  const distThumbRing = getDistance(norm[4], norm[16]);
  const distThumbPinky = getDistance(norm[4], norm[20]);
  const distIndexMiddle = getDistance(norm[8], norm[12]);

  // Height / Orientation Vector checks
  const wrist = norm[0];
  const thumbTip = norm[4];

  const thumbPointingUp = thumbTip.y < wrist.y - 0.25;
  const thumbPointingDown = thumbTip.y > wrist.y + 0.25;

  // Joint Angles
  const indexAngle = getAngle(p[5], p[6], p[8]);

  // -------------------------------------------------------------
  // MODE 1: NUMBERS MODE (0 to 9)
  // -------------------------------------------------------------
  if (recognitionMode === 'numbers') {
    return classifyNumbers({
      p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
      distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle
    });
  }

  // -------------------------------------------------------------
  // MODE 2: ALPHABETS MODE (A to Z)
  // -------------------------------------------------------------
  if (recognitionMode === 'alphabets') {
    return classifyAlphabets({
      p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
      distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle,
      indexAngle
    });
  }

  // -------------------------------------------------------------
  // MODE 3: PHRASES MODE (Common Signs)
  // -------------------------------------------------------------
  if (recognitionMode === 'phrases') {
    return classifyPhrases({
      p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
      distThumbIndex, thumbPointingUp, thumbPointingDown, distIndexMiddle
    });
  }

  // -------------------------------------------------------------
  // MODE 4: ALL GESTURES MODE (Automatic 44-Class Evaluation)
  // -------------------------------------------------------------
  // First evaluate High-Confidence Phrases
  const phraseRes = classifyPhrases({
    p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
    distThumbIndex, thumbPointingUp, thumbPointingDown, distIndexMiddle
  });
  if (phraseRes.confidence >= 0.90) return phraseRes;

  // Next evaluate Numbers
  const numRes = classifyNumbers({
    p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
    distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle
  });
  if (numRes.confidence >= 0.88) return numRes;

  // Fallback to Alphabets
  return classifyAlphabets({
    p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
    distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle,
    indexAngle
  });
}

// =========================================================================
// NUMBERS CLASSIFIER SUBROUTINE (ASL Digits 0 - 9)
// =========================================================================
function classifyNumbers({
  p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
  distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle
}) {
  // Digit 0: O-Shape (All fingertips touching thumb tip)
  if (distThumbIndex < 0.35 && distThumbMiddle < 0.38 && !indexExt && !middleExt) {
    return {
      class_id: 26,
      name: 'Number 0',
      text: '0',
      category: 'Number',
      confidence: 0.96,
      symbol: '0️⃣',
      description: 'O-shape with thumb and fingertips touching'
    };
  }

  // ASL Digit 6: Thumb touches Pinky tip, Index, Middle, Ring extended
  if (distThumbPinky < 0.32 && indexExt && middleExt && ringExt) {
    return {
      class_id: 32,
      name: 'Number 6',
      text: '6',
      category: 'Number',
      confidence: 0.95,
      symbol: '6️⃣',
      description: 'Thumb tip touching pinky tip with 3 fingers raised'
    };
  }

  // ASL Digit 7: Thumb touches Ring tip, Index, Middle, Pinky extended
  if (distThumbRing < 0.32 && indexExt && middleExt && pinkyExt) {
    return {
      class_id: 33,
      name: 'Number 7',
      text: '7',
      category: 'Number',
      confidence: 0.95,
      symbol: '7️⃣',
      description: 'Thumb tip touching ring finger tip'
    };
  }

  // ASL Digit 8: Thumb touches Middle tip, Index, Ring, Pinky extended
  if (distThumbMiddle < 0.32 && indexExt && ringExt && pinkyExt) {
    return {
      class_id: 34,
      name: 'Number 8',
      text: '8',
      category: 'Number',
      confidence: 0.95,
      symbol: '8️⃣',
      description: 'Thumb tip touching middle finger tip'
    };
  }

  // ASL Digit 9: Thumb touches Index tip, Middle, Ring, Pinky extended
  if (distThumbIndex < 0.32 && middleExt && ringExt && pinkyExt) {
    return {
      class_id: 35,
      name: 'Number 9',
      text: '9',
      category: 'Number',
      confidence: 0.95,
      symbol: '9️⃣',
      description: 'Thumb tip touching index finger tip (OK shape)'
    };
  }

  // Digit 5: All 5 fingers extended open wide
  if (extendedCount === 4 && thumbExt) {
    return {
      class_id: 31,
      name: 'Number 5',
      text: '5',
      category: 'Number',
      confidence: 0.97,
      symbol: '5️⃣',
      description: 'Open palm with all 5 digits extended'
    };
  }

  // Digit 4: 4 fingers extended up, thumb tucked across palm
  if (extendedCount === 4 && !thumbExt) {
    return {
      class_id: 30,
      name: 'Number 4',
      text: '4',
      category: 'Number',
      confidence: 0.96,
      symbol: '4️⃣',
      description: '4 fingers extended upright with thumb tucked'
    };
  }

  // ASL Digit 3: Thumb + Index + Middle extended (ASL 3)
  if (thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 29,
      name: 'Number 3',
      text: '3',
      category: 'Number',
      confidence: 0.96,
      symbol: '3️⃣',
      description: 'Thumb, index, and middle fingers extended'
    };
  }

  // Digit 2: Index & Middle fingers extended up (V-shape)
  if (!thumbExt && indexExt && middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 28,
      name: 'Number 2',
      text: '2',
      category: 'Number',
      confidence: 0.96,
      symbol: '2️⃣',
      description: 'Index and middle fingers extended upright'
    };
  }

  // Digit 1: Index finger extended up only
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 27,
      name: 'Number 1',
      text: '1',
      category: 'Number',
      confidence: 0.96,
      symbol: '1️⃣',
      description: 'Single index finger extended upright'
    };
  }

  return {
    class_id: -1,
    name: 'Analyzing Number...',
    text: '',
    category: 'Number Mode',
    confidence: 0.70,
    symbol: '🔢',
    description: 'Form number sign clearly (0-9)'
  };
}

// =========================================================================
// ALPHABETS CLASSIFIER SUBROUTINE (ASL Letters A - Z)
// =========================================================================
function classifyAlphabets({
  p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
  distThumbIndex, distThumbMiddle, distThumbRing, distThumbPinky, distIndexMiddle,
  indexAngle
}) {
  // Letter Y: Thumb and Pinky extended out
  if (thumbExt && pinkyExt && !indexExt && !middleExt && !ringExt) {
    return {
      class_id: 24,
      name: 'Letter Y',
      text: 'Y',
      category: 'Alphabet',
      confidence: 0.97,
      symbol: '🅰️',
      description: 'Thumb and pinky extended out (Hang loose)'
    };
  }

  // Letter L: Thumb and Index extended in right angle L shape
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt && distThumbIndex > 0.45) {
    return {
      class_id: 11,
      name: 'Letter L',
      text: 'L',
      category: 'Alphabet',
      confidence: 0.97,
      symbol: '🇱',
      description: 'L shape formed by thumb and index finger'
    };
  }

  // Letter W: Index, Middle, and Ring extended apart
  if (indexExt && middleExt && ringExt && !pinkyExt && !thumbExt) {
    return {
      class_id: 22,
      name: 'Letter W',
      text: 'W',
      category: 'Alphabet',
      confidence: 0.95,
      symbol: '🇼',
      description: 'Index, middle, and ring fingers extended up'
    };
  }

  // Letter F: Thumb & Index tip circle, 3 fingers extended up
  if (distThumbIndex < 0.32 && middleExt && ringExt && pinkyExt) {
    return {
      class_id: 5,
      name: 'Letter F',
      text: 'F',
      category: 'Alphabet',
      confidence: 0.95,
      symbol: '🇫',
      description: 'Index and thumb form circle with 3 fingers raised'
    };
  }

  // Letter B: 4 fingers straight up together, thumb tucked in front
  if (extendedCount === 4 && distIndexMiddle < 0.25) {
    return {
      class_id: 1,
      name: 'Letter B',
      text: 'B',
      category: 'Alphabet',
      confidence: 0.95,
      symbol: '🇧',
      description: 'Flat open hand with fingers together & thumb tucked'
    };
  }

  // Letter V: Index & Middle extended apart in V shape
  if (indexExt && middleExt && !ringExt && !pinkyExt && distIndexMiddle > 0.22) {
    return {
      class_id: 21,
      name: 'Letter V',
      text: 'V',
      category: 'Alphabet',
      confidence: 0.95,
      symbol: '🇻',
      description: 'Index and middle fingers extended in V shape'
    };
  }

  // Letter U: Index & Middle extended together close
  if (indexExt && middleExt && !ringExt && !pinkyExt && distIndexMiddle <= 0.22) {
    return {
      class_id: 20,
      name: 'Letter U',
      text: 'U',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '🇺',
      description: 'Index and middle fingers extended together'
    };
  }

  // Letter D: Index pointing up, thumb tip touching middle tip
  if (indexExt && !middleExt && !ringExt && !pinkyExt && distThumbMiddle < 0.35) {
    return {
      class_id: 3,
      name: 'Letter D',
      text: 'D',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '🇩',
      description: 'Index extended up, thumb touching middle tip'
    };
  }

  // Letter I: Pinky finger extended straight up only
  if (pinkyExt && !indexExt && !middleExt && !ringExt && !thumbExt) {
    return {
      class_id: 8,
      name: 'Letter I',
      text: 'I',
      category: 'Alphabet',
      confidence: 0.96,
      symbol: '🇮',
      description: 'Pinky finger extended upright'
    };
  }

  // Letter C: Hand curved in a C arc
  if (!indexExt && !middleExt && distThumbMiddle > 0.35 && distThumbMiddle < 0.65) {
    return {
      class_id: 2,
      name: 'Letter C',
      text: 'C',
      category: 'Alphabet',
      confidence: 0.92,
      symbol: '🇨',
      description: 'Hand curved forming a C shape'
    };
  }

  // Letter O: All fingertips meeting thumb tip
  if (distThumbIndex < 0.30 && distThumbMiddle < 0.32 && !indexExt && !middleExt) {
    return {
      class_id: 14,
      name: 'Letter O',
      text: 'O',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🇴',
      description: 'Fingertips curving to touch thumb tip'
    };
  }

  // Letter A: Fist with thumb extended upright beside index finger
  if (extendedCount === 0 && thumbExt && norm[4].y < norm[5].y) {
    return {
      class_id: 0,
      name: 'Letter A',
      text: 'A',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '🅰️',
      description: 'Fist with thumb erect against index finger'
    };
  }

  // Letter S: Tight fist with thumb folded across fingers
  if (extendedCount === 0 && !thumbExt && norm[4].y >= norm[5].y) {
    return {
      class_id: 18,
      name: 'Letter S',
      text: 'S',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🇸',
      description: 'Fist with thumb folded across front of fingers'
    };
  }

  // Letter E: All fingers curled down tight, thumb tucked underneath
  if (extendedCount === 0 && norm[4].y > norm[6].y) {
    return {
      class_id: 4,
      name: 'Letter E',
      text: 'E',
      category: 'Alphabet',
      confidence: 0.91,
      symbol: '🇪',
      description: 'Fingers curled tight with thumb tucked under'
    };
  }

  // Letter X: Index finger hooked/curled
  if (indexAngle < 130 && !middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 23,
      name: 'Letter X',
      text: 'X',
      category: 'Alphabet',
      confidence: 0.90,
      symbol: '🇽',
      description: 'Hooked index finger'
    };
  }

  // Letter K: Index up, middle forward, thumb on middle joint
  if (indexExt && middleExt && !ringExt && !pinkyExt && norm[4].y < norm[9].y) {
    return {
      class_id: 10,
      name: 'Letter K',
      text: 'K',
      category: 'Alphabet',
      confidence: 0.92,
      symbol: '🇰',
      description: 'Index up, middle forward, thumb touching middle joint'
    };
  }

  // Letter R: Index & Middle crossed
  if (indexExt && middleExt && distIndexMiddle < 0.15) {
    return {
      class_id: 17,
      name: 'Letter R',
      text: 'R',
      category: 'Alphabet',
      confidence: 0.91,
      symbol: '🇷',
      description: 'Index and middle fingers crossed'
    };
  }

  // Letter G: Index & Thumb pointing horizontal
  if (indexExt && thumbExt && Math.abs(norm[8].x - norm[5].x) > 0.4) {
    return {
      class_id: 6,
      name: 'Letter G',
      text: 'G',
      category: 'Alphabet',
      confidence: 0.90,
      symbol: '🇬',
      description: 'Index and thumb pointing sideways'
    };
  }

  // Letter H: Index & Middle pointing horizontal together
  if (indexExt && middleExt && Math.abs(norm[8].x - norm[5].x) > 0.4) {
    return {
      class_id: 7,
      name: 'Letter H',
      text: 'H',
      category: 'Alphabet',
      confidence: 0.90,
      symbol: '🇭',
      description: 'Index and middle fingers pointing sideways'
    };
  }

  return {
    class_id: -1,
    name: 'Analyzing Alphabet...',
    text: '',
    category: 'Alphabet Mode',
    confidence: 0.70,
    symbol: '🔤',
    description: 'Form ASL alphabet gesture clearly (A-Z)'
  };
}

// =========================================================================
// PHRASES CLASSIFIER SUBROUTINE (Common Signs & Expressions)
// =========================================================================
function classifyPhrases({
  p, norm, thumbExt, indexExt, middleExt, ringExt, pinkyExt, extendedCount,
  distThumbIndex, thumbPointingUp, thumbPointingDown, distIndexMiddle
}) {
  // 1. I Love You (🤟)
  if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      class_id: 43,
      name: 'I Love You',
      text: 'I love you ',
      category: 'Phrase',
      confidence: 0.98,
      symbol: '🤟',
      description: 'Thumb, index, and pinky extended simultaneously'
    };
  }

  // 2. Thumbs Up / Like (👍)
  if (extendedCount === 0 && thumbPointingUp) {
    return {
      class_id: 39,
      name: 'Like / Thumbs Up',
      text: 'Like ',
      category: 'Phrase',
      confidence: 0.97,
      symbol: '👍',
      description: 'Thumb pointing straight up'
    };
  }

  // 3. Thumbs Down / Dislike (👎)
  if (extendedCount === 0 && thumbPointingDown) {
    return {
      class_id: 42,
      name: 'Dislike / Thumbs Down',
      text: 'Dislike ',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '👎',
      description: 'Thumb pointing straight down'
    };
  }

  // 4. Pointing / You (👉)
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 37,
      name: 'You / Pointing',
      text: 'You ',
      category: 'Phrase',
      confidence: 0.95,
      symbol: '👉',
      description: 'Index finger pointing forward'
    };
  }

  // 5. Best of Luck / Peace (🤞)
  if (indexExt && middleExt && !ringExt && !pinkyExt && distIndexMiddle > 0.22) {
    return {
      class_id: 36,
      name: 'Best of Luck / Peace',
      text: 'Peace ',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '🤞',
      description: 'Index and middle fingers in V / crossed'
    };
  }

  // 6. Call Me (🤙)
  if (thumbExt && pinkyExt && !indexExt && !middleExt && !ringExt) {
    return {
      class_id: 24,
      name: 'Call Me',
      text: 'Call me ',
      category: 'Phrase',
      confidence: 0.95,
      symbol: '🤙',
      description: 'Thumb and pinky extended wide'
    };
  }

  // 7. OK Sign (👌)
  if (distThumbIndex < 0.32 && middleExt && ringExt && pinkyExt) {
    return {
      class_id: 5,
      name: 'OK Sign',
      text: 'OK ',
      category: 'Phrase',
      confidence: 0.95,
      symbol: '👌',
      description: 'Thumb & index circle with 3 fingers raised'
    };
  }

  return {
    class_id: -1,
    name: 'Analyzing Phrase...',
    text: '',
    category: 'Phrase Mode',
    confidence: 0.70,
    symbol: '💬',
    description: 'Perform common sign gesture'
  };
}

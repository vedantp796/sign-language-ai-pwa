/**
 * AI Real-Time Hand Landmark & 44-Class Classifier
 * Classifies 21 MediaPipe 3D hand landmarks and supports Python 44-Class CNN model predictions.
 */

import {
  getDistance,
  getAngle,
  normalizeLandmarks,
  isFingerExtended
} from '../utils/mathHelpers';

// 44 Gesture Class Labels mapping matching gesture_db.db
export const GESTURE_MAP_44 = {
  0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
  10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
  20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z',
  26: '0', 27: '1', 28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7', 34: '8', 35: '9',
  36: 'Best of Luck', 37: 'You', 38: 'I/Me', 39: 'Like', 40: 'Remember', 41: 'Love', 42: 'Fuck', 43: 'I love you'
};

export function classifyGesture(rawLandmarks, handedness = 'Right') {
  if (!rawLandmarks || rawLandmarks.length < 21) {
    return { name: 'Searching...', confidence: 0, text: '', category: 'None', symbol: '❓' };
  }

  const p = rawLandmarks;
  const norm = normalizeLandmarks(p);

  // 1. Determine Extension State of Each Digit
  const thumbExt = isThumbExtended(p, handedness);
  const indexExt = isFingerExtended(p, 5, 6, 7, 8);
  const middleExt = isFingerExtended(p, 9, 10, 11, 12);
  const ringExt = isFingerExtended(p, 13, 14, 15, 16);
  const pinkyExt = isFingerExtended(p, 17, 18, 19, 20);

  // Key Distances
  const distThumbIndex = getDistance(p[4], p[8]);
  const distThumbMiddle = getDistance(p[4], p[12]);
  const distIndexMiddle = getDistance(p[8], p[12]);

  // Height / Vector checks
  const wrist = p[0];
  const thumbTip = p[4];
  const indexTip = p[8];

  const thumbPointingUp = thumbTip.y < wrist.y - 0.1 && thumbTip.y < p[2].y;
  const thumbPointingDown = thumbTip.y > wrist.y + 0.1 && thumbTip.y > p[2].y;

  // Count total extended fingers
  const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // --- GESTURE PATTERN RECOGNITION RULES ---

  // 1. I LOVE YOU (Class 43 / Phrase)
  if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      class_id: 43,
      name: 'I Love You',
      text: 'I love you ',
      category: 'Phrase',
      confidence: 0.98,
      symbol: '🤟',
      description: 'Thumb, index, and pinky extended'
    };
  }

  // 2. LIKE (Class 39 / Phrase)
  if (extendedCount === 0 && thumbPointingUp) {
    return {
      class_id: 39,
      name: 'Like',
      text: 'Like ',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '👍',
      description: 'Thumbs up gesture'
    };
  }

  // 3. YOU / POINTING (Class 37 / Phrase)
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 37,
      name: 'You / Letter D',
      text: 'You ',
      category: 'Phrase',
      confidence: 0.95,
      symbol: '👉',
      description: 'Pointing index finger'
    };
  }

  // 4. I/ME (Class 38 / Phrase)
  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt && thumbTip.x < wrist.x + 0.05) {
    return {
      class_id: 38,
      name: 'I/Me',
      text: 'I/Me ',
      category: 'Phrase',
      confidence: 0.94,
      symbol: '👤',
      description: 'Thumb pointing towards self'
    };
  }

  // 5. BEST OF LUCK / PEACE (Class 36)
  if (indexExt && middleExt && !ringExt && !pinkyExt && distIndexMiddle > 0.05) {
    return {
      class_id: 36,
      name: 'Best of Luck / Letter V',
      text: 'Best of Luck ',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '🤞',
      description: 'V sign / Best of Luck'
    };
  }

  // 6. HELLO / OPEN HAND (Class 31 / Number 5)
  if (extendedCount === 4 && thumbExt) {
    return {
      class_id: 31,
      name: 'Number 5 / Open Palm',
      text: '5',
      category: 'Number',
      confidence: 0.96,
      symbol: '🖐️',
      description: 'Open palm with 5 fingers'
    };
  }

  // 7. OK SIGN / LETTER F (Class 5 / Alphabet F)
  if (distThumbIndex < 0.05 && middleExt && ringExt && pinkyExt) {
    return {
      class_id: 5,
      name: 'Letter F / OK Sign',
      text: 'F',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '👌',
      description: 'Thumb & index tip circle with 3 fingers raised'
    };
  }

  // 8. LETTER L (Class 11 / Alphabet L)
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      class_id: 11,
      name: 'Letter L',
      text: 'L',
      category: 'Alphabet',
      confidence: 0.96,
      symbol: '🇱',
      description: 'L shape with thumb and index finger'
    };
  }

  // 9. LETTER W / NUMBER 3 (Class 22 / Alphabet W)
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return {
      class_id: 22,
      name: 'Letter W / Number 3',
      text: 'W',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🇼',
      description: 'Index, middle, and ring fingers extended'
    };
  }

  // 10. NUMBER 4 / LETTER B (Class 30 / Number 4)
  if (extendedCount === 4 && !thumbExt) {
    return {
      class_id: 30,
      name: 'Number 4 / Letter B',
      text: '4',
      category: 'Number',
      confidence: 0.94,
      symbol: '4️⃣',
      description: '4 fingers erect with thumb tucked'
    };
  }

  // 11. LETTER A / FIST (Class 0 / Alphabet A)
  if (extendedCount === 0 && thumbExt && thumbTip.y < indexTip.y) {
    return {
      class_id: 0,
      name: 'Letter A',
      text: 'A',
      category: 'Alphabet',
      confidence: 0.92,
      symbol: '🅰️',
      description: 'Fist with thumb erect beside index finger'
    };
  }

  // 12. LETTER C (Class 2 / Alphabet C)
  if (!indexExt && !middleExt && distThumbMiddle > 0.08 && distThumbMiddle < 0.18) {
    return {
      class_id: 2,
      name: 'Letter C',
      text: 'C',
      category: 'Alphabet',
      confidence: 0.89,
      symbol: '©️',
      description: 'Hand curved in C arc'
    };
  }

  // 13. LETTER Y / CALL ME (Class 24 / Alphabet Y)
  if (thumbExt && pinkyExt && !indexExt && !middleExt && !ringExt) {
    return {
      class_id: 24,
      name: 'Letter Y / Call Me',
      text: 'Y',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🤙',
      description: 'Thumb and pinky outstretched'
    };
  }

  // Default Fallback
  return {
    class_id: -1,
    name: 'Tracking Hand...',
    text: '',
    category: 'Analyzing',
    confidence: 0.70,
    symbol: '🔍',
    description: 'Position hand in front of camera'
  };
}

function isThumbExtended(landmarks, handLabel = 'Right') {
  const thumbMCP = landmarks[2];
  const thumbIP = landmarks[3];
  const thumbTip = landmarks[4];
  const indexMCP = landmarks[5];

  const angle = getAngle(thumbMCP, thumbIP, thumbTip);
  const distTipIndexMCP = getDistance(thumbTip, indexMCP);
  return angle > 130 && distTipIndexMCP > 0.18;
}

/**
 * AI Real-Time Hand Landmark Classifier
 * Classifies 21 MediaPipe 3D hand landmarks into ASL Alphabets, Numbers, and Common Gestures.
 */

import {
  getDistance,
  getAngle,
  normalizeLandmarks,
  isFingerExtended
} from '../utils/mathHelpers';

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
  const distMiddleRing = getDistance(p[12], p[16]);
  const distRingPinky = getDistance(p[16], p[20]);
  const distThumbPinky = getDistance(p[4], p[20]);

  // Height / Vector checks
  const wrist = p[0];
  const thumbTip = p[4];
  const indexTip = p[8];
  const middleTip = p[12];
  const ringTip = p[16];
  const pinkyTip = p[20];

  const thumbPointingUp = thumbTip.y < wrist.y - 0.1 && thumbTip.y < p[2].y;
  const thumbPointingDown = thumbTip.y > wrist.y + 0.1 && thumbTip.y > p[2].y;

  // Count total extended fingers
  const extendedCount = [indexExt, middleExt, ringExt, pinkyExt].filter(Boolean).length;

  // --- GESTURE PATTERN RECOGNITION RULES ---

  // 1. HELLO / OPEN PALM (All 5 extended)
  if (extendedCount === 4 && thumbExt) {
    return {
      name: 'Hello / Open Palm',
      text: 'Hello',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '🖐️',
      description: 'Open palm facing forward'
    };
  }

  // 2. I LOVE YOU (Thumb + Index + Pinky extended, Middle & Ring folded)
  if (thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      name: 'I Love You (ILY)',
      text: 'I Love You',
      category: 'Phrase',
      confidence: 0.97,
      symbol: '🤟',
      description: 'Thumb, index, and pinky extended'
    };
  }

  // 3. ROCK ON (Index + Pinky extended, Thumb holding middle & ring down)
  if (!thumbExt && indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      name: 'Rock On',
      text: 'Rock',
      category: 'Phrase',
      confidence: 0.93,
      symbol: '🤘',
      description: 'Index and pinky fingers raised'
    };
  }

  // 4. CALL ME (Thumb + Pinky extended, Index, Middle, Ring folded)
  if (thumbExt && !indexExt && !middleExt && !ringExt && pinkyExt) {
    return {
      name: 'Call Me',
      text: 'Call Me',
      category: 'Phrase',
      confidence: 0.95,
      symbol: '🤙',
      description: 'Thumb and pinky extended'
    };
  }

  // 5. PEACE / VICTORY / NUMBER 2 / LETTER V (Index + Middle extended, Ring & Pinky folded)
  if (indexExt && middleExt && !ringExt && !pinkyExt) {
    // If index & middle are separated wide -> Peace / V
    if (distIndexMiddle > 0.06) {
      return {
        name: 'Peace / Letter V',
        text: 'V',
        category: 'Alphabet',
        confidence: 0.95,
        symbol: '✌️',
        description: 'Index and middle fingers in V shape'
      };
    } else {
      // If together -> Number 2 or Letter U
      return {
        name: 'Number 2 / Letter U',
        text: 'U',
        category: 'Alphabet',
        confidence: 0.92,
        symbol: '2️⃣',
        description: 'Index and middle fingers extended together'
      };
    }
  }

  // 6. THUMBS UP (Fist with Thumb UP)
  if (extendedCount === 0 && thumbPointingUp) {
    return {
      name: 'Thumbs Up',
      text: 'Yes',
      category: 'Phrase',
      confidence: 0.96,
      symbol: '👍',
      description: 'Thumb pointing upward'
    };
  }

  // 7. THUMBS DOWN (Fist with Thumb DOWN)
  if (extendedCount === 0 && thumbPointingDown) {
    return {
      name: 'Thumbs Down',
      text: 'No',
      category: 'Phrase',
      confidence: 0.94,
      symbol: '👎',
      description: 'Thumb pointing downward'
    };
  }

  // 8. OK SIGN / LETTER F (Thumb & Index tips touching, Middle, Ring, Pinky extended)
  if (distThumbIndex < 0.05 && middleExt && ringExt && pinkyExt) {
    return {
      name: 'OK Sign / Letter F',
      text: 'F',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '👌',
      description: 'Thumb and index tips touching with 3 fingers up'
    };
  }

  // 9. LETTER L (Thumb + Index extended at 90 deg, Middle, Ring, Pinky folded)
  if (thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      name: 'Letter L',
      text: 'L',
      category: 'Alphabet',
      confidence: 0.96,
      symbol: '🇱',
      description: 'L shape formed by thumb and index finger'
    };
  }

  // 10. POINTING UP / NUMBER 1 / LETTER D (Index extended, Thumb, Middle, Ring, Pinky folded)
  if (!thumbExt && indexExt && !middleExt && !ringExt && !pinkyExt) {
    return {
      name: 'Number 1 / Letter D',
      text: 'D',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '☝️',
      description: 'Index finger extended upward'
    };
  }

  // 11. LETTER W / NUMBER 3 (Index, Middle, Ring extended, Pinky folded)
  if (indexExt && middleExt && ringExt && !pinkyExt) {
    return {
      name: 'Letter W / Number 3',
      text: 'W',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🇼',
      description: 'Index, middle, and ring fingers extended'
    };
  }

  // 12. NUMBER 4 / LETTER B (4 fingers extended, Thumb folded into palm)
  if (extendedCount === 4 && !thumbExt) {
    return {
      name: 'Number 4 / Letter B',
      text: 'B',
      category: 'Alphabet',
      confidence: 0.94,
      symbol: '4️⃣',
      description: '4 fingers extended together, thumb tucked'
    };
  }

  // 13. FIST / LETTER S (All fingers folded tightly)
  if (extendedCount === 0 && !thumbExt && !thumbPointingUp && !thumbPointingDown) {
    return {
      name: 'Fist / Letter S',
      text: 'S',
      category: 'Alphabet',
      confidence: 0.92,
      symbol: '✊',
      description: 'Closed fist'
    };
  }

  // 14. LETTER A (Fist with thumb along side of index finger)
  if (extendedCount === 0 && thumbExt && thumbTip.y < indexTip.y) {
    return {
      name: 'Letter A',
      text: 'A',
      category: 'Alphabet',
      confidence: 0.91,
      symbol: '🅰️',
      description: 'Fist with thumb erect beside index finger'
    };
  }

  // 15. LETTER C (Curved hand forming C)
  const distThumbMiddleC = getDistance(p[4], p[12]);
  if (!indexExt && !middleExt && distThumbMiddleC > 0.08 && distThumbMiddleC < 0.18) {
    return {
      name: 'Letter C',
      text: 'C',
      category: 'Alphabet',
      confidence: 0.88,
      symbol: '©️',
      description: 'Hand curved into C shape'
    };
  }

  // 16. LETTER Y (Thumb & Pinky extended sideways)
  if (thumbExt && pinkyExt && !indexExt && !middleExt && !ringExt) {
    return {
      name: 'Letter Y',
      text: 'Y',
      category: 'Alphabet',
      confidence: 0.93,
      symbol: '🇾',
      description: 'Thumb and pinky outstretched'
    };
  }

  // 17. PINCH (Thumb & Index tips very close)
  if (distThumbIndex < 0.045 && !middleExt && !ringExt && !pinkyExt) {
    return {
      name: 'Pinch',
      text: 'Pinch',
      category: 'Phrase',
      confidence: 0.89,
      symbol: '🤏',
      description: 'Thumb and index tips holding a small gap'
    };
  }

  // Default Fallback
  return {
    name: 'Tracking Hand...',
    text: '',
    category: 'Analyzing',
    confidence: 0.70,
    symbol: '🔍',
    description: 'Position hand clearly facing webcam'
  };
}

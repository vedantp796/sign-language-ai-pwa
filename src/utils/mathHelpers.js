/**
 * Math and geometric utilities for 3D hand landmark analysis
 */

// Calculate 3D Euclidean distance between two points (x, y, z)
export function getDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// Calculate 2D Euclidean distance (ignoring z for screen-space calculations)
export function getDistance2D(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate angle (in degrees) formed by three points: p1 (start), p2 (vertex/joint), p3 (end)
export function getAngle(p1, p2, p3) {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y, z: (p1.z || 0) - (p2.z || 0) };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y, z: (p3.z || 0) - (p2.z || 0) };

  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

  if (mag1 * mag2 === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

// Normalize landmarks relative to wrist (p[0]) and scaled by hand size (wrist to middle finger MCP p[9])
export function normalizeLandmarks(landmarks) {
  if (!landmarks || landmarks.length === 0) return [];
  
  const wrist = landmarks[0];
  const middleMCP = landmarks[9];
  const handScale = getDistance(wrist, middleMCP) || 1.0;

  return landmarks.map(p => ({
    x: (p.x - wrist.x) / handScale,
    y: (p.y - wrist.y) / handScale,
    z: ((p.z || 0) - (wrist.z || 0)) / handScale
  }));
}

// Check if a finger is extended (angle between MCP-PIP-DIP is high and tip is further from wrist than PIP)
export function isFingerExtended(landmarks, mcpIdx, pipIdx, dipIdx, tipIdx) {
  const wrist = landmarks[0];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];

  const angle = getAngle(landmarks[mcpIdx], landmarks[pipIdx], landmarks[tipIdx]);
  const distTipWrist = getDistance(tip, wrist);
  const distPipWrist = getDistance(pip, wrist);

  // Finger is extended if joint is straight (angle > 140) and tip distance is greater than PIP
  return angle > 135 && distTipWrist > distPipWrist;
}

// Check if thumb is extended
export function isThumbExtended(landmarks, handLabel = 'Right') {
  const wrist = landmarks[0];
  const thumbCMC = landmarks[1];
  const thumbMCP = landmarks[2];
  const thumbIP = landmarks[3];
  const thumbTip = landmarks[4];
  const indexMCP = landmarks[5];

  const angle = getAngle(thumbMCP, thumbIP, thumbTip);
  const distTipIndexMCP = getDistance(thumbTip, indexMCP);
  const distIPTip = getDistance(thumbIP, thumbTip);

  // Thumb extended away from palm
  return angle > 130 && distTipIndexMCP > 0.18;
}

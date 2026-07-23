/**
 * MediaPipe Hands Computer Vision Pipeline Manager
 * Captures video stream, detects 21 hand landmarks, and draws real-time canvas overlays.
 */

export class MediaPipeService {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.isInitialized = false;
    this.onResultsCallback = null;
  }

  initialize(videoElement, canvasElement, onResultsCallback) {
    this.onResultsCallback = onResultsCallback;

    const Hands = window.Hands;
    const Camera = window.Camera;

    if (!Hands) {
      console.error("MediaPipe Hands library not loaded from window object.");
      return;
    }

    // Initialize MediaPipe Hands solution
    this.hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.65,
      minTrackingConfidence: 0.65
    });

    this.hands.onResults((results) => {
      this.drawCanvasOverlay(canvasElement, results);
      if (this.onResultsCallback) {
        this.onResultsCallback(results);
      }
    });

    // Initialize Camera pipeline
    if (videoElement && Camera) {
      this.camera = new Camera(videoElement, {
        onFrame: async () => {
          if (videoElement && videoElement.readyState >= 2 && this.hands && this.isInitialized) {
            try {
              await this.hands.send({ image: videoElement });
            } catch (err) {
              // Ignore frames sent during cleanup / tab teardown
            }
          }
        },
        width: 1280,
        height: 720
      });

      this.isInitialized = true;
      this.camera.start();
    }
  }

  stop() {
    this.isInitialized = false;
    if (this.camera) {
      try { this.camera.stop(); } catch (e) {}
      this.camera = null;
    }
    if (this.hands) {
      try { this.hands.close(); } catch (e) {}
      this.hands = null;
    }
  }

  drawCanvasOverlay(canvasElement, results, options = { showSkeleton: true, showNodes: true, showBox: true }) {
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    const width = canvasElement.width;
    const height = canvasElement.height;
    const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index]?.label || 'Hand';

        // 1. Calculate Bounding Box
        let minX = width, minY = height, maxX = 0, maxY = 0;
        landmarks.forEach(p => {
          const x = p.x * width;
          const y = p.y * height;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });

        // Add padding around bounding box
        const pad = 20;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(width, maxX + pad);
        maxY = Math.min(height, maxY + pad);

        // Draw Bounding Box with glow
        if (options.showBox) {
          ctx.strokeStyle = index === 0 ? '#00f2fe' : '#7f00ff';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 6]);
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
          ctx.setLineDash([]);

          // Label Badge
          ctx.fillStyle = index === 0 ? 'rgba(0, 242, 254, 0.85)' : 'rgba(127, 0, 255, 0.85)';
          ctx.fillRect(minX, minY - 26, 120, 24);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.fillText(`${handedness} Hand`, minX + 8, minY - 10);
        }

        // 2. Draw Connections (Skeleton Lines)
        if (options.showSkeleton && HAND_CONNECTIONS) {
          HAND_CONNECTIONS.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];

            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.strokeStyle = index === 0 ? '#00e676' : '#00f2fe';
            ctx.lineWidth = 3;
            ctx.shadowColor = index === 0 ? '#00e676' : '#00f2fe';
            ctx.shadowBlur = 8;
            ctx.stroke();
            ctx.shadowBlur = 0;
          });
        }

        // 3. Draw Landmark Joint Nodes
        if (options.showNodes) {
          landmarks.forEach((p, idx) => {
            const x = p.x * width;
            const y = p.y * height;

            ctx.beginPath();
            ctx.arc(x, y, idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? 6 : 4, 0, 2 * Math.PI);
            ctx.fillStyle = idx === 0 ? '#ff007f' : '#ffffff';
            ctx.shadowColor = '#00f2fe';
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#0f172a';
            ctx.stroke();
            ctx.shadowBlur = 0;
          });
        }
      });
    }

    ctx.restore();
  }
}

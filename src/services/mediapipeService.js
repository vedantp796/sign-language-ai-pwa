/**
 * MediaPipe Hands Computer Vision Pipeline Manager
 * Captures video stream, detects 21 hand landmarks, and draws real-time canvas overlays.
 * Mobile & Desktop Optimized with Dynamic Canvas Scaling & ROI Guidance.
 */

export class MediaPipeService {
  constructor() {
    this.hands = null;
    this.camera = null;
    this.isInitialized = false;
    this.onResultsCallback = null;
    this.animFrameId = null;
  }

  initialize(videoElement, canvasElement, onResultsCallback) {
    this.onResultsCallback = onResultsCallback;

    const Hands = window.Hands || (typeof MediaPipeHands !== 'undefined' ? MediaPipeHands.Hands : null);
    const Camera = window.Camera;

    if (!Hands) {
      console.warn("MediaPipe Hands library not loaded globally, attempting lazy load.");
    }

    try {
      this.hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469242/${file}`;
        }
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => {
        // Sync Canvas Dimensions with Video Stream (Crucial for Mobile Aspect Ratios)
        if (videoElement && canvasElement && videoElement.videoWidth > 0) {
          if (canvasElement.width !== videoElement.videoWidth) {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
          }
        }

        this.drawCanvasOverlay(canvasElement, results);
        if (this.onResultsCallback) {
          this.onResultsCallback(results);
        }
      });

      this.isInitialized = true;

      // Start processing loop
      if (videoElement && Camera) {
        this.camera = new Camera(videoElement, {
          onFrame: async () => {
            if (videoElement && videoElement.readyState >= 2 && this.hands && this.isInitialized) {
              try {
                await this.hands.send({ image: videoElement });
              } catch (err) {
                // Ignore cleanup frame errors
              }
            }
          },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        });
        this.camera.start();
      } else {
        // Fallback requestAnimationFrame loop for Mobile Browsers
        const processFrame = async () => {
          if (this.isInitialized && videoElement && videoElement.readyState >= 2 && this.hands) {
            try {
              await this.hands.send({ image: videoElement });
            } catch (e) {}
          }
          if (this.isInitialized) {
            this.animFrameId = requestAnimationFrame(processFrame);
          }
        };
        this.animFrameId = requestAnimationFrame(processFrame);
      }
    } catch (e) {
      console.error("Error initializing MediaPipe Hands:", e);
    }
  }

  stop() {
    this.isInitialized = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
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
    const width = canvasElement.width || 640;
    const height = canvasElement.height || 480;
    const HAND_CONNECTIONS = window.HAND_CONNECTIONS;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Target ROI Detection Box (matching Python project crop area)
    const roiW = Math.round(width * 0.45);
    const roiH = Math.round(height * 0.55);
    const roiX = width - roiW - 20;
    const roiY = Math.round(height * 0.15);

    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);
    ctx.strokeRect(roiX, roiY, roiW, roiH);
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(0, 230, 118, 0.85)';
    ctx.fillRect(roiX, roiY - 22, 140, 20);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px Inter, sans-serif';
    ctx.fillText('PLACE HAND HERE', roiX + 8, roiY - 8);

    // 2. Draw Detected Hand Joint Landmarks
    if (results && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      results.multiHandLandmarks.forEach((landmarks, index) => {
        const handedness = results.multiHandedness[index]?.label || 'Hand';

        // Calculate Bounding Box
        let minX = width, minY = height, maxX = 0, maxY = 0;
        landmarks.forEach(p => {
          const x = p.x * width;
          const y = p.y * height;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        });

        const pad = 15;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(width, maxX + pad);
        maxY = Math.min(height, maxY + pad);

        // Bounding Box
        if (options.showBox) {
          ctx.strokeStyle = index === 0 ? '#00f2fe' : '#7f00ff';
          ctx.lineWidth = 2;
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

          ctx.fillStyle = index === 0 ? 'rgba(0, 242, 254, 0.9)' : 'rgba(127, 0, 255, 0.9)';
          ctx.fillRect(minX, minY - 24, 110, 22);
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.fillText(`${handedness} Hand`, minX + 6, minY - 8);
        }

        // Skeleton Lines
        if (options.showSkeleton && HAND_CONNECTIONS) {
          HAND_CONNECTIONS.forEach(([start, end]) => {
            const p1 = landmarks[start];
            const p2 = landmarks[end];

            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.strokeStyle = index === 0 ? '#00e676' : '#00f2fe';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00e676';
            ctx.shadowBlur = 6;
            ctx.stroke();
            ctx.shadowBlur = 0;
          });
        }

        // Landmark Joint Nodes
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

/**
 * MediaPipe Tasks Vision Hand Landmarker Pipeline
 * Powered by @mediapipe/tasks-vision
 * 100% Cross-Platform Mobile (iOS Safari, Android Chrome) & Desktop Compatibility.
 */

import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class MediaPipeService {
  constructor() {
    this.handLandmarker = null;
    this.isInitialized = false;
    this.animFrameId = null;
    this.onResultsCallback = null;
    this.lastVideoTime = -1;
  }

  async initialize(videoElement, canvasElement, onResultsCallback) {
    this.onResultsCallback = onResultsCallback;

    try {
      // 1. Initialize WASM Fileset Resolver
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // 2. Create HandLandmarker with GPU / WebGL delegate
      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
      console.log("MediaPipe Tasks Vision HandLandmarker initialized successfully!");

      // 3. Start Video Detection Frame Loop
      const processVideoFrame = () => {
        if (this.isInitialized && videoElement && videoElement.readyState >= 2 && this.handLandmarker) {
          if (videoElement.currentTime !== this.lastVideoTime) {
            this.lastVideoTime = videoElement.currentTime;

            try {
              const startTimeMs = performance.now();
              const results = this.handLandmarker.detectForVideo(videoElement, startTimeMs);

              // Sync Canvas dimensions to Video Aspect Ratio
              if (canvasElement && videoElement.videoWidth > 0) {
                if (canvasElement.width !== videoElement.videoWidth) {
                  canvasElement.width = videoElement.videoWidth;
                  canvasElement.height = videoElement.videoHeight;
                }
              }

              this.drawCanvasOverlay(canvasElement, results);

              if (this.onResultsCallback) {
                this.onResultsCallback(results);
              }
            } catch (err) {
              console.warn("HandLandmarker detection notice:", err);
            }
          }
        }

        if (this.isInitialized) {
          this.animFrameId = requestAnimationFrame(processVideoFrame);
        }
      };

      this.animFrameId = requestAnimationFrame(processVideoFrame);

    } catch (e) {
      console.error("Error initializing MediaPipe Tasks Vision:", e);
    }
  }

  stop() {
    this.isInitialized = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.handLandmarker) {
      try { this.handLandmarker.close(); } catch (e) {}
      this.handLandmarker = null;
    }
  }

  drawCanvasOverlay(canvasElement, results, options = { showSkeleton: true, showNodes: true, showBox: true }) {
    if (!canvasElement) return;

    const ctx = canvasElement.getContext('2d');
    const width = canvasElement.width || 640;
    const height = canvasElement.height || 480;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Target ROI Detection Box (Green target rectangle)
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
    if (results && results.landmarks && results.landmarks.length > 0) {
      results.landmarks.forEach((landmarks, index) => {
        const handedness = results.handednesses?.[index]?.[0]?.displayName || 'Hand';

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

        // Skeleton Connectors
        const HAND_CONNECTIONS = [
          [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8],       // Index
          [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
          [9, 13], [13, 14], [14, 15], [15, 16], // Ring
          [13, 17], [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
        ];

        if (options.showSkeleton) {
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

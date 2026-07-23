import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, Eye, Box, Share2, FlipHorizontal, RefreshCw } from 'lucide-react';
import { MediaPipeService } from '../services/mediapipeService';

export default function CameraFeed({ onLandmarksDetected, isCameraActive, setIsCameraActive }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mpServiceRef = useRef(null);

  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showNodes, setShowNodes] = useState(true);
  const [showBox, setShowBox] = useState(true);
  const [isFlipped, setIsFlipped] = useState(true);
  const [fps, setFps] = useState(0);
  const [handCount, setHandCount] = useState(0);
  const [cameraError, setCameraError] = useState(null);

  const frameTimeRef = useRef([]);

  useEffect(() => {
    let active = true;

    const startCamera = async () => {
      setCameraError(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }
        });

        if (videoRef.current && active) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();

          // Initialize MediaPipe pipeline
          const service = new MediaPipeService();
          mpServiceRef.current = service;

          service.initialize(videoRef.current, canvasRef.current, (results) => {
            // Calculate FPS
            const now = performance.now();
            frameTimeRef.current.push(now);
            if (frameTimeRef.current.length > 20) frameTimeRef.current.shift();
            if (frameTimeRef.current.length > 1) {
              const delta = (now - frameTimeRef.current[0]) / (frameTimeRef.current.length - 1);
              setFps(Math.round(1000 / delta));
            }

            const count = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
            setHandCount(count);

            // Re-render canvas with custom user options
            if (canvasRef.current) {
              service.drawCanvasOverlay(canvasRef.current, results, {
                showSkeleton,
                showNodes,
                showBox
              });
            }

            if (onLandmarksDetected) {
              onLandmarksDetected(results);
            }
          });

          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("Camera permission denied or device unavailable. Please allow camera access.");
        setIsCameraActive(false);
      }
    };

    if (isCameraActive) {
      startCamera();
    } else {
      if (mpServiceRef.current) {
        mpServiceRef.current.stop();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    }

    return () => {
      active = false;
      if (mpServiceRef.current) {
        mpServiceRef.current.stop();
      }
    };
  }, [isCameraActive]);

  const toggleCamera = () => {
    setIsCameraActive(!isCameraActive);
  };

  return (
    <div className="camera-feed-card glass-panel">
      <div className="camera-header">
        <div className="camera-title-wrap">
          <span className={`status-dot ${isCameraActive ? 'pulse-green' : 'gray'}`}></span>
          <h3 className="card-title">Live Vision Feed</h3>
        </div>
        <div className="camera-metrics">
          <span className="metric-tag">{fps} FPS</span>
          <span className="metric-tag blue">{handCount} Hand{handCount !== 1 ? 's' : ''} Detected</span>
        </div>
      </div>

      <div className="video-canvas-container">
        <video
          ref={videoRef}
          className={`video-element ${isFlipped ? 'flipped' : ''}`}
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className={`canvas-element ${isFlipped ? 'flipped' : ''}`}
        />

        {!isCameraActive && !cameraError && (
          <div className="camera-placeholder">
            <Camera size={54} className="icon-pulse" />
            <p>Webcam is paused</p>
            <button className="btn-primary" onClick={toggleCamera}>
              Start Camera Feed
            </button>
          </div>
        )}

        {cameraError && (
          <div className="camera-placeholder error">
            <CameraOff size={54} />
            <p>{cameraError}</p>
            <button className="btn-primary" onClick={toggleCamera}>
              Retry Camera
            </button>
          </div>
        )}
      </div>

      <div className="camera-toolbar">
        <button
          className={`tool-btn ${isCameraActive ? 'active' : ''}`}
          onClick={toggleCamera}
          title={isCameraActive ? "Pause Camera" : "Start Camera"}
        >
          {isCameraActive ? <CameraOff size={16} /> : <Camera size={16} />}
          <span>{isCameraActive ? 'Pause Feed' : 'Start Feed'}</span>
        </button>

        <button
          className={`tool-btn ${showSkeleton ? 'active' : ''}`}
          onClick={() => setShowSkeleton(!showSkeleton)}
          title="Toggle Skeleton Connectors"
        >
          <Share2 size={16} />
          <span>Skeleton</span>
        </button>

        <button
          className={`tool-btn ${showNodes ? 'active' : ''}`}
          onClick={() => setShowNodes(!showNodes)}
          title="Toggle 21 Joint Nodes"
        >
          <Eye size={16} />
          <span>21 Nodes</span>
        </button>

        <button
          className={`tool-btn ${showBox ? 'active' : ''}`}
          onClick={() => setShowBox(!showBox)}
          title="Toggle Hand Bounding Box"
        >
          <Box size={16} />
          <span>Bounding Box</span>
        </button>

        <button
          className={`tool-btn ${isFlipped ? 'active' : ''}`}
          onClick={() => setIsFlipped(!isFlipped)}
          title="Flip Mirror View"
        >
          <FlipHorizontal size={16} />
          <span>Mirror</span>
        </button>
      </div>
    </div>
  );
}

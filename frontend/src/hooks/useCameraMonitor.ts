import { useState, useRef, useCallback, useEffect } from 'react';

export type CameraEvent = 'PRESENCE_LOST' | 'FACE_NOT_VISIBLE' | 'GAZE_AWAY' | 'FOCUS_RECOVERED';

export interface UseCameraMonitorResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
  hasPermission: boolean | null;
  faceDetected: boolean;
  presenceScore: number;
  warningLevel: 'none' | 'low' | 'medium' | 'high';
  currentEvent: CameraEvent | null;
  distractionCount: number;
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  onEvent: (callback: (event: CameraEvent) => void) => void;
}

const ANALYSIS_INTERVAL_MS = 2000;
const CONSECUTIVE_FRAMES_THRESHOLD = 3;
const COOLDOWN_MS = 30000;

export function useCameraMonitor(): UseCameraMonitorResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const callbackRef = useRef<((event: CameraEvent) => void) | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const [presenceScore, setPresenceScore] = useState(100);
  const [warningLevel, setWarningLevel] = useState<'none' | 'low' | 'medium' | 'high'>('none');
  const [currentEvent, setCurrentEvent] = useState<CameraEvent | null>(null);
  const [distractionCount, setDistractionCount] = useState(0);

  const consecutiveNoFaceRef = useRef(0);
  const lastEventTimeRef = useRef<Record<string, number>>({});
  const previousFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  const analyzeFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Analyze center region (where face typically appears)
    const cx = Math.floor(canvas.width * 0.3);
    const cy = Math.floor(canvas.height * 0.1);
    const cw = Math.floor(canvas.width * 0.4);
    const ch = Math.floor(canvas.height * 0.6);

    let imageData: ImageData;
    try {
      imageData = ctx.getImageData(cx, cy, cw, ch);
    } catch {
      return;
    }

    const data = imageData.data;
    let totalBrightness = 0;
    let variance = 0;
    const pixelCount = data.length / 4;

    // Calculate mean brightness
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      totalBrightness += brightness;
    }
    const meanBrightness = totalBrightness / pixelCount;

    // Calculate variance (indicator of face presence)
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      variance += Math.pow(brightness - meanBrightness, 2);
    }
    variance /= pixelCount;

    // Calculate motion (difference from previous frame)
    let motionScore = 0;
    if (previousFrameDataRef.current && previousFrameDataRef.current.length === data.length) {
      let diff = 0;
      for (let i = 0; i < data.length; i += 4) {
        diff += Math.abs(data[i] - previousFrameDataRef.current[i]);
        diff += Math.abs(data[i + 1] - previousFrameDataRef.current[i + 1]);
        diff += Math.abs(data[i + 2] - previousFrameDataRef.current[i + 2]);
      }
      motionScore = diff / (data.length / 4) / 255;
    }
    previousFrameDataRef.current = new Uint8ClampedArray(data);

    // Heuristic: face present if variance > threshold and brightness is reasonable
    const hasContent = variance > 0.005 && meanBrightness > 0.05 && meanBrightness < 0.95;
    const presence = hasContent ? Math.min(100, Math.round(variance * 2000 + motionScore * 50)) : 0;

    setPresenceScore(Math.min(100, presence));
    const detected = presence > 15;
    setFaceDetected(detected);

    const now = Date.now();

    if (!detected) {
      consecutiveNoFaceRef.current += 1;

      if (consecutiveNoFaceRef.current >= CONSECUTIVE_FRAMES_THRESHOLD) {
        const lastTime = lastEventTimeRef.current['PRESENCE_LOST'] ?? 0;
        if (now - lastTime > COOLDOWN_MS) {
          lastEventTimeRef.current['PRESENCE_LOST'] = now;
          setCurrentEvent('PRESENCE_LOST');
          setDistractionCount((c) => c + 1);
          setWarningLevel('high');
          callbackRef.current?.('PRESENCE_LOST');
        }
      } else if (consecutiveNoFaceRef.current >= 2) {
        setWarningLevel('medium');
        setCurrentEvent('FACE_NOT_VISIBLE');
      } else {
        setWarningLevel('low');
      }
    } else {
      if (consecutiveNoFaceRef.current >= CONSECUTIVE_FRAMES_THRESHOLD) {
        const lastTime = lastEventTimeRef.current['FOCUS_RECOVERED'] ?? 0;
        if (now - lastTime > 5000) {
          lastEventTimeRef.current['FOCUS_RECOVERED'] = now;
          setCurrentEvent('FOCUS_RECOVERED');
          callbackRef.current?.('FOCUS_RECOVERED');
        }
      }
      consecutiveNoFaceRef.current = 0;
      setWarningLevel('none');
      setCurrentEvent(null);
    }
  }, []);

  const startMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsActive(true);
      consecutiveNoFaceRef.current = 0;
      previousFrameDataRef.current = null;

      intervalRef.current = setInterval(analyzeFrame, ANALYSIS_INTERVAL_MS);
    } catch {
      setHasPermission(false);
      setIsActive(false);
    }
  }, [analyzeFrame]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setFaceDetected(false);
    setPresenceScore(0);
    setWarningLevel('none');
    setCurrentEvent(null);
  }, []);

  const onEvent = useCallback((callback: (event: CameraEvent) => void) => {
    callbackRef.current = callback;
  }, []);

  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    videoRef,
    canvasRef,
    isActive,
    hasPermission,
    faceDetected,
    presenceScore,
    warningLevel,
    currentEvent,
    distractionCount,
    startMonitoring,
    stopMonitoring,
    onEvent,
  };
}

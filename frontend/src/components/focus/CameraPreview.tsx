import { Video, VideoOff, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import type { UseCameraMonitorResult } from '@/hooks/useCameraMonitor';
import { cn } from '@/utils/cn';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface CameraPreviewProps {
  cameraMonitor: UseCameraMonitorResult;
  compact?: boolean;
}

export function CameraPreview({ cameraMonitor, compact = false }: CameraPreviewProps) {
  const {
    videoRef,
    canvasRef,
    isActive,
    hasPermission,
    faceDetected,
    presenceScore,
    warningLevel,
    startMonitoring,
    stopMonitoring,
  } = cameraMonitor;

  const warningColors = {
    none: 'bg-emerald-500',
    low: 'bg-yellow-500',
    medium: 'bg-amber-500',
    high: 'bg-red-500',
  };

  return (
    <div className="space-y-2">
      {/* Camera feed */}
      <div
        className={cn(
          'relative bg-[#080810] rounded-xl overflow-hidden border',
          warningLevel === 'high' ? 'border-red-500/50' : 'border-[#1a1a2e]',
          compact ? 'aspect-video' : 'aspect-video w-full'
        )}
      >
        {isActive ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            <canvas ref={canvasRef} className="hidden" />
            {/* Status overlay */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full animate-pulse', warningColors[warningLevel])} />
              <span className="text-xs text-white font-medium bg-black/50 px-1.5 py-0.5 rounded">
                {warningLevel === 'none' ? 'Active' : warningLevel === 'high' ? 'Alert' : 'Warning'}
              </span>
            </div>
            {/* Face detected */}
            <div className="absolute top-2 right-2">
              {faceDetected ? (
                <CheckCircle size={16} className="text-emerald-400" />
              ) : (
                <AlertCircle size={16} className="text-amber-400" />
              )}
            </div>
            {/* Warning flash */}
            {warningLevel === 'high' && (
              <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b] gap-2 py-6">
            {hasPermission === false ? (
              <>
                <VideoOff size={compact ? 20 : 32} />
                {!compact && <p className="text-xs text-center">Camera access denied</p>}
              </>
            ) : (
              <>
                <Video size={compact ? 20 : 32} />
                {!compact && <p className="text-xs">Camera inactive</p>}
              </>
            )}
          </div>
        )}
      </div>

      {/* Presence score */}
      {isActive && !compact && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-[#64748b]">Presence score</span>
            <span className={presenceScore > 50 ? 'text-emerald-400' : 'text-amber-400'}>
              {presenceScore}%
            </span>
          </div>
          <ProgressBar
            value={presenceScore}
            size="sm"
            color={presenceScore > 50 ? 'green' : 'amber'}
            animated
          />
        </div>
      )}

      {/* Toggle button */}
      <div className="flex items-center justify-between">
        <button
          onClick={isActive ? stopMonitoring : startMonitoring}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
            isActive
              ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-700/30'
              : 'bg-violet-900/30 text-violet-400 hover:bg-violet-900/50 border border-violet-700/30'
          )}
        >
          {isActive ? <VideoOff size={12} /> : <Video size={12} />}
          {isActive ? 'Disable' : 'Enable Camera'}
        </button>
        {!compact && (
          <div className="flex items-center gap-1 text-xs text-[#64748b]">
            <Shield size={10} />
            <span>Local only</span>
          </div>
        )}
      </div>
    </div>
  );
}

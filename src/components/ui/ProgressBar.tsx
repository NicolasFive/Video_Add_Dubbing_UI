'use client';

interface ProgressBarProps {
  progress: number;
  status: string;
  currentStep?: string | null;
  showLabel?: boolean;
}

const statusColors = {
  pending: 'bg-gray-400',
  processing: 'bg-primary-600',
  success: 'bg-green-500',
  failed: 'bg-red-500',
  unknown: 'bg-gray-400',
};

export default function ProgressBar({
  progress,
  status,
  currentStep,
  showLabel = true,
}: ProgressBarProps) {
  const colorClass = statusColors[status as keyof typeof statusColors] || statusColors.processing;

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">
            {currentStep || '处理中...'}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {progress}%
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        >
          {status === 'processing' && (
            <div className="h-full w-full animate-pulse bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}
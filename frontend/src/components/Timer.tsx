import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  initialSeconds: number;
  onTimeExpire?: () => void;
  isRunning?: boolean;
}

export const Timer: React.FC<TimerProps> = ({ 
  initialSeconds, 
  onTimeExpire, 
  isRunning = true 
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      if (onTimeExpire) onTimeExpire();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeExpire) onTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, isRunning, onTimeExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const remainingSecs = secondsLeft % 60;
  const formatted = `${minutes}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;

  const percentage = Math.max(0, Math.min(100, (secondsLeft / initialSeconds) * 100));

  // Determine urgency state
  const isUrgent = secondsLeft <= 30 && secondsLeft > 0;
  const isWarning = secondsLeft <= 60 && !isUrgent;

  let colorClasses = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
  let barColor = 'bg-emerald-500';

  if (isUrgent) {
    colorClasses = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 animate-pulse';
    barColor = 'bg-rose-500';
  } else if (isWarning) {
    colorClasses = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className={`flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-colors ${colorClasses}`}>
        <div className="flex items-center gap-1.5">
          {isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5 animate-bounce text-rose-500" />
          ) : (
            <Clock className="w-3.5 h-3.5" />
          )}
          <span>Time Remaining</span>
        </div>
        <span className="text-sm font-bold tracking-wider">{formatted}</span>
      </div>

      {/* Progress line */}
      <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${barColor}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

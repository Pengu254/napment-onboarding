/**
 * Progress Bar Component
 */

import { motion } from 'framer-motion';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitle?: string;
}

export function ProgressBar({ currentStep, totalSteps, stepTitle }: ProgressBarProps) {
  // Adjust for welcome step offset
  const adjustedStep = Math.max(0, currentStep - 1);
  const progress = ((adjustedStep + 1) / totalSteps) * 100;
  
  return (
    <div className="flex items-center gap-4">
      {/* Step Counter */}
      <span className="text-sm text-white/60">
        {adjustedStep + 1} / {totalSteps}
      </span>
      
      {/* Progress Bar */}
      <div className="w-32 h-1.5 bg-surface-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      
      {/* Step Title */}
      {stepTitle && (
        <span className="text-sm font-medium text-white/80">
          {stepTitle}
        </span>
      )}
    </div>
  );
}


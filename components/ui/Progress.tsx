import React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';
import { motion } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-brand-primary-500',
  success: 'bg-brand-success-500',
  warning: 'bg-brand-warning-500',
  error: 'bg-brand-error-500',
};

const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  animated = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  // Spring animation for smooth progress changes
  const springProps = useSpring({
    width: `${percentage}%`,
    config: { tension: 280, friction: 60 },
  });

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-brand-text-primary">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-brand-text-muted">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <ProgressPrimitive.Root
        value={value}
        max={max}
        className={`
          relative overflow-hidden bg-brand-bg-light rounded-full
          ${sizeClasses[size]}
        `}
      >
        <ProgressPrimitive.Indicator asChild>
          {animated ? (
            <animated.div
              style={springProps}
              className={`
                h-full rounded-full transition-colors duration-300
                ${variantClasses[variant]}
                relative overflow-hidden
              `}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </animated.div>
          ) : (
            <div
              className={`
                h-full rounded-full transition-all duration-500 ease-out
                ${variantClasses[variant]}
              `}
              style={{ width: `${percentage}%` }}
            />
          )}
        </ProgressPrimitive.Indicator>
      </ProgressPrimitive.Root>
    </div>
  );
};

// Circular Progress Component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = 'default',
  showLabel = true,
  className = '',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    default: 'stroke-brand-primary-500',
    success: 'stroke-brand-success-500',
    warning: 'stroke-brand-warning-500',
    error: 'stroke-brand-error-500',
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-brand-bg-light"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={colorClasses[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            strokeDasharray,
          }}
        />
      </svg>
      
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg font-semibold text-brand-text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      )}
    </div>
  );
};

// Learning Progress Component
interface LearningProgressProps {
  totalModules: number;
  completedModules: number;
  currentModule?: string;
  className?: string;
}

const LearningProgress: React.FC<LearningProgressProps> = ({
  totalModules,
  completedModules,
  currentModule,
  className = '',
}) => {
  const percentage = (completedModules / totalModules) * 100;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-brand-text-primary">
          Learning Progress
        </h3>
        <span className="text-sm text-brand-text-muted">
          {completedModules} of {totalModules} modules
        </span>
      </div>

      <Progress
        value={completedModules}
        max={totalModules}
        variant="success"
        animated={true}
        className="h-2"
      />

      {currentModule && (
        <p className="text-xs text-brand-text-muted">
          Currently learning: <span className="text-brand-primary-400">{currentModule}</span>
        </p>
      )}

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-brand-success-500 rounded-full" />
          <span className="text-brand-text-muted">Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-brand-bg-light rounded-full" />
          <span className="text-brand-text-muted">Remaining</span>
        </div>
      </div>
    </div>
  );
};

// Step Progress Component
interface StepProgressProps {
  steps: Array<{
    id: string;
    title: string;
    completed: boolean;
    current?: boolean;
  }>;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'horizontal',
  className = '',
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className={`${isHorizontal ? 'flex items-center' : 'space-y-4'} ${className}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center ${isHorizontal ? 'flex-row' : 'flex-col'} ${
            index < steps.length - 1 ? (isHorizontal ? 'flex-1' : '') : ''
          }`}
        >
          <div className="flex items-center">
            <motion.div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step.completed
                  ? 'bg-brand-success-500 text-white'
                  : step.current
                  ? 'bg-brand-primary-500 text-white'
                  : 'bg-brand-bg-light text-brand-text-muted'
                }
              `}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </motion.div>

            {!isHorizontal && (
              <span className={`ml-3 text-sm font-medium ${
                step.current ? 'text-brand-text-primary' : 'text-brand-text-muted'
              }`}>
                {step.title}
              </span>
            )}
          </div>

          {index < steps.length - 1 && (
            <div className={`
              ${isHorizontal
                ? 'flex-1 h-0.5 mx-4'
                : 'w-0.5 h-8 ml-4'
              }
              ${step.completed ? 'bg-brand-success-500' : 'bg-brand-bg-light'}
            `} />
          )}

          {isHorizontal && (
            <div className="mt-2">
              <span className={`text-xs ${
                step.current ? 'text-brand-text-primary' : 'text-brand-text-muted'
              }`}>
                {step.title}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export { Progress, CircularProgress, LearningProgress, StepProgress };
export default Progress;

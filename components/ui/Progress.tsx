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

export { Progress, CircularProgress };
export default Progress;

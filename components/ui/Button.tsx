import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animated?: boolean;
  ripple?: boolean;
  glow?: boolean;
  className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  animated = true,
  ripple = true,
  glow = false,
  className = '',
  children,
  disabled,
  onClick,
  ...props
}, ref) => {
  // Base classes
  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg-dark
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    relative overflow-hidden
  `;

  // Variant classes
  const variantClasses = {
    primary: `
      bg-brand-primary-600 hover:bg-brand-primary-700 text-white shadow-md hover:shadow-lg
      focus:ring-brand-primary-500 ${glow ? 'hover:shadow-glow' : ''}
    `,
    secondary: `
      bg-brand-bg-medium hover:bg-brand-bg-light text-brand-text-primary border border-brand-bg-light
      focus:ring-brand-primary-500 hover:border-brand-primary-500/50
    `,
    accent: `
      bg-brand-accent-600 hover:bg-brand-accent-700 text-white shadow-md hover:shadow-lg
      focus:ring-brand-accent-500 ${glow ? 'hover:shadow-glow' : ''}
    `,
    success: `
      bg-brand-success-600 hover:bg-brand-success-700 text-white shadow-md hover:shadow-lg
      focus:ring-brand-success-500
    `,
    warning: `
      bg-brand-warning-600 hover:bg-brand-warning-700 text-white shadow-md hover:shadow-lg
      focus:ring-brand-warning-500
    `,
    error: `
      bg-brand-error-600 hover:bg-brand-error-700 text-white shadow-md hover:shadow-lg
      focus:ring-brand-error-500
    `,
    ghost: `
      bg-transparent hover:bg-brand-bg-medium text-brand-text-primary
      focus:ring-brand-primary-500
    `,
    outline: `
      bg-transparent hover:bg-brand-primary-600 text-brand-primary-400 hover:text-white
      border border-brand-primary-500 focus:ring-brand-primary-500
    `,
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    xl: 'px-8 py-4 text-lg gap-3',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClasses}
    ${className}
  `.trim();

  // Animation variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02 },
    tap: { scale: 0.98 },
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <motion.div
      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  );

  // Ripple effect component
  const RippleEffect = ({ x, y }: { x: number; y: number }) => (
    <motion.div
      className="absolute bg-white/20 rounded-full pointer-events-none"
      style={{
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 4, opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    />
  );

  // Handle click with ripple effect
  const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ripple && !disabled && !loading) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now(), x, y };
      
      setRipples(prev => [...prev, newRipple]);
      
      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  if (animated) {
    return (
      <motion.button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        onClick={handleClick}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.1 }}
      >
        {/* Ripple effects */}
        {ripples.map(ripple => (
          <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
        ))}

        {/* Button content */}
        <div className="flex items-center justify-center gap-inherit">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {leftIcon && (
                <motion.span
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {leftIcon}
                </motion.span>
              )}

              {children && (
                <span className={loading ? 'opacity-0' : 'opacity-100'}>
                  {children}
                </span>
              )}

              {rightIcon && (
                <motion.span
                  className="flex-shrink-0"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {rightIcon}
                </motion.span>
              )}
            </>
          )}
        </div>
      </motion.button>
    );
  }

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} />
      ))}

      {/* Button content */}
      <div className="flex items-center justify-center gap-inherit">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {leftIcon && (
              <span className="flex-shrink-0">
                {leftIcon}
              </span>
            )}

            {children && (
              <span className={loading ? 'opacity-0' : 'opacity-100'}>
                {children}
              </span>
            )}

            {rightIcon && (
              <span className="flex-shrink-0">
                {rightIcon}
              </span>
            )}
          </>
        )}
      </div>
    </button>
  );
});

Button.displayName = 'Button';

// Icon button variant
interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(({
  icon,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}, ref) => {
  const iconSizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      className={`${iconSizeClasses[size]} ${className}`}
      {...props}
    >
      {icon}
    </Button>
  );
});

IconButton.displayName = 'IconButton';

export { Button, IconButton };
export default Button;

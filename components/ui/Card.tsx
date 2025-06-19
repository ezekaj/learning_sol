import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  clickable = false,
  variant = 'default',
  padding = 'md',
  onClick,
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-brand-bg-medium border border-brand-bg-light/20 shadow-lg',
    elevated: 'bg-brand-bg-medium shadow-2xl border border-brand-bg-light/10',
    outlined: 'bg-transparent border-2 border-brand-bg-light/30',
    glass: 'bg-brand-bg-medium/80 backdrop-blur-md border border-brand-bg-light/20 shadow-lg',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover || clickable ? 'hover:shadow-glow hover:scale-[1.02] hover:border-brand-primary-500/30' : '';
  const clickableClasses = clickable ? 'cursor-pointer' : '';

  const cardClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${paddingClasses[padding]}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim();

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: hover || clickable ? { y: -2 } : {},
    tap: clickable ? { scale: 0.98 } : {},
  };

  return (
    <motion.div
      className={cardClasses}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`border-b border-brand-bg-light/20 pb-4 mb-4 ${className}`}>
    {children}
  </div>
);

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`border-t border-brand-bg-light/20 pt-4 mt-4 ${className}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardBody, CardFooter };
export default Card;

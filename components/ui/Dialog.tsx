import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const DialogContent: React.FC<DialogContentProps> = ({ 
  children, 
  className = '', 
  size = 'md' 
}) => (
  <DialogPrimitive.Portal>
    <AnimatePresence>
      <DialogPrimitive.Overlay asChild>
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      </DialogPrimitive.Overlay>
      <DialogPrimitive.Content asChild>
        <motion.div
          className={`
            fixed top-1/2 left-1/2 z-50 w-full ${sizeClasses[size]} 
            bg-brand-bg-medium rounded-xl shadow-2xl border border-brand-bg-light/20
            focus:outline-none focus:ring-2 focus:ring-brand-primary-500 focus:ring-offset-2 focus:ring-offset-brand-bg-dark
            ${className}
          `}
          initial={{ 
            opacity: 0, 
            scale: 0.95, 
            x: '-50%', 
            y: '-50%' 
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: '-50%', 
            y: '-50%' 
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.95, 
            x: '-50%', 
            y: '-50%' 
          }}
          transition={{ 
            duration: 0.2, 
            ease: [0.16, 1, 0.3, 1] 
          }}
        >
          {children}
        </motion.div>
      </DialogPrimitive.Content>
    </AnimatePresence>
  </DialogPrimitive.Portal>
);

const DialogHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 border-b border-brand-bg-light/20 ${className}`}>
    {children}
  </div>
);

const DialogBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const DialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 border-t border-brand-bg-light/20 flex justify-end gap-3 ${className}`}>
    {children}
  </div>
);

const DialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <DialogPrimitive.Title className={`text-lg font-semibold text-brand-text-primary ${className}`}>
    {children}
  </DialogPrimitive.Title>
);

const DialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <DialogPrimitive.Description className={`text-sm text-brand-text-muted mt-1 ${className}`}>
    {children}
  </DialogPrimitive.Description>
);

const DialogClose: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <DialogPrimitive.Close asChild>
    <motion.button
      className={className}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  </DialogPrimitive.Close>
);

const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children
}) => (
  <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
    {children}
  </DialogPrimitive.Root>
);

// Export all components
export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
};

// Default export for convenience
export default Dialog;

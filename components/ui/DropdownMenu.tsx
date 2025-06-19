import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownMenuProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSelect?: () => void;
  destructive?: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ 
  children, 
  open, 
  onOpenChange 
}) => (
  <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
    {children}
  </DropdownMenuPrimitive.Root>
);

const DropdownMenuTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <DropdownMenuPrimitive.Trigger asChild>
    <motion.button
      className={className}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.button>
  </DropdownMenuPrimitive.Trigger>
);

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  children,
  className = '',
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
}) => (
  <DropdownMenuPrimitive.Portal>
    <AnimatePresence>
      <DropdownMenuPrimitive.Content
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={`
          z-50 min-w-[12rem] overflow-hidden rounded-lg bg-brand-bg-medium border border-brand-bg-light/20
          shadow-2xl backdrop-blur-md
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
          data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
          data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2
          data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2
          ${className}
        `}
        asChild
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="p-1">
            {children}
          </div>
        </motion.div>
      </DropdownMenuPrimitive.Content>
    </AnimatePresence>
  </DropdownMenuPrimitive.Portal>
);

const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  className = '',
  disabled = false,
  onSelect,
  destructive = false,
}) => (
  <DropdownMenuPrimitive.Item
    disabled={disabled}
    onSelect={onSelect}
    className={`
      relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm
      transition-colors duration-150 outline-none
      ${destructive 
        ? 'text-brand-error-400 hover:bg-brand-error-500/10 focus:bg-brand-error-500/10' 
        : 'text-brand-text-primary hover:bg-brand-bg-light focus:bg-brand-bg-light'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      data-[disabled]:pointer-events-none data-[disabled]:opacity-50
      ${className}
    `}
    asChild
  >
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  </DropdownMenuPrimitive.Item>
);

const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => (
  <DropdownMenuPrimitive.Separator 
    className={`-mx-1 my-1 h-px bg-brand-bg-light/30 ${className}`} 
  />
);

const DropdownMenuLabel: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <DropdownMenuPrimitive.Label 
    className={`px-3 py-2 text-xs font-semibold text-brand-text-muted uppercase tracking-wider ${className}`}
  >
    {children}
  </DropdownMenuPrimitive.Label>
);

const DropdownMenuGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DropdownMenuPrimitive.Group>
    {children}
  </DropdownMenuPrimitive.Group>
);

// Shortcut component for keyboard shortcuts
const DropdownMenuShortcut: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <span className={`ml-auto text-xs text-brand-text-muted ${className}`}>
    {children}
  </span>
);

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuShortcut,
};

export default DropdownMenu;

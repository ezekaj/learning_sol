'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Button, ButtonProps } from '@/components/ui/button';
import { buttonVariants } from '@/lib/animations/micro-interactions';
import { cn } from '@/lib/utils';

interface EnhancedButtonProps extends ButtonProps {
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  showFeedback?: boolean;
  pulseOnHover?: boolean;
  glowEffect?: boolean;
  soundEffect?: boolean;
  hapticFeedback?: boolean;
  children: React.ReactNode;
}

export function EnhancedButton({
  loading = false,
  success = false,
  error = false,
  loadingText = 'Loading...',
  successText = 'Success!',
  errorText = 'Error',
  showFeedback = true,
  pulseOnHover = false,
  glowEffect = false,
  soundEffect = false,
  hapticFeedback = true,
  children,
  className,
  onClick,
  disabled,
  ...props
}: EnhancedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Haptic feedback for mobile devices
    if (hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Sound effect
    if (soundEffect) {
      playClickSound();
    }

    // Visual feedback
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);

    // Success animation
    if (success && showFeedback) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    }

    if (onClick) {
      await onClick(e);
    }
  };

  const playClickSound = () => {
    // Create a subtle click sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      // Fallback: silent operation if Web Audio API is not available
    }
  };

  const getButtonContent = () => {
    if (loading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </motion.div>
      );
    }

    if (success && showFeedback) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2"
        >
          <Check className="w-4 h-4" />
          <span>{successText}</span>
        </motion.div>
      );
    }

    if (error && showFeedback) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{errorText}</span>
        </motion.div>
      );
    }

    return children;
  };

  const buttonVariant = loading ? 'loading' : isPressed ? 'tap' : 'idle';

  return (
    <motion.div className="relative inline-block">
      <motion.div
        variants={buttonVariants}
        initial="idle"
        animate={buttonVariant}
        whileHover={!disabled && !loading ? 'hover' : 'idle'}
        whileTap={!disabled && !loading ? 'tap' : 'idle'}
        className={cn(
          'relative',
          glowEffect && !disabled && 'filter drop-shadow-lg',
          className
        )}
      >
        <Button
          {...props}
          onClick={handleClick}
          disabled={disabled || loading}
          className={cn(
            'relative overflow-hidden transition-all duration-200',
            pulseOnHover && 'hover:animate-pulse',
            success && showFeedback && 'bg-green-600 hover:bg-green-700',
            error && showFeedback && 'bg-red-600 hover:bg-red-700',
            loading && 'cursor-not-allowed',
            className
          )}
        >
          {/* Background ripple effect */}
          <AnimatePresence>
            {isPressed && (
              <motion.div
                initial={{ scale: 0, opacity: 0.5 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 bg-white rounded-full"
                style={{ transformOrigin: 'center' }}
              />
            )}
          </AnimatePresence>

          {/* Button content */}
          <span className="relative z-10">
            {getButtonContent()}
          </span>

          {/* Glow effect */}
          {glowEffect && !disabled && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg opacity-20 blur-sm"
              animate={{
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )}
        </Button>
      </motion.div>

      {/* Success animation overlay */}
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center bg-green-500 rounded-lg"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.6, 1] }}
            >
              <Check className="w-6 h-6 text-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating particles for special effects */}
      <AnimatePresence>
        {success && showSuccessAnimation && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * Math.PI * 2) / 6) * 30,
                  y: Math.sin((i * Math.PI * 2) / 6) * 30,
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2 w-2 h-2 bg-green-400 rounded-full pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Preset button variants for common use cases
export function PrimaryButton(props: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      className={cn(
        'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold',
        props.className
      )}
      glowEffect
      pulseOnHover
    />
  );
}

export function SecondaryButton(props: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      variant="outline"
      className={cn(
        'border-white/20 hover:border-white/40 text-white hover:bg-white/10',
        props.className
      )}
    />
  );
}

export function SuccessButton(props: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      className={cn(
        'bg-green-600 hover:bg-green-700 text-white',
        props.className
      )}
      success
      showFeedback
    />
  );
}

export function DangerButton(props: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      className={cn(
        'bg-red-600 hover:bg-red-700 text-white',
        props.className
      )}
      hapticFeedback
    />
  );
}

export function FloatingActionButton(props: EnhancedButtonProps) {
  return (
    <EnhancedButton
      {...props}
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg z-50',
        props.className
      )}
      glowEffect
      soundEffect
      hapticFeedback
    />
  );
}

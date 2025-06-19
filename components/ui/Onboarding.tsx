import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

// Onboarding Context
interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  startTour: (steps: OnboardingStep[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  endTour: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

// Onboarding Provider
interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);

  const startTour = (tourSteps: OnboardingStep[]) => {
    setSteps(tourSteps);
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    endTour();
  };

  const endTour = () => {
    setIsActive(false);
    setCurrentStep(0);
    setSteps([]);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        steps,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        endTour,
      }}
    >
      {children}
      {isActive && <OnboardingOverlay />}
    </OnboardingContext.Provider>
  );
};

// Onboarding Overlay
const OnboardingOverlay: React.FC = () => {
  const { steps, currentStep, nextStep, prevStep, skipTour } = useOnboarding();
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});

  const currentStepData = steps[currentStep];

  useEffect(() => {
    if (currentStepData?.target) {
      const element = document.querySelector(currentStepData.target) as HTMLElement;
      if (element) {
        setTargetElement(element);
        const rect = element.getBoundingClientRect();
        setHighlightStyle({
          top: rect.top - 8,
          left: rect.left - 8,
          width: rect.width + 16,
          height: rect.height + 16,
        });
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setTargetElement(null);
      setHighlightStyle({});
    }
  }, [currentStepData]);

  if (!currentStepData) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        
        {/* Highlight */}
        {targetElement && (
          <motion.div
            className="absolute border-2 border-brand-primary-400 rounded-lg shadow-glow"
            style={highlightStyle}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        
        {/* Tooltip */}
        <OnboardingTooltip />
      </motion.div>
    </AnimatePresence>
  );
};

// Onboarding Tooltip
const OnboardingTooltip: React.FC = () => {
  const { steps, currentStep, nextStep, prevStep, skipTour } = useOnboarding();
  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const getTooltipPosition = () => {
    if (!currentStepData.target) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const element = document.querySelector(currentStepData.target);
    if (!element) return {};

    const rect = element.getBoundingClientRect();
    const position = currentStepData.position || 'bottom';

    switch (position) {
      case 'top':
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: 'translate(0, -50%)',
        };
      default:
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: 'translate(-50%, 0)',
        };
    }
  };

  return (
    <motion.div
      className="absolute bg-brand-bg-medium rounded-xl shadow-2xl border border-brand-bg-light/20 p-6 max-w-sm"
      style={getTooltipPosition()}
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-brand-primary-500'
                  : index < currentStep
                  ? 'bg-brand-primary-600'
                  : 'bg-brand-bg-light'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-brand-text-muted ml-auto">
          {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold text-brand-text-primary mb-2">
        {currentStepData.title}
      </h3>
      <p className="text-brand-text-muted mb-4">
        {currentStepData.content}
      </p>

      {/* Action button */}
      {currentStepData.action && (
        <Button
          onClick={currentStepData.action.onClick}
          variant="accent"
          size="sm"
          className="mb-4 w-full"
        >
          {currentStepData.action.text}
        </Button>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={skipTour}
          variant="ghost"
          size="sm"
          className="text-brand-text-muted"
        >
          Skip Tour
        </Button>
        
        <div className="flex gap-2">
          {!isFirstStep && (
            <Button onClick={prevStep} variant="secondary" size="sm">
              Previous
            </Button>
          )}
          <Button onClick={nextStep} variant="primary" size="sm">
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Welcome Modal
interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
  title?: string;
  description?: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onStartTour,
  title = "Welcome to Solidity DevPath!",
  description = "Let's take a quick tour to help you get started with learning Solidity and blockchain development.",
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-brand-bg-medium rounded-xl shadow-2xl border border-brand-bg-light/20 max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-brand-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-bold text-brand-text-primary mb-2">
            {title}
          </h2>
          
          <p className="text-brand-text-muted mb-6">
            {description}
          </p>
          
          <div className="flex gap-3">
            <Button onClick={onClose} variant="secondary" className="flex-1">
              Skip for now
            </Button>
            <Button onClick={onStartTour} variant="primary" className="flex-1">
              Start Tour
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Help Button
interface HelpButtonProps {
  onClick: () => void;
  className?: string;
}

export const HelpButton: React.FC<HelpButtonProps> = ({ onClick, className = '' }) => (
  <Button
    onClick={onClick}
    variant="ghost"
    size="sm"
    className={`fixed bottom-6 right-6 z-40 rounded-full w-12 h-12 shadow-lg hover:shadow-glow ${className}`}
    aria-label="Help"
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </Button>
);

export default OnboardingProvider;

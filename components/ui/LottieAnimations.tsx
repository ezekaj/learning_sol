import React, { useRef, useEffect, useState } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';

// Sample Lottie animation data (you would replace these with actual animation files)
const sampleAnimations = {
  loading: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 60,
    w: 100,
    h: 100,
    nm: "Loading",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] }, { t: 60, s: [360] }] },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [40, 40] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.6, 1, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 4 }
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ],
        ip: 0,
        op: 60,
        st: 0,
        bm: 0
      }
    ]
  },
  success: {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 30,
    w: 100,
    h: 100,
    nm: "Success",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Checkmark",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [50, 50, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 1, k: [{ i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0, 0, 100] }, { t: 30, s: [100, 100, 100] }] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-15, 0], [-5, 10], [15, -10]],
                    c: false
                  }
                }
              },
              {
                ty: "st",
                c: { a: 0, k: [0.2, 0.8, 0.2, 1] },
                o: { a: 0, k: 100 },
                w: { a: 0, k: 6 },
                lc: 2,
                lj: 2
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0] },
                a: { a: 0, k: [0, 0] },
                s: { a: 0, k: [100, 100] },
                r: { a: 0, k: 0 },
                o: { a: 0, k: 100 }
              }
            ]
          }
        ],
        ip: 0,
        op: 30,
        st: 0,
        bm: 0
      }
    ]
  }
};

interface LottiePlayerProps {
  animationData?: any;
  animationUrl?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
  direction?: 1 | -1;
  onComplete?: () => void;
  onLoopComplete?: () => void;
  trigger?: 'hover' | 'click' | 'scroll' | 'auto';
}

// Basic Lottie Player Component
export const LottiePlayer: React.FC<LottiePlayerProps> = ({
  animationData,
  className = '',
  width = 100,
  height = 100,
  loop = true,
  autoplay = true,
  speed = 1,
  direction = 1,
  onComplete,
  onLoopComplete,
  trigger = 'auto'
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isPlaying, setIsPlaying] = useState(autoplay);

  useEffect(() => {
    if (!lottieRef.current) return;

    lottieRef.current.setSpeed(speed);
    lottieRef.current.setDirection(direction);

    if (trigger === 'auto' && autoplay) {
      lottieRef.current.play();
    }
  }, [speed, direction, autoplay, trigger]);

  const handleTrigger = () => {
    if (!lottieRef.current) return;

    if (trigger === 'click') {
      if (isPlaying) {
        lottieRef.current.pause();
      } else {
        lottieRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (trigger === 'hover') {
      lottieRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover' && lottieRef.current) {
      lottieRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div 
      className={`lottie-player ${className}`}
      style={{ width, height }}
      onClick={trigger === 'click' ? handleTrigger : undefined}
      onMouseEnter={trigger === 'hover' ? handleTrigger : undefined}
      onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay && trigger === 'auto'}
        onComplete={onComplete}
        onLoopComplete={onLoopComplete}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// Interactive Lottie Button
export const LottieButton: React.FC<{
  children?: React.ReactNode;
  animationData?: any;
  className?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}> = ({
  children,
  animationData,
  className = '',
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false
}) => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isAnimating) return;

    setIsAnimating(true);
    
    if (lottieRef.current) {
      lottieRef.current.play();
    }

    onClick?.();

    // Reset animation state after completion
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isAnimating}
      className={`
        relative inline-flex items-center justify-center
        rounded-lg font-medium transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {animationData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={false}
            autoplay={false}
            style={{ width: '24px', height: '24px' }}
          />
        </div>
      )}
      <span className={isAnimating ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
};

// Loading Animation Component
export const LottieLoading: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text }) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LottiePlayer
        animationData={sampleAnimations.loading}
        width={sizeMap[size].width}
        height={sizeMap[size].height}
        loop={true}
        autoplay={true}
      />
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};

// Success Animation Component
export const LottieSuccess: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
  onComplete?: () => void;
}> = ({ size = 'md', className = '', text, onComplete }) => {
  const sizeMap = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <LottiePlayer
        animationData={sampleAnimations.success}
        width={sizeMap[size].width}
        height={sizeMap[size].height}
        loop={false}
        autoplay={true}
        onComplete={onComplete}
      />
      {text && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">
          {text}
        </p>
      )}
    </div>
  );
};

// Scroll-triggered Lottie Animation
export const LottieScrollTrigger: React.FC<{
  animationData: any;
  className?: string;
  width?: number | string;
  height?: number | string;
  threshold?: number;
}> = ({ 
  animationData, 
  className = '', 
  width = 100, 
  height = 100,
  threshold = 0.5 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          lottieRef.current?.play();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, isVisible]);

  return (
    <div 
      ref={containerRef}
      className={`lottie-scroll-trigger ${className}`}
      style={{ width, height }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LottiePlayer;

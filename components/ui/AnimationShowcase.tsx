import React, { useState, useEffect } from 'react';
import { 
  GSAPTimelineAnimation, 
  GSAPTextAnimation, 
  GSAPScrollAnimation,
  GSAPMagneticButton 
} from './GSAPAnimations';
import { 
  LottiePlayer, 
  LottieButton, 
  LottieLoading, 
  LottieSuccess 
} from './LottieAnimations';
import { 
  BlockchainVisualization, 
  ParticleBackground, 
  Interactive3DCard,
  MorphingGeometry,
  SolanaVisualization 
} from './ThreeJSComponents';
import { 
  SVGLoadingSpinner, 
  SVGCheckmark, 
  SVGAnimatedArrow,
  SVGProgressRing,
  SVGWave,
  SVGBlockchainIcon,
  SVGInteractiveButton 
} from './SVGAnimations';

interface ShowcaseSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({ 
  title, 
  description, 
  children, 
  className = '' 
}) => {
  return (
    <GSAPScrollAnimation animationType="fadeUp" className={`mb-16 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </GSAPScrollAnimation>
  );
};

export const AnimationShowcase: React.FC<{ className?: string }> = ({ 
  className = '' 
}) => {
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkmarkChecked, setCheckmarkChecked] = useState(false);

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsSuccess(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Toggle checkmark every 3 seconds
    const interval = setInterval(() => {
      setCheckmarkChecked(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative min-h-screen py-16 ${className}`}>
      {/* Particle Background */}
      <ParticleBackground className="opacity-30" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <GSAPTimelineAnimation trigger="load" className="text-center mb-16">
          <div className="gsap-child">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Animation Showcase
            </h1>
          </div>
          <div className="gsap-child">
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Experience the power of GSAP, Lottie, Three.js, and SVG animations working together 
              to create immersive and engaging user experiences.
            </p>
          </div>
        </GSAPTimelineAnimation>

        {/* GSAP Animations Section */}
        <ShowcaseSection
          title="GSAP Timeline Animations"
          description="High-performance, timeline-based animations with scroll triggers and magnetic effects"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Text Animations</h4>
              <GSAPTextAnimation 
                text="Welcome to Solana Learning Platform" 
                animationType="typewriter"
                className="text-lg font-mono"
              />
              <GSAPTextAnimation 
                text="Learn Build Deploy" 
                animationType="reveal"
                className="text-xl font-bold"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Magnetic Button</h4>
              <GSAPMagneticButton 
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                strength={0.5}
              >
                Hover for Magic ✨
              </GSAPMagneticButton>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Scroll Animations</h4>
              <GSAPScrollAnimation animationType="scale">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg text-white text-center">
                  Scroll to animate me!
                </div>
              </GSAPScrollAnimation>
            </div>
          </div>
        </ShowcaseSection>

        {/* Lottie Animations Section */}
        <ShowcaseSection
          title="Lottie Vector Animations"
          description="Lightweight, scalable vector animations for loading states and interactions"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Loading</h4>
              <LottieLoading size="lg" text="Loading..." />
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Success</h4>
              {isSuccess && (
                <LottieSuccess size="lg" text="Complete!" />
              )}
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Interactive Button</h4>
              <LottieButton
                variant="primary"
                onClick={() => console.log('Lottie button clicked!')}
              >
                Click Me!
              </LottieButton>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Progress</h4>
              <div className="text-2xl font-bold text-blue-600">
                {progress}%
              </div>
            </div>
          </div>
        </ShowcaseSection>

        {/* Three.js 3D Graphics Section */}
        <ShowcaseSection
          title="Three.js 3D Graphics"
          description="Interactive 3D visualizations and immersive blockchain representations"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Blockchain Network</h4>
              <BlockchainVisualization className="rounded-lg overflow-hidden" />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Solana Tokens</h4>
              <SolanaVisualization className="rounded-lg overflow-hidden" />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Interactive 3D Card</h4>
              <Interactive3DCard title="Solana DeFi" className="rounded-lg overflow-hidden" />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">Morphing Geometry</h4>
              <MorphingGeometry className="rounded-lg overflow-hidden" />
            </div>
          </div>
        </ShowcaseSection>

        {/* SVG Animations Section */}
        <ShowcaseSection
          title="SVG Animations"
          description="Crisp, scalable vector graphics with smooth animations and interactions"
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Loading</h5>
              <SVGLoadingSpinner width={40} height={40} />
            </div>
            
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Checkmark</h5>
              <SVGCheckmark 
                width={40} 
                height={40} 
                checked={checkmarkChecked}
                color="#10b981"
              />
            </div>
            
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Arrow</h5>
              <SVGAnimatedArrow width={40} height={40} direction="right" />
            </div>
            
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Progress</h5>
              <SVGProgressRing 
                width={50} 
                height={50} 
                progress={progress}
                color="#3b82f6"
              />
            </div>
            
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Blockchain</h5>
              <SVGBlockchainIcon width={40} height={40} />
            </div>
            
            <div className="text-center space-y-2">
              <h5 className="font-medium text-sm text-gray-900 dark:text-white">Wave</h5>
              <SVGWave width={60} height={30} color="#06b6d4" />
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <SVGInteractiveButton 
              variant="primary"
              onClick={() => console.log('SVG button clicked!')}
            >
              Interactive SVG Button
            </SVGInteractiveButton>
          </div>
        </ShowcaseSection>

        {/* Performance Metrics */}
        <ShowcaseSection
          title="Performance & Optimization"
          description="All animations are optimized for 60fps performance and minimal bundle size"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">60fps</div>
              <div className="text-sm text-green-700 dark:text-green-300">Smooth Animations</div>
            </div>
            
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">GPU</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Hardware Accelerated</div>
            </div>
            
            <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">Lazy</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Code Splitting</div>
            </div>
          </div>
        </ShowcaseSection>
      </div>
    </div>
  );
};

export default AnimationShowcase;

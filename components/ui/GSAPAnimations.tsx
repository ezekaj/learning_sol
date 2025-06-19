import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, MorphSVGPlugin);

interface GSAPTimelineAnimationProps {
  children: React.ReactNode;
  className?: string;
  trigger?: 'hover' | 'scroll' | 'click' | 'load';
  duration?: number;
  delay?: number;
  ease?: string;
}

// GSAP Timeline Animation Component
export const GSAPTimelineAnimation: React.FC<GSAPTimelineAnimationProps> = ({
  children,
  className = '',
  trigger = 'load',
  duration = 1,
  delay = 0,
  ease = 'power2.out'
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline>();

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const tl = gsap.timeline({ paused: true });
    timelineRef.current = tl;

    // Create complex timeline animation
    tl.fromTo(element, 
      { 
        opacity: 0, 
        y: 50, 
        scale: 0.8,
        rotation: -10 
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotation: 0,
        duration,
        delay,
        ease 
      }
    )
    .to(element.querySelectorAll('.gsap-child'), {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: 'back.out(1.7)'
    }, '-=0.5');

    // Handle different triggers
    switch (trigger) {
      case 'load':
        tl.play();
        break;
      case 'scroll':
        ScrollTrigger.create({
          trigger: element,
          start: 'top 80%',
          onEnter: () => tl.play(),
          onLeave: () => tl.reverse(),
          onEnterBack: () => tl.play(),
          onLeaveBack: () => tl.reverse()
        });
        break;
      case 'hover':
        element.addEventListener('mouseenter', () => tl.play());
        element.addEventListener('mouseleave', () => tl.reverse());
        break;
      case 'click':
        element.addEventListener('click', () => {
          tl.isActive() ? tl.reverse() : tl.play();
        });
        break;
    }

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [trigger, duration, delay, ease]);

  return (
    <div ref={elementRef} className={`gsap-timeline-container ${className}`}>
      {children}
    </div>
  );
};

// Text Animation Component
export const GSAPTextAnimation: React.FC<{
  text: string;
  className?: string;
  animationType?: 'typewriter' | 'reveal' | 'split' | 'morph';
  speed?: number;
}> = ({ 
  text, 
  className = '', 
  animationType = 'typewriter',
  speed = 0.05 
}) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const element = textRef.current;

    switch (animationType) {
      case 'typewriter':
        gsap.to(element, {
          duration: text.length * speed,
          text: text,
          ease: 'none'
        });
        break;
      
      case 'reveal':
        element.innerHTML = text.split('').map(char => 
          `<span class="char" style="opacity: 0; transform: translateY(20px);">${char}</span>`
        ).join('');
        
        gsap.to(element.querySelectorAll('.char'), {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.02,
          ease: 'back.out(1.7)'
        });
        break;
      
      case 'split':
        element.innerHTML = text.split(' ').map(word => 
          `<span class="word" style="opacity: 0; transform: rotateX(90deg);">${word}</span>`
        ).join(' ');
        
        gsap.to(element.querySelectorAll('.word'), {
          opacity: 1,
          rotateX: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out'
        });
        break;
    }

    return () => {
      gsap.killTweensOf(element);
    };
  }, [text, animationType, speed]);

  return (
    <div 
      ref={textRef} 
      className={`gsap-text-animation ${className}`}
    />
  );
};

// Morphing Shape Component
export const GSAPMorphingShape: React.FC<{
  shapes: string[];
  className?: string;
  duration?: number;
  autoPlay?: boolean;
}> = ({ 
  shapes, 
  className = '', 
  duration = 2,
  autoPlay = true 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [currentShape, setCurrentShape] = useState(0);

  useEffect(() => {
    if (!svgRef.current || shapes.length < 2) return;

    const path = svgRef.current.querySelector('path');
    if (!path) return;

    const morphToNext = () => {
      const nextShape = (currentShape + 1) % shapes.length;
      
      gsap.to(path, {
        duration,
        morphSVG: shapes[nextShape],
        ease: 'power2.inOut',
        onComplete: () => setCurrentShape(nextShape)
      });
    };

    if (autoPlay) {
      const interval = setInterval(morphToNext, duration * 1000 + 500);
      return () => clearInterval(interval);
    }

    return () => {
      gsap.killTweensOf(path);
    };
  }, [shapes, currentShape, duration, autoPlay]);

  return (
    <svg 
      ref={svgRef}
      className={`gsap-morphing-shape ${className}`}
      viewBox="0 0 100 100"
      width="100"
      height="100"
    >
      <path
        d={shapes[0]}
        fill="currentColor"
        className="transition-colors duration-300"
      />
    </svg>
  );
};

// Scroll-triggered Animation
export const GSAPScrollAnimation: React.FC<{
  children: React.ReactNode;
  className?: string;
  animationType?: 'fadeUp' | 'slideLeft' | 'scale' | 'rotate' | 'parallax';
  start?: string;
  end?: string;
  scrub?: boolean;
}> = ({ 
  children, 
  className = '',
  animationType = 'fadeUp',
  start = 'top 80%',
  end = 'bottom 20%',
  scrub = false
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    let animation: gsap.core.Tween;

    switch (animationType) {
      case 'fadeUp':
        animation = gsap.fromTo(element, 
          { opacity: 0, y: 100 },
          { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
        );
        break;
      
      case 'slideLeft':
        animation = gsap.fromTo(element,
          { opacity: 0, x: 100 },
          { opacity: 1, x: 0, duration: 1, ease: 'power2.out' }
        );
        break;
      
      case 'scale':
        animation = gsap.fromTo(element,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)' }
        );
        break;
      
      case 'rotate':
        animation = gsap.fromTo(element,
          { opacity: 0, rotation: 180 },
          { opacity: 1, rotation: 0, duration: 1, ease: 'power2.out' }
        );
        break;
      
      case 'parallax':
        animation = gsap.to(element, {
          y: -100,
          ease: 'none'
        });
        break;
    }

    ScrollTrigger.create({
      trigger: element,
      start,
      end,
      animation,
      scrub: scrub ? 1 : false,
      toggleActions: scrub ? undefined : 'play none none reverse'
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animationType, start, end, scrub]);

  return (
    <div ref={elementRef} className={`gsap-scroll-animation ${className}`}>
      {children}
    </div>
  );
};

// Magnetic Button Effect
export const GSAPMagneticButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  strength?: number;
}> = ({ children, className = '', strength = 0.3 }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!buttonRef.current) return;

    const button = buttonRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(button, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(button);
    };
  }, [strength]);

  return (
    <button 
      ref={buttonRef}
      className={`gsap-magnetic-button ${className}`}
    >
      {children}
    </button>
  );
};

export default GSAPTimelineAnimation;

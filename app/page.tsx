import { Suspense } from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { CompetitiveAnalysisSection } from '@/components/sections/CompetitiveAnalysisSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EnhancedFeaturesShowcase } from '@/components/sections/EnhancedFeaturesShowcase';
import { GamificationPreview } from '@/components/sections/GamificationPreview';
import { InteractiveDemoSection } from '@/components/sections/InteractiveDemoSection';

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
      </Suspense>

      {/* Enhanced Features Showcase */}
      <Suspense fallback={<LoadingSpinner />}>
        <EnhancedFeaturesShowcase />
      </Suspense>

      {/* Interactive Demo Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <InteractiveDemoSection />
      </Suspense>

      {/* Gamification Preview */}
      <Suspense fallback={<LoadingSpinner />}>
        <GamificationPreview />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<LoadingSpinner />}>
        <FeaturesSection />
      </Suspense>

      {/* Competitive Analysis */}
      <Suspense fallback={<LoadingSpinner />}>
        <CompetitiveAnalysisSection />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<LoadingSpinner />}>
        <TestimonialsSection />
      </Suspense>

      {/* Call to Action */}
      <Suspense fallback={<LoadingSpinner />}>
        <CTASection />
      </Suspense>
    </div>
  );
}

import { HeroSection } from '@/components/hero-section'
import { ProblemSection } from '@/components/problem-section'
import { SolutionSection } from '@/components/solution-section'
import { TrustSection } from '@/components/trust-section'
import { CTASection } from '@/components/cta-section'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <TrustSection />
      <CTASection />
    </>
  )
}
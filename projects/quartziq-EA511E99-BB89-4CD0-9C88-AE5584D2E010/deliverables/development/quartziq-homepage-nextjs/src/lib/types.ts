// Homepage Component Types
export interface HeroSectionProps {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

export interface ProblemSectionProps {
  headline: string
  statistics: StatisticItem[]
  painPoints: PainPoint[]
}

export interface SolutionSectionProps {
  headline: string
  subheadline: string
  phases: GrowthEnginePhase[]
}

export interface TrustSectionProps {
  headline: string
  guaranteeText: string
  benefits: TrustBenefit[]
}

export interface CTASectionProps {
  headline: string
  subheadline: string
  ctaText: string
  guaranteeText: string
}

// Data Structure Types
export interface StatisticItem {
  value: string
  label: string
  context: string
}

export interface PainPoint {
  title: string
  description: string
  impact: string
}

export interface GrowthEnginePhase {
  id: number
  title: string
  description: string
  features: string[]
  icon?: string
}

export interface TrustBenefit {
  title: string
  description: string
  metric?: string
}

// QuartzIQ Brand Types
export interface QuartzIQBrandColors {
  darkBlue: string
  brandBlue: string
  lightBlue: string
  white: string
  gray: string
  darkGray: string
}

export interface TrianglePattern {
  size: number
  rotation: number
  opacity: number
  delay: number
}

// Component Variants
export type ButtonVariant = 'quartziq' | 'quartziq-outline' | 'quartziq-gradient'
export type BadgeVariant = 'quartziq' | 'quartziq-outline' | 'quartziq-light'

// Analytics & Tracking
export interface ConversionMetrics {
  leadConversionRate: number
  averageResponseTime: string
  qualifiedLeadRate: number
  salesCycleReduction: string
}

export interface TargetAudience {
  role: string
  company: string
  painPoints: string[]
  psychographicTriggers: string[]
}
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  Download, 
  Calendar, 
  Clock, 
  Target,
  Zap,
  CheckCircle2
} from 'lucide-react'

export function CTASection() {
  const urgencyReasons = [
    "Q1 2025 implementation spots are filling fast",
    "Early adopters get exclusive Growth Engine features",
    "Limited onboarding capacity for complex dental sales setups"
  ]

  const guaranteePoints = [
    "90-day measurable results guarantee",
    "Free campaign optimization if goals aren't met",
    "No long-term contracts required"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-quartziq-dark-blue via-quartziq-brand-blue to-quartziq-light-blue text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-40 h-40 quartziq-triangle bg-white/5"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 quartziq-triangle bg-white/5"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 quartziq-triangle bg-yellow-400/10"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Urgency Header */}
        <div className="text-center mb-8">
          <Badge variant="quartziq-light" className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-400">
            <Clock className="w-4 h-4 mr-2" />
            Limited Q1 2025 Availability
          </Badge>
        </div>

        {/* Main CTA Content */}
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Stop Losing Sales to{' '}
              <span className="text-yellow-400">Faster</span> Competitors?
            </h2>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Don't let another qualified prospect slip away because your competitors responded first. 
              The Growth Engine framework is ready to transform your dental equipment sales.
            </p>
          </div>

          {/* Dual CTA Options */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Primary CTA */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 group hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-500 text-quartziq-dark-blue rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">
                  Schedule Your Growth Engine Strategy Session
                </h3>
                
                <p className="text-white/80 mb-6">
                  Get a personalized analysis of your current sales process and see exactly how 
                  the Growth Engine can transform your dental equipment sales.
                </p>
                
                <Button 
                  size="xl" 
                  className="w-full bg-yellow-500 text-quartziq-dark-blue hover:bg-yellow-400 font-semibold group"
                >
                  Book Your Free Strategy Session
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="mt-4 text-sm text-white/60">
                  ✓ 60-minute consultation ✓ Custom growth plan ✓ No sales pressure
                </div>
              </CardContent>
            </Card>

            {/* Secondary CTA */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 group hover:bg-white/15 transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-quartziq-light-blue text-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Download className="w-8 h-8" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4">
                  Get the Lead Conversion Guide
                </h3>
                
                <p className="text-white/80 mb-6">
                  Download our comprehensive guide: "5 Reasons Dental Leads Don't Convert 
                  (And How to Fix Them)" - based on analyzing 10,000+ dental equipment leads.
                </p>
                
                <Button 
                  variant="outline" 
                  size="xl" 
                  className="w-full border-white text-white hover:bg-white hover:text-quartziq-dark-blue group"
                >
                  Download Free Guide
                  <Download className="ml-2 w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </Button>
                
                <div className="mt-4 text-sm text-white/60">
                  ✓ 25-page guide ✓ Real case studies ✓ Instant download
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Urgency & Guarantee Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Urgency */}
            <Card className="bg-red-500/20 border-red-400/30">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 text-yellow-400 mr-3" />
                  <h4 className="text-xl font-bold">Why Act Now?</h4>
                </div>
                
                <div className="space-y-3">
                  {urgencyReasons.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <Target className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">{reason}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Guarantee */}
            <Card className="bg-green-500/20 border-green-400/30">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-400 mr-3" />
                  <h4 className="text-xl font-bold">Risk-Free Guarantee</h4>
                </div>
                
                <div className="space-y-3">
                  {guaranteePoints.map((point, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-white/90">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Urgency Message */}
          <div className="text-center mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-lg font-semibold mb-2">
                🚨 While you're reading this, your competitors are already implementing automated follow-up systems
              </p>
              <p className="text-white/80">
                Every day you wait is another day of lost leads and missed opportunities. 
                The dental equipment market is becoming more competitive—don't get left behind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
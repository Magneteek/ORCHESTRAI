import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Clock, TrendingUp, Shield } from 'lucide-react'
import { generateTrianglePattern } from '@/lib/utils'

export function HeroSection() {
  const trianglePatterns = generateTrianglePattern(6)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-quartziq-dark-blue via-quartziq-brand-blue to-quartziq-light-blue">
      {/* Animated Triangle Patterns */}
      <div className="absolute inset-0 pointer-events-none">
        {trianglePatterns.map((pattern, index) => (
          <div
            key={index}
            className="absolute quartziq-triangle bg-white/10"
            style={{
              width: `${pattern.size}px`,
              height: `${pattern.size}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: `rotate(${pattern.rotation}deg)`,
              opacity: pattern.opacity,
              animationDelay: `${pattern.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content Column */}
          <div className="text-white space-y-8 animate-fade-up">
            {/* Trust Badge */}
            <Badge variant="quartziq-light" className="w-fit">
              <Shield className="w-4 h-4 mr-2" />
              90-Day Results Guarantee
            </Badge>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Stop Losing Dental Sales to{' '}
                <span className="text-yellow-400">Competitors</span>{' '}
                with Faster Automation
              </h1>
              
              <h2 className="text-xl md:text-2xl text-quartziq-white/90 leading-relaxed">
                Transform your dental equipment sales with our proven Growth Engine framework 
                that delivers 50% more qualified leads while cutting response time from 47 hours to 5 minutes.
              </h2>
            </div>

            {/* Supporting Text */}
            <p className="text-lg text-quartziq-white/80 max-w-2xl">
              Most dental suppliers lose 79% of their marketing leads because they can't respond fast enough. 
              While you're waiting 47 hours to follow up, competitors with smart automation are closing deals in minutes.
            </p>

            {/* Key Statistics */}
            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">79%</div>
                <div className="text-sm text-quartziq-white/70">Leads Lost Without Automation</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">47hrs</div>
                <div className="text-sm text-quartziq-white/70">Average Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">5min</div>
                <div className="text-sm text-quartziq-white/70">Our Response Time</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="xl" 
                className="bg-yellow-500 text-quartziq-dark-blue hover:bg-yellow-400 font-semibold group"
              >
                Get Your Trust-to-Lead Audit (Free)
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                variant="quartziq-outline" 
                size="xl" 
                className="border-white text-white hover:bg-white hover:text-quartziq-dark-blue"
              >
                See How the Growth Engine Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-quartziq-white/60">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                5-minute response guarantee
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                90% client satisfaction rate
              </div>
            </div>
          </div>

          {/* Visual Column */}
          <div className="relative lg:block hidden">
            <div className="relative">
              {/* Dashboard Mockup Placeholder */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div className="h-4 bg-white/30 rounded w-3/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="h-20 bg-yellow-400/30 rounded-lg"></div>
                    <div className="h-20 bg-yellow-400/20 rounded-lg"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-white/25 rounded w-full"></div>
                    <div className="h-3 bg-white/20 rounded w-4/5"></div>
                    <div className="h-3 bg-white/15 rounded w-3/5"></div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-500 text-quartziq-dark-blue px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                Live Lead Alert
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                5min Response ✓
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  )
}
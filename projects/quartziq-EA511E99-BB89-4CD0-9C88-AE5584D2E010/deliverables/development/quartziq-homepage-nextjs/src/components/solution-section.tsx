import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Shield, 
  Users, 
  Target, 
  Repeat, 
  ArrowRight,
  CheckCircle,
  Cog
} from 'lucide-react'

export function SolutionSection() {
  const phases = [
    {
      id: 1,
      title: "Rapid Response Automation",
      icon: Zap,
      color: "bg-yellow-500",
      features: [
        "5-minute response guarantee to all inquiries",
        "Intelligent lead scoring for dental equipment buyers",
        "Personalized outreach based on specific product interest"
      ]
    },
    {
      id: 2,
      title: "Trust-Building Sequences",
      icon: Shield,
      color: "bg-blue-500",
      features: [
        "Industry-specific content that demonstrates deep dental market knowledge",
        "Technical education for complex products like 3D printers and scanners",
        "Social proof integration from successful dental practices"
      ]
    },
    {
      id: 3,
      title: "Stakeholder Mapping",
      icon: Users,
      color: "bg-green-500",
      features: [
        "Multi-contact nurturing for complex B2B buying committees",
        "Role-based messaging for practice owners vs. clinical staff",
        "Decision timeline acceleration through strategic touchpoints"
      ]
    },
    {
      id: 4,
      title: "Conversion Optimization",
      icon: Target,
      color: "bg-purple-500",
      features: [
        "First responder advantage positioning against competitors",
        "Objection handling specific to dental equipment purchases",
        "Urgency creation without compromising professional relationships"
      ]
    },
    {
      id: 5,
      title: "Retention & Expansion",
      icon: Repeat,
      color: "bg-red-500",
      features: [
        "Post-purchase optimization for repeat business",
        "Referral system activation within dental networks",
        "Upsell automation for complementary products"
      ]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge variant="quartziq" className="mb-4">
            <Cog className="w-4 h-4 mr-2" />
            The Solution
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-quartziq-dark-blue mb-6">
            The Growth Engine: Marketing Automation Built for{' '}
            <span className="quartziq-text-gradient">Complex Dental Sales</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Our 5-phase Growth Engine framework addresses the unique challenges of dental B2B sales cycles, 
            ensuring you never lose another qualified prospect to slow response times.
          </p>

          <div className="flex justify-center">
            <Button variant="quartziq-outline" size="lg">
              See How the Growth Engine Works
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Growth Engine Phases */}
        <div className="space-y-8">
          {phases.map((phase, index) => {
            const IconComponent = phase.icon
            const isEven = index % 2 === 0
            
            return (
              <div key={phase.id} className="relative">
                {/* Connection Line */}
                {index < phases.length - 1 && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-full h-8 w-1 bg-gradient-to-b from-quartziq-brand-blue to-quartziq-light-blue z-10"></div>
                )}
                
                <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-500">
                  <div className={`absolute top-0 left-0 w-2 h-full ${phase.color.replace('bg-', 'bg-')}`}></div>
                  
                  <CardContent className="p-8">
                    <div className={`grid lg:grid-cols-2 gap-8 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}>
                      {/* Content */}
                      <div className={!isEven ? 'lg:col-start-2' : ''}>
                        <div className="flex items-center mb-4">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${phase.color} text-white mr-4`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          
                          <div>
                            <Badge variant="quartziq-light" className="mb-2">
                              Phase {phase.id}
                            </Badge>
                            <CardTitle className="text-2xl text-quartziq-dark-blue">
                              {phase.title}
                            </CardTitle>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {phase.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-start">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Visual Element */}
                      <div className={`relative ${!isEven ? 'lg:col-start-1' : ''}`}>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 h-64 flex items-center justify-center group-hover:shadow-inner transition-all duration-500">
                          <div className="text-center">
                            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${phase.color} text-white mb-4 group-hover:scale-110 transition-transform duration-500`}>
                              <IconComponent className="w-10 h-10" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Phase Number Indicator */}
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-quartziq-brand-blue text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                          {phase.id}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-quartziq-dark-blue to-quartziq-brand-blue rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Dental Sales Process?
            </h3>
            <p className="text-xl mb-6 text-white/90">
              The Growth Engine framework is proven, tested, and ready to implement for your dental equipment business.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="xl" 
                className="bg-yellow-500 text-quartziq-dark-blue hover:bg-yellow-400 font-semibold"
              >
                Get Your Trust-to-Lead Audit (Free)
              </Button>
              
              <Button 
                variant="outline" 
                size="xl" 
                className="border-white text-white hover:bg-white hover:text-quartziq-dark-blue"
              >
                Download Growth Engine Guide
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
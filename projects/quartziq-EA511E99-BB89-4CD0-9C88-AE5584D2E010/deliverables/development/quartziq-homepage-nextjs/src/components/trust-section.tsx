import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  Star, 
  Users, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle2,
  Quote
} from 'lucide-react'

export function TrustSection() {
  const trustStats = [
    {
      value: "90%",
      label: "of clients",
      description: "see measurable lead increases within 90 days",
      icon: TrendingUp,
      color: "text-green-600"
    },
    {
      value: "50%",
      label: "average increase",
      description: "in qualified leads at 33% lower cost",
      icon: Users,
      color: "text-blue-600"
    },
    {
      value: "21x",
      label: "faster",
      description: "response times compared to manual follow-up",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      value: "100%",
      label: "specialized",
      description: "serving dental B2B suppliers exclusively",
      icon: Award,
      color: "text-purple-600"
    }
  ]

  const trustBuilders = [
    "Dental industry specialists with proven track records",
    "90% client satisfaction rate with continued partnerships",
    "Proven framework refined through hundreds of dental equipment campaigns",
    "Technical expertise in complex B2B sales automation"
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge variant="quartziq" className="mb-4">
            <Shield className="w-4 h-4 mr-2" />
            Trust & Results
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-quartziq-dark-blue mb-6">
            Why Dental Equipment Suppliers Choose{' '}
            <span className="quartziq-text-gradient">QuartzIQ</span>
          </h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-quartziq-brand-blue/20 mb-8">
            <Quote className="w-12 h-12 text-quartziq-brand-blue mx-auto mb-4" />
            <p className="text-2xl font-semibold text-quartziq-dark-blue mb-2">
              "The only marketing automation company that understands dental equipment sales cycles."
            </p>
            <p className="text-gray-600 text-lg">
              Unlike generic marketing platforms, we know the difference between selling zirconia blocks to prosthodontists 
              and 3D printers to oral surgeons. Our automation speaks your prospects' language and addresses their specific clinical needs.
            </p>
          </div>
        </div>

        {/* Trust Statistics Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustStats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className="text-center group hover:shadow-lg transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4 group-hover:bg-blue-50 transition-colors ${stat.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div className={`text-4xl font-bold mb-1 ${stat.color}`}>
                    {stat.value}
                  </div>
                  
                  <div className="font-semibold text-quartziq-dark-blue mb-2">
                    {stat.label}
                  </div>
                  
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Guarantee Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-quartziq-dark-blue to-quartziq-brand-blue text-white overflow-hidden">
            <CardContent className="p-8 relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-32 h-32 quartziq-triangle bg-white"></div>
                <div className="absolute bottom-4 left-4 w-24 h-24 quartziq-triangle bg-white"></div>
              </div>
              
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500 text-quartziq-dark-blue rounded-full mb-6">
                  <Shield className="w-10 h-10" />
                </div>
                
                <h3 className="text-3xl font-bold mb-4">
                  Our Trust-to-Lead Guarantee
                </h3>
                
                <div className="bg-yellow-500 text-quartziq-dark-blue px-8 py-4 rounded-full inline-block mb-6">
                  <span className="text-2xl font-bold">90-Day Measurable Results or Free Optimization</span>
                </div>
                
                <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                  We're so confident in the Growth Engine framework that we guarantee measurable increases 
                  in qualified leads within 90 days. If you don't see results, we'll optimize your campaigns 
                  at no additional cost.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Builders */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-quartziq-dark-blue mb-6">
              Industry Expertise You Can Trust
            </h3>
            
            <div className="space-y-4">
              {trustBuilders.map((builder, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-gray-700 text-lg">{builder}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border-l-4 border-quartziq-brand-blue">
              <p className="text-quartziq-dark-blue font-semibold text-lg mb-2">
                "We don't just do marketing automation—we understand dental equipment sales."
              </p>
              <p className="text-gray-600">
                Our team includes former dental equipment sales professionals who understand the nuances 
                of selling to practices, the importance of clinical outcomes, and the complexity of modern 
                dental purchasing decisions.
              </p>
            </div>
          </div>
          
          {/* Visual Trust Elements */}
          <div className="space-y-6">
            {/* Client Satisfaction */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400 mr-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <span className="font-semibold text-quartziq-dark-blue">4.9/5 Client Rating</span>
                </div>
                <p className="text-gray-600 mb-4">
                  "QuartzIQ transformed our lead response time and doubled our qualified leads in just 6 weeks."
                </p>
                <div className="text-sm text-gray-500">
                  - Regional Sales Manager, Major Dental Equipment Supplier
                </div>
              </CardContent>
            </Card>
            
            {/* Certification Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border text-center">
                <Award className="w-8 h-8 text-quartziq-brand-blue mx-auto mb-2" />
                <div className="text-sm font-semibold">Certified Marketing Automation</div>
              </div>
              <div className="bg-white p-4 rounded-lg border text-center">
                <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-sm font-semibold">HIPAA Compliant</div>
              </div>
            </div>
            
            {/* CTA Button */}
            <Button size="xl" variant="quartziq" className="w-full">
              Schedule Your Growth Engine Strategy Session
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
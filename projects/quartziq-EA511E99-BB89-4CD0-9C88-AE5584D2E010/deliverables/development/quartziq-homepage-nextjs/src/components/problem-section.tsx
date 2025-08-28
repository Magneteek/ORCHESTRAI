import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Clock, TrendingDown, Users, Target } from 'lucide-react'

export function ProblemSection() {
  const problemPoints = [
    {
      statistic: "79%",
      title: "of your marketing leads never convert",
      description: "without proper nurturing systems",
      icon: TrendingDown,
      color: "text-red-500"
    },
    {
      statistic: "22%",
      title: "Sales cycles have increased",
      description: "due to more stakeholders in purchasing decisions",
      icon: Users,
      color: "text-orange-500"
    },
    {
      statistic: "35-50%",
      title: "You're missing potential sales",
      description: "by not being the first to respond to inquiries",
      icon: Target,
      color: "text-yellow-600"
    },
    {
      statistic: "47hr",
      title: "Your average response time",
      description: "gives competitors a 21x conversion advantage",
      icon: Clock,
      color: "text-red-600"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <Badge variant="quartziq-outline" className="mb-4">
            <AlertTriangle className="w-4 h-4 mr-2" />
            The Reality Check
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-bold text-quartziq-dark-blue mb-6">
            Why Are You Losing Dental Sales to{' '}
            <span className="text-red-600">Less Qualified</span> Competitors?
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            The harsh reality facing dental equipment suppliers today:
          </p>
        </div>

        {/* Problem Points Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {problemPoints.map((problem, index) => {
            const IconComponent = problem.icon
            return (
              <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4 group-hover:bg-red-50 transition-colors ${problem.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div className={`text-3xl font-bold mb-2 ${problem.color}`}>
                    {problem.statistic}
                  </div>
                  
                  <h3 className="font-semibold text-quartziq-dark-blue mb-2">
                    {problem.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm">
                    {problem.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Agitation Content */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <CardContent className="p-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold text-quartziq-dark-blue mb-4">
                    Every Hour You Wait is Another Lost Opportunity
                  </h3>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    Every hour you wait to respond is another opportunity for competitors to steal your prospects. 
                    While you're manually sorting through leads, automated systems are building trust, answering 
                    technical questions, and moving buyers toward decisions.
                  </p>
                  
                  <div className="bg-white/80 p-4 rounded-lg border-l-4 border-red-500">
                    <p className="font-semibold text-quartziq-dark-blue">
                      The suppliers winning aren't necessarily better—they're just faster and smarter with their follow-up.
                    </p>
                  </div>
                </div>
                
                {/* Visual Element */}
                <div className="relative">
                  <div className="bg-white rounded-lg p-6 shadow-md">
                    <div className="text-center mb-4">
                      <div className="text-sm text-gray-500 mb-2">Your Competition Timeline</div>
                      <div className="flex justify-between items-center">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="text-xs text-gray-500">You</div>
                          <div className="font-bold text-red-600">47 hrs</div>
                        </div>
                        
                        <div className="flex-1 mx-4">
                          <div className="h-1 bg-gradient-to-r from-red-200 to-green-200 rounded"></div>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                            <Target className="w-6 h-6" />
                          </div>
                          <div className="text-xs text-gray-500">Competitor</div>
                          <div className="font-bold text-green-600">5 min</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Badge variant="destructive" className="text-xs">
                        21x Conversion Advantage
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Context */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Complex dental sales require specialized nurturing that generic marketing automation can't handle. 
            Your prospects need technical expertise, clinical validation, and trust-building—not generic email templates.
          </p>
        </div>
      </div>
    </section>
  )
}
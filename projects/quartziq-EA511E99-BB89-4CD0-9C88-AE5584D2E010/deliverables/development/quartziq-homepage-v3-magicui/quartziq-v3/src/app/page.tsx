import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"
import { Particles } from "@/components/magicui/particles"
import { Ripple } from "@/components/magicui/ripple"
import { DotPattern } from "@/components/magicui/dot-pattern"
import Image from "next/image"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Particles 
        className="fixed inset-0 -z-10"
        quantity={100}
        ease={80}
        color="#1A2944"
        refresh
      />

      {/* Header/Navigation Section */}
      <header className="relative bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center">
              <Image 
                src="/assets/logo-icon.svg" 
                alt="QuartzIQ Logo" 
                width={40}
                height={40}
                className="h-10 w-10"
              />
              <span className="ml-3 text-xl font-bold text-gray-900">QuartzIQ</span>
            </div>
            
            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-blue-600 font-medium">Services</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
              <a href="#resources" className="text-gray-700 hover:text-blue-600 font-medium">Resources</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 font-medium">Contact</a>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white">
                Free Growth Audit
              </Button>
            </nav>
            
            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            {/* Orbiting Animation */}
            <div className="relative flex h-[200px] w-full flex-col items-center justify-center overflow-hidden">
              <OrbitingCircles
                className="size-[30px] border-none bg-transparent"
                duration={20}
                delay={20}
                radius={80}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[30px] border-none bg-transparent"
                duration={20}
                delay={10}
                radius={80}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-green-800 text-white shadow-lg">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[40px] border-none bg-transparent"
                radius={120}
                duration={30}
                reverse
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
              </OrbitingCircles>
              <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={150}
                duration={25}
                delay={15}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-orange-800 text-white shadow-lg">
                  <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </OrbitingCircles>
              
              {/* Central Logo/Icon */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-900 to-blue-700 shadow-xl">
                <Image 
                  src="/assets/logo-icon.svg" 
                  alt="QuartzIQ Logo" 
                  width={40}
                  height={40}
                  className="h-10 w-10 invert"
                />
              </div>
            </div>

            <Badge variant="outline" className="mb-6 border-blue-200 text-blue-800">
              Marketing Automation for Dental B2B
            </Badge>
            
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Stop Losing Dental Sales to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Competitors
              </span>{' '}
              with Faster Automation
            </h1>
            
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Transform your dental equipment sales with AI-powered marketing automation 
              that builds trust, shortens complex sales cycles, and converts 50% more leads at 33% lower cost.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="relative">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-8 py-3 relative overflow-hidden">
                  Get Free Dental Marketing Audit
                  <Ripple className="absolute inset-0" />
                </Button>
              </div>
              <Button variant="outline" size="lg" className="px-8 py-3 border-blue-200 text-blue-800 hover:bg-blue-50">
                See Growth Engine Demo
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-x-8 text-sm text-gray-500">
              <div className="flex items-center gap-x-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>90-Day Guarantee</span>
              </div>
              <div className="flex items-center gap-x-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Dental Industry Experts</span>
              </div>
              <div className="flex items-center gap-x-2">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No Setup Required</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Agitation Section - Expanded to 5 Problems */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <DotPattern 
          className="absolute inset-0 opacity-20"
          width={20}
          height={20}
          cx={1}
          cy={1}
          cr={1}
        />
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Are You Losing 79% of Your Dental Leads?
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Most dental equipment suppliers are hemorrhaging qualified prospects because they lack the 
              specialized automation systems needed for complex B2B dental sales cycles.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <Card className="relative overflow-hidden border-red-100 bg-gradient-to-br from-red-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                  <Badge variant="destructive">79% Lost</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Leads Never Convert
                </h3>
                <p className="text-gray-600 text-sm">
                  Without proper nurturing systems, the majority of qualified dental leads go cold 
                  and never become customers, regardless of how much you spent to acquire them.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-orange-100 bg-gradient-to-br from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                    <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <Badge variant="outline" className="border-orange-200 text-orange-800">22% Longer</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sales Cycles Extended
                </h3>
                <p className="text-gray-600 text-sm">
                  Dental equipment sales cycles have increased 22% due to more stakeholders, 
                  but most suppliers still use manual follow-up processes that can&apos;t keep pace.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-purple-100 bg-gradient-to-br from-purple-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <Badge variant="outline" className="border-purple-200 text-purple-800">50% Advantage</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  First Response Wins
                </h3>
                <p className="text-gray-600 text-sm">
                  35-50% of dental equipment sales go to whoever responds first to inquiries, 
                  but manual processes make rapid response nearly impossible to maintain.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <Badge variant="outline" className="border-indigo-200 text-indigo-800">Multiple Buyers</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Complex Stakeholder Management
                </h3>
                <p className="text-gray-600 text-sm">
                  Modern dental practices involve 3-5 decision makers, but most suppliers still pitch to single contacts, 
                  missing critical influencers in the buying process.
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-teal-100 bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
                    <svg className="h-6 w-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <Badge variant="outline" className="border-teal-200 text-teal-800">Trust Deficit</Badge>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Trust Before Transaction
                </h3>
                <p className="text-gray-600 text-sm">
                  Dental professionals need extensive trust-building before major equipment purchases, 
                  but generic sales approaches fail to establish credibility early.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-200 text-blue-800">
              The QuartzIQ Growth Engine
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              AI-Enhanced Automation Built for{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Complex Dental Sales
              </span>
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our proven 5-phase system transforms dental suppliers into trusted industry leaders 
              with automated sequences that build relationships and accelerate decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 mb-16">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Foundation & Discovery</h3>
                <p className="text-sm text-gray-600">Deep dive into your dental market position and customer psychology</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Message Architecture</h3>
                <p className="text-sm text-gray-600">Craft trust-building messaging that resonates with dental professionals</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Automation Design</h3>
                <p className="text-sm text-gray-600">Build intelligent sequences for complex dental equipment sales cycles</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-600 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">4</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Channel Activation</h3>
                <p className="text-sm text-gray-600">Launch across channels where dental professionals make decisions</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">5</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Optimization</h3>
                <p className="text-sm text-gray-600">Continuous improvement based on dental industry performance data</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-full px-8 py-4 border border-green-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Trust-to-Lead Guarantee</p>
                <p className="text-sm text-gray-600">90-day measurable increase in qualified leads or free optimization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Statistics Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Trusted by Leading Dental Equipment Suppliers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our specialized approach delivers measurable results for dental B2B companies across North America and Europe.
            </p>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
              <div className="text-sm text-gray-600 font-medium">Faster Response Time</div>
              <div className="text-xs text-gray-500">First responder advantage</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">3.2x</div>
              <div className="text-sm text-gray-600 font-medium">More Qualified Leads</div>
              <div className="text-xs text-gray-500">Converting at higher rates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">65%</div>
              <div className="text-sm text-gray-600 font-medium">Shorter Sales Cycles</div>
              <div className="text-xs text-gray-500">Faster deal closure</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">42%</div>
              <div className="text-sm text-gray-600 font-medium">Lower Cost Per Lead</div>
              <div className="text-xs text-gray-500">More efficient spending</div>
            </div>
          </div>

          {/* Client Testimonials */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <Card className="bg-white border-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">DM</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Dr. Michael Chen</p>
                    <p className="text-sm text-gray-600">Practice Owner, Seattle</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &ldquo;QuartzIQ understands the dental buying process. Their automated sequences feel personal and build trust before we ever talk about equipment.&rdquo;
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">SM</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Sarah Martinez</p>
                    <p className="text-sm text-gray-600">VP Sales, DentalTech Solutions</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &ldquo;We&apos;ve increased our qualified lead volume by 280% since implementing QuartzIQ&apos;s dental-specific automation system.&rdquo;
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-lg">RK</span>
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900">Robert Kim</p>
                    <p className="text-sm text-gray-600">Marketing Director, EuroMed Dental</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm italic">
                  &ldquo;The ROI tracking is incredible. We can see exactly which automated sequences drive the highest-value dental leads.&rdquo;
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits & Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Dominate Dental Equipment Sales
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Built specifically for the complexities of B2B dental sales cycles and stakeholder management.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3 mb-16">
            <div className="text-center lg:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-800 mx-auto lg:mx-0 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Lightning-Fast Response Automation
              </h3>
              <p className="text-gray-600 mb-4">
                Automatically respond to dental inquiries within minutes, not hours. Capture the critical first-responder advantage that wins 35-50% of deals.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Instant acknowledgment sequences
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Smart lead qualification
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Multi-channel coordination
                </li>
              </ul>
            </div>

            <div className="text-center lg:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-green-600 to-green-800 mx-auto lg:mx-0 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Multi-Stakeholder Intelligence
              </h3>
              <p className="text-gray-600 mb-4">
                Navigate complex dental practice hierarchies with automated sequences targeting practice owners, office managers, and key decision influencers simultaneously.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Role-specific messaging
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Decision influence mapping
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Coordinated touchpoints
                </li>
              </ul>
            </div>

            <div className="text-center lg:text-left">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-800 mx-auto lg:mx-0 mb-6">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Advanced ROI Tracking & Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Get detailed insights into which campaigns, messages, and sequences drive the highest-value dental leads and fastest conversions.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Real-time performance dashboards
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Lead source attribution
                </li>
                <li className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Conversion optimization insights
                </li>
              </ul>
            </div>
          </div>

          {/* Technical Features Grid */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
              Technical Capabilities Built for Dental B2B
            </h3>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Email Automation</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-green-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">SMS Sequences</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Content Personalization</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Analytics Dashboard</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-red-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Lead Scoring</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-teal-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">CRM Integration</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Automated Scheduling</div>
              </div>
              <div className="text-center">
                <div className="h-10 w-10 mx-auto mb-3 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Compliance Tracking</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Elements Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            {/* Trust-to-Lead Guarantee - Featured */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-12 border border-green-200 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-gradient-to-r from-green-600 to-blue-600 flex items-center justify-center">
                  <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Trust-to-Lead Guarantee
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                We guarantee measurable improvement in your qualified dental lead generation within 90 days, or we&apos;ll optimize your system for free until you see results.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-green-600 mb-2">90</div>
                  <div className="text-sm text-gray-600">Day Performance Window</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                  <div className="text-sm text-gray-600">Money Back if No Results</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                  <div className="text-sm text-gray-600">Support & Optimization</div>
                </div>
              </div>
            </div>

            {/* Authority Indicators */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="bg-white border-blue-100">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6m-6 4h6m-6 4h6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Dental Industry Certified</h3>
                  <p className="text-sm text-gray-600">
                    Certified specialists with deep knowledge of dental equipment sales cycles and practice management software integrations.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-green-100">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Proven Track Record</h3>
                  <p className="text-sm text-gray-600">
                    Over 500 successful dental equipment supplier campaigns with an average 3.2x improvement in qualified lead generation.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border-purple-100">
                <CardContent className="p-6 text-center">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">HIPAA Compliant Systems</h3>
                  <p className="text-sm text-gray-600">
                    All automation systems meet healthcare data protection requirements with encrypted communications and secure data handling.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Risk Reversal Elements */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                Zero Risk, Maximum Results
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">No Long-Term Contracts</h4>
                    <p className="text-sm text-gray-600">Month-to-month service with complete flexibility to scale or cancel.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Free Implementation</h4>
                    <p className="text-sm text-gray-600">Complete setup and integration at no additional cost.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Dedicated Success Manager</h4>
                    <p className="text-sm text-gray-600">Personal point of contact for optimization and support.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-1">
                    <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Complete Data Ownership</h4>
                    <p className="text-sm text-gray-600">All leads, data, and automations belong to you, always.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Don&apos;t Let Another Qualified Dental Lead Slip Away
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Every day you delay, competitors with better automation are capturing the leads you should be winning. 
              The dental industry moves fast - your response time needs to be faster.
            </p>

            {/* Urgency Elements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-2xl font-bold text-yellow-400 mb-2">79%</div>
                <div className="text-white text-sm">Of your leads never convert without proper automation</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-2xl font-bold text-red-400 mb-2">35-50%</div>
                <div className="text-white text-sm">Of deals go to first responders - are you first?</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-2xl font-bold text-green-400 mb-2">22%</div>
                <div className="text-white text-sm">Longer sales cycles mean more opportunities to lose</div>
              </div>
            </div>

            {/* Multiple Conversion Opportunities */}
            <div className="space-y-6">
              <div>
                <div className="relative inline-block mr-4">
                  <Button size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-8 py-4 text-lg font-semibold relative overflow-hidden">
                    Get Free Dental Marketing Audit Now
                    <Ripple className="absolute inset-0" />
                  </Button>
                </div>
                <div className="relative inline-block">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg relative overflow-hidden">
                    Download Lead Generation Blueprint
                    <Ripple className="absolute inset-0" />
                  </Button>
                </div>
              </div>
              
              <div className="text-blue-200 text-sm">
                <p className="mb-2">🎯 Free comprehensive analysis of your current lead generation</p>
                <p className="mb-2">📊 Custom automation roadmap for your dental market</p>
                <p>⚡ Implementation can start within 48 hours</p>
              </div>
            </div>

            {/* Lead Magnets */}
            <div className="mt-12 pt-12 border-t border-blue-800">
              <h3 className="text-xl font-semibold text-white mb-6">
                Free Resources for Dental Equipment Suppliers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white p-4 h-auto">
                  <div className="text-left">
                    <div className="font-semibold">The Dental Sales Automation Playbook</div>
                    <div className="text-sm opacity-75">Step-by-step guide to automated lead nurturing</div>
                  </div>
                </Button>
                <Button variant="outline" className="border-blue-400 text-blue-100 hover:bg-blue-800 hover:text-white p-4 h-auto">
                  <div className="text-left">
                    <div className="font-semibold">First Responder Advantage Calculator</div>
                    <div className="text-sm opacity-75">See how much faster response times increase sales</div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpolygon points='36,34 22,34 22,26 36,26'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Stop Losing Dental Sales to Competitors?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join successful dental suppliers who&apos;ve transformed their sales with our AI-enhanced automation system. 
              Get your free audit and see exactly how we&apos;ll grow your business.
            </p>
            
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <div className="relative">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 px-8 py-3 relative overflow-hidden font-semibold">
                  Get Your Free Dental Marketing Audit
                  <Ripple className="absolute inset-0" />
                </Button>
              </div>
            </div>

            <div className="mt-8 text-center text-blue-200 text-sm">
              <p>✓ No obligation • ✓ Results in 7 days • ✓ Dental industry experts only</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Information */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <Image 
                  src="/assets/logo-icon.svg" 
                  alt="QuartzIQ Logo" 
                  width={40}
                  height={40}
                  className="h-10 w-10 invert"
                />
                <span className="ml-3 text-2xl font-bold text-white">QuartzIQ</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Specialized marketing automation for dental equipment suppliers. We help B2B dental companies 
                transform prospects into customers with AI-enhanced automation systems designed for complex sales cycles.
              </p>
              <div className="space-y-2">
                <div className="flex items-center text-gray-300">
                  <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  hello@quartziq.com
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +1 (555) 123-DENTAL
                </div>
                <div className="flex items-center text-gray-300">
                  <svg className="h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  North America & Europe
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-6" id="services">Services</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Marketing Automation</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Lead Nurturing Systems</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Sales Cycle Optimization</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Multi-Stakeholder Campaigns</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">ROI Analytics</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">HIPAA Compliance</a></li>
              </ul>
            </div>

            {/* Resources & Support */}
            <div>
              <h3 className="text-lg font-semibold mb-6" id="resources">Resources</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Dental Sales Playbook</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">First Response Calculator</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">ROI Calculator</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Implementation Guide</a></li>
                <li><a href="#contact" className="hover:text-blue-400 transition-colors">Support Center</a></li>
              </ul>
            </div>
          </div>

          {/* Trust & Compliance Indicators */}
          <div className="border-t border-gray-800 pt-12 mt-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-12">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 font-medium">HIPAA Compliant</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-green-900 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h4M9 7h6m-6 4h6m-6 4h6" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 font-medium">Industry Certified</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-purple-900 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 font-medium">Proven Results</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 rounded-full bg-yellow-900 flex items-center justify-center mb-3">
                  <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-sm text-gray-300 font-medium">24/7 Support</div>
              </div>
            </div>

            {/* Social Proof Footer */}
            <div className="text-center mb-8">
              <p className="text-gray-400 text-sm mb-4">
                Trusted by leading dental equipment suppliers across North America and Europe
              </p>
              <div className="flex justify-center items-center space-x-8 text-gray-500">
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm">Successful<br/>Campaigns</div>
                <div className="h-8 w-px bg-gray-700"></div>
                <div className="text-2xl font-bold">3.2x</div>
                <div className="text-sm">Average Lead<br/>Improvement</div>
                <div className="h-8 w-px bg-gray-700"></div>
                <div className="text-2xl font-bold">90%</div>
                <div className="text-sm">Client Success<br/>Rate</div>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 QuartzIQ. All rights reserved. | <a href="#" className="hover:text-blue-400">Privacy Policy</a> | <a href="#" className="hover:text-blue-400">Terms of Service</a>
            </div>
            
            {/* Final CTA */}
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm font-medium">Ready to grow?</span>
              <Button className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white px-4 py-2 text-sm">
                Get Free Audit
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

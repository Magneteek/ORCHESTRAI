/**
 * ORCHESTRAI MagicUI Component Library - Standard Templates
 * Professional animated components for dental industry websites
 * Integrates MagicUI with Tailwind CSS v4 and dental industry color palette
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ===============================
// ORCHESTRAI DENTAL HERO COMPONENTS
// ===============================

/**
 * Dental Practice Hero Section with Particle Background
 * Features: Blur fade animations, particle effects, glassmorphism
 */
export function DentalHeroSection({ 
  title, 
  subtitle, 
  ctaText = "Schedule Consultation",
  backgroundImage,
  particleCount = 50 
}: {
  title: string;
  subtitle: string;
  ctaText?: string;
  backgroundImage?: string;
  particleCount?: number;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0">
        <Particles
          className="absolute inset-0"
          quantity={particleCount}
          ease={80}
          color="#0ea5e9"
          refresh
        />
      </div>
      
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <BlurFade delay={0.2} inView>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            {title}
          </h1>
        </BlurFade>
        
        <BlurFade delay={0.4} inView>
          <p className="text-xl md:text-2xl text-dental-blue-100 mb-8 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </BlurFade>
        
        <BlurFade delay={0.6} inView>
          <button className="glass hover:glass-hover transition-all duration-300 px-8 py-4 rounded-2xl text-lg font-semibold text-white border border-dental-blue-300/30">
            {ctaText}
            <ChevronRight className="ml-2 h-5 w-5 inline" />
          </button>
        </BlurFade>
      </div>
    </section>
  );
}

/**
 * Dental Service Cards with Border Beam Animation
 * Features: Glassmorphism cards, animated borders, hover effects
 */
export function DentalServiceCards({ services }: { services: Array<{
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}> }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-8">
      {services.map((service, index) => (
        <BlurFade key={index} delay={0.2 + index * 0.1} inView>
          <div className="relative glass rounded-3xl p-8 hover:glass-hover transition-all duration-500 group">
            <BorderBeam size={250} duration={12} delay={index * 2} />
            
            {/* Service Icon */}
            <div className="text-dental-blue-500 mb-6 transform group-hover:scale-110 transition-transform duration-300">
              {service.icon}
            </div>
            
            {/* Service Title */}
            <h3 className="text-2xl font-bold text-white mb-4">
              {service.title}
            </h3>
            
            {/* Service Description */}
            <p className="text-dental-blue-100 mb-6 leading-relaxed">
              {service.description}
            </p>
            
            {/* Service Features */}
            <ul className="space-y-2">
              {service.features.map((feature, idx) => (
                <li key={idx} className="flex items-center text-dental-blue-200">
                  <Check className="h-4 w-4 text-dental-success mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </BlurFade>
      ))}
    </div>
  );
}

/**
 * Dental Equipment Showcase with Marquee
 * Features: Smooth scrolling marquee, equipment cards, hover effects
 */
export function DentalEquipmentMarquee({ equipment }: { equipment: Array<{
  name: string;
  image: string;
  category: string;
  description: string;
}> }) {
  return (
    <section className="py-20 overflow-hidden">
      <div className="text-center mb-16">
        <BlurFade delay={0.2} inView>
          <h2 className="text-5xl font-bold text-white mb-4">
            State-of-the-Art Equipment
          </h2>
          <p className="text-xl text-dental-blue-100 max-w-2xl mx-auto">
            Professional dental technology for superior patient care
          </p>
        </BlurFade>
      </div>
      
      <Marquee pauseOnHover className="[--duration:25s]">
        {equipment.map((item, index) => (
          <div key={index} className="mx-4">
            <div className="glass rounded-2xl p-6 w-80 hover:glass-hover transition-all duration-300 group">
              <div className="aspect-video rounded-xl overflow-hidden mb-4">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="text-center">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-dental-blue-500/20 text-dental-blue-300 mb-3">
                  {item.category}
                </span>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  {item.name}
                </h3>
                
                <p className="text-dental-blue-100 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/**
 * Interactive Dental Tools Dock
 * Features: Animated dock interface, tool categories, smooth interactions
 */
export function DentalToolsDock({ tools }: { tools: Array<{
  name: string;
  icon: React.ReactNode;
  category: string;
  onClick: () => void;
}> }) {
  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <BlurFade delay={0.2} inView>
          <h2 className="text-5xl font-bold text-white mb-4">
            Digital Dental Solutions
          </h2>
          <p className="text-xl text-dental-blue-100">
            Explore our comprehensive dental software suite
          </p>
        </BlurFade>
      </div>
      
      <div className="flex justify-center">
        <Dock direction="middle" className="glass rounded-2xl">
          {tools.map((tool, index) => (
            <DockIcon key={index} onClick={tool.onClick}>
              <div className="group relative">
                {tool.icon}
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                  {tool.name}
                </div>
              </div>
            </DockIcon>
          ))}
        </Dock>
      </div>
    </section>
  );
}

/**
 * Animated Statistics Counter
 * Features: Number counting animation, dental practice metrics
 */
export function DentalStatsSection({ stats }: { stats: Array<{
  number: number;
  label: string;
  suffix?: string;
  prefix?: string;
}> }) {
  return (
    <section className="py-20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
        {stats.map((stat, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.1} inView>
            <div className="text-center glass rounded-2xl p-8">
              <NumberTicker 
                value={stat.number} 
                className="text-4xl md:text-5xl font-bold text-dental-blue-400 mb-2"
              />
              {stat.suffix && (
                <span className="text-4xl md:text-5xl font-bold text-dental-blue-400">
                  {stat.suffix}
                </span>
              )}
              <p className="text-dental-blue-100 font-medium">
                {stat.label}
              </p>
            </div>
          </BlurFade>
        ))}
      </div>
    </section>
  );
}

/**
 * Dental Testimonials with Animated List
 * Features: Smooth testimonial transitions, patient review animations
 */
export function DentalTestimonialsSection({ testimonials }: { testimonials: Array<{
  name: string;
  rating: number;
  review: string;
  treatment: string;
  avatar?: string;
}> }) {
  return (
    <section className="py-20">
      <div className="text-center mb-16">
        <BlurFade delay={0.2} inView>
          <h2 className="text-5xl font-bold text-white mb-4">
            Patient Success Stories
          </h2>
          <p className="text-xl text-dental-blue-100 max-w-2xl mx-auto">
            Real experiences from our valued patients
          </p>
        </BlurFade>
      </div>
      
      <div className="max-w-4xl mx-auto px-4">
        <AnimatedList>
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass rounded-2xl p-8 mb-6">
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {testimonial.avatar ? (
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-dental-blue-500/20 flex items-center justify-center text-dental-blue-400 font-bold text-xl">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Review Content */}
                <div className="flex-1">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "h-5 w-5",
                          i < testimonial.rating 
                            ? "text-yellow-400 fill-yellow-400" 
                            : "text-gray-400"
                        )}
                      />
                    ))}
                  </div>
                  
                  {/* Review Text */}
                  <p className="text-white text-lg leading-relaxed mb-4">
                    "{testimonial.review}"
                  </p>
                  
                  {/* Patient Info */}
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-dental-blue-300">
                        {testimonial.name}
                      </p>
                      <p className="text-dental-blue-400 text-sm">
                        {testimonial.treatment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </AnimatedList>
      </div>
    </section>
  );
}

// ===============================
// UTILITY COMPONENTS
// ===============================

/**
 * Particle Field Background Component
 * Compatible with Tailwind v4 custom properties
 */
const Particles = ({ 
  className, 
  quantity = 50, 
  ease = 50, 
  color = "#ffffff", 
  refresh = false 
}: {
  className?: string;
  quantity?: number;
  ease?: number;
  color?: string;
  refresh?: boolean;
}) => {
  // Implementation would use MagicUI Particles component
  return <div className={className} />;
};

/**
 * Blur Fade Animation Component
 * Provides smooth entrance animations
 */
const BlurFade = ({ 
  children, 
  delay = 0, 
  inView = false 
}: {
  children: React.ReactNode;
  delay?: number;
  inView?: boolean;
}) => {
  // Implementation would use MagicUI BlurFade component
  return <div>{children}</div>;
};

/**
 * Border Beam Animation Component
 * Creates animated glowing borders
 */
const BorderBeam = ({ 
  size = 200, 
  duration = 15, 
  delay = 0 
}: {
  size?: number;
  duration?: number;
  delay?: number;
}) => {
  // Implementation would use MagicUI BorderBeam component
  return <div className="absolute inset-0 rounded-3xl" />;
};

/**
 * Marquee Scrolling Component
 * Smooth infinite scrolling
 */
const Marquee = ({ 
  children, 
  pauseOnHover = false, 
  className 
}: {
  children: React.ReactNode;
  pauseOnHover?: boolean;
  className?: string;
}) => {
  // Implementation would use MagicUI Marquee component
  return <div className={className}>{children}</div>;
};

/**
 * Interactive Dock Component
 * macOS-style dock interface
 */
const Dock = ({ 
  children, 
  direction = "middle", 
  className 
}: {
  children: React.ReactNode;
  direction?: "top" | "middle" | "bottom";
  className?: string;
}) => {
  // Implementation would use MagicUI Dock component
  return <div className={cn("flex gap-2 p-2", className)}>{children}</div>;
};

const DockIcon = ({ 
  children, 
  onClick 
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  // Implementation would use MagicUI DockIcon component
  return (
    <button 
      className="p-3 rounded-xl hover:bg-white/10 transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </button>
  );
};

/**
 * Number Ticker Animation Component
 * Animated number counting
 */
const NumberTicker = ({ 
  value, 
  className 
}: {
  value: number;
  className?: string;
}) => {
  // Implementation would use MagicUI NumberTicker component
  return <span className={className}>{value}</span>;
};

/**
 * Animated List Component
 * Staggered list animations
 */
const AnimatedList = ({ 
  children 
}: {
  children: React.ReactNode;
}) => {
  // Implementation would use MagicUI AnimatedList component
  return <div className="space-y-4">{children}</div>;
};

// Icon placeholders (would import from lucide-react)
const ChevronRight = ({ className }: { className?: string }) => <div className={className} />;
const Check = ({ className }: { className?: string }) => <div className={className} />;
const Star = ({ className }: { className?: string }) => <div className={className} />;

export {
  DentalHeroSection,
  DentalServiceCards,
  DentalEquipmentMarquee,
  DentalToolsDock,
  DentalStatsSection,
  DentalTestimonialsSection
};
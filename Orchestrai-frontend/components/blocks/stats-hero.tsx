"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { renderCanvas } from "@/components/ui/canvas"
import { ArrowRight } from "lucide-react"

interface StatItem {
  value: number
  suffix: string
  label: string
  prefix?: string
}

const stats: StatItem[] = [
  { value: 50, suffix: "+", label: "Active Agents", prefix: "" },
  { value: 10000, suffix: "+", label: "Tasks Completed", prefix: "" },
  { value: 99, suffix: "%", label: "System Uptime", prefix: "" },
  { value: 45, suffix: "%", label: "Faster Resolution", prefix: "" },
]

export function StatsHero() {
  const [animatedStats, setAnimatedStats] = useState(
    stats.map(() => 0)
  )

  useEffect(() => {
    // Initialize canvas animation
    renderCanvas()

    // Animate numbers
    stats.forEach((stat, index) => {
      const duration = 2000 // 2 seconds
      const steps = 60
      const increment = stat.value / steps
      let current = 0

      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }
        setAnimatedStats(prev => {
          const newStats = [...prev]
          newStats[index] = Math.floor(current)
          return newStats
        })
      }, duration / steps)
    })
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Hero Content */}
      <div className="animation-delay-8 animate-fadeIn flex flex-col items-center justify-center px-4 text-center z-10">
        {/* Badge */}
        <div className="z-10 mb-6 mt-10 sm:justify-center md:mb-4 md:mt-20">
          <div className="relative flex items-center whitespace-nowrap rounded-full border bg-popover px-3 py-1 text-xs leading-6 text-primary/60">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Crystalline Memory Architecture Active
          </div>
        </div>

        {/* Main Title */}
        <div className="mb-10 mt-4 md:mt-6">
          <div className="px-2">
            <div className="relative mx-auto h-full max-w-7xl border border-primary/20 p-6 rounded-2xl backdrop-blur-sm bg-background/50 [mask-image:radial-gradient(800rem_96rem_at_center,white,transparent)] md:px-12 md:py-20">
              <h1 className="flex select-none flex-col px-3 py-2 text-center text-5xl font-semibold leading-none tracking-tight md:flex-col md:text-8xl lg:text-8xl">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ORCHESTRAI
                </span>
                <span className="text-3xl md:text-5xl mt-4 text-muted-foreground">
                  Advanced Multi-Agent System
                </span>
              </h1>
              <div className="flex items-center justify-center gap-1 mt-4">
                <span className="relative flex h-3 w-3 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </span>
                <p className="text-xs text-green-500">Available Now</p>
              </div>
            </div>
          </div>

          <p className="md:text-md mx-auto mb-12 mt-8 max-w-2xl px-6 text-sm text-primary/60 sm:px-6 md:max-w-4xl md:px-20 lg:text-lg">
            Leverage crystalline memory architecture, pipeline sharing, and geometric orchestration
            for unprecedented AI coordination and performance.
          </p>

          {/* Animated Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group p-6 rounded-xl border border-primary/20 bg-background/30 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.prefix}{animatedStats[index]}{stat.suffix}
                </div>
                <div className="text-sm mt-2 text-muted-foreground font-medium">
                  {stat.label}
                </div>
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-blue-600/10 to-purple-600/10 -z-10 blur-xl" />
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <Button size="lg" className="group">
              Start Project
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
          </div>
        </div>
      </div>

      {/* Splash Canvas Background */}
      <canvas
        className="pointer-events-none absolute inset-0 mx-auto"
        id="canvas"
      ></canvas>
    </section>
  )
}

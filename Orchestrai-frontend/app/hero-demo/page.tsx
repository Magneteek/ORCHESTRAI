import { HeroDemo1, HeroDemo2, HeroDemo3 } from "@/components/blocks/hero-gallery-demos"

export default function HeroDemoPage() {
  return (
    <main className="min-h-screen">
      {/* Demo 1: Default 5-cell bento grid layout */}
      <HeroDemo1 />

      {/* Demo 2: Four-cell grid layout */}
      <HeroDemo2 />

      {/* Demo 3: Three-cell grid with dark theme */}
      <HeroDemo3 />
    </main>
  )
}

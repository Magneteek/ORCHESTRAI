import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

// QuartzIQ specific utilities
export function generateTrianglePattern(count: number = 5): Array<{
  size: number;
  rotation: number;
  opacity: number;
  delay: number;
}> {
  return Array.from({ length: count }, (_, i) => ({
    size: Math.random() * 40 + 20,
    rotation: Math.random() * 360,
    opacity: Math.random() * 0.3 + 0.1,
    delay: i * 0.2,
  }))
}
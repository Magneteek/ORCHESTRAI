# LIBRARY INSTALLATION & CONFIGURATION GUIDE
## Complete Setup for Enhanced Tech Stack

---

## 📦 Package Installation Commands

### **Core Framework Setup**
```bash
# Initialize new project with Vite + React + TypeScript
npm create vite@latest dental-3d-hub -- --template react-ts
cd dental-3d-hub

# Install Tailwind CSS with plugins
npm install -D tailwindcss@latest postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
npx tailwindcss init -p

# Install essential build tools
npm install -D vite @vitejs/plugin-react
npm install -D typescript @types/react @types/react-dom
```

### **Design & Styling Libraries**
```bash
# Glassmorphism and advanced effects
npm install glass-ui
npm install react-neumorphism

# Mesh gradients and advanced styling
npm install mesh-gradient

# CSS-in-JS solutions (optional)
npm install styled-components
npm install @emotion/react @emotion/styled
```

### **Animation Libraries**
```bash
# GSAP (Premium - requires license for commercial use)
npm install gsap

# React Spring for physics-based animations
npm install @react-spring/web

# Framer Motion (alternative to GSAP for React)
npm install framer-motion

# Auto-animate for zero-config animations
npm install @formkit/auto-animate

# React Loading Skeleton
npm install react-loading-skeleton

# React Transition Group
npm install react-transition-group
npm install -D @types/react-transition-group
```

### **Interactive Background Libraries**
```bash
# Paper Design Shaders (check availability)
npm install @paper-design/shaders

# Three.js for 3D backgrounds
npm install three @types/three
npm install @react-three/fiber @react-three/drei

# React Particles for dynamic backgrounds
npm install react-tsparticles tsparticles

# Canvas manipulation libraries
npm install konva react-konva
```

### **Data Visualization Libraries**
```bash
# D3.js complete suite
npm install d3 @types/d3

# Observable Plot (modern grammar of graphics)
npm install @observablehq/plot

# Recharts (React charting library)
npm install recharts

# Victory (React visualization library)
npm install victory

# Chart.js with React wrapper
npm install chart.js react-chartjs-2
```

### **UI Component Libraries**
```bash
# Headless UI for unstyled components
npm install @headlessui/react @heroicons/react

# Radix UI primitives
npm install @radix-ui/react-dialog @radix-ui/react-tooltip
npm install @radix-ui/react-dropdown-menu @radix-ui/react-tabs
npm install @radix-ui/react-accordion @radix-ui/react-slider

# React Hook Form with validation
npm install react-hook-form @hookform/resolvers zod

# React Select for advanced dropdowns
npm install react-select

# React DatePicker
npm install react-datepicker @types/react-datepicker
```

### **Interaction & Scroll Libraries**
```bash
# Locomotive Scroll
npm install locomotive-scroll
npm install -D @types/locomotive-scroll

# Lenis smooth scrolling
npm install @studio-freight/lenis

# React Intersection Observer
npm install react-intersection-observer

# React Parallax Tilt
npm install react-parallax-tilt

# React Draggable
npm install react-draggable
```

### **Utility Libraries**
```bash
# Clsx for conditional classes
npm install clsx

# React Hot Toast for notifications
npm install react-hot-toast

# React Portal for modals
npm install react-portal

# Lodash utilities
npm install lodash @types/lodash

# Date manipulation
npm install date-fns

# UUID generation
npm install uuid @types/uuid

# Color manipulation
npm install polished
```

---

## 🔧 Configuration Files

### **Tailwind Configuration**
```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        display: ['Merriweather', ...fontFamily.serif],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.25)',
          dark: 'rgba(0, 0, 0, 0.25)',
          accent: 'rgba(14, 165, 233, 0.15)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.6)' },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '400% 400%',
            'background-position': 'left top'
          },
          '50%': {
            'background-size': '400% 400%',
            'background-position': 'right top'
          },
          '75%': {
            'background-size': '400% 400%',
            'background-position': 'right center'
          }
        }
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'rgb(55 65 81)',
            '[data-theme="dark"] &': {
              color: 'rgb(209 213 219)',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### **Global CSS with Custom Utilities**
```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap');

@layer base {
  html {
    @apply scroll-smooth;
  }
  
  body {
    @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
    @apply font-sans antialiased;
  }
}

@layer components {
  /* Glassmorphism Components */
  .glass {
    @apply bg-white bg-opacity-25 backdrop-blur-lg border border-white border-opacity-20;
    @apply shadow-lg shadow-black shadow-opacity-10;
  }
  
  .glass-dark {
    @apply bg-black bg-opacity-25 backdrop-blur-lg border border-white border-opacity-10;
  }
  
  .glass-accent {
    @apply bg-primary-500 bg-opacity-15 backdrop-blur-lg border border-primary-400 border-opacity-30;
  }
  
  /* Neumorphism Components */
  .neuro {
    background: linear-gradient(145deg, #f0f0f0, #cacaca);
    box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
  }
  
  .neuro-dark {
    background: linear-gradient(145deg, #2c2c2c, #1a1a1a);
    box-shadow: 20px 20px 60px #0d0d0d, -20px -20px 60px #3f3f3f;
  }
  
  .neuro-inset {
    background: linear-gradient(145deg, #cacaca, #f0f0f0);
    box-shadow: inset 20px 20px 60px #bebebe, inset -20px -20px 60px #ffffff;
  }
  
  /* Gradient Backgrounds */
  .bg-gradient-mesh {
    background: radial-gradient(circle at 20% 50%, theme('colors.primary.500') 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, theme('colors.secondary.500') 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, theme('colors.accent.500') 0%, transparent 50%),
                linear-gradient(90deg, theme('colors.primary.50') 0%, theme('colors.secondary.50') 100%);
  }
  
  .bg-gradient-animated {
    background: linear-gradient(-45deg, 
                theme('colors.primary.500'), 
                theme('colors.secondary.500'), 
                theme('colors.accent.500'), 
                theme('colors.primary.600'));
    background-size: 400% 400%;
    @apply animate-gradient-xy;
  }
  
  /* Button Components */
  .btn-glass {
    @apply glass px-6 py-3 rounded-lg font-medium;
    @apply hover:bg-opacity-40 transition-all duration-300;
    @apply active:scale-95 transform;
  }
  
  .btn-neuro {
    @apply neuro px-6 py-3 rounded-lg font-medium text-gray-700;
    @apply hover:shadow-inner active:neuro-inset;
    @apply transition-all duration-200;
  }
  
  .btn-glow {
    @apply bg-primary-500 text-white px-6 py-3 rounded-lg font-medium;
    @apply hover:animate-glow transition-all duration-300;
    @apply shadow-lg hover:shadow-primary-500/50;
  }
  
  /* Card Components */
  .card-glass {
    @apply glass p-6 rounded-xl;
    @apply hover:bg-opacity-30 hover:scale-[1.02];
    @apply transition-all duration-300;
  }
  
  .card-neuro {
    @apply neuro p-6 rounded-xl;
    @apply hover:shadow-2xl transition-all duration-300;
  }
  
  .card-float {
    @apply animate-float;
    animation-delay: calc(var(--delay, 0) * 0.5s);
  }
  
  /* Text Effects */
  .text-glow {
    text-shadow: 0 0 10px theme('colors.primary.500'),
                 0 0 20px theme('colors.primary.500'),
                 0 0 40px theme('colors.primary.500');
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-primary-500 to-secondary-500;
    @apply bg-clip-text text-transparent;
  }
  
  /* Loading States */
  .skeleton {
    @apply animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200;
    background-size: 200% 100%;
  }
  
  .skeleton-dark {
    @apply animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700;
    background-size: 200% 100%;
  }
}

@layer utilities {
  /* Scroll Utilities */
  .scroll-smooth {
    scroll-behavior: smooth;
  }
  
  .scroll-auto {
    scroll-behavior: auto;
  }
  
  /* Animation Utilities */
  .animation-delay-75 {
    animation-delay: 75ms;
  }
  
  .animation-delay-100 {
    animation-delay: 100ms;
  }
  
  .animation-delay-150 {
    animation-delay: 150ms;
  }
  
  .animation-delay-200 {
    animation-delay: 200ms;
  }
  
  .animation-delay-300 {
    animation-delay: 300ms;
  }
  
  .animation-delay-500 {
    animation-delay: 500ms;
  }
  
  .animation-delay-700 {
    animation-delay: 700ms;
  }
  
  .animation-delay-1000 {
    animation-delay: 1000ms;
  }
  
  /* Transform Utilities */
  .transform-gpu {
    transform: translateZ(0);
  }
  
  .backface-hidden {
    backface-visibility: hidden;
  }
  
  .preserve-3d {
    transform-style: preserve-3d;
  }
  
  /* Custom Scrollbar */
  .scrollbar-thin {
    scrollbar-width: thin;
  }
  
  .scrollbar-webkit {
    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    &::-webkit-scrollbar-track {
      @apply bg-gray-100 dark:bg-gray-800 rounded-lg;
    }
    
    &::-webkit-scrollbar-thumb {
      @apply bg-gray-300 dark:bg-gray-600 rounded-lg;
      
      &:hover {
        @apply bg-gray-400 dark:bg-gray-500;
      }
    }
  }
}

/* Custom Properties for Dynamic Values */
:root {
  --scroll-progress: 0;
  --mouse-x: 50%;
  --mouse-y: 50%;
  --section-progress: 0;
}

/* Dark Mode Variables */
[data-theme="dark"] {
  --glass-bg: rgba(0, 0, 0, 0.25);
  --glass-border: rgba(255, 255, 255, 0.1);
}

[data-theme="light"] {
  --glass-bg: rgba(255, 255, 255, 0.25);
  --glass-border: rgba(255, 255, 255, 0.2);
}
```

### **TypeScript Configuration**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/styles/*": ["./src/styles/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### **Vite Configuration with Aliases**
```javascript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/types': resolve(__dirname, './src/types'),
      '@/styles': resolve(__dirname, './src/styles'),
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          animations: ['gsap', '@react-spring/web'],
          ui: ['@headlessui/react', '@heroicons/react'],
          visualization: ['d3', '@observablehq/plot'],
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'gsap',
      'd3',
      '@react-spring/web',
      'framer-motion'
    ]
  }
});
```

---

## 🎨 Component Examples with New Stack

### **Glass Card Component**
```tsx
// src/components/ui/GlassCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'light' | 'dark' | 'accent';
  hover?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  variant = 'light',
  hover = true,
  onClick
}) => {
  const baseClasses = 'rounded-xl p-6 backdrop-blur-lg border transition-all duration-300';
  
  const variantClasses = {
    light: 'bg-white bg-opacity-25 border-white border-opacity-20 shadow-lg',
    dark: 'bg-black bg-opacity-25 border-white border-opacity-10',
    accent: 'bg-primary-500 bg-opacity-15 border-primary-400 border-opacity-30'
  };
  
  const hoverClasses = hover ? 'hover:bg-opacity-40 hover:scale-[1.02] hover:shadow-xl' : '';

  return (
    <motion.div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
    >
      {children}
    </motion.div>
  );
};
```

### **Animated Button Component**
```tsx
// src/components/ui/AnimatedButton.tsx
import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface AnimatedButtonProps {
  children: React.ReactNode;
  variant?: 'glass' | 'glow' | 'neuro';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 transform-gpu';
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  const variantClasses = {
    glass: 'bg-white bg-opacity-25 backdrop-blur-lg border border-white border-opacity-20 hover:bg-opacity-40 text-white shadow-lg',
    glow: 'bg-primary-500 text-white shadow-lg hover:shadow-primary-500/50 hover:animate-glow',
    neuro: 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 shadow-lg hover:shadow-xl active:shadow-inner'
  };

  return (
    <motion.button
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {loading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
};
```

---

## 🚀 Quick Start Script

Create this script to quickly set up a new project:

```bash
#!/bin/bash
# setup-enhanced-stack.sh

echo "🚀 Setting up Enhanced Tech Stack..."

# Create new Vite project
npm create vite@latest $1 -- --template react-ts
cd $1

# Install core dependencies
echo "📦 Installing core dependencies..."
npm install

# Install Tailwind CSS
echo "🎨 Installing Tailwind CSS..."
npm install -D tailwindcss@latest postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio
npx tailwindcss init -p

# Install design libraries
echo "✨ Installing design libraries..."
npm install glass-ui react-neumorphism mesh-gradient

# Install animation libraries
echo "🎬 Installing animation libraries..."
npm install gsap @react-spring/web framer-motion @formkit/auto-animate

# Install interactive libraries
echo "🌊 Installing interactive libraries..."
npm install three @types/three @react-three/fiber @react-three/drei
npm install react-tsparticles tsparticles

# Install data visualization
echo "📊 Installing visualization libraries..."
npm install d3 @types/d3 @observablehq/plot recharts

# Install UI libraries
echo "🎭 Installing UI libraries..."
npm install @headlessui/react @heroicons/react
npm install @radix-ui/react-dialog @radix-ui/react-tooltip
npm install react-hook-form @hookform/resolvers zod

# Install utility libraries
echo "🛠️ Installing utilities..."
npm install clsx react-hot-toast locomotive-scroll @studio-freight/lenis
npm install react-intersection-observer react-parallax-tilt

echo "✅ Enhanced Tech Stack setup complete!"
echo "🎯 Next steps:"
echo "1. Update tailwind.config.js with the enhanced configuration"
echo "2. Add the global CSS utilities"
echo "3. Update vite.config.ts with aliases"
echo "4. Start building amazing experiences!"

# Make script executable: chmod +x setup-enhanced-stack.sh
# Usage: ./setup-enhanced-stack.sh my-project-name
```

This comprehensive setup gives you everything you need to create stunning, interactive websites with glassmorphism effects, smooth animations, and cutting-edge design patterns!
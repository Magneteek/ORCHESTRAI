/**
 * ORCHESTRAI UNIFIED REPORT DESIGN SYSTEM
 *
 * Centralized design tokens, colors, typography, and component classes
 * for consistent HTML report styling across all domains.
 *
 * Usage:
 *   const designSystem = require('./report-design-system');
 *   const headerClass = designSystem.components.header;
 *   const primaryGradient = designSystem.colors.primary.gradient;
 */

module.exports = {
  /**
   * ORCHESTRAI Color Palette
   * Consistent colors across all report types
   */
  colors: {
    primary: {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      solid: '#667eea',
      light: '#8B9FFF',
      dark: '#4C63D2',
      tailwind: 'blue-600'
    },

    secondary: {
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)',
      solid: '#8B5CF6',
      light: '#A78BFA',
      dark: '#7C3AED',
      tailwind: 'purple-600'
    },

    success: {
      solid: '#10B981',
      light: '#34D399',
      dark: '#059669',
      tailwind: 'green-600'
    },

    warning: {
      solid: '#F59E0B',
      light: '#FCD34D',
      dark: '#D97706',
      tailwind: 'yellow-600'
    },

    danger: {
      solid: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      tailwind: 'red-600'
    },

    info: {
      solid: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      tailwind: 'blue-500'
    },

    neutral: {
      lightest: '#F9FAFB',  // gray-50
      light: '#E5E7EB',     // gray-200
      medium: '#9CA3AF',    // gray-400
      dark: '#4B5563',      // gray-600
      darkest: '#1F2937'    // gray-800
    }
  },

  /**
   * Typography System
   * Consistent font settings and heading sizes
   */
  typography: {
    fontFamily: "'Inter', sans-serif",

    headings: {
      h1: {
        size: 'text-5xl',
        weight: 'font-bold',
        spacing: 'mb-4',
        color: 'text-gray-900',
        full: 'text-5xl font-bold mb-4 text-gray-900'
      },
      h2: {
        size: 'text-3xl',
        weight: 'font-bold',
        spacing: 'mb-6',
        color: 'text-gray-900',
        full: 'text-3xl font-bold mb-6 text-gray-900'
      },
      h3: {
        size: 'text-2xl',
        weight: 'font-semibold',
        spacing: 'mb-4',
        color: 'text-gray-900',
        full: 'text-2xl font-semibold mb-4 text-gray-900'
      },
      h4: {
        size: 'text-xl',
        weight: 'font-semibold',
        spacing: 'mb-3',
        color: 'text-gray-800',
        full: 'text-xl font-semibold mb-3 text-gray-800'
      }
    },

    body: {
      base: 'text-base text-gray-700',
      small: 'text-sm text-gray-600',
      large: 'text-lg text-gray-800'
    }
  },

  /**
   * Reusable Component Classes
   * Standard Tailwind class combinations for consistency
   */
  components: {
    // Layout containers
    container: 'max-w-7xl mx-auto px-6 py-12',
    section: 'mb-16',
    pageBreak: 'page-break',

    // Cards and panels
    card: 'bg-white rounded-xl p-6 shadow-md',
    cardHover: 'bg-white rounded-xl p-6 shadow-md transition transform hover:-translate-y-1 hover:shadow-lg',
    cardGradient: 'bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100',

    // Headers
    heroHeader: 'gradient-bg text-white py-16 px-6',
    sectionHeader: 'mb-8',

    // Navigation
    navbar: 'sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50 no-print',
    navLink: 'text-sm font-medium text-gray-600 hover:text-blue-600 whitespace-nowrap transition',

    // Badges and labels
    badge: 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide',
    badgeHigh: 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-green-500 text-white',
    badgeMedium: 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-yellow-500 text-white',
    badgeLow: 'inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-gray-500 text-white',

    // Buttons
    button: 'px-4 py-2 rounded-lg font-medium transition',
    buttonPrimary: 'px-4 py-2 rounded-lg font-medium transition bg-purple-600 text-white hover:bg-purple-700',
    buttonSecondary: 'px-4 py-2 rounded-lg font-medium transition bg-gray-200 text-gray-700 hover:bg-gray-300',

    // Progress and metrics
    progressBar: 'h-2 bg-gray-200 rounded-full overflow-hidden',
    progressFill: 'h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-1000',

    // Grids
    grid2: 'grid md:grid-cols-2 gap-6',
    grid3: 'grid md:grid-cols-3 gap-6',
    grid4: 'grid md:grid-cols-4 gap-6',

    // Lists
    list: 'space-y-2',
    listItem: 'flex items-start',
    listBullet: 'text-blue-500 mr-2 flex-shrink-0',

    // Borders and dividers
    borderLeft: 'border-l-4',
    divider: 'border-t border-gray-200 my-8'
  },

  /**
   * Animation and Interaction Settings
   */
  animations: {
    fadeIn: {
      keyframes: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `,
      class: 'fade-in',
      duration: '0.6s ease-out'
    },

    slideIn: {
      keyframes: `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `,
      class: 'slide-in',
      duration: '0.5s ease-out'
    }
  },

  /**
   * Report-Specific Gradients
   * Different gradient themes for different report types
   */
  gradients: {
    strategic: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    intelligence: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
    seo: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
    psychographic: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    comprehensive: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },

  /**
   * Print-Specific Styles
   */
  print: {
    hide: 'no-print',
    pageBreak: 'page-break',
    keepTogether: 'break-inside-avoid',
    styles: `
      @media print {
        .no-print {
          display: none !important;
        }
        .page-break {
          page-break-before: always;
        }
        .break-inside-avoid {
          break-inside: avoid;
        }
        body {
          print-color-adjust: exact;
          -webkit-print-color-adjust: exact;
        }
      }
    `
  },

  /**
   * Responsive Breakpoints
   */
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },

  /**
   * Standard Spacing Scale
   */
  spacing: {
    section: 'py-12',
    subsection: 'py-8',
    element: 'py-4',
    tight: 'py-2'
  },

  /**
   * Shadow System
   */
  shadows: {
    card: 'shadow-md',
    cardHover: 'shadow-lg',
    elevated: 'shadow-xl',
    none: 'shadow-none'
  }
};

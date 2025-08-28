# QuartzIQ Homepage - Next.js 15 + ShadCN UI + Tailwind CSS

This is the enterprise-grade QuartzIQ homepage built with the correct technology stack as per ORCHESTRAI Web Quality Assurance Framework requirements.

## Technology Stack ✅

- **Framework**: Next.js 15 with App Router
- **UI Library**: ShadCN UI for component consistency
- **Styling**: Tailwind CSS with custom QuartzIQ themes
- **Language**: TypeScript throughout
- **Icons**: Lucide React
- **Development**: ESLint + Prettier configuration

## QuartzIQ Brand Integration

### Brand Colors (Tailwind Config)
```css
'quartziq': {
  'dark-blue': '#1A2944',
  'brand-blue': '#357494', 
  'light-blue': '#3F86A4',
  'white': '#D7D9D7',
  'gray': '#C8C9C7',
  'dark-gray': '#828689'
}
```

### Custom Components
- Hero Section with animated triangular patterns
- Problem Section with statistics and pain point visualization  
- Solution Section with 5-phase Growth Engine framework
- Trust Section with guarantee and social proof
- CTA Section with dual conversion paths

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Quality Commands
```bash
# TypeScript type checking
npm run type-check

# ESLint validation
npm run lint

# Prettier formatting
npm run format

# Run tests
npm run test

# E2E tests
npm run test:e2e
```

## Component Architecture

### File Structure
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── hero-section.tsx
│   ├── problem-section.tsx
│   ├── solution-section.tsx
│   ├── trust-section.tsx
│   └── cta-section.tsx
└── lib/
    ├── utils.ts
    └── types.ts
```

### Key Features
- **Mobile-first responsive design**
- **Custom QuartzIQ button variants**: `quartziq`, `quartziq-outline`, `quartziq-gradient`
- **Custom badge variants**: `quartziq`, `quartziq-outline`, `quartziq-light`
- **Animated triangular patterns** reflecting QuartzIQ branding
- **TypeScript interfaces** for all component props
- **SEO optimization** with proper meta tags and structure

## Content Integration

All content is integrated from the approved homepage copy including:
- Hero headline: "Stop Losing Dental Sales to Competitors with Faster Automation"
- 79% lead loss statistic and 47-hour vs 5-minute response time positioning
- 5-phase Growth Engine framework with detailed feature breakdowns
- Trust-to-Lead Guarantee messaging
- Dual CTA strategy with primary and secondary conversion paths

## Quality Assurance Compliance

This implementation meets all requirements from the Web Quality Assurance Framework:
- ✅ Next.js 15 with App Router
- ✅ ShadCN UI component library
- ✅ Tailwind CSS with QuartzIQ brand colors
- ✅ TypeScript throughout
- ✅ Responsive design with mobile-first approach
- ✅ Component architecture standards
- ✅ Quality validation commands configured

## Performance Optimizations

- CSS-in-JS with Tailwind for minimal bundle size
- Next.js Image component ready for implementation
- Optimized animations with GPU acceleration
- Lazy loading and code splitting via Next.js
- Semantic HTML structure for accessibility

## Browser Compatibility

Designed to meet Core Web Vitals standards across:
- Chrome 90+
- Firefox 85+
- Safari 14+
- Edge 90+

## Deployment

This project is ready for deployment to Vercel, Netlify, or any Node.js hosting platform that supports Next.js 15.

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Quality Gates Passed ✅

1. **Project Initialization**: Correct technology stack implemented
2. **Component Development**: ShadCN UI components with QuartzIQ branding
3. **Brand Integration**: Custom Tailwind theme with brand colors
4. **Performance Ready**: Core Web Vitals optimization structure
5. **Testing Framework**: Jest and Playwright configuration included
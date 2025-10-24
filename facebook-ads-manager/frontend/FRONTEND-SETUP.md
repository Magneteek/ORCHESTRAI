# Facebook Ads Manager - Frontend Setup Guide

## Overview

This is a Next.js 15 App Router application built with TypeScript, ShadCN UI, and Tailwind CSS for managing Facebook advertising campaigns with AI-powered optimization.

## Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + ShadCN UI
- **Icons**: Lucide React
- **State Management**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **Authentication**: NextAuth.js v5
- **Database**: Prisma + PostgreSQL

## Project Structure

```
frontend/
├── app/                          # Next.js 15 App Router
│   ├── layout.tsx               # Root layout with metadata
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Global styles + Tailwind
│   └── dashboard/               # Dashboard routes
│       ├── layout.tsx           # Dashboard layout wrapper
│       ├── page.tsx             # Dashboard home
│       ├── campaigns/           # Campaign management
│       ├── ad-sets/             # Ad Set management
│       ├── ads/                 # Ad management
│       ├── analytics/           # Performance analytics
│       ├── optimization/        # AI recommendations
│       ├── reporting/           # Custom reports
│       ├── automation/          # Automated rules
│       └── settings/            # Account settings
│
├── components/                   # React components
│   ├── ui/                      # ShadCN UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   ├── tabs.tsx
│   │   └── badge.tsx
│   └── dashboard/               # Dashboard-specific components
│       ├── sidebar.tsx          # Navigation sidebar
│       └── header.tsx           # Top header with account switcher
│
├── lib/                         # Utility functions
│   └── utils.ts                 # Common utilities (cn, formatters)
│
├── types/                       # TypeScript definitions
│   ├── index.ts                 # Core application types
│   └── facebook.ts              # Facebook API types
│
├── hooks/                       # Custom React hooks (to be added)
│
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── components.json              # ShadCN UI configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 15 and React 18
- ShadCN UI components (Radix UI primitives)
- Tailwind CSS and plugins
- TypeScript and type definitions
- Additional utilities

### 2. Environment Variables

Create a `.env.local` file in the frontend directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/fbads"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Facebook API
FACEBOOK_APP_ID="your-app-id"
FACEBOOK_APP_SECRET="your-app-secret"

# Redis
REDIS_URL="redis://localhost:6379"

# API
API_URL="http://localhost:3001"
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## Key Features Implemented

### 1. Next.js 15 App Router Structure

- Server Components by default for optimal performance
- Client Components only where interactivity is needed
- Proper metadata configuration for SEO
- Optimized image handling for Facebook assets

### 2. ShadCN UI Integration

All base UI components are implemented:
- **Button**: Multiple variants (default, outline, ghost, facebook, success, warning)
- **Card**: Flexible card components with header, content, footer
- **Input**: Accessible form inputs with proper styling
- **Label**: Form labels with Radix UI primitives
- **Select**: Dropdown selects with search and keyboard navigation
- **Table**: Data tables with sorting capabilities
- **Dialog**: Modal dialogs for forms and confirmations
- **Tabs**: Tabbed interfaces for organizing content
- **Badge**: Status badges for campaigns, ads, and metrics

### 3. Dashboard Layout

- **Sidebar Navigation**: Fixed sidebar with all main sections
- **Header**: Top navigation with search, account switcher, notifications
- **Responsive Design**: Mobile-friendly layout with proper breakpoints
- **Accessibility**: ARIA labels and keyboard navigation throughout

### 4. Type Safety

- **Strict TypeScript**: Full type coverage with strict mode
- **Core Types**: User, Campaign, AdSet, Ad, Insight types
- **Facebook API Types**: Complete Facebook API response types
- **Utility Types**: Generic API responses, filters, sorting, pagination

### 5. Utility Functions

- **cn()**: Tailwind class merging with clsx
- **Formatters**: Currency, numbers, percentages, dates
- **Helpers**: Debounce, sleep, ID generation

## Path Aliases

The following path aliases are configured in `tsconfig.json`:

```typescript
{
  "@/*": ["./*"],
  "@/components/*": ["./components/*"],
  "@/lib/*": ["./lib/*"],
  "@/types/*": ["./types/*"],
  "@/hooks/*": ["./hooks/*"],
  "@/app/*": ["./app/*"]
}
```

Usage example:
```typescript
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Campaign } from "@/types";
```

## Component Usage Examples

### Button Component

```tsx
import { Button } from "@/components/ui/button";

// Default button
<Button>Click me</Button>

// Facebook branded button
<Button variant="facebook">Connect Facebook</Button>

// Success button with icon
<Button variant="success" size="lg">
  <CheckCircle className="h-4 w-4" />
  Save Changes
</Button>
```

### Card Component

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Campaign Performance</CardTitle>
    <CardDescription>Last 7 days</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Your content here */}
  </CardContent>
</Card>
```

### Badge Component

```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="active">Active</Badge>
<Badge variant="paused">Paused</Badge>
<Badge variant="success">High Impact</Badge>
```

## Styling Guidelines

### Color System

The application uses a comprehensive color system defined in `globals.css`:

- **Primary**: Main brand color (Facebook blue)
- **Secondary**: Supporting colors
- **Muted**: Subtle backgrounds and text
- **Accent**: Highlighted elements
- **Destructive**: Error states
- **Success**: Positive actions
- **Warning**: Caution states
- **Facebook**: Facebook brand colors

### Utility Classes

Custom utility classes are available:

```css
.gradient-text      /* Gradient text effect */
.card-hover         /* Card hover animation */
.scrollbar-hide     /* Hide scrollbars */
```

## Performance Optimizations

1. **Server Components**: Default to server components for better performance
2. **Code Splitting**: Automatic code splitting via Next.js
3. **Image Optimization**: Next.js Image component for Facebook ad images
4. **CSS Optimization**: Tailwind CSS with PurgeCSS
5. **Type Safety**: TypeScript for compile-time error checking

## Next Steps

### Phase 2: Additional Components

1. Create campaign management pages
2. Implement analytics dashboards with charts (Recharts)
3. Add AI optimization recommendations UI
4. Build automation rules interface
5. Create reporting and export features

### Phase 3: Integration

1. Connect to backend API
2. Implement Facebook OAuth flow
3. Set up WebSocket for real-time updates
4. Add form validation with Zod
5. Implement state management with Zustand

### Phase 4: Testing

1. Set up Jest for unit tests
2. Configure Playwright for E2E tests
3. Add accessibility testing
4. Performance testing and optimization

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
npm test             # Run Jest tests
npm run test:e2e     # Run Playwright E2E tests
```

## Accessibility Features

- Semantic HTML throughout
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management in dialogs
- Screen reader friendly components
- High contrast color scheme

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

Follow these guidelines when adding new components:

1. Use TypeScript with proper typing
2. Follow the ShadCN UI component patterns
3. Ensure accessibility compliance
4. Add proper error handling
5. Document complex logic
6. Write tests for critical paths

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [ShadCN UI Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com)
- [Facebook Marketing API](https://developers.facebook.com/docs/marketing-apis)

## Support

For questions or issues, refer to the main project documentation or contact the development team.

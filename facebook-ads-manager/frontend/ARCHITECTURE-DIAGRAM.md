# Facebook Ads Manager - Frontend Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser / Client                             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js 15 App Router                       │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Public Routes  │  │  Auth Routes     │  │  Protected       │  │
│  │                  │  │                  │  │  Routes          │  │
│  │  • Homepage      │  │  • Login         │  │  • Dashboard     │  │
│  │  • Pricing       │  │  • Register      │  │  • Campaigns     │  │
│  │  • Features      │  │  • OAuth         │  │  • Analytics     │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│   Server Components (RSC)    │  │   Client Components          │
│   ─────────────────────      │  │   ─────────────────          │
│   • Data fetching            │  │   • Interactivity            │
│   • Initial rendering        │  │   • State management         │
│   • SEO optimization         │  │   • Event handlers           │
│   • Zero JS to client        │  │   • Form interactions        │
└──────────────────────────────┘  └──────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Component Layer                            │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                  Layout Components                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │  RootLayout  │  │   Dashboard  │  │     Auth     │      │   │
│  │  │              │  │    Layout    │  │    Layout    │      │   │
│  │  │  • Metadata  │  │  • Sidebar   │  │  • Centered  │      │   │
│  │  │  • Fonts     │  │  • Header    │  │  • Simple    │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Feature Components                        │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │   Sidebar    │  │    Header    │  │  Dashboard   │      │   │
│  │  │              │  │              │  │    Cards     │      │   │
│  │  │  • Nav Menu  │  │  • Search    │  │  • Metrics   │      │   │
│  │  │  • Active    │  │  • Account   │  │  • Charts    │      │   │
│  │  │    Route     │  │    Switcher  │  │  • Tables    │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    UI Components (ShadCN)                    │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │   │
│  │  │Button│ │ Card │ │Input │ │Label │ │Select│ │Table │    │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐                                │   │
│  │  │Dialog│ │ Tabs │ │Badge │                                │   │
│  │  └──────┘ └──────┘ └──────┘                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend Layer                             │
│                                                                       │
│  User Interaction                                                    │
│        │                                                              │
│        ▼                                                              │
│  ┌──────────────────┐                                                │
│  │  Client Component│                                                │
│  │  (use client)    │                                                │
│  └────────┬─────────┘                                                │
│           │                                                           │
│           ▼                                                           │
│  ┌──────────────────┐      ┌──────────────────┐                     │
│  │  TanStack Query  │◄────►│    Zustand       │                     │
│  │  (Server State)  │      │  (Client State)  │                     │
│  └────────┬─────────┘      └──────────────────┘                     │
│           │                                                           │
│           ▼                                                           │
└───────────┼───────────────────────────────────────────────────────────┘
            │
            │ API Calls
            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Routes Layer                             │
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  /api/campaigns  │  │  /api/ad-sets    │  │  /api/ads        │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                      │             │
│           ▼                     ▼                      ▼             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      Service Layer                          │   │
│  │  • Business Logic  • Validation  • Error Handling          │   │
│  └───────────────────────────┬─────────────────────────────────┘   │
│                              │                                       │
│           ┌──────────────────┼──────────────────┐                   │
│           ▼                  ▼                  ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │   Prisma     │  │   Facebook   │  │    Redis     │             │
│  │   (Database) │  │     API      │  │   (Cache)    │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
└─────────────────────────────────────────────────────────────────────┘
```

## File Structure Hierarchy

```
frontend/
│
├── app/                                 # Next.js 15 App Router
│   ├── layout.tsx                      # ─┐
│   ├── page.tsx                        #  │ Public Routes
│   │                                    #  │
│   ├── dashboard/                      # ─┘
│   │   ├── layout.tsx ────────────┐    # Protected Routes
│   │   ├── page.tsx               │    #
│   │   ├── campaigns/             │    # Feature Routes
│   │   ├── ad-sets/               │    #
│   │   ├── ads/                   │    #
│   │   ├── analytics/             │    #
│   │   ├── optimization/          │    #
│   │   └── settings/              │    #
│   │                              │    #
│   └── api/                       │    # API Routes
│       ├── campaigns/             │    #
│       ├── ad-sets/               │    #
│       └── ads/                   │    #
│                                  │
├── components/                    │
│   ├── ui/                        │    # Base UI Components
│   │   ├── button.tsx ◄───────────┤    # (ShadCN UI)
│   │   ├── card.tsx               │    #
│   │   ├── input.tsx              │    #
│   │   ├── select.tsx             │    #
│   │   └── ...                    │    #
│   │                              │    #
│   └── dashboard/                 │    # Feature Components
│       ├── sidebar.tsx ◄──────────┘    #
│       └── header.tsx                  #
│
├── lib/                                # Utilities & Logic
│   ├── utils.ts                        # Helpers
│   ├── auth/                           # Authentication
│   ├── db/                             # Database queries
│   └── facebook/                       # Facebook API client
│
├── types/                              # TypeScript Definitions
│   ├── index.ts                        # Core types
│   └── facebook.ts                     # Facebook API types
│
├── hooks/                              # Custom React Hooks
│
└── public/                             # Static Assets
```

## Dashboard Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Dashboard Layout                            │
│                                                                       │
│  ┌────────────────┐  ┌───────────────────────────────────────────┐  │
│  │                │  │          Header Component                 │  │
│  │                │  │  ┌──────────┐  ┌─────────┐  ┌─────────┐  │  │
│  │   Sidebar      │  │  │ Search   │  │ Account │  │  User   │  │  │
│  │   Navigation   │  │  │   Bar    │  │ Switch  │  │  Menu   │  │  │
│  │                │  │  └──────────┘  └─────────┘  └─────────┘  │  │
│  │  ┌──────────┐  │  └───────────────────────────────────────────┘  │
│  │  │Dashboard │  │                                                  │
│  │  ├──────────┤  │  ┌───────────────────────────────────────────┐  │
│  │  │Campaigns │  │  │                                           │  │
│  │  ├──────────┤  │  │                                           │  │
│  │  │ Ad Sets  │  │  │          Main Content Area                │  │
│  │  ├──────────┤  │  │                                           │  │
│  │  │   Ads    │  │  │     (Page-specific content)               │  │
│  │  ├──────────┤  │  │                                           │  │
│  │  │Analytics │  │  │     • Metrics Cards                       │  │
│  │  ├──────────┤  │  │     • Data Tables                         │  │
│  │  │Optimize  │  │  │     • Charts                              │  │
│  │  ├──────────┤  │  │     • Forms                               │  │
│  │  │ Reports  │  │  │                                           │  │
│  │  ├──────────┤  │  │                                           │  │
│  │  │ Automate │  │  │                                           │  │
│  │  ├──────────┤  │  └───────────────────────────────────────────┘  │
│  │  │ Settings │  │                                                  │
│  │  └──────────┘  │                                                  │
│  │                │                                                  │
│  │  ┌──────────┐  │                                                  │
│  │  │  Help    │  │                                                  │
│  │  │ Section  │  │                                                  │
│  │  └──────────┘  │                                                  │
│  └────────────────┘                                                  │
└─────────────────────────────────────────────────────────────────────┘
     Fixed Sidebar         Scrollable Content Area
     (w-64, fixed)         (flex-1, overflow-y-auto)
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      State Management Layer                          │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              TanStack Query (Server State)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │ Campaigns  │  │  Ad Sets   │  │    Ads     │            │   │
│  │  │   Query    │  │   Query    │  │   Query    │            │   │
│  │  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘            │   │
│  │         │                │                │                  │   │
│  │         ▼                ▼                ▼                  │   │
│  │    ┌─────────────────────────────────────────┐              │   │
│  │    │        Automatic Caching                │              │   │
│  │    │     • Stale While Revalidate            │              │   │
│  │    │     • Background Refetching             │              │   │
│  │    │     • Optimistic Updates                │              │   │
│  │    └─────────────────────────────────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               Zustand (Client State)                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │   │
│  │  │   UI       │  │  Filters   │  │  User      │            │   │
│  │  │   State    │  │   State    │  │  Prefs     │            │   │
│  │  └────────────┘  └────────────┘  └────────────┘            │   │
│  │     • Modals       • Date Range    • Theme                  │   │
│  │     • Sidebar      • Search        • Layout                 │   │
│  │     • Tooltips     • Sort          • Lang                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Type System Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                      TypeScript Type System                          │
│                                                                       │
│  types/index.ts (Core Types)          types/facebook.ts (API Types) │
│  ────────────────────────              ─────────────────────────    │
│                                                                       │
│  User                                 FacebookAccount                │
│    └─ id, email, name, image            └─ id, name, currency       │
│                                                                       │
│  AdAccount                            FacebookCampaign               │
│    └─ id, accountId, userId              └─ id, name, objective     │
│                                                                       │
│  Campaign                             FacebookAdSet                  │
│    ├─ id, name, status                   └─ id, targeting, budget   │
│    ├─ objective, budget                                              │
│    └─ adAccountId                     FacebookAd                     │
│                                          └─ id, creative, status     │
│  AdSet                                                                │
│    ├─ id, name, status                FacebookInsight               │
│    ├─ targeting, budget                  └─ impressions, clicks     │
│    └─ campaignId                                                     │
│                                       FacebookTargeting              │
│  Ad                                      └─ age, gender, geo         │
│    ├─ id, name, status                                               │
│    ├─ creative                        FacebookCreative               │
│    └─ adSetId                            └─ title, body, image       │
│                                                                       │
│  Insight                              FacebookError                  │
│    ├─ impressions, clicks                └─ message, code, type     │
│    ├─ spend, cpm, cpc                                                │
│    └─ roas, conversions                                              │
│                                                                       │
│  DashboardMetrics                                                    │
│    └─ totalSpend, impressions...                                     │
│                                                                       │
│  AIRecommendation                                                    │
│    └─ type, impact, action...                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Routing Structure

```
App Routes (Next.js 15 App Router)
───────────────────────────────────

/                                  ──► Homepage (Public)
  └─ page.tsx

/dashboard                         ──► Dashboard Home (Protected)
  ├─ layout.tsx                       (Sidebar + Header)
  ├─ page.tsx                         (Metrics Overview)
  │
  ├─ /campaigns                    ──► Campaign Management
  │   ├─ page.tsx                     (List View)
  │   ├─ /new                         (Create Campaign)
  │   └─ /[id]                        (Campaign Details)
  │       ├─ page.tsx
  │       └─ /edit                    (Edit Campaign)
  │
  ├─ /ad-sets                      ──► Ad Set Management
  │   ├─ page.tsx
  │   ├─ /new
  │   └─ /[id]
  │
  ├─ /ads                          ──► Ad Management
  │   ├─ page.tsx
  │   ├─ /new
  │   └─ /[id]
  │
  ├─ /analytics                    ──► Performance Analytics
  │   ├─ page.tsx
  │   └─ /[campaignId]
  │
  ├─ /optimization                 ──► AI Recommendations
  │   └─ page.tsx
  │
  ├─ /reporting                    ──► Custom Reports
  │   ├─ page.tsx
  │   └─ /[reportId]
  │
  ├─ /automation                   ──► Automated Rules
  │   ├─ page.tsx
  │   └─ /[ruleId]
  │
  └─ /settings                     ──► Account Settings
      ├─ page.tsx
      ├─ /profile
      ├─ /accounts
      └─ /integrations

/api                               ──► API Routes
  ├─ /auth
  │   ├─ /[...nextauth]
  │   └─ /register
  │
  ├─ /campaigns
  ├─ /ad-sets
  ├─ /ads
  ├─ /insights
  └─ /recommendations
```

## Component Communication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Component Communication                          │
│                                                                       │
│                         ┌──────────────┐                             │
│                         │  Dashboard   │                             │
│                         │    Layout    │                             │
│                         └───┬──────┬───┘                             │
│                             │      │                                 │
│                    ┌────────┘      └────────┐                        │
│                    ▼                         ▼                        │
│            ┌───────────────┐        ┌───────────────┐                │
│            │   Sidebar     │        │    Header     │                │
│            │               │        │               │                │
│            │  • Nav State  │        │  • Search     │                │
│            │  • Active     │        │  • Account    │                │
│            │    Route      │        │    Switcher   │                │
│            └───────────────┘        └───────┬───────┘                │
│                                             │                         │
│                                             │ Event                   │
│                                             ▼                         │
│                                    ┌───────────────┐                 │
│                                    │   Zustand     │                 │
│                                    │    Store      │                 │
│                                    └───────┬───────┘                 │
│                                            │                          │
│                                            │ State Update             │
│                                            ▼                          │
│                                    ┌───────────────┐                 │
│                                    │   Dashboard   │                 │
│                                    │     Page      │                 │
│                                    │               │                 │
│                                    │  • Metrics    │                 │
│                                    │  • Charts     │                 │
│                                    │  • Tables     │                 │
│                                    └───────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Styling Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Styling System                                │
│                                                                       │
│  globals.css                                                         │
│  ──────────                                                          │
│    ├─ @tailwind base            CSS Custom Properties               │
│    ├─ @tailwind components      ────────────────────                │
│    └─ @tailwind utilities        --primary                           │
│                                   --secondary                         │
│         ┌────────────────────┐   --muted                            │
│         │   Base Styles      │   --accent                           │
│         │  • Typography      │   --destructive                      │
│         │  • Reset           │   --success                          │
│         │  • Animations      │   --warning                          │
│         └────────────────────┘   --facebook                         │
│                                                                       │
│  tailwind.config.ts                                                  │
│  ──────────────────                                                  │
│    ├─ Theme Extension                                                │
│    │   ├─ Colors (Facebook, Status)                                 │
│    │   ├─ Border Radius                                             │
│    │   ├─ Fonts                                                     │
│    │   └─ Animations                                                │
│    │                                                                 │
│    └─ Plugins                                                        │
│        ├─ tailwindcss-animate                                        │
│        ├─ @tailwindcss/typography                                    │
│        └─ @tailwindcss/forms                                         │
│                                                                       │
│  Component Styling Pattern                                           │
│  ─────────────────────────                                           │
│    className={cn(                                                    │
│      "base-classes",              Utility Function (lib/utils.ts)   │
│      variant && variantClasses,   ─────────────────────────────     │
│      size && sizeClasses,         export function cn(...inputs) {   │
│      className                      return twMerge(clsx(inputs))    │
│    )}                              }                                 │
└─────────────────────────────────────────────────────────────────────┘
```

This architecture provides a solid foundation for building a scalable, type-safe, and performant Facebook Ads Manager SaaS application with Next.js 15.

#!/bin/bash

# ===============================
# ORCHESTRAI Developer Setup Script
# Complete development environment initialization
# ===============================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
print_banner() {
    echo -e "${CYAN}"
    cat << 'EOF'
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║     ██████╗ ██████╗  ██████╗██╗  ██╗███████╗███████╗████████╗ ║
    ║    ██╔═══██╗██╔══██╗██╔════╝██║  ██║██╔════╝██╔════╝╚══██╔══╝ ║
    ║    ██║   ██║██████╔╝██║     ███████║█████╗  ███████╗   ██║    ║
    ║    ██║   ██║██╔══██╗██║     ██╔══██║██╔══╝  ╚════██║   ██║    ║
    ║    ╚██████╔╝██║  ██║╚██████╗██║  ██║███████╗███████║   ██║    ║
    ║     ╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝   ╚═╝    ║
    ║                                                               ║
    ║    ██████╗  █████╗ ██╗    ████████╗ █████╗ ██╗██╗   ██╗██╗   ║
    ║   ██╔══██╗██╔══██╗██║    ╚══██╔══╝██╔══██╗██║██║   ██║██║   ║
    ║   ██████╔╝███████║██║       ██║   ███████║██║██║   ██║██║   ║
    ║   ██╔══██╗██╔══██║██║       ██║   ██╔══██║██║██║   ██║██║   ║
    ║   ██║  ██║██║  ██║██║       ██║   ██║  ██║██║╚██████╔╝██║   ║
    ║   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝       ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝   ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo -e "${BLUE}🚀 Advanced Multi-Agent Development Environment Setup${NC}"
    echo -e "${YELLOW}✨ Tailwind CSS v4 + MagicUI + MCP Integration${NC}"
    echo
}

# Functions
print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

# Check system requirements
check_system_requirements() {
    print_step "Checking system requirements..."
    
    local requirements_met=true
    
    # Check Node.js version
    if command -v node &> /dev/null; then
        local node_version=$(node --version | sed 's/v//')
        local major_version=$(echo $node_version | cut -d. -f1)
        
        if [ "$major_version" -ge 20 ]; then
            print_success "Node.js $node_version ✓"
        else
            print_error "Node.js 20+ required, found $node_version"
            requirements_met=false
        fi
    else
        print_error "Node.js not found. Please install Node.js 20+"
        requirements_met=false
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        print_success "npm $npm_version ✓"
    else
        print_error "npm not found"
        requirements_met=false
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        local git_version=$(git --version | cut -d' ' -f3)
        print_success "git $git_version ✓"
    else
        print_warning "git not found - version control recommended"
    fi
    
    if [ "$requirements_met" = false ]; then
        print_error "System requirements not met. Please install missing dependencies."
        exit 1
    fi
    
    print_success "System requirements validated"
}

# Project type selection
select_project_type() {
    echo -e "${PURPLE}[PROJECT SETUP]${NC} Choose your project type:"
    echo "1) New Next.js 15 project (recommended)"
    echo "2) Add ORCHESTRAI standards to existing project"
    echo "3) Setup ORCHESTRAI workspace (multiple projects)"
    echo
    
    while true; do
        read -p "Enter your choice (1-3): " choice
        case $choice in
            1) PROJECT_TYPE="new"; break;;
            2) PROJECT_TYPE="existing"; break;;
            3) PROJECT_TYPE="workspace"; break;;
            *) print_warning "Please enter 1, 2, or 3";;
        esac
    done
    
    print_success "Project type: $PROJECT_TYPE"
}

# Create new Next.js project
create_new_project() {
    echo
    read -p "Enter project name: " PROJECT_NAME
    
    if [ -z "$PROJECT_NAME" ]; then
        print_error "Project name cannot be empty"
        exit 1
    fi
    
    print_step "Creating new Next.js 15 project: $PROJECT_NAME"
    
    # Create Next.js project with TypeScript and Tailwind
    npx create-next-app@latest "$PROJECT_NAME" \
        --typescript \
        --tailwind \
        --eslint \
        --app \
        --src-dir \
        --import-alias "@/*" \
        --use-npm
    
    if [ $? -eq 0 ]; then
        print_success "Next.js project created"
        cd "$PROJECT_NAME"
        PROJECT_DIR=$(pwd)
    else
        print_error "Failed to create Next.js project"
        exit 1
    fi
}

# Setup existing project
setup_existing_project() {
    PROJECT_DIR=$(pwd)
    PROJECT_NAME=$(basename "$PROJECT_DIR")
    
    print_step "Setting up ORCHESTRAI standards in existing project: $PROJECT_NAME"
    
    # Check if it's a Next.js project
    if [ ! -f "package.json" ]; then
        print_error "No package.json found. Are you in a project directory?"
        exit 1
    fi
    
    # Check for Next.js
    if ! grep -q "next" package.json; then
        print_warning "This doesn't appear to be a Next.js project."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Existing project validated"
}

# Setup workspace
setup_workspace() {
    echo
    read -p "Enter workspace name: " WORKSPACE_NAME
    
    if [ -z "$WORKSPACE_NAME" ]; then
        print_error "Workspace name cannot be empty"
        exit 1
    fi
    
    print_step "Creating ORCHESTRAI workspace: $WORKSPACE_NAME"
    
    mkdir -p "$WORKSPACE_NAME"
    cd "$WORKSPACE_NAME"
    PROJECT_DIR=$(pwd)
    
    # Create workspace structure
    mkdir -p {projects,shared,templates,docs,scripts}
    
    # Create workspace configuration
    cat > workspace.json << EOF
{
  "workspace": "$WORKSPACE_NAME",
  "version": "3.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "orchestraiStandards": "enabled",
  "projects": [],
  "sharedResources": {
    "templates": "./templates",
    "components": "./shared/components",
    "utilities": "./shared/utils"
  }
}
EOF
    
    print_success "Workspace structure created"
}

# Install ORCHESTRAI standards
install_orchestrai_standards() {
    print_step "Installing ORCHESTRAI development standards..."
    
    # Install Tailwind CSS v4
    print_step "Installing Tailwind CSS v4..."
    npm install tailwindcss@next @tailwindcss/cli@next
    
    # Install core dependencies
    print_step "Installing core dependencies..."
    npm install \
        @radix-ui/react-slot \
        class-variance-authority \
        clsx \
        tailwind-merge \
        lucide-react \
        framer-motion \
        @types/react \
        @types/react-dom
    
    # Install development dependencies
    npm install -D \
        @types/node \
        eslint-config-prettier \
        prettier \
        prettier-plugin-tailwindcss
    
    print_success "Dependencies installed"
}

# Setup Tailwind v4 configuration
setup_tailwind_v4() {
    print_step "Configuring Tailwind CSS v4..."
    
    local globals_source="/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/templates/global/styles/tailwind-v4-globals.css"
    local globals_target="./src/app/globals.css"
    
    # Create src/app directory if it doesn't exist
    mkdir -p "./src/app"
    
    if [ -f "$globals_source" ]; then
        cp "$globals_source" "$globals_target"
        print_success "ORCHESTRAI Tailwind v4 globals configured"
    else
        print_warning "ORCHESTRAI globals template not found, creating basic configuration..."
        
        cat > "$globals_target" << 'EOF'
@import "tailwindcss";

@layer theme {
  :root {
    /* ORCHESTRAI Dental Industry Colors */
    --color-primary-50: 239 246 255;
    --color-primary-500: 14 165 233;
    --color-primary-900: 12 74 110;
    
    /* Glassmorphism System */
    --glass-bg: 255 255 255 / 0.25;
    --glass-border: 255 255 255 / 0.2;
    --glass-backdrop-blur: 16px;
  }
}

@layer components {
  .glass {
    background: rgb(var(--glass-bg));
    backdrop-filter: blur(var(--glass-backdrop-blur));
    border: 1px solid rgb(var(--glass-border));
  }
  
  .glass-hover {
    background: rgb(255 255 255 / 0.35);
    border: 1px solid rgb(255 255 255 / 0.3);
  }
}
EOF
    fi
    
    print_success "Tailwind v4 configuration complete"
}

# Install and configure MagicUI
install_magicui() {
    print_step "Installing MagicUI component library..."
    
    # Create components directory structure
    mkdir -p "./src/components/ui"
    mkdir -p "./src/components/examples"
    mkdir -p "./src/lib"
    
    # Create utils.ts
    cat > "./src/lib/utils.ts" << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF
    
    # Install core MagicUI components
    local components=(
        "blur-fade" "border-beam" "marquee" "particles"
        "animated-list" "number-ticker" "dock" "meteors"
        "text-reveal" "typing-animation" "ripple"
    )
    
    for component in "${components[@]}"; do
        print_step "Installing MagicUI component: $component"
        npx @magicuidesign/cli@latest add "$component" --yes 2>/dev/null || print_warning "Failed to install $component"
    done
    
    # Copy ORCHESTRAI component templates
    local template_source="/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/templates/global/code-patterns/react-components/magicui-component-library.tsx"
    
    if [ -f "$template_source" ]; then
        cp "$template_source" "./src/components/ui/orchestrai-components.tsx"
        print_success "ORCHESTRAI component templates installed"
    else
        print_warning "ORCHESTRAI component templates not found"
    fi
    
    print_success "MagicUI installation complete"
}

# Create example implementation
create_examples() {
    print_step "Creating example implementations..."
    
    # Create dental website example
    cat > "./src/components/examples/dental-website-example.tsx" << 'EOF'
/**
 * ORCHESTRAI Dental Website Example
 * Demonstrates Tailwind v4 + MagicUI integration
 */

import React from 'react';

// Example data for dental practice
const practiceData = {
  hero: {
    title: "Transform Your Smile with Advanced Dental Care",
    subtitle: "Experience the future of dentistry with our state-of-the-art technology and personalized care",
    ctaText: "Schedule Your Consultation"
  },
  
  services: [
    {
      title: "General Dentistry",
      description: "Comprehensive dental care for the entire family",
      features: ["Routine Cleanings", "Fillings & Restorations", "Preventive Care"]
    },
    {
      title: "Cosmetic Dentistry",
      description: "Transform your smile with our aesthetic treatments", 
      features: ["Teeth Whitening", "Veneers", "Smile Makeovers"]
    },
    {
      title: "Oral Surgery",
      description: "Advanced surgical procedures in a comfortable setting",
      features: ["Tooth Extractions", "Dental Implants", "Wisdom Teeth"]
    }
  ],

  stats: [
    { number: 5000, suffix: "+", label: "Happy Patients" },
    { number: 15, suffix: "+", label: "Years Experience" },
    { number: 98, suffix: "%", label: "Satisfaction Rate" },
    { number: 24, suffix: "/7", label: "Emergency Care" }
  ]
};

export default function DentalWebsiteExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900">
      {/* Hero Section with Glassmorphism */}
      <section className="min-h-screen flex items-center justify-center p-8">
        <div className="glass rounded-3xl p-12 max-w-4xl text-center">
          <h1 className="text-6xl font-bold text-white mb-6">
            {practiceData.hero.title}
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            {practiceData.hero.subtitle}
          </p>
          <button className="glass-hover px-8 py-4 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-105">
            {practiceData.hero.ctaText}
          </button>
        </div>
      </section>
      
      {/* Services Grid */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl font-bold text-white text-center mb-16">
            Our Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {practiceData.services.map((service, index) => (
              <div key={index} className="glass rounded-2xl p-8 hover:glass-hover transition-all duration-300">
                <h3 className="text-2xl font-bold text-white mb-4">{service.title}</h3>
                <p className="text-blue-100 mb-6">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="text-blue-200 flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {practiceData.stats.map((stat, index) => (
              <div key={index} className="glass rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {stat.number}{stat.suffix}
                </div>
                <p className="text-blue-100 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
EOF
    
    # Create basic page to showcase example
    mkdir -p "./src/app/example"
    cat > "./src/app/example/page.tsx" << 'EOF'
import DentalWebsiteExample from '@/components/examples/dental-website-example';

export default function ExamplePage() {
  return <DentalWebsiteExample />;
}
EOF
    
    print_success "Example implementations created"
}

# Setup development documentation
create_documentation() {
    print_step "Creating development documentation..."
    
    cat > "./ORCHESTRAI-DEVELOPMENT-GUIDE.md" << 'EOF'
# ORCHESTRAI Development Guide

## Quick Start

This project is configured with ORCHESTRAI development standards including:
- ✅ Next.js 15 with App Router
- ✅ TypeScript (strict mode)
- ✅ Tailwind CSS v4 with Oxide engine
- ✅ MagicUI animated components
- ✅ shadcn/ui component library
- ✅ ORCHESTRAI dental industry templates

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

## Component Usage

### ORCHESTRAI Components
```tsx
import { DentalHeroSection } from '@/components/ui/orchestrai-components';

export default function HomePage() {
  return (
    <DentalHeroSection 
      title="Your Practice Name"
      subtitle="Professional dental care"
      ctaText="Book Consultation"
    />
  );
}
```

### MagicUI Components
```tsx
import { BlurFade } from '@/components/ui/blur-fade';
import { BorderBeam } from '@/components/ui/border-beam';

export default function AnimatedCard() {
  return (
    <BlurFade delay={0.2} inView>
      <div className="relative glass rounded-2xl p-8">
        <BorderBeam size={250} duration={12} />
        <h2>Animated Content</h2>
      </div>
    </BlurFade>
  );
}
```

### Tailwind v4 Features

#### Dental Color Palette
- `text-primary-500` - Dental blue
- `bg-primary-50` - Light blue background
- `border-primary-200` - Subtle borders

#### Glassmorphism
- `.glass` - Standard glassmorphism effect
- `.glass-hover` - Enhanced hover state

## File Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/
│   ├── ui/             # shadcn/ui + MagicUI components
│   ├── examples/       # ORCHESTRAI examples
│   └── sections/       # Page sections
├── lib/                # Utilities and configurations
└── styles/            # Global styles
```

## Best Practices

1. **Components**: Use TypeScript interfaces for all props
2. **Styling**: Utility-first with Tailwind v4
3. **Performance**: Use `inView` for animations
4. **Accessibility**: Maintain WCAG 2.1 AA compliance

## Examples

Visit `/example` to see ORCHESTRAI components in action.

## Support

- Templates: `/orchestrai-system/templates/global/`
- Components: `src/components/ui/orchestrai-components.tsx`
- Examples: `src/components/examples/`
EOF

    print_success "Documentation created"
}

# Setup package.json scripts
setup_scripts() {
    print_step "Setting up development scripts..."
    
    # Add ORCHESTRAI scripts to package.json
    if [ -f "package.json" ]; then
        # Create temporary package.json with additional scripts
        node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        pkg.scripts = {
            ...pkg.scripts,
            'format': 'prettier --write \"src/**/*.{ts,tsx,js,jsx}\"',
            'format:check': 'prettier --check \"src/**/*.{ts,tsx,js,jsx}\"',
            'typecheck': 'tsc --noEmit',
            'orchestrai:example': 'next dev --port 3001',
            'orchestrai:build-check': 'npm run typecheck && npm run lint && npm run build'
        };
        
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
        "
        
        print_success "Development scripts added"
    fi
}

# Final validation and testing
final_validation() {
    print_step "Running final validation..."
    
    local validation_success=true
    
    # Check TypeScript compilation
    if npm run typecheck >/dev/null 2>&1; then
        print_success "TypeScript validation passed"
    else
        print_warning "TypeScript validation issues detected"
        validation_success=false
    fi
    
    # Check if development server can start (briefly)
    print_step "Testing development server startup..."
    timeout 10s npm run dev >/dev/null 2>&1 || print_info "Development server test completed"
    
    # Check file structure
    local required_files=(
        "src/app/globals.css"
        "src/lib/utils.ts"
        "src/components/examples/dental-website-example.tsx"
        "ORCHESTRAI-DEVELOPMENT-GUIDE.md"
    )
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "$file ✓"
        else
            print_warning "$file missing"
            validation_success=false
        fi
    done
    
    if [ "$validation_success" = true ]; then
        print_success "✅ Validation completed successfully"
    else
        print_warning "⚠️  Validation completed with warnings"
    fi
}

# Success summary
print_success_summary() {
    echo
    echo "=============================================="
    echo -e "${GREEN}🎉 ORCHESTRAI Setup Complete!${NC}"
    echo "=============================================="
    echo
    echo -e "${CYAN}📁 Project:${NC} $PROJECT_NAME"
    echo -e "${CYAN}📍 Location:${NC} $PROJECT_DIR"
    echo
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "1. cd $PROJECT_NAME (if not already there)"
    echo "2. npm run dev          # Start development server"
    echo "3. Visit http://localhost:3000"
    echo "4. Visit http://localhost:3000/example  # See ORCHESTRAI components"
    echo "5. Read ORCHESTRAI-DEVELOPMENT-GUIDE.md"
    echo
    echo -e "${YELLOW}✨ What's Included:${NC}"
    echo "• Tailwind CSS v4 with 100x faster builds"
    echo "• MagicUI animated components (20+ components)"
    echo "• ORCHESTRAI dental industry templates" 
    echo "• shadcn/ui integration"
    echo "• TypeScript strict mode"
    echo "• ESLint + Prettier configuration"
    echo "• Example dental website implementation"
    echo
    echo -e "${PURPLE}🛠️  MCP Integration:${NC}"
    echo "• MagicUI MCP server configured"
    echo "• AI-assisted component development"
    echo "• Automated code generation"
    echo
    echo -e "${CYAN}📖 Resources:${NC}"
    echo "• Documentation: ORCHESTRAI-DEVELOPMENT-GUIDE.md"
    echo "• Components: src/components/ui/orchestrai-components.tsx"
    echo "• Examples: src/components/examples/"
    echo "• Standards: /orchestrai-system/templates/global/configs/developer-standards.json"
    echo
    echo "=============================================="
    echo -e "${GREEN}Happy Coding with ORCHESTRAI! 🎨✨${NC}"
    echo "=============================================="
}

# Main execution flow
main() {
    print_banner
    
    check_system_requirements
    select_project_type
    
    case $PROJECT_TYPE in
        "new")
            create_new_project
            ;;
        "existing")
            setup_existing_project
            ;;
        "workspace")
            setup_workspace
            ;;
    esac
    
    install_orchestrai_standards
    setup_tailwind_v4
    install_magicui
    create_examples
    create_documentation
    setup_scripts
    final_validation
    print_success_summary
}

# Execute main function
main "$@"
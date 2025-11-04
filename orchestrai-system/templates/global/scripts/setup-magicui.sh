#!/bin/bash

# ===============================
# ORCHESTRAI MagicUI Setup Script
# Professional Animated Components Integration
# ===============================

set -e

echo "🎨 ORCHESTRAI - Setting up MagicUI Component Library"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Check if we're in a Next.js project
check_nextjs_project() {
    print_step "Checking for Next.js project..."
    
    if [ ! -f "package.json" ]; then
        print_error "No package.json found. Are you in a project directory?"
        exit 1
    fi
    
    if ! grep -q "next" package.json; then
        print_warning "This doesn't appear to be a Next.js project."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    print_success "Project structure validated"
}

# Install MagicUI components
install_magicui_components() {
    print_step "Installing core MagicUI components..."
    
    # Core animated components for dental websites
    local components=(
        "marquee"
        "border-beam" 
        "blur-fade"
        "particles"
        "animated-list"
        "number-ticker"
        "dock"
        "globe"
        "meteors"
        "text-reveal"
        "word-pull-up"
        "letter-pullup"
        "typing-animation"
        "gradual-spacing"
        "animated-beam"
        "animated-grid-pattern"
        "ripple"
        "rainbow-button"
        "shimmer-button"
        "animated-subscribe-button"
    )
    
    for component in "${components[@]}"; do
        print_step "Installing $component..."
        npx @magicuidesign/cli@latest add "$component" --yes
        
        if [ $? -eq 0 ]; then
            print_success "$component installed"
        else
            print_warning "Failed to install $component - continuing..."
        fi
    done
    
    print_success "MagicUI components installation completed"
}

# Setup Tailwind v4 integration
setup_tailwind_v4() {
    print_step "Setting up Tailwind CSS v4 integration..."
    
    # Check if Tailwind v4 is already installed
    if npm list tailwindcss | grep -q "4\."; then
        print_success "Tailwind CSS v4 already installed"
    else
        print_step "Installing Tailwind CSS v4..."
        npm install tailwindcss@next @tailwindcss/cli@next
        print_success "Tailwind CSS v4 installed"
    fi
    
    # Copy ORCHESTRAI Tailwind v4 globals
    print_step "Setting up ORCHESTRAI Tailwind v4 configuration..."
    
    local globals_source="/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/templates/global/styles/tailwind-v4-globals.css"
    local globals_target="./src/app/globals.css"
    
    if [ -f "$globals_source" ]; then
        cp "$globals_source" "$globals_target"
        print_success "ORCHESTRAI Tailwind v4 globals copied to $globals_target"
    else
        print_warning "ORCHESTRAI globals file not found at $globals_source"
    fi
}

# Setup component utilities
setup_component_utils() {
    print_step "Setting up component utilities..."
    
    # Create lib directory if it doesn't exist
    mkdir -p ./src/lib
    
    # Create utils.ts for className merging
    cat > ./src/lib/utils.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

    print_success "Component utilities created"
    
    # Install required dependencies
    print_step "Installing utility dependencies..."
    npm install clsx tailwind-merge lucide-react framer-motion
    npm install -D @types/react @types/react-dom
    
    print_success "Dependencies installed"
}

# Copy ORCHESTRAI component templates
copy_component_templates() {
    print_step "Copying ORCHESTRAI component templates..."
    
    local template_source="/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-system/templates/global/code-patterns/react-components/magicui-component-library.tsx"
    local template_target="./src/components/ui/orchestrai-components.tsx"
    
    # Create components directory
    mkdir -p ./src/components/ui
    
    if [ -f "$template_source" ]; then
        cp "$template_source" "$template_target"
        print_success "ORCHESTRAI component templates copied to $template_target"
    else
        print_warning "ORCHESTRAI component templates not found at $template_source"
    fi
}

# Create example usage file
create_example_usage() {
    print_step "Creating example usage file..."
    
    cat > ./src/components/examples/dental-website-example.tsx << 'EOF'
/**
 * ORCHESTRAI Dental Website Example
 * Demonstrates MagicUI + Tailwind v4 integration
 */

import React from 'react';
import {
  DentalHeroSection,
  DentalServiceCards,
  DentalEquipmentMarquee,
  DentalToolsDock,
  DentalStatsSection,
  DentalTestimonialsSection
} from '@/components/ui/orchestrai-components';

// Example dental practice data
const services = [
  {
    title: "General Dentistry",
    description: "Comprehensive dental care for the entire family",
    icon: <div className="w-12 h-12 bg-dental-blue-500 rounded-xl" />,
    features: ["Routine Cleanings", "Fillings & Restorations", "Preventive Care"]
  },
  {
    title: "Cosmetic Dentistry", 
    description: "Transform your smile with our aesthetic treatments",
    icon: <div className="w-12 h-12 bg-dental-blue-500 rounded-xl" />,
    features: ["Teeth Whitening", "Veneers", "Smile Makeovers"]
  },
  {
    title: "Oral Surgery",
    description: "Advanced surgical procedures in a comfortable setting",
    icon: <div className="w-12 h-12 bg-dental-blue-500 rounded-xl" />,
    features: ["Tooth Extractions", "Dental Implants", "Wisdom Teeth"]
  }
];

const equipment = [
  {
    name: "Digital X-Ray System",
    image: "/images/dental-xray.jpg",
    category: "Diagnostic",
    description: "High-resolution digital imaging with 90% less radiation"
  },
  {
    name: "3D Intraoral Scanner",
    image: "/images/intraoral-scanner.jpg", 
    category: "Digital Dentistry",
    description: "Precise digital impressions for crowns and aligners"
  }
];

const stats = [
  { number: 5000, suffix: "+", label: "Happy Patients" },
  { number: 15, suffix: "+", label: "Years Experience" },
  { number: 98, suffix: "%", label: "Satisfaction Rate" },
  { number: 24, suffix: "/7", label: "Emergency Care" }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    rating: 5,
    review: "Exceptional care and state-of-the-art technology. My smile has never looked better!",
    treatment: "Cosmetic Dentistry Package"
  },
  {
    name: "Mike Chen",
    rating: 5,
    review: "Professional, comfortable, and efficient. The digital technology made everything so much easier.",
    treatment: "Dental Implant Procedure"
  }
];

export default function DentalWebsiteExample() {
  return (
    <div className="min-h-screen bg-dental-dark">
      {/* Hero Section */}
      <DentalHeroSection
        title="Transform Your Smile with Advanced Dental Care"
        subtitle="Experience the future of dentistry with our state-of-the-art technology and personalized care"
        ctaText="Book Your Consultation"
        particleCount={75}
      />
      
      {/* Services */}
      <DentalServiceCards services={services} />
      
      {/* Equipment Showcase */}
      <DentalEquipmentMarquee equipment={equipment} />
      
      {/* Statistics */}
      <DentalStatsSection stats={stats} />
      
      {/* Testimonials */}
      <DentalTestimonialsSection testimonials={testimonials} />
    </div>
  );
}
EOF

    mkdir -p ./src/components/examples
    print_success "Example usage file created at ./src/components/examples/dental-website-example.tsx"
}

# Create development documentation
create_documentation() {
    print_step "Creating development documentation..."
    
    cat > ./ORCHESTRAI-MAGICUI-GUIDE.md << 'EOF'
# ORCHESTRAI MagicUI Integration Guide

## Quick Start

```tsx
import { DentalHeroSection, DentalServiceCards } from '@/components/ui/orchestrai-components';

export default function MyPage() {
  return (
    <div>
      <DentalHeroSection 
        title="Your Practice Name"
        subtitle="Professional dental care with modern technology"
      />
    </div>
  );
}
```

## Available Components

### Hero Components
- `DentalHeroSection` - Animated hero with particles
- `DentalServiceCards` - Service showcase with border beams
- `DentalEquipmentMarquee` - Equipment display with smooth scrolling

### Interactive Components  
- `DentalToolsDock` - macOS-style dock interface
- `DentalStatsSection` - Animated statistics counters
- `DentalTestimonialsSection` - Patient review animations

## Tailwind v4 Integration

The setup automatically configures:
- Dental industry color palette (`dental-blue-*`, `dental-success`, etc.)
- Glassmorphism utilities (`.glass`, `.glass-hover`)
- Advanced animation utilities
- Core Web Vitals optimized classes

## MCP Server Integration

MagicUI components are accessible through the MCP server:
- Real-time component suggestions
- AI-assisted customization
- Automatic code generation

## Best Practices

1. **Performance**: Use `inView` prop for animations
2. **Accessibility**: All components include ARIA labels
3. **Responsive**: Components adapt to all screen sizes
4. **SEO**: Semantic HTML structure maintained

## Development Commands

```bash
# Add new MagicUI component
npx @magicuidesign/cli@latest add component-name

# Start development server
npm run dev

# Build for production  
npm run build
```
EOF

    print_success "Documentation created at ./ORCHESTRAI-MAGICUI-GUIDE.md"
}

# Verify installation
verify_installation() {
    print_step "Verifying installation..."
    
    local success_count=0
    local total_checks=4
    
    # Check if MagicUI components directory exists
    if [ -d "./src/components/ui" ]; then
        print_success "Components directory created"
        ((success_count++))
    else
        print_error "Components directory missing"
    fi
    
    # Check if utils.ts exists
    if [ -f "./src/lib/utils.ts" ]; then
        print_success "Utility functions created" 
        ((success_count++))
    else
        print_error "Utility functions missing"
    fi
    
    # Check if globals.css exists
    if [ -f "./src/app/globals.css" ]; then
        print_success "Tailwind v4 globals configured"
        ((success_count++))
    else
        print_error "Tailwind v4 globals missing"
    fi
    
    # Check if documentation exists
    if [ -f "./ORCHESTRAI-MAGICUI-GUIDE.md" ]; then
        print_success "Documentation created"
        ((success_count++))
    else
        print_error "Documentation missing"
    fi
    
    echo
    echo "============================================"
    if [ $success_count -eq $total_checks ]; then
        print_success "✅ ORCHESTRAI MagicUI setup completed successfully!"
        echo -e "${GREEN}🎨 You can now use professional animated components in your dental websites${NC}"
        echo -e "${BLUE}📖 Check ORCHESTRAI-MAGICUI-GUIDE.md for usage examples${NC}"
        echo -e "${YELLOW}🚀 Run 'npm run dev' to start developing with MagicUI${NC}"
    else
        print_warning "⚠️  Setup completed with $success_count/$total_checks checks passing"
        print_warning "Some features may not work correctly. Check the errors above."
    fi
    echo "============================================"
}

# Main execution flow
main() {
    echo "🎯 Starting ORCHESTRAI MagicUI integration..."
    echo
    
    check_nextjs_project
    install_magicui_components
    setup_tailwind_v4
    setup_component_utils
    copy_component_templates
    create_example_usage
    create_documentation
    verify_installation
    
    echo
    print_success "🎉 ORCHESTRAI MagicUI setup completed!"
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Review ./ORCHESTRAI-MAGICUI-GUIDE.md"
    echo "2. Check ./src/components/examples/dental-website-example.tsx" 
    echo "3. Start development: npm run dev"
    echo "4. Import components: import { DentalHeroSection } from '@/components/ui/orchestrai-components'"
}

# Run main function
main "$@"
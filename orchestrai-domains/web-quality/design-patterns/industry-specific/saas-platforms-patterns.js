/**
 * SaaS Platforms Industry Design Patterns
 * 
 * Design patterns specifically for Software as a Service platforms,
 * focusing on user onboarding, feature discovery, and subscription models.
 */

class SaasPlatformsDesignPatterns {
  constructor() {
    this.industryId = 'saas_platforms';
    this.patternVersion = '1.0.0';
    this.lastUpdated = new Date().toISOString();
    
    this.visualMetaphors = this.initializeVisualMetaphors();
    this.componentPatterns = this.initializeComponentPatterns();
    this.colorPalettes = this.initializeColorPalettes();
    this.animationPatterns = this.initializeAnimationPatterns();
    this.onboardingPatterns = this.initializeOnboardingPatterns();
    this.pricingPatterns = this.initializePricingPatterns();
  }

  initializeVisualMetaphors() {
    return {
      connectivity: {
        description: 'Visual representations of system integrations and connections',
        components: [
          {
            name: 'integration-network',
            purpose: 'Show app integrations and API connections',
            implementation: 'Animated network of connected nodes',
            parameters: {
              nodes: 8,
              connectionStyle: 'bezier-curves',
              animationDuration: 4000,
              colors: ['#3B82F6', '#10B981', '#F59E0B']
            },
            usage: 'Integrations page, API documentation'
          },
          {
            name: 'data-sync-animation',
            purpose: 'Visualize data synchronization between systems',
            implementation: 'Bidirectional animated beams',
            parameters: {
              direction: 'bidirectional',
              speed: 2000,
              color: '#10B981',
              opacity: [0.3, 0.8, 0.3]
            },
            usage: 'Sync status indicators, real-time updates'
          }
        ]
      },
      
      efficiency: {
        description: 'Metaphors that convey speed, automation, and efficiency',
        components: [
          {
            name: 'workflow-automation',
            purpose: 'Represent automated workflows and processes',
            implementation: 'Sequential animation with checkmarks',
            parameters: {
              steps: 4,
              duration: 3000,
              checkmarkDelay: 500,
              color: '#10B981'
            },
            usage: 'Automation features, workflow builders'
          },
          {
            name: 'performance-meter',
            purpose: 'Show system performance and efficiency gains',
            implementation: 'Animated progress indicators',
            parameters: {
              type: 'radial',
              startValue: 0,
              endValue: 95,
              duration: 2000,
              color: '#3B82F6'
            },
            usage: 'Performance dashboards, ROI calculators'
          }
        ]
      },
      
      scalability: {
        description: 'Visual representations of growth and scalability',
        components: [
          {
            name: 'growth-trajectory',
            purpose: 'Illustrate business growth and scaling',
            implementation: 'Animated line chart with particles',
            parameters: {
              dataPoints: [10, 25, 45, 70, 90],
              animationDuration: 3000,
              particleCount: 20,
              gradient: ['#3B82F6', '#10B981']
            },
            usage: 'Growth metrics, success stories'
          }
        ]
      }
    };
  }

  initializeComponentPatterns() {
    return {
      navigationComponents: {
        sidebarWithSearch: {
          structure: `
            <nav className="saas-sidebar">
              <div className="sidebar-header">
                <Logo />
                <SearchBar placeholder="Search features..." />
              </div>
              <div className="nav-sections">
                <NavSection title="Workspace">
                  <NavItem icon={Dashboard} href="/dashboard">Dashboard</NavItem>
                  <NavItem icon={Analytics} href="/analytics">Analytics</NavItem>
                </NavSection>
                <NavSection title="Tools">
                  <NavItem icon={Settings} href="/settings">Settings</NavItem>
                </NavSection>
              </div>
              <div className="sidebar-footer">
                <UpgradePrompt />
              </div>
            </nav>
          `,
          styling: {
            base: 'bg-white border-r border-gray-200 w-64 h-screen flex flex-col',
            sections: 'space-y-6 flex-1 px-4 py-6',
            search: 'mb-6 px-4'
          }
        },
        
        breadcrumbNavigation: {
          structure: `
            <nav className="breadcrumb-nav">
              <ol className="breadcrumb-list">
                {breadcrumbs.map((crumb, index) => (
                  <li key={index} className="breadcrumb-item">
                    {index < breadcrumbs.length - 1 ? (
                      <Link href={crumb.href}>{crumb.label}</Link>
                    ) : (
                      <span className="current">{crumb.label}</span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <ChevronRight className="separator" />
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          `,
          styling: {
            base: 'flex items-center space-x-2 text-sm text-gray-600',
            separator: 'w-4 h-4 text-gray-400',
            current: 'text-gray-900 font-medium'
          }
        }
      },
      
      featureComponents: {
        featureCard: {
          structure: `
            <div className="feature-card">
              <div className="feature-icon">
                <Icon className="icon" />
              </div>
              <div className="feature-content">
                <h3 className="feature-title">{title}</h3>
                <p className="feature-description">{description}</p>
                <div className="feature-actions">
                  <Button variant="outline">Learn More</Button>
                  <Button variant="default">Try Now</Button>
                </div>
              </div>
              {isPremium && <Badge variant="premium">Pro</Badge>}
            </div>
          `,
          styling: {
            base: 'bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300',
            icon: 'w-12 h-12 text-blue-600 mb-4',
            premium: 'absolute top-4 right-4'
          }
        },
        
        statsCard: {
          structure: `
            <div className="stats-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <Icon />
                </div>
                <div className="stat-period">
                  <PeriodSelector />
                </div>
              </div>
              <div className="stat-value">
                <AnimatedCounter value={value} />
                <TrendIndicator trend={trend} />
              </div>
              <div className="stat-label">{label}</div>
              <div className="stat-chart">
                <MiniChart data={chartData} />
              </div>
            </div>
          `,
          styling: {
            base: 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6',
            value: 'text-3xl font-bold text-gray-900',
            trend: 'ml-2 text-sm',
            chart: 'mt-4 h-16'
          }
        }
      },
      
      onboardingComponents: {
        progressStepper: {
          structure: `
            <div className="onboarding-stepper">
              <div className="steps-container">
                {steps.map((step, index) => (
                  <div 
                    key={index} 
                    className={cn("step", {
                      "completed": index < currentStep,
                      "current": index === currentStep,
                      "pending": index > currentStep
                    })}
                  >
                    <div className="step-indicator">
                      {index < currentStep ? (
                        <CheckIcon />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                    </div>
                    <div className="step-content">
                      <div className="step-title">{step.title}</div>
                      <div className="step-description">{step.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          `,
          styling: {
            base: 'space-y-6',
            indicator: 'w-8 h-8 rounded-full flex items-center justify-center',
            completed: 'bg-green-600 text-white',
            current: 'bg-blue-600 text-white',
            pending: 'bg-gray-200 text-gray-600'
          }
        }
      }
    };
  }

  initializeColorPalettes() {
    return {
      modernSaaS: {
        name: 'Modern SaaS',
        description: 'Clean, modern colors for SaaS platforms',
        palette: {
          primary: '#3B82F6',      // SaaS Blue
          secondary: '#10B981',    // Success Green
          accent: '#8B5CF6',       // Feature Purple
          neutral: '#6B7280',      // Professional Gray
          background: '#FFFFFF',   // Clean White
          surface: '#F9FAFB',      // Light Surface
          border: '#E5E7EB',       // Subtle Border
          muted: '#9CA3AF'         // Muted Text
        },
        semanticColors: {
          success: '#10B981',      // Feature Success
          warning: '#F59E0B',      // Usage Warning
          danger: '#EF4444',       // Error Red
          info: '#3B82F6',         // Information
          premium: '#8B5CF6'       // Premium Features
        },
        gradients: {
          hero: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
          feature: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
          premium: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
        }
      },
      
      trustWorthy: {
        name: 'Trustworthy Enterprise',
        description: 'Colors that convey reliability and enterprise-grade security',
        palette: {
          primary: '#1E40AF',      // Trust Blue
          secondary: '#059669',    // Reliable Green
          accent: '#DC2626',       // Alert Red
          neutral: '#374151',      // Professional Dark
          background: '#FFFFFF',   // Pure White
          surface: '#F3F4F6',      // Light Gray
          border: '#D1D5DB',       // Border Gray
          muted: '#6B7280'         // Muted Gray
        }
      }
    };
  }

  initializeAnimationPatterns() {
    return {
      featureDiscovery: {
        tooltipReveal: {
          description: 'Progressive feature discovery through tooltips',
          implementation: 'Framer Motion with spring animations',
          framerMotion: {
            initial: { opacity: 0, scale: 0.8, y: -10 },
            animate: { opacity: 1, scale: 1, y: 0 },
            exit: { opacity: 0, scale: 0.8, y: -10 },
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 30
            }
          }
        },
        
        featureHighlight: {
          description: 'Subtle highlight animation for new features',
          implementation: 'Pulsing glow effect',
          keyframes: `
            @keyframes featureGlow {
              0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
              50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.6); }
            }
          `,
          duration: '2s',
          timing: 'ease-in-out',
          iteration: 'infinite'
        }
      },
      
      userFeedback: {
        successAnimation: {
          description: 'Satisfying success confirmation',
          implementation: 'Scale and fade with checkmark',
          framerMotion: {
            initial: { scale: 0.8, opacity: 0 },
            animate: { scale: 1, opacity: 1 },
            transition: {
              type: "spring",
              stiffness: 800,
              damping: 20
            }
          }
        },
        
        loadingStates: {
          description: 'Skeleton loading for better perceived performance',
          implementation: 'Shimmer animation on placeholder elements',
          keyframes: `
            @keyframes shimmer {
              0% { background-position: -200px 0; }
              100% { background-position: calc(200px + 100%) 0; }
            }
          `,
          background: 'linear-gradient(90deg, #f0f0f0 0px, #e0e0e0 40px, #f0f0f0 80px)',
          animation: 'shimmer 1.5s ease-in-out infinite'
        }
      }
    };
  }

  initializeOnboardingPatterns() {
    return {
      progressiveOnboarding: {
        welcomeTour: {
          description: 'Step-by-step product tour for new users',
          steps: [
            {
              target: '[data-tour="dashboard"]',
              title: 'Welcome to your dashboard',
              content: 'This is where you\'ll see all your key metrics at a glance.',
              placement: 'bottom'
            },
            {
              target: '[data-tour="navigation"]',
              title: 'Navigate your workspace',
              content: 'Use this sidebar to access all features and tools.',
              placement: 'right'
            },
            {
              target: '[data-tour="search"]',
              title: 'Quick search',
              content: 'Find any feature or data instantly with our search.',
              placement: 'bottom'
            }
          ],
          styling: {
            overlay: 'bg-black/50 backdrop-blur-sm',
            tooltip: 'bg-white border border-gray-200 rounded-lg shadow-lg p-6 max-w-sm',
            highlight: 'ring-4 ring-blue-500/50 rounded-lg'
          }
        },
        
        checklist: {
          description: 'Gamified setup checklist',
          items: [
            {
              id: 'profile',
              title: 'Complete your profile',
              description: 'Add your photo and basic information',
              reward: '10 points',
              estimatedTime: '2 minutes'
            },
            {
              id: 'integration',
              title: 'Connect your first integration',
              description: 'Link your existing tools and data sources',
              reward: '25 points',
              estimatedTime: '5 minutes'
            },
            {
              id: 'dashboard',
              title: 'Customize your dashboard',
              description: 'Arrange widgets to match your workflow',
              reward: '15 points',
              estimatedTime: '3 minutes'
            }
          ]
        }
      },
      
      contextualHelp: {
        smartTips: {
          description: 'Context-aware help tips based on user behavior',
          triggers: [
            {
              condition: 'user_idle_5_minutes',
              message: 'Need help getting started? Check out our quick tutorial.',
              action: 'Show tutorial'
            },
            {
              condition: 'feature_unused_7_days',
              message: 'Did you know you can automate this process?',
              action: 'Show automation guide'
            }
          ]
        }
      }
    };
  }

  initializePricingPatterns() {
    return {
      pricingTables: {
        tieredPricing: {
          structure: `
            <div className="pricing-grid">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={cn("pricing-card", {
                    "popular": plan.popular,
                    "enterprise": plan.enterprise
                  })}
                >
                  {plan.popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                    <div className="plan-price">
                      <span className="currency">$</span>
                      <span className="amount">{plan.price}</span>
                      <span className="period">/{plan.period}</span>
                    </div>
                    <p className="plan-description">{plan.description}</p>
                  </div>
                  <div className="plan-features">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckIcon className="feature-check" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="plan-button" 
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              ))}
            </div>
          `,
          styling: {
            grid: 'grid grid-cols-1 md:grid-cols-3 gap-8',
            card: 'bg-white border border-gray-200 rounded-xl p-8 relative',
            popular: 'ring-2 ring-blue-500 transform scale-105',
            badge: 'absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm'
          }
        }
      },
      
      usageMetrics: {
        quotaIndicator: {
          description: 'Visual representation of usage limits',
          component: 'ProgressBar with gradient and labels',
          variants: [
            { level: 'low', color: 'green', threshold: '< 50%' },
            { level: 'medium', color: 'yellow', threshold: '50-80%' },
            { level: 'high', color: 'red', threshold: '> 80%' }
          ]
        }
      }
    };
  }

  // Utility methods similar to BusinessIntelligenceDesignPatterns
  getPattern(category, patternName) {
    try {
      return this[category]?.[patternName] || null;
    } catch (error) {
      console.error(`Error getting pattern ${category}.${patternName}:`, error);
      return null;
    }
  }

  getCategoryPatterns(category) {
    try {
      return this[category] || {};
    } catch (error) {
      console.error(`Error getting category ${category}:`, error);
      return {};
    }
  }

  getRecommendedPatterns(useCase) {
    const recommendations = {
      'user-onboarding': [
        { category: 'onboardingPatterns', pattern: 'progressiveOnboarding' },
        { category: 'animationPatterns', pattern: 'featureDiscovery' },
        { category: 'colorPalettes', pattern: 'modernSaaS' }
      ],
      'feature-dashboard': [
        { category: 'componentPatterns', pattern: 'featureCard' },
        { category: 'visualMetaphors', pattern: 'efficiency' },
        { category: 'animationPatterns', pattern: 'userFeedback' }
      ],
      'pricing-page': [
        { category: 'pricingPatterns', pattern: 'tieredPricing' },
        { category: 'colorPalettes', pattern: 'trustWorthy' },
        { category: 'componentPatterns', pattern: 'statsCard' }
      ]
    };

    return recommendations[useCase] || [];
  }

  exportPatterns() {
    return {
      industryId: this.industryId,
      version: this.patternVersion,
      lastUpdated: this.lastUpdated,
      patterns: {
        visualMetaphors: this.visualMetaphors,
        componentPatterns: this.componentPatterns,
        colorPalettes: this.colorPalettes,
        animationPatterns: this.animationPatterns,
        onboardingPatterns: this.onboardingPatterns,
        pricingPatterns: this.pricingPatterns
      }
    };
  }
}

module.exports = SaasPlatformsDesignPatterns;
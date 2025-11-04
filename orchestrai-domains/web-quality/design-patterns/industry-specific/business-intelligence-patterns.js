/**
 * Business Intelligence Industry Design Patterns
 * 
 * Comprehensive design patterns specifically for business intelligence,
 * data analytics, and customer intelligence platforms like QuartzIQ.
 */

class BusinessIntelligenceDesignPatterns {
  constructor() {
    this.industryId = 'business_intelligence';
    this.patternVersion = '1.0.0';
    this.lastUpdated = new Date().toISOString();
    
    this.visualMetaphors = this.initializeVisualMetaphors();
    this.componentPatterns = this.initializeComponentPatterns();
    this.colorPalettes = this.initializeColorPalettes();
    this.animationPatterns = this.initializeAnimationPatterns();
    this.layoutPatterns = this.initializeLayoutPatterns();
    this.interactionPatterns = this.initializeInteractionPatterns();
  }

  initializeVisualMetaphors() {
    return {
      dataFlow: {
        description: 'Visual representations of data movement and processing',
        components: [
          {
            name: 'animated-beams',
            purpose: 'Show data connections between systems',
            implementation: 'MagicUI AnimatedBeam with custom gradients',
            parameters: {
              duration: 3000,
              gradientColors: ['#3B82F6', '#10B981'],
              pathWidth: 2,
              curvature: 50
            },
            usage: 'Connect data sources to analytics dashboard'
          },
          {
            name: 'particle-data-streams',
            purpose: 'Represent real-time data ingestion',
            implementation: 'Canvas-based particle system',
            parameters: {
              particleCount: 60,
              velocity: { x: 1, y: 0.5 },
              color: '#3B82F6',
              size: 2
            },
            usage: 'Background animation for data processing sections'
          }
        ]
      },
      
      networkConnections: {
        description: 'Visualizing relationships between data points',
        components: [
          {
            name: 'orbiting-circles',
            purpose: 'Show interconnected business entities',
            implementation: 'MagicUI OrbitingCircles around central hub',
            parameters: {
              radius: 120,
              duration: 20000,
              reverse: false,
              circles: [
                { size: 20, color: '#3B82F6', delay: 0 },
                { size: 15, color: '#10B981', delay: 5000 },
                { size: 18, color: '#F59E0B', delay: 10000 }
              ]
            },
            usage: 'Customer intelligence platform overview'
          }
        ]
      },
      
      analyticalPatterns: {
        description: 'Patterns that convey data analysis and insights',
        components: [
          {
            name: 'metric-cards-with-trends',
            purpose: 'Display KPIs with visual trend indicators',
            implementation: 'Glassmorphism cards with micro-animations',
            parameters: {
              backdropBlur: 'blur(16px)',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)'
            },
            usage: 'Dashboard metric displays'
          }
        ]
      }
    };
  }

  initializeComponentPatterns() {
    return {
      dashboardComponents: {
        metricCard: {
          structure: `
            <div className="metric-card">
              <div className="metric-header">
                <Icon className="metric-icon" />
                <h3 className="metric-title">{title}</h3>
              </div>
              <div className="metric-value">
                <span className="primary-value">{value}</span>
                <TrendIndicator trend={trend} />
              </div>
              <div className="metric-subtitle">{subtitle}</div>
            </div>
          `,
          styling: {
            base: 'bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6',
            hover: 'hover:bg-white/10 transition-all duration-300',
            animation: 'animate-in slide-in-from-bottom-4 duration-500'
          },
          variants: [
            'primary', 'secondary', 'success', 'warning', 'danger'
          ]
        },
        
        dataVisualizationContainer: {
          structure: `
            <div className="visualization-container">
              <div className="viz-header">
                <h2 className="viz-title">{title}</h2>
                <div className="viz-controls">
                  <TimeRangeSelector />
                  <ExportButton />
                </div>
              </div>
              <div className="viz-content">
                <Chart data={data} type={chartType} />
              </div>
            </div>
          `,
          styling: {
            base: 'bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8',
            hover: 'hover:shadow-lg transition-shadow duration-300',
            responsive: 'responsive grid-responsive'
          }
        },
        
        insightCard: {
          structure: `
            <div className="insight-card">
              <div className="insight-indicator">
                <div className="insight-pulse"></div>
                <Badge variant="insight">AI Insight</Badge>
              </div>
              <h3 className="insight-title">{title}</h3>
              <p className="insight-description">{description}</p>
              <div className="insight-actions">
                <Button variant="outline">Learn More</Button>
                <Button variant="default">Apply Recommendation</Button>
              </div>
            </div>
          `,
          styling: {
            base: 'bg-blue-50/50 border border-blue-200 rounded-xl p-6',
            pulse: 'animate-pulse bg-blue-400 w-3 h-3 rounded-full',
            gradient: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10'
          }
        }
      },
      
      navigationComponents: {
        sidebarNavigation: {
          structure: `
            <nav className="bi-sidebar">
              <div className="sidebar-header">
                <Logo />
                <div className="workspace-selector">
                  <WorkspaceDropdown />
                </div>
              </div>
              <div className="sidebar-content">
                <NavSection title="Analytics">
                  <NavItem icon={BarChart} href="/dashboard">Dashboard</NavItem>
                  <NavItem icon={TrendingUp} href="/insights">Insights</NavItem>
                </NavSection>
              </div>
            </nav>
          `,
          styling: {
            base: 'bg-slate-900 text-white w-64 h-screen fixed left-0 top-0',
            glassmorphism: 'bg-white/10 backdrop-blur-xl border-r border-white/20',
            transitions: 'transition-all duration-300 ease-in-out'
          }
        }
      }
    };
  }

  initializeColorPalettes() {
    return {
      dataDriven: {
        name: 'Data-Driven Professional',
        description: 'Colors that convey trust, intelligence, and data clarity',
        palette: {
          primary: '#3B82F6',      // Trust Blue
          secondary: '#10B981',    // Success Green
          accent: '#F59E0B',       // Insight Orange
          neutral: '#64748B',      // Professional Gray
          background: '#F8FAFC',   // Clean White
          surface: '#FFFFFF',      // Pure White
          border: '#E2E8F0',       // Subtle Gray
          muted: '#94A3B8'         // Muted Gray
        },
        semanticColors: {
          success: '#10B981',      // Data Success
          warning: '#F59E0B',      // Alert Orange
          danger: '#EF4444',       // Error Red
          info: '#3B82F6',         // Information Blue
          insight: '#8B5CF6'       // AI Insight Purple
        },
        gradients: {
          dataFlow: 'linear-gradient(135deg, #3B82F6 0%, #10B981 100%)',
          insight: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          performance: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
        }
      },
      
      enterpriseMinimal: {
        name: 'Enterprise Minimal',
        description: 'Clean, professional color scheme for enterprise environments',
        palette: {
          primary: '#1E293B',      // Enterprise Dark
          secondary: '#475569',    // Professional Gray
          accent: '#0EA5E9',       // Corporate Blue
          neutral: '#64748B',      // Balanced Gray
          background: '#FFFFFF',   // Clean Background
          surface: '#F8FAFC',      // Light Surface
          border: '#E2E8F0',       // Light Border
          muted: '#94A3B8'         // Muted Text
        }
      }
    };
  }

  initializeAnimationPatterns() {
    return {
      dataLoadingPatterns: {
        pulseIndicators: {
          description: 'Subtle pulse animations for live data indicators',
          implementation: 'CSS keyframes with Framer Motion',
          keyframes: `
            @keyframes dataPulse {
              0%, 100% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.05); }
            }
          `,
          framerMotion: {
            animate: {
              scale: [1, 1.05, 1],
              opacity: [0.8, 1, 0.8]
            },
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        },
        
        dataStreamAnimation: {
          description: 'Flowing animation for data processing visualization',
          implementation: 'SVG path animation with Framer Motion',
          svgPath: 'M10,50 Q50,10 90,50 T170,50',
          animation: {
            strokeDasharray: '5 5',
            strokeDashoffset: [0, 20],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }
          }
        }
      },
      
      hoverInteractions: {
        cardLift: {
          description: 'Subtle lift animation for interactive cards',
          framerMotion: {
            whileHover: {
              y: -2,
              scale: 1.02,
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
            },
            transition: {
              duration: 0.2,
              ease: "easeOut"
            }
          }
        },
        
        buttonPress: {
          description: 'Satisfying press animation for action buttons',
          framerMotion: {
            whileTap: { scale: 0.95 },
            whileHover: { scale: 1.05 },
            transition: { type: "spring", stiffness: 400, damping: 17 }
          }
        }
      }
    };
  }

  initializeLayoutPatterns() {
    return {
      dashboardLayouts: {
        executiveSummary: {
          description: 'High-level overview layout for executives',
          gridStructure: {
            desktop: 'grid-cols-12',
            tablet: 'grid-cols-8',
            mobile: 'grid-cols-4'
          },
          sections: [
            { name: 'kpi-overview', colspan: { desktop: 12, tablet: 8, mobile: 4 } },
            { name: 'primary-metrics', colspan: { desktop: 8, tablet: 5, mobile: 4 } },
            { name: 'trend-analysis', colspan: { desktop: 4, tablet: 3, mobile: 4 } },
            { name: 'insights-panel', colspan: { desktop: 12, tablet: 8, mobile: 4 } }
          ]
        },
        
        analystWorkspace: {
          description: 'Detailed analysis layout for data analysts',
          gridStructure: {
            desktop: 'grid-cols-16',
            tablet: 'grid-cols-12',
            mobile: 'grid-cols-4'
          },
          sections: [
            { name: 'filters-panel', colspan: { desktop: 4, tablet: 4, mobile: 4 } },
            { name: 'main-visualization', colspan: { desktop: 8, tablet: 8, mobile: 4 } },
            { name: 'data-details', colspan: { desktop: 4, tablet: 12, mobile: 4 } }
          ]
        }
      },
      
      responsivePatterns: {
        stackingOrder: {
          desktop: ['header', 'metrics', 'visualizations', 'insights'],
          tablet: ['header', 'metrics', 'insights', 'visualizations'],
          mobile: ['header', 'key-metric', 'insights', 'visualizations']
        },
        
        containerSizing: {
          maxWidth: '1400px',
          padding: {
            desktop: '2rem',
            tablet: '1.5rem',
            mobile: '1rem'
          },
          gaps: {
            desktop: '2rem',
            tablet: '1.5rem',
            mobile: '1rem'
          }
        }
      }
    };
  }

  initializeInteractionPatterns() {
    return {
      dataExploration: {
        drillDown: {
          description: 'Progressive disclosure for data exploration',
          pattern: 'Click metric card → Expanded view → Detailed breakdown',
          implementation: {
            trigger: 'onClick',
            animation: 'slide-in-from-right',
            duration: 300,
            easing: 'ease-out'
          }
        },
        
        hoverInsights: {
          description: 'Contextual information on hover',
          pattern: 'Hover data point → Tooltip with additional context',
          implementation: {
            trigger: 'onMouseEnter',
            position: 'dynamic',
            content: 'metric + trend + comparison'
          }
        }
      },
      
      workflowPatterns: {
        dataFiltering: {
          description: 'Intuitive data filtering interface',
          steps: [
            'Select time range',
            'Choose data dimensions',
            'Apply filters',
            'View results with loading state'
          ],
          feedback: 'Real-time result count updates'
        }
      }
    };
  }

  // Get specific pattern by category and name
  getPattern(category, patternName) {
    try {
      return this[category]?.[patternName] || null;
    } catch (error) {
      console.error(`Error getting pattern ${category}.${patternName}:`, error);
      return null;
    }
  }

  // Get all patterns for a specific category
  getCategoryPatterns(category) {
    try {
      return this[category] || {};
    } catch (error) {
      console.error(`Error getting category ${category}:`, error);
      return {};
    }
  }

  // Get recommended patterns for a specific use case
  getRecommendedPatterns(useCase) {
    const recommendations = {
      'customer-intelligence-dashboard': [
        { category: 'componentPatterns', pattern: 'metricCard' },
        { category: 'visualMetaphors', pattern: 'networkConnections' },
        { category: 'colorPalettes', pattern: 'dataDriven' },
        { category: 'animationPatterns', pattern: 'dataLoadingPatterns' }
      ],
      'executive-summary': [
        { category: 'layoutPatterns', pattern: 'executiveSummary' },
        { category: 'componentPatterns', pattern: 'insightCard' },
        { category: 'colorPalettes', pattern: 'enterpriseMinimal' }
      ],
      'data-analysis-workspace': [
        { category: 'layoutPatterns', pattern: 'analystWorkspace' },
        { category: 'interactionPatterns', pattern: 'dataExploration' },
        { category: 'visualMetaphors', pattern: 'dataFlow' }
      ]
    };

    return recommendations[useCase] || [];
  }

  // Generate implementation guide for a pattern
  generateImplementationGuide(category, patternName) {
    const pattern = this.getPattern(category, patternName);
    if (!pattern) return null;

    return {
      pattern: pattern,
      implementation: {
        dependencies: this.getRequiredDependencies(pattern),
        codeExample: this.generateCodeExample(pattern),
        styling: this.generateStylingGuide(pattern),
        bestPractices: this.getBestPractices(category, patternName)
      }
    };
  }

  getRequiredDependencies(pattern) {
    const dependencies = ['@tailwindcss/typography', 'framer-motion', 'lucide-react'];
    
    if (pattern.implementation?.includes('MagicUI')) {
      dependencies.push('@magicui/react');
    }
    
    if (pattern.implementation?.includes('Canvas')) {
      dependencies.push('react-canvas-draw');
    }

    return dependencies;
  }

  generateCodeExample(pattern) {
    // This would generate actual code examples based on the pattern
    return {
      tsx: `// Implementation example for ${pattern.name || 'pattern'}`,
      css: `/* Styling for ${pattern.name || 'pattern'} */`,
      usage: `// Usage example`
    };
  }

  generateStylingGuide(pattern) {
    return {
      baseClasses: pattern.styling?.base || '',
      variants: pattern.styling?.variants || [],
      responsive: pattern.styling?.responsive || ''
    };
  }

  getBestPractices(category, patternName) {
    const generalPractices = [
      'Ensure accessibility compliance (ARIA labels, keyboard navigation)',
      'Test across different screen sizes and devices',
      'Optimize for performance (lazy loading, efficient animations)',
      'Maintain consistent visual hierarchy'
    ];

    const categorySpecific = {
      visualMetaphors: [
        'Use meaningful metaphors that align with user mental models',
        'Avoid overly complex animations that distract from data'
      ],
      colorPalettes: [
        'Ensure sufficient color contrast for accessibility',
        'Test color combinations for colorblind users'
      ],
      animationPatterns: [
        'Keep animations subtle and purposeful',
        'Provide options to reduce motion for accessibility'
      ]
    };

    return [
      ...generalPractices,
      ...(categorySpecific[category] || [])
    ];
  }

  // Export patterns for integration with other systems
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
        layoutPatterns: this.layoutPatterns,
        interactionPatterns: this.interactionPatterns
      }
    };
  }
}

module.exports = BusinessIntelligenceDesignPatterns;
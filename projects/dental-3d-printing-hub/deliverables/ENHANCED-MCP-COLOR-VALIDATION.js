/**
 * ENHANCED MCP COLOR VALIDATION SYSTEM
 * 
 * Advanced color contrast and readability detection system to prevent
 * the dark mode text visibility issues we encountered.
 * 
 * ORCHESTRAI Web Quality Enhancement
 */

'use strict';

// ===== ENHANCED COLOR VALIDATION CONFIGURATION =====
const colorValidationConfig = {
    baseUrl: 'http://localhost:8080',
    testPages: [
        '/',
        '/articles/complete-guide-dental-3d-printing.html',
        '/articles/how-to-choose-dental-3d-printer.html'
    ],
    colorSchemes: ['light', 'dark', 'high-contrast'],
    contrastThresholds: {
        AAA_NORMAL: 7.0,
        AA_NORMAL: 4.5,
        AAA_LARGE: 4.5,
        AA_LARGE: 3.0
    },
    readabilityThresholds: {
        MIN_BRIGHTNESS_DIFFERENCE: 125,
        MIN_COLOR_DIFFERENCE: 500,
        DARK_MODE_MIN_LIGHTNESS: 70 // Minimum lightness for text on dark backgrounds
    }
};

// ===== ENHANCED COLOR VALIDATION CLASS =====
class EnhancedColorValidator {
    constructor() {
        this.validationResults = {
            colorContrast: [],
            darkModeReadability: [],
            textVisibility: [],
            recommendations: []
        };
    }

    /**
     * Enhanced Color Contrast Analysis
     * Detects the exact issues we faced with gray text on dark backgrounds
     */
    async validateColorContrast() {
        console.log('🎨 Starting Enhanced Color Contrast Validation...');
        
        for (const page of colorValidationConfig.testPages) {
            for (const scheme of colorValidationConfig.colorSchemes) {
                try {
                    // Browser MCP command to analyze colors in specific color scheme
                    const colorAnalysis = await this.browserMCPColorAnalysis({
                        url: `${colorValidationConfig.baseUrl}${page}`,
                        colorScheme: scheme,
                        analyzeElements: [
                            'h1, h2, h3, h4, h5, h6',  // All headings
                            'p',                        // Paragraphs
                            '.nav-link',                // Navigation
                            '.hero-subtitle',           // Hero text
                            '.section-header p',        // Section descriptions
                            '.feature-card p',          // Feature descriptions
                            '.guide-content p',         // Guide content
                            '.footer-brand p',          // Footer text
                            'button',                   // All buttons
                            'label'                     // Form labels
                        ],
                        extractColors: true,
                        calculateContrast: true,
                        detectReadabilityIssues: true
                    });

                    const validationResult = await this.analyzeColorData(
                        colorAnalysis, 
                        page, 
                        scheme
                    );
                    
                    this.validationResults.colorContrast.push(validationResult);
                    
                    if (validationResult.hasIssues) {
                        console.log(`⚠️ Color issues detected: ${page} in ${scheme} mode`);
                        this.generateColorRecommendations(validationResult);
                    } else {
                        console.log(`✅ Color validation passed: ${page} in ${scheme} mode`);
                    }

                } catch (error) {
                    console.error(`❌ Color validation failed: ${page} in ${scheme} mode`, error);
                    this.validationResults.colorContrast.push({
                        page,
                        colorScheme: scheme,
                        status: 'FAIL',
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }

        return this.validationResults.colorContrast;
    }

    /**
     * Dark Mode Specific Readability Analysis  
     * Specifically targets the gray-text-on-dark-background issue
     */
    async validateDarkModeReadability() {
        console.log('🌙 Starting Dark Mode Readability Analysis...');
        
        for (const page of colorValidationConfig.testPages) {
            try {
                // Force dark mode and analyze text visibility
                const darkModeAnalysis = await this.browserMCPDarkModeAnalysis({
                    url: `${colorValidationConfig.baseUrl}${page}`,
                    forceColorScheme: 'dark',
                    analyzeCriticalElements: {
                        headings: 'h1, h2, h3, h4, h5, h6',
                        bodyText: 'p, span, div',
                        navigation: '.nav-link',
                        buttons: 'button, .btn',
                        forms: 'label, input',
                        footer: '.footer-brand p, .footer-section a'
                    },
                    checkGrayTextIssues: true,
                    measureTextLightness: true,
                    flagLowContrastElements: true
                });

                const readabilityResult = this.analyzeDarkModeData(darkModeAnalysis, page);
                this.validationResults.darkModeReadability.push(readabilityResult);

                if (readabilityResult.hasReadabilityIssues) {
                    console.log(`🚨 Dark mode readability issues: ${page}`);
                    console.log(`   - ${readabilityResult.grayTextElements.length} elements with gray text`);
                    console.log(`   - ${readabilityResult.lowContrastElements.length} low contrast elements`);
                    
                    this.generateDarkModeRecommendations(readabilityResult);
                } else {
                    console.log(`✅ Dark mode readability passed: ${page}`);
                }

            } catch (error) {
                console.error(`❌ Dark mode analysis failed: ${page}`, error);
                this.validationResults.darkModeReadability.push({
                    page,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return this.validationResults.darkModeReadability;
    }

    /**
     * Text Visibility Validation
     * Comprehensive text visibility analysis across all color schemes
     */
    async validateTextVisibility() {
        console.log('👁️ Starting Text Visibility Analysis...');
        
        for (const page of colorValidationConfig.testPages) {
            try {
                // Comprehensive visibility analysis
                const visibilityAnalysis = await this.browserMCPVisibilityAnalysis({
                    url: `${colorValidationConfig.baseUrl}${page}`,
                    testColorSchemes: ['light', 'dark', 'no-preference'],
                    analyzeTextElements: true,
                    measureReadabilityMetrics: {
                        contrastRatio: true,
                        brightnessContrast: true,
                        colorDifference: true,
                        perceivedLightness: true
                    },
                    flagInvisibleText: true,
                    detectGrayOnGrayIssues: true
                });

                const visibilityResult = this.analyzeVisibilityData(visibilityAnalysis, page);
                this.validationResults.textVisibility.push(visibilityResult);

                if (visibilityResult.hasVisibilityIssues) {
                    console.log(`⚠️ Text visibility issues: ${page}`);
                    this.generateVisibilityRecommendations(visibilityResult);
                } else {
                    console.log(`✅ Text visibility passed: ${page}`);
                }

            } catch (error) {
                console.error(`❌ Visibility analysis failed: ${page}`, error);
                this.validationResults.textVisibility.push({
                    page,
                    status: 'FAIL',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return this.validationResults.textVisibility;
    }

    /**
     * Analyze extracted color data for issues
     */
    async analyzeColorData(colorAnalysis, page, scheme) {
        const result = {
            page,
            colorScheme: scheme,
            status: 'PASS',
            hasIssues: false,
            elements: [],
            issues: [],
            timestamp: new Date().toISOString()
        };

        for (const element of colorAnalysis.elements) {
            const elementAnalysis = {
                selector: element.selector,
                textColor: element.textColor,
                backgroundColor: element.backgroundColor,
                contrastRatio: element.contrastRatio,
                isReadable: true,
                issues: []
            };

            // Check WCAG compliance
            if (element.contrastRatio < colorValidationConfig.contrastThresholds.AA_NORMAL) {
                elementAnalysis.issues.push(`Low contrast ratio: ${element.contrastRatio.toFixed(2)} (minimum: 4.5)`);
                elementAnalysis.isReadable = false;
                result.hasIssues = true;
            }

            // Check for dark mode specific issues
            if (scheme === 'dark') {
                const textLightness = this.calculateLightness(element.textColor);
                if (textLightness < colorValidationConfig.readabilityThresholds.DARK_MODE_MIN_LIGHTNESS) {
                    elementAnalysis.issues.push(`Text too dark for dark mode: ${textLightness}% lightness (minimum: 70%)`);
                    elementAnalysis.isReadable = false;
                    result.hasIssues = true;
                }

                // Check for gray text issues (the exact problem we faced)
                if (this.isGrayish(element.textColor)) {
                    elementAnalysis.issues.push('Gray text detected in dark mode - potential readability issue');
                    elementAnalysis.isReadable = false;
                    result.hasIssues = true;
                }
            }

            result.elements.push(elementAnalysis);
        }

        if (result.hasIssues) {
            result.status = 'ISSUES_FOUND';
            result.issues = result.elements
                .filter(el => !el.isReadable)
                .map(el => `${el.selector}: ${el.issues.join(', ')}`);
        }

        return result;
    }

    /**
     * Analyze dark mode specific data
     */
    analyzeDarkModeData(darkModeAnalysis, page) {
        const result = {
            page,
            status: 'PASS',
            hasReadabilityIssues: false,
            grayTextElements: [],
            lowContrastElements: [],
            recommendations: [],
            timestamp: new Date().toISOString()
        };

        // Identify gray text elements
        result.grayTextElements = darkModeAnalysis.elements.filter(el => 
            this.isGrayish(el.textColor) && this.calculateLightness(el.textColor) < 70
        );

        // Identify low contrast elements
        result.lowContrastElements = darkModeAnalysis.elements.filter(el => 
            el.contrastRatio < 4.5
        );

        if (result.grayTextElements.length > 0 || result.lowContrastElements.length > 0) {
            result.hasReadabilityIssues = true;
            result.status = 'READABILITY_ISSUES';
        }

        return result;
    }

    /**
     * Generate specific recommendations for color issues
     */
    generateColorRecommendations(validationResult) {
        const recommendations = {
            page: validationResult.page,
            colorScheme: validationResult.colorScheme,
            fixes: [],
            cssUpdates: [],
            timestamp: new Date().toISOString()
        };

        for (const element of validationResult.elements) {
            if (!element.isReadable) {
                if (validationResult.colorScheme === 'dark') {
                    // Dark mode specific recommendations
                    recommendations.fixes.push({
                        selector: element.selector,
                        issue: element.issues.join(', '),
                        recommendation: 'Use bright white (#ffffff) or very light colors (#f1f5f9) for text',
                        cssUpdate: `${element.selector} { color: #ffffff !important; }`
                    });
                } else {
                    // Light mode recommendations
                    recommendations.fixes.push({
                        selector: element.selector,
                        issue: element.issues.join(', '),
                        recommendation: 'Use darker text colors for better contrast',
                        cssUpdate: `${element.selector} { color: #1f2937 !important; }`
                    });
                }
            }
        }

        this.validationResults.recommendations.push(recommendations);
        return recommendations;
    }

    /**
     * Generate dark mode specific recommendations
     */
    generateDarkModeRecommendations(readabilityResult) {
        const recommendations = {
            page: readabilityResult.page,
            type: 'dark_mode_readability',
            fixes: [],
            cssTemplate: '',
            timestamp: new Date().toISOString()
        };

        // Generate CSS template for dark mode fixes
        let cssTemplate = `
@media (prefers-color-scheme: dark) {
    /* Enhanced dark mode text visibility */
    body { color: #ffffff; }
    
    /* Headings - pure white for maximum visibility */
    h1, h2, h3, h4, h5, h6 { color: #ffffff !important; }
    
    /* Primary text content - bright white */
    p, span, div, li { color: #f1f5f9; }
    
    /* Secondary text - very light gray */
    .text-secondary { color: #e2e8f0; }
    
    /* Navigation links */
    .nav-link { color: #f1f5f9 !important; }
    .nav-link:hover { color: #ffffff !important; }
    
    /* Form elements */
    label { color: #f1f5f9 !important; }
    
    /* Footer elements */
    .footer-brand p,
    .footer-section a { color: #e2e8f0 !important; }
}`;

        recommendations.cssTemplate = cssTemplate;
        
        for (const element of readabilityResult.grayTextElements) {
            recommendations.fixes.push({
                element: element.selector,
                issue: 'Gray text in dark mode',
                fix: 'Change to white or very light color',
                priority: 'HIGH'
            });
        }

        for (const element of readabilityResult.lowContrastElements) {
            recommendations.fixes.push({
                element: element.selector,
                issue: `Low contrast: ${element.contrastRatio}`,
                fix: 'Increase text brightness',
                priority: 'MEDIUM'
            });
        }

        this.validationResults.recommendations.push(recommendations);
        return recommendations;
    }

    /**
     * Utility: Calculate color lightness
     */
    calculateLightness(color) {
        // Convert color to RGB values
        const rgb = this.colorToRgb(color);
        if (!rgb) return 0;
        
        // Calculate relative luminance
        const { r, g, b } = rgb;
        const sR = r / 255;
        const sG = g / 255;
        const sB = b / 255;
        
        // Apply gamma correction
        const rLin = sR <= 0.03928 ? sR / 12.92 : Math.pow((sR + 0.055) / 1.055, 2.4);
        const gLin = sG <= 0.03928 ? sG / 12.92 : Math.pow((sG + 0.055) / 1.055, 2.4);
        const bLin = sB <= 0.03928 ? sB / 12.92 : Math.pow((sB + 0.055) / 1.055, 2.4);
        
        // Calculate luminance
        const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
        return luminance * 100;
    }

    /**
     * Utility: Check if color is grayish
     */
    isGrayish(color) {
        const rgb = this.colorToRgb(color);
        if (!rgb) return false;
        
        const { r, g, b } = rgb;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        
        // If the difference between max and min is small, it's grayish
        return (max - min) < 30;
    }

    /**
     * Utility: Convert color string to RGB values
     */
    colorToRgb(color) {
        // Handle hex colors
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            return { r, g, b };
        }
        
        // Handle rgb() colors
        if (color.startsWith('rgb(')) {
            const values = color.match(/\\d+/g);
            if (values && values.length >= 3) {
                return {
                    r: parseInt(values[0]),
                    g: parseInt(values[1]),
                    b: parseInt(values[2])
                };
            }
        }
        
        return null;
    }

    /**
     * Simulate Browser MCP color analysis command
     */
    async browserMCPColorAnalysis(options) {
        // This would be replaced with actual Browser MCP calls
        return {
            url: options.url,
            colorScheme: options.colorScheme,
            elements: [
                // Mock data - would be real analysis from Browser MCP
                {
                    selector: 'h1',
                    textColor: '#64748b',  // This was the problematic gray
                    backgroundColor: '#0f172a',
                    contrastRatio: 2.1  // Too low!
                },
                {
                    selector: 'p',
                    textColor: '#475569',  // Another problematic gray
                    backgroundColor: '#0f172a',
                    contrastRatio: 1.8  // Way too low!
                }
            ],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Generate comprehensive validation report
     */
    generateValidationReport() {
        const report = {
            summary: {
                totalPages: colorValidationConfig.testPages.length,
                colorSchemesChecked: colorValidationConfig.colorSchemes.length,
                issuesFound: this.validationResults.recommendations.length,
                status: this.validationResults.recommendations.length === 0 ? 'PASS' : 'ISSUES_FOUND'
            },
            results: this.validationResults,
            recommendations: this.validationResults.recommendations,
            timestamp: new Date().toISOString()
        };

        console.log('\\n📊 Enhanced Color Validation Report:');
        console.log(`   Pages tested: ${report.summary.totalPages}`);
        console.log(`   Color schemes: ${report.summary.colorSchemesChecked}`);
        console.log(`   Issues found: ${report.summary.issuesFound}`);
        console.log(`   Overall status: ${report.summary.status}`);

        return report;
    }
}

// ===== ENHANCED MCP INTEGRATION FOR ORCHESTRAI =====
class ORCHESTRAIColorValidator {
    constructor(orchestraiSystem) {
        this.orchestrai = orchestraiSystem;
        this.validator = new EnhancedColorValidator();
    }

    /**
     * Integrate enhanced color validation into ORCHESTRAI workflow
     */
    async integrateIntoQualityGates() {
        console.log('🎯 Integrating Enhanced Color Validation into ORCHESTRAI...');
        
        // Add color validation as a quality gate
        const colorValidationGate = {
            name: 'Enhanced Color Validation',
            phase: 'Design Quality Assurance',
            priority: 'HIGH',
            validator: this.validator,
            checks: [
                'validateColorContrast',
                'validateDarkModeReadability',
                'validateTextVisibility'
            ]
        };

        // Register with ORCHESTRAI Quality Domain
        await this.orchestrai.webQualityDomain.addQualityGate(colorValidationGate);
        
        console.log('✅ Enhanced color validation integrated successfully');
        return colorValidationGate;
    }

    /**
     * Run comprehensive color validation
     */
    async runComprehensiveValidation() {
        console.log('🚀 Starting Comprehensive Color Validation...');
        
        // Run all validation checks
        await this.validator.validateColorContrast();
        await this.validator.validateDarkModeReadability();
        await this.validator.validateTextVisibility();
        
        // Generate report
        const report = this.validator.generateValidationReport();
        
        // Store results in crystalline memory
        if (this.orchestrai.crystallineMemory) {
            await this.orchestrai.crystallineMemory.storeMemory(
                'color_validation_results',
                report,
                'web_quality_domain'
            );
        }
        
        return report;
    }
}

module.exports = {
    EnhancedColorValidator,
    ORCHESTRAIColorValidator,
    colorValidationConfig
};

// ===== USAGE EXAMPLE =====
/*
const validator = new EnhancedColorValidator();

// Run comprehensive validation
const results = await validator.runComprehensiveValidation();

// Generate recommendations
if (results.summary.status === 'ISSUES_FOUND') {
    console.log('🔧 Applying automatic fixes...');
    // Apply CSS fixes based on recommendations
}
*/
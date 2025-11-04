/**
 * ORCHESTRAI Dynamic Infographic Generator
 * Fabric.js-based system for creating branded infographics on-the-fly
 * 
 * This template provides automated infographic generation using client data
 * and brand assets, supporting multiple layouts and visual styles
 */

// ============================================================================
// FABRIC.JS INFOGRAPHIC TEMPLATE ENGINE
// ============================================================================

class DynamicInfographicGenerator {
    constructor(brandConfig = {}) {
        this.canvas = null;
        this.brandConfig = {
            colors: {
                primary: brandConfig.primary || '#1A2944',
                secondary: brandConfig.secondary || '#357494',
                accent: brandConfig.accent || '#3F86A4',
                success: brandConfig.success || '#22C55E',
                warning: brandConfig.warning || '#F97316',
                text: brandConfig.text || '#374151',
                background: brandConfig.background || '#FFFFFF'
            },
            fonts: {
                heading: brandConfig.headingFont || 'Inter, sans-serif',
                body: brandConfig.bodyFont || 'Inter, sans-serif'
            },
            logo: brandConfig.logo || null
        };
        this.templates = this.initializeTemplates();
    }

    /**
     * Initialize canvas with specified dimensions
     */
    initializeCanvas(canvasId, width = 800, height = 1000) {
        this.canvas = new fabric.Canvas(canvasId, {
            width: width,
            height: height,
            backgroundColor: this.brandConfig.colors.background
        });
        return this.canvas;
    }

    /**
     * Generate performance comparison infographic
     */
    async generatePerformanceInfographic(data, options = {}) {
        const canvas = this.canvas;
        if (!canvas) throw new Error('Canvas not initialized');

        const config = {
            title: options.title || 'Performance Improvement Analysis',
            subtitle: options.subtitle || 'AI-Powered vs Traditional Systems',
            width: canvas.width,
            height: canvas.height,
            ...options
        };

        // Clear canvas
        canvas.clear();
        canvas.backgroundColor = this.brandConfig.colors.background;

        // Add background gradient
        const gradient = new fabric.Gradient({
            type: 'linear',
            coords: { x1: 0, y1: 0, x2: 0, y2: canvas.height },
            colorStops: [
                { offset: 0, color: this.brandConfig.colors.background },
                { offset: 1, color: '#F8FAFC' }
            ]
        });
        canvas.backgroundColor = gradient;

        // Header Section
        await this.addHeader(config.title, config.subtitle, 50);

        // Performance Metrics Visualization
        let yPosition = 200;
        data.forEach((metric, index) => {
            this.addMetricComparison(metric, yPosition);
            yPosition += 120;
        });

        // Add decorative elements
        this.addBrandedDecorations();

        // Footer with brand logo
        if (this.brandConfig.logo) {
            await this.addBrandFooter();
        }

        canvas.renderAll();
        return canvas.toDataURL('image/png', 1.0);
    }

    /**
     * Generate ROI visualization infographic
     */
    async generateROIInfographic(roiData, options = {}) {
        const canvas = this.canvas;
        if (!canvas) throw new Error('Canvas not initialized');

        canvas.clear();
        canvas.backgroundColor = this.brandConfig.colors.background;

        // Add title
        const title = new fabric.Text(options.title || 'ROI Analysis', {
            left: canvas.width / 2,
            top: 50,
            fontFamily: this.brandConfig.fonts.heading,
            fontSize: 36,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.primary,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(title);

        // Create circular ROI visualization
        let yPos = 150;
        roiData.forEach((roi, index) => {
            this.addROICircle(roi, 150 + (index * 180), yPos);
        });

        // Add summary statistics
        this.addROISummary(roiData, yPos + 200);

        canvas.renderAll();
        return canvas.toDataURL('image/png', 1.0);
    }

    /**
     * Generate timeline implementation infographic
     */
    async generateTimelineInfographic(timelineData, options = {}) {
        const canvas = this.canvas;
        if (!canvas) throw new Error('Canvas not initialized');

        canvas.clear();
        canvas.backgroundColor = this.brandConfig.colors.background;

        // Timeline visualization
        this.addTimelineHeader(options.title || 'Implementation Timeline');
        
        let xPosition = 100;
        const yPosition = 300;
        
        timelineData.forEach((phase, index) => {
            this.addTimelinePhase(phase, xPosition, yPosition, index === timelineData.length - 1);
            xPosition += 150;
        });

        // Add connecting line
        const timelineLine = new fabric.Line([100, yPosition, xPosition - 50, yPosition], {
            stroke: this.brandConfig.colors.secondary,
            strokeWidth: 4
        });
        canvas.add(timelineLine);

        canvas.renderAll();
        return canvas.toDataURL('image/png', 1.0);
    }

    /**
     * Add branded header section
     */
    async addHeader(title, subtitle, yPosition) {
        const canvas = this.canvas;

        // Main title
        const titleText = new fabric.Text(title, {
            left: canvas.width / 2,
            top: yPosition,
            fontFamily: this.brandConfig.fonts.heading,
            fontSize: 28,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.primary,
            textAlign: 'center',
            originX: 'center'
        });
        canvas.add(titleText);

        // Subtitle
        if (subtitle) {
            const subtitleText = new fabric.Text(subtitle, {
                left: canvas.width / 2,
                top: yPosition + 40,
                fontFamily: this.brandConfig.fonts.body,
                fontSize: 16,
                fill: this.brandConfig.colors.text,
                textAlign: 'center',
                originX: 'center'
            });
            canvas.add(subtitleText);
        }

        // Decorative line
        const line = new fabric.Line([canvas.width / 2 - 100, yPosition + 70, canvas.width / 2 + 100, yPosition + 70], {
            stroke: this.brandConfig.colors.accent,
            strokeWidth: 3
        });
        canvas.add(line);
    }

    /**
     * Add metric comparison visualization
     */
    addMetricComparison(metric, yPosition) {
        const canvas = this.canvas;
        const leftX = 100;
        const rightX = 450;
        const barWidth = 200;
        const barHeight = 30;

        // Metric label
        const label = new fabric.Text(metric.name, {
            left: 50,
            top: yPosition - 10,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 14,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.text
        });
        canvas.add(label);

        // Traditional system bar (left side)
        const traditionalBar = new fabric.Rect({
            left: leftX,
            top: yPosition + 20,
            width: (metric.traditional / 100) * barWidth,
            height: barHeight,
            fill: '#94A3B8',
            rx: 4,
            ry: 4
        });
        canvas.add(traditionalBar);

        // Traditional label
        const traditionalLabel = new fabric.Text(`Traditional: ${metric.traditional}%`, {
            left: leftX,
            top: yPosition + 55,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 12,
            fill: this.brandConfig.colors.text
        });
        canvas.add(traditionalLabel);

        // AI-powered system bar (right side)
        const aiBar = new fabric.Rect({
            left: rightX,
            top: yPosition + 20,
            width: (metric.aiPowered / 100) * barWidth,
            height: barHeight,
            fill: this.brandConfig.colors.secondary,
            rx: 4,
            ry: 4
        });
        canvas.add(aiBar);

        // AI label
        const aiLabel = new fabric.Text(`AI-Powered: ${metric.aiPowered}%`, {
            left: rightX,
            top: yPosition + 55,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 12,
            fill: this.brandConfig.colors.text
        });
        canvas.add(aiLabel);

        // Improvement indicator
        const improvement = metric.aiPowered - metric.traditional;
        const improvementText = new fabric.Text(`+${improvement}%`, {
            left: rightX + barWidth + 20,
            top: yPosition + 25,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 16,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.success
        });
        canvas.add(improvementText);
    }

    /**
     * Add ROI circular visualization
     */
    addROICircle(roiData, x, y) {
        const canvas = this.canvas;
        const radius = 60;

        // Background circle
        const bgCircle = new fabric.Circle({
            left: x - radius,
            top: y - radius,
            radius: radius,
            fill: '#F1F5F9',
            stroke: this.brandConfig.colors.secondary,
            strokeWidth: 3
        });
        canvas.add(bgCircle);

        // ROI percentage text
        const roiText = new fabric.Text(`${roiData.value}%`, {
            left: x,
            top: y - 10,
            fontFamily: this.brandConfig.fonts.heading,
            fontSize: 24,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.primary,
            originX: 'center',
            originY: 'center'
        });
        canvas.add(roiText);

        // Category label
        const categoryLabel = new fabric.Text(roiData.category, {
            left: x,
            top: y + 80,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 12,
            textAlign: 'center',
            fill: this.brandConfig.colors.text,
            originX: 'center'
        });
        canvas.add(categoryLabel);
    }

    /**
     * Add timeline phase visualization
     */
    addTimelinePhase(phase, x, y, isLast = false) {
        const canvas = this.canvas;

        // Phase circle
        const circle = new fabric.Circle({
            left: x - 15,
            top: y - 15,
            radius: 15,
            fill: this.brandConfig.colors.secondary,
            stroke: this.brandConfig.colors.primary,
            strokeWidth: 3
        });
        canvas.add(circle);

        // Phase title
        const title = new fabric.Text(phase.name, {
            left: x,
            top: y - 50,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 14,
            fontWeight: 'bold',
            fill: this.brandConfig.colors.primary,
            originX: 'center'
        });
        canvas.add(title);

        // Duration
        const duration = new fabric.Text(phase.duration, {
            left: x,
            top: y + 30,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 12,
            fill: this.brandConfig.colors.text,
            originX: 'center'
        });
        canvas.add(duration);
    }

    /**
     * Add branded decorative elements
     */
    addBrandedDecorations() {
        const canvas = this.canvas;

        // Corner triangular decoration
        const triangle = new fabric.Triangle({
            left: canvas.width - 60,
            top: 20,
            width: 30,
            height: 30,
            fill: this.brandConfig.colors.accent,
            angle: 45,
            opacity: 0.7
        });
        canvas.add(triangle);

        // Gradient overlay for premium feel
        const overlay = new fabric.Rect({
            left: 0,
            top: 0,
            width: canvas.width,
            height: 5,
            fill: new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: canvas.width, y2: 0 },
                colorStops: [
                    { offset: 0, color: this.brandConfig.colors.primary },
                    { offset: 0.5, color: this.brandConfig.colors.secondary },
                    { offset: 1, color: this.brandConfig.colors.accent }
                ]
            })
        });
        canvas.add(overlay);
    }

    /**
     * Add brand footer with logo
     */
    async addBrandFooter() {
        const canvas = this.canvas;
        
        if (this.brandConfig.logo) {
            fabric.Image.fromURL(this.brandConfig.logo, (img) => {
                img.set({
                    left: canvas.width - 120,
                    top: canvas.height - 60,
                    scaleX: 0.3,
                    scaleY: 0.3
                });
                canvas.add(img);
            });
        }

        // Footer text
        const footerText = new fabric.Text('Generated by AI-Powered Customer Intelligence Platform', {
            left: 40,
            top: canvas.height - 40,
            fontFamily: this.brandConfig.fonts.body,
            fontSize: 10,
            fill: this.brandConfig.colors.text,
            opacity: 0.7
        });
        canvas.add(footerText);
    }

    /**
     * Initialize predefined templates
     */
    initializeTemplates() {
        return {
            performanceComparison: {
                name: 'Performance Comparison',
                dimensions: { width: 800, height: 1000 },
                dataStructure: [
                    { name: 'Churn Prediction', traditional: 70, aiPowered: 85 },
                    { name: 'Lead Scoring', traditional: 60, aiPowered: 90 },
                    { name: 'Revenue Forecasting', traditional: 65, aiPowered: 87 }
                ]
            },
            roiAnalysis: {
                name: 'ROI Analysis',
                dimensions: { width: 800, height: 600 },
                dataStructure: [
                    { category: 'Sales Performance', value: 32 },
                    { category: 'Marketing Efficiency', value: 40 },
                    { category: 'Customer Success', value: 35 }
                ]
            },
            implementationTimeline: {
                name: 'Implementation Timeline',
                dimensions: { width: 800, height: 400 },
                dataStructure: [
                    { name: 'Foundation', duration: '30-45 days' },
                    { name: 'Development', duration: '60-90 days' },
                    { name: 'Deployment', duration: '15-30 days' }
                ]
            }
        };
    }

    /**
     * Generate infographic from template
     */
    async generateFromTemplate(templateName, customData = null, options = {}) {
        const template = this.templates[templateName];
        if (!template) {
            throw new Error(`Template '${templateName}' not found`);
        }

        const data = customData || template.dataStructure;
        
        switch (templateName) {
            case 'performanceComparison':
                return await this.generatePerformanceInfographic(data, options);
            case 'roiAnalysis':
                return await this.generateROIInfographic(data, options);
            case 'implementationTimeline':
                return await this.generateTimelineInfographic(data, options);
            default:
                throw new Error(`Template generation not implemented for '${templateName}'`);
        }
    }

    /**
     * Export infographic as various formats
     */
    exportInfographic(format = 'png', quality = 1.0) {
        if (!this.canvas) throw new Error('Canvas not initialized');
        
        switch (format.toLowerCase()) {
            case 'png':
                return this.canvas.toDataURL('image/png', quality);
            case 'jpeg':
            case 'jpg':
                return this.canvas.toDataURL('image/jpeg', quality);
            case 'svg':
                return this.canvas.toSVG();
            case 'pdf':
                // PDF export would require additional library like jsPDF
                console.warn('PDF export requires additional PDF library');
                return null;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
}

// ============================================================================
// ORCHESTRAI INTEGRATION FUNCTIONS
// ============================================================================

/**
 * QuartzIQ Brand Configuration
 */
const QUARTZIQ_BRAND_CONFIG = {
    primary: '#1A2944',
    secondary: '#357494', 
    accent: '#3F86A4',
    success: '#22C55E',
    warning: '#F97316',
    text: '#374151',
    background: '#FFFFFF',
    headingFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    logo: 'logo-full-dark.svg' // Relative path to logo
};

/**
 * Initialize infographic generator with brand configuration
 */
function initializeQuartzIQInfographics(canvasId, options = {}) {
    const generator = new DynamicInfographicGenerator(QUARTZIQ_BRAND_CONFIG);
    generator.initializeCanvas(canvasId, options.width || 800, options.height || 1000);
    return generator;
}

/**
 * Generate performance comparison infographic for QuartzIQ article
 */
async function generateQuartzIQPerformanceInfographic(canvasId) {
    const generator = initializeQuartzIQInfographics(canvasId);
    
    const performanceData = [
        { name: 'Churn Prediction Accuracy', traditional: 70, aiPowered: 85 },
        { name: 'Lead Scoring Improvement', traditional: 60, aiPowered: 90 },
        { name: 'Revenue Forecasting Accuracy', traditional: 65, aiPowered: 87 },
        { name: 'Sales Cycle Efficiency', traditional: 75, aiPowered: 95 }
    ];

    return await generator.generatePerformanceInfographic(performanceData, {
        title: 'AI-Powered Customer Intelligence Impact',
        subtitle: 'QuartzIQ Platform Performance vs Traditional Systems'
    });
}

// ============================================================================
// USAGE EXAMPLES AND DOCUMENTATION
// ============================================================================

/**
 * Example usage for integrating into ORCHESTRAI articles
 * 
 * HTML:
 * <canvas id="performance-infographic" width="800" height="1000"></canvas>
 * <button onclick="generateInfographic()">Generate Infographic</button>
 * 
 * JavaScript:
 * async function generateInfographic() {
 *     const dataUrl = await generateQuartzIQPerformanceInfographic('performance-infographic');
 *     console.log('Infographic generated:', dataUrl);
 * }
 */

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DynamicInfographicGenerator,
        QUARTZIQ_BRAND_CONFIG,
        initializeQuartzIQInfographics,
        generateQuartzIQPerformanceInfographic
    };
}
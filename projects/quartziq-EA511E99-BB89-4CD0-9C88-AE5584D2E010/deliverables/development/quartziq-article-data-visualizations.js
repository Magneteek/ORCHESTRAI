/**
 * QuartzIQ AI-Powered Customer Intelligence Platform
 * Data Visualization Configuration & Implementation
 * 
 * This file contains all statistical data extracted from the article
 * and visualization configurations for charts, infographics, and interactive elements
 */

// QuartzIQ Brand Colors for consistent visualization theming
const QUARTZIQ_COLORS = {
    primary: '#1A2944',      // QuartzIQ Dark Blue
    brand: '#357494',        // QuartzIQ Brand Blue  
    light: '#3F86A4',        // QuartzIQ Light Blue
    success: '#22C55E',      // Success Green
    warning: '#F97316',      // Warning Orange
    background: '#D7D9D7',   // Professional White
    text: '#374151'          // Body Text Gray
};

// ============================================================================
// STATISTICAL DATA EXTRACTION FROM ARTICLE
// ============================================================================

const ARTICLE_STATISTICS = {
    
    // Market Adoption Statistics
    marketAdoption: {
        title: "AI-Powered CRM Market Adoption",
        data: [
            { label: "Current AI CRM Adoption", value: 65, color: QUARTZIQ_COLORS.brand },
            { label: "Revenue Goal Success Rate", value: 83, color: QUARTZIQ_COLORS.success },
            { label: "Predicted 2027 Adoption", value: 85, color: QUARTZIQ_COLORS.light },
            { label: "Market Size Growth (2024-2027)", value: 300, color: QUARTZIQ_COLORS.warning }
        ],
        chartType: "doughnut",
        description: "Enterprise adoption rates and market growth projections"
    },

    // Traditional vs AI-Powered Comparison
    systemComparison: {
        title: "Traditional CRM vs AI-Powered Intelligence Platforms",
        data: [
            { 
                category: "Data Storage vs Intelligence Generation",
                traditional: 85,
                aiPowered: 15,
                description: "Traditional systems focus 85% on storage, AI systems focus 85% on analytics"
            }
        ],
        chartType: "comparison",
        description: "Fundamental difference in system approach and focus"
    },

    // Performance Improvement Metrics
    performanceMetrics: {
        title: "AI-Powered Customer Intelligence Performance Improvements",
        data: [
            { 
                metric: "Churn Prediction Accuracy", 
                baseline: 70, 
                aiImprovement: 85, 
                range: "85%+",
                improvement: 21.4
            },
            { 
                metric: "Lead Scoring Improvement", 
                baseline: 100, 
                aiImprovement: 150, 
                range: "40-60%",
                improvement: 50
            },
            { 
                metric: "Revenue Forecasting Accuracy", 
                baseline: 70, 
                aiImprovement: 92, 
                range: "25-40%",
                improvement: 31.4
            }
        ],
        chartType: "horizontalBar",
        description: "Measurable performance gains across key business metrics"
    },

    // Sales Performance Transformation
    salesPerformance: {
        title: "Sales Performance Transformation with AI Intelligence",
        data: [
            { metric: "Forecast Accuracy", traditional: 65, aiPowered: 87, improvement: 25 },
            { metric: "Deal Closure Rate", traditional: 17.5, aiPowered: 30, improvement: 35 },
            { metric: "Sales Cycle Length", traditional: 105, aiPowered: 72, improvement: -30 },
            { metric: "Quota Attainment", traditional: 65, aiPowered: 90, improvement: 40 }
        ],
        chartType: "radar",
        description: "Comprehensive sales transformation across all key metrics"
    },

    // Implementation Timeline Benchmarks
    implementationTimeline: {
        title: "AI Customer Intelligence Implementation Timeline",
        data: [
            { phase: "Foundation Phase", duration: 37, range: "30-45 days", color: QUARTZIQ_COLORS.brand },
            { phase: "Model Development", duration: 75, range: "60-90 days", color: QUARTZIQ_COLORS.light },
            { phase: "Total Implementation", duration: 112, range: "90-135 days", color: QUARTZIQ_COLORS.primary }
        ],
        chartType: "timeline",
        description: "Typical enterprise implementation phases and durations"
    },

    // SaaS Industry Specific Results
    saasResults: {
        title: "SaaS Industry: AI Customer Intelligence Impact",
        data: [
            { metric: "Churn Reduction", value: 40, color: QUARTZIQ_COLORS.success },
            { metric: "Expansion Revenue Increase", value: 55, color: QUARTZIQ_COLORS.brand },
            { metric: "Customer Success Productivity", value: 30, color: QUARTZIQ_COLORS.light },
            { metric: "Product Adoption Improvement", value: 45, color: QUARTZIQ_COLORS.warning }
        ],
        chartType: "bar",
        description: "Specific business impact measurements for SaaS companies"
    },

    // ROI and Performance Benchmarks
    roiBenchmarks: {
        title: "Enterprise ROI Benchmarks: AI Customer Intelligence",
        data: [
            { category: "Sales Performance", range: "25-40%", average: 32.5 },
            { category: "Marketing Efficiency", range: "30-50%", average: 40 },
            { category: "Expansion Revenue", range: "35-55%", average: 45 },
            { category: "Customer Lifetime Value", range: "40-70%", average: 55 }
        ],
        chartType: "bubble",
        description: "Typical ROI improvements across enterprise functions"
    },

    // Accuracy Requirements by Use Case
    accuracyThresholds: {
        title: "AI Model Accuracy Requirements by Application",
        data: [
            { application: "Churn Prediction", required: 80, typical: 85, color: QUARTZIQ_COLORS.success },
            { application: "Lead Scoring", required: 75, typical: 82, color: QUARTZIQ_COLORS.brand },
            { application: "Revenue Forecasting", required: 70, typical: 77, color: QUARTZIQ_COLORS.light }
        ],
        chartType: "gauge",
        description: "Minimum vs typical accuracy achievements for different AI applications"
    }
};

// ============================================================================
// QUICKCHART API INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Generate QuickChart URLs for automated chart creation
 */
class QuickChartGenerator {
    constructor() {
        this.baseUrl = 'https://quickchart.io/chart';
        this.brandColors = QUARTZIQ_COLORS;
    }

    /**
     * Generate chart configuration with QuartzIQ branding
     */
    generateChartConfig(statisticKey) {
        const data = ARTICLE_STATISTICS[statisticKey];
        
        switch (data.chartType) {
            case 'doughnut':
                return this.createDoughnutChart(data);
            case 'bar':
                return this.createBarChart(data);
            case 'horizontalBar':
                return this.createHorizontalBarChart(data);
            case 'radar':
                return this.createRadarChart(data);
            case 'comparison':
                return this.createComparisonChart(data);
            default:
                return this.createBarChart(data);
        }
    }

    /**
     * Create branded doughnut chart configuration
     */
    createDoughnutChart(data) {
        return {
            type: 'doughnut',
            data: {
                labels: data.data.map(item => item.label),
                datasets: [{
                    data: data.data.map(item => item.value),
                    backgroundColor: data.data.map(item => item.color),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: data.title,
                        font: { size: 18, weight: 'bold' },
                        color: this.brandColors.primary
                    },
                    legend: {
                        position: 'bottom',
                        labels: { 
                            font: { size: 12 },
                            color: this.brandColors.text,
                            usePointStyle: true
                        }
                    }
                }
            }
        };
    }

    /**
     * Create branded bar chart configuration
     */
    createBarChart(data) {
        return {
            type: 'bar',
            data: {
                labels: data.data.map(item => item.metric),
                datasets: [{
                    label: 'Improvement %',
                    data: data.data.map(item => item.value),
                    backgroundColor: data.data.map(item => item.color),
                    borderColor: this.brandColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: data.title,
                        font: { size: 18, weight: 'bold' },
                        color: this.brandColors.primary
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { 
                            color: this.brandColors.text,
                            callback: function(value) { return value + '%'; }
                        }
                    },
                    x: {
                        ticks: { color: this.brandColors.text }
                    }
                }
            }
        };
    }

    /**
     * Generate QuickChart URL for specific statistic
     */
    generateChartUrl(statisticKey, width = 600, height = 400) {
        const config = this.generateChartConfig(statisticKey);
        const encodedConfig = encodeURIComponent(JSON.stringify(config));
        return `${this.baseUrl}?c=${encodedConfig}&w=${width}&h=${height}&f=png&bkg=white`;
    }

    /**
     * Generate all chart URLs for the article
     */
    generateAllChartUrls() {
        const charts = {};
        Object.keys(ARTICLE_STATISTICS).forEach(key => {
            charts[key] = {
                url: this.generateChartUrl(key),
                title: ARTICLE_STATISTICS[key].title,
                description: ARTICLE_STATISTICS[key].description,
                chartType: ARTICLE_STATISTICS[key].chartType
            };
        });
        return charts;
    }
}

// ============================================================================
// D3.JS INTERACTIVE VISUALIZATION FUNCTIONS
// ============================================================================

/**
 * D3.js Interactive Chart Configurations
 */
class D3InteractiveCharts {
    constructor() {
        this.colors = QUARTZIQ_COLORS;
    }

    /**
     * Create animated comparison chart for Traditional vs AI-Powered systems
     */
    createComparisonAnimation(containerId) {
        return `
        <div id="${containerId}" class="d3-comparison-chart"></div>
        <script>
        // D3.js Animated Comparison Chart
        (function() {
            const data = ${JSON.stringify(ARTICLE_STATISTICS.salesPerformance.data)};
            const container = d3.select('#${containerId}');
            
            const margin = {top: 20, right: 30, bottom: 40, left: 90};
            const width = 600 - margin.left - margin.right;
            const height = 400 - margin.top - margin.bottom;
            
            const svg = container.append('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            
            // Create animated bars with QuartzIQ branding
            // Implementation continues...
        })();
        </script>`;
    }

    /**
     * Create real-time metrics dashboard
     */
    createMetricsDashboard(containerId) {
        return `
        <div id="${containerId}" class="metrics-dashboard">
            <div class="metric-cards-grid">
                <!-- Animated metric cards will be generated here -->
            </div>
        </div>
        <script>
        // Real-time animated metrics using D3.js
        // Implementation with QuartzIQ branding and animations
        </script>`;
    }
}

// ============================================================================
// FABRIC.JS INFOGRAPHIC GENERATION
// ============================================================================

/**
 * Fabric.js Dynamic Infographic Templates
 */
class InfographicGenerator {
    constructor() {
        this.brandColors = QUARTZIQ_COLORS;
        this.brandFont = 'Inter, sans-serif';
    }

    /**
     * Generate performance improvement infographic
     */
    createPerformanceInfographic(canvasId) {
        return `
        <canvas id="${canvasId}" width="800" height="1000"></canvas>
        <script>
        // Fabric.js Performance Infographic
        (function() {
            const canvas = new fabric.Canvas('${canvasId}');
            const colors = ${JSON.stringify(this.brandColors)};
            
            // Create branded infographic with statistics
            const title = new fabric.Text('AI-Powered Customer Intelligence Impact', {
                left: 400,
                top: 50,
                fontFamily: 'Inter',
                fontSize: 28,
                fontWeight: 'bold',
                fill: colors.primary,
                textAlign: 'center',
                originX: 'center'
            });
            
            canvas.add(title);
            
            // Add statistical visualizations programmatically
            // Implementation continues with dynamic data insertion...
        })();
        </script>`;
    }

    /**
     * Generate ROI comparison infographic template
     */
    createROIComparisonTemplate() {
        // Template configuration for automated ROI infographic generation
        return {
            template: 'roi-comparison',
            dimensions: { width: 800, height: 600 },
            sections: [
                { type: 'header', text: 'ROI Comparison: Traditional vs AI-Powered' },
                { type: 'metrics', data: 'roiBenchmarks' },
                { type: 'footer', text: 'QuartzIQ Customer Intelligence Platform' }
            ],
            branding: this.brandColors
        };
    }
}

// ============================================================================
// MAIN VISUALIZATION CONTROLLER
// ============================================================================

/**
 * Main controller for all visualization systems
 */
class VisualizationController {
    constructor() {
        this.quickChart = new QuickChartGenerator();
        this.d3Charts = new D3InteractiveCharts();
        this.infographics = new InfographicGenerator();
    }

    /**
     * Initialize all visualizations for the article
     */
    initializeAllVisualizations() {
        // Generate all QuickChart URLs
        const chartUrls = this.quickChart.generateAllChartUrls();
        
        // Store chart configurations for dynamic loading
        window.quartziqCharts = chartUrls;
        window.quartziqData = ARTICLE_STATISTICS;
        
        console.log('QuartzIQ Article Visualizations Initialized');
        console.log('Available Charts:', Object.keys(chartUrls));
        
        return chartUrls;
    }

    /**
     * Insert chart at specific article location
     */
    insertChartAtLocation(chartKey, targetElementId) {
        const chart = window.quartziqCharts[chartKey];
        if (chart) {
            const img = document.createElement('img');
            img.src = chart.url;
            img.alt = chart.title;
            img.className = 'quartziq-chart img-responsive';
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.appendChild(img);
            }
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize visualization system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    const visualController = new VisualizationController();
    visualController.initializeAllVisualizations();
    
    console.log('QuartzIQ Data Visualization System Ready');
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ARTICLE_STATISTICS,
        QUARTZIQ_COLORS,
        QuickChartGenerator,
        D3InteractiveCharts,
        InfographicGenerator,
        VisualizationController
    };
}
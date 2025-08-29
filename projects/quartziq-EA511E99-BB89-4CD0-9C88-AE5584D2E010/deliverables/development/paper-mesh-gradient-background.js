/**
 * QuartzIQ Paper.js Mesh Gradient Background
 * Professional, slow-moving gradient background for hero section
 * Based on Paper.js shader techniques with QuartzIQ brand integration
 */

class QuartzIQMeshGradient {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with id "${canvasId}" not found`);
        }
        
        // Configuration with more dynamic movement
        this.config = {
            speed: options.speed || 0.35,           // Faster, more noticeable movement
            distortion: options.distortion || 0.35, // Slightly more distortion
            swirl: options.swirl || 0.12,           // More visible swirl effect
            noiseScale: options.noiseScale || 0.008, // Fine noise detail
            colorIntensity: options.colorIntensity || 1.0,
            ...options
        };
        
        // QuartzIQ brand colors in HSL format - VIBRANT VERSION
        this.colors = options.colors || [
            'hsl(210, 75%, 88%)',   // Vibrant light QuartzIQ blue
            'hsl(203, 68%, 82%)',   // Rich brand blue
            'hsl(198, 60%, 78%)',   // Saturated accent blue
            'hsl(216, 55%, 85%)',   // Deep professional blue
            'hsl(194, 50%, 80%)',   // Cyan-blue accent
            'hsl(207, 65%, 86%)'    // Bright QuartzIQ blue
        ];
        
        this.animationId = null;
        this.time = 0;
        this.isPlaying = false;
        
        this.init();
    }
    
    /**
     * Initialize Paper.js and create gradient system
     */
    init() {
        // Setup Paper.js
        paper.setup(this.canvas);
        
        // Create gradient points
        this.gradientPoints = this.createGradientPoints();
        
        // Create background rectangle
        this.background = new paper.Rectangle(0, 0, paper.view.size.width, paper.view.size.height);
        this.backgroundPath = new paper.Path.Rectangle(this.background);
        
        // Start animation
        this.startAnimation();
        
        // Handle resize
        window.addEventListener('resize', () => this.handleResize());
    }
    
    /**
     * Create animated gradient points
     */
    createGradientPoints() {
        const points = [];
        const numPoints = 6; // Fewer points for cleaner look
        
        for (let i = 0; i < numPoints; i++) {
            const point = {
                originalX: Math.random() * paper.view.size.width,
                originalY: Math.random() * paper.view.size.height,
                offsetX: Math.random() * Math.PI * 2,
                offsetY: Math.random() * Math.PI * 2,
                radiusX: 100 + Math.random() * 200,
                radiusY: 100 + Math.random() * 200,
                color: this.colors[i % this.colors.length],
                intensity: 0.6 + Math.random() * 0.4
            };
            points.push(point);
        }
        
        return points;
    }
    
    /**
     * Update gradient animation
     */
    updateGradient() {
        this.time += this.config.speed;
        
        // Clear previous gradient
        if (this.backgroundPath.fillColor && this.backgroundPath.fillColor.gradient) {
            this.backgroundPath.fillColor = null;
        }
        
        // Create new gradient with animated positions
        const gradient = this.createAnimatedGradient();
        this.backgroundPath.fillColor = gradient;
        
        paper.view.draw();
    }
    
    /**
     * Create animated radial gradient
     */
    createAnimatedGradient() {
        const centerX = paper.view.center.x + Math.sin(this.time * 0.3) * 30;
        const centerY = paper.view.center.y + Math.cos(this.time * 0.2) * 20;
        
        // Create gradient stops based on animated points
        const stops = this.gradientPoints.map((point, index) => {
            const animatedX = point.originalX + 
                Math.sin(this.time + point.offsetX) * point.radiusX * this.config.distortion;
            const animatedY = point.originalY + 
                Math.cos(this.time + point.offsetY) * point.radiusY * this.config.distortion;
            
            // Add swirl effect
            const distance = Math.sqrt(
                Math.pow(animatedX - centerX, 2) + 
                Math.pow(animatedY - centerY, 2)
            );
            const angle = Math.atan2(animatedY - centerY, animatedX - centerX) + 
                (distance * this.config.swirl * Math.sin(this.time));
            
            const swirlX = centerX + Math.cos(angle) * distance;
            const swirlY = centerY + Math.sin(angle) * distance;
            
            return {
                offset: index / (this.gradientPoints.length - 1),
                color: this.parseHSLColor(point.color, point.intensity)
            };
        });
        
        // Create radial gradient
        return {
            gradient: {
                stops: stops,
                radial: true
            },
            origin: new paper.Point(centerX, centerY),
            destination: new paper.Point(
                centerX + paper.view.size.width * 0.6,
                centerY + paper.view.size.height * 0.6
            )
        };
    }
    
    /**
     * Parse HSL color string to Paper.js Color
     */
    parseHSLColor(hslString, intensity = 1) {
        const hslMatch = hslString.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!hslMatch) return new paper.Color(hslString);
        
        const [, h, s, l] = hslMatch;
        const color = new paper.Color({
            hue: parseInt(h),
            saturation: parseInt(s) / 100 * intensity,
            lightness: parseInt(l) / 100
        });
        
        return color;
    }
    
    /**
     * Start animation loop
     */
    startAnimation() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        
        const animate = () => {
            if (!this.isPlaying) return;
            
            this.updateGradient();
            this.animationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * Stop animation
     */
    stopAnimation() {
        this.isPlaying = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * Handle canvas resize
     */
    handleResize() {
        paper.view.viewSize = new paper.Size(this.canvas.offsetWidth, this.canvas.offsetHeight);
        this.background = new paper.Rectangle(0, 0, paper.view.size.width, paper.view.size.height);
        this.backgroundPath.bounds = this.background;
        
        // Regenerate points for new dimensions
        this.gradientPoints = this.createGradientPoints();
    }
    
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * Change colors
     */
    updateColors(newColors) {
        this.colors = newColors;
        this.gradientPoints.forEach((point, index) => {
            point.color = this.colors[index % this.colors.length];
        });
    }
}

/**
 * CSS-only fallback gradient for non-JavaScript environments - VIBRANT VERSION
 */
const CSS_FALLBACK_GRADIENT = `
    background: linear-gradient(135deg, 
        hsl(210, 75%, 88%) 0%, 
        hsl(203, 68%, 82%) 20%, 
        hsl(198, 60%, 78%) 40%, 
        hsl(216, 55%, 85%) 60%, 
        hsl(194, 50%, 80%) 80%, 
        hsl(207, 65%, 86%) 100%
    );
`;

/**
 * Initialize QuartzIQ mesh gradient background
 */
function initializeQuartzIQMeshBackground(canvasId, options = {}) {
    // Check for Paper.js availability
    if (typeof paper === 'undefined') {
        console.warn('Paper.js not loaded, using CSS fallback gradient');
        const canvas = document.getElementById(canvasId);
        if (canvas && canvas.parentElement) {
            canvas.parentElement.style.cssText += CSS_FALLBACK_GRADIENT;
            canvas.style.display = 'none';
        }
        return null;
    }
    
    try {
        const gradient = new QuartzIQMeshGradient(canvasId, {
            speed: 0.35,              // More dynamic, noticeable movement
            distortion: 0.35,         // Enhanced distortion for visual interest
            swirl: 0.12,              // More visible swirl effect
            colorIntensity: 1.0,      // Maximum color vibrancy
            ...options
        });
        
        console.log('QuartzIQ mesh gradient background initialized');
        return gradient;
    } catch (error) {
        console.error('Failed to initialize mesh gradient:', error);
        
        // Fallback to CSS gradient
        const canvas = document.getElementById(canvasId);
        if (canvas && canvas.parentElement) {
            canvas.parentElement.style.cssText += CSS_FALLBACK_GRADIENT;
            canvas.style.display = 'none';
        }
        
        return null;
    }
}

/**
 * Optimized mesh gradient for mobile devices
 */
function initializeMobileOptimizedGradient(canvasId) {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Use simpler CSS gradient on mobile for performance
        const canvas = document.getElementById(canvasId);
        if (canvas && canvas.parentElement) {
            canvas.parentElement.style.cssText += CSS_FALLBACK_GRADIENT;
            canvas.style.display = 'none';
        }
        return null;
    }
    
    return initializeQuartzIQMeshBackground(canvasId, {
        speed: 0.25,          // Faster movement for mobile too
        distortion: 0.25,     // Balanced distortion for mobile
        swirl: 0.08           // More visible swirl on mobile
    });
}

/**
 * Professional color schemes for different contexts
 */
const COLOR_SCHEMES = {
    quartziq: [
        'hsl(210, 75%, 88%)',   // Vibrant QuartzIQ light blue
        'hsl(203, 68%, 82%)',   // Rich brand blue
        'hsl(198, 60%, 78%)',   // Saturated accent blue
        'hsl(216, 55%, 85%)',   // Deep professional blue
        'hsl(194, 50%, 80%)',   // Cyan-blue accent
        'hsl(207, 65%, 86%)'    // Bright QuartzIQ blue
    ],
    
    quartziqSubtle: [
        'hsl(210, 45%, 96%)',   // Original subtle version
        'hsl(203, 35%, 92%)',   // Original brand blue
        'hsl(198, 30%, 88%)',   // Original accent blue
        'hsl(210, 25%, 94%)',   // Original neutral
        'hsl(200, 20%, 90%)'    // Original background
    ],
    
    enterprise: [
        'hsl(220, 20%, 96%)',   // Cool gray
        'hsl(210, 15%, 93%)',   // Light blue-gray
        'hsl(200, 12%, 90%)',   // Neutral gray
        'hsl(180, 8%, 92%)'     // Warm gray
    ],
    
    subtle: [
        'hsl(0, 0%, 98%)',      // Near white
        'hsl(210, 10%, 95%)',   // Very light blue
        'hsl(0, 0%, 93%)',      // Light gray
        'hsl(30, 5%, 96%)'      // Warm white
    ]
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QuartzIQMeshGradient,
        initializeQuartzIQMeshBackground,
        initializeMobileOptimizedGradient,
        COLOR_SCHEMES,
        CSS_FALLBACK_GRADIENT
    };
}

// Global initialization function
window.initializeQuartzIQMeshBackground = initializeQuartzIQMeshBackground;
window.initializeMobileOptimizedGradient = initializeMobileOptimizedGradient;
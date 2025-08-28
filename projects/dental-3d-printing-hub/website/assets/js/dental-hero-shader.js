/**
 * ORCHESTRAI Dental 3D Printing Hero Shader
 * Inspired by iPhone 16 visual design with dental industry theming
 * WebGL-powered fluid background with particle systems
 */

class DentalHeroShader {
    constructor(canvas) {
        console.log('DentalHeroShader constructor called with canvas:', canvas);
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        this.time = 0;
        this.mouse = { x: 0.5, y: 0.5 };
        this.particles = [];
        this.isInitialized = false;
        
        console.log('WebGL context:', this.gl);
        
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to CSS animation');
            this.fallbackToCSSAnimation();
            return;
        }
        
        this.init();
    }
    
    init() {
        console.log('Initializing WebGL shader...');
        try {
            this.setupGL();
            console.log('GL setup complete');
            
            this.createShaders();
            console.log('Shaders created');
            
            this.createGeometry();
            console.log('Geometry created');
            
            this.initParticles();
            console.log('Particles initialized');
            
            this.bindEvents();
            console.log('Events bound');
            
            this.render();
            console.log('Rendering started');
            
            this.isInitialized = true;
            console.log('WebGL shader initialization complete!');
        } catch (error) {
            console.error('WebGL initialization failed:', error);
            this.fallbackToCSSAnimation();
        }
    }
    
    setupGL() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    }
    
    createShaders() {
        // Vertex shader for fluid background
        const vertexShaderSource = `
            attribute vec4 a_position;
            attribute vec2 a_texCoord;
            varying vec2 v_texCoord;
            varying vec2 v_position;
            
            void main() {
                gl_Position = a_position;
                v_texCoord = a_texCoord;
                v_position = a_position.xy;
            }
        `;
        
        // Fragment shader with dental-themed fluid effects
        const fragmentShaderSource = `
            precision mediump float;
            
            varying vec2 v_texCoord;
            varying vec2 v_position;
            
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform vec2 u_resolution;
            
            // Dental industry colors
            #define DENTAL_BLUE vec3(0.055, 0.647, 0.914)
            #define DENTAL_CYAN vec3(0.024, 0.714, 0.831)
            #define DENTAL_WHITE vec3(0.980, 0.988, 1.0)
            #define DENTAL_SILVER vec3(0.580, 0.639, 0.722)
            
            // Noise functions for organic flow
            float noise(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
            }
            
            float smoothNoise(vec2 st) {
                vec2 i = floor(st);
                vec2 f = fract(st);
                
                float a = noise(i);
                float b = noise(i + vec2(1.0, 0.0));
                float c = noise(i + vec2(0.0, 1.0));
                float d = noise(i + vec2(1.0, 1.0));
                
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }
            
            float fractalNoise(vec2 st) {
                float value = 0.0;
                float amplitude = 0.5;
                for (int i = 0; i < 4; i++) {
                    value += amplitude * smoothNoise(st);
                    st *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            // Dental equipment inspired wave function
            float dentalWave(vec2 uv, float time) {
                vec2 center = vec2(0.5, 0.6);
                float dist = length(uv - center);
                
                // Create multiple wave sources like dental equipment patterns
                float wave1 = sin(dist * 15.0 - time * 2.0) * exp(-dist * 3.0);
                float wave2 = sin(dist * 8.0 - time * 1.5 + 1.57) * exp(-dist * 2.0);
                float wave3 = sin(dist * 20.0 - time * 3.0 + 3.14) * exp(-dist * 4.0);
                
                return (wave1 + wave2 * 0.7 + wave3 * 0.5) * 0.3;
            }
            
            // Precision-inspired geometric patterns
            float precisionPattern(vec2 uv, float time) {
                vec2 grid = fract(uv * 8.0 + time * 0.1);
                float pattern = smoothstep(0.48, 0.52, grid.x) * smoothstep(0.48, 0.52, grid.y);
                return pattern * 0.1;
            }
            
            // 3D printing layer effect
            float layerEffect(vec2 uv, float time) {
                float layers = sin(uv.y * 40.0 + time) * 0.5 + 0.5;
                layers *= smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
                return layers * 0.05;
            }
            
            void main() {
                vec2 uv = v_texCoord;
                vec2 normalizedMouse = u_mouse;
                
                // Create flowing background inspired by dental precision
                float noise1 = fractalNoise(uv * 3.0 + u_time * 0.1);
                float noise2 = fractalNoise(uv * 5.0 - u_time * 0.15);
                float noise3 = fractalNoise(uv * 2.0 + u_time * 0.05);
                
                // Mouse interaction for dynamic flow
                float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, length(uv - normalizedMouse));
                
                // Combine noise layers for organic movement
                vec2 flowField = vec2(
                    noise1 - noise2 + mouseInfluence * 0.1,
                    noise2 - noise3 + sin(u_time * 0.5) * 0.1
                ) * 0.02;
                
                vec2 distortedUV = uv + flowField;
                
                // Create dental-themed gradient base
                vec3 color = mix(DENTAL_BLUE, DENTAL_CYAN, distortedUV.y);
                color = mix(color, DENTAL_WHITE, smoothstep(0.3, 0.8, distortedUV.x));
                
                // Add depth with multiple gradient layers
                float gradient1 = smoothstep(0.0, 1.0, distortedUV.y + noise1 * 0.2);
                float gradient2 = smoothstep(0.2, 0.8, distortedUV.x + noise2 * 0.1);
                
                color = mix(color, DENTAL_CYAN, gradient1 * 0.3);
                color = mix(color, DENTAL_SILVER, gradient2 * 0.2);
                
                // Add dental wave effects
                float waves = dentalWave(distortedUV, u_time);
                color += waves * DENTAL_WHITE;
                
                // Add precision patterns
                float precision = precisionPattern(distortedUV, u_time * 0.5);
                color += precision * DENTAL_WHITE;
                
                // Add 3D printing layer effects
                float layers = layerEffect(distortedUV, u_time * 2.0);
                color += layers * vec3(0.8, 0.9, 1.0);
                
                // Professional glow effect
                float centerGlow = 1.0 - smoothstep(0.1, 0.8, length(distortedUV - vec2(0.5, 0.4)));
                color += centerGlow * DENTAL_WHITE * 0.1;
                
                // Add subtle vignette for depth
                float vignette = smoothstep(0.0, 0.3, 1.0 - length(uv - vec2(0.5)));
                color *= vignette * 0.8 + 0.2;
                
                // Final color adjustment for premium look
                color = pow(color, vec3(0.9)); // Slight gamma adjustment
                color = mix(color, vec3(0.05, 0.1, 0.2), 0.1); // Add depth
                
                gl_FragColor = vec4(color, 0.95);
            }
        `;
        
        // Create and compile shaders
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        
        // Get uniform and attribute locations
        this.uniformLocations = {
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution')
        };
        
        this.attributeLocations = {
            position: this.gl.getAttribLocation(this.program, 'a_position'),
            texCoord: this.gl.getAttribLocation(this.program, 'a_texCoord')
        };
    }
    
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
        }
        
        return program;
    }
    
    compileShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
        }
        
        return shader;
    }
    
    createGeometry() {
        // Create full-screen quad
        const positions = [
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ];
        
        const texCoords = [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ];
        
        // Position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
        
        // Texture coordinate buffer
        this.texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texCoords), this.gl.STATIC_DRAW);
    }
    
    initParticles() {
        // Initialize floating dental equipment particles
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random(),
                y: Math.random(),
                vx: (Math.random() - 0.5) * 0.001,
                vy: (Math.random() - 0.5) * 0.001,
                size: Math.random() * 0.02 + 0.01,
                opacity: Math.random() * 0.3 + 0.1,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width;
            this.mouse.y = 1.0 - (e.clientY - rect.top) / rect.height; // Flip Y coordinate
        });
        
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        this.resize();
    }
    
    resize() {
        console.log('Resizing canvas...');
        // Get parent container dimensions
        const parent = this.canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        
        // Optimize for performance - limit DPR for mobile devices  
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        
        // Set canvas size
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        console.log(`Canvas sized to: ${rect.width}x${rect.height} (actual: ${this.canvas.width}x${this.canvas.height})`);
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    render() {
        if (!this.gl || !this.isInitialized) return;
        
        try {
            this.time += 0.016; // ~60fps
            
            // Clear canvas
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
            
            // Use shader program
            this.gl.useProgram(this.program);
            
            // Set uniforms
            this.gl.uniform1f(this.uniformLocations.time, this.time);
            this.gl.uniform2f(this.uniformLocations.mouse, this.mouse.x, this.mouse.y);
            this.gl.uniform2f(this.uniformLocations.resolution, this.canvas.width, this.canvas.height);
            
            // Set up position attribute
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
            this.gl.enableVertexAttribArray(this.attributeLocations.position);
            this.gl.vertexAttribPointer(this.attributeLocations.position, 2, this.gl.FLOAT, false, 0, 0);
            
            // Set up texture coordinate attribute
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texCoordBuffer);
            this.gl.enableVertexAttribArray(this.attributeLocations.texCoord);
            this.gl.vertexAttribPointer(this.attributeLocations.texCoord, 2, this.gl.FLOAT, false, 0, 0);
            
            // Draw
            this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            
            // Check for WebGL errors in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const error = this.gl.getError();
                if (error !== this.gl.NO_ERROR) {
                    console.warn('WebGL error:', error);
                }
            }
            
        } catch (error) {
            console.error('WebGL render error:', error);
            this.fallbackToCSSAnimation();
            return;
        }
        
        // Continue animation
        requestAnimationFrame(() => this.render());
    }
    
    fallbackToCSSAnimation() {
        // Fallback for devices without WebGL support
        this.canvas.style.background = `
            linear-gradient(135deg, 
                rgba(14, 165, 233, 0.8) 0%, 
                rgba(6, 182, 212, 0.6) 50%, 
                rgba(249, 250, 251, 0.4) 100%)
        `;
        this.canvas.classList.add('fallback-animation');
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            .fallback-animation {
                animation: dentalFlow 8s ease-in-out infinite;
                background-size: 400% 400%;
            }
            
            @keyframes dentalFlow {
                0%, 100% { background-position: 0% 50%; }
                25% { background-position: 100% 50%; }
                50% { background-position: 50% 100%; }
                75% { background-position: 50% 0%; }
            }
        `;
        document.head.appendChild(style);
    }
    
    destroy() {
        if (this.gl) {
            this.gl.deleteProgram(this.program);
            this.gl.deleteBuffer(this.positionBuffer);
            this.gl.deleteBuffer(this.texCoordBuffer);
        }
    }
}

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, looking for dental-hero-canvas...');
    const heroCanvas = document.getElementById('dental-hero-canvas');
    if (heroCanvas) {
        console.log('Canvas found, initializing shader...');
        window.dentalHeroShader = new DentalHeroShader(heroCanvas);
        console.log('Shader initialized:', window.dentalHeroShader);
    } else {
        console.error('Canvas with id "dental-hero-canvas" not found!');
    }
});
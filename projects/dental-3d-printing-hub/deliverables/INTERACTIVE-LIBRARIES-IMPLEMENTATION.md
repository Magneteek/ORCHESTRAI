# INTERACTIVE LIBRARIES IMPLEMENTATION GUIDE
## Advanced Animations, Shaders & Data Visualization

---

## 🌊 Paper Design Shaders Integration

### **Fluid Background Implementation**
```typescript
// src/components/backgrounds/FluidBackground.tsx
import React, { useEffect, useRef } from 'react';

// Note: @paper-design/shaders might need alternative approach
// Alternative: Custom WebGL fluid simulation
class FluidSimulation {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private animationId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl') as WebGLRenderingContext;
    this.setupShaders();
    this.setupBuffers();
  }

  private setupShaders() {
    // Vertex shader for fluid simulation
    const vertexShaderSource = `
      attribute vec4 a_position;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
      }
    `;

    // Fragment shader with fluid dynamics
    const fragmentShaderSource = `
      precision mediump float;
      
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_colors[3];
      
      varying vec2 v_texCoord;
      
      // Noise function for fluid-like movement
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }
      
      // Smooth noise
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
      
      // Fractal noise
      float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 0.5;
        float frequency = 0.0;
        
        for (int i = 0; i < 4; i++) {
          value += amplitude * smoothNoise(st);
          st *= 2.0;
          amplitude *= 0.5;
        }
        return value;
      }
      
      void main() {
        vec2 st = v_texCoord;
        vec2 mouse = u_mouse / u_resolution;
        
        // Create fluid-like distortion
        vec2 distortion = vec2(
          fbm(st * 3.0 + u_time * 0.1),
          fbm(st * 3.0 + u_time * 0.1 + 100.0)
        );
        
        // Add mouse interaction
        float mouseInfluence = 1.0 - length(st - mouse) * 2.0;
        mouseInfluence = max(0.0, mouseInfluence);
        
        st += distortion * 0.1 + mouse * mouseInfluence * 0.05;
        
        // Create flowing colors
        float r = fbm(st + u_time * 0.2);
        float g = fbm(st + u_time * 0.3 + vec2(1.0, 1.0));
        float b = fbm(st + u_time * 0.1 + vec2(2.0, 2.0));
        
        // Mix with defined colors
        vec3 color1 = u_colors[0] * r;
        vec3 color2 = u_colors[1] * g;
        vec3 color3 = u_colors[2] * b;
        
        vec3 finalColor = (color1 + color2 + color3) * 0.7;
        
        gl_FragColor = vec4(finalColor, 0.8);
      }
    `;

    // Create and compile shaders
    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Create program
    this.program = this.gl.createProgram()!;
    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);
  }

  private createShader(type: number, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  private setupBuffers() {
    // Create quad for rendering
    const positions = [-1, -1, 1, -1, -1, 1, 1, 1];
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);
  }

  public start(colors: [number, number, number][] = [[14, 165, 233], [6, 182, 212], [16, 185, 129]]) {
    const startTime = Date.now();
    let mouseX = 0;
    let mouseY = 0;

    // Mouse interaction
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = rect.height - (e.clientY - rect.top);
    });

    const render = () => {
      const currentTime = (Date.now() - startTime) * 0.001;
      
      // Resize canvas to container
      const displayWidth = this.canvas.clientWidth;
      const displayHeight = this.canvas.clientHeight;
      
      if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        this.gl.viewport(0, 0, displayWidth, displayHeight);
      }

      // Use shader program
      this.gl.useProgram(this.program);

      // Set uniforms
      const timeLocation = this.gl.getUniformLocation(this.program, 'u_time');
      const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');
      const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse');
      const colorsLocation = this.gl.getUniformLocation(this.program, 'u_colors');

      this.gl.uniform1f(timeLocation, currentTime);
      this.gl.uniform2f(resolutionLocation, displayWidth, displayHeight);
      this.gl.uniform2f(mouseLocation, mouseX, mouseY);
      
      // Set colors (convert to 0-1 range)
      const normalizedColors = colors.map(color => color.map(c => c / 255));
      this.gl.uniform3fv(colorsLocation, normalizedColors.flat());

      // Set up attributes
      const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
      this.gl.enableVertexAttribArray(positionLocation);
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);

      // Draw
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

      this.animationId = requestAnimationFrame(render);
    };

    render();
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// React Component
export const FluidBackground: React.FC<{
  colors?: [number, number, number][];
  className?: string;
}> = ({ 
  colors = [[14, 165, 233], [6, 182, 212], [16, 185, 129]], 
  className = "" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fluidSimRef = useRef<FluidSimulation | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fluidSimRef.current = new FluidSimulation(canvasRef.current);
      fluidSimRef.current.start(colors);

      return () => {
        fluidSimRef.current?.stop();
      };
    }
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: -1 }}
    />
  );
};
```

---

## 🎬 GSAP Advanced Animations

### **Scroll-Triggered Animations**
```typescript
// src/hooks/useGSAPAnimations.ts
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger, TextPlugin, MorphSVGPlugin } from 'gsap/all';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin, MorphSVGPlugin);

export const useGSAPAnimations = () => {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // Create main timeline
    timelineRef.current = gsap.timeline();

    // Hero animations
    const heroTL = gsap.timeline();
    heroTL
      .from('.hero__title', {
        duration: 1.2,
        y: 100,
        opacity: 0,
        ease: 'power3.out'
      })
      .from('.hero__subtitle', {
        duration: 1,
        y: 50,
        opacity: 0,
        ease: 'power2.out'
      }, '-=0.6')
      .from('.hero__cta', {
        duration: 0.8,
        scale: 0.8,
        opacity: 0,
        ease: 'back.out(1.7)'
      }, '-=0.4')
      .from('.hero__stats', {
        duration: 1,
        y: 30,
        opacity: 0,
        stagger: 0.1,
        ease: 'power2.out'
      }, '-=0.6');

    // Feature cards with scroll trigger
    gsap.utils.toArray('.feature-card').forEach((card: any, i) => {
      gsap.fromTo(card, 
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotationY: -15
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            onEnter: () => gsap.to(card, { 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
            })
          },
          delay: i * 0.1
        }
      );
    });

    // Parallax backgrounds
    gsap.utils.toArray('.parallax-bg').forEach((bg: any) => {
      gsap.to(bg, {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: bg,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });

    // ROI Calculator number counting
    const countUpNumbers = () => {
      gsap.utils.toArray('.count-up').forEach((counter: any) => {
        const target = parseInt(counter.dataset.target || '0');
        gsap.to(counter, {
          duration: 2,
          ease: 'power2.out',
          textContent: target,
          roundProps: 'textContent',
          scrollTrigger: {
            trigger: counter,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    };

    countUpNumbers();

    // Morphing SVG icons
    const setupSVGMorphing = () => {
      gsap.utils.toArray('.morph-icon').forEach((icon: any) => {
        const morphTarget = icon.dataset.morphTarget;
        if (morphTarget) {
          gsap.to(icon, {
            morphSVG: morphTarget,
            duration: 0.5,
            ease: 'power2.inOut',
            paused: true,
            id: `morph_${icon.id}`
          });
        }
      });
    };

    setupSVGMorphing();

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      timelineRef.current?.kill();
    };
  }, []);

  // Animation control functions
  const playMorphAnimation = (iconId: string) => {
    gsap.getById(`morph_${iconId}`)?.play();
  };

  const reverseMorphAnimation = (iconId: string) => {
    gsap.getById(`morph_${iconId}`)?.reverse();
  };

  return {
    playMorphAnimation,
    reverseMorphAnimation,
    timeline: timelineRef.current
  };
};
```

### **Advanced GSAP Component**
```tsx
// src/components/animations/GSAPSection.tsx
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface GSAPSectionProps {
  children: React.ReactNode;
  animation?: 'fadeUp' | 'slideIn' | 'scale' | 'reveal' | 'morphText';
  trigger?: 'scroll' | 'hover' | 'click' | 'load';
  duration?: number;
  delay?: number;
  stagger?: number;
  className?: string;
}

export const GSAPSection: React.FC<GSAPSectionProps> = ({
  children,
  animation = 'fadeUp',
  trigger = 'scroll',
  duration = 1,
  delay = 0,
  stagger = 0,
  className = ''
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const children = section.querySelectorAll(':scope > *');

    // Animation configurations
    const animations = {
      fadeUp: {
        from: { y: 50, opacity: 0 },
        to: { y: 0, opacity: 1, ease: 'power2.out' }
      },
      slideIn: {
        from: { x: -100, opacity: 0 },
        to: { x: 0, opacity: 1, ease: 'power3.out' }
      },
      scale: {
        from: { scale: 0.8, opacity: 0 },
        to: { scale: 1, opacity: 1, ease: 'back.out(1.7)' }
      },
      reveal: {
        from: { clipPath: 'inset(0 100% 0 0)' },
        to: { clipPath: 'inset(0 0% 0 0)', ease: 'power2.out' }
      },
      morphText: {
        from: { rotationX: -90, opacity: 0 },
        to: { rotationX: 0, opacity: 1, ease: 'power2.out' }
      }
    };

    const config = animations[animation];
    
    // Create timeline
    timelineRef.current = gsap.timeline({ paused: true });
    
    if (stagger > 0) {
      timelineRef.current
        .fromTo(children, config.from, {
          ...config.to,
          duration,
          stagger,
          delay
        });
    } else {
      timelineRef.current
        .fromTo(section, config.from, {
          ...config.to,
          duration,
          delay
        });
    }

    // Set up triggers
    if (trigger === 'scroll') {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 80%',
        onEnter: () => timelineRef.current?.play(),
        onLeave: () => timelineRef.current?.reverse(),
        onEnterBack: () => timelineRef.current?.play(),
        onLeaveBack: () => timelineRef.current?.reverse()
      });
    } else if (trigger === 'load') {
      timelineRef.current.play();
    }

    // Event listeners for other triggers
    const handleInteraction = () => timelineRef.current?.play();
    
    if (trigger === 'hover') {
      section.addEventListener('mouseenter', handleInteraction);
      section.addEventListener('mouseleave', () => timelineRef.current?.reverse());
    } else if (trigger === 'click') {
      section.addEventListener('click', handleInteraction);
    }

    return () => {
      timelineRef.current?.kill();
      ScrollTrigger.getAll().forEach(st => {
        if (st.trigger === section) st.kill();
      });
      
      if (trigger === 'hover') {
        section.removeEventListener('mouseenter', handleInteraction);
        section.removeEventListener('mouseleave', () => timelineRef.current?.reverse());
      } else if (trigger === 'click') {
        section.removeEventListener('click', handleInteraction);
      }
    };
  }, [animation, trigger, duration, delay, stagger]);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};
```

---

## 📊 Advanced D3.js Visualizations

### **Interactive ROI Dashboard**
```typescript
// src/components/visualizations/ROIDashboard.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ROIData {
  year: number;
  savings: number;
  efficiency: number;
  cases: number;
}

interface ROIDashboardProps {
  data: ROIData[];
  width?: number;
  height?: number;
  interactive?: boolean;
}

export const ROIDashboard: React.FC<ROIDashboardProps> = ({
  data,
  width = 800,
  height = 400,
  interactive = true
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous content

    const margin = { top: 20, right: 80, bottom: 40, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year) as [number, number])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.savings) as number])
      .range([innerHeight, 0]);

    const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.cases) as number])
      .range([5, 25]);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
      .domain([0, 100]);

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'roi-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', innerHeight)
      .attr('x2', 0).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#0ea5e9')
      .attr('stop-opacity', 0.1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#0ea5e9')
      .attr('stop-opacity', 0.8);

    // Line generator
    const line = d3.line<ROIData>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.savings))
      .curve(d3.curveCardinal);

    // Area generator
    const area = d3.area<ROIData>()
      .x(d => xScale(d.year))
      .y0(innerHeight)
      .y1(d => yScale(d.savings))
      .curve(d3.curveCardinal);

    // Add area
    const areaPath = g.append('path')
      .datum(data)
      .attr('fill', 'url(#roi-gradient)')
      .attr('d', area);

    // Add line
    const linePath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#0ea5e9')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add circles for data points
    const circles = g.selectAll('.data-point')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'data-point')
      .attr('cx', d => xScale(d.year))
      .attr('cy', d => yScale(d.savings))
      .attr('r', d => radiusScale(d.cases))
      .attr('fill', d => colorScale(d.efficiency))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', interactive ? 'pointer' : 'default');

    // Animate line drawing
    const totalLength = (linePath.node() as SVGPathElement).getTotalLength();
    linePath
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Animate area
    areaPath
      .attr('opacity', 0)
      .transition()
      .duration(1500)
      .delay(500)
      .attr('opacity', 1);

    // Animate circles
    circles
      .attr('r', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 200 + 1000)
      .attr('r', d => radiusScale(d.cases))
      .ease(d3.easeBounce);

    // Interactive features
    if (interactive) {
      // Tooltip
      const tooltip = d3.select('body').append('div')
        .attr('class', 'roi-tooltip glass p-3 rounded-lg absolute opacity-0 pointer-events-none')
        .style('background', 'rgba(255, 255, 255, 0.9)')
        .style('backdrop-filter', 'blur(10px)')
        .style('border', '1px solid rgba(255, 255, 255, 0.2)')
        .style('color', '#1f2937')
        .style('font-size', '14px')
        .style('z-index', '1000');

      circles
        .on('mouseover', (event, d) => {
          // Highlight circle
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', radiusScale(d.cases) * 1.5)
            .attr('stroke-width', 4);

          // Show tooltip
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 1);

          tooltip
            .html(`
              <div class="font-semibold">Year ${d.year}</div>
              <div>Savings: $${d.savings.toLocaleString()}</div>
              <div>Efficiency: ${d.efficiency}%</div>
              <div>Cases: ${d.cases}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', (event, d) => {
          // Reset circle
          d3.select(event.target)
            .transition()
            .duration(200)
            .attr('r', radiusScale(d.cases))
            .attr('stroke-width', 2);

          // Hide tooltip
          tooltip
            .transition()
            .duration(200)
            .style('opacity', 0);
        });

      // Cleanup tooltip on unmount
      return () => {
        tooltip.remove();
      };
    }

    // Add axes
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .style('color', '#6b7280');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d3.format('.1s')(d)}`))
      .style('color', '#6b7280');

    // Add labels
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (innerHeight / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-weight', '600')
      .text('Cost Savings ($)');

    g.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`)
      .style('text-anchor', 'middle')
      .style('fill', '#374151')
      .style('font-weight', '600')
      .text('Year');

  }, [data, width, height, interactive]);

  return (
    <div className="w-full">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg"
      >
      </svg>
    </div>
  );
};
```

### **Semantic Network Visualization**
```typescript
// src/components/visualizations/SemanticNetwork.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node {
  id: string;
  label: string;
  category: string;
  importance: number;
}

interface Link {
  source: string;
  target: string;
  strength: number;
}

interface SemanticNetworkProps {
  nodes: Node[];
  links: Link[];
  width?: number;
  height?: number;
}

export const SemanticNetwork: React.FC<SemanticNetworkProps> = ({
  nodes,
  links,
  width = 800,
  height = 600
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Color scale for categories
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Size scale for importance
    const sizeScale = d3.scaleSqrt()
      .domain(d3.extent(nodes, d => d.importance) as [number, number])
      .range([8, 30]);

    // Force simulation
    const simulation = d3.forceSimulation(nodes as any)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.importance) + 2));

    // Add links
    const linkElements = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', d => Math.sqrt(d.strength) * 2)
      .attr('stroke-opacity', 0.6);

    // Add nodes
    const nodeElements = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => sizeScale(d.importance))
      .attr('fill', d => colorScale(d.category))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded) as any);

    // Add labels
    const labelElements = svg.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => d.label)
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#374151')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('pointer-events', 'none');

    // Update positions on simulation tick
    simulation.on('tick', () => {
      linkElements
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements
        .attr('cx', d => (d as any).x)
        .attr('cy', d => (d as any).y);

      labelElements
        .attr('x', d => (d as any).x)
        .attr('y', d => (d as any).y);
    });

    // Drag functions
    function dragStarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Hover effects
    nodeElements
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.importance) * 1.5);

        // Highlight connected nodes
        const connectedNodeIds = new Set();
        links.forEach(link => {
          if (link.source === d.id) connectedNodeIds.add(link.target);
          if (link.target === d.id) connectedNodeIds.add(link.source);
        });

        nodeElements
          .style('opacity', node => connectedNodeIds.has(node.id) || node.id === d.id ? 1 : 0.3);

        linkElements
          .style('opacity', link => 
            (link.source === d.id || link.target === d.id) ? 1 : 0.1
          );
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.importance));

        nodeElements.style('opacity', 1);
        linkElements.style('opacity', 0.6);
      });

    return () => {
      simulation.stop();
    };
  }, [nodes, links, width, height]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-lg"
    />
  );
};
```

---

## 🎪 Interactive Component Examples

### **3D Tilt Card with GSAP**
```tsx
// src/components/interactive/TiltCard.tsx
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface TiltCardProps {
  children: React.ReactNode;
  intensity?: number;
  glare?: boolean;
  className?: string;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  intensity = 10,
  glare = true,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glareElement = glareRef.current;

    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      const rotateX = deltaY * intensity;
      const rotateY = -deltaX * intensity;

      gsap.to(card, {
        duration: 0.3,
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 1000,
        ease: 'power2.out'
      });

      if (glareElement) {
        const glareX = (deltaX + 1) * 50;
        const glareY = (deltaY + 1) * 50;
        
        gsap.to(glareElement, {
          duration: 0.3,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, 
                       rgba(255,255,255,0.3) 0%, 
                       transparent 50%)`,
          ease: 'power2.out'
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        duration: 0.5,
        rotationX: 0,
        rotationY: 0,
        ease: 'power2.out'
      });

      if (glareElement) {
        gsap.to(glareElement, {
          duration: 0.5,
          background: 'transparent',
          ease: 'power2.out'
        });
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <div 
      ref={cardRef}
      className={`relative preserve-3d ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="absolute inset-0 rounded-inherit pointer-events-none"
          style={{ borderRadius: 'inherit' }}
        />
      )}
    </div>
  );
};
```

`★ Insight ─────────────────────────────────────`
This implementation demonstrates the power of combining multiple modern libraries. The custom WebGL fluid background provides performance advantages over CSS animations, GSAP enables precise control over complex animations, and D3.js creates interactive data visualizations that enhance user engagement. The modular approach allows developers to mix and match these components based on specific project needs.
`─────────────────────────────────────────────────`

This comprehensive implementation guide provides everything needed to create stunning interactive experiences with the enhanced tech stack!
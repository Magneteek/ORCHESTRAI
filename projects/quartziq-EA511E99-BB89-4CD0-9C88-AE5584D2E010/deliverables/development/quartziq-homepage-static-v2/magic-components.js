// MagicUI-inspired Components for QuartzIQ Homepage V2

class MagicComponents {
    constructor() {
        this.components = new Map();
    }

    // Animated Beam Component
    createAnimatedBeam(fromElement, toElement, options = {}) {
        const {
            color = '#357494',
            duration = 2000,
            width = 2,
            glow = true
        } = options;

        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();
        
        const beam = document.createElement('div');
        beam.className = 'absolute pointer-events-none z-10';
        beam.style.cssText = `
            position: fixed;
            left: ${fromRect.left + fromRect.width/2}px;
            top: ${fromRect.top + fromRect.height/2}px;
            width: 0;
            height: ${width}px;
            background: linear-gradient(90deg, transparent, ${color}, transparent);
            border-radius: ${width}px;
            ${glow ? `box-shadow: 0 0 10px ${color};` : ''}
            transform-origin: left center;
        `;

        document.body.appendChild(beam);

        const deltaX = (toRect.left + toRect.width/2) - (fromRect.left + fromRect.width/2);
        const deltaY = (toRect.top + toRect.height/2) - (fromRect.top + fromRect.height/2);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const angle = Math.atan2(deltaY, deltaX);

        beam.style.transform = `rotate(${angle}rad)`;
        
        // Animate the beam
        beam.animate([
            { width: '0px' },
            { width: `${distance}px` }
        ], {
            duration: duration,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        });

        setTimeout(() => {
            if (beam.parentNode) beam.remove();
        }, duration + 500);

        return beam;
    }

    // Orbiting Circles Component
    createOrbitingCircles(container, options = {}) {
        const {
            count = 5,
            radius = 100,
            duration = 10000,
            colors = ['#357494', '#3F86A4', '#fbbf24', '#10b981', '#f59e0b']
        } = options;

        const orbits = document.createElement('div');
        orbits.className = 'absolute inset-0 pointer-events-none';
        orbits.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        for (let i = 0; i < count; i++) {
            const orbit = document.createElement('div');
            orbit.className = 'absolute';
            orbit.style.cssText = `
                width: ${radius * 2}px;
                height: ${radius * 2}px;
                border-radius: 50%;
                border: 1px solid ${colors[i % colors.length]}20;
            `;

            const circle = document.createElement('div');
            circle.className = 'absolute';
            circle.style.cssText = `
                width: 8px;
                height: 8px;
                background: ${colors[i % colors.length]};
                border-radius: 50%;
                top: -4px;
                left: 50%;
                transform: translateX(-50%);
                animation: orbit-${i} ${duration + i * 1000}ms linear infinite;
                box-shadow: 0 0 10px ${colors[i % colors.length]}50;
            `;

            // Add keyframes for orbit animation
            const keyframes = `
                @keyframes orbit-${i} {
                    from { transform: translateX(-50%) rotate(${i * 72}deg) translateX(${radius}px) rotate(-${i * 72}deg); }
                    to { transform: translateX(-50%) rotate(${360 + i * 72}deg) translateX(${radius}px) rotate(-${360 + i * 72}deg); }
                }
            `;
            
            if (!document.getElementById(`orbit-style-${i}`)) {
                const style = document.createElement('style');
                style.id = `orbit-style-${i}`;
                style.textContent = keyframes;
                document.head.appendChild(style);
            }

            orbit.appendChild(circle);
            orbits.appendChild(orbit);
        }

        container.appendChild(orbits);
        return orbits;
    }

    // Ripple Effect Component
    createRipple(element, options = {}) {
        const {
            color = '#357494',
            scale = 1,
            duration = 600
        } = options;

        element.addEventListener('click', (e) => {
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: ${color}30;
                pointer-events: none;
                transform: scale(0);
                z-index: 1000;
            `;

            element.style.position = 'relative';
            element.style.overflow = 'hidden';
            element.appendChild(ripple);

            ripple.animate([
                { transform: 'scale(0)', opacity: 1 },
                { transform: `scale(${scale * 4})`, opacity: 0 }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
            });

            setTimeout(() => ripple.remove(), duration);
        });
    }

    // Border Beam Component
    createBorderBeam(element, options = {}) {
        const {
            color = '#357494',
            duration = 3000,
            width = 2
        } = options;

        const beam = document.createElement('div');
        beam.className = 'absolute inset-0 pointer-events-none';
        beam.style.cssText = `
            border-radius: inherit;
            padding: ${width}px;
            background: linear-gradient(90deg, transparent, ${color}, transparent);
            background-size: 200% 200%;
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask-composite: subtract;
            animation: border-beam ${duration}ms linear infinite;
        `;

        // Add keyframes for border beam animation
        if (!document.getElementById('border-beam-style')) {
            const style = document.createElement('style');
            style.id = 'border-beam-style';
            style.textContent = `
                @keyframes border-beam {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
            `;
            document.head.appendChild(style);
        }

        element.style.position = 'relative';
        element.appendChild(beam);
        return beam;
    }

    // Particles Component
    createParticles(container, options = {}) {
        const {
            count = 100,
            colors = ['#357494', '#3F86A4', '#fbbf24'],
            speed = 1,
            size = { min: 1, max: 4 }
        } = options;

        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            const particleSize = Math.random() * (size.max - size.min) + size.min;
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.cssText = `
                position: absolute;
                width: ${particleSize}px;
                height: ${particleSize}px;
                background: ${color};
                border-radius: 50%;
                pointer-events: none;
                opacity: ${Math.random() * 0.8 + 0.2};
                left: ${Math.random() * 100}%;
                top: 100%;
                animation: particle-float-${i} ${Math.random() * 20 + 10}s linear infinite;
            `;

            // Add keyframes for particle animation
            const keyframes = `
                @keyframes particle-float-${i} {
                    0% {
                        transform: translateY(0) translateX(${Math.random() * 40 - 20}px);
                        opacity: 0;
                    }
                    10% {
                        opacity: 1;
                    }
                    90% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-100vh) translateX(${Math.random() * 40 - 20}px);
                        opacity: 0;
                    }
                }
            `;
            
            if (!document.getElementById(`particle-style-${i}`)) {
                const style = document.createElement('style');
                style.id = `particle-style-${i}`;
                style.textContent = keyframes;
                document.head.appendChild(style);
            }

            container.appendChild(particle);
            particles.push(particle);
        }

        return particles;
    }

    // Magic Card Component
    createMagicCard(element, options = {}) {
        const {
            gradientColor = '#357494',
            glowIntensity = 0.5,
            hoverScale = 1.05
        } = options;

        element.style.cssText += `
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        `;

        const shine = document.createElement('div');
        shine.style.cssText = `
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, ${gradientColor}${Math.floor(glowIntensity * 255).toString(16)}, transparent);
            transform: rotate(-45deg) translate(-100%, -100%);
            transition: transform 0.6s ease;
            pointer-events: none;
        `;

        element.appendChild(shine);

        element.addEventListener('mouseenter', () => {
            element.style.transform = `scale(${hoverScale})`;
            element.style.boxShadow = `0 20px 40px ${gradientColor}20`;
            shine.style.transform = 'rotate(-45deg) translate(50%, 50%)';
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'scale(1)';
            element.style.boxShadow = 'none';
            shine.style.transform = 'rotate(-45deg) translate(-100%, -100%)';
        });

        return element;
    }

    // Animated Notifications
    createNotification(message, options = {}) {
        const {
            type = 'success',
            duration = 3000,
            position = 'top-right'
        } = options;

        const colors = {
            success: { bg: '#10b981', text: 'white' },
            warning: { bg: '#f59e0b', text: 'white' },
            error: { bg: '#ef4444', text: 'white' },
            info: { bg: '#357494', text: 'white' }
        };

        const notification = document.createElement('div');
        notification.className = `fixed z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ease-out`;
        notification.style.cssText = `
            background: ${colors[type].bg};
            color: ${colors[type].text};
            ${position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
            ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
            transform: translateX(${position.includes('right') ? '100%' : '-100%'});
            max-width: 400px;
            font-weight: 500;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Animate out after duration
        setTimeout(() => {
            notification.style.transform = `translateX(${position.includes('right') ? '100%' : '-100%'})`;
            setTimeout(() => notification.remove(), 300);
        }, duration);

        return notification;
    }

    // Confetti Effect
    createConfetti(options = {}) {
        const {
            count = 50,
            colors = ['#357494', '#3F86A4', '#fbbf24', '#10b981', '#f59e0b'],
            duration = 3000
        } = options;

        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            
            confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}vw;
                top: -10px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                z-index: 1000;
                pointer-events: none;
                animation: confetti-fall-${i} ${duration}ms ease-out forwards;
            `;

            // Random shapes
            if (Math.random() > 0.5) {
                confetti.style.borderRadius = '50%';
            } else {
                confetti.style.transform = 'rotate(45deg)';
            }

            // Add keyframes for confetti animation
            const keyframes = `
                @keyframes confetti-fall-${i} {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotate(${Math.random() * 720}deg);
                        opacity: 0;
                    }
                }
            `;
            
            if (!document.getElementById(`confetti-style-${i}`)) {
                const style = document.createElement('style');
                style.id = `confetti-style-${i}`;
                style.textContent = keyframes;
                document.head.appendChild(style);
            }

            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), duration);
        }
    }

    // Blur Fade Component
    createBlurFade(elements, options = {}) {
        const {
            delay = 0,
            duration = 600,
            blur = 10,
            offset = 20
        } = options;

        elements.forEach((element, index) => {
            element.style.cssText += `
                opacity: 0;
                filter: blur(${blur}px);
                transform: translateY(${offset}px);
                transition: all ${duration}ms ease-out;
                transition-delay: ${delay + index * 100}ms;
            `;

            // Use Intersection Observer for scroll-triggered animations
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.filter = 'blur(0px)';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });

            observer.observe(element);
        });
    }
}

// Export for global use
window.MagicComponents = MagicComponents;
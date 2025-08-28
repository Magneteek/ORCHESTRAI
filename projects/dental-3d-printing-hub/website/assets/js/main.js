/*
=============================================
DENTAL 3D PRINTING HUB - MAIN.JS
=============================================
Interactive Functionality & User Experience
Mobile Navigation, ROI Calculator, Smooth Scrolling
ORCHESTRAI Web Development Agent
=============================================
*/

'use strict';

// ===== GLOBAL VARIABLES =====
let isScrolling = false;
let ticking = false;
let activeTab = 'surgical';

// ===== DOCUMENT READY =====
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
});

// ===== MAIN INITIALIZATION =====
function initializeWebsite() {
    console.log('🚀 Dental 3D Printing Hub - Initializing...');
    
    // Initialize all modules
    initializeNavigation();
    initializeScrollEffects();
    initializeROICalculator();
    initializeApplicationTabs();
    initializeAnimations();
    initializeFormHandling();
    initializePerformanceOptimizations();
    
    console.log('✅ Website initialization complete');
}

// ===== NAVIGATION HANDLING =====
function initializeNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const header = document.querySelector('.site-header');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            toggleMobileMenu();
        });
    }

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                closeMobileMenu();
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle?.contains(e.target) && !navMenu?.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Header background on scroll
    window.addEventListener('scroll', throttle(function() {
        if (window.scrollY > 100) {
            header?.classList.add('scrolled');
        } else {
            header?.classList.remove('scrolled');
        }
    }, 100));

    // Smooth scrolling for anchor links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                smoothScrollTo(href);
            }
        });
    });
}

function toggleMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    
    // Prevent body scroll when menu is open
    if (navMenu?.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

function closeMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle?.classList.remove('active');
    navMenu?.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== SMOOTH SCROLLING =====
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
        const targetPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// ===== SCROLL EFFECTS =====
function initializeScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                
                // Add staggered animation for grid items
                if (entry.target.classList.contains('features-grid') || 
                    entry.target.classList.contains('guides-grid') ||
                    entry.target.classList.contains('testimonials-grid')) {
                    animateGridItems(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe sections for animation
    const sections = document.querySelectorAll('.features, .guides, .testimonials, .roi-calculator, .applications');
    sections.forEach(section => observer.observe(section));

    // Observe cards for individual animation
    const cards = document.querySelectorAll('.feature-card, .guide-card, .testimonial-card');
    cards.forEach(card => observer.observe(card));
}

function animateGridItems(grid) {
    const items = grid.querySelectorAll('.feature-card, .guide-card, .testimonial-card');
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('animate-fade-in-up');
        }, index * 100);
    });
}

// ===== ROI CALCULATOR =====
function initializeROICalculator() {
    const calculateButton = document.querySelector('.calculator-form button');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateROI);
    }

    // Auto-calculate on input change
    const inputs = document.querySelectorAll('.calculator-form input');
    inputs.forEach(input => {
        input.addEventListener('input', debounce(calculateROI, 500));
    });
}

function calculateROI() {
    const monthlyLabCosts = parseFloat(document.getElementById('monthly-lab-costs')?.value) || 0;
    const monthlyCases = parseFloat(document.getElementById('monthly-cases')?.value) || 0;
    const equipmentBudget = parseFloat(document.getElementById('equipment-budget')?.value) || 0;

    if (monthlyLabCosts === 0 || monthlyCases === 0 || equipmentBudget === 0) {
        hideROIResults();
        return;
    }

    // ROI Calculation Logic
    const costPerCase = monthlyLabCosts / monthlyCases;
    const materialCostPerCase = 25; // Average material cost for 3D printing
    const savingsPerCase = Math.max(0, costPerCase - materialCostPerCase);
    const monthlySavings = savingsPerCase * monthlyCases;
    const annualSavings = monthlySavings * 12;
    const totalImplementationCost = equipmentBudget * 1.5; // Include setup, training, etc.
    const breakEvenMonths = totalImplementationCost / monthlySavings;

    // Display results
    displayROIResults(monthlySavings, annualSavings, breakEvenMonths);
    
    // Analytics tracking
    trackROICalculation(monthlyLabCosts, monthlyCases, equipmentBudget, annualSavings);
}

function displayROIResults(monthly, annual, breakeven) {
    const resultsDiv = document.getElementById('roi-results');
    const monthlySavingsEl = document.getElementById('monthly-savings');
    const annualSavingsEl = document.getElementById('annual-savings');
    const breakevenEl = document.getElementById('breakeven');

    if (resultsDiv && monthlySavingsEl && annualSavingsEl && breakevenEl) {
        monthlySavingsEl.textContent = formatCurrency(monthly);
        annualSavingsEl.textContent = formatCurrency(annual);
        breakevenEl.textContent = `${Math.ceil(breakeven)} months`;

        resultsDiv.style.display = 'block';
        
        // Animate results appearance
        resultsDiv.style.opacity = '0';
        resultsDiv.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            resultsDiv.style.transition = 'all 0.5s ease';
            resultsDiv.style.opacity = '1';
            resultsDiv.style.transform = 'translateY(0)';
        }, 100);
    }
}

function hideROIResults() {
    const resultsDiv = document.getElementById('roi-results');
    if (resultsDiv) {
        resultsDiv.style.display = 'none';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

// ===== APPLICATION TABS =====
function initializeApplicationTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(targetTab) {
    if (activeTab === targetTab) return;

    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Update button states
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === targetTab) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });

    // Update pane visibility with animation
    tabPanes.forEach(pane => {
        if (pane.id === targetTab) {
            pane.style.display = 'block';
            pane.style.opacity = '0';
            pane.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                pane.style.transition = 'all 0.4s ease';
                pane.style.opacity = '1';
                pane.style.transform = 'translateX(0)';
            }, 50);
            
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
            setTimeout(() => {
                if (!pane.classList.contains('active')) {
                    pane.style.display = 'none';
                }
            }, 400);
        }
    });

    activeTab = targetTab;

    // Track tab switching
    trackTabSwitch(targetTab);
}

// ===== ANIMATIONS =====
function initializeAnimations() {
    // Counter animations for statistics
    animateCounters();
    
    // Parallax effect for hero section
    initializeParallax();
    
    // Floating elements animation
    initializeFloatingElements();
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const text = element.textContent;
    const number = parseFloat(text.replace(/[^0-9.-]/g, ''));
    const suffix = text.replace(/[0-9.-]/g, '');
    
    if (isNaN(number)) return;

    let current = 0;
    const increment = number / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= number) {
            current = number;
            clearInterval(timer);
        }
        
        if (number % 1 === 0) {
            element.textContent = Math.floor(current) + suffix;
        } else {
            element.textContent = current.toFixed(1) + suffix;
        }
    }, 40);
}

function initializeParallax() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;

    window.addEventListener('scroll', throttle(function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = heroSection.querySelectorAll('.hero-image, .floating-elements');
        
        parallaxElements.forEach(el => {
            const speed = el.dataset.speed || 0.5;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }, 16));
}

function initializeFloatingElements() {
    const floatingElements = document.querySelectorAll('.float-item');
    
    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
        element.style.animationDuration = `${3 + Math.random() * 2}s`;
    });
}

// ===== FORM HANDLING =====
function initializeFormHandling() {
    // Newsletter subscription
    const newsletterForm = document.querySelector('.email-signup');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }

    // Contact forms
    const contactForms = document.querySelectorAll('form[data-form="contact"]');
    contactForms.forEach(form => {
        form.addEventListener('submit', handleContactFormSubmission);
    });
}

function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    // Update button state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Subscribing...';
    submitButton.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showNotification('Thank you for subscribing! Check your email for confirmation.', 'success');
        e.target.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Track subscription
        trackNewsletterSubscription(email);
    }, 2000);
}

function handleContactFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    // Basic validation
    if (!validateContactForm(formData)) {
        return;
    }

    // Update button state
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    // Simulate API call
    setTimeout(() => {
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        e.target.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Track form submission
        trackContactFormSubmission(formData);
    }, 2000);
}

// ===== VALIDATION =====
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateContactForm(formData) {
    const required = ['name', 'email', 'message'];
    
    for (let field of required) {
        if (!formData.get(field) || formData.get(field).trim() === '') {
            showNotification(`Please fill in the ${field} field`, 'error');
            return false;
        }
    }
    
    if (!validateEmail(formData.get('email'))) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    return true;
}

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '9999',
        maxWidth: '400px',
        opacity: '0',
        transform: 'translateX(100%)',
        transition: 'all 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });
    
    // Auto close
    setTimeout(() => {
        if (document.body.contains(notification)) {
            closeNotification(notification);
        }
    }, 5000);
}

function closeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 300);
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#0ea5e9'
    };
    return colors[type] || colors.info;
}

// ===== PERFORMANCE OPTIMIZATIONS =====
function initializePerformanceOptimizations() {
    // Lazy loading for images
    initializeLazyLoading();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Service worker registration
    registerServiceWorker();
}

function initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

function preloadCriticalResources() {
    const criticalResources = [
        'assets/css/styles.css',
        'assets/images/hero-image.jpg'
    ];

    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = resource.endsWith('.css') ? 'style' : 'image';
        document.head.appendChild(link);
    });
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function(registration) {
                    console.log('SW registered: ', registration);
                })
                .catch(function(registrationError) {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
}

// ===== ANALYTICS TRACKING =====
function trackROICalculation(labCosts, cases, budget, savings) {
    // Track ROI calculator usage
    if (typeof gtag === 'function') {
        gtag('event', 'roi_calculation', {
            'event_category': 'Tools',
            'event_label': 'ROI Calculator',
            'value': savings
        });
    }
    
    console.log('ROI Calculation:', {
        labCosts,
        cases,
        budget,
        savings
    });
}

function trackTabSwitch(tabName) {
    if (typeof gtag === 'function') {
        gtag('event', 'tab_switch', {
            'event_category': 'Engagement',
            'event_label': tabName
        });
    }
}

function trackNewsletterSubscription(email) {
    if (typeof gtag === 'function') {
        gtag('event', 'newsletter_subscription', {
            'event_category': 'Conversion',
            'event_label': 'Newsletter'
        });
    }
}

function trackContactFormSubmission(formData) {
    if (typeof gtag === 'function') {
        gtag('event', 'contact_form_submission', {
            'event_category': 'Conversion',
            'event_label': 'Contact Form'
        });
    }
}

// ===== UTILITY FUNCTIONS =====
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== PROGRESSIVE ENHANCEMENT =====
function checkFeatureSupport() {
    const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        webp: checkWebPSupport(),
        modernJS: typeof Promise !== 'undefined'
    };
    
    console.log('Feature Support:', features);
    return features;
}

function checkWebPSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    
    // Track errors if analytics is available
    if (typeof gtag === 'function') {
        gtag('event', 'exception', {
            'description': e.error?.message || 'Unknown error',
            'fatal': false
        });
    }
});

// ===== RESIZE HANDLER =====
window.addEventListener('resize', throttle(function() {
    // Close mobile menu on resize
    if (window.innerWidth >= 768) {
        closeMobileMenu();
    }
    
    // Recalculate any layout-dependent features
    initializeFloatingElements();
}, 250));

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
    
    // Tab navigation improvements
    if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('using-keyboard');
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
function initializeAccessibility() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 100000;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Add main content landmark if not present
    if (!document.getElementById('main-content')) {
        const main = document.querySelector('main') || document.querySelector('.hero');
        if (main) {
            main.id = 'main-content';
        }
    }
}

// Initialize accessibility enhancements
document.addEventListener('DOMContentLoaded', initializeAccessibility);

// ===== POLYFILLS =====
// IntersectionObserver polyfill for older browsers
if (!('IntersectionObserver' in window)) {
    console.log('IntersectionObserver not supported, loading polyfill...');
    const script = document.createElement('script');
    script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
    document.head.appendChild(script);
}

console.log('🎯 Dental 3D Printing Hub JavaScript loaded successfully');

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateROI,
        validateEmail,
        formatCurrency,
        switchTab
    };
}
/**
 * Additional Compliance Agents
 *
 * This file contains three specialized compliance agents:
 * 1. AccessibilityAgent - WCAG compliance monitoring
 * 2. SecurityAgent - Security vulnerability scanning
 * 3. PerformanceAgent - Performance optimization monitoring
 */

const BaseComplianceAgent = require('./base-compliance-agent');

/**
 * Accessibility Compliance Agent
 * Monitors WCAG 2.1 AA compliance during development
 */
class AccessibilityAgent extends BaseComplianceAgent {
  constructor(config = {}) {
    super({
      agentType: 'accessibility-monitor',
      ...config
    });

    this.wcagLevel = config.wcagLevel || 'AA'; // A, AA, or AAA
  }

  async runValidationChecks(html, context) {
    const issues = [];

    // 1. Images without alt text
    const imgNoAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi) || [];
    imgNoAlt.forEach((match, i) => {
      issues.push({
        passed: false,
        severity: 'high',
        category: 'accessibility',
        message: 'Image missing alt attribute',
        location: { element: `img-${i}` },
        suggestion: 'Add descriptive alt text',
        autoFixable: true
      });
    });

    // 2. Links without descriptive text
    const vagueLinkText = html.match(/<a[^>]*>(?:click here|read more|here)<\/a>/gi) || [];
    vagueLinkText.forEach((match, i) => {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'accessibility',
        message: 'Link with non-descriptive text',
        location: { element: `link-${i}` },
        suggestion: 'Use descriptive link text',
        autoFixable: false
      });
    });

    // 3. Form inputs without labels
    const inputsWithoutLabels = html.match(/<input(?![^>]*id=)[^>]*>/gi) || [];
    inputsWithoutLabels.forEach((match, i) => {
      issues.push({
        passed: false,
        severity: 'high',
        category: 'accessibility',
        message: 'Form input missing associated label',
        location: { element: `input-${i}` },
        suggestion: 'Add label element or aria-label',
        autoFixable: false
      });
    });

    // 4. Missing heading hierarchy
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0 && html.length > 500) {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'accessibility',
        message: 'Missing main heading (h1)',
        suggestion: 'Add h1 element for document structure',
        autoFixable: false
      });
    }
    if (h1Count > 1) {
      issues.push({
        passed: false,
        severity: 'low',
        category: 'accessibility',
        message: 'Multiple h1 elements detected',
        suggestion: 'Use only one h1 per page',
        autoFixable: false
      });
    }

    // 5. Color contrast (basic check for inline styles)
    const lowContrastPatterns = [
      /color:\s*#ccc|color:\s*#ddd|color:\s*lightgray/gi,
      /background:\s*#fff.*color:\s*#eee/gi
    ];
    lowContrastPatterns.forEach(pattern => {
      if (pattern.test(html)) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'accessibility',
          message: 'Potential color contrast issue',
          suggestion: 'Ensure 4.5:1 contrast ratio for text',
          autoFixable: false
        });
      }
    });

    // 6. Missing language attribute
    if (!/<html[^>]*lang=/i.test(html) && html.includes('<html')) {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'accessibility',
        message: 'Missing lang attribute on html element',
        suggestion: 'Add lang="en" or appropriate language code',
        autoFixable: true
      });
    }

    return issues;
  }

  async performValidation(stream) {
    if (!stream || !stream.output) {
      return { passed: true, score: 100, message: 'No HTML output to validate' };
    }
    return await this.validateContent(stream.output, { streamId: stream.id });
  }
}

/**
 * Security Compliance Agent
 * Monitors security vulnerabilities during development
 */
class SecurityAgent extends BaseComplianceAgent {
  constructor(config = {}) {
    super({
      agentType: 'security-monitor',
      ...config
    });

    this.vulnerabilityPatterns = this.initializeVulnerabilityPatterns();
  }

  initializeVulnerabilityPatterns() {
    return [
      // Critical vulnerabilities
      { pattern: /(password|apikey|secret|token|api_key)\s*=\s*['"][^'"]{8,}['"]/gi, severity: 'critical', message: 'Hardcoded credentials detected', category: 'secrets' },
      { pattern: /eval\s*\(/gi, severity: 'critical', message: 'Unsafe eval() usage', category: 'code-injection' },
      { pattern: /dangerouslySetInnerHTML/gi, severity: 'high', message: 'Potential XSS via dangerouslySetInnerHTML', category: 'xss' },
      { pattern: /innerHTML\s*=/gi, severity: 'high', message: 'Potential XSS via innerHTML', category: 'xss' },

      // SQL injection patterns
      { pattern: /execute.*\+.*['"`]/gi, severity: 'critical', message: 'Potential SQL injection', category: 'sql-injection' },
      { pattern: /query.*\$\{.*\}/gi, severity: 'high', message: 'Unsanitized query parameter', category: 'sql-injection' },

      // Authentication issues
      { pattern: /jwt\.sign\([^,]+,\s*['"][^'"]{1,10}['"]/gi, severity: 'critical', message: 'Weak JWT secret', category: 'authentication' },
      { pattern: /crypto\.createHash\(['"]md5['"]\)/gi, severity: 'high', message: 'MD5 is cryptographically broken', category: 'cryptography' },

      // HTTPS issues
      { pattern: /http:\/\/[^\/\s]+api/gi, severity: 'medium', message: 'HTTP API endpoint (should use HTTPS)', category: 'transport-security' },

      // Insecure dependencies
      { pattern: /"react":\s*"[^"]*(\^|~)/gi, severity: 'low', message: 'Unpinned dependency version', category: 'dependencies' }
    ];
  }

  async runValidationChecks(code, context) {
    const issues = [];

    for (const vuln of this.vulnerabilityPatterns) {
      const matches = [...code.matchAll(vuln.pattern)];

      matches.forEach(match => {
        // Filter false positives
        const context = code.substring(Math.max(0, match.index - 100), match.index + 100);

        // Skip if in comments
        if (/\/\/|\/\*|\*\//.test(context.substring(0, 50))) {
          return;
        }

        issues.push({
          passed: false,
          severity: vuln.severity,
          category: vuln.category,
          message: vuln.message,
          location: { position: match.index },
          suggestion: this.getSecuritySuggestion(vuln.category),
          autoFixable: false
        });
      });
    }

    // Check for missing security headers (in server code)
    if (/express|fastify|koa/.test(code)) {
      const hasHelmet = /helmet\(\)/.test(code);
      const hasCORS = /cors\(\)/.test(code);
      const hasCSRF = /csrf/.test(code);

      if (!hasHelmet) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'security-headers',
          message: 'Missing security headers middleware (helmet)',
          suggestion: 'Add helmet() middleware for security headers',
          autoFixable: false
        });
      }

      if (!hasCORS) {
        issues.push({
          passed: false,
          severity: 'low',
          category: 'cors',
          message: 'CORS not configured',
          suggestion: 'Add CORS middleware with appropriate settings',
          autoFixable: false
        });
      }
    }

    return issues;
  }

  getSecuritySuggestion(category) {
    const suggestions = {
      'secrets': 'Use environment variables (.env) for sensitive data',
      'code-injection': 'Use safer alternatives, avoid eval()',
      'xss': 'Sanitize user input, use textContent or escape HTML',
      'sql-injection': 'Use parameterized queries or ORM',
      'authentication': 'Use strong secrets (32+ characters)',
      'cryptography': 'Use SHA-256 or stronger algorithms',
      'transport-security': 'Always use HTTPS for sensitive data',
      'dependencies': 'Pin dependency versions for security'
    };

    return suggestions[category] || 'Review and fix security issue';
  }

  async performValidation(stream) {
    if (!stream || !stream.output) {
      return { passed: true, score: 100, message: 'No code output to validate' };
    }
    return await this.validateContent(stream.output, { streamId: stream.id });
  }
}

/**
 * Performance Monitoring Agent
 * Monitors performance issues during development
 */
class PerformanceAgent extends BaseComplianceAgent {
  constructor(config = {}) {
    super({
      agentType: 'performance-monitor',
      ...config
    });

    this.performanceThresholds = config.performanceThresholds || {
      maxBundleSize: 500, // KB
      maxImageSize: 200,  // KB
      maxFunctionComplexity: 10,
      maxRenderDepth: 5
    };
  }

  async runValidationChecks(code, context) {
    const issues = [];

    // 1. Large bundle imports
    const heavyImports = [
      { pattern: /import.*from ['"]moment['"]/gi, message: 'moment.js is heavy (use date-fns or dayjs)', size: 70 },
      { pattern: /import.*from ['"]lodash['"]/gi, message: 'Full lodash import (use lodash-es or specific imports)', size: 50 },
      { pattern: /import.*from ['"]rxjs['"]/gi, message: 'Full RxJS import (import specific operators)', size: 100 }
    ];

    heavyImports.forEach(heavy => {
      if (heavy.pattern.test(code)) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'bundle-size',
          message: heavy.message,
          suggestion: 'Use lighter alternatives or tree-shaking',
          autoFixable: false
        });
      }
    });

    // 2. Inefficient React patterns
    if (/react/i.test(code)) {
      // Missing React.memo for expensive components
      const largeComponents = code.match(/function\s+\w+Component[^{]*{[\s\S]{200,}}/g) || [];
      largeComponents.forEach((component, i) => {
        if (!/React\.memo|memo\(/.test(component)) {
          issues.push({
            passed: false,
            severity: 'low',
            category: 'react-performance',
            message: `Large component without React.memo (component ${i + 1})`,
            suggestion: 'Wrap expensive components with React.memo',
            autoFixable: true
          });
        }
      });

      // Inline function definitions in JSX
      const inlineFunctions = code.match(/onClick=\{[^}]*=>/g) || [];
      if (inlineFunctions.length > 3) {
        issues.push({
          passed: false,
          severity: 'low',
          category: 'react-performance',
          message: `${inlineFunctions.length} inline functions in JSX`,
          suggestion: 'Extract functions outside render or use useCallback',
          autoFixable: false
        });
      }

      // Missing dependency arrays in useEffect
      const effectsWithoutDeps = code.match(/useEffect\([^,]+\)(?!\s*,)/g) || [];
      if (effectsWithoutDeps.length > 0) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'react-performance',
          message: 'useEffect without dependency array',
          suggestion: 'Add dependency array to prevent unnecessary re-runs',
          autoFixable: false
        });
      }
    }

    // 3. Inefficient loops and operations
    const nestedLoops = code.match(/for\s*\([^)]+\)\s*{[^}]*for\s*\([^)]+\)/g) || [];
    if (nestedLoops.length > 0) {
      issues.push({
        passed: false,
        severity: 'medium',
        category: 'algorithmic-performance',
        message: 'Nested loops detected (O(n²) complexity)',
        suggestion: 'Consider using Maps, Sets, or optimizing algorithm',
        autoFixable: false
      });
    }

    // 4. Synchronous blocking operations
    const blockingOps = [
      { pattern: /fs\.readFileSync/g, message: 'Synchronous file read blocks event loop' },
      { pattern: /\.forEach\(async/g, message: 'async forEach doesn\'t wait (use for...of or Promise.all)' },
      { pattern: /JSON\.parse\([^)]{100,}\)/g, message: 'Large JSON.parse may block thread' }
    ];

    blockingOps.forEach(op => {
      if (op.pattern.test(code)) {
        issues.push({
          passed: false,
          severity: 'medium',
          category: 'blocking-operations',
          message: op.message,
          suggestion: 'Use async alternatives',
          autoFixable: false
        });
      }
    });

    // 5. Memory leaks
    const potentialLeaks = [
      { pattern: /setInterval\([^}]+\}(?!.*clearInterval)/gs, message: 'setInterval without clearInterval' },
      { pattern: /addEventListener\([^}]+\}(?!.*removeEventListener)/gs, message: 'Event listener not removed' }
    ];

    potentialLeaks.forEach(leak => {
      if (leak.pattern.test(code)) {
        issues.push({
          passed: false,
          severity: 'high',
          category: 'memory-leaks',
          message: leak.message,
          suggestion: 'Clean up in useEffect return or componentWillUnmount',
          autoFixable: false
        });
      }
    });

    return issues;
  }

  async performValidation(stream) {
    if (!stream || !stream.output) {
      return { passed: true, score: 100, message: 'No code output to validate' };
    }
    return await this.validateContent(stream.output, { streamId: stream.id });
  }
}

module.exports = {
  AccessibilityAgent,
  SecurityAgent,
  PerformanceAgent
};

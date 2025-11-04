const EventEmitter = require('events');

class BrowserMCPHandler extends EventEmitter {
  constructor(mcpManager, crystallineMemory) {
    super();
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.mcpClient = null;
    this.isConnected = false;
    this.capabilities = new Set([
      'screenshot-comparison',
      'accessibility-testing', 
      'user-interaction-simulation',
      'performance-measurement',
      'visual-regression-testing',
      'layout-testing',
      'visual-diff-analysis',
      'multi-device-testing',
      'breakpoint-validation',
      'responsive-screenshot-testing',
      'lighthouse-auditing',
      'core-web-vitals-testing',
      'conversion-tracking',
      'funnel-analysis'
    ]);
  }

  async initialize() {
    try {
      console.log('🌐 Initializing Browser MCP Handler...');
      
      this.mcpClient = await this.mcpManager.getServer('browser-mcp');
      if (!this.mcpClient) {
        throw new Error('Browser MCP server not available');
      }

      this.isConnected = true;
      this.emit('connected', { handler: 'browser-mcp', capabilities: Array.from(this.capabilities) });
      
      console.log('✅ Browser MCP Handler initialized with capabilities:', Array.from(this.capabilities));
      return true;
    } catch (error) {
      console.error('❌ Browser MCP Handler initialization failed:', error);
      this.emit('error', { handler: 'browser-mcp', error: error.message });
      return false;
    }
  }

  async takeScreenshot(url, options = {}) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const defaultOptions = {
        width: 1920,
        height: 1080,
        deviceType: 'desktop',
        fullPage: true,
        waitForNetwork: true,
        ...options
      };

      const result = await this.mcpClient.callTool('screenshot', {
        url,
        options: defaultOptions
      });

      await this.crystallineMemory.store('visual-regression-history', {
        type: 'screenshot',
        url,
        timestamp: Date.now(),
        options: defaultOptions,
        result: result.metadata
      });

      return result;
    } catch (error) {
      console.error('Browser MCP screenshot failed:', error);
      throw error;
    }
  }

  async compareScreenshots(baseline, current, tolerance = 0.1) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const comparison = await this.mcpClient.callTool('compare-screenshots', {
        baseline,
        current,
        tolerance
      });

      const comparisonResult = {
        pixelDifference: comparison.pixelDifference,
        percentageDifference: comparison.percentageDifference,
        passed: comparison.percentageDifference <= tolerance,
        diffImage: comparison.diffImage,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('visual-regression-history', {
        type: 'comparison',
        result: comparisonResult,
        tolerance,
        timestamp: Date.now()
      });

      return comparisonResult;
    } catch (error) {
      console.error('Screenshot comparison failed:', error);
      throw error;
    }
  }

  async runAccessibilityAudit(url, standards = ['WCAG2AA']) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const audit = await this.mcpClient.callTool('accessibility-audit', {
        url,
        standards,
        includeScreenReader: true,
        checkColorContrast: true,
        validateKeyboardNavigation: true
      });

      const accessibilityResult = {
        score: audit.score,
        violations: audit.violations,
        passes: audit.passes,
        incomplete: audit.incomplete,
        standards,
        timestamp: Date.now(),
        url
      };

      await this.crystallineMemory.store('accessibility-compliance-tracking', {
        type: 'audit',
        result: accessibilityResult,
        timestamp: Date.now()
      });

      return accessibilityResult;
    } catch (error) {
      console.error('Accessibility audit failed:', error);
      throw error;
    }
  }

  async testResponsiveDesign(url, breakpoints = [320, 768, 1024, 1440, 1920]) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const responsiveResults = [];
      
      for (const breakpoint of breakpoints) {
        const screenshot = await this.takeScreenshot(url, {
          width: breakpoint,
          height: breakpoint < 768 ? 1200 : 1080,
          deviceType: breakpoint < 768 ? 'mobile' : breakpoint < 1024 ? 'tablet' : 'desktop'
        });

        const layoutValidation = await this.mcpClient.callTool('validate-layout', {
          url,
          viewport: { width: breakpoint, height: breakpoint < 768 ? 1200 : 1080 },
          checkOverflow: true,
          validateTouchTargets: breakpoint < 768
        });

        responsiveResults.push({
          breakpoint,
          screenshot,
          layoutValidation,
          deviceType: breakpoint < 768 ? 'mobile' : breakpoint < 1024 ? 'tablet' : 'desktop'
        });
      }

      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'responsive-test',
        url,
        results: responsiveResults,
        timestamp: Date.now()
      });

      return {
        url,
        breakpoints: responsiveResults,
        summary: {
          totalBreakpoints: breakpoints.length,
          passedBreakpoints: responsiveResults.filter(r => r.layoutValidation.passed).length,
          overallCompliance: responsiveResults.filter(r => r.layoutValidation.passed).length / breakpoints.length
        }
      };
    } catch (error) {
      console.error('Responsive design test failed:', error);
      throw error;
    }
  }

  async measurePerformance(url, options = {}) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const performanceOptions = {
        includeScreenshot: true,
        throttling: 'mobile3G',
        ...options
      };

      const performance = await this.mcpClient.callTool('lighthouse-audit', {
        url,
        categories: ['performance', 'accessibility', 'best-practices', 'seo'],
        ...performanceOptions
      });

      const coreWebVitals = {
        lcp: performance.audits['largest-contentful-paint']?.numericValue,
        fid: performance.audits['max-potential-fid']?.numericValue,
        cls: performance.audits['cumulative-layout-shift']?.numericValue,
        fcp: performance.audits['first-contentful-paint']?.numericValue,
        ttfb: performance.audits['server-response-time']?.numericValue
      };

      const performanceResult = {
        url,
        overallScore: performance.categories.performance.score * 100,
        coreWebVitals,
        categories: {
          performance: performance.categories.performance.score * 100,
          accessibility: performance.categories.accessibility.score * 100,
          bestPractices: performance.categories['best-practices'].score * 100,
          seo: performance.categories.seo.score * 100
        },
        opportunities: performance.audits,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('performance-benchmarks', {
        type: 'lighthouse-audit',
        result: performanceResult,
        timestamp: Date.now()
      });

      return performanceResult;
    } catch (error) {
      console.error('Performance measurement failed:', error);
      throw error;
    }
  }

  async simulateUserFlow(url, interactions = []) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const flowResult = await this.mcpClient.callTool('simulate-user-flow', {
        url,
        interactions,
        captureScreenshots: true,
        trackConversions: true,
        measureTimings: true
      });

      const userFlowResult = {
        url,
        interactions,
        completionRate: flowResult.completionRate,
        conversionEvents: flowResult.conversions,
        timings: flowResult.timings,
        screenshots: flowResult.screenshots,
        errors: flowResult.errors,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'user-flow-simulation',
        result: userFlowResult,
        timestamp: Date.now()
      });

      return userFlowResult;
    } catch (error) {
      console.error('User flow simulation failed:', error);
      throw error;
    }
  }

  async validateFormFunctionality(url, formSelectors = []) {
    if (!this.isConnected) throw new Error('Browser MCP not connected');
    
    try {
      const formValidation = await this.mcpClient.callTool('validate-forms', {
        url,
        formSelectors,
        testValidation: true,
        testSubmission: true,
        checkAccessibility: true
      });

      const formResult = {
        url,
        forms: formValidation.forms,
        overallFunctionality: formValidation.overallScore,
        accessibilityCompliance: formValidation.accessibilityScore,
        errors: formValidation.errors,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'form-validation',
        result: formResult,
        timestamp: Date.now()
      });

      return formResult;
    } catch (error) {
      console.error('Form validation failed:', error);
      throw error;
    }
  }

  async getCapabilities() {
    return Array.from(this.capabilities);
  }

  async disconnect() {
    if (this.mcpClient) {
      await this.mcpClient.disconnect();
      this.isConnected = false;
      console.log('🔌 Browser MCP Handler disconnected');
    }
  }

  isCapabilitySupported(capability) {
    return this.capabilities.has(capability);
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      handler: 'browser-mcp',
      capabilities: Array.from(this.capabilities)
    };
  }
}

module.exports = BrowserMCPHandler;
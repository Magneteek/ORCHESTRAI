const EventEmitter = require('events');
const BrowserMCPHandler = require('./browser-mcp-handler');
const PlaywrightMCPHandler = require('./playwright-mcp-handler');

class MCPIntegrationManager extends EventEmitter {
  constructor(mcpManager, crystallineMemory) {
    super();
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.handlers = new Map();
    this.isInitialized = false;
    
    this.capabilityMapping = {
      'visual-regression-testing': 'browser-mcp',
      'accessibility-testing': ['browser-mcp', 'playwright-mcp'],
      'performance-measurement': 'browser-mcp', 
      'responsive-design-testing': 'browser-mcp',
      'cross-browser-compatibility': 'playwright-mcp',
      'e2e-automation': 'playwright-mcp',
      'user-journey-validation': 'playwright-mcp',
      'form-functionality-testing': ['browser-mcp', 'playwright-mcp'],
      'conversion-tracking': 'browser-mcp'
    };
  }

  async initialize() {
    try {
      console.log('🎯 Initializing MCP Integration Manager...');
      
      const browserHandler = new BrowserMCPHandler(this.mcpManager, this.crystallineMemory);
      const playwrightHandler = new PlaywrightMCPHandler(this.mcpManager, this.crystallineMemory);
      
      this.handlers.set('browser-mcp', browserHandler);
      this.handlers.set('playwright-mcp', playwrightHandler);
      
      const initResults = await Promise.allSettled([
        browserHandler.initialize(),
        playwrightHandler.initialize()
      ]);
      
      const successfulHandlers = [];
      const failedHandlers = [];
      
      initResults.forEach((result, index) => {
        const handlerName = index === 0 ? 'browser-mcp' : 'playwright-mcp';
        if (result.status === 'fulfilled' && result.value) {
          successfulHandlers.push(handlerName);
        } else {
          failedHandlers.push(handlerName);
          console.warn(`⚠️ ${handlerName} handler failed to initialize:`, result.reason);
        }
      });
      
      if (successfulHandlers.length === 0) {
        throw new Error('No MCP handlers successfully initialized');
      }
      
      this.isInitialized = true;
      console.log('✅ MCP Integration Manager initialized');
      console.log(`🟢 Active handlers: ${successfulHandlers.join(', ')}`);
      if (failedHandlers.length > 0) {
        console.log(`🔴 Failed handlers: ${failedHandlers.join(', ')}`);
      }
      
      this.emit('initialized', {
        successful: successfulHandlers,
        failed: failedHandlers,
        capabilities: await this.getAllCapabilities()
      });
      
      return true;
    } catch (error) {
      console.error('❌ MCP Integration Manager initialization failed:', error);
      this.emit('error', { error: error.message });
      return false;
    }
  }

  async executeCapability(capability, parameters = {}) {
    if (!this.isInitialized) {
      throw new Error('MCP Integration Manager not initialized');
    }
    
    const handlerName = this.getHandlerForCapability(capability);
    if (!handlerName) {
      throw new Error(`Capability '${capability}' not supported`);
    }
    
    const handler = this.handlers.get(handlerName);
    if (!handler || !handler.isConnected) {
      throw new Error(`Handler '${handlerName}' not available for capability '${capability}'`);
    }
    
    try {
      console.log(`🚀 Executing capability: ${capability} via ${handlerName}`);
      
      let result;
      switch (capability) {
        case 'visual-regression-testing':
          result = await this.executeVisualRegressionTest(handler, parameters);
          break;
        case 'accessibility-testing':
          result = await this.executeAccessibilityTest(handler, parameters);
          break;
        case 'performance-measurement':
          result = await this.executePerformanceTest(handler, parameters);
          break;
        case 'responsive-design-testing':
          result = await this.executeResponsiveTest(handler, parameters);
          break;
        case 'cross-browser-compatibility':
          result = await this.executeCrossBrowserTest(handler, parameters);
          break;
        case 'e2e-automation':
          result = await this.executeE2ETest(handler, parameters);
          break;
        case 'user-journey-validation':
          result = await this.executeUserJourneyTest(handler, parameters);
          break;
        case 'form-functionality-testing':
          result = await this.executeFormTest(handler, parameters);
          break;
        case 'conversion-tracking':
          result = await this.executeConversionTracking(handler, parameters);
          break;
        default:
          throw new Error(`Capability '${capability}' execution not implemented`);
      }
      
      await this.crystallineMemory.store('mcp-integration-performance', {
        type: 'capability-execution',
        capability,
        handler: handlerName,
        success: true,
        timestamp: Date.now(),
        parameters: this.sanitizeParameters(parameters)
      });
      
      console.log(`✅ Capability '${capability}' executed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Capability '${capability}' execution failed:`, error);
      
      await this.crystallineMemory.store('mcp-integration-performance', {
        type: 'capability-execution',
        capability,
        handler: handlerName,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        parameters: this.sanitizeParameters(parameters)
      });
      
      throw error;
    }
  }

  async executeVisualRegressionTest(handler, params) {
    const { url, baseline, tolerance = 0.1 } = params;
    
    const screenshot = await handler.takeScreenshot(url);
    if (baseline) {
      return await handler.compareScreenshots(baseline, screenshot.data, tolerance);
    } else {
      return screenshot;
    }
  }

  async executeAccessibilityTest(handler, params) {
    const { url, standards = ['WCAG2AA'] } = params;
    
    if (handler.constructor.name === 'BrowserMCPHandler') {
      return await handler.runAccessibilityAudit(url, standards);
    } else if (handler.constructor.name === 'PlaywrightMCPHandler') {
      return await handler.runAccessibilityTest(url, params.browsers || ['chrome']);
    }
  }

  async executePerformanceTest(handler, params) {
    const { url, options = {} } = params;
    return await handler.measurePerformance(url, options);
  }

  async executeResponsiveTest(handler, params) {
    const { url, breakpoints = [320, 768, 1024, 1440, 1920] } = params;
    return await handler.testResponsiveDesign(url, breakpoints);
  }

  async executeCrossBrowserTest(handler, params) {
    const { url, browsers, testConfig = {} } = params;
    return await handler.runCrossBrowserTest(url, { ...testConfig, browsers });
  }

  async executeE2ETest(handler, params) {
    const { testScenario } = params;
    return await handler.runE2ETest(testScenario);
  }

  async executeUserJourneyTest(handler, params) {
    const { journeyConfig } = params;
    return await handler.validateUserJourney(journeyConfig);
  }

  async executeFormTest(handler, params) {
    const { url, formSelectors, formTests } = params;
    
    if (handler.constructor.name === 'BrowserMCPHandler') {
      return await handler.validateFormFunctionality(url, formSelectors);
    } else if (handler.constructor.name === 'PlaywrightMCPHandler') {
      return await handler.testFormInteractions(url, formTests);
    }
  }

  async executeConversionTracking(handler, params) {
    const { url, interactions = [] } = params;
    return await handler.simulateUserFlow(url, interactions);
  }

  getHandlerForCapability(capability) {
    const mapping = this.capabilityMapping[capability];
    
    if (Array.isArray(mapping)) {
      for (const handlerName of mapping) {
        const handler = this.handlers.get(handlerName);
        if (handler && handler.isConnected) {
          return handlerName;
        }
      }
      return null;
    }
    
    const handler = this.handlers.get(mapping);
    return (handler && handler.isConnected) ? mapping : null;
  }

  async getAllCapabilities() {
    const allCapabilities = {};
    
    for (const [handlerName, handler] of this.handlers) {
      if (handler.isConnected) {
        const capabilities = await handler.getCapabilities();
        allCapabilities[handlerName] = Array.isArray(capabilities) ? capabilities : capabilities.capabilities || [];
      }
    }
    
    return allCapabilities;
  }

  async getHandlerStatus() {
    const status = {};
    
    for (const [handlerName, handler] of this.handlers) {
      status[handlerName] = handler.getConnectionStatus();
    }
    
    return status;
  }

  sanitizeParameters(params) {
    const sanitized = { ...params };
    if (sanitized.credentials) delete sanitized.credentials;
    if (sanitized.apiKey) delete sanitized.apiKey;
    if (sanitized.secrets) delete sanitized.secrets;
    return sanitized;
  }

  async runQualityValidationSuite(url, validationConfig = {}) {
    if (!this.isInitialized) {
      throw new Error('MCP Integration Manager not initialized');
    }
    
    const {
      includeVisualRegression = true,
      includeAccessibility = true,
      includePerformance = true,
      includeResponsive = true,
      includeCrossBrowser = false,
      browsers = ['chrome'],
      breakpoints = [320, 768, 1024, 1440, 1920]
    } = validationConfig;
    
    console.log(`🧪 Running comprehensive quality validation suite for: ${url}`);
    
    const results = {
      url,
      timestamp: Date.now(),
      tests: {}
    };
    
    try {
      if (includeVisualRegression) {
        console.log('📸 Running visual regression test...');
        results.tests.visualRegression = await this.executeCapability('visual-regression-testing', { url });
      }
      
      if (includeAccessibility) {
        console.log('♿ Running accessibility test...');
        results.tests.accessibility = await this.executeCapability('accessibility-testing', { url, browsers });
      }
      
      if (includePerformance) {
        console.log('⚡ Running performance test...');
        results.tests.performance = await this.executeCapability('performance-measurement', { url });
      }
      
      if (includeResponsive) {
        console.log('📱 Running responsive design test...');
        results.tests.responsive = await this.executeCapability('responsive-design-testing', { url, breakpoints });
      }
      
      if (includeCrossBrowser) {
        console.log('🌐 Running cross-browser compatibility test...');
        results.tests.crossBrowser = await this.executeCapability('cross-browser-compatibility', { url, browsers });
      }
      
      results.summary = this.calculateSuiteSummary(results.tests);
      
      await this.crystallineMemory.store('web-quality-scores-central', {
        type: 'quality-validation-suite',
        result: results,
        timestamp: Date.now()
      });
      
      console.log('✅ Quality validation suite completed');
      console.log(`📊 Overall quality score: ${results.summary.overallScore}%`);
      
      return results;
    } catch (error) {
      console.error('❌ Quality validation suite failed:', error);
      results.error = error.message;
      return results;
    }
  }

  calculateSuiteSummary(tests) {
    const summary = {
      totalTests: Object.keys(tests).length,
      passedTests: 0,
      scores: {},
      overallScore: 0
    };
    
    let totalScore = 0;
    let scoreCount = 0;
    
    for (const [testType, result] of Object.entries(tests)) {
      if (result && !result.error) {
        summary.passedTests++;
        
        let score = 0;
        switch (testType) {
          case 'accessibility':
            score = result.score || (result.averageScore ? result.averageScore : 0);
            break;
          case 'performance':
            score = result.overallScore || 0;
            break;
          case 'responsive':
            score = (result.summary?.overallCompliance || 0) * 100;
            break;
          case 'crossBrowser':
            score = (result.compatibilityScore || 0) * 100;
            break;
          case 'visualRegression':
            score = result.passed ? 100 : 0;
            break;
          default:
            score = 0;
        }
        
        summary.scores[testType] = score;
        totalScore += score;
        scoreCount++;
      }
    }
    
    summary.overallScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    return summary;
  }

  async disconnect() {
    for (const [handlerName, handler] of this.handlers) {
      try {
        await handler.disconnect();
        console.log(`🔌 ${handlerName} handler disconnected`);
      } catch (error) {
        console.error(`❌ Failed to disconnect ${handlerName} handler:`, error);
      }
    }
    
    this.handlers.clear();
    this.isInitialized = false;
    console.log('🔌 MCP Integration Manager disconnected');
  }
}

module.exports = MCPIntegrationManager;
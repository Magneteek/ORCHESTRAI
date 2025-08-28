const EventEmitter = require('events');

class PlaywrightMCPHandler extends EventEmitter {
  constructor(mcpManager, crystallineMemory) {
    super();
    this.mcpManager = mcpManager;
    this.crystallineMemory = crystallineMemory;
    this.mcpClient = null;
    this.isConnected = false;
    this.supportedBrowsers = ['chrome', 'firefox', 'safari', 'edge'];
    this.capabilities = new Set([
      'multi-browser-testing',
      'e2e-automation', 
      'cross-browser-compatibility',
      'automated-form-testing',
      'chrome-testing',
      'firefox-testing',
      'safari-testing',
      'edge-testing',
      'user-journey-automation',
      'integration-testing'
    ]);
  }

  async initialize() {
    try {
      console.log('🎭 Initializing Playwright MCP Handler...');
      
      this.mcpClient = await this.mcpManager.getServer('playwright-mcp');
      if (!this.mcpClient) {
        throw new Error('Playwright MCP server not available');
      }

      await this.verifyBrowserAvailability();
      
      this.isConnected = true;
      this.emit('connected', { 
        handler: 'playwright-mcp', 
        capabilities: Array.from(this.capabilities),
        browsers: this.supportedBrowsers 
      });
      
      console.log('✅ Playwright MCP Handler initialized');
      console.log('🌐 Available browsers:', this.supportedBrowsers);
      return true;
    } catch (error) {
      console.error('❌ Playwright MCP Handler initialization failed:', error);
      this.emit('error', { handler: 'playwright-mcp', error: error.message });
      return false;
    }
  }

  async verifyBrowserAvailability() {
    try {
      const browserStatus = await this.mcpClient.callTool('check-browsers', {});
      this.supportedBrowsers = browserStatus.available || ['chrome'];
      console.log('🔍 Browser availability check:', this.supportedBrowsers);
    } catch (error) {
      console.warn('⚠️ Could not verify browser availability, defaulting to Chrome');
      this.supportedBrowsers = ['chrome'];
    }
  }

  async runCrossBrowserTest(url, testConfig = {}) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const defaultConfig = {
        browsers: this.supportedBrowsers,
        viewport: { width: 1920, height: 1080 },
        actions: [],
        captureScreenshots: true,
        timeout: 30000,
        ...testConfig
      };

      const crossBrowserResults = [];

      for (const browser of defaultConfig.browsers) {
        console.log(`🧪 Testing in ${browser}...`);
        
        const browserResult = await this.mcpClient.callTool('run-browser-test', {
          browser,
          url,
          viewport: defaultConfig.viewport,
          actions: defaultConfig.actions,
          captureScreenshots: defaultConfig.captureScreenshots,
          timeout: defaultConfig.timeout
        });

        const browserTestResult = {
          browser,
          url,
          success: browserResult.success,
          errors: browserResult.errors || [],
          warnings: browserResult.warnings || [],
          screenshots: browserResult.screenshots || [],
          performance: browserResult.performance || {},
          timestamp: Date.now()
        };

        crossBrowserResults.push(browserTestResult);
      }

      const overallCompatibility = {
        url,
        totalBrowsers: defaultConfig.browsers.length,
        passedBrowsers: crossBrowserResults.filter(r => r.success).length,
        failedBrowsers: crossBrowserResults.filter(r => !r.success).length,
        compatibilityScore: crossBrowserResults.filter(r => r.success).length / defaultConfig.browsers.length,
        results: crossBrowserResults,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'cross-browser-test',
        result: overallCompatibility,
        timestamp: Date.now()
      });

      return overallCompatibility;
    } catch (error) {
      console.error('Cross-browser test failed:', error);
      throw error;
    }
  }

  async runE2ETest(testScenario) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const {
        name,
        url,
        steps,
        browser = 'chrome',
        viewport = { width: 1920, height: 1080 },
        timeout = 60000
      } = testScenario;

      console.log(`🔄 Running E2E test: ${name} in ${browser}`);

      const e2eResult = await this.mcpClient.callTool('run-e2e-test', {
        name,
        browser,
        url,
        viewport,
        steps,
        timeout,
        captureVideo: true,
        captureScreenshots: true
      });

      const testResult = {
        name,
        browser,
        url,
        success: e2eResult.success,
        duration: e2eResult.duration,
        steps: e2eResult.steps,
        screenshots: e2eResult.screenshots || [],
        video: e2eResult.video || null,
        errors: e2eResult.errors || [],
        performance: e2eResult.performance || {},
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'e2e-test',
        scenario: name,
        result: testResult,
        timestamp: Date.now()
      });

      return testResult;
    } catch (error) {
      console.error(`E2E test '${testScenario.name}' failed:`, error);
      throw error;
    }
  }

  async testFormInteractions(url, formTests = []) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const formTestResults = [];

      for (const formTest of formTests) {
        const {
          formSelector,
          fields,
          submitAction,
          expectedOutcome,
          browser = 'chrome'
        } = formTest;

        console.log(`📝 Testing form: ${formSelector} in ${browser}`);

        const formResult = await this.mcpClient.callTool('test-form', {
          browser,
          url,
          formSelector,
          fields,
          submitAction,
          expectedOutcome,
          captureScreenshots: true
        });

        formTestResults.push({
          formSelector,
          browser,
          success: formResult.success,
          fieldResults: formResult.fieldResults || {},
          submitResult: formResult.submitResult || {},
          screenshots: formResult.screenshots || [],
          errors: formResult.errors || [],
          timestamp: Date.now()
        });
      }

      const overallFormTesting = {
        url,
        totalForms: formTests.length,
        passedForms: formTestResults.filter(r => r.success).length,
        failedForms: formTestResults.filter(r => !r.success).length,
        formFunctionalityScore: formTestResults.filter(r => r.success).length / formTests.length,
        results: formTestResults,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'form-interaction-test',
        result: overallFormTesting,
        timestamp: Date.now()
      });

      return overallFormTesting;
    } catch (error) {
      console.error('Form interaction testing failed:', error);
      throw error;
    }
  }

  async validateUserJourney(journeyConfig) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const {
        name,
        startUrl,
        journey,
        browsers = ['chrome'],
        assertions = [],
        timeout = 120000
      } = journeyConfig;

      const journeyResults = [];

      for (const browser of browsers) {
        console.log(`🗺️ Validating user journey: ${name} in ${browser}`);

        const journeyResult = await this.mcpClient.callTool('validate-user-journey', {
          name,
          browser,
          startUrl,
          journey,
          assertions,
          timeout,
          captureFullJourney: true,
          trackConversions: true
        });

        journeyResults.push({
          browser,
          name,
          success: journeyResult.success,
          completionRate: journeyResult.completionRate,
          conversionEvents: journeyResult.conversions || [],
          journeySteps: journeyResult.steps || [],
          screenshots: journeyResult.screenshots || [],
          errors: journeyResult.errors || [],
          performance: journeyResult.performance || {},
          timestamp: Date.now()
        });
      }

      const overallJourneyValidation = {
        name,
        startUrl,
        totalBrowsers: browsers.length,
        passedBrowsers: journeyResults.filter(r => r.success).length,
        averageCompletionRate: journeyResults.reduce((sum, r) => sum + (r.completionRate || 0), 0) / browsers.length,
        conversionOptimizationScore: journeyResults.reduce((sum, r) => sum + (r.conversionEvents.length || 0), 0) / browsers.length,
        results: journeyResults,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'user-journey-validation',
        journey: name,
        result: overallJourneyValidation,
        timestamp: Date.now()
      });

      return overallJourneyValidation;
    } catch (error) {
      console.error(`User journey validation '${journeyConfig.name}' failed:`, error);
      throw error;
    }
  }

  async testAPIIntegration(url, apiTests = []) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const apiTestResults = [];

      for (const apiTest of apiTests) {
        const {
          name,
          trigger,
          expectedRequests,
          browser = 'chrome'
        } = apiTest;

        console.log(`🔌 Testing API integration: ${name} in ${browser}`);

        const apiResult = await this.mcpClient.callTool('test-api-integration', {
          browser,
          url,
          name,
          trigger,
          expectedRequests,
          interceptNetwork: true,
          validateResponses: true
        });

        apiTestResults.push({
          name,
          browser,
          success: apiResult.success,
          capturedRequests: apiResult.requests || [],
          responseValidation: apiResult.responseValidation || {},
          errors: apiResult.errors || [],
          timestamp: Date.now()
        });
      }

      const overallAPITesting = {
        url,
        totalTests: apiTests.length,
        passedTests: apiTestResults.filter(r => r.success).length,
        integrationReliability: apiTestResults.filter(r => r.success).length / apiTests.length,
        results: apiTestResults,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('user-flow-optimization-insights', {
        type: 'api-integration-test',
        result: overallAPITesting,
        timestamp: Date.now()
      });

      return overallAPITesting;
    } catch (error) {
      console.error('API integration testing failed:', error);
      throw error;
    }
  }

  async runAccessibilityTest(url, browsers = ['chrome']) {
    if (!this.isConnected) throw new Error('Playwright MCP not connected');
    
    try {
      const accessibilityResults = [];

      for (const browser of browsers) {
        console.log(`♿ Running accessibility test in ${browser}`);

        const a11yResult = await this.mcpClient.callTool('test-accessibility', {
          browser,
          url,
          includeAxeCore: true,
          testKeyboardNavigation: true,
          testScreenReader: true,
          captureScreenshots: true
        });

        accessibilityResults.push({
          browser,
          url,
          score: a11yResult.score || 0,
          violations: a11yResult.violations || [],
          passes: a11yResult.passes || [],
          keyboardNavigation: a11yResult.keyboardNavigation || {},
          screenReaderCompatibility: a11yResult.screenReader || {},
          screenshots: a11yResult.screenshots || [],
          timestamp: Date.now()
        });
      }

      const overallAccessibility = {
        url,
        averageScore: accessibilityResults.reduce((sum, r) => sum + r.score, 0) / browsers.length,
        totalViolations: accessibilityResults.reduce((sum, r) => sum + r.violations.length, 0),
        crossBrowserConsistency: this.calculateConsistencyScore(accessibilityResults),
        results: accessibilityResults,
        timestamp: Date.now()
      };

      await this.crystallineMemory.store('accessibility-compliance-tracking', {
        type: 'cross-browser-accessibility',
        result: overallAccessibility,
        timestamp: Date.now()
      });

      return overallAccessibility;
    } catch (error) {
      console.error('Cross-browser accessibility test failed:', error);
      throw error;
    }
  }

  calculateConsistencyScore(results) {
    if (results.length < 2) return 1;
    
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    const variance = results.reduce((sum, r) => sum + Math.pow(r.score - avgScore, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - (standardDeviation / 100));
  }

  async getCapabilities() {
    return {
      capabilities: Array.from(this.capabilities),
      browsers: this.supportedBrowsers,
      connected: this.isConnected
    };
  }

  async disconnect() {
    if (this.mcpClient) {
      await this.mcpClient.disconnect();
      this.isConnected = false;
      console.log('🔌 Playwright MCP Handler disconnected');
    }
  }

  isCapabilitySupported(capability) {
    return this.capabilities.has(capability);
  }

  isBrowserSupported(browser) {
    return this.supportedBrowsers.includes(browser.toLowerCase());
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      handler: 'playwright-mcp',
      capabilities: Array.from(this.capabilities),
      browsers: this.supportedBrowsers
    };
  }
}

module.exports = PlaywrightMCPHandler;
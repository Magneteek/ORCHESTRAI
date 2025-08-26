// MCP Auto-Sync Testing API Endpoints
// RESTful API for managing and monitoring automated testing

const express = require('express');
const cors = require('cors');
const MCPAutoSyncTester = require('../testing/mcp-auto-sync-tester');

class TestingAPI {
  constructor(port = 3002) {
    this.app = express();
    this.port = port;
    this.tester = null;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors({
      origin: ['http://localhost:3000', 'http://localhost:5500'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    
    // Request logging
    this.app.use((req, res, next) => {
      console.log(`🌐 ${req.method} ${req.path} - ${new Date().toISOString()}`);
      next();
    });
  }

  setupRoutes() {
    // Testing system management
    this.app.post('/testing/start', this.startTesting.bind(this));
    this.app.post('/testing/stop', this.stopTesting.bind(this));
    this.app.get('/testing/status', this.getTestingStatus.bind(this));
    this.app.post('/testing/initialize', this.initializeTesting.bind(this));

    // Test execution
    this.app.post('/testing/run/:testType', this.runSpecificTest.bind(this));
    this.app.post('/testing/run-full-suite', this.runFullSuite.bind(this));
    this.app.get('/testing/active-tests', this.getActiveTests.bind(this));

    // Test results and reporting
    this.app.get('/testing/results', this.getTestResults.bind(this));
    this.app.get('/testing/results/:serverName', this.getServerResults.bind(this));
    this.app.get('/testing/report', this.generateReport.bind(this));
    this.app.get('/testing/metrics', this.getMetrics.bind(this));

    // Test configuration
    this.app.get('/testing/config', this.getTestConfig.bind(this));
    this.app.put('/testing/config', this.updateTestConfig.bind(this));

    // Health and debugging
    this.app.get('/testing/health', this.getAPIHealth.bind(this));
    this.app.get('/testing/logs', this.getTestLogs.bind(this));

    // Error handling
    this.app.use(this.errorHandler.bind(this));
  }

  async startTesting(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized. Call /testing/initialize first.'
        });
      }

      if (this.tester.testSchedules.size > 0) {
        return res.status(400).json({
          success: false,
          error: 'Testing system is already running'
        });
      }

      await this.tester.startAutoSync();

      res.json({
        success: true,
        message: 'Auto-sync testing started successfully',
        status: 'running',
        scheduledTests: Array.from(this.tester.testSchedules.keys()),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error starting testing system:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async stopTesting(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      await this.tester.stopAutoSync();

      res.json({
        success: true,
        message: 'Auto-sync testing stopped successfully',
        status: 'stopped',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error stopping testing system:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTestingStatus(req, res) {
    try {
      const status = {
        initialized: this.tester !== null,
        running: this.tester ? this.tester.testSchedules.size > 0 : false,
        activeTests: this.tester ? Array.from(this.tester.activeTests) : [],
        scheduledTests: this.tester ? Array.from(this.tester.testSchedules.keys()) : [],
        metrics: this.tester ? this.tester.testMetrics : null,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        status,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting testing status:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async initializeTesting(req, res) {
    try {
      const { configPath } = req.body;
      
      this.tester = new MCPAutoSyncTester(configPath);
      
      // Set up event listeners
      this.tester.on('testCompleted', (data) => {
        console.log(`✅ Test completed: ${data.testType}`);
      });

      this.tester.on('testError', (data) => {
        console.error(`❌ Test error: ${data.testType} - ${data.error}`);
      });

      await this.tester.initialize();

      res.json({
        success: true,
        message: 'Testing system initialized successfully',
        serverCount: Object.keys(this.tester.config.mcpServers).length,
        enabledServers: Object.values(this.tester.config.mcpServers).filter(s => s.enabled).length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error initializing testing system:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async runSpecificTest(req, res) {
    try {
      const { testType } = req.params;
      
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      if (!this.tester.testSuites[testType]) {
        return res.status(400).json({
          success: false,
          error: `Invalid test type: ${testType}. Available types: ${Object.keys(this.tester.testSuites).join(', ')}`
        });
      }

      // Run the test asynchronously
      this.tester.runTestSuite(testType).catch(console.error);

      res.json({
        success: true,
        message: `${testType} test started`,
        testType,
        status: 'running',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Error running ${req.params.testType} test:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async runFullSuite(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      // Run full test suite asynchronously
      this.tester.runFullTestSuite().catch(console.error);

      res.json({
        success: true,
        message: 'Full test suite started',
        testTypes: Object.keys(this.tester.testSuites),
        status: 'running',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error running full test suite:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getActiveTests(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      res.json({
        success: true,
        activeTests: Array.from(this.tester.activeTests),
        count: this.tester.activeTests.size,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting active tests:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTestResults(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      const results = this.tester.getTestResults();
      
      res.json({
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting test results:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getServerResults(req, res) {
    try {
      const { serverName } = req.params;
      
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      const serverResults = this.tester.testResults.get(serverName);
      
      if (!serverResults) {
        return res.status(404).json({
          success: false,
          error: `Server ${serverName} not found`
        });
      }

      res.json({
        success: true,
        serverName,
        data: serverResults,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`Error getting results for server ${req.params.serverName}:`, error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateReport(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      const report = await this.tester.generateTestReport();
      
      res.json({
        success: true,
        report,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error generating test report:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getMetrics(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      res.json({
        success: true,
        metrics: this.tester.testMetrics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting test metrics:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTestConfig(req, res) {
    try {
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      res.json({
        success: true,
        config: this.tester.testConfig,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting test config:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async updateTestConfig(req, res) {
    try {
      const { config } = req.body;
      
      if (!this.tester) {
        return res.status(400).json({
          success: false,
          error: 'Testing system not initialized'
        });
      }

      // Update configuration
      this.tester.testConfig = { ...this.tester.testConfig, ...config };

      res.json({
        success: true,
        message: 'Test configuration updated successfully',
        config: this.tester.testConfig,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error updating test config:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getAPIHealth(req, res) {
    try {
      const health = {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        testing: {
          initialized: this.tester !== null,
          running: this.tester ? this.tester.testSchedules.size > 0 : false,
          activeTests: this.tester ? this.tester.activeTests.size : 0
        },
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        health,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting API health:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async getTestLogs(req, res) {
    try {
      const { limit = 100, testType, serverName } = req.query;
      
      // This would typically read from log files
      // For now, return a placeholder response
      res.json({
        success: true,
        logs: [
          {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Test log entry example',
            testType: 'health',
            serverName: 'sequential-thinking'
          }
        ],
        limit: parseInt(limit),
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error getting test logs:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  errorHandler(error, req, res, next) {
    console.error('API Error:', error);
    
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Internal server error',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  async start() {
    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.port, (error) => {
        if (error) {
          console.error(`❌ Failed to start Testing API server:`, error);
          reject(error);
        } else {
          console.log(`🧪 Testing API server running on http://localhost:${this.port}`);
          console.log(`📋 Available endpoints:`);
          console.log(`   POST http://localhost:${this.port}/testing/initialize`);
          console.log(`   POST http://localhost:${this.port}/testing/start`);
          console.log(`   GET  http://localhost:${this.port}/testing/status`);
          console.log(`   GET  http://localhost:${this.port}/testing/results`);
          console.log(`   GET  http://localhost:${this.port}/testing/report`);
          resolve(server);
        }
      });
    });
  }
}

module.exports = TestingAPI;
/**
 * Base Compliance Agent
 *
 * Abstract base class for all real-time compliance monitoring agents.
 * Provides common functionality for validation, alerting, and scoring.
 *
 * Compliance agents run embedded within parallel streams to catch issues
 * during creation, not after completion (shift-left quality approach).
 */

const EventEmitter = require('events');

class BaseComplianceAgent extends EventEmitter {
  constructor(config = {}) {
    super();

    this.agentType = config.agentType || 'base-compliance';
    this.agentId = config.agentId || `${this.agentType}-${Date.now()}`;

    // Configuration
    this.config = {
      enableRealTimeAlerts: config.enableRealTimeAlerts !== false,
      enableAutoCorrection: config.enableAutoCorrection || false,
      severityThreshold: config.severityThreshold || 'medium', // low, medium, high, critical
      scanInterval: config.scanInterval || 5000, // 5 seconds
      maxAlerts: config.maxAlerts || 100,
      enableDetailedReports: config.enableDetailedReports !== false,
      ...config
    };

    // State tracking
    this.state = {
      isActive: false,
      scanCount: 0,
      issuesDetected: 0,
      issuesResolved: 0,
      lastScanTime: null,
      currentScanStartTime: null
    };

    // Alert storage
    this.alerts = [];
    this.resolvedAlerts = [];

    // Metrics
    this.metrics = {
      totalScans: 0,
      totalIssues: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      averageScanTime: 0,
      falsePositiveRate: 0,
      autoCorrections: 0
    };

    console.log(`🛡️ ${this.agentType} compliance agent initialized: ${this.agentId}`);
  }

  /**
   * Start monitoring a stream
   * @param {Object} stream - Stream to monitor
   * @param {Object} coordinationChannel - Coordination channel for alerts
   */
  async startMonitoring(stream, coordinationChannel) {
    if (this.state.isActive) {
      console.warn(`⚠️ ${this.agentType} already monitoring, restarting...`);
      await this.stopMonitoring();
    }

    this.stream = stream;
    this.coordinationChannel = coordinationChannel;
    this.state.isActive = true;

    console.log(`🛡️ ${this.agentType} monitoring started for stream: ${stream.id}`);

    this.emit('monitoring-started', {
      agentId: this.agentId,
      streamId: stream.id,
      timestamp: new Date().toISOString()
    });

    // Perform initial validation
    await this.performValidation(stream);

    return {
      agentId: this.agentId,
      agentType: this.agentType,
      status: 'active',
      streamId: stream.id
    };
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    this.state.isActive = false;

    console.log(`🛡️ ${this.agentType} monitoring stopped`);

    this.emit('monitoring-stopped', {
      agentId: this.agentId,
      scanCount: this.state.scanCount,
      issuesDetected: this.state.issuesDetected,
      timestamp: new Date().toISOString()
    });

    return this.generateFinalReport();
  }

  /**
   * Perform validation scan (to be implemented by subclasses)
   * @param {Object} stream - Stream being monitored
   * @returns {Promise<Object>} Validation results
   */
  async performValidation(stream) {
    throw new Error('performValidation() must be implemented by subclass');
  }

  /**
   * Validate specific content/artifact
   * @param {*} content - Content to validate
   * @param {Object} context - Validation context
   * @returns {Promise<Object>} Validation results
   */
  async validateContent(content, context = {}) {
    const scanStartTime = Date.now();
    this.state.currentScanStartTime = scanStartTime;
    this.state.scanCount++;
    this.metrics.totalScans++;

    try {
      // Subclass implements actual validation
      const validationResults = await this.runValidationChecks(content, context);

      // Process results
      const issues = this.processValidationResults(validationResults, context);

      // Update metrics
      this.updateMetrics(issues, scanStartTime);

      // Generate alerts for issues above threshold
      await this.generateAlerts(issues, context);

      // Attempt auto-correction if enabled
      if (this.config.enableAutoCorrection && issues.length > 0) {
        await this.attemptAutoCorrection(content, issues, context);
      }

      const scanDuration = Date.now() - scanStartTime;
      this.state.lastScanTime = Date.now();

      return {
        passed: issues.filter(i => i.severity === 'critical' || i.severity === 'high').length === 0,
        score: this.calculateScore(issues),
        issues,
        scanDuration,
        scannedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error(`❌ ${this.agentType} validation error:`, error);

      return {
        passed: false,
        score: 0,
        error: error.message,
        scanDuration: Date.now() - scanStartTime
      };
    }
  }

  /**
   * Run validation checks (implemented by subclasses)
   * @param {*} content - Content to validate
   * @param {Object} context - Validation context
   * @returns {Promise<Array>} Raw validation results
   */
  async runValidationChecks(content, context) {
    throw new Error('runValidationChecks() must be implemented by subclass');
  }

  /**
   * Process validation results into standardized issues
   * @param {Array} validationResults - Raw validation results
   * @param {Object} context - Validation context
   * @returns {Array} Processed issues
   */
  processValidationResults(validationResults, context) {
    const issues = [];

    validationResults.forEach(result => {
      if (!result.passed) {
        issues.push({
          id: `${this.agentType}-${Date.now()}-${issues.length}`,
          agentType: this.agentType,
          severity: result.severity || 'medium',
          category: result.category || 'general',
          message: result.message,
          location: result.location,
          suggestion: result.suggestion,
          autoFixable: result.autoFixable || false,
          detectedAt: new Date().toISOString(),
          context: {
            streamId: this.stream?.id,
            ...context
          }
        });
      }
    });

    this.state.issuesDetected += issues.length;
    this.metrics.totalIssues += issues.length;

    // Update severity counts
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical':
          this.metrics.criticalIssues++;
          break;
        case 'high':
          this.metrics.highIssues++;
          break;
        case 'medium':
          this.metrics.mediumIssues++;
          break;
        case 'low':
          this.metrics.lowIssues++;
          break;
      }
    });

    return issues;
  }

  /**
   * Generate alerts for issues
   * @param {Array} issues - Detected issues
   * @param {Object} context - Alert context
   */
  async generateAlerts(issues, context) {
    if (!this.config.enableRealTimeAlerts) return;

    const thresholdMap = {
      low: ['critical', 'high', 'medium', 'low'],
      medium: ['critical', 'high', 'medium'],
      high: ['critical', 'high'],
      critical: ['critical']
    };

    const alertableSeverities = thresholdMap[this.config.severityThreshold];

    const criticalIssues = issues.filter(i => alertableSeverities.includes(i.severity));

    if (criticalIssues.length > 0) {
      const alert = {
        alertId: `alert-${Date.now()}`,
        agentId: this.agentId,
        agentType: this.agentType,
        severity: this.getHighestSeverity(criticalIssues),
        issueCount: criticalIssues.length,
        issues: criticalIssues,
        streamId: this.stream?.id,
        timestamp: new Date().toISOString(),
        context
      };

      this.alerts.push(alert);

      // Limit alert storage
      if (this.alerts.length > this.config.maxAlerts) {
        this.alerts = this.alerts.slice(-this.config.maxAlerts);
      }

      // Broadcast alert to coordination channel
      if (this.coordinationChannel) {
        await this.broadcastAlert(alert);
      }

      this.emit('alert-generated', alert);
    }
  }

  /**
   * Broadcast alert to coordination channel
   * @param {Object} alert - Alert to broadcast
   */
  async broadcastAlert(alert) {
    // Placeholder - will integrate with WebSocket coordination layer
    console.log(`🚨 ${this.agentType} ALERT [${alert.severity}]: ${alert.issueCount} issues detected`);
    alert.issues.slice(0, 3).forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
  }

  /**
   * Attempt automatic correction of issues
   * @param {*} content - Content with issues
   * @param {Array} issues - Detected issues
   * @param {Object} context - Correction context
   */
  async attemptAutoCorrection(content, issues, context) {
    const autoFixableIssues = issues.filter(i => i.autoFixable);

    if (autoFixableIssues.length === 0) return;

    console.log(`🔧 ${this.agentType} attempting auto-correction for ${autoFixableIssues.length} issues...`);

    for (const issue of autoFixableIssues) {
      try {
        const corrected = await this.correctIssue(content, issue, context);

        if (corrected) {
          issue.corrected = true;
          issue.correctedAt = new Date().toISOString();
          this.state.issuesResolved++;
          this.metrics.autoCorrections++;

          this.emit('issue-corrected', {
            issueId: issue.id,
            agentType: this.agentType,
            message: issue.message
          });
        }
      } catch (error) {
        console.error(`❌ Auto-correction failed for issue ${issue.id}:`, error.message);
      }
    }
  }

  /**
   * Correct specific issue (implemented by subclasses)
   * @param {*} content - Content to correct
   * @param {Object} issue - Issue to correct
   * @param {Object} context - Correction context
   * @returns {Promise<boolean>} Success status
   */
  async correctIssue(content, issue, context) {
    // Subclass implements actual correction logic
    return false;
  }

  /**
   * Calculate quality score from issues
   * @param {Array} issues - Detected issues
   * @returns {number} Score (0-100)
   */
  calculateScore(issues) {
    if (issues.length === 0) return 100;

    // Weight by severity
    const severityWeights = {
      critical: 25,
      high: 10,
      medium: 5,
      low: 2
    };

    const totalDeductions = issues.reduce((sum, issue) => {
      return sum + (severityWeights[issue.severity] || 5);
    }, 0);

    const score = Math.max(0, 100 - totalDeductions);

    return score;
  }

  /**
   * Get highest severity from issues
   * @param {Array} issues - Issues to evaluate
   * @returns {string} Highest severity
   */
  getHighestSeverity(issues) {
    const severityOrder = ['critical', 'high', 'medium', 'low'];

    for (const severity of severityOrder) {
      if (issues.some(i => i.severity === severity)) {
        return severity;
      }
    }

    return 'low';
  }

  /**
   * Update metrics after scan
   * @param {Array} issues - Detected issues
   * @param {number} scanStartTime - Scan start timestamp
   */
  updateMetrics(issues, scanStartTime) {
    const scanDuration = Date.now() - scanStartTime;

    // Update average scan time
    this.metrics.averageScanTime =
      (this.metrics.averageScanTime * (this.metrics.totalScans - 1) + scanDuration) /
      this.metrics.totalScans;
  }

  /**
   * Generate final report
   * @returns {Object} Comprehensive monitoring report
   */
  generateFinalReport() {
    const report = {
      agentId: this.agentId,
      agentType: this.agentType,
      streamId: this.stream?.id,

      summary: {
        totalScans: this.metrics.totalScans,
        totalIssues: this.metrics.totalIssues,
        issuesResolved: this.state.issuesResolved,
        resolutionRate: this.metrics.totalIssues > 0
          ? ((this.state.issuesResolved / this.metrics.totalIssues) * 100).toFixed(1) + '%'
          : 'N/A',
        autoCorrections: this.metrics.autoCorrections
      },

      issueBreakdown: {
        critical: this.metrics.criticalIssues,
        high: this.metrics.highIssues,
        medium: this.metrics.mediumIssues,
        low: this.metrics.lowIssues
      },

      performance: {
        averageScanTime: `${this.metrics.averageScanTime.toFixed(0)}ms`,
        totalMonitoringTime: this.state.lastScanTime
          ? `${((this.state.lastScanTime - (this.state.currentScanStartTime || Date.now())) / 1000).toFixed(1)}s`
          : 'N/A'
      },

      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      resolvedAlerts: this.resolvedAlerts.length,

      overallScore: this.calculateOverallScore(),

      generatedAt: new Date().toISOString()
    };

    if (this.config.enableDetailedReports) {
      report.detailedIssues = this.alerts;
    }

    return report;
  }

  /**
   * Calculate overall quality score
   * @returns {number} Score (0-100)
   */
  calculateOverallScore() {
    if (this.metrics.totalScans === 0) return 100;

    // Base score
    let score = 100;

    // Deduct for unresolved issues
    const unresolvedIssues = this.metrics.totalIssues - this.state.issuesResolved;
    score -= (unresolvedIssues * 2); // 2 points per unresolved issue

    // Extra penalty for critical/high issues
    score -= (this.metrics.criticalIssues * 10);
    score -= (this.metrics.highIssues * 5);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get current status
   * @returns {Object} Current agent status
   */
  getStatus() {
    return {
      agentId: this.agentId,
      agentType: this.agentType,
      isActive: this.state.isActive,
      scanCount: this.state.scanCount,
      issuesDetected: this.state.issuesDetected,
      issuesResolved: this.state.issuesResolved,
      activeAlerts: this.alerts.filter(a => !a.resolved).length,
      overallScore: this.calculateOverallScore()
    };
  }
}

module.exports = BaseComplianceAgent;

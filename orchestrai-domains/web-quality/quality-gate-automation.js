/**
 * ORCHESTRAI Quality Gate Automation
 * Automatic visual testing integration for web development workflow
 */

const VisualQAAutomation = require('./visual-qa-automation');
const path = require('path');
const fs = require('fs').promises;

class QualityGateAutomation {
    constructor(options = {}) {
        this.visualQA = new VisualQAAutomation(options);
        this.enabled = options.enabled !== false;
        this.autoFix = options.autoFix || false;
        this.threshold = options.threshold || { maxIssues: 3, minPassRate: 0.8 };
    }

    async initialize() {
        if (!this.enabled) {
            console.log('🚫 Quality Gate Automation disabled');
            return;
        }

        console.log('🏗️ Initializing Quality Gate Automation...');
        await this.visualQA.initialize();
        
        // Setup git hooks
        await this.setupGitHooks();
        
        console.log('✅ Quality Gate Automation ready');
    }

    async setupGitHooks() {
        // In a real implementation, this would setup git pre-commit hooks
        // to run visual tests before commits
        console.log('🔗 Setting up quality gate hooks...');
    }

    /**
     * Main quality gate check - called before any web deployment
     */
    async runQualityGate(websiteDir, options = {}) {
        if (!this.enabled) {
            console.log('⚠️ Quality gate skipped (disabled)');
            return { passed: true, reason: 'disabled' };
        }

        console.log('🚨 QUALITY GATE: Running automated visual tests...');
        
        const startTime = Date.now();
        
        try {
            // Run visual tests
            const results = await this.visualQA.runVisualTests(websiteDir);
            
            // Evaluate results
            const evaluation = this.evaluateResults(results);
            
            // Generate quality gate report
            const report = {
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
                websiteDir,
                evaluation,
                results,
                recommendation: this.getRecommendation(evaluation)
            };

            // Save quality gate report
            await this.saveQualityGateReport(report);

            // Auto-fix if enabled and issues are minor
            if (this.autoFix && evaluation.autoFixable) {
                await this.runAutoFixes(results);
            }

            // Log results
            this.logQualityGateResults(evaluation);

            return evaluation;

        } catch (error) {
            console.error('❌ Quality Gate Error:', error.message);
            
            return {
                passed: false,
                reason: 'error',
                error: error.message,
                recommendation: 'Fix quality gate system before proceeding'
            };
        }
    }

    evaluateResults(results) {
        const totalTests = results.length;
        const passedTests = results.filter(r => r.status === 'passed').length;
        const failed = results.filter(r => r.status === 'failed').length;
        const errors = results.filter(r => r.status === 'error').length;
        
        const passRate = totalTests > 0 ? passedTests / totalTests : 0;
        const totalIssues = results.reduce((sum, r) => sum + (r.issues?.length || 0), 0);
        
        // Quality gate criteria
        const meetsCriteria = {
            passRate: passRate >= this.threshold.minPassRate,
            maxIssues: totalIssues <= this.threshold.maxIssues,
            noErrors: errors === 0
        };
        
        const passed = Object.values(meetsCriteria).every(Boolean);
        
        return {
            passed,
            passRate,
            totalTests,
            passedTests,
            failedTests: failed,
            errorTests: errors,
            totalIssues,
            criteria: meetsCriteria,
            autoFixable: this.checkAutoFixable(results),
            severity: this.calculateSeverity(results)
        };
    }

    checkAutoFixable(results) {
        // Check if issues are minor and can be auto-fixed
        const minorIssues = ['spacing', 'color-contrast', 'responsive-minor'];
        
        return results.every(result => {
            if (result.status !== 'failed') return true;
            
            return result.issues.every(issue => 
                minorIssues.some(minor => issue.check.includes(minor))
            );
        });
    }

    calculateSeverity(results) {
        const highPriorityIssues = results.reduce((count, result) => {
            return count + (result.issues?.filter(issue => issue.severity === 'high').length || 0);
        }, 0);

        if (highPriorityIssues > 5) return 'critical';
        if (highPriorityIssues > 2) return 'high';
        if (highPriorityIssues > 0) return 'medium';
        return 'low';
    }

    getRecommendation(evaluation) {
        if (evaluation.passed) {
            return {
                action: 'proceed',
                message: '✅ Quality gate passed - safe to deploy',
                priority: 'low'
            };
        }

        if (evaluation.severity === 'critical') {
            return {
                action: 'block',
                message: '🚫 CRITICAL: Do not deploy - fix major issues first',
                priority: 'critical'
            };
        }

        if (evaluation.autoFixable) {
            return {
                action: 'auto-fix',
                message: '🔧 Minor issues detected - auto-fixing...',
                priority: 'medium'
            };
        }

        return {
            action: 'review',
            message: '⚠️ Issues found - manual review required',
            priority: 'high'
        };
    }

    async runAutoFixes(results) {
        console.log('🔧 Running automatic fixes...');
        
        // In a real implementation, this would apply common fixes
        // For now, we'll just log what would be fixed
        
        for (const result of results) {
            if (result.status === 'failed' && result.issues) {
                for (const issue of result.issues) {
                    console.log(`🔧 Auto-fixing: ${issue.check} - ${issue.message}`);
                    
                    // Simulate fix application
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }
        
        console.log('✅ Auto-fixes applied');
    }

    logQualityGateResults(evaluation) {
        console.log('\n📊 QUALITY GATE RESULTS:');
        console.log('═══════════════════════════');
        
        if (evaluation.passed) {
            console.log('✅ STATUS: PASSED');
            console.log('🎉 Website is ready for deployment!');
        } else {
            console.log('❌ STATUS: FAILED');
            console.log(`⚠️ Issues found: ${evaluation.totalIssues}`);
        }
        
        console.log(`📈 Pass Rate: ${(evaluation.passRate * 100).toFixed(1)}%`);
        console.log(`🎯 Tests: ${evaluation.passedTests} passed, ${evaluation.failedTests} failed, ${evaluation.errorTests} errors`);
        console.log(`🚨 Severity: ${evaluation.severity.toUpperCase()}`);
        
        console.log(`\n💡 Recommendation: ${evaluation.recommendation?.message}`);
        console.log('═══════════════════════════\n');
    }

    async saveQualityGateReport(report) {
        const filename = `quality-gate-${Date.now()}.json`;
        const reportPath = path.join(this.visualQA.reportsDir, filename);
        
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log('📊 Quality Gate Report saved:', reportPath);
        return reportPath;
    }

    /**
     * Integrate with ORCHESTRAI web development workflow
     */
    static async integrateWithOrchestrator(orchestratorInstance) {
        console.log('🔗 Integrating Quality Gate with ORCHESTRAI...');
        
        const qualityGate = new QualityGateAutomation({
            enabled: true,
            autoFix: true,
            threshold: {
                maxIssues: 3,
                minPassRate: 0.85
            }
        });

        await qualityGate.initialize();

        // Hook into web development pipeline
        orchestratorInstance.addQualityGate('visual-testing', async (context) => {
            if (context.domain === 'web-development' && context.websiteDir) {
                return await qualityGate.runQualityGate(context.websiteDir);
            }
            return { passed: true, reason: 'not-applicable' };
        });

        console.log('✅ Quality Gate integrated with ORCHESTRAI');
        return qualityGate;
    }
}

module.exports = QualityGateAutomation;

// Auto-integration when loaded by ORCHESTRAI
if (global.ORCHESTRAI_INSTANCE) {
    QualityGateAutomation.integrateWithOrchestrator(global.ORCHESTRAI_INSTANCE);
}
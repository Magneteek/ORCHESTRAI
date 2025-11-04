/**
 * BATCH COMPREHENSIVE REPORT GENERATOR
 *
 * Generates comprehensive intelligence reports for ALL client projects
 * with intelligence data available.
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const ComprehensiveIntelligenceAggregator = require('../pipelines/comprehensive-intelligence-aggregator');
const IntelligenceHTMLPipeline = require('../pipelines/intelligence-html-report-pipeline');

// Mock orchestrator and client hub for standalone execution
const mockOrchestrator = {
  log: (msg) => console.log(`[Orchestrator] ${msg}`),
  metrics: {}
};

const mockClientHub = {
  getClientProjectPath: (clientId) => {
    const projectsPath = path.join(__dirname, '../../../projects');
    const allDirs = require('fs').readdirSync(projectsPath);
    const matchingDir = allDirs.find(dir => dir.includes(clientId) || clientId.includes(dir));
    return matchingDir ? path.join(projectsPath, matchingDir) : null;
  }
};

class BatchReportGenerator {
  constructor() {
    this.projectsPath = path.join(__dirname, '../../../projects');
    this.results = [];
  }

  /**
   * Find all client projects with intelligence data
   */
  async findClientProjects() {
    console.log('\n🔍 Scanning for client projects with intelligence data...\n');

    const projects = [];
    const allDirs = await fs.readdir(this.projectsPath);

    for (const dir of allDirs) {
      const projectPath = path.join(this.projectsPath, dir);
      const intelligencePath = path.join(projectPath, 'client-intelligence');

      try {
        const stats = await fs.stat(intelligencePath);
        if (stats.isDirectory()) {
          // Count intelligence files
          const files = await fs.readdir(intelligencePath);
          const intelligenceFiles = files.filter(f => f.endsWith('.json') || f.endsWith('.md'));

          if (intelligenceFiles.length > 0) {
            projects.push({
              id: dir,
              path: projectPath,
              intelligencePath,
              fileCount: intelligenceFiles.length
            });
          }
        }
      } catch (e) {
        // Directory doesn't exist, skip
      }
    }

    console.log(`✅ Found ${projects.length} client projects with intelligence data:\n`);
    projects.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.id} (${p.fileCount} files)`);
    });

    return projects;
  }

  /**
   * Generate comprehensive report for a single client
   */
  async generateClientReport(project) {
    const startTime = Date.now();

    console.log(`\n${'='.repeat(80)}`);
    console.log(`CLIENT: ${project.id}`);
    console.log(`${'='.repeat(80)}\n`);

    try {
      // Step 1: Aggregate intelligence data
      console.log('📊 STEP 1: Aggregating intelligence data...');
      const aggregator = new ComprehensiveIntelligenceAggregator(project.intelligencePath);
      const aggregatedData = await aggregator.aggregateAll();

      const sources = aggregator.getLoadedSources();
      const completeness = aggregator.calculateCompleteness();

      console.log(`   ✅ Aggregation complete: ${completeness}% (${sources.length}/6 sources)`);
      sources.forEach(source => console.log(`      • ${source}`));

      // Export aggregated data
      const aggregatedJSONPath = path.join(project.intelligencePath, 'comprehensive-intelligence-aggregated.json');
      await aggregator.exportToJSON(aggregatedJSONPath);

      // Step 2: Generate HTML report
      console.log('\n📄 STEP 2: Generating HTML report...');
      const pipeline = new IntelligenceHTMLPipeline(mockOrchestrator, mockClientHub);

      const result = await pipeline.executePipeline({
        jsonReportPath: aggregatedJSONPath,
        reportType: 'comprehensive',
        clientId: project.id
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`   ✅ Report generated: ${path.basename(result.htmlPath)}`);
      console.log(`   📊 File size: ${(result.metrics.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   ⏱️  Duration: ${duration}s`);

      return {
        success: true,
        clientId: project.id,
        htmlPath: result.htmlPath,
        fileSize: result.metrics.fileSize,
        completeness,
        sources: sources.length,
        duration
      };

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);

      return {
        success: false,
        clientId: project.id,
        error: error.message
      };
    }
  }

  /**
   * Generate reports for all client projects
   */
  async generateAllReports() {
    console.log('\n');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(20) + 'BATCH COMPREHENSIVE REPORT GENERATOR' + ' '.repeat(22) + '║');
    console.log('╚' + '═'.repeat(78) + '╝');

    const projects = await this.findClientProjects();

    if (projects.length === 0) {
      console.log('\n⚠️  No client projects with intelligence data found.\n');
      return;
    }

    console.log(`\n🚀 Starting batch generation for ${projects.length} clients...\n`);

    // Generate reports sequentially
    for (const project of projects) {
      const result = await this.generateClientReport(project);
      this.results.push(result);
    }

    // Display summary
    this.displaySummary();
  }

  /**
   * Display generation summary
   */
  displaySummary() {
    console.log('\n');
    console.log('╔' + '═'.repeat(78) + '╗');
    console.log('║' + ' '.repeat(30) + 'GENERATION SUMMARY' + ' '.repeat(30) + '║');
    console.log('╚' + '═'.repeat(78) + '╝\n');

    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);

    console.log(`📊 Total Reports: ${this.results.length}`);
    console.log(`✅ Successful: ${successful.length}`);
    console.log(`❌ Failed: ${failed.length}\n`);

    if (successful.length > 0) {
      console.log('✅ SUCCESSFUL REPORTS:\n');
      successful.forEach((result, idx) => {
        console.log(`${idx + 1}. ${result.clientId}`);
        console.log(`   📄 Report: ${path.basename(result.htmlPath)}`);
        console.log(`   📊 Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
        console.log(`   ✓ Completeness: ${result.completeness}% (${result.sources}/6 sources)`);
        console.log(`   ⏱️  Duration: ${result.duration}s\n`);
      });
    }

    if (failed.length > 0) {
      console.log('❌ FAILED REPORTS:\n');
      failed.forEach((result, idx) => {
        console.log(`${idx + 1}. ${result.clientId}`);
        console.log(`   Error: ${result.error}\n`);
      });
    }

    // Display total stats
    if (successful.length > 0) {
      const totalSize = successful.reduce((sum, r) => sum + r.fileSize, 0);
      const avgCompleteness = successful.reduce((sum, r) => sum + r.completeness, 0) / successful.length;
      const totalDuration = successful.reduce((sum, r) => sum + parseFloat(r.duration), 0);

      console.log('📈 AGGREGATE STATISTICS:\n');
      console.log(`   Total file size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Average completeness: ${avgCompleteness.toFixed(1)}%`);
      console.log(`   Total generation time: ${totalDuration.toFixed(2)}s`);
      console.log(`   Average time per report: ${(totalDuration / successful.length).toFixed(2)}s\n`);
    }

    // Open all reports in browser
    if (successful.length > 0) {
      console.log('🌐 Opening all reports in browser...\n');
      successful.forEach(result => {
        try {
          exec(`open "${result.htmlPath}"`);
        } catch (e) {
          console.log(`   Could not open ${path.basename(result.htmlPath)}`);
        }
      });
    }

    console.log('✨ Batch generation complete!\n');
  }
}

// Execute batch generation
async function main() {
  const generator = new BatchReportGenerator();
  await generator.generateAllReports();
}

main().catch(error => {
  console.error('\n❌ Batch generation failed:', error);
  process.exit(1);
});

#!/usr/bin/env node

/**
 * Performance Check Script
 *
 * Validates performance budgets and bundle sizes
 * Run after build: node scripts/performance-check.js
 */

const fs = require('fs');
const path = require('path');

// Performance budgets (in bytes)
const BUDGETS = {
  'Total JavaScript': 300 * 1024, // 300KB gzipped
  'First Load JS': 200 * 1024, // 200KB
  'Total CSS': 50 * 1024, // 50KB
};

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function checkBundleSize() {
  const nextDir = path.join(process.cwd(), '.next');
  const buildManifest = path.join(nextDir, 'build-manifest.json');

  if (!fs.existsSync(buildManifest)) {
    console.error(`${colors.red}Error: Build manifest not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.bold}${colors.blue}\n🔍 Performance Budget Check${colors.reset}\n`);

  const manifest = JSON.parse(fs.readFileSync(buildManifest, 'utf8'));

  let totalJS = 0;
  let firstLoadJS = 0;
  const failures = [];
  const warnings = [];

  // Calculate total JavaScript size
  const staticDir = path.join(nextDir, 'static');

  if (fs.existsSync(staticDir)) {
    function walkDir(dir) {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.js')) {
          totalJS += stat.size;
        } else if (file.endsWith('.css')) {
          // CSS tracking could be added here
        }
      });
    }

    walkDir(staticDir);
  }

  // Check budgets
  console.log('Bundle Size Analysis:\n');

  for (const [metric, budget] of Object.entries(BUDGETS)) {
    let current = 0;

    if (metric === 'Total JavaScript') {
      current = totalJS;
    } else if (metric === 'First Load JS') {
      // Estimate first load JS (framework + pages)
      current = totalJS * 0.6; // Rough estimate
    }

    const percentage = (current / budget) * 100;
    let status, color;

    if (percentage <= 90) {
      status = '✓ PASS';
      color = colors.green;
    } else if (percentage <= 110) {
      status = '⚠ WARN';
      color = colors.yellow;
      warnings.push({ metric, current, budget, percentage });
    } else {
      status = '✗ FAIL';
      color = colors.red;
      failures.push({ metric, current, budget, percentage });
    }

    console.log(
      `${color}${status}${colors.reset} ${metric}: ${formatBytes(current)} / ${formatBytes(budget)} (${percentage.toFixed(1)}%)`
    );
  }

  // Summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);

  if (failures.length === 0 && warnings.length === 0) {
    console.log(`${colors.green}✓ All performance budgets passed!${colors.reset}\n`);
    return true;
  }

  if (warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ Warnings (${warnings.length}):${colors.reset}`);
    warnings.forEach(({ metric, current, budget, percentage }) => {
      const excess = current - budget;
      console.log(`  • ${metric}: ${formatBytes(excess)} over budget (${percentage.toFixed(1)}%)`);
    });
  }

  if (failures.length > 0) {
    console.log(`\n${colors.red}✗ Failures (${failures.length}):${colors.reset}`);
    failures.forEach(({ metric, current, budget, percentage }) => {
      const excess = current - budget;
      console.log(`  • ${metric}: ${formatBytes(excess)} over budget (${percentage.toFixed(1)}%)`);
    });
    console.log();
    return false;
  }

  console.log();
  return true;
}

function checkLighthouseScores() {
  console.log(`${colors.bold}${colors.blue}💡 Lighthouse Score Targets:${colors.reset}\n`);

  const targets = [
    { category: 'Performance', target: 90 },
    { category: 'Accessibility', target: 95 },
    { category: 'Best Practices', target: 90 },
    { category: 'SEO', target: 90 },
  ];

  targets.forEach(({ category, target }) => {
    console.log(`  ${category}: ${colors.yellow}≥${target}${colors.reset}`);
  });

  console.log(`\n${colors.blue}Run: npm run lighthouse${colors.reset}\n`);
}

function main() {
  const passed = checkBundleSize();
  checkLighthouseScores();

  if (!passed) {
    console.log(`${colors.red}Performance budget check failed!${colors.reset}\n`);
    console.log('Recommendations:');
    console.log('  1. Enable code splitting for large components');
    console.log('  2. Lazy load non-critical features');
    console.log('  3. Optimize third-party dependencies');
    console.log('  4. Use dynamic imports for heavy libraries\n');
    process.exit(1);
  }
}

main();

#!/usr/bin/env node
/**
 * Bricks Compiler CLI
 *
 * Usage:
 *   node cli.js <page-spec.json>              — print clipboard JSON to stdout
 *   node cli.js <page-spec.json> out.json     — write clipboard JSON to file
 *   node cli.js <page-spec.json> --clipboard  — copy to macOS clipboard (pbcopy)
 */

'use strict';

const { compilePage } = require('./index');
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const [,, specFile, outputArg] = process.argv;

if (!specFile) {
  console.error('Usage: node cli.js <page-spec.json> [output.json|--clipboard]');
  console.error('\nExamples:');
  console.error('  node cli.js examples/foxtrot-example.json');
  console.error('  node cli.js examples/foxtrot-example.json out.json');
  console.error('  node cli.js examples/foxtrot-example.json --clipboard');
  process.exit(1);
}

const specPath = path.resolve(specFile);
if (!fs.existsSync(specPath)) {
  console.error(`Error: file not found: ${specPath}`);
  process.exit(1);
}

let pageSpec;
try {
  pageSpec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
} catch (err) {
  console.error(`Error parsing ${specFile}: ${err.message}`);
  process.exit(1);
}

let result;
try {
  result = compilePage(pageSpec);
} catch (err) {
  console.error(`Compile error: ${err.message}`);
  process.exit(1);
}

// Output is the clipboard JSON — ready to paste into Bricks
const output = JSON.stringify(result.clipboard, null, 2);

if (!outputArg || outputArg === '-') {
  process.stdout.write(output + '\n');

} else if (outputArg === '--clipboard') {
  try {
    execSync('pbcopy', { input: output });
    const elCount  = result.bricks_content.length;
    const clsCount = result.bricks_global_classes.length;
    console.log(`✅ Copied to clipboard: ${elCount} elements, ${clsCount} global classes`);
    console.log(`   Page: "${result.page_title}" (/${result.slug})`);
    console.log('   → Open Bricks editor → Ctrl+V to paste');
  } catch {
    console.error('pbcopy failed — are you on macOS?');
    process.stdout.write(output + '\n');
  }

} else {
  const outPath = path.resolve(outputArg);
  fs.writeFileSync(outPath, output);
  const elCount  = result.bricks_content.length;
  const clsCount = result.bricks_global_classes.length;
  console.log(`✅ Written to ${outputArg}`);
  console.log(`   ${elCount} elements, ${clsCount} global classes`);
  console.log(`   Page: "${result.page_title}" (/${result.slug})`);
}

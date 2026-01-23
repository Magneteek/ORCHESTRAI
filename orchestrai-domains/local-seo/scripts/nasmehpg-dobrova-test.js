/**
 * nasmehPG Dobrova-Polhov Gradec Quick Check
 *
 * Tests local rankings for actual service area:
 * - Primary: Dobrova-Polhov Gradec
 * - Nearby: Dobrova, Polhov Gradec, Horjul, Vrhnika, Brezovica, Ljubljana
 */

const QuickMapsChecker = require('./quick-maps-check');

(async () => {
  console.log('\n🦷 nasmehPG Local Area Ranking Test\n');
  console.log('Service Area: Dobrova-Polhov Gradec, Slovenia');
  console.log('Nearby Cities: Dobrova, Polhov Gradec, Horjul, Vrhnika, Brezovica, Ljubljana\n');

  const checker = new QuickMapsChecker();

  // Test Configuration - Targeting actual service area
  const config = {
    businessName: 'Hiša lepega nasmeha PG',

    // Primary location
    location: 'Dobrova-Polhov Gradec,Slovenia',

    language: 'Slovenian',
    locationCode: 2705, // Slovenia location code
    projectId: 'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e',

    // Test with 5 keywords (quick validation)
    keywords: [
      // General dental services (broad)
      'zobozdravnik Polhov Gradec',
      'dentist Dobrova',

      // Service-specific (target services)
      'zobni implantati Ljubljana',
      'beljenje zob Ljubljana',

      // Local area keyword
      'zobozdravnik Vrhnika'
    ]
  };

  try {
    console.log('═'.repeat(70));
    console.log('TEST 1: PRIMARY SERVICE AREA - Dobrova-Polhov Gradec');
    console.log('═'.repeat(70));
    console.log('');

    const results = await checker.trackRankings(config);

    // Print text report
    console.log(checker.generateTextReport());

    // Analysis for this specific area
    console.log('\n📍 LOCAL AREA ANALYSIS:');
    console.log('─'.repeat(70));

    const localKeywords = results.results.filter(r =>
      r.keyword.toLowerCase().includes('polhov') ||
      r.keyword.toLowerCase().includes('dobrova') ||
      r.keyword.toLowerCase().includes('vrhnika')
    );

    const ljubljanaKeywords = results.results.filter(r =>
      r.keyword.toLowerCase().includes('ljubljana')
    );

    console.log('\n🏘️  Local Area Keywords (Dobrova, Polhov Gradec, Vrhnika):');
    if (localKeywords.length > 0) {
      localKeywords.forEach(r => {
        const status = r.position ? `#${r.position}` : 'Not ranked';
        const pack = r.inLocalPack ? '🟢 IN PACK' : '';
        console.log(`   ${r.keyword}: ${status} ${pack}`);
      });
    } else {
      console.log('   No local area keywords tested');
    }

    console.log('\n🏙️  Ljubljana Keywords (Broader market):');
    if (ljubljanaKeywords.length > 0) {
      ljubljanaKeywords.forEach(r => {
        const status = r.position ? `#${r.position}` : 'Not ranked';
        const pack = r.inLocalPack ? '🟢 IN PACK' : '';
        console.log(`   ${r.keyword}: ${status} ${pack}`);
      });
    } else {
      console.log('   No Ljubljana keywords tested');
    }

    // Recommendations for this area
    console.log('\n💡 LOCAL SEO RECOMMENDATIONS:');
    console.log('─'.repeat(70));

    const hasLocalRankings = localKeywords.some(r => r.position);
    const hasLjubljanaRankings = ljubljanaKeywords.some(r => r.position);

    if (!hasLocalRankings) {
      console.log('  ⚠️  NOT RANKING FOR LOCAL AREA - Priority Actions:');
      console.log('     1. Create GBP post targeting "Polhov Gradec" specifically');
      console.log('     2. Add "Dobrova-Polhov Gradec" to business description');
      console.log('     3. Get reviews mentioning "Polhov Gradec" or "Dobrova"');
      console.log('     4. Create location page for Polhov Gradec area');
      console.log('     5. List all nearby towns in service area description');
    } else {
      console.log('  ✅ RANKING FOR LOCAL AREA - Maintain presence:');
      console.log('     • Continue posting with local references');
      console.log('     • Collect reviews from local patients');
    }

    if (hasLjubljanaRankings) {
      console.log('\n  ✅ LJUBLJANA VISIBILITY - Good broader market reach');
      console.log('     • Ljubljana keywords bring broader traffic');
      console.log('     • Focus on differentiating from Ljubljana competitors');
      console.log('     • Emphasize "near Ljubljana" in marketing');
    } else {
      console.log('\n  ⚠️  NO LJUBLJANA RANKINGS - Consider:');
      console.log('     • Add "Ljubljana okolica" (Ljubljana area) to keywords');
      console.log('     • Target "zahodno od Ljubljane" (west of Ljubljana)');
      console.log('     • Emphasize easy access from Ljubljana');
    }

    console.log('\n🎯 NEXT STEPS FOR DOBROVA-POLHOV GRADEC AREA:');
    console.log('─'.repeat(70));
    console.log('  1. Test more local keywords (see recommendations below)');
    console.log('  2. Create dedicated Polhov Gradec location page');
    console.log('  3. Add local landmarks and directions in GBP');
    console.log('  4. Get reviews from Dobrova/Polhov Gradec patients');
    console.log('  5. Post about serving Dobrova, Horjul, Vrhnika areas');
    console.log('');

    console.log('\n📋 RECOMMENDED KEYWORDS TO TEST NEXT:');
    console.log('─'.repeat(70));
    console.log('  Local Area (High Priority):');
    console.log('  • zobozdravnik Dobrova');
    console.log('  • zobni implantati Vrhnika');
    console.log('  • dentist Horjul');
    console.log('  • zobozdravnik Brezovica');
    console.log('');
    console.log('  Ljubljana Area (Medium Priority):');
    console.log('  • zobozdravnik Ljubljana zahodna');
    console.log('  • dentist near Ljubljana');
    console.log('  • zobni implantati Ljubljana okolica');
    console.log('');
    console.log('  Service-Specific (Medium Priority):');
    console.log('  • ortodontija Polhov Gradec');
    console.log('  • beljenje zob Dobrova');
    console.log('  • implantati Ljubljana');
    console.log('');

    console.log('═'.repeat(70));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack trace:', error.stack);

    if (error.message.includes('mcp__dataforseo__serp_google_maps')) {
      console.error('\n💡 TIP: This script requires DataForSEO MCP server access');
      console.error('   Run via Task tool in Claude Code with MCP configured');
    }

    process.exit(1);
  }
})();

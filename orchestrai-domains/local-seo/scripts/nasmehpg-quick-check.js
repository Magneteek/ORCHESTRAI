/**
 * nasmehPG Quick Maps Check
 *
 * Pre-configured quick check for nasmehPG client.
 * Just run: node nasmehpg-quick-check.js
 */

const QuickMapsChecker = require('./quick-maps-check');

(async () => {
  console.log('\n🦷 nasmehPG Google Maps Quick Check\n');

  const checker = new QuickMapsChecker();

  // nasmehPG Configuration
  const config = {
    businessName: 'Hiša lepega nasmeha PG',
    location: 'Ljubljana,Slovenia',
    language: 'Slovenian',
    locationCode: 2705,
    projectId: 'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e',

    // MODIFY KEYWORDS HERE (max 10 recommended)
    keywords: [
      'zobni implantati Ljubljana',
      'implantacija Ljubljana',
      'dentalna klinika Ljubljana',
      'zobozdravnik Ljubljana implantati',
      'zobni vsadki Ljubljana',
      'implantacija brez bolečine',
      'celostna dentalna oskrba',
      'hitra implantacija'
    ]
  };

  try {
    const results = await checker.trackRankings(config);

    // Print text report
    console.log(checker.generateTextReport());

    // Quick wins detection
    const quickWins = results.results.filter(r =>
      r.position && r.position >= 4 && r.position <= 10
    );

    if (quickWins.length > 0) {
      console.log('\n🎯 QUICK WIN OPPORTUNITIES (Positions 4-10):');
      console.log('─'.repeat(70));
      quickWins.forEach(r => {
        console.log(`  #${r.position} | ${r.keyword}`);
        console.log(`     → Can reach Top 3 with optimization`);
      });
      console.log('');
    }

    // Recommendations
    console.log('\n💡 NEXT STEPS:');
    console.log('─'.repeat(70));

    const top3Count = results.summary.top3Positions;
    const notRankedCount = results.summary.notRanked;

    if (top3Count === 0) {
      console.log('  ⚠️  NO TOP 3 RANKINGS - Priority: Build GBP authority');
      console.log('     • Add 10+ reviews this month');
      console.log('     • Post 3-4 times per week');
      console.log('     • Complete all GBP sections');
    } else if (quickWins.length >= 3) {
      console.log('  ✅ FOCUS ON QUICK WINS - Optimize these keywords first:');
      quickWins.slice(0, 3).forEach(r => {
        console.log(`     • ${r.keyword} (currently #${r.position})`);
      });
    } else {
      console.log('  ✅ MAINTAIN TOP POSITIONS - Keep posting & collecting reviews');
    }

    if (notRankedCount > 0) {
      console.log(`  ⚠️  ${notRankedCount} keywords not ranked - Consider long-tail variations`);
    }

    console.log('');
    console.log('═'.repeat(70));
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('mcp__dataforseo__serp_google_maps')) {
      console.error('\n💡 TIP: Make sure DataForSEO MCP server is configured');
      console.error('   Run this inside Claude Code with MCP access');
    }
    process.exit(1);
  }
})();

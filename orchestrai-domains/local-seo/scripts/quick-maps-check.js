/**
 * Quick Maps Ranking Check
 *
 * Ultra-fast Google Maps position tracking for daily checks.
 * Designed for: 5-10 keywords, 10-30 second completion, cancellable execution
 *
 * Usage:
 *   node quick-maps-check.js
 *   OR import and use programmatically
 */

const fs = require('fs').promises;
const path = require('path');

class QuickMapsChecker {
  constructor() {
    this.cancelled = false;
    this.results = [];
    this.setupCancellation();
  }

  /**
   * Setup Ctrl+C handler for graceful cancellation
   */
  setupCancellation() {
    process.on('SIGINT', async () => {
      console.log('\n\n⚠️  Cancellation requested...');
      console.log('📝 Saving partial results...');
      this.cancelled = true;

      if (this.results.length > 0) {
        await this.saveResults(true);
      }

      console.log('✅ Partial results saved. Exiting.');
      process.exit(0);
    });
  }

  /**
   * Find business position in SERP results
   */
  findBusinessPosition(serpData, businessName) {
    if (!serpData || !serpData.items) {
      return null;
    }

    // Normalize business name for matching
    const normalizedName = businessName.toLowerCase().trim();

    // Check local pack results
    const localPack = serpData.items.filter(item => item.type === 'local_pack');

    if (localPack.length > 0 && localPack[0].local_pack) {
      const listings = localPack[0].local_pack;

      for (let i = 0; i < listings.length; i++) {
        const listing = listings[i];
        const listingName = (listing.title || '').toLowerCase().trim();

        // Fuzzy match (handles slight variations)
        if (this.fuzzyMatch(listingName, normalizedName)) {
          return {
            position: i + 1,
            inLocalPack: i < 3,
            title: listing.title,
            rating: listing.rating?.value || null,
            reviews: listing.rating?.votes_count || 0,
            address: listing.address || null,
            phone: listing.phone || null
          };
        }
      }
    }

    // Not found in local pack
    return {
      position: null,
      inLocalPack: false,
      title: null,
      rating: null,
      reviews: 0
    };
  }

  /**
   * Fuzzy string matching (handles variations)
   */
  fuzzyMatch(str1, str2) {
    // Exact match
    if (str1 === str2) return true;

    // Contains match
    if (str1.includes(str2) || str2.includes(str1)) return true;

    // Remove common business suffixes for better matching
    const cleanStr1 = str1.replace(/(ltd|llc|inc|gmbh|bv|d\.o\.o\.|s\.r\.o\.)$/i, '').trim();
    const cleanStr2 = str2.replace(/(ltd|llc|inc|gmbh|bv|d\.o\.o\.|s\.r\.o\.)$/i, '').trim();

    if (cleanStr1.includes(cleanStr2) || cleanStr2.includes(cleanStr1)) return true;

    return false;
  }

  /**
   * Track rankings for a list of keywords
   */
  async trackRankings({
    businessName,
    keywords,
    location,
    language = 'English',
    locationCode = null,
    projectId = null,
    saveResults = true
  }) {
    const startTime = Date.now();

    // Validation
    if (!businessName || !keywords || keywords.length === 0) {
      throw new Error('businessName and keywords are required');
    }

    if (keywords.length > 10) {
      console.log(`\n⚠️  WARNING: ${keywords.length} keywords requested (max 10 recommended)`);
      console.log(`Estimated time: ${Math.ceil(keywords.length * 3)} seconds`);
      console.log(`API cost: €${(keywords.length * 0.30).toFixed(2)}\n`);
    }

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║       Quick Maps Ranking Check                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log(`📍 Business: ${businessName}`);
    console.log(`📌 Location: ${location}`);
    console.log(`🔍 Keywords: ${keywords.length}`);
    console.log(`💰 Estimated cost: €${(keywords.length * 0.30).toFixed(2)}`);
    console.log(`⏱️  Estimated time: ${Math.ceil(keywords.length * 3)} seconds`);
    console.log('\n' + '─'.repeat(60) + '\n');

    this.results = [];
    let processedCount = 0;

    for (let i = 0; i < keywords.length; i++) {
      if (this.cancelled) {
        console.log('\n⚠️  Check cancelled. Saving partial results...');
        break;
      }

      const keyword = keywords[i];
      console.log(`[${i + 1}/${keywords.length}] ${keyword}...`);

      try {
        // Make API call via MCP
        const serpData = await global.mcp__dataforseo__serp_google_maps({
          keyword,
          location_name: location,
          language_name: language,
          ...(locationCode && { location_code: locationCode })
        });

        const positionData = this.findBusinessPosition(serpData, businessName);

        const result = {
          keyword,
          ...positionData,
          searchDate: new Date().toISOString(),
          location
        };

        this.results.push(result);
        processedCount++;

        // Display result
        if (positionData.position) {
          const packStatus = positionData.inLocalPack ? '🟢 TOP 3' : '🟡 POS';
          console.log(`  ${packStatus} #${positionData.position} | ⭐ ${positionData.rating || 'N/A'} (${positionData.reviews} reviews)`);
        } else {
          console.log(`  🔴 NOT RANKED (not in local pack)`);
        }

      } catch (error) {
        console.log(`  ❌ ERROR: ${error.message}`);
        this.results.push({
          keyword,
          position: null,
          error: error.message,
          searchDate: new Date().toISOString()
        });
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n' + '─'.repeat(60) + '\n');
    console.log('✅ Quick check complete!\n');
    console.log(`📊 Results Summary:`);
    console.log(`   • Keywords checked: ${processedCount}/${keywords.length}`);
    console.log(`   • Ranked in local pack: ${this.results.filter(r => r.inLocalPack).length}`);
    console.log(`   • Top 3 positions: ${this.results.filter(r => r.position && r.position <= 3).length}`);
    console.log(`   • Not ranked: ${this.results.filter(r => !r.position).length}`);
    console.log(`   • Duration: ${duration}s`);

    // Save results
    if (saveResults && this.results.length > 0) {
      await this.saveResults(false, projectId);
    }

    return {
      success: true,
      businessName,
      location,
      totalKeywords: keywords.length,
      processedKeywords: processedCount,
      duration,
      results: this.results,
      summary: {
        rankedInLocalPack: this.results.filter(r => r.inLocalPack).length,
        top3Positions: this.results.filter(r => r.position && r.position <= 3).length,
        notRanked: this.results.filter(r => !r.position).length,
        averagePosition: this.calculateAveragePosition()
      }
    };
  }

  /**
   * Calculate average position (excluding non-ranked)
   */
  calculateAveragePosition() {
    const rankedResults = this.results.filter(r => r.position);
    if (rankedResults.length === 0) return null;

    const sum = rankedResults.reduce((acc, r) => acc + r.position, 0);
    return Math.round((sum / rankedResults.length) * 10) / 10;
  }

  /**
   * Save results to JSON file
   */
  async saveResults(partial = false, projectId = null) {
    try {
      let outputPath;

      if (projectId) {
        // Save to project deliverables
        const projectPath = path.join(__dirname, '../../../projects', projectId, 'deliverables/local-seo');
        await fs.mkdir(projectPath, { recursive: true });

        const filename = partial ? 'quick-check-partial.json' : 'quick-ranking-check.json';
        outputPath = path.join(projectPath, filename);
      } else {
        // Save to temp folder
        const tempPath = path.join(__dirname, '../../../temp');
        await fs.mkdir(tempPath, { recursive: true });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = partial ? `quick-check-partial-${timestamp}.json` : `quick-check-${timestamp}.json`;
        outputPath = path.join(tempPath, filename);
      }

      const output = {
        checkType: 'quick_maps_ranking',
        checkDate: new Date().toISOString(),
        partial,
        businessName: this.results[0]?.businessName,
        location: this.results[0]?.location,
        totalResults: this.results.length,
        summary: {
          rankedInLocalPack: this.results.filter(r => r.inLocalPack).length,
          top3Positions: this.results.filter(r => r.position && r.position <= 3).length,
          notRanked: this.results.filter(r => !r.position).length,
          averagePosition: this.calculateAveragePosition()
        },
        results: this.results
      };

      await fs.writeFile(outputPath, JSON.stringify(output, null, 2), 'utf-8');
      console.log(`\n💾 Results saved: ${outputPath}`);

      return outputPath;
    } catch (error) {
      console.error(`\n❌ Failed to save results: ${error.message}`);
      return null;
    }
  }

  /**
   * Generate simple text report
   */
  generateTextReport() {
    const lines = [];

    lines.push('');
    lines.push('═'.repeat(70));
    lines.push('  QUICK MAPS RANKING CHECK - RESULTS');
    lines.push('═'.repeat(70));
    lines.push('');

    // Group by rank status
    const top3 = this.results.filter(r => r.position && r.position <= 3);
    const ranked = this.results.filter(r => r.position && r.position > 3);
    const notRanked = this.results.filter(r => !r.position);

    if (top3.length > 0) {
      lines.push('🟢 TOP 3 POSITIONS (In Local Pack):');
      lines.push('─'.repeat(70));
      top3.forEach(r => {
        lines.push(`  #${r.position} | ${r.keyword}`);
        lines.push(`     Rating: ${r.rating || 'N/A'} (${r.reviews} reviews)`);
      });
      lines.push('');
    }

    if (ranked.length > 0) {
      lines.push('🟡 RANKED (Outside Local Pack):');
      lines.push('─'.repeat(70));
      ranked.forEach(r => {
        lines.push(`  #${r.position} | ${r.keyword}`);
      });
      lines.push('');
    }

    if (notRanked.length > 0) {
      lines.push('🔴 NOT RANKED:');
      lines.push('─'.repeat(70));
      notRanked.forEach(r => {
        lines.push(`  ❌ | ${r.keyword}`);
      });
      lines.push('');
    }

    lines.push('═'.repeat(70));
    lines.push('');

    return lines.join('\n');
  }
}

/**
 * CLI execution
 */
if (require.main === module) {
  (async () => {
    // Example configuration - MODIFY THIS FOR YOUR USE CASE
    const config = {
      businessName: 'Hiša lepega nasmeha PG',
      keywords: [
        'zobni implantati Ljubljana',
        'implantacija Ljubljana',
        'dentalna klinika Ljubljana',
        'zobozdravnik Ljubljana implantati',
        'zobni vsadki Ljubljana'
      ],
      location: 'Ljubljana,Slovenia',
      language: 'Slovenian',
      locationCode: 2705, // Ljubljana location code
      projectId: 'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e'
    };

    const checker = new QuickMapsChecker();

    try {
      const results = await checker.trackRankings(config);

      // Print text report
      console.log(checker.generateTextReport());

      process.exit(0);
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })();
}

module.exports = QuickMapsChecker;

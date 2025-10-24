/**
 * Automated Ad Collection Pipeline
 *
 * Scheduled pipeline that collects ads from Meta Ad Library and Apify
 * Runs daily (configurable via cron)
 *
 * Usage: node pipelines/ad-collection-pipeline.js
 * Or via cron: npm run pipeline:collection
 */

const CompetitiveIntelligenceHub = require('../competitive-intelligence-domain-hub');
require('dotenv').config();

const COLLECTION_CONFIG = {
    // Keywords to monitor by industry
    industries: [
        {
            name: 'dental_b2c',
            keywords: (process.env.DENTAL_B2C_KEYWORDS || 'dental implants,teeth whitening,braces').split(','),
            markets: (process.env.TARGET_MARKETS || 'ES,NL,BE,DE').split(',')
        },
        {
            name: 'dental_b2b',
            keywords: (process.env.DENTAL_B2B_KEYWORDS || 'CBCT scanner,dental 3D printer').split(','),
            markets: (process.env.TARGET_MARKETS || 'ES,NL,BE,DE').split(',')
        },
        {
            name: 'ai_saas',
            keywords: (process.env.AI_SAAS_KEYWORDS || 'AI chatbot,automation software').split(','),
            markets: (process.env.TARGET_MARKETS || 'ES,NL,BE,DE').split(',')
        }
    ],
    // Collection limits
    adsPerIndustry: parseInt(process.env.MAX_ADS_PER_COLLECTION_RUN || '500') / 3,
    minPerformanceScore: 60 // Only keep ads with score >= 60
};

async function runCollectionPipeline() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 Ad Collection Pipeline Starting');
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log(`⏰ Started at: ${new Date().toISOString()}\n`);

    const hub = new CompetitiveIntelligenceHub();

    try {
        // Initialize domain hub
        console.log('🚀 Initializing domain hub...');
        await hub.initialize();
        console.log('✅ Domain hub initialized\n');

        const results = {
            totalAds: 0,
            newAds: 0,
            topPerformers: [],
            byIndustry: {}
        };

        // Collect ads for each industry
        for (const industry of COLLECTION_CONFIG.industries) {
            console.log(`\n📡 Collecting ads for: ${industry.name}`);
            console.log(`   Keywords: ${industry.keywords.join(', ')}`);
            console.log(`   Markets: ${industry.markets.join(', ')}`);

            try {
                const result = await hub.collectAds({
                    keywords: industry.keywords,
                    industries: [industry.name],
                    markets: industry.markets,
                    limit: COLLECTION_CONFIG.adsPerIndustry,
                    dataSources: ['meta', 'apify'] // Both sources
                });

                results.totalAds += result.totalAds;
                results.newAds += result.newAds;
                results.topPerformers.push(...result.topPerformers);
                results.byIndustry[industry.name] = {
                    totalAds: result.totalAds,
                    newAds: result.newAds,
                    topPerformers: result.topPerformers.length
                };

                console.log(`✅ Collected: ${result.totalAds} ads (${result.newAds} new)`);
                console.log(`   Top performers: ${result.topPerformers.length}`);

            } catch (error) {
                console.error(`❌ Failed to collect ${industry.name} ads:`, error.message);
                results.byIndustry[industry.name] = {
                    error: error.message
                };
            }

            // Small delay between industries to respect rate limits
            await sleep(5000);
        }

        // Filter out low-performing ads
        console.log(`\n🔍 Filtering ads...`);
        const highPerformers = results.topPerformers.filter(
            ad => ad.performanceScore >= COLLECTION_CONFIG.minPerformanceScore
        );
        console.log(`   Kept ${highPerformers.length}/${results.topPerformers.length} high performers`);

        // Trigger AI analysis on top performers (async)
        if (highPerformers.length > 0) {
            console.log(`\n🧠 Queueing AI analysis for ${highPerformers.length} ads...`);
            // Don't await - let analysis run in background
            hub.emit('collection-complete', {
                totalAds: results.totalAds,
                ads: highPerformers
            });
            console.log(`✅ Analysis queue triggered`);
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📊 Collection Pipeline Summary');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Total ads collected: ${results.totalAds}`);
        console.log(`New ads: ${results.newAds}`);
        console.log(`High performers (>=${COLLECTION_CONFIG.minPerformanceScore}): ${highPerformers.length}`);
        console.log('\nBy Industry:');
        Object.entries(results.byIndustry).forEach(([industry, stats]) => {
            if (stats.error) {
                console.log(`  ${industry}: ❌ ${stats.error}`);
            } else {
                console.log(`  ${industry}: ${stats.totalAds} ads (${stats.newAds} new, ${stats.topPerformers} top)`);
            }
        });
        console.log(`\n⏰ Completed at: ${new Date().toISOString()}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // Shutdown
        await hub.shutdown();

        return {
            success: true,
            results
        };

    } catch (error) {
        console.error('\n❌ Collection pipeline failed:', error);
        await hub.shutdown();
        throw error;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if executed directly
if (require.main === module) {
    runCollectionPipeline()
        .then(result => {
            console.log('✅ Pipeline completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Pipeline failed:', error);
            process.exit(1);
        });
}

module.exports = runCollectionPipeline;

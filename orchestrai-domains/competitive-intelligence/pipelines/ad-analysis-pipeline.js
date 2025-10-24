/**
 * Automated Ad Analysis Pipeline
 *
 * Runs AI analysis on collected ads that haven't been analyzed yet
 * Processes in batches to manage API costs
 *
 * Usage: node pipelines/ad-analysis-pipeline.js
 * Or via cron: npm run pipeline:analysis
 */

const CompetitiveIntelligenceHub = require('../competitive-intelligence-domain-hub');
require('dotenv').config();

const ANALYSIS_CONFIG = {
    batchSize: parseInt(process.env.AI_ANALYSIS_BATCH_SIZE || '50'),
    minScoreForAnalysis: 70, // Only analyze high performers
    maxAdsPerRun: 200
};

async function runAnalysisPipeline() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧠 Ad Analysis Pipeline Starting');
    console.log('═══════════════════════════════════════════════════════════\n');

    const hub = new CompetitiveIntelligenceHub();

    try {
        await hub.initialize();

        const db = hub.agents.get('database-coordinator');

        // Get unanalyzed high-performing ads
        console.log('🔍 Finding ads to analyze...');
        const result = await db.pool.query(`
            SELECT a.*
            FROM ads a
            LEFT JOIN ad_analysis aa ON a.id = aa.ad_id
            WHERE aa.id IS NULL
            AND a.performance_score >= $1
            ORDER BY a.performance_score DESC
            LIMIT $2
        `, [ANALYSIS_CONFIG.minScoreForAnalysis, ANALYSIS_CONFIG.maxAdsPerRun]);

        const adsToAnalyze = result.rows;
        console.log(`   Found ${adsToAnalyze.length} ads to analyze\n`);

        if (adsToAnalyze.length === 0) {
            console.log('✅ No ads require analysis');
            await hub.shutdown();
            return { success: true, analyzed: 0 };
        }

        const stats = {
            analyzed: 0,
            failed: 0,
            templatesGenerated: 0
        };

        // Process in batches
        for (let i = 0; i < adsToAnalyze.length; i += ANALYSIS_CONFIG.batchSize) {
            const batch = adsToAnalyze.slice(i, i + ANALYSIS_CONFIG.batchSize);
            console.log(`\n📦 Processing batch ${Math.floor(i / ANALYSIS_CONFIG.batchSize) + 1}/${Math.ceil(adsToAnalyze.length / ANALYSIS_CONFIG.batchSize)}`);
            console.log(`   Analyzing ${batch.length} ads...`);

            for (const ad of batch) {
                try {
                    // Run AI analysis with Claude Code agents
                    console.log(`   🧠 Analyzing: ${ad.headline.substring(0, 50)}...`);
                    const analysis = await hub.analyzeAdWithClaudeAgents(ad);

                    // Save analysis to database
                    await db.pool.query(`
                        INSERT INTO ad_analysis (
                            ad_id, hook, value_proposition, emotional_trigger,
                            color_palette, layout_type, hook_pattern, cta_pattern,
                            created_at
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    `, [
                        ad.id,
                        analysis.hook,
                        analysis.valueProposition,
                        analysis.emotionalTrigger,
                        JSON.stringify(analysis.colorPalette || {}),
                        analysis.layoutType,
                        analysis.hookPattern,
                        analysis.ctaPattern
                    ]);

                    stats.analyzed++;

                    // Generate template if hook is highly effective
                    if (analysis.hookEffectiveness && analysis.hookEffectiveness >= 8) {
                        console.log(`   📋 Generating template (hook score: ${analysis.hookEffectiveness})`);
                        try {
                            await hub.generateTemplate({
                                adId: ad.id,
                                includeAbTestVariations: true
                            });
                            stats.templatesGenerated++;
                        } catch (error) {
                            console.warn(`   ⚠️  Template generation failed: ${error.message}`);
                        }
                    }

                    console.log(`   ✅ Analyzed successfully`);

                } catch (error) {
                    console.error(`   ❌ Analysis failed: ${error.message}`);
                    stats.failed++;
                }

                // Small delay to respect API rate limits
                await sleep(2000);
            }

            // Longer delay between batches
            if (i + ANALYSIS_CONFIG.batchSize < adsToAnalyze.length) {
                console.log('   ⏳ Waiting 10s before next batch...');
                await sleep(10000);
            }
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📊 Analysis Pipeline Summary');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Ads analyzed: ${stats.analyzed}`);
        console.log(`Failed: ${stats.failed}`);
        console.log(`Templates generated: ${stats.templatesGenerated}`);
        console.log(`Success rate: ${((stats.analyzed / (stats.analyzed + stats.failed)) * 100).toFixed(1)}%`);
        console.log('═══════════════════════════════════════════════════════════\n');

        await hub.shutdown();

        return {
            success: true,
            stats
        };

    } catch (error) {
        console.error('\n❌ Analysis pipeline failed:', error);
        await hub.shutdown();
        throw error;
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (require.main === module) {
    runAnalysisPipeline()
        .then(result => {
            console.log('✅ Pipeline completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Pipeline failed:', error);
            process.exit(1);
        });
}

module.exports = runAnalysisPipeline;

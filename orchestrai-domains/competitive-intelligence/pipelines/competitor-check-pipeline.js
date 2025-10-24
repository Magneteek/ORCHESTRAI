/**
 * Automated Competitor Check Pipeline
 *
 * Monitors tracked competitors for new campaigns and alerts
 * Runs every 6 hours (configurable)
 *
 * Usage: node pipelines/competitor-check-pipeline.js
 */

const CompetitiveIntelligenceHub = require('../competitive-intelligence-domain-hub');
const nodemailer = require('nodemailer');
require('dotenv').config();

async function runCompetitorCheckPipeline() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('👁️  Competitor Check Pipeline Starting');
    console.log('═══════════════════════════════════════════════════════════\n');

    const hub = new CompetitiveIntelligenceHub();

    try {
        await hub.initialize();

        const db = hub.agents.get('database-coordinator');

        // Get active competitors
        const result = await db.pool.query(`
            SELECT * FROM competitors
            WHERE tracking_enabled = true
            ORDER BY last_checked ASC
        `);

        const competitors = result.rows;
        console.log(`📋 Found ${competitors.length} competitors to check\n`);

        const newCampaigns = [];

        for (const competitor of competitors) {
            console.log(`🔍 Checking: ${competitor.name}`);

            try {
                // Search for new ads from this competitor
                const metaCollector = hub.agents.get('meta-ad-collector');

                const ads = await metaCollector.searchByAdvertiser({
                    facebookPageId: competitor.facebook_page_id,
                    limit: 10
                });

                // Check for ads we haven't seen before
                for (const ad of ads) {
                    const existing = await db.pool.query(
                        'SELECT id FROM ads WHERE ad_library_id = $1',
                        [ad.adLibraryId]
                    );

                    if (existing.rows.length === 0) {
                        // New ad detected!
                        console.log(`   🆕 New campaign detected: "${ad.headline}"`);

                        // Save ad
                        await db.saveAd(ad);

                        newCampaigns.push({
                            competitor: competitor.name,
                            ad: ad
                        });
                    }
                }

                // Update last checked timestamp
                await db.pool.query(
                    'UPDATE competitors SET last_checked = NOW() WHERE id = $1',
                    [competitor.id]
                );

                console.log(`   ✅ Check complete (${ads.length} ads found)`);

            } catch (error) {
                console.error(`   ❌ Check failed: ${error.message}`);
            }

            await sleep(3000);
        }

        // Send alerts if new campaigns detected
        if (newCampaigns.length > 0) {
            console.log(`\n📧 Sending alerts for ${newCampaigns.length} new campaigns...`);
            await sendAlerts(newCampaigns);
        }

        // Summary
        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📊 Competitor Check Summary');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`Competitors checked: ${competitors.length}`);
        console.log(`New campaigns detected: ${newCampaigns.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        await hub.shutdown();

        return {
            success: true,
            competitorsChecked: competitors.length,
            newCampaigns: newCampaigns.length
        };

    } catch (error) {
        console.error('\n❌ Competitor check pipeline failed:', error);
        await hub.shutdown();
        throw error;
    }
}

async function sendAlerts(newCampaigns) {
    if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL_RECIPIENTS) {
        console.warn('⚠️  Email alerts not configured, skipping...');
        return;
    }

    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const recipients = process.env.ALERT_EMAIL_RECIPIENTS.split(',');

        for (const recipient of recipients) {
            await transporter.sendMail({
                from: process.env.ALERT_EMAIL_FROM || 'alerts@competitive-intel.com',
                to: recipient,
                subject: `🚨 ${newCampaigns.length} New Competitor Campaign(s) Detected`,
                html: generateAlertEmail(newCampaigns)
            });
        }

        console.log(`   ✅ Alerts sent to ${recipients.length} recipient(s)`);

    } catch (error) {
        console.error(`   ❌ Failed to send alerts: ${error.message}`);
    }
}

function generateAlertEmail(campaigns) {
    let html = `
        <h2>🚨 New Competitor Campaigns Detected</h2>
        <p>We've detected ${campaigns.length} new campaign(s) from your tracked competitors.</p>
    `;

    campaigns.forEach(({ competitor, ad }) => {
        html += `
            <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px;">
                <h3>${competitor}</h3>
                <p><strong>Headline:</strong> ${ad.headline}</p>
                <p><strong>Primary Text:</strong> ${ad.primaryText ? ad.primaryText.substring(0, 150) + '...' : 'N/A'}</p>
                <p><strong>CTA:</strong> ${ad.ctaType || 'N/A'}</p>
                <p><strong>Started:</strong> ${ad.startDate}</p>
                ${ad.creativeUrls && ad.creativeUrls.length > 0
                    ? `<img src="${ad.creativeUrls[0]}" alt="Ad creative" style="max-width: 300px;">`
                    : ''}
            </div>
        `;
    });

    html += `
        <p style="margin-top: 20px; color: #666;">
            <em>Powered by Competitive Intelligence System</em>
        </p>
    `;

    return html;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

if (require.main === module) {
    runCompetitorCheckPipeline()
        .then(result => {
            console.log('✅ Pipeline completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Pipeline failed:', error);
            process.exit(1);
        });
}

module.exports = runCompetitorCheckPipeline;

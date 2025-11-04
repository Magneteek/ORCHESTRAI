/**
 * Email Alert Agent
 *
 * Handles all email notifications for the competitive intelligence system
 * Features: Competitor alerts, performance reports, weekly digests
 */

const { EventEmitter } = require('events');
const nodemailer = require('nodemailer');

class EmailAlertAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'email-alert';
        this.isInitialized = false;

        this.config = {
            smtp: {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            },
            from: process.env.ALERT_EMAIL_FROM || 'alerts@competitive-intel.com',
            recipients: (process.env.ALERT_EMAIL_RECIPIENTS || '').split(',').filter(Boolean),
            enabled: process.env.ENABLE_EMAIL_ALERTS === 'true',
            ...config
        };

        this.transporter = null;
        this.stats = {
            sent: 0,
            failed: 0
        };
    }

    /**
     * Initialize the email agent
     */
    async initialize() {
        console.log(`📧 Initializing Email Alert Agent...`);

        if (!this.config.enabled) {
            console.warn(`⚠️  Email alerts disabled (ENABLE_EMAIL_ALERTS=false)`);
            this.isInitialized = false;
            return { success: false, reason: 'disabled' };
        }

        if (!this.config.smtp.host || !this.config.smtp.auth.user) {
            console.warn(`⚠️  Email not configured - alerts disabled`);
            console.warn(`   Configure SMTP_HOST, SMTP_USER, SMTP_PASS in .env`);
            this.isInitialized = false;
            return { success: false, reason: 'not_configured' };
        }

        try {
            // Create transporter
            this.transporter = nodemailer.createTransporter(this.config.smtp);

            // Verify connection
            await this.transporter.verify();

            this.isInitialized = true;
            console.log(`✅ Email Alert Agent initialized`);
            console.log(`   SMTP Host: ${this.config.smtp.host}`);
            console.log(`   Recipients: ${this.config.recipients.length}`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to initialize email: ${error.message}`);
            this.isInitialized = false;
            return { success: false, reason: error.message };
        }
    }

    /**
     * Send new competitor campaign alert
     */
    async sendCompetitorAlert(campaigns) {
        if (!this.isInitialized) {
            console.warn(`⚠️  Email not initialized, skipping alert`);
            return { success: false, reason: 'not_initialized' };
        }

        console.log(`📧 Sending competitor alert for ${campaigns.length} new campaign(s)...`);

        try {
            const html = this.generateCompetitorAlertEmail(campaigns);

            for (const recipient of this.config.recipients) {
                await this.transporter.sendMail({
                    from: this.config.from,
                    to: recipient,
                    subject: `🚨 ${campaigns.length} New Competitor Campaign(s) Detected`,
                    html
                });
            }

            this.stats.sent++;
            this.emit('alert-sent', { type: 'competitor', count: campaigns.length });
            console.log(`✅ Alert sent to ${this.config.recipients.length} recipient(s)`);

            return { success: true, recipients: this.config.recipients.length };

        } catch (error) {
            this.stats.failed++;
            this.emit('alert-failed', { type: 'competitor', error: error.message });
            console.error(`❌ Failed to send alert: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send weekly performance digest
     */
    async sendWeeklyDigest(stats) {
        if (!this.isInitialized) return { success: false };

        console.log(`📧 Sending weekly digest...`);

        try {
            const html = this.generateWeeklyDigestEmail(stats);

            for (const recipient of this.config.recipients) {
                await this.transporter.sendMail({
                    from: this.config.from,
                    to: recipient,
                    subject: `📊 Weekly Competitive Intelligence Digest`,
                    html
                });
            }

            this.stats.sent++;
            this.emit('alert-sent', { type: 'digest' });
            console.log(`✅ Weekly digest sent`);

            return { success: true };

        } catch (error) {
            this.stats.failed++;
            console.error(`❌ Failed to send digest: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send high-performer alert
     */
    async sendHighPerformerAlert(ad) {
        if (!this.isInitialized) return { success: false };

        console.log(`📧 Sending high-performer alert for ad ${ad.id}...`);

        try {
            const html = this.generateHighPerformerEmail(ad);

            for (const recipient of this.config.recipients) {
                await this.transporter.sendMail({
                    from: this.config.from,
                    to: recipient,
                    subject: `⭐ High-Performing Ad Detected (Score: ${ad.performanceScore})`,
                    html
                });
            }

            this.stats.sent++;
            console.log(`✅ High-performer alert sent`);

            return { success: true };

        } catch (error) {
            this.stats.failed++;
            console.error(`❌ Failed to send alert: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate competitor alert email HTML
     */
    generateCompetitorAlertEmail(campaigns) {
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .campaign { border: 1px solid #e5e7eb; padding: 15px; margin: 15px 0; border-radius: 8px; }
                    .campaign h3 { margin-top: 0; color: #1f2937; }
                    .creative { max-width: 400px; border-radius: 4px; margin-top: 10px; }
                    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🚨 New Competitor Campaigns</h1>
                </div>
                <div class="content">
                    <p>We've detected <strong>${campaigns.length}</strong> new campaign(s) from your tracked competitors:</p>
        `;

        campaigns.forEach(({ competitor, ad }) => {
            html += `
                <div class="campaign">
                    <h3>${competitor}</h3>
                    <p><strong>Headline:</strong> ${ad.headline}</p>
                    <p><strong>Primary Text:</strong> ${ad.primaryText ? ad.primaryText.substring(0, 200) + '...' : 'N/A'}</p>
                    <p><strong>CTA:</strong> ${ad.ctaType || 'N/A'}</p>
                    <p><strong>Started:</strong> ${new Date(ad.startDate).toLocaleDateString()}</p>
                    <p><strong>Performance Score:</strong> ${ad.performanceScore || 'Calculating...'}/100</p>
                    ${ad.creativeUrls && ad.creativeUrls.length > 0
                        ? `<img src="${ad.creativeUrls[0]}" alt="Ad creative" class="creative">`
                        : ''}
                </div>
            `;
        });

        html += `
                    <p style="margin-top: 30px;">
                        <a href="${process.env.DASHBOARD_URL || 'http://localhost:3000'}"
                           style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Full Analysis
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>Powered by Competitive Intelligence System</p>
                    <p><a href="#">Unsubscribe</a> | <a href="#">Manage Alerts</a></p>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    /**
     * Generate weekly digest email HTML
     */
    generateWeeklyDigestEmail(stats) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .stat-box { border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px; }
                    .stat-number { font-size: 36px; font-weight: bold; color: #2563eb; }
                    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>📊 Weekly Competitive Intelligence Digest</h1>
                </div>
                <div class="content">
                    <p>Here's your weekly summary of competitive intelligence activities:</p>

                    <div class="stat-box">
                        <div class="stat-number">${stats.adsCollected || 0}</div>
                        <div>New Ads Collected</div>
                    </div>

                    <div class="stat-box">
                        <div class="stat-number">${stats.adsAnalyzed || 0}</div>
                        <div>Ads Analyzed with AI</div>
                    </div>

                    <div class="stat-box">
                        <div class="stat-number">${stats.topPerformers || 0}</div>
                        <div>High-Performing Ads (Score ≥ 80)</div>
                    </div>

                    <div class="stat-box">
                        <div class="stat-number">${stats.templatesGenerated || 0}</div>
                        <div>Launch-Ready Templates Generated</div>
                    </div>

                    <p style="margin-top: 30px;">
                        <a href="${process.env.DASHBOARD_URL || 'http://localhost:3000'}"
                           style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            View Dashboard
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>Powered by Competitive Intelligence System</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Generate high-performer alert email HTML
     */
    generateHighPerformerEmail(ad) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; }
                    .ad-details { border: 1px solid #e5e7eb; padding: 20px; margin: 15px 0; border-radius: 8px; }
                    .score { font-size: 48px; font-weight: bold; color: #f59e0b; text-align: center; }
                    .creative { max-width: 500px; border-radius: 4px; margin-top: 15px; }
                    .footer { background: #f3f4f6; padding: 15px; text-align: center; color: #6b7280; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>⭐ High-Performing Ad Detected</h1>
                </div>
                <div class="content">
                    <div class="score">${ad.performanceScore}/100</div>

                    <div class="ad-details">
                        <h3>${ad.advertiserName}</h3>
                        <p><strong>Headline:</strong> ${ad.headline}</p>
                        <p><strong>Primary Text:</strong> ${ad.primaryText ? ad.primaryText.substring(0, 300) + '...' : 'N/A'}</p>
                        <p><strong>CTA:</strong> ${ad.ctaType || 'N/A'}</p>
                        <p><strong>Industry:</strong> ${ad.industry}</p>
                        <p><strong>Running Since:</strong> ${new Date(ad.startDate).toLocaleDateString()}</p>
                        ${ad.creativeUrls && ad.creativeUrls.length > 0
                            ? `<img src="${ad.creativeUrls[0]}" alt="Ad creative" class="creative">`
                            : ''}
                    </div>

                    <p><strong>Why this ad is performing well:</strong></p>
                    <ul>
                        <li>Running for ${Math.floor((Date.now() - new Date(ad.startDate).getTime()) / (1000 * 60 * 60 * 24))} days (longevity indicator)</li>
                        <li>From verified advertiser (quality signal)</li>
                        <li>Strong keyword relevance in industry</li>
                    </ul>

                    <p style="margin-top: 30px;">
                        <a href="${process.env.DASHBOARD_URL}/ads/${ad.id}"
                           style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Analyze This Ad
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>Powered by Competitive Intelligence System</p>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Get email statistics
     */
    getStats() {
        return {
            ...this.stats,
            successRate: this.stats.sent > 0
                ? ((this.stats.sent / (this.stats.sent + this.stats.failed)) * 100).toFixed(1)
                : 0
        };
    }

    /**
     * Shutdown agent
     */
    async shutdown() {
        console.log(`🛑 Shutting down Email Alert Agent...`);

        if (this.transporter) {
            this.transporter.close();
        }

        const stats = this.getStats();
        console.log(`📊 Email Statistics:`);
        console.log(`   Sent: ${stats.sent}`);
        console.log(`   Failed: ${stats.failed}`);
        console.log(`   Success rate: ${stats.successRate}%`);

        this.isInitialized = false;
        console.log(`✅ Email Alert Agent shutdown complete`);
    }
}

module.exports = EmailAlertAgent;

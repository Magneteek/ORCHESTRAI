/**
 * Alert Manager Agent
 * Manages notifications and alerts for reputation intelligence system
 * Handles email, webhook, and dashboard notifications
 */

const { EventEmitter } = require('events');

class AlertManagerAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'alert-manager';
        this.isInitialized = false;
        this.config = null;
        this.alertQueue = [];
        this.sentAlerts = new Map();
        this.alertChannels = new Map();
    }

    async initialize(config) {
        try {
            this.config = config;
            this.setupAlertChannels();
            this.isInitialized = true;
            console.log(`✅ Alert Manager Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Alert Manager Agent:`, error);
            throw error;
        }
    }

    setupAlertChannels() {
        // Email channel
        this.alertChannels.set('email', {
            type: 'email',
            enabled: true,
            config: {
                smtp: process.env.SMTP_HOST || 'localhost',
                port: process.env.SMTP_PORT || 587,
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            }
        });

        // Webhook channel
        this.alertChannels.set('webhook', {
            type: 'webhook',
            enabled: true,
            config: {
                url: process.env.WEBHOOK_URL,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WEBHOOK_TOKEN}`
                }
            }
        });

        // Dashboard channel (real-time notifications)
        this.alertChannels.set('dashboard', {
            type: 'dashboard',
            enabled: true,
            config: {
                socketNamespace: '/reputation-alerts'
            }
        });

        // SMS channel (for critical alerts)
        this.alertChannels.set('sms', {
            type: 'sms',
            enabled: false,
            config: {
                provider: 'twilio',
                accountSid: process.env.TWILIO_ACCOUNT_SID,
                authToken: process.env.TWILIO_AUTH_TOKEN,
                fromNumber: process.env.TWILIO_FROM_NUMBER
            }
        });

        console.log(`📢 Alert channels configured: ${Array.from(this.alertChannels.keys()).join(', ')}`);
    }

    async sendAlert(alertData) {
        try {
            console.log(`🚨 Processing alert: ${alertData.type} - ${alertData.level}`);

            const alert = {
                id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: new Date(),
                ...alertData
            };

            // Check for duplicate alerts (within last hour)
            const duplicateKey = this.generateDuplicateKey(alert);
            const lastSent = this.sentAlerts.get(duplicateKey);
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            if (lastSent && lastSent > oneHourAgo) {
                console.log(`⚠️ Skipping duplicate alert: ${alert.type}`);
                return { success: true, skipped: true, reason: 'duplicate' };
            }

            // Format alert for different channels
            const formattedAlert = this.formatAlert(alert);

            // Send to appropriate channels based on severity
            const channels = this.selectChannelsForAlert(alert);
            const sendResults = [];

            for (const channelName of channels) {
                try {
                    const result = await this.sendToChannel(channelName, formattedAlert);
                    sendResults.push({ channel: channelName, ...result });
                } catch (error) {
                    console.error(`❌ Failed to send alert to ${channelName}:`, error);
                    sendResults.push({
                        channel: channelName,
                        success: false,
                        error: error.message
                    });
                }
            }

            // Record alert as sent
            this.sentAlerts.set(duplicateKey, new Date());

            // Clean up old alert records
            this.cleanupOldAlerts();

            console.log(`✅ Alert sent: ${alert.id} to ${channels.length} channels`);

            return {
                success: true,
                alertId: alert.id,
                channels: sendResults,
                timestamp: alert.timestamp
            };

        } catch (error) {
            console.error(`❌ Failed to send alert:`, error);
            throw error;
        }
    }

    generateDuplicateKey(alert) {
        // Create a key to identify duplicate alerts
        const keyComponents = [
            alert.type,
            alert.level,
            alert.businessId || 'global',
            alert.complaintType || 'general'
        ];
        return keyComponents.join('_');
    }

    formatAlert(alert) {
        const baseAlert = {
            id: alert.id,
            timestamp: alert.timestamp,
            type: alert.type,
            level: alert.level,
            title: this.generateAlertTitle(alert),
            message: this.generateAlertMessage(alert),
            data: alert
        };

        return {
            email: this.formatEmailAlert(baseAlert),
            webhook: this.formatWebhookAlert(baseAlert),
            dashboard: this.formatDashboardAlert(baseAlert),
            sms: this.formatSMSAlert(baseAlert)
        };
    }

    generateAlertTitle(alert) {
        switch (alert.type) {
            case 'reputation_alert':
                return `🚨 Reputation Alert - ${alert.level.toUpperCase()}`;
            case 'business_critical_risk':
                return `⚠️ Business at Critical Risk: ${alert.businessName}`;
            case 'new_complaint_type':
                return `🆕 New Complaint Type Detected: ${alert.complaintType}`;
            case 'volume_spike':
                return `📈 Negative Review Volume Spike`;
            case 'severity_increase':
                return `📊 Review Severity Increase`;
            default:
                return `🔔 Reputation Intelligence Alert`;
        }
    }

    generateAlertMessage(alert) {
        switch (alert.type) {
            case 'reputation_alert':
                return `Reputation monitoring has detected ${alert.level} level issues. Summary: ${alert.summary}`;

            case 'business_critical_risk':
                return `Business "${alert.businessName}" is at critical reputation risk. Risk factors: ${alert.riskFactors?.join(', ')}`;

            case 'new_complaint_type':
                return `New complaint type "${alert.complaintType}" detected across ${alert.affectedBusinesses} businesses`;

            case 'volume_spike':
                return `Significant increase in negative reviews detected for ${alert.businessName}`;

            case 'severity_increase':
                return `Review severity has increased significantly for ${alert.businessName}`;

            default:
                return `Reputation intelligence system has detected an issue requiring attention`;
        }
    }

    formatEmailAlert(baseAlert) {
        return {
            to: process.env.ALERT_EMAIL_RECIPIENTS?.split(',') || ['admin@example.com'],
            from: process.env.ALERT_EMAIL_FROM || 'reputation@orchestrai.com',
            subject: baseAlert.title,
            html: this.generateEmailHTML(baseAlert),
            text: this.generateEmailText(baseAlert)
        };
    }

    generateEmailHTML(alert) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: ${this.getLevelColor(alert.data.level)}; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">${alert.title}</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">
                        ${alert.timestamp.toLocaleString()}
                    </p>
                </div>

                <div style="padding: 20px; background: #f9f9f9;">
                    <h2>Alert Details</h2>
                    <p style="font-size: 16px; line-height: 1.5;">${alert.message}</p>

                    ${this.generateEmailDetails(alert.data)}
                </div>

                <div style="padding: 20px; text-align: center; background: #333; color: white;">
                    <p style="margin: 0;">
                        ORCHESTRAI Reputation Intelligence System
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.7;">
                        Alert ID: ${alert.id}
                    </p>
                </div>
            </div>
        `;
    }

    generateEmailDetails(alertData) {
        let details = '';

        if (alertData.businessName) {
            details += `<p><strong>Business:</strong> ${alertData.businessName}</p>`;
        }

        if (alertData.summary) {
            details += `<p><strong>Summary:</strong> ${alertData.summary}</p>`;
        }

        if (alertData.riskFactors) {
            details += `<p><strong>Risk Factors:</strong></p><ul>`;
            alertData.riskFactors.forEach(factor => {
                details += `<li>${factor}</li>`;
            });
            details += `</ul>`;
        }

        if (alertData.trends) {
            details += `<p><strong>Trend Analysis:</strong></p>`;
            if (alertData.trends.businessTrends?.length > 0) {
                details += `<p>• ${alertData.trends.businessTrends.length} businesses showing negative trends</p>`;
            }
            if (alertData.trends.complaintTrends?.length > 0) {
                details += `<p>• ${alertData.trends.complaintTrends.length} complaint types trending</p>`;
            }
        }

        return details;
    }

    generateEmailText(alert) {
        return `
${alert.title}
${alert.timestamp.toLocaleString()}

${alert.message}

${this.generateTextDetails(alert.data)}

---
ORCHESTRAI Reputation Intelligence System
Alert ID: ${alert.id}
        `.trim();
    }

    generateTextDetails(alertData) {
        let details = '';

        if (alertData.businessName) {
            details += `Business: ${alertData.businessName}\n`;
        }

        if (alertData.summary) {
            details += `Summary: ${alertData.summary}\n`;
        }

        if (alertData.riskFactors) {
            details += `Risk Factors:\n`;
            alertData.riskFactors.forEach(factor => {
                details += `• ${factor}\n`;
            });
        }

        return details;
    }

    formatWebhookAlert(baseAlert) {
        return {
            alert_id: baseAlert.id,
            timestamp: baseAlert.timestamp.toISOString(),
            type: baseAlert.data.type,
            level: baseAlert.data.level,
            title: baseAlert.title,
            message: baseAlert.message,
            data: baseAlert.data,
            source: 'orchestrai_reputation_intelligence'
        };
    }

    formatDashboardAlert(baseAlert) {
        return {
            id: baseAlert.id,
            timestamp: baseAlert.timestamp,
            type: baseAlert.data.type,
            level: baseAlert.data.level,
            title: baseAlert.title,
            message: baseAlert.message,
            icon: this.getAlertIcon(baseAlert.data.type),
            color: this.getLevelColor(baseAlert.data.level),
            data: baseAlert.data,
            autoHide: baseAlert.data.level === 'medium' ? 30000 : false // Auto-hide medium alerts after 30s
        };
    }

    formatSMSAlert(baseAlert) {
        const shortMessage = `${baseAlert.title}: ${baseAlert.message}`;
        return {
            to: process.env.ALERT_SMS_RECIPIENTS?.split(',') || [],
            from: process.env.TWILIO_FROM_NUMBER,
            body: shortMessage.length > 160 ? shortMessage.substring(0, 157) + '...' : shortMessage
        };
    }

    selectChannelsForAlert(alert) {
        const channels = ['dashboard']; // Always send to dashboard

        switch (alert.level) {
            case 'critical':
                channels.push('email', 'webhook');
                if (this.alertChannels.get('sms')?.enabled) {
                    channels.push('sms');
                }
                break;
            case 'high':
                channels.push('email', 'webhook');
                break;
            case 'medium':
                channels.push('webhook');
                break;
        }

        return channels.filter(channel => this.alertChannels.get(channel)?.enabled);
    }

    async sendToChannel(channelName, formattedAlert) {
        const channel = this.alertChannels.get(channelName);
        if (!channel?.enabled) {
            throw new Error(`Channel ${channelName} is not enabled`);
        }

        switch (channelName) {
            case 'email':
                return await this.sendEmailAlert(formattedAlert.email, channel.config);
            case 'webhook':
                return await this.sendWebhookAlert(formattedAlert.webhook, channel.config);
            case 'dashboard':
                return await this.sendDashboardAlert(formattedAlert.dashboard, channel.config);
            case 'sms':
                return await this.sendSMSAlert(formattedAlert.sms, channel.config);
            default:
                throw new Error(`Unknown channel: ${channelName}`);
        }
    }

    async sendEmailAlert(emailData, config) {
        try {
            // In production, this would use a real email service
            console.log(`📧 Email alert sent to: ${emailData.to.join(', ')}`);
            console.log(`Subject: ${emailData.subject}`);

            // Mock email sending
            return { success: true, method: 'email', recipients: emailData.to.length };
        } catch (error) {
            throw new Error(`Email send failed: ${error.message}`);
        }
    }

    async sendWebhookAlert(webhookData, config) {
        try {
            if (!config.url) {
                return { success: true, method: 'webhook', skipped: true, reason: 'no_url_configured' };
            }

            // In production, this would make a real HTTP request
            console.log(`🔗 Webhook alert sent to: ${config.url}`);
            console.log(`Payload: ${JSON.stringify(webhookData, null, 2)}`);

            // Mock webhook sending
            return { success: true, method: 'webhook', url: config.url };
        } catch (error) {
            throw new Error(`Webhook send failed: ${error.message}`);
        }
    }

    async sendDashboardAlert(dashboardData, config) {
        try {
            // In production, this would emit to a WebSocket
            console.log(`📱 Dashboard alert: ${dashboardData.title}`);

            // Emit for any listening dashboard clients
            this.emit('dashboard-alert', dashboardData);

            return { success: true, method: 'dashboard' };
        } catch (error) {
            throw new Error(`Dashboard send failed: ${error.message}`);
        }
    }

    async sendSMSAlert(smsData, config) {
        try {
            if (!config.accountSid || smsData.to.length === 0) {
                return { success: true, method: 'sms', skipped: true, reason: 'not_configured' };
            }

            console.log(`📱 SMS alert sent to: ${smsData.to.join(', ')}`);
            console.log(`Message: ${smsData.body}`);

            // Mock SMS sending
            return { success: true, method: 'sms', recipients: smsData.to.length };
        } catch (error) {
            throw new Error(`SMS send failed: ${error.message}`);
        }
    }

    getLevelColor(level) {
        switch (level) {
            case 'critical': return '#dc3545';
            case 'high': return '#fd7e14';
            case 'medium': return '#ffc107';
            case 'low': return '#28a745';
            default: return '#6c757d';
        }
    }

    getAlertIcon(type) {
        switch (type) {
            case 'reputation_alert': return '🚨';
            case 'business_critical_risk': return '⚠️';
            case 'new_complaint_type': return '🆕';
            case 'volume_spike': return '📈';
            case 'severity_increase': return '📊';
            default: return '🔔';
        }
    }

    cleanupOldAlerts() {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        for (const [key, timestamp] of this.sentAlerts.entries()) {
            if (timestamp < twentyFourHoursAgo) {
                this.sentAlerts.delete(key);
            }
        }
    }

    getAlertStatus() {
        return {
            queueLength: this.alertQueue.length,
            sentAlertsCount: this.sentAlerts.size,
            enabledChannels: Array.from(this.alertChannels.entries())
                .filter(([_, channel]) => channel.enabled)
                .map(([name, _]) => name),
            lastCleanup: new Date()
        };
    }

    async testAlertChannel(channelName) {
        try {
            const testAlert = {
                id: `test_${Date.now()}`,
                timestamp: new Date(),
                type: 'test',
                level: 'medium',
                title: 'Test Alert',
                message: 'This is a test alert from ORCHESTRAI Reputation Intelligence',
                businessName: 'Test Business'
            };

            const formattedAlert = this.formatAlert(testAlert);
            const result = await this.sendToChannel(channelName, formattedAlert);

            return { success: true, channel: channelName, result };
        } catch (error) {
            return { success: false, channel: channelName, error: error.message };
        }
    }

    async shutdown() {
        console.log(`🔄 Shutting down Alert Manager Agent...`);
        this.sentAlerts.clear();
        this.alertQueue = [];
        this.isInitialized = false;
    }
}

module.exports = new AlertManagerAgent();
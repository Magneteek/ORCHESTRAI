# 🔍 ORCHESTRAI Reputation Intelligence System

**Advanced Google Business Profile Negative Review Monitoring & Analysis**

A comprehensive system for discovering, scraping, analyzing, and monitoring negative reviews (1-3 stars, <14 days) from Google Business Profiles using modern web scraping, sentiment analysis, and real-time alerting.

## 🚀 Features

### 🔍 **Business Discovery Engine**
- **DataForSEO Integration**: Leverage existing ORCHESTRAI DataForSEO MCP server
- **Smart Filtering**: Find businesses with negative reviews and low ratings
- **Geographic Targeting**: Search by location, category, and proximity
- **Risk Scoring**: Automatic calculation of reputation risk scores

### 💼 **Contact Enrichment (Apollo.io)**
- **Organization Enrichment**: Company details, employee count, revenue, tech stack
- **Decision-Maker Discovery**: Names, titles, emails, phone numbers, LinkedIn profiles
- **Smart Targeting**: Industry-specific decision-maker profiles (dental, medical, restaurant)
- **Quality Scoring**: 0-100 enrichment quality assessment
- **Best Contact Selection**: Automatic identification of primary outreach contact
- **Bulk Enrichment**: Process multiple businesses efficiently with caching

### 🕷️ **Advanced Web Scraping**
- **Playwright-Powered**: Modern, reliable scraping with anti-detection
- **Smart Filtering**: Extract only 1-3 star reviews from last 14 days
- **Proxy Support**: Built-in proxy rotation for scale and reliability
- **Rate Limiting**: Respectful scraping with configurable delays

### 🧠 **Intelligent Analysis**
- **Sentiment Analysis**: Advanced NLP for complaint categorization
- **Severity Scoring**: 0-10 scale severity assessment
- **Theme Extraction**: Identify common complaint patterns
- **Urgency Assessment**: Critical, high, medium, low priority classification

### 📈 **Trend Detection**
- **Volume Monitoring**: Detect spikes in negative review volume
- **Severity Tracking**: Monitor changes in review severity over time
- **Emerging Issues**: Identify new complaint types spreading across businesses
- **Business Risk Assessment**: Multi-factor risk evaluation

### 🚨 **Multi-Channel Alerting**
- **Email Notifications**: HTML and text format alerts
- **Webhook Integration**: Real-time API notifications
- **Dashboard Alerts**: Live WebSocket-based notifications
- **SMS Alerts**: Critical alerts via Twilio (configurable)

### 📊 **Advanced Export Capabilities**
- **Multiple Formats**: JSON, CSV, Excel, PDF reports
- **Filtering Options**: Date range, severity, business, category filters
- **Summary Analytics**: Automated insights and statistics
- **Scheduled Reports**: Automated report generation

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Redis**: For caching and pipeline sharing (optional)
- **ORCHESTRAI**: Integration with existing ORCHESTRAI system

## 🛠️ Installation

### 1. **Install Dependencies**
```bash
cd orchestrai-domains/reputation-intelligence
npm run setup
```

### 2. **Configure Environment**

Create a `.env` file:

```env
# DataForSEO API (if using direct API)
DATAFORSEO_API_LOGIN=your_login
DATAFORSEO_API_PASSWORD=your_password

# Apollo.io Contact Enrichment
APOLLO_API_KEY=your_apollo_io_api_key_here

# Email Alerts
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ALERT_EMAIL_RECIPIENTS=admin@company.com,manager@company.com
ALERT_EMAIL_FROM=reputation@company.com

# Webhook Alerts
WEBHOOK_URL=https://your-webhook-endpoint.com/alerts
WEBHOOK_TOKEN=your_webhook_token

# SMS Alerts (optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_FROM_NUMBER=+1234567890
ALERT_SMS_RECIPIENTS=+1234567890,+0987654321

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 3. **Install Playwright Browser**
```bash
npx playwright install chromium
```

## 🎯 Quick Start

### **Run the Demo**
```bash
npm run demo
```

### **Basic Usage**
```javascript
const ReputationIntelligenceHub = require('./reputation-intelligence-domain-hub');

async function monitorReviews() {
    const hub = new ReputationIntelligenceHub();

    // Initialize system
    await hub.initialize();

    // Start monitoring dental practices in Amsterdam
    const result = await hub.startMonitoring({
        keyword: 'tandarts',
        location: 'Amsterdam, Netherlands',
        maxRating: 3,
        limit: 20
    });

    console.log(`Monitoring started: ${result.monitoringId}`);
}
```

## 📚 API Reference

### **ReputationIntelligenceDomainHub**

#### `initialize()`
Initialize the reputation intelligence system and all agents.

#### `startMonitoring(searchCriteria)`
Start monitoring businesses for negative reviews.

**Parameters:**
- `keyword` (string): Search keyword (e.g., 'tandarts', 'restaurant')
- `location` (string): Geographic location (e.g., 'Amsterdam, Netherlands')
- `maxRating` (number): Maximum rating to include (default: 3)
- `limit` (number): Maximum businesses to monitor (default: 50)

**Returns:** `{ success: boolean, monitoringId: string, initialResults: object }`

#### `getReputationReport(businessId)`
Generate comprehensive reputation report for a business.

#### `exportNegativeReviews(criteria, format)`
Export filtered negative reviews data.

**Formats:** `'json'`, `'csv'`, `'excel'`, `'pdf'`

#### `stopMonitoring(monitoringId)`
Stop active monitoring task.

### **Export Criteria Options**
```javascript
const exportCriteria = {
    dateFrom: new Date('2024-01-01'),      // Start date
    dateTo: new Date(),                     // End date
    maxRating: 3,                          // Maximum rating (1-5)
    minSeverity: 6,                        // Minimum severity (0-10)
    businessIds: ['123', '456'],           // Specific businesses
    categories: ['Dental clinic'],         // Business categories
    complaintTypes: ['service_quality'],   // Complaint types
    urgencyLevels: ['high', 'critical'],   // Urgency levels
    location: 'Amsterdam'                  // Geographic filter
};
```

## 🔧 Configuration

### **System Configuration**
```javascript
const config = {
    maxConcurrentScrapes: 5,      // Concurrent scraping limit
    reviewAnalysisDepth: 100,     // Max reviews per business
    negativeRatingThreshold: 3,   // 1-3 star threshold
    recentReviewDays: 14,         // Review age limit
    proxyRotationEnabled: true,   // Enable proxy rotation
    rateLimitDelay: 2000         // Delay between requests (ms)
};
```

### **Alert Configuration**
Alerts are automatically sent based on severity:

- **Critical**: Email + Webhook + SMS + Dashboard
- **High**: Email + Webhook + Dashboard
- **Medium**: Webhook + Dashboard
- **Low**: Dashboard only

## 📊 Monitoring Dashboard

The system emits real-time events for dashboard integration:

```javascript
hub.on('businesses-discovered', (businesses) => {
    // Handle discovered businesses
});

hub.on('negative-reviews-detected', (reviews) => {
    // Handle new negative reviews
});

hub.on('negative-trend-alert', (trendData) => {
    // Handle reputation alerts
});

hub.on('export-completed', (exportInfo) => {
    // Handle completed exports
});
```

## 🚨 Alert Types

### **Business Critical Risk**
- 2+ critical urgency reviews
- 3+ high urgency reviews
- 5+ negative reviews in 7 days
- Average severity ≥8.0

### **New Complaint Types**
- New complaint category with 3+ mentions
- Spreading across multiple businesses

### **Volume Spikes**
- 50%+ increase in negative review volume
- 100%+ increase triggers critical alert

### **Severity Increases**
- 1.5+ point increase in average severity
- 2.5+ point increase triggers critical alert

## 📈 Analytics & Insights

### **Business Risk Factors**
- Review volume and frequency
- Severity score trends
- Complaint type diversity
- Urgency level distribution
- Geographic concentration

### **Complaint Categories**
- `service_quality`: Poor service, delays, attitude
- `staff_behavior`: Rude staff, unprofessional behavior
- `cleanliness`: Hygiene, sanitation, facility issues
- `pricing`: Cost concerns, billing disputes
- `waiting_time`: Appointment delays, scheduling
- `communication`: Information, language barriers
- `results`: Treatment outcomes, effectiveness
- `facility`: Location, parking, equipment

### **Trend Analysis**
- Weekly/monthly trend comparison
- Seasonal pattern detection
- Competitive benchmarking
- Market sentiment shifts

## 🔒 Compliance & Ethics

### **Data Protection**
- Reviews are public data only
- No personal data storage beyond public content
- GDPR-compliant data handling
- Automatic data cleanup (7-day retention)

### **Respectful Scraping**
- Rate limiting (2-second delays)
- Proxy rotation to distribute load
- Anti-detection measures for reliability
- Follows robots.txt guidelines

### **Usage Guidelines**
- **Defensive Use Only**: Monitor your own reputation
- **Competitive Analysis**: Market research within legal bounds
- **Crisis Management**: Early warning system for reputation issues
- **Customer Service**: Proactive issue resolution

## 🧪 Testing

### **Run Unit Tests**
```bash
npm run test:unit
```

### **Run Integration Tests**
```bash
npm run test:integration
```

### **Test Alert Channels**
```javascript
const alertManager = hub.agents.get('alert-manager');
await alertManager.testAlertChannel('email');
await alertManager.testAlertChannel('webhook');
```

## 📝 Example Use Cases

### **1. Dental Practice Monitoring**
```javascript
await hub.startMonitoring({
    keyword: 'tandarts',
    location: 'Netherlands',
    maxRating: 3,
    limit: 100
});
```

### **2. Restaurant Reputation Tracking**
```javascript
await hub.startMonitoring({
    keyword: 'restaurant',
    location: 'Amsterdam, Netherlands',
    maxRating: 2,
    categories: ['Restaurant', 'Fast food']
});
```

### **3. Medical Practice Analysis**
```javascript
await hub.startMonitoring({
    keyword: 'medical clinic',
    location: 'Utrecht, Netherlands',
    maxRating: 3,
    urgencyLevels: ['high', 'critical']
});
```

## 🚀 Deployment

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npx playwright install chromium
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### **Environment Variables**
Required for production deployment:
- DataForSEO API credentials
- SMTP configuration for email alerts
- Webhook endpoints for integrations
- Redis connection for persistence

## 🤝 Integration

### **ORCHESTRAI Integration**
This system integrates seamlessly with the broader ORCHESTRAI ecosystem:

- **DataForSEO MCP Server**: Business discovery
- **Crystalline Memory**: Persistent storage
- **Pipeline Sharing**: Agent coordination
- **Geometric Orchestration**: Efficient routing

### **External Integrations**
- **CRM Systems**: Webhook notifications
- **Support Platforms**: Alert routing
- **Analytics Dashboards**: Data exports
- **Communication Tools**: Slack, Teams, Discord

## 📞 Support

### **Documentation**
- [API Reference](docs/api.md)
- [Configuration Guide](docs/config.md)
- [Troubleshooting](docs/troubleshooting.md)

### **Issues & Bugs**
Report issues at: [GitHub Issues](https://github.com/orchestrai/reputation-intelligence/issues)

### **Contributing**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Playwright Team**: Modern web automation framework
- **DataForSEO**: Business data API integration
- **ORCHESTRAI Community**: System architecture and design
- **Open Source Contributors**: Various libraries and tools

---

**Built with ❤️ by the ORCHESTRAI Team**

*Reputation Intelligence System - Monitor, Analyze, Protect*
# 🚀 Apollo.io Contact Enrichment Integration

## Overview

The Apollo.io Contact Enrichment integration adds powerful B2B data enrichment capabilities to the ORCHESTRAI Reputation Intelligence System. This enables automatic discovery of decision-maker contact information for businesses with negative reviews.

## Features

- **Organization Enrichment**: Company details, employee count, revenue, tech stack
- **Decision-Maker Discovery**: Names, titles, emails, phone numbers
- **Quality Scoring**: 0-100 quality assessment for each enrichment
- **Smart Targeting**: Industry-specific decision-maker profiles
- **Automatic Integration**: Seamless workflow with business discovery

## Quick Start

### 1. Configure API Key

Add to your `.env` file:
```env
APOLLO_API_KEY=your_apollo_io_api_key_here
```

### 2. Basic Usage

```javascript
const ReputationIntelligenceHub = require('./reputation-intelligence-domain-hub');

async function example() {
    const hub = new ReputationIntelligenceHub();
    await hub.initialize();

    // Enrichment happens automatically during monitoring
    const result = await hub.startMonitoring({
        keyword: 'tandarts',
        location: 'Amsterdam, Netherlands',
        maxRating: 3,
        limit: 20
    });

    // Get enrichment statistics
    const stats = hub.getEnrichmentStats();
    console.log('Enriched:', stats.totalEnriched);
    console.log('Decision makers found:', stats.decisionMakersFound);
}
```

## Testing

```bash
npm run test:apollo
```

## API Reference

See full documentation: [Main README](../README.md)

## Decision-Maker Profiles

The system uses industry-specific profiles:

- **Dental**: Owner, Practice Manager, Director
- **Medical**: Medical Director, Office Manager, Administrator
- **Restaurant**: Owner, General Manager, Operations Manager
- **Default**: Owner, CEO, Managing Director

## Quality Scoring

- **90-100**: Excellent - Complete data, multiple contacts
- **70-89**: Good - Most data present
- **50-69**: Fair - Basic data
- **<50**: Poor - Incomplete data

## Troubleshooting

### API Key Issues
Ensure `APOLLO_API_KEY` is set in `.env` file

### No Domain Found
Ensure businesses have `website`, `url`, or `domain` fields

### Health Check Failed
- Verify API key
- Check network connectivity
- Verify Apollo.io service status

## Resources

- Apollo.io API: https://docs.apollo.io/
- ORCHESTRAI Documentation: ../README.md
- GitHub Issues: Report bugs and feature requests

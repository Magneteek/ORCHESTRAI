/**
 * Analytics Routes
 *
 * Provide insights and analytics on ad data
 */

const express = require('express');
const router = express.Router();

// GET /api/analytics/trends - Get industry trends
router.get('/trends', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const { industry, days = 30 } = req.query;

        // Get ad volume trends
        const volumeQuery = `
            SELECT DATE(start_date) as date, COUNT(*) as ad_count
            FROM ads
            WHERE start_date >= NOW() - INTERVAL '${parseInt(days)} days'
            ${industry ? `AND industry = $1` : ''}
            GROUP BY DATE(start_date)
            ORDER BY date DESC
        `;

        const volumeResult = await db.pool.query(
            volumeQuery,
            industry ? [industry] : []
        );

        // Get top advertisers
        const advertisersQuery = `
            SELECT advertiser_name, COUNT(*) as ad_count, AVG(performance_score) as avg_score
            FROM ads
            WHERE start_date >= NOW() - INTERVAL '${parseInt(days)} days'
            ${industry ? `AND industry = $1` : ''}
            GROUP BY advertiser_name
            ORDER BY ad_count DESC
            LIMIT 10
        `;

        const advertisersResult = await db.pool.query(
            advertisersQuery,
            industry ? [industry] : []
        );

        // Get top CTAs
        const ctaQuery = `
            SELECT cta_type, COUNT(*) as usage_count
            FROM ads
            WHERE start_date >= NOW() - INTERVAL '${parseInt(days)} days'
            ${industry ? `AND industry = $1` : ''}
            GROUP BY cta_type
            ORDER BY usage_count DESC
        `;

        const ctaResult = await db.pool.query(
            ctaQuery,
            industry ? [industry] : []
        );

        res.json({
            success: true,
            data: {
                volumeTrends: volumeResult.rows,
                topAdvertisers: advertisersResult.rows,
                topCTAs: ctaResult.rows
            }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/analytics/performance - Performance distribution
router.get('/performance', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const { industry } = req.query;

        const query = `
            SELECT
                CASE
                    WHEN performance_score >= 90 THEN 'excellent'
                    WHEN performance_score >= 80 THEN 'good'
                    WHEN performance_score >= 60 THEN 'average'
                    ELSE 'poor'
                END as performance_tier,
                COUNT(*) as ad_count
            FROM ads
            ${industry ? 'WHERE industry = $1' : ''}
            GROUP BY performance_tier
            ORDER BY ad_count DESC
        `;

        const result = await db.pool.query(
            query,
            industry ? [industry] : []
        );

        res.json({
            success: true,
            data: { performanceDistribution: result.rows }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

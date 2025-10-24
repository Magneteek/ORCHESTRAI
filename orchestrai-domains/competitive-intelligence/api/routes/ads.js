/**
 * Ads Routes
 *
 * CRUD operations for Facebook/Instagram ads
 * Includes AI analysis and template generation
 */

const express = require('express');
const router = express.Router();

/**
 * GET /api/ads
 * List all ads with filtering and pagination
 */
router.get('/', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');

        const {
            industry,
            minScore,
            limit = 50,
            offset = 0,
            sortBy = 'performance_score',
            order = 'DESC'
        } = req.query;

        // Build query
        let query = 'SELECT * FROM ads WHERE 1=1';
        const params = [];

        if (industry) {
            params.push(industry);
            query += ` AND industry = $${params.length}`;
        }

        if (minScore) {
            params.push(parseInt(minScore));
            query += ` AND performance_score >= $${params.length}`;
        }

        // Add sorting
        query += ` ORDER BY ${sortBy} ${order}`;

        // Add pagination
        params.push(parseInt(limit), parseInt(offset));
        query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

        // Execute query
        const result = await db.pool.query(query, params);

        res.json({
            success: true,
            data: {
                ads: result.rows,
                total: result.rowCount,
                limit: parseInt(limit),
                offset: parseInt(offset)
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ads/top
 * Get top performing ads
 */
router.get('/top', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');

        const { limit = 10, industry } = req.query;

        let query = `
            SELECT * FROM ads
            WHERE performance_score >= 80
            ${industry ? 'AND industry = $1' : ''}
            ORDER BY performance_score DESC
            LIMIT ${industry ? '$2' : '$1'}
        `;

        const params = industry ? [industry, parseInt(limit)] : [parseInt(limit)];
        const result = await db.pool.query(query, params);

        res.json({
            success: true,
            data: {
                topPerformers: result.rows
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/ads/:id
 * Get single ad by ID
 */
router.get('/:id', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');
        const { id } = req.params;

        // Get ad
        const result = await db.pool.query(
            'SELECT * FROM ads WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AD_NOT_FOUND',
                    message: 'Ad not found'
                }
            });
        }

        // Get analysis if available
        const analysisResult = await db.pool.query(
            'SELECT * FROM ad_analysis WHERE ad_id = $1',
            [id]
        );

        const ad = result.rows[0];
        if (analysisResult.rows.length > 0) {
            ad.analysis = analysisResult.rows[0];
        }

        res.json({
            success: true,
            data: ad
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ads/:id/analyze
 * Trigger AI analysis on an ad
 */
router.post('/:id/analyze', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');
        const { id } = req.params;

        // Get ad
        const adResult = await db.pool.query(
            'SELECT * FROM ads WHERE id = $1',
            [id]
        );

        if (adResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'AD_NOT_FOUND',
                    message: 'Ad not found'
                }
            });
        }

        const ad = adResult.rows[0];

        // Run AI analysis with Claude Code agents
        const analysis = await domainHub.analyzeAdWithClaudeAgents(ad);

        // Save analysis
        await db.pool.query(`
            INSERT INTO ad_analysis (
                ad_id, hook, value_proposition, emotional_trigger,
                color_palette, layout_type, hook_pattern, cta_pattern,
                created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
            ON CONFLICT (ad_id) DO UPDATE SET
                hook = EXCLUDED.hook,
                value_proposition = EXCLUDED.value_proposition,
                emotional_trigger = EXCLUDED.emotional_trigger,
                color_palette = EXCLUDED.color_palette,
                layout_type = EXCLUDED.layout_type,
                hook_pattern = EXCLUDED.hook_pattern,
                cta_pattern = EXCLUDED.cta_pattern,
                updated_at = NOW()
        `, [
            id,
            analysis.hook,
            analysis.valueProposition,
            analysis.emotionalTrigger,
            JSON.stringify(analysis.colorPalette),
            analysis.layoutType,
            analysis.hookPattern,
            analysis.ctaPattern
        ]);

        res.json({
            success: true,
            data: {
                ad,
                analysis
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ads/:id/template
 * Generate launch-ready template from ad
 */
router.post('/:id/template', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const { id } = req.params;
        const {
            includeAbTestVariations = true,
            includeTargeting = true,
            includeBudgetStrategy = true
        } = req.body;

        const template = await domainHub.generateTemplate({
            adId: id,
            includeAbTestVariations,
            includeTargeting,
            includeBudgetStrategy
        });

        res.json({
            success: true,
            data: template
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/ads/search
 * Search ads by keyword or criteria
 */
router.post('/search', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');

        const {
            query,
            industry,
            minScore,
            dateFrom,
            dateTo,
            limit = 50
        } = req.body;

        let sqlQuery = `
            SELECT * FROM ads
            WHERE 1=1
        `;
        const params = [];

        // Full-text search on ad copy
        if (query) {
            params.push(query);
            sqlQuery += ` AND (
                headline ILIKE $${params.length} OR
                primary_text ILIKE $${params.length}
            )`;
        }

        if (industry) {
            params.push(industry);
            sqlQuery += ` AND industry = $${params.length}`;
        }

        if (minScore) {
            params.push(parseInt(minScore));
            sqlQuery += ` AND performance_score >= $${params.length}`;
        }

        if (dateFrom) {
            params.push(dateFrom);
            sqlQuery += ` AND start_date >= $${params.length}`;
        }

        if (dateTo) {
            params.push(dateTo);
            sqlQuery += ` AND start_date <= $${params.length}`;
        }

        params.push(parseInt(limit));
        sqlQuery += ` ORDER BY performance_score DESC LIMIT $${params.length}`;

        const result = await db.pool.query(sqlQuery, params);

        res.json({
            success: true,
            data: {
                results: result.rows,
                total: result.rowCount
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /api/ads/:id
 * Delete an ad (admin only)
 */
router.delete('/:id', async (req, res, next) => {
    try {
        // Check admin role
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Admin access required'
                }
            });
        }

        const domainHub = req.app.locals.domainHub;
        const db = domainHub.agents.get('database-coordinator');
        const { id } = req.params;

        await db.pool.query('DELETE FROM ads WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Ad deleted successfully'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;

/**
 * Templates Routes
 *
 * Access and manage generated ad templates
 */

const express = require('express');
const router = express.Router();

// GET /api/templates - List all templates
router.get('/', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const { industry, limit = 50 } = req.query;

        let query = 'SELECT * FROM templates WHERE 1=1';
        const params = [];

        if (industry) {
            params.push(industry);
            query += ` AND industry = $${params.length}`;
        }

        params.push(parseInt(limit));
        query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

        const result = await db.pool.query(query, params);

        res.json({
            success: true,
            data: { templates: result.rows }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/templates/:id - Get specific template
router.get('/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const result = await db.pool.query(
            'SELECT * FROM templates WHERE id = $1',
            [req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Template not found' }
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

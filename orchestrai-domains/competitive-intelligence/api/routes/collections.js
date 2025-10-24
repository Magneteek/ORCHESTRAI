/**
 * Collections Routes
 *
 * Manage curated collections of ads
 */

const express = require('express');
const router = express.Router();

// GET /api/collections - List all collections
router.get('/', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const result = await db.pool.query(`
            SELECT * FROM collections
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: { collections: result.rows }
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/collections/:id - Get collection with ads
router.get('/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const { id } = req.params;

        const collection = await db.pool.query(
            'SELECT * FROM collections WHERE id = $1',
            [id]
        );

        if (collection.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Collection not found' }
            });
        }

        const ads = await db.pool.query(`
            SELECT a.* FROM ads a
            JOIN collection_ads ca ON a.id = ca.ad_id
            WHERE ca.collection_id = $1
            ORDER BY a.performance_score DESC
        `, [id]);

        res.json({
            success: true,
            data: {
                collection: collection.rows[0],
                ads: ads.rows
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/collections - Create new collection
router.post('/', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const { name, description, filters } = req.body;

        const collection = await domainHub.createCollection({
            name,
            description,
            filters,
            clientId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: collection
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/collections/:id - Delete collection
router.delete('/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        await db.pool.query('DELETE FROM collections WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Collection deleted' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

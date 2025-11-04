/**
 * Competitors Routes
 *
 * Track and monitor competitor Facebook/Instagram pages
 */

const express = require('express');
const router = express.Router();

// GET /api/competitors - List tracked competitors
router.get('/', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        const result = await db.pool.query(`
            SELECT * FROM competitors
            WHERE tracking_enabled = true
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: { competitors: result.rows }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/competitors - Start tracking a competitor
router.post('/', async (req, res, next) => {
    try {
        const domainHub = req.app.locals.domainHub;
        const {
            name,
            facebookPageId,
            industry,
            alertOnNewCampaign = true,
            checkFrequencyHours = 6
        } = req.body;

        const result = await domainHub.trackCompetitor({
            name,
            facebookPageId,
            industry,
            alertOnNewCampaign,
            checkFrequencyHours,
            clientId: req.user.id
        });

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/competitors/:id - Stop tracking competitor
router.delete('/:id', async (req, res, next) => {
    try {
        const db = req.app.locals.domainHub.agents.get('database-coordinator');
        await db.pool.query(
            'UPDATE competitors SET tracking_enabled = false WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: 'Competitor tracking stopped' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;

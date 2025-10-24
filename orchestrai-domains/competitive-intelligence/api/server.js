/**
 * Competitive Intelligence API Server
 *
 * RESTful API for accessing competitive intelligence data
 * Features: JWT authentication, rate limiting, CORS, comprehensive endpoints
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import route modules
const adsRoutes = require('./routes/ads');
const collectionsRoutes = require('./routes/collections');
const competitorsRoutes = require('./routes/competitors');
const templatesRoutes = require('./routes/templates');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error-handler');
const requestLogger = require('./middleware/request-logger');

// Import domain hub
const CompetitiveIntelligenceHub = require('../competitive-intelligence-domain-hub');

const app = express();
const PORT = process.env.PORT || 5600;

// Global domain hub instance
let domainHub = null;

// ═══════════════════════════════════════════════════════════════════════
// Security Middleware
// ═══════════════════════════════════════════════════════════════════════

// Helmet - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:']
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS - Cross-Origin Resource Sharing
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

// Rate Limiting - General API rate limit
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per window
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api/', apiLimiter);

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: 'Too many authentication attempts, please try again later',
    skipSuccessfulRequests: true
});
app.use('/api/auth/', authLimiter);

// ═══════════════════════════════════════════════════════════════════════
// Request Parsing Middleware
// ═══════════════════════════════════════════════════════════════════════

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// ═══════════════════════════════════════════════════════════════════════
// Health Check Endpoint
// ═══════════════════════════════════════════════════════════════════════

app.get('/health', (req, res) => {
    const health = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('../package.json').version,
        services: {
            domainHub: domainHub?.isInitialized ? 'ready' : 'not_initialized',
            database: 'checking',
            redis: 'checking'
        }
    };

    // Check database connection
    if (domainHub?.agents?.databaseCoordinator) {
        health.services.database = 'connected';
    }

    // Check Redis connection
    if (domainHub?.redis) {
        health.services.redis = 'connected';
    }

    res.json(health);
});

// ═══════════════════════════════════════════════════════════════════════
// Public Routes (No Authentication Required)
// ═══════════════════════════════════════════════════════════════════════

app.use('/api/auth', authRoutes);

// ═══════════════════════════════════════════════════════════════════════
// Protected Routes (Authentication Required)
// ═══════════════════════════════════════════════════════════════════════

// Apply authentication middleware to all routes below this point
app.use('/api', authMiddleware);

// Mount route modules
app.use('/api/ads', adsRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/competitors', competitorsRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/analytics', analyticsRoutes);

// ═══════════════════════════════════════════════════════════════════════
// System Management Routes
// ═══════════════════════════════════════════════════════════════════════

// Trigger ad collection manually
app.post('/api/system/collect', authMiddleware, async (req, res, next) => {
    try {
        const { keywords, industries, markets, limit } = req.body;

        const result = await domainHub.collectAds({
            keywords: keywords || [],
            industries: industries || [],
            markets: markets || ['ES', 'NL', 'BE', 'DE'],
            limit: limit || 100
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
});

// Get system status
app.get('/api/system/status', authMiddleware, async (req, res, next) => {
    try {
        const status = {
            domainHub: {
                initialized: domainHub?.isInitialized || false,
                agents: {}
            },
            memory: {
                used: process.memoryUsage().heapUsed / 1024 / 1024,
                total: process.memoryUsage().heapTotal / 1024 / 1024
            },
            cpu: process.cpuUsage()
        };

        // Get agent statuses
        if (domainHub?.agents) {
            for (const [name, agent] of domainHub.agents) {
                status.domainHub.agents[name] = {
                    initialized: agent.isInitialized || false,
                    stats: agent.getStats ? agent.getStats() : null
                };
            }
        }

        res.json(status);
    } catch (error) {
        next(error);
    }
});

// ═══════════════════════════════════════════════════════════════════════
// Error Handling
// ═══════════════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.path} not found`
        }
    });
});

// Global error handler
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════════════
// Server Initialization
// ═══════════════════════════════════════════════════════════════════════

async function startServer() {
    try {
        console.log('🚀 Starting Competitive Intelligence API Server...\n');

        // Initialize domain hub
        console.log('📡 Initializing Domain Hub...');
        domainHub = new CompetitiveIntelligenceHub();
        await domainHub.initialize();
        console.log('✅ Domain Hub initialized\n');

        // Make domain hub available to routes
        app.locals.domainHub = domainHub;

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log('═══════════════════════════════════════════════════════════');
            console.log('🎯 Competitive Intelligence API Server');
            console.log('═══════════════════════════════════════════════════════════');
            console.log(`📍 Server running at: http://localhost:${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
            console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
            console.log('═══════════════════════════════════════════════════════════\n');
            console.log('Available endpoints:');
            console.log('  POST   /api/auth/login');
            console.log('  POST   /api/auth/register');
            console.log('  GET    /api/ads');
            console.log('  GET    /api/ads/:id');
            console.log('  POST   /api/ads/:id/analyze');
            console.log('  POST   /api/ads/:id/template');
            console.log('  GET    /api/collections');
            console.log('  POST   /api/collections');
            console.log('  GET    /api/competitors');
            console.log('  POST   /api/competitors');
            console.log('  GET    /api/templates');
            console.log('  GET    /api/analytics/trends');
            console.log('  POST   /api/system/collect');
            console.log('  GET    /api/system/status');
            console.log('═══════════════════════════════════════════════════════════\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            console.log('\n🛑 SIGTERM received, shutting down gracefully...');
            server.close(async () => {
                console.log('📡 HTTP server closed');
                if (domainHub) {
                    await domainHub.shutdown();
                }
                console.log('✅ Shutdown complete');
                process.exit(0);
            });
        });

        process.on('SIGINT', async () => {
            console.log('\n🛑 SIGINT received, shutting down gracefully...');
            server.close(async () => {
                console.log('📡 HTTP server closed');
                if (domainHub) {
                    await domainHub.shutdown();
                }
                console.log('✅ Shutdown complete');
                process.exit(0);
            });
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Start server if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = app;

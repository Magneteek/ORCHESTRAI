/**
 * Request Logger Middleware
 *
 * Logs all API requests for monitoring and debugging
 */

module.exports = function requestLogger(req, res, next) {
    const startTime = Date.now();

    // Log request
    console.log(`📥 ${req.method} ${req.path} ${req.ip || req.connection.remoteAddress}`);

    // Log response when finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const statusColor = res.statusCode >= 500 ? '❌'
            : res.statusCode >= 400 ? '⚠️ '
            : '✅';

        console.log(`${statusColor} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });

    next();
};

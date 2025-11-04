/**
 * Global Error Handler Middleware
 *
 * Catches all errors and formats consistent error responses
 */

module.exports = function errorHandler(err, req, res, next) {
    // Log error for debugging
    console.error('❌ API Error:', {
        method: req.method,
        path: req.path,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    // Default error response
    let statusCode = err.statusCode || 500;
    let errorCode = err.code || 'INTERNAL_SERVER_ERROR';
    let message = err.message || 'An unexpected error occurred';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errorCode = 'VALIDATION_ERROR';
        message = 'Request validation failed';
    }

    if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        errorCode = 'UNAUTHORIZED';
        message = 'Authentication required';
    }

    if (err.name === 'ForbiddenError') {
        statusCode = 403;
        errorCode = 'FORBIDDEN';
        message = 'Insufficient permissions';
    }

    if (err.name === 'NotFoundError') {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
        message = 'Resource not found';
    }

    if (err.name === 'ConflictError') {
        statusCode = 409;
        errorCode = 'CONFLICT';
        message = 'Resource conflict';
    }

    if (err.name === 'RateLimitError') {
        statusCode = 429;
        errorCode = 'RATE_LIMIT_EXCEEDED';
        message = 'Too many requests';
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: message,
            details: err.details || undefined,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }
    });
};

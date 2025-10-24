/**
 * Authentication Routes
 *
 * Handles user registration, login, token refresh
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';

// Temporary in-memory user store (replace with database in production)
const users = new Map();

// Demo user for testing
users.set('demo@example.com', {
    id: 'demo-user-id',
    email: 'demo@example.com',
    password: bcrypt.hashSync('demo123', 10),
    role: 'admin',
    subscriptionTier: 'professional',
    createdAt: new Date().toISOString()
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Password must be at least 8 characters'
                }
            });
        }

        // Check if user already exists
        if (users.has(email)) {
            return res.status(409).json({
                success: false,
                error: {
                    code: 'USER_EXISTS',
                    message: 'User with this email already exists'
                }
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            role: 'user',
            subscriptionTier: process.env.DEFAULT_SUBSCRIPTION_TIER || 'starter',
            createdAt: new Date().toISOString()
        };

        users.set(email, user);

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                subscriptionTier: user.subscriptionTier
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionTier: user.subscriptionTier
                },
                token,
                expiresIn: JWT_EXPIRY
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Email and password are required'
                }
            });
        }

        // Find user
        const user = users.get(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Verify password
        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password'
                }
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role,
                subscriptionTier: user.subscriptionTier
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    subscriptionTier: user.subscriptionTier
                },
                token,
                expiresIn: JWT_EXPIRY
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res, next) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Token is required'
                }
            });
        }

        // Verify old token (ignore expiration)
        const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });

        // Generate new token
        const newToken = jwt.sign(
            {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                subscriptionTier: decoded.subscriptionTier
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        res.json({
            success: true,
            data: {
                token: newToken,
                expiresIn: JWT_EXPIRY
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;

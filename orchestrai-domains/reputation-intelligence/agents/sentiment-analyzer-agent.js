/**
 * Sentiment Analyzer Agent
 * Advanced natural language processing for negative review analysis
 * Categorizes complaints, extracts themes, and calculates severity scores
 */

const { EventEmitter } = require('events');

class SentimentAnalyzerAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'sentiment-analyzer';
        this.isInitialized = false;
        this.config = null;
        this.analysisCache = new Map();
        this.complaintCategories = this.initializeComplaintCategories();
        this.severityKeywords = this.initializeSeverityKeywords();
    }

    async initialize(config) {
        try {
            this.config = config;
            this.isInitialized = true;
            console.log(`✅ Sentiment Analyzer Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Sentiment Analyzer Agent:`, error);
            throw error;
        }
    }

    initializeComplaintCategories() {
        return {
            service_quality: {
                keywords: ['rude', 'unprofessional', 'slow', 'waited', 'delay', 'poor service', 'attitude', 'dismissed'],
                weight: 0.8
            },
            staff_behavior: {
                keywords: ['staff', 'receptionist', 'doctor', 'nurse', 'employee', 'behavior', 'treated', 'manner'],
                weight: 0.9
            },
            cleanliness: {
                keywords: ['dirty', 'unclean', 'hygiene', 'sanitary', 'mess', 'smell', 'odor', 'filthy'],
                weight: 0.7
            },
            pricing: {
                keywords: ['expensive', 'overpriced', 'cost', 'money', 'price', 'billing', 'charge', 'fee'],
                weight: 0.6
            },
            appointment: {
                keywords: ['appointment', 'scheduling', 'cancel', 'reschedule', 'booking', 'availability'],
                weight: 0.5
            },
            waiting_time: {
                keywords: ['wait', 'waiting', 'delayed', 'late', 'on time', 'punctual', 'schedule'],
                weight: 0.6
            },
            communication: {
                keywords: ['explain', 'information', 'communication', 'clear', 'understand', 'language'],
                weight: 0.7
            },
            results: {
                keywords: ['outcome', 'result', 'effectiveness', 'improvement', 'worse', 'better', 'failed'],
                weight: 0.9
            },
            facility: {
                keywords: ['location', 'parking', 'building', 'equipment', 'old', 'outdated', 'modern'],
                weight: 0.4
            },
            pain_management: {
                keywords: ['pain', 'hurt', 'uncomfortable', 'gentle', 'rough', 'procedure', 'treatment'],
                weight: 0.8
            }
        };
    }

    initializeSeverityKeywords() {
        return {
            extreme: {
                keywords: ['worst', 'terrible', 'horrible', 'disgusting', 'awful', 'disaster', 'nightmare', 'never again'],
                score: 10
            },
            high: {
                keywords: ['bad', 'poor', 'disappointing', 'unacceptable', 'frustrated', 'angry', 'upset'],
                score: 8
            },
            medium: {
                keywords: ['okay', 'average', 'mediocre', 'could be better', 'not great', 'decent'],
                score: 6
            },
            low: {
                keywords: ['fine', 'acceptable', 'reasonable', 'not bad', 'satisfactory'],
                score: 4
            }
        };
    }

    async analyzeReviews(reviews) {
        try {
            console.log(`🧠 Starting sentiment analysis for ${reviews.length} reviews`);

            const analysisResults = [];

            for (const review of reviews) {
                try {
                    const analysis = await this.analyzeReview(review);
                    analysisResults.push(analysis);
                } catch (error) {
                    console.error(`⚠️ Failed to analyze review ${review.id}:`, error);
                    analysisResults.push({
                        reviewId: review.id,
                        error: error.message,
                        analyzedAt: new Date()
                    });
                }
            }

            // Generate aggregate insights
            const aggregateInsights = this.generateAggregateInsights(analysisResults);

            console.log(`✅ Sentiment analysis completed for ${analysisResults.length} reviews`);

            // Emit results for further processing
            this.emit('analysis-complete', analysisResults);
            this.emit('aggregate-insights', aggregateInsights);

            return {
                reviews: analysisResults,
                insights: aggregateInsights,
                totalAnalyzed: analysisResults.length
            };

        } catch (error) {
            console.error(`❌ Failed to analyze reviews:`, error);
            throw error;
        }
    }

    async analyzeReview(review) {
        try {
            // Check cache first
            const cacheKey = this.generateCacheKey(review);
            if (this.analysisCache.has(cacheKey)) {
                return this.analysisCache.get(cacheKey);
            }

            const reviewText = review.text.toLowerCase();

            const analysis = {
                reviewId: review.id,
                businessId: review.businessId,
                businessName: review.businessName,
                originalRating: review.rating,
                reviewDate: review.reviewDate,

                // Core sentiment analysis
                sentiment: this.analyzeSentiment(reviewText),
                severityScore: this.calculateSeverityScore(reviewText),

                // Complaint categorization
                complaintCategories: this.categorizeComplaints(reviewText),
                primaryComplaint: null,

                // Theme extraction
                themes: this.extractThemes(reviewText),
                keywords: this.extractKeywords(reviewText),

                // Urgency and impact assessment
                urgencyLevel: this.assessUrgency(reviewText, review.rating),
                impactScore: this.calculateImpactScore(reviewText, review.rating),

                // Action recommendations
                recommendedActions: this.generateActionRecommendations(reviewText, review.rating),

                // Metadata
                textLength: review.text.length,
                analyzedAt: new Date(),
                confidence: 0
            };

            // Determine primary complaint
            analysis.primaryComplaint = this.determinePrimaryComplaint(analysis.complaintCategories);

            // Calculate overall confidence score
            analysis.confidence = this.calculateConfidenceScore(analysis);

            // Cache the result
            this.analysisCache.set(cacheKey, analysis);

            return analysis;

        } catch (error) {
            console.error(`❌ Failed to analyze individual review:`, error);
            throw error;
        }
    }

    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'helpful', 'friendly', 'professional'];
        const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'poor', 'worst', 'disappointing', 'frustrated'];

        let positiveScore = 0;
        let negativeScore = 0;

        const words = text.split(/\\s+/);

        words.forEach(word => {
            if (positiveWords.includes(word)) positiveScore++;
            if (negativeWords.includes(word)) negativeScore++;
        });

        const totalSentimentWords = positiveScore + negativeScore;

        if (totalSentimentWords === 0) {
            return { polarity: 'neutral', score: 0 };
        }

        const sentimentScore = (positiveScore - negativeScore) / totalSentimentWords;

        let polarity;
        if (sentimentScore > 0.2) polarity = 'positive';
        else if (sentimentScore < -0.2) polarity = 'negative';
        else polarity = 'neutral';

        return {
            polarity,
            score: sentimentScore,
            positiveWords: positiveScore,
            negativeWords: negativeScore
        };
    }

    calculateSeverityScore(text) {
        let severityScore = 0;
        let totalMatches = 0;

        for (const [level, data] of Object.entries(this.severityKeywords)) {
            for (const keyword of data.keywords) {
                if (text.includes(keyword)) {
                    severityScore += data.score;
                    totalMatches++;
                }
            }
        }

        // Normalize score (0-10 scale)
        return totalMatches > 0 ? Math.min(severityScore / totalMatches, 10) : 5;
    }

    categorizeComplaints(text) {
        const categories = {};

        for (const [category, data] of Object.entries(this.complaintCategories)) {
            let categoryScore = 0;
            let matchCount = 0;

            for (const keyword of data.keywords) {
                if (text.includes(keyword)) {
                    categoryScore += data.weight;
                    matchCount++;
                }
            }

            if (matchCount > 0) {
                categories[category] = {
                    score: categoryScore,
                    matches: matchCount,
                    relevance: categoryScore / data.keywords.length
                };
            }
        }

        return categories;
    }

    determinePrimaryComplaint(categories) {
        let primaryCategory = null;
        let highestScore = 0;

        for (const [category, data] of Object.entries(categories)) {
            if (data.score > highestScore) {
                highestScore = data.score;
                primaryCategory = category;
            }
        }

        return primaryCategory;
    }

    extractThemes(text) {
        const commonThemes = [
            { theme: 'wait_time', patterns: ['wait', 'waiting', 'delayed', 'on time', 'late'] },
            { theme: 'staff_attitude', patterns: ['rude', 'friendly', 'helpful', 'attitude', 'professional'] },
            { theme: 'cleanliness', patterns: ['clean', 'dirty', 'hygiene', 'sanitary'] },
            { theme: 'pain_experience', patterns: ['pain', 'hurt', 'comfortable', 'gentle', 'rough'] },
            { theme: 'communication', patterns: ['explain', 'understand', 'clear', 'information'] },
            { theme: 'value_for_money', patterns: ['expensive', 'price', 'cost', 'worth', 'value'] }
        ];

        const extractedThemes = [];

        commonThemes.forEach(({ theme, patterns }) => {
            const matches = patterns.filter(pattern => text.includes(pattern));
            if (matches.length > 0) {
                extractedThemes.push({
                    theme,
                    matches,
                    strength: matches.length / patterns.length
                });
            }
        });

        return extractedThemes;
    }

    extractKeywords(text) {
        // Remove common words and extract meaningful keywords
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];

        const words = text.toLowerCase()
            .replace(/[^a-z\\s]/g, '')
            .split(/\\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word));

        // Count word frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });

        // Return top keywords
        return Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([word, count]) => ({ word, count }));
    }

    assessUrgency(text, rating) {
        let urgencyScore = 0;

        // Rating-based urgency
        if (rating === 1) urgencyScore += 40;
        else if (rating === 2) urgencyScore += 25;
        else if (rating === 3) urgencyScore += 15;

        // Keyword-based urgency
        const urgentKeywords = ['emergency', 'urgent', 'immediate', 'asap', 'now', 'today', 'terrible', 'worst', 'never again', 'lawsuit', 'report', 'complain'];
        urgentKeywords.forEach(keyword => {
            if (text.includes(keyword)) urgencyScore += 10;
        });

        // Length-based urgency (longer detailed complaints often more serious)
        if (text.length > 500) urgencyScore += 10;
        else if (text.length > 200) urgencyScore += 5;

        urgencyScore = Math.min(urgencyScore, 100);

        if (urgencyScore >= 70) return 'critical';
        else if (urgencyScore >= 50) return 'high';
        else if (urgencyScore >= 30) return 'medium';
        else return 'low';
    }

    calculateImpactScore(text, rating) {
        let impactScore = 0;

        // Public visibility indicators
        const visibilityKeywords = ['everyone', 'people', 'friends', 'family', 'recommend', 'avoid', 'tell', 'share'];
        visibilityKeywords.forEach(keyword => {
            if (text.includes(keyword)) impactScore += 15;
        });

        // Business damage indicators
        const damageKeywords = ['never', 'again', 'elsewhere', 'different', 'competitor', 'alternative'];
        damageKeywords.forEach(keyword => {
            if (text.includes(keyword)) impactScore += 10;
        });

        // Legal/regulatory concerns
        const legalKeywords = ['report', 'board', 'license', 'complaint', 'sue', 'legal', 'authority'];
        legalKeywords.forEach(keyword => {
            if (text.includes(keyword)) impactScore += 25;
        });

        // Rating impact
        impactScore += (4 - rating) * 10;

        return Math.min(impactScore, 100);
    }

    generateActionRecommendations(text, rating) {
        const recommendations = [];

        // Based on urgency and content
        if (rating === 1) {
            recommendations.push({
                action: 'immediate_response',
                priority: 'critical',
                description: 'Respond within 2 hours with personalized apology and solution'
            });
        }

        if (text.includes('money') || text.includes('refund') || text.includes('charge')) {
            recommendations.push({
                action: 'billing_review',
                priority: 'high',
                description: 'Review billing and consider offering refund or adjustment'
            });
        }

        if (text.includes('staff') || text.includes('rude') || text.includes('attitude')) {
            recommendations.push({
                action: 'staff_training',
                priority: 'medium',
                description: 'Additional staff training on customer service'
            });
        }

        if (text.includes('clean') || text.includes('hygiene') || text.includes('dirty')) {
            recommendations.push({
                action: 'facility_inspection',
                priority: 'high',
                description: 'Immediate facility cleanliness inspection and improvement'
            });
        }

        return recommendations;
    }

    generateAggregateInsights(analysisResults) {
        const insights = {
            totalReviews: analysisResults.length,
            averageSeverity: 0,
            urgencyDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
            topComplaints: {},
            commonThemes: {},
            businessImpact: {
                totalBusinesses: new Set(analysisResults.map(r => r.businessId)).size,
                highRiskBusinesses: []
            },
            trends: {
                averageRating: 0,
                sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
            },
            generatedAt: new Date()
        };

        // Calculate aggregates
        let totalSeverity = 0;
        let totalRating = 0;

        analysisResults.forEach(analysis => {
            if (analysis.severityScore) {
                totalSeverity += analysis.severityScore;
            }

            if (analysis.originalRating) {
                totalRating += analysis.originalRating;
            }

            // Urgency distribution
            if (analysis.urgencyLevel) {
                insights.urgencyDistribution[analysis.urgencyLevel]++;
            }

            // Sentiment distribution
            if (analysis.sentiment?.polarity) {
                insights.trends.sentimentDistribution[analysis.sentiment.polarity]++;
            }

            // Collect complaint categories
            if (analysis.primaryComplaint) {
                insights.topComplaints[analysis.primaryComplaint] =
                    (insights.topComplaints[analysis.primaryComplaint] || 0) + 1;
            }

            // Collect themes
            if (analysis.themes) {
                analysis.themes.forEach(theme => {
                    insights.commonThemes[theme.theme] =
                        (insights.commonThemes[theme.theme] || 0) + 1;
                });
            }
        });

        insights.averageSeverity = totalSeverity / analysisResults.length;
        insights.trends.averageRating = totalRating / analysisResults.length;

        return insights;
    }

    calculateConfidenceScore(analysis) {
        let confidence = 50; // Base confidence

        // More text usually means more reliable analysis
        if (analysis.textLength > 100) confidence += 20;
        else if (analysis.textLength > 50) confidence += 10;

        // Clear complaint categories increase confidence
        const categoryCount = Object.keys(analysis.complaintCategories).length;
        confidence += Math.min(categoryCount * 5, 20);

        // Strong sentiment indicators increase confidence
        if (analysis.sentiment.negativeWords > 2) confidence += 10;

        return Math.min(confidence, 100);
    }

    generateCacheKey(review) {
        return `${review.id}_${review.text.length}_${review.rating}`;
    }

    async getBusinessSentiment(businessId) {
        // Implementation would query stored analysis results
        return {
            businessId,
            overallSentiment: 'negative',
            averageSeverity: 7.2,
            totalReviews: 15,
            primaryComplaints: ['service_quality', 'staff_behavior']
        };
    }

    async shutdown() {
        console.log(`🔄 Shutting down Sentiment Analyzer Agent...`);
        this.analysisCache.clear();
        this.isInitialized = false;
    }
}

module.exports = new SentimentAnalyzerAgent();
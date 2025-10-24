/**
 * Performance Scorer Agent
 *
 * Infrastructure agent for calculating ad performance scores
 *
 * Scoring Algorithm:
 * Performance Score = (Longevity × 0.40) + (Iteration × 0.25) +
 *                     (Advertiser Quality × 0.20) + (Industry Relevance × 0.15)
 *
 * Why this works without actual performance data:
 * - Advertisers kill poor performers quickly → Long-running ads = winners
 * - Testing multiple variations = optimization → More iterations = serious advertiser
 * - Verified pages with high ad volume = credible → Quality signals
 * - Strong keyword/visual match = targeted → Relevance matters
 *
 * Responsibilities:
 * - Calculate longevity scores based on ad duration
 * - Detect creative iterations and variations
 * - Assess advertiser quality signals
 * - Evaluate industry relevance matching
 * - Apply configurable weights to components
 * - Emit scoring-complete events
 */

const { EventEmitter } = require('events');

class PerformanceScorerAgent extends EventEmitter {
    constructor(config = {}) {
        super();

        this.name = 'performance-scorer';
        this.isInitialized = false;

        // Scoring weights (must sum to 1.0)
        this.weights = {
            longevity: config.scoringWeights?.longevity || 0.40,
            iteration: config.scoringWeights?.iteration || 0.25,
            advertiserQuality: config.scoringWeights?.advertiserQuality || 0.20,
            industryRelevance: config.scoringWeights?.industryRelevance || 0.15
        };

        // Longevity thresholds (days)
        this.longevityThresholds = {
            excellent: 60,  // 60+ days = 100 points
            good: 30,       // 30-59 days = 80 points
            average: 14,    // 14-29 days = 60 points
            poor: 7         // 7-13 days = 40 points
                            // <7 days = 20 points
        };

        // Industry-specific scoring adjustments
        this.industryBonus = {
            dental_b2c: {
                beforeAfterImages: 10,
                testimonialQuotes: 10,
                localTargeting: 5,
                urgencyLanguage: 5
            },
            dental_b2b: {
                technicalSpecs: 10,
                roiCalculator: 15,
                demoOffer: 15,
                industryCredentials: 10
            },
            ai_saas: {
                freeTrialCta: 10,
                demoVideo: 15,
                integrationMentions: 10,
                useCaseExamples: 5
            }
        };

        this.config = config;
    }

    /**
     * Initialize the agent
     */
    async initialize() {
        try {
            console.log(`📊 Initializing Performance Scorer Agent...`);

            // Validate weights sum to 1.0
            const weightSum = Object.values(this.weights).reduce((a, b) => a + b, 0);
            if (Math.abs(weightSum - 1.0) > 0.001) {
                throw new Error(`Scoring weights must sum to 1.0 (current: ${weightSum})`);
            }

            console.log(`  Scoring Weights:`);
            console.log(`    - Longevity: ${this.weights.longevity * 100}%`);
            console.log(`    - Iteration: ${this.weights.iteration * 100}%`);
            console.log(`    - Advertiser Quality: ${this.weights.advertiserQuality * 100}%`);
            console.log(`    - Industry Relevance: ${this.weights.industryRelevance * 100}%`);

            this.isInitialized = true;
            console.log(`✅ Performance Scorer Agent initialized`);

            return { success: true };

        } catch (error) {
            console.error(`❌ Failed to initialize Performance Scorer Agent:`, error);
            throw error;
        }
    }

    /**
     * Score multiple ads
     *
     * @param {Array} ads - Ads to score
     * @returns {Promise<Array>} Scored ads
     */
    async scoreAds(ads) {
        try {
            if (!this.isInitialized) {
                throw new Error('Agent not initialized');
            }

            console.log(`📊 Scoring ${ads.length} ads...`);

            const scoredAds = [];

            for (const ad of ads) {
                const scored = await this.scoreAd(ad);
                scoredAds.push(scored);
            }

            // Sort by performance score
            scoredAds.sort((a, b) => b.performanceScore - a.performanceScore);

            console.log(`✅ Scoring complete`);
            console.log(`  Top score: ${scoredAds[0]?.performanceScore.toFixed(2)}`);
            console.log(`  Average score: ${(scoredAds.reduce((sum, ad) => sum + ad.performanceScore, 0) / scoredAds.length).toFixed(2)}`);

            // Emit event
            this.emit('scoring-complete', scoredAds);

            return scoredAds;

        } catch (error) {
            console.error(`❌ Failed to score ads:`, error);
            throw error;
        }
    }

    /**
     * Score a single ad
     *
     * @param {Object} ad - Ad to score
     * @returns {Object} Ad with performance score
     */
    async scoreAd(ad) {
        try {
            // Calculate component scores
            const longevityScore = this.calculateLongevityScore(ad);
            const iterationScore = this.calculateIterationScore(ad);
            const advertiserQualityScore = this.calculateAdvertiserQualityScore(ad);
            const industryRelevanceScore = this.calculateIndustryRelevanceScore(ad);

            // Calculate weighted total score (0-100)
            const performanceScore = (
                (longevityScore * this.weights.longevity) +
                (iterationScore * this.weights.iteration) +
                (advertiserQualityScore * this.weights.advertiserQuality) +
                (industryRelevanceScore * this.weights.industryRelevance)
            );

            // Apply industry-specific bonuses
            const bonusScore = this.calculateIndustryBonus(ad);
            const finalScore = Math.min(100, performanceScore + bonusScore);

            return {
                ...ad,
                performanceScore: Math.round(finalScore * 100) / 100, // Round to 2 decimals
                scoreComponents: {
                    longevity: Math.round(longevityScore * 100) / 100,
                    iteration: Math.round(iterationScore * 100) / 100,
                    advertiserQuality: Math.round(advertiserQualityScore * 100) / 100,
                    industryRelevance: Math.round(industryRelevanceScore * 100) / 100,
                    industryBonus: Math.round(bonusScore * 100) / 100
                },
                scoredAt: new Date()
            };

        } catch (error) {
            console.error(`❌ Failed to score ad ${ad.id}:`, error);
            return {
                ...ad,
                performanceScore: 0,
                scoreError: error.message
            };
        }
    }

    /**
     * Calculate longevity score (0-100)
     * Longer-running ads = better performing (advertisers kill losers fast)
     *
     * @param {Object} ad - Ad object
     * @returns {number} Longevity score
     */
    calculateLongevityScore(ad) {
        const startDate = new Date(ad.startDate);
        const endDate = ad.endDate ? new Date(ad.endDate) : new Date();

        // Calculate days running
        const daysRunning = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        // Score based on thresholds
        if (daysRunning >= this.longevityThresholds.excellent) {
            return 100;
        } else if (daysRunning >= this.longevityThresholds.good) {
            return 80;
        } else if (daysRunning >= this.longevityThresholds.average) {
            return 60;
        } else if (daysRunning >= this.longevityThresholds.poor) {
            return 40;
        } else {
            return 20;
        }
    }

    /**
     * Calculate iteration score (0-100)
     * Multiple creative variations = testing/optimization = serious advertiser
     *
     * @param {Object} ad - Ad object
     * @returns {number} Iteration score
     */
    calculateIterationScore(ad) {
        // This would need access to related ads from same advertiser
        // For now, use heuristics from ad metadata

        let score = 40; // Base score

        // Check if ad has multiple creative variations (would be detected by comparing similar ads)
        // For MVP, we'll use placeholder logic
        if (ad.variationCount) {
            if (ad.variationCount >= 5) {
                score = 100;
            } else if (ad.variationCount >= 3) {
                score = 80;
            } else if (ad.variationCount >= 2) {
                score = 60;
            }
        }

        // Bonus for A/B test indicators in copy
        const copyText = `${ad.headline} ${ad.primaryText}`.toLowerCase();
        if (copyText.includes('limited time') || copyText.includes('special offer')) {
            score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * Calculate advertiser quality score (0-100)
     * Verified pages + high ad volume + consistent activity = credible advertiser
     *
     * @param {Object} ad - Ad object
     * @returns {number} Advertiser quality score
     */
    calculateAdvertiserQualityScore(ad) {
        let score = 50; // Base score

        // Verified page bonus
        if (ad.advertiserVerified) {
            score += 30;
        }

        // Funding entity disclosed (transparency signal)
        if (ad.fundingEntity) {
            score += 10;
        }

        // Multiple platforms (FB + IG = higher budget/seriousness)
        if (ad.platforms && ad.platforms.length > 1) {
            score += 10;
        }

        // Consistent advertiser name (professional branding)
        if (ad.advertiserName && ad.advertiserName.length > 3) {
            score += 10;
        }

        return Math.min(100, score);
    }

    /**
     * Calculate industry relevance score (0-100)
     * Strong keyword match + industry signals = targeted ad
     *
     * @param {Object} ad - Ad object
     * @returns {number} Industry relevance score
     */
    calculateIndustryRelevanceScore(ad) {
        if (!ad.industry) {
            return 50; // Neutral score if industry not classified
        }

        let score = 50; // Base score

        const copyText = `${ad.headline} ${ad.primaryText} ${ad.description}`.toLowerCase();

        // Industry-specific keyword matching
        const industryKeywords = this.getIndustryKeywords(ad.industry);
        const matchCount = industryKeywords.filter(keyword =>
            copyText.includes(keyword.toLowerCase())
        ).length;

        // Score based on keyword matches
        if (matchCount >= 5) {
            score = 100;
        } else if (matchCount >= 3) {
            score = 80;
        } else if (matchCount >= 2) {
            score = 70;
        } else if (matchCount >= 1) {
            score = 60;
        }

        return score;
    }

    /**
     * Calculate industry-specific bonus points
     * Reward ads that use industry best practices
     *
     * @param {Object} ad - Ad object
     * @returns {number} Bonus points (0-30)
     */
    calculateIndustryBonus(ad) {
        if (!ad.industry || !this.industryBonus[ad.industry]) {
            return 0;
        }

        let bonus = 0;
        const bonusRules = this.industryBonus[ad.industry];
        const copyText = `${ad.headline} ${ad.primaryText}`.toLowerCase();

        // Dental B2C bonuses
        if (ad.industry === 'dental_b2c') {
            if (copyText.includes('before') && copyText.includes('after')) {
                bonus += bonusRules.beforeAfterImages;
            }
            if (copyText.includes('testimonial') || copyText.includes('review')) {
                bonus += bonusRules.testimonialQuotes;
            }
            if (copyText.includes('local') || copyText.includes('near you')) {
                bonus += bonusRules.localTargeting;
            }
            if (copyText.includes('today') || copyText.includes('now') || copyText.includes('limited')) {
                bonus += bonusRules.urgencyLanguage;
            }
        }

        // Dental B2B bonuses
        if (ad.industry === 'dental_b2b') {
            if (copyText.match(/\d+%/) || copyText.includes('roi')) {
                bonus += bonusRules.roiCalculator;
            }
            if (copyText.includes('demo') || copyText.includes('trial')) {
                bonus += bonusRules.demoOffer;
            }
            if (copyText.includes('fda') || copyText.includes('certified') || copyText.includes('award')) {
                bonus += bonusRules.industryCredentials;
            }
        }

        // AI SaaS bonuses
        if (ad.industry === 'ai_saas') {
            if (copyText.includes('free trial') || copyText.includes('try free')) {
                bonus += bonusRules.freeTrialCta;
            }
            if (copyText.includes('demo') || copyText.includes('watch how')) {
                bonus += bonusRules.demoVideo;
            }
            if (copyText.includes('integrate') || copyText.includes('connect with')) {
                bonus += bonusRules.integrationMentions;
            }
            if (copyText.includes('use case') || copyText.includes('example')) {
                bonus += bonusRules.useCaseExamples;
            }
        }

        return Math.min(30, bonus); // Cap at 30 bonus points
    }

    /**
     * Get relevant keywords for industry
     *
     * @param {string} industry - Industry identifier
     * @returns {Array<string>} Industry keywords
     */
    getIndustryKeywords(industry) {
        const keywords = {
            dental_b2c: [
                'dental', 'dentist', 'teeth', 'smile', 'implant', 'whitening',
                'cosmetic', 'braces', 'invisalign', 'orthodontic', 'cavity',
                'root canal', 'crown', 'veneer', 'cleaning'
            ],
            dental_b2b: [
                'dental', 'cbct', 'scanner', '3d printer', 'intraoral',
                'practice management', 'sterilization', 'autoclave',
                'x-ray', 'imaging', 'equipment', 'laboratory'
            ],
            ai_saas: [
                'ai', 'artificial intelligence', 'machine learning', 'automation',
                'chatbot', 'assistant', 'productivity', 'workflow',
                'integration', 'api', 'platform', 'saas', 'software'
            ]
        };

        return keywords[industry] || [];
    }

    /**
     * Get scoring statistics for a set of ads
     *
     * @param {Array} ads - Scored ads
     * @returns {Object} Scoring statistics
     */
    getScoreStatistics(ads) {
        if (!ads || ads.length === 0) {
            return null;
        }

        const scores = ads.map(ad => ad.performanceScore).filter(s => s);

        return {
            count: scores.length,
            average: scores.reduce((a, b) => a + b, 0) / scores.length,
            min: Math.min(...scores),
            max: Math.max(...scores),
            median: this.calculateMedian(scores),
            topPerformers: ads.filter(ad => ad.performanceScore >= 80).length,
            poorPerformers: ads.filter(ad => ad.performanceScore < 40).length
        };
    }

    /**
     * Calculate median value
     *
     * @param {Array<number>} values - Numeric values
     * @returns {number} Median
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    /**
     * Shutdown agent
     */
    async shutdown() {
        console.log(`🛑 Shutting down Performance Scorer Agent...`);
        console.log(`✅ Performance Scorer Agent shutdown complete`);
    }
}

module.exports = PerformanceScorerAgent;

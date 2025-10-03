/**
 * Trend Detector Agent
 * Identifies patterns in negative reviews over time
 * Detects emerging issues and reputation crisis indicators
 */

const { EventEmitter } = require('events');

class TrendDetectorAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'trend-detector';
        this.isInitialized = false;
        this.config = null;
        this.historicalData = new Map();
        this.trendThresholds = this.initializeTrendThresholds();
    }

    async initialize(config) {
        try {
            this.config = config;
            this.isInitialized = true;
            console.log(`✅ Trend Detector Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Trend Detector Agent:`, error);
            throw error;
        }
    }

    initializeTrendThresholds() {
        return {
            volumeIncrease: {
                warning: 50,  // 50% increase in negative reviews
                critical: 100 // 100% increase
            },
            severityIncrease: {
                warning: 1.5,  // 1.5 point increase in average severity
                critical: 2.5  // 2.5 point increase
            },
            newComplaintType: {
                threshold: 3   // 3+ reviews mentioning new issue
            },
            rapidDetermination: {
                timeWindow: 7, // 7 days
                reviewThreshold: 5 // 5+ negative reviews in 7 days
            }
        };
    }

    async detectTrends(analysisResults) {
        try {
            console.log(`📈 Analyzing trends for ${analysisResults.length} review analyses`);

            const trendAnalysis = {
                volumeTrends: await this.detectVolumeTrends(analysisResults),
                severityTrends: await this.detectSeverityTrends(analysisResults),
                complaintTrends: await this.detectComplaintTrends(analysisResults),
                businessTrends: await this.detectBusinessSpecificTrends(analysisResults),
                temporalTrends: await this.detectTemporalTrends(analysisResults),
                alertLevel: 'normal',
                generatedAt: new Date()
            };

            // Determine overall alert level
            trendAnalysis.alertLevel = this.calculateOverallAlertLevel(trendAnalysis);

            // Emit alerts for significant trends
            this.emitTrendAlerts(trendAnalysis);

            console.log(`📊 Trend analysis complete - Alert level: ${trendAnalysis.alertLevel}`);

            return trendAnalysis;

        } catch (error) {
            console.error(`❌ Failed to detect trends:`, error);
            throw error;
        }
    }

    async detectVolumeTrends(analysisResults) {
        const businessVolumeData = {};
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Group reviews by business and time period
        analysisResults.forEach(analysis => {
            const businessId = analysis.businessId;
            const reviewDate = new Date(analysis.reviewDate);

            if (!businessVolumeData[businessId]) {
                businessVolumeData[businessId] = {
                    businessName: analysis.businessName,
                    currentWeek: 0,
                    previousWeek: 0,
                    trend: 'stable'
                };
            }

            if (reviewDate >= lastWeek) {
                businessVolumeData[businessId].currentWeek++;
            } else if (reviewDate >= twoWeeksAgo) {
                businessVolumeData[businessId].previousWeek++;
            }
        });

        // Calculate trends for each business
        const volumeTrends = [];

        Object.entries(businessVolumeData).forEach(([businessId, data]) => {
            let percentageChange = 0;
            let trend = 'stable';

            if (data.previousWeek > 0) {
                percentageChange = ((data.currentWeek - data.previousWeek) / data.previousWeek) * 100;
            } else if (data.currentWeek > 0) {
                percentageChange = 100; // New negative reviews where there were none
            }

            if (percentageChange >= this.trendThresholds.volumeIncrease.critical) {
                trend = 'critical_increase';
            } else if (percentageChange >= this.trendThresholds.volumeIncrease.warning) {
                trend = 'warning_increase';
            } else if (percentageChange <= -50) {
                trend = 'improvement';
            }

            if (data.currentWeek > 0 || data.previousWeek > 0) {
                volumeTrends.push({
                    businessId,
                    businessName: data.businessName,
                    currentWeek: data.currentWeek,
                    previousWeek: data.previousWeek,
                    percentageChange: Math.round(percentageChange),
                    trend,
                    severity: trend.includes('critical') ? 'critical' :
                             trend.includes('warning') ? 'high' : 'medium'
                });
            }
        });

        return volumeTrends.sort((a, b) => b.percentageChange - a.percentageChange);
    }

    async detectSeverityTrends(analysisResults) {
        const businessSeverityData = {};
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Group severity scores by business and time period
        analysisResults.forEach(analysis => {
            const businessId = analysis.businessId;
            const reviewDate = new Date(analysis.reviewDate);
            const isRecent = reviewDate >= lastWeek;

            if (!businessSeverityData[businessId]) {
                businessSeverityData[businessId] = {
                    businessName: analysis.businessName,
                    recentSeverities: [],
                    olderSeverities: []
                };
            }

            if (analysis.severityScore) {
                if (isRecent) {
                    businessSeverityData[businessId].recentSeverities.push(analysis.severityScore);
                } else {
                    businessSeverityData[businessId].olderSeverities.push(analysis.severityScore);
                }
            }
        });

        // Calculate severity trends
        const severityTrends = [];

        Object.entries(businessSeverityData).forEach(([businessId, data]) => {
            if (data.recentSeverities.length === 0) return;

            const recentAverage = data.recentSeverities.reduce((a, b) => a + b, 0) / data.recentSeverities.length;
            let olderAverage = recentAverage; // Default if no older data

            if (data.olderSeverities.length > 0) {
                olderAverage = data.olderSeverities.reduce((a, b) => a + b, 0) / data.olderSeverities.length;
            }

            const severityChange = recentAverage - olderAverage;
            let trend = 'stable';

            if (severityChange >= this.trendThresholds.severityIncrease.critical) {
                trend = 'critical_worsening';
            } else if (severityChange >= this.trendThresholds.severityIncrease.warning) {
                trend = 'warning_worsening';
            } else if (severityChange <= -1.0) {
                trend = 'improvement';
            }

            severityTrends.push({
                businessId,
                businessName: data.businessName,
                recentAverageSeverity: Math.round(recentAverage * 10) / 10,
                previousAverageSeverity: Math.round(olderAverage * 10) / 10,
                severityChange: Math.round(severityChange * 10) / 10,
                trend,
                severity: trend.includes('critical') ? 'critical' :
                         trend.includes('warning') ? 'high' : 'medium',
                sampleSize: data.recentSeverities.length
            });
        });

        return severityTrends.sort((a, b) => b.severityChange - a.severityChange);
    }

    async detectComplaintTrends(analysisResults) {
        const complaintData = {};
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Track complaint types over time
        analysisResults.forEach(analysis => {
            const reviewDate = new Date(analysis.reviewDate);
            const isRecent = reviewDate >= lastWeek;
            const timeKey = isRecent ? 'recent' : 'older';

            if (analysis.primaryComplaint) {
                if (!complaintData[analysis.primaryComplaint]) {
                    complaintData[analysis.primaryComplaint] = {
                        recent: new Set(),
                        older: new Set(),
                        recentCount: 0,
                        olderCount: 0,
                        businesses: new Set()
                    };
                }

                complaintData[analysis.primaryComplaint][timeKey].add(analysis.businessId);
                complaintData[analysis.primaryComplaint][`${timeKey}Count`]++;
                complaintData[analysis.primaryComplaint].businesses.add(analysis.businessId);
            }
        });

        // Analyze complaint trends
        const complaintTrends = [];

        Object.entries(complaintData).forEach(([complaintType, data]) => {
            const recentBusinesses = data.recent.size;
            const olderBusinesses = data.older.size;
            const totalBusinesses = data.businesses.size;

            let trend = 'stable';
            let changeType = 'volume';

            // Detect new emerging complaint types
            if (olderBusinesses === 0 && recentBusinesses >= this.trendThresholds.newComplaintType.threshold) {
                trend = 'new_emerging';
                changeType = 'emergence';
            }
            // Detect spreading complaint types
            else if (recentBusinesses > olderBusinesses * 1.5 && recentBusinesses >= 3) {
                trend = 'spreading';
                changeType = 'spread';
            }
            // Detect increasing complaint volume
            else if (data.recentCount > data.olderCount * 1.5) {
                trend = 'increasing';
                changeType = 'volume';
            }
            // Detect declining complaints
            else if (data.recentCount < data.olderCount * 0.5 && data.olderCount > 0) {
                trend = 'declining';
                changeType = 'volume';
            }

            if (trend !== 'stable') {
                complaintTrends.push({
                    complaintType,
                    trend,
                    changeType,
                    recentCount: data.recentCount,
                    olderCount: data.olderCount,
                    affectedBusinesses: totalBusinesses,
                    recentBusinesses,
                    olderBusinesses,
                    severity: trend === 'new_emerging' ? 'critical' :
                             trend === 'spreading' ? 'high' : 'medium'
                });
            }
        });

        return complaintTrends.sort((a, b) => {
            const severityOrder = { critical: 3, high: 2, medium: 1 };
            return severityOrder[b.severity] - severityOrder[a.severity];
        });
    }

    async detectBusinessSpecificTrends(analysisResults) {
        const businessData = {};

        // Aggregate data by business
        analysisResults.forEach(analysis => {
            const businessId = analysis.businessId;

            if (!businessData[businessId]) {
                businessData[businessId] = {
                    businessName: analysis.businessName,
                    reviews: [],
                    urgencyLevels: { critical: 0, high: 0, medium: 0, low: 0 },
                    averageSeverity: 0,
                    complaintTypes: new Set()
                };
            }

            businessData[businessId].reviews.push(analysis);

            if (analysis.urgencyLevel) {
                businessData[businessId].urgencyLevels[analysis.urgencyLevel]++;
            }

            if (analysis.primaryComplaint) {
                businessData[businessId].complaintTypes.add(analysis.primaryComplaint);
            }
        });

        // Identify businesses at risk
        const businessTrends = [];

        Object.entries(businessData).forEach(([businessId, data]) => {
            const totalReviews = data.reviews.length;
            if (totalReviews === 0) return;

            // Calculate average severity
            const avgSeverity = data.reviews.reduce((sum, r) => sum + (r.severityScore || 0), 0) / totalReviews;

            // Calculate risk indicators
            const criticalReviews = data.urgencyLevels.critical;
            const highUrgencyReviews = data.urgencyLevels.high + criticalReviews;
            const diversityOfComplaints = data.complaintTypes.size;

            // Determine risk level
            let riskLevel = 'low';
            let riskFactors = [];

            if (criticalReviews >= 2) {
                riskLevel = 'critical';
                riskFactors.push(`${criticalReviews} critical urgency reviews`);
            } else if (highUrgencyReviews >= 3) {
                riskLevel = 'high';
                riskFactors.push(`${highUrgencyReviews} high urgency reviews`);
            } else if (avgSeverity >= 8) {
                riskLevel = 'high';
                riskFactors.push(`High average severity (${avgSeverity.toFixed(1)})`);
            } else if (totalReviews >= 5 && avgSeverity >= 6) {
                riskLevel = 'medium';
                riskFactors.push(`${totalReviews} reviews with severity ${avgSeverity.toFixed(1)}`);
            }

            if (diversityOfComplaints >= 4) {
                riskFactors.push(`${diversityOfComplaints} different complaint types`);
                if (riskLevel === 'low') riskLevel = 'medium';
            }

            // Recent concentration check
            const recentReviews = data.reviews.filter(r => {
                const reviewDate = new Date(r.reviewDate);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return reviewDate >= weekAgo;
            });

            if (recentReviews.length >= this.trendThresholds.rapidDetermination.reviewThreshold) {
                riskFactors.push(`${recentReviews.length} negative reviews in last 7 days`);
                if (riskLevel !== 'critical') {
                    riskLevel = riskLevel === 'high' ? 'critical' : 'high';
                }
            }

            if (riskLevel !== 'low') {
                businessTrends.push({
                    businessId,
                    businessName: data.businessName,
                    riskLevel,
                    riskFactors,
                    totalNegativeReviews: totalReviews,
                    averageSeverity: Math.round(avgSeverity * 10) / 10,
                    urgencyBreakdown: data.urgencyLevels,
                    complaintDiversity: diversityOfComplaints,
                    recentReviewCount: recentReviews.length
                });
            }
        });

        return businessTrends.sort((a, b) => {
            const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        });
    }

    async detectTemporalTrends(analysisResults) {
        const timeData = {};

        // Group by day of week and time patterns
        analysisResults.forEach(analysis => {
            const reviewDate = new Date(analysis.reviewDate);
            const dayOfWeek = reviewDate.getDay(); // 0 = Sunday
            const hour = reviewDate.getHours();

            const dayKey = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];

            if (!timeData[dayKey]) {
                timeData[dayKey] = { count: 0, totalSeverity: 0 };
            }

            timeData[dayKey].count++;
            timeData[dayKey].totalSeverity += analysis.severityScore || 0;
        });

        // Calculate temporal insights
        const temporalTrends = {
            dayOfWeekTrends: [],
            peakComplaintDays: [],
            totalReviewsAnalyzed: analysisResults.length
        };

        // Analyze day-of-week patterns
        Object.entries(timeData).forEach(([day, data]) => {
            if (data.count > 0) {
                temporalTrends.dayOfWeekTrends.push({
                    day,
                    count: data.count,
                    averageSeverity: Math.round((data.totalSeverity / data.count) * 10) / 10,
                    percentage: Math.round((data.count / analysisResults.length) * 100)
                });
            }
        });

        // Sort and identify peak days
        temporalTrends.dayOfWeekTrends.sort((a, b) => b.count - a.count);
        temporalTrends.peakComplaintDays = temporalTrends.dayOfWeekTrends.slice(0, 3);

        return temporalTrends;
    }

    calculateOverallAlertLevel(trendAnalysis) {
        let criticalCount = 0;
        let highCount = 0;

        // Count critical and high severity trends
        [
            ...trendAnalysis.volumeTrends,
            ...trendAnalysis.severityTrends,
            ...trendAnalysis.complaintTrends,
            ...trendAnalysis.businessTrends
        ].forEach(trend => {
            if (trend.severity === 'critical' || trend.riskLevel === 'critical') {
                criticalCount++;
            } else if (trend.severity === 'high' || trend.riskLevel === 'high') {
                highCount++;
            }
        });

        if (criticalCount >= 2) return 'critical';
        if (criticalCount >= 1 || highCount >= 3) return 'high';
        if (highCount >= 1) return 'medium';
        return 'normal';
    }

    emitTrendAlerts(trendAnalysis) {
        if (trendAnalysis.alertLevel === 'critical' || trendAnalysis.alertLevel === 'high') {
            this.emit('negative-trend-detected', {
                type: 'reputation_alert',
                level: trendAnalysis.alertLevel,
                summary: this.generateTrendSummary(trendAnalysis),
                trends: trendAnalysis,
                timestamp: new Date()
            });
        }

        // Emit specific alerts for new emerging complaints
        trendAnalysis.complaintTrends
            .filter(trend => trend.trend === 'new_emerging')
            .forEach(trend => {
                this.emit('new-complaint-type-detected', {
                    complaintType: trend.complaintType,
                    affectedBusinesses: trend.affectedBusinesses,
                    severity: trend.severity,
                    timestamp: new Date()
                });
            });

        // Emit alerts for businesses at critical risk
        trendAnalysis.businessTrends
            .filter(trend => trend.riskLevel === 'critical')
            .forEach(business => {
                this.emit('business-critical-risk-detected', {
                    businessId: business.businessId,
                    businessName: business.businessName,
                    riskFactors: business.riskFactors,
                    timestamp: new Date()
                });
            });
    }

    generateTrendSummary(trendAnalysis) {
        const summaryPoints = [];

        if (trendAnalysis.volumeTrends.length > 0) {
            const criticalVolume = trendAnalysis.volumeTrends.filter(t => t.severity === 'critical').length;
            if (criticalVolume > 0) {
                summaryPoints.push(`${criticalVolume} businesses showing critical increases in negative review volume`);
            }
        }

        if (trendAnalysis.severityTrends.length > 0) {
            const worsening = trendAnalysis.severityTrends.filter(t => t.trend.includes('worsening')).length;
            if (worsening > 0) {
                summaryPoints.push(`${worsening} businesses showing worsening review severity`);
            }
        }

        if (trendAnalysis.complaintTrends.length > 0) {
            const emerging = trendAnalysis.complaintTrends.filter(t => t.trend === 'new_emerging').length;
            if (emerging > 0) {
                summaryPoints.push(`${emerging} new complaint types emerging`);
            }
        }

        if (trendAnalysis.businessTrends.length > 0) {
            const critical = trendAnalysis.businessTrends.filter(t => t.riskLevel === 'critical').length;
            if (critical > 0) {
                summaryPoints.push(`${critical} businesses at critical reputation risk`);
            }
        }

        return summaryPoints.join('; ');
    }

    async getBusinessTrends(businessId) {
        // Implementation would query stored trend data
        return {
            businessId,
            currentTrend: 'stable',
            riskLevel: 'medium',
            lastUpdated: new Date()
        };
    }

    async shutdown() {
        console.log(`🔄 Shutting down Trend Detector Agent...`);
        this.historicalData.clear();
        this.isInitialized = false;
    }
}

module.exports = new TrendDetectorAgent();
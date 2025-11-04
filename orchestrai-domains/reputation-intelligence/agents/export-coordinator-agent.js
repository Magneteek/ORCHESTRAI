/**
 * Export Coordinator Agent
 * Handles data export in various formats (CSV, JSON, Excel, PDF reports)
 * Provides filtered export capabilities and scheduled report generation
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class ExportCoordinatorAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'export-coordinator';
        this.isInitialized = false;
        this.config = null;
        this.exportJobs = new Map();
        this.supportedFormats = ['json', 'csv', 'excel', 'pdf'];
        this.exportDirectory = '/tmp/orchestrai-exports';
    }

    async initialize(config) {
        try {
            this.config = config;

            // Ensure export directory exists
            await this.ensureExportDirectory();

            this.isInitialized = true;
            console.log(`✅ Export Coordinator Agent initialized`);
        } catch (error) {
            console.error(`❌ Failed to initialize Export Coordinator Agent:`, error);
            throw error;
        }
    }

    async ensureExportDirectory() {
        try {
            await fs.access(this.exportDirectory);
        } catch (error) {
            await fs.mkdir(this.exportDirectory, { recursive: true });
            console.log(`📁 Created export directory: ${this.exportDirectory}`);
        }
    }

    async exportReviews(criteria, format = 'json') {
        try {
            const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log(`📤 Starting export ${exportId} in ${format} format`);

            // Track export job
            this.exportJobs.set(exportId, {
                id: exportId,
                criteria,
                format,
                status: 'processing',
                startTime: new Date(),
                progress: 0
            });

            // Gather data based on criteria
            const exportData = await this.gatherExportData(criteria, exportId);

            // Generate export file
            const exportResult = await this.generateExportFile(exportData, format, exportId);

            // Update job status
            const job = this.exportJobs.get(exportId);
            job.status = 'completed';
            job.endTime = new Date();
            job.filePath = exportResult.filePath;
            job.fileName = exportResult.fileName;
            job.fileSize = exportResult.fileSize;
            job.recordCount = exportData.reviews.length;

            console.log(`✅ Export completed: ${exportResult.fileName} (${exportResult.fileSize} bytes)`);

            this.emit('export-completed', {
                exportId,
                ...exportResult,
                criteria,
                format
            });

            return {
                success: true,
                exportId,
                ...exportResult,
                recordCount: exportData.reviews.length,
                duration: job.endTime - job.startTime
            };

        } catch (error) {
            console.error(`❌ Export failed:`, error);

            // Update job status
            if (this.exportJobs.has(exportId)) {
                const job = this.exportJobs.get(exportId);
                job.status = 'failed';
                job.error = error.message;
                job.endTime = new Date();
            }

            throw error;
        }
    }

    async gatherExportData(criteria, exportId) {
        try {
            console.log(`🔍 Gathering data for export ${exportId}`);

            // Update progress
            this.updateJobProgress(exportId, 10);

            // Mock data gathering - in production, this would query the database
            const mockReviews = this.generateMockReviewData(criteria);

            this.updateJobProgress(exportId, 50);

            // Apply filters based on criteria
            const filteredReviews = this.applyExportFilters(mockReviews, criteria);

            this.updateJobProgress(exportId, 70);

            // Gather additional context data
            const contextData = await this.gatherContextData(filteredReviews);

            this.updateJobProgress(exportId, 90);

            return {
                reviews: filteredReviews,
                context: contextData,
                criteria,
                exportedAt: new Date(),
                totalCount: filteredReviews.length
            };

        } catch (error) {
            console.error(`❌ Failed to gather export data:`, error);
            throw error;
        }
    }

    generateMockReviewData(criteria) {
        // Generate realistic mock data for demonstration
        const mockBusinesses = [
            { id: '1', name: 'Amsterdam Dental Care', category: 'Dental clinic' },
            { id: '2', name: 'City Medical Center', category: 'Medical clinic' },
            { id: '3', name: 'Rotterdam Family Practice', category: 'Family doctor' },
            { id: '4', name: 'Utrecht Physiotherapy', category: 'Physical therapy' },
            { id: '5', name: 'The Hague Dental Studio', category: 'Dental clinic' }
        ];

        const mockComplaints = [
            'service_quality', 'staff_behavior', 'waiting_time', 'cleanliness',
            'pricing', 'communication', 'appointment', 'results'
        ];

        const mockReviewTexts = [
            'Very disappointed with the service. Had to wait over an hour for my appointment.',
            'Staff was rude and unprofessional. Would not recommend to anyone.',
            'The facility was not clean and equipment looked outdated.',
            'Overpriced for the quality of service provided. Much better options available.',
            'Poor communication from staff. No one explained what was happening.',
            'Appointment was cancelled last minute without proper notice.',
            'Results were not as promised. Feeling like I wasted my money.',
            'Long waiting times and no apology from staff for the delay.'
        ];

        const reviews = [];
        const now = new Date();

        for (let i = 0; i < 50; i++) {
            const business = mockBusinesses[Math.floor(Math.random() * mockBusinesses.length)];
            const daysAgo = Math.floor(Math.random() * 14); // Last 14 days
            const reviewDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

            reviews.push({
                id: `review_${i + 1}`,
                businessId: business.id,
                businessName: business.name,
                businessCategory: business.category,
                rating: Math.floor(Math.random() * 3) + 1, // 1-3 stars
                text: mockReviewTexts[Math.floor(Math.random() * mockReviewTexts.length)],
                author: `User ${i + 1}`,
                reviewDate: reviewDate,
                scrapedAt: new Date(),

                // Analysis data
                sentiment: {
                    polarity: 'negative',
                    score: -(Math.random() * 0.8 + 0.2)
                },
                severityScore: Math.random() * 4 + 6, // 6-10 scale
                primaryComplaint: mockComplaints[Math.floor(Math.random() * mockComplaints.length)],
                urgencyLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
                impactScore: Math.random() * 100,

                // Additional metadata
                textLength: mockReviewTexts[Math.floor(Math.random() * mockReviewTexts.length)].length,
                confidence: Math.random() * 30 + 70 // 70-100%
            });
        }

        return reviews;
    }

    applyExportFilters(reviews, criteria) {
        let filtered = reviews;

        // Date range filter
        if (criteria.dateFrom) {
            const fromDate = new Date(criteria.dateFrom);
            filtered = filtered.filter(review => new Date(review.reviewDate) >= fromDate);
        }

        if (criteria.dateTo) {
            const toDate = new Date(criteria.dateTo);
            filtered = filtered.filter(review => new Date(review.reviewDate) <= toDate);
        }

        // Rating filter
        if (criteria.maxRating) {
            filtered = filtered.filter(review => review.rating <= criteria.maxRating);
        }

        if (criteria.minRating) {
            filtered = filtered.filter(review => review.rating >= criteria.minRating);
        }

        // Business filter
        if (criteria.businessIds && criteria.businessIds.length > 0) {
            filtered = filtered.filter(review => criteria.businessIds.includes(review.businessId));
        }

        // Category filter
        if (criteria.categories && criteria.categories.length > 0) {
            filtered = filtered.filter(review => criteria.categories.includes(review.businessCategory));
        }

        // Complaint type filter
        if (criteria.complaintTypes && criteria.complaintTypes.length > 0) {
            filtered = filtered.filter(review => criteria.complaintTypes.includes(review.primaryComplaint));
        }

        // Severity filter
        if (criteria.minSeverity) {
            filtered = filtered.filter(review => review.severityScore >= criteria.minSeverity);
        }

        // Urgency filter
        if (criteria.urgencyLevels && criteria.urgencyLevels.length > 0) {
            filtered = filtered.filter(review => criteria.urgencyLevels.includes(review.urgencyLevel));
        }

        // Location filter
        if (criteria.location) {
            // In production, this would filter by geographic area
            console.log(`🌍 Location filter applied: ${criteria.location}`);
        }

        return filtered;
    }

    async gatherContextData(reviews) {
        // Generate summary statistics and context
        const businesses = [...new Set(reviews.map(r => r.businessId))];
        const categories = [...new Set(reviews.map(r => r.businessCategory))];
        const complaints = [...new Set(reviews.map(r => r.primaryComplaint))];

        const avgSeverity = reviews.reduce((sum, r) => sum + r.severityScore, 0) / reviews.length;
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        const urgencyDistribution = reviews.reduce((acc, review) => {
            acc[review.urgencyLevel] = (acc[review.urgencyLevel] || 0) + 1;
            return acc;
        }, {});

        const complaintDistribution = reviews.reduce((acc, review) => {
            acc[review.primaryComplaint] = (acc[review.primaryComplaint] || 0) + 1;
            return acc;
        }, {});

        return {
            summary: {
                totalReviews: reviews.length,
                uniqueBusinesses: businesses.length,
                categoriesRepresented: categories.length,
                averageSeverity: Math.round(avgSeverity * 10) / 10,
                averageRating: Math.round(avgRating * 10) / 10,
                dateRange: {
                    earliest: new Date(Math.min(...reviews.map(r => new Date(r.reviewDate)))),
                    latest: new Date(Math.max(...reviews.map(r => new Date(r.reviewDate))))
                }
            },
            distributions: {
                urgency: urgencyDistribution,
                complaints: complaintDistribution,
                categories: categories.reduce((acc, cat) => {
                    acc[cat] = reviews.filter(r => r.businessCategory === cat).length;
                    return acc;
                }, {})
            },
            topBusinesses: this.getTopBusinessesByReviewCount(reviews),
            topComplaints: Object.entries(complaintDistribution)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([complaint, count]) => ({ complaint, count }))
        };
    }

    getTopBusinessesByReviewCount(reviews) {
        const businessCounts = reviews.reduce((acc, review) => {
            if (!acc[review.businessId]) {
                acc[review.businessId] = {
                    id: review.businessId,
                    name: review.businessName,
                    category: review.businessCategory,
                    count: 0,
                    avgSeverity: 0,
                    severitySum: 0
                };
            }
            acc[review.businessId].count++;
            acc[review.businessId].severitySum += review.severityScore;
            return acc;
        }, {});

        return Object.values(businessCounts)
            .map(business => ({
                ...business,
                avgSeverity: Math.round((business.severitySum / business.count) * 10) / 10
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    async generateExportFile(exportData, format, exportId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `reputation_export_${timestamp}.${format}`;
        const filePath = path.join(this.exportDirectory, fileName);

        switch (format.toLowerCase()) {
            case 'json':
                return await this.generateJSONExport(exportData, filePath, fileName);
            case 'csv':
                return await this.generateCSVExport(exportData, filePath, fileName);
            case 'excel':
                return await this.generateExcelExport(exportData, filePath, fileName);
            case 'pdf':
                return await this.generatePDFExport(exportData, filePath, fileName);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    async generateJSONExport(exportData, filePath, fileName) {
        const jsonData = {
            exportInfo: {
                generatedAt: exportData.exportedAt,
                criteria: exportData.criteria,
                recordCount: exportData.totalCount,
                format: 'json'
            },
            summary: exportData.context.summary,
            distributions: exportData.context.distributions,
            topBusinesses: exportData.context.topBusinesses,
            topComplaints: exportData.context.topComplaints,
            reviews: exportData.reviews
        };

        const jsonString = JSON.stringify(jsonData, null, 2);
        await fs.writeFile(filePath, jsonString, 'utf8');

        const stats = await fs.stat(filePath);

        return {
            filePath,
            fileName,
            fileSize: stats.size,
            format: 'json',
            mimeType: 'application/json'
        };
    }

    async generateCSVExport(exportData, filePath, fileName) {
        const headers = [
            'Review ID',
            'Business ID',
            'Business Name',
            'Business Category',
            'Rating',
            'Review Text',
            'Author',
            'Review Date',
            'Scraped At',
            'Sentiment Polarity',
            'Sentiment Score',
            'Severity Score',
            'Primary Complaint',
            'Urgency Level',
            'Impact Score',
            'Text Length',
            'Confidence'
        ];

        const rows = exportData.reviews.map(review => [
            review.id,
            review.businessId,
            review.businessName,
            review.businessCategory,
            review.rating,
            `"${review.text.replace(/"/g, '""')}"`, // Escape quotes
            review.author,
            review.reviewDate.toISOString(),
            review.scrapedAt.toISOString(),
            review.sentiment.polarity,
            review.sentiment.score.toFixed(3),
            review.severityScore.toFixed(1),
            review.primaryComplaint,
            review.urgencyLevel,
            review.impactScore.toFixed(1),
            review.textLength,
            review.confidence.toFixed(1)
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\\n');
        await fs.writeFile(filePath, csvContent, 'utf8');

        const stats = await fs.stat(filePath);

        return {
            filePath,
            fileName,
            fileSize: stats.size,
            format: 'csv',
            mimeType: 'text/csv'
        };
    }

    async generateExcelExport(exportData, filePath, fileName) {
        // For now, generate a detailed CSV that could be opened in Excel
        // In production, you'd use a library like 'exceljs' for native Excel format

        const summaryData = [
            ['REPUTATION INTELLIGENCE EXPORT SUMMARY'],
            [''],
            ['Generated At:', exportData.exportedAt.toISOString()],
            ['Total Reviews:', exportData.totalCount],
            ['Unique Businesses:', exportData.context.summary.uniqueBusinesses],
            ['Average Severity:', exportData.context.summary.averageSeverity],
            ['Average Rating:', exportData.context.summary.averageRating],
            [''],
            ['TOP COMPLAINT TYPES:'],
            ...exportData.context.topComplaints.map(item => [item.complaint, item.count]),
            [''],
            ['REVIEWS DATA:'],
            ['Review ID', 'Business Name', 'Rating', 'Severity', 'Complaint Type', 'Urgency', 'Review Text']
        ];

        const reviewRows = exportData.reviews.map(review => [
            review.id,
            review.businessName,
            review.rating,
            review.severityScore.toFixed(1),
            review.primaryComplaint,
            review.urgencyLevel,
            `"${review.text.replace(/"/g, '""').substring(0, 100)}..."`
        ]);

        const allRows = [...summaryData, ...reviewRows];
        const csvContent = allRows.map(row => row.join(',')).join('\\n');

        await fs.writeFile(filePath, csvContent, 'utf8');

        const stats = await fs.stat(filePath);

        return {
            filePath,
            fileName: fileName.replace('.excel', '.csv'), // Use CSV extension for now
            fileSize: stats.size,
            format: 'excel',
            mimeType: 'application/vnd.ms-excel'
        };
    }

    async generatePDFExport(exportData, filePath, fileName) {
        // Generate HTML report that could be converted to PDF
        const htmlReport = this.generateHTMLReport(exportData);

        // For now, save as HTML file - in production, use a PDF library
        await fs.writeFile(filePath, htmlReport, 'utf8');

        const stats = await fs.stat(filePath);

        return {
            filePath,
            fileName: fileName.replace('.pdf', '.html'), // Use HTML extension for now
            fileSize: stats.size,
            format: 'pdf',
            mimeType: 'text/html'
        };
    }

    generateHTMLReport(exportData) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Reputation Intelligence Export Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .metric { background: white; border: 1px solid #dee2e6; padding: 15px; border-radius: 5px; }
        .metric h3 { margin: 0 0 10px 0; color: #495057; }
        .metric .value { font-size: 24px; font-weight: bold; color: #007bff; }
        .reviews-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .reviews-table th, .reviews-table td { border: 1px solid #dee2e6; padding: 8px; text-align: left; }
        .reviews-table th { background: #f8f9fa; }
        .severity-high { color: #dc3545; }
        .severity-medium { color: #ffc107; }
        .severity-low { color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Reputation Intelligence Export Report</h1>
        <p><strong>Generated:</strong> ${exportData.exportedAt.toLocaleString()}</p>
        <p><strong>Date Range:</strong> ${exportData.context.summary.dateRange.earliest.toLocaleDateString()} - ${exportData.context.summary.dateRange.latest.toLocaleDateString()}</p>
    </div>

    <div class="summary">
        <div class="metric">
            <h3>Total Reviews</h3>
            <div class="value">${exportData.context.summary.totalReviews}</div>
        </div>
        <div class="metric">
            <h3>Businesses Affected</h3>
            <div class="value">${exportData.context.summary.uniqueBusinesses}</div>
        </div>
        <div class="metric">
            <h3>Average Severity</h3>
            <div class="value">${exportData.context.summary.averageSeverity}/10</div>
        </div>
        <div class="metric">
            <h3>Average Rating</h3>
            <div class="value">${exportData.context.summary.averageRating}/5</div>
        </div>
    </div>

    <h2>📊 Top Complaint Types</h2>
    <table class="reviews-table">
        <tr><th>Complaint Type</th><th>Count</th><th>Percentage</th></tr>
        ${exportData.context.topComplaints.map(item => `
            <tr>
                <td>${item.complaint.replace(/_/g, ' ').toUpperCase()}</td>
                <td>${item.count}</td>
                <td>${Math.round((item.count / exportData.context.summary.totalReviews) * 100)}%</td>
            </tr>
        `).join('')}
    </table>

    <h2>🏢 Most Affected Businesses</h2>
    <table class="reviews-table">
        <tr><th>Business Name</th><th>Category</th><th>Review Count</th><th>Avg Severity</th></tr>
        ${exportData.context.topBusinesses.slice(0, 10).map(business => `
            <tr>
                <td>${business.name}</td>
                <td>${business.category}</td>
                <td>${business.count}</td>
                <td class="${business.avgSeverity >= 8 ? 'severity-high' : business.avgSeverity >= 6 ? 'severity-medium' : 'severity-low'}">${business.avgSeverity}</td>
            </tr>
        `).join('')}
    </table>

    <h2>📝 Recent Reviews Sample</h2>
    <table class="reviews-table">
        <tr><th>Business</th><th>Rating</th><th>Severity</th><th>Complaint</th><th>Review Text</th></tr>
        ${exportData.reviews.slice(0, 20).map(review => `
            <tr>
                <td>${review.businessName}</td>
                <td>${review.rating}/5</td>
                <td class="${review.severityScore >= 8 ? 'severity-high' : review.severityScore >= 6 ? 'severity-medium' : 'severity-low'}">${review.severityScore.toFixed(1)}</td>
                <td>${review.primaryComplaint.replace(/_/g, ' ')}</td>
                <td>${review.text.substring(0, 100)}${review.text.length > 100 ? '...' : ''}</td>
            </tr>
        `).join('')}
    </table>

    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; text-align: center;">
        <p><small>Generated by ORCHESTRAI Reputation Intelligence System</small></p>
    </div>
</body>
</html>
        `;
    }

    updateJobProgress(exportId, progress) {
        if (this.exportJobs.has(exportId)) {
            this.exportJobs.get(exportId).progress = progress;
            this.emit('export-progress', { exportId, progress });
        }
    }

    getExportJob(exportId) {
        return this.exportJobs.get(exportId) || null;
    }

    getActiveExports() {
        return Array.from(this.exportJobs.values())
            .filter(job => job.status === 'processing');
    }

    getCompletedExports() {
        return Array.from(this.exportJobs.values())
            .filter(job => job.status === 'completed')
            .sort((a, b) => b.endTime - a.endTime);
    }

    async cleanupOldExports() {
        try {
            const files = await fs.readdir(this.exportDirectory);
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

            for (const file of files) {
                const filePath = path.join(this.exportDirectory, file);
                const stats = await fs.stat(filePath);

                if (now - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                    console.log(`🗑️ Cleaned up old export file: ${file}`);
                }
            }

            // Clean up old job records
            for (const [exportId, job] of this.exportJobs.entries()) {
                if (job.endTime && now - job.endTime.getTime() > maxAge) {
                    this.exportJobs.delete(exportId);
                }
            }

        } catch (error) {
            console.error(`⚠️ Failed to cleanup old exports:`, error);
        }
    }

    async shutdown() {
        console.log(`🔄 Shutting down Export Coordinator Agent...`);

        // Cleanup temporary files
        await this.cleanupOldExports();

        this.exportJobs.clear();
        this.isInitialized = false;
    }
}

module.exports = new ExportCoordinatorAgent();
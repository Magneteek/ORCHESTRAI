/**
 * Review Scraper Agent
 * Advanced Playwright-based Google Business Profile review scraper
 * Filters for 1-3 star reviews within the last 14 days
 */

const { EventEmitter } = require('events');
const { chromium } = require('playwright');

class ReviewScraperAgent extends EventEmitter {
    constructor() {
        super();
        this.name = 'review-scraper';
        this.isInitialized = false;
        this.config = null;
        this.browser = null;
        this.context = null;
        this.activeScrapes = new Map();
        this.proxyList = [];
        this.currentProxyIndex = 0;
    }

    async initialize(config) {
        try {
            this.config = config;

            // Initialize Playwright browser with stealth mode
            await this.initializeBrowser();

            // Load proxy list if enabled
            if (config.proxyRotationEnabled) {
                await this.loadProxyList();
            }

            this.isInitialized = true;
            console.log(`✅ Review Scraper Agent initialized with Playwright`);
        } catch (error) {
            console.error(`❌ Failed to initialize Review Scraper Agent:`, error);
            throw error;
        }
    }

    async initializeBrowser() {
        try {
            this.browser = await chromium.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--window-size=1920,1080',
                    '--disable-web-security',
                    '--disable-blink-features=AutomationControlled'
                ]
            });

            this.context = await this.browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                viewport: { width: 1920, height: 1080 },
                locale: 'en-US',
                timezoneId: 'America/New_York'
            });

            // Add stealth configurations
            await this.context.addInitScript(() => {
                // Remove webdriver property
                delete navigator.__proto__.webdriver;

                // Override plugins
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3, 4, 5].map(() => ({ name: 'Chrome PDF Plugin' }))
                });

                // Override language
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en']
                });
            });

        } catch (error) {
            console.error(`❌ Failed to initialize browser:`, error);
            throw error;
        }
    }

    async loadProxyList() {
        // In production, this would load from a proxy service
        this.proxyList = [
            // Example proxy configurations
            // { server: 'proxy1.example.com:8080', username: 'user', password: 'pass' },
            // { server: 'proxy2.example.com:8080', username: 'user', password: 'pass' }
        ];
        console.log(`🔄 Loaded ${this.proxyList.length} proxy servers`);
    }

    async processBusinesses(businesses) {
        try {
            console.log(`🔍 Starting review scraping for ${businesses.length} businesses`);

            const scrapePromises = businesses.map(business =>
                this.scrapeBusinessReviews(business)
            );

            // Process in batches to respect rate limits
            const batchSize = this.config.maxConcurrentScrapes || 3;
            const results = [];

            for (let i = 0; i < scrapePromises.length; i += batchSize) {
                const batch = scrapePromises.slice(i, i + batchSize);
                const batchResults = await Promise.allSettled(batch);

                results.push(...batchResults);

                // Rate limiting delay between batches
                if (i + batchSize < scrapePromises.length) {
                    await this.delay(this.config.rateLimitDelay || 2000);
                }
            }

            // Process results and collect successful scrapes
            const allNegativeReviews = [];
            let successfulScrapes = 0;
            let failedScrapes = 0;

            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    allNegativeReviews.push(...result.value);
                    successfulScrapes++;
                } else {
                    failedScrapes++;
                    console.error(`⚠️ Failed to scrape business ${businesses[index]?.name}:`, result.reason);
                }
            });

            console.log(`📊 Scraping complete: ${successfulScrapes} successful, ${failedScrapes} failed`);
            console.log(`⚠️ Found ${allNegativeReviews.length} total negative reviews`);

            if (allNegativeReviews.length > 0) {
                this.emit('negative-reviews-found', allNegativeReviews);
            }

            return {
                totalReviews: allNegativeReviews.length,
                successfulScrapes,
                failedScrapes
            };

        } catch (error) {
            console.error(`❌ Failed to process businesses:`, error);
            throw error;
        }
    }

    async scrapeBusinessReviews(business) {
        const scrapeId = `scrape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        try {
            this.activeScrapes.set(scrapeId, {
                businessId: business.id,
                businessName: business.name,
                startTime: new Date(),
                status: 'active'
            });

            console.log(`🔍 Scraping reviews for: ${business.name}`);

            // Create new page for this scrape
            const page = await this.context.newPage();

            // Set up proxy if available
            if (this.proxyList.length > 0) {
                await this.rotateProxy(page);
            }

            // Navigate to Google Maps business page
            const mapsUrl = this.buildGoogleMapsUrl(business);
            await page.goto(mapsUrl, { waitUntil: 'networkidle', timeout: 30000 });

            // Wait for page to load and find reviews section
            await this.waitForReviewsSection(page);

            // Click on reviews tab to expand
            await this.expandReviewsSection(page);

            // Scroll and load reviews
            const allReviews = await this.loadAllReviews(page);

            // Filter for negative reviews within date range
            const negativeReviews = this.filterNegativeReviews(allReviews, business);

            await page.close();

            this.activeScrapes.get(scrapeId).status = 'completed';
            this.activeScrapes.get(scrapeId).endTime = new Date();
            this.activeScrapes.get(scrapeId).reviewsFound = negativeReviews.length;

            console.log(`✅ Found ${negativeReviews.length} negative reviews for ${business.name}`);

            return negativeReviews;

        } catch (error) {
            console.error(`❌ Failed to scrape ${business.name}:`, error);

            if (this.activeScrapes.has(scrapeId)) {
                this.activeScrapes.get(scrapeId).status = 'failed';
                this.activeScrapes.get(scrapeId).error = error.message;
            }

            throw error;
        } finally {
            // Clean up active scrape tracking
            setTimeout(() => {
                this.activeScrapes.delete(scrapeId);
            }, 60000); // Keep for 1 minute for monitoring
        }
    }

    buildGoogleMapsUrl(business) {
        // Build URL using either place_id or search query
        if (business.placeId) {
            return `https://www.google.com/maps/place/?q=place_id:${business.placeId}`;
        } else {
            const query = encodeURIComponent(`${business.name} ${business.address}`);
            return `https://www.google.com/maps/search/${query}`;
        }
    }

    async waitForReviewsSection(page) {
        try {
            // Wait for various possible review section selectors
            await page.waitForSelector([
                '[data-value="Reviews"]',
                'button[aria-label*="reviews"]',
                '.section-star-array',
                '[role="tablist"]'
            ].join(','), { timeout: 15000 });

        } catch (error) {
            console.log(`⚠️ Reviews section not immediately visible, continuing...`);
        }
    }

    async expandReviewsSection(page) {
        try {
            // Try multiple methods to access reviews
            const reviewsButton = await page.locator([
                '[data-value="Reviews"]',
                'button[aria-label*="reviews"]',
                'button:has-text("Reviews")'
            ].join(','));

            if (await reviewsButton.count() > 0) {
                await reviewsButton.first().click();
                await page.waitForTimeout(2000);
            }

            // Sort by newest if option available
            const sortButton = await page.locator([
                'button[aria-label*="Sort"]',
                'button:has-text("Sort")',
                '[data-value="Sort"]'
            ].join(','));

            if (await sortButton.count() > 0) {
                await sortButton.first().click();
                await page.waitForTimeout(1000);

                const newestOption = await page.locator([
                    'div[role="menuitemradio"]:has-text("Newest")',
                    'li:has-text("Newest")'
                ].join(','));

                if (await newestOption.count() > 0) {
                    await newestOption.first().click();
                    await page.waitForTimeout(2000);
                }
            }

        } catch (error) {
            console.log(`⚠️ Could not expand/sort reviews section:`, error.message);
        }
    }

    async loadAllReviews(page) {
        const reviews = [];
        let previousReviewCount = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 10;

        while (scrollAttempts < maxScrollAttempts) {
            try {
                // Extract current reviews on page
                const currentReviews = await page.evaluate(() => {
                    const reviewElements = document.querySelectorAll('[data-review-id], .section-review, [jsaction*="review"]');
                    const reviews = [];

                    reviewElements.forEach(element => {
                        try {
                            // Extract review data
                            const reviewData = {
                                id: element.getAttribute('data-review-id') || Math.random().toString(36),
                                text: '',
                                rating: null,
                                date: '',
                                author: '',
                                element: element.outerHTML.substring(0, 500) // For debugging
                            };

                            // Extract rating
                            const ratingElement = element.querySelector('.section-review-stars, [aria-label*="star"], .review-score');
                            if (ratingElement) {
                                const ariaLabel = ratingElement.getAttribute('aria-label') || '';
                                const ratingMatch = ariaLabel.match(/(\\d+)\\s*star/);
                                if (ratingMatch) {
                                    reviewData.rating = parseInt(ratingMatch[1]);
                                }
                            }

                            // Extract review text
                            const textElement = element.querySelector('.section-review-text, .review-full-text, [jsaction*="expand"]');
                            if (textElement) {
                                reviewData.text = textElement.textContent.trim();
                            }

                            // Extract date
                            const dateElement = element.querySelector('.section-review-publish-date, .review-publish-date');
                            if (dateElement) {
                                reviewData.date = dateElement.textContent.trim();
                            }

                            // Extract author
                            const authorElement = element.querySelector('.section-review-title, .review-author');
                            if (authorElement) {
                                reviewData.author = authorElement.textContent.trim();
                            }

                            // Only add if we have rating data
                            if (reviewData.rating !== null) {
                                reviews.push(reviewData);
                            }

                        } catch (e) {
                            console.log('Error extracting review:', e);
                        }
                    });

                    return reviews;
                });

                // Add new reviews (deduplicate by ID)
                const existingIds = new Set(reviews.map(r => r.id));
                const newReviews = currentReviews.filter(r => !existingIds.has(r.id));
                reviews.push(...newReviews);

                console.log(`📖 Loaded ${reviews.length} total reviews (+${newReviews.length} new)`);

                // Check if we got new reviews
                if (reviews.length === previousReviewCount) {
                    scrollAttempts++;
                } else {
                    scrollAttempts = 0; // Reset if we're still finding new reviews
                }

                previousReviewCount = reviews.length;

                // Scroll to load more reviews
                await page.evaluate(() => {
                    const reviewsContainer = document.querySelector('.section-layout .section-scrollbox, [role="main"]');
                    if (reviewsContainer) {
                        reviewsContainer.scrollTop = reviewsContainer.scrollHeight;
                    } else {
                        window.scrollTo(0, document.body.scrollHeight);
                    }
                });

                await page.waitForTimeout(1500);

                // Stop if we have enough reviews for analysis
                if (reviews.length >= this.config.reviewAnalysisDepth) {
                    break;
                }

            } catch (error) {
                console.error(`⚠️ Error loading reviews:`, error);
                scrollAttempts++;
            }
        }

        console.log(`📊 Total reviews loaded: ${reviews.length}`);
        return reviews;
    }

    filterNegativeReviews(reviews, business) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.recentReviewDays);

        return reviews.filter(review => {
            // Filter by rating (1-3 stars)
            if (!review.rating || review.rating > this.config.negativeRatingThreshold) {
                return false;
            }

            // Filter by date (within last 14 days)
            const reviewDate = this.parseReviewDate(review.date);
            if (reviewDate && reviewDate < cutoffDate) {
                return false;
            }

            return true;
        }).map(review => ({
            ...review,
            businessId: business.id,
            businessName: business.name,
            businessAddress: business.address,
            scrapedAt: new Date(),
            reviewDate: this.parseReviewDate(review.date)
        }));
    }

    parseReviewDate(dateString) {
        try {
            if (!dateString) return null;

            // Handle relative dates like "2 days ago", "1 week ago", etc.
            const now = new Date();

            if (dateString.includes('day') && dateString.includes('ago')) {
                const daysMatch = dateString.match(/(\\d+)\\s*days?\\s*ago/);
                if (daysMatch) {
                    const daysAgo = parseInt(daysMatch[1]);
                    const date = new Date(now);
                    date.setDate(date.getDate() - daysAgo);
                    return date;
                }
            }

            if (dateString.includes('week') && dateString.includes('ago')) {
                const weeksMatch = dateString.match(/(\\d+)\\s*weeks?\\s*ago/);
                if (weeksMatch) {
                    const weeksAgo = parseInt(weeksMatch[1]);
                    const date = new Date(now);
                    date.setDate(date.getDate() - (weeksAgo * 7));
                    return date;
                }
            }

            if (dateString.includes('month') && dateString.includes('ago')) {
                const monthsMatch = dateString.match(/(\\d+)\\s*months?\\s*ago/);
                if (monthsMatch) {
                    const monthsAgo = parseInt(monthsMatch[1]);
                    const date = new Date(now);
                    date.setMonth(date.getMonth() - monthsAgo);
                    return date;
                }
            }

            // Try to parse as regular date
            return new Date(dateString);

        } catch (error) {
            console.log(`⚠️ Could not parse date: ${dateString}`);
            return null;
        }
    }

    async rotateProxy(page) {
        if (this.proxyList.length === 0) return;

        const proxy = this.proxyList[this.currentProxyIndex];
        this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;

        await page.setExtraHTTPHeaders({
            'Proxy-Authorization': `Basic ${Buffer.from(`${proxy.username}:${proxy.password}`).toString('base64')}`
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getActiveScrapes() {
        return Array.from(this.activeScrapes.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }

    async shutdown() {
        console.log(`🔄 Shutting down Review Scraper Agent...`);

        // Close browser
        if (this.browser) {
            await this.browser.close();
        }

        this.isInitialized = false;
        console.log(`✅ Review Scraper Agent shutdown complete`);
    }
}

module.exports = new ReviewScraperAgent();
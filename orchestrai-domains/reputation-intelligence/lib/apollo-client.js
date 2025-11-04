/**
 * Apollo.io API Client
 * Provides enrichment capabilities for business and contact data
 *
 * Features:
 * - Person enrichment (emails, phone numbers, job titles)
 * - Organization enrichment (company details, employee count, tech stack)
 * - Search capabilities for finding decision makers
 * - Rate limiting and retry logic
 * - Error handling and validation
 */

const axios = require('axios');
const { EventEmitter } = require('events');

class ApolloClient extends EventEmitter {
    constructor(apiKey) {
        super();
        this.apiKey = apiKey;
        this.baseURL = 'https://api.apollo.io/v1';
        this.rateLimitDelay = 1000; // 1 second between requests
        this.maxRetries = 3;
        this.lastRequestTime = 0;

        // Initialize axios instance with base configuration
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            timeout: 30000 // 30 second timeout
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor for rate limiting and auth
        this.client.interceptors.request.use(
            async (config) => {
                // Add API key to request
                config.headers['X-Api-Key'] = this.apiKey;

                // Rate limiting
                const now = Date.now();
                const timeSinceLastRequest = now - this.lastRequestTime;
                if (timeSinceLastRequest < this.rateLimitDelay) {
                    const delay = this.rateLimitDelay - timeSinceLastRequest;
                    await this.sleep(delay);
                }
                this.lastRequestTime = Date.now();

                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                this.emit('request-success', {
                    endpoint: response.config.url,
                    status: response.status
                });
                return response;
            },
            async (error) => {
                const originalRequest = error.config;

                // Handle rate limiting (429)
                if (error.response?.status === 429 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const retryAfter = error.response.headers['retry-after'] || 60;
                    console.warn(`⚠️ Apollo API rate limit hit, retrying after ${retryAfter}s`);
                    await this.sleep(retryAfter * 1000);
                    return this.client(originalRequest);
                }

                // Handle server errors with retry
                if (error.response?.status >= 500 && originalRequest._retries < this.maxRetries) {
                    originalRequest._retries = (originalRequest._retries || 0) + 1;
                    console.warn(`⚠️ Server error, retry ${originalRequest._retries}/${this.maxRetries}`);
                    await this.sleep(2000 * originalRequest._retries); // Exponential backoff
                    return this.client(originalRequest);
                }

                this.emit('request-error', {
                    endpoint: error.config?.url,
                    status: error.response?.status,
                    message: error.message
                });

                return Promise.reject(error);
            }
        );
    }

    /**
     * Enrich organization data by domain
     * @param {string} domain - Company website domain (e.g., "example.com")
     * @returns {Promise<Object>} Enriched organization data
     */
    async enrichOrganization(domain) {
        try {
            console.log(`🔍 Enriching organization: ${domain}`);

            const response = await this.client.post('/organizations/enrich', {
                domain: domain
            });

            const org = response.data.organization;

            return {
                success: true,
                data: {
                    id: org.id,
                    name: org.name,
                    domain: org.website_url,
                    industry: org.industry,
                    subIndustry: org.sub_industry,
                    employeeCount: org.estimated_num_employees,
                    revenue: org.annual_revenue,
                    location: {
                        city: org.city,
                        state: org.state,
                        country: org.country,
                        address: org.primary_domain
                    },
                    socialMedia: {
                        linkedin: org.linkedin_url,
                        twitter: org.twitter_url,
                        facebook: org.facebook_url
                    },
                    techStack: org.technologies || [],
                    founded: org.founded_year,
                    description: org.short_description,
                    enrichedAt: new Date()
                },
                raw: org
            };
        } catch (error) {
            console.error(`❌ Failed to enrich organization ${domain}:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                domain
            };
        }
    }

    /**
     * Enrich person data by email
     * @param {string} email - Person's email address
     * @returns {Promise<Object>} Enriched person data
     */
    async enrichPerson(email) {
        try {
            console.log(`🔍 Enriching person: ${email}`);

            const response = await this.client.post('/people/match', {
                email: email,
                reveal_personal_emails: true,
                reveal_phone_number: true
            });

            const person = response.data.person;

            return {
                success: true,
                data: {
                    id: person.id,
                    firstName: person.first_name,
                    lastName: person.last_name,
                    name: person.name,
                    title: person.title,
                    seniority: person.seniority,
                    department: person.functions,
                    email: person.email,
                    personalEmails: person.personal_emails || [],
                    phoneNumbers: person.phone_numbers || [],
                    linkedinUrl: person.linkedin_url,
                    organization: {
                        id: person.organization?.id,
                        name: person.organization?.name,
                        domain: person.organization?.website_url
                    },
                    location: {
                        city: person.city,
                        state: person.state,
                        country: person.country
                    },
                    enrichedAt: new Date()
                },
                raw: person
            };
        } catch (error) {
            console.error(`❌ Failed to enrich person ${email}:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                email
            };
        }
    }

    /**
     * Search for decision makers at an organization
     * @param {Object} searchParams - Search parameters
     * @returns {Promise<Object>} Search results with contacts
     */
    async searchPeople(searchParams) {
        try {
            const {
                organizationDomain,
                titles = [],
                seniorities = [],
                departments = [],
                limit = 25
            } = searchParams;

            console.log(`🔍 Searching for decision makers at ${organizationDomain}`);

            const requestBody = {
                page: 1,
                per_page: limit,
                organization_domains: [organizationDomain]
            };

            // Add optional filters
            if (titles.length > 0) requestBody.person_titles = titles;
            if (seniorities.length > 0) requestBody.person_seniorities = seniorities;
            if (departments.length > 0) requestBody.person_functions = departments;

            const response = await this.client.post('/mixed_people/search', requestBody);

            const people = response.data.people || [];

            return {
                success: true,
                totalResults: response.data.pagination?.total_entries || 0,
                contacts: people.map(person => ({
                    id: person.id,
                    name: person.name,
                    title: person.title,
                    email: person.email,
                    linkedinUrl: person.linkedin_url,
                    organization: person.organization?.name,
                    seniority: person.seniority,
                    department: person.departments?.[0]
                })),
                raw: people
            };
        } catch (error) {
            console.error(`❌ Failed to search people:`, error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                searchParams
            };
        }
    }

    /**
     * Bulk enrich multiple organizations
     * @param {Array<string>} domains - Array of domain names
     * @returns {Promise<Array>} Array of enrichment results
     */
    async bulkEnrichOrganizations(domains) {
        console.log(`🔍 Bulk enriching ${domains.length} organizations`);

        const results = [];
        for (const domain of domains) {
            const result = await this.enrichOrganization(domain);
            results.push(result);

            // Emit progress event
            this.emit('bulk-enrichment-progress', {
                current: results.length,
                total: domains.length,
                domain
            });
        }

        return results;
    }

    /**
     * Extract domain from various business data formats
     * @param {Object} business - Business object with various possible domain fields
     * @returns {string|null} Extracted domain or null
     */
    extractDomain(business) {
        // Try different possible domain field names
        const possibleDomainFields = [
            'website',
            'url',
            'domain',
            'website_url',
            'company_website',
            'businessWebsite'
        ];

        for (const field of possibleDomainFields) {
            if (business[field]) {
                return this.normalizeDomain(business[field]);
            }
        }

        return null;
    }

    /**
     * Normalize domain to standard format
     * @param {string} url - URL or domain string
     * @returns {string} Normalized domain
     */
    normalizeDomain(url) {
        try {
            // Remove protocol and www
            let domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '');

            // Remove path and query parameters
            domain = domain.split('/')[0].split('?')[0];

            return domain.toLowerCase();
        } catch (error) {
            console.warn(`⚠️ Failed to normalize domain: ${url}`);
            return url;
        }
    }

    /**
     * Health check - verify API connectivity and credentials
     * @returns {Promise<Object>} Health check result
     */
    async healthCheck() {
        try {
            // Use organization enrichment as a simple health check
            const response = await this.client.post('/organizations/enrich', {
                domain: 'apollo.io' // Apollo's own domain - always exists
            });

            return {
                healthy: true,
                message: 'Apollo API connection successful',
                authenticated: true,
                organization: response.data.organization?.name,
                timestamp: new Date()
            };
        } catch (error) {
            return {
                healthy: false,
                authenticated: error.response?.status !== 401 && error.response?.status !== 403,
                message: error.response?.data?.message || error.message,
                status: error.response?.status,
                timestamp: new Date()
            };
        }
    }

    /**
     * Sleep utility for rate limiting
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = ApolloClient;

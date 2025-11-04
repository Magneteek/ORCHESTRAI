#!/usr/bin/env node

// DataForSEO MCP Server for ORCHESTRAI
// Comprehensive SEO data integration with DataForSEO Labs API
// Implements all available tools except backlink analysis

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios');
const SafeJSON = require('../utils/safe-json');

class DataForSEOServer {
  constructor() {
    this.server = new Server(
      {
        name: "dataforseo-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.apiConfig = {
      baseURL: 'https://api.dataforseo.com/v3',
      username: process.env.DATAFORSEO_USERNAME,
      password: process.env.DATAFORSEO_PASSWORD,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Validate API credentials
    if (!this.apiConfig.username || !this.apiConfig.password) {
      console.error('  DataForSEO credentials not found in environment variables');
      console.error('   Please set DATAFORSEO_USERNAME and DATAFORSEO_PASSWORD');
    }

    // Cache for API responses to prevent duplicate calls
    this.cache = new Map();
    this.cacheTimeout = 60 * 60 * 1000; // 1 hour cache

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Keyword Research Tools
          {
            name: "keyword_overview",
            description: "Get comprehensive keyword data including search volume, CPC, and competition",
            inputSchema: {
              type: "object",
              properties: {
                keywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of keywords to analyze (up to 1000)"
                },
                location_code: {
                  type: "number",
                  description: "Location code (default: 2840 for USA)",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name (default: English)",
                  default: "English"
                }
              },
              required: ["keywords"]
            }
          },
          {
            name: "related_keywords",
            description: "Find related keywords based on Google's 'searches related to' data",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Seed keyword to find related terms"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Max number of results (up to 1000)",
                  default: 100
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "keyword_suggestions",
            description: "Get keyword suggestions that match the specified seed keyword",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Seed keyword for suggestions"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Max number of results",
                  default: 100
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "keyword_ideas",
            description: "Get keyword ideas that fall into the same category as the seed keyword",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Seed keyword for category-based ideas"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Max number of results",
                  default: 100
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "search_intent",
            description: "Analyze search intent for keywords (informational, navigational, commercial, transactional)",
            inputSchema: {
              type: "object",
              properties: {
                keywords: {
                  type: "array",
                  items: { type: "string" },
                  description: "Keywords to analyze for search intent"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["keywords"]
            }
          },
          // SERP Analysis Tools
          {
            name: "serp_competitors",
            description: "Analyze SERP competitors for a keyword",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Keyword to analyze SERP for"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Number of competitors to return",
                  default: 10
                }
              },
              required: ["keyword"]
            }
          },
          // Domain Analysis Tools
          {
            name: "domain_keywords",
            description: "Get keywords that a domain ranks for",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Target domain to analyze"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Max number of keywords",
                  default: 100
                }
              },
              required: ["target"]
            }
          },
          {
            name: "competitor_domains",
            description: "Find competitor domains for a target domain",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Target domain"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Number of competitors",
                  default: 20
                }
              },
              required: ["target"]
            }
          },
          {
            name: "domain_intersection",
            description: "Find keywords for which multiple domains rank in SERPs",
            inputSchema: {
              type: "object",
              properties: {
                targets: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of domains to intersect"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                limit: {
                  type: "number",
                  description: "Max results",
                  default: 100
                }
              },
              required: ["targets"]
            }
          },
          {
            name: "traffic_estimation",
            description: "Estimate organic traffic for domains",
            inputSchema: {
              type: "object",
              properties: {
                targets: {
                  type: "array",
                  items: { type: "string" },
                  description: "Domains to estimate traffic for"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["targets"]
            }
          },
          // Market Analysis Tools
          {
            name: "categories_for_domain",
            description: "Get categories for a domain based on keyword rankings",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Target domain"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["target"]
            }
          },
          {
            name: "top_searches",
            description: "Get top searches/trending keywords in specific categories",
            inputSchema: {
              type: "object",
              properties: {
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                },
                category_code: {
                  type: "number",
                  description: "Category code (optional)"
                },
                limit: {
                  type: "number",
                  description: "Max results",
                  default: 100
                }
              }
            }
          },
          // OnPage API - Technical SEO Auditing Tools (Live/Instant)
          {
            name: "onpage_lighthouse",
            description: "Run comprehensive Lighthouse performance audit for technical SEO",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to audit"
                },
                enable_javascript: {
                  type: "boolean",
                  description: "Enable JavaScript rendering",
                  default: true
                },
                audits: {
                  type: "array",
                  items: { type: "string" },
                  description: "Specific audits to run (optional)",
                  default: ["accessibility", "best-practices", "performance", "pwa", "seo"]
                }
              },
              required: ["url"]
            }
          },
          {
            name: "onpage_instant_summary",
            description: "Get instant on-page SEO summary for a single page including Core Web Vitals",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to analyze"
                },
                enable_javascript: {
                  type: "boolean",
                  description: "Enable JavaScript rendering",
                  default: true
                }
              },
              required: ["url"]
            }
          },
          {
            name: "onpage_page_screenshot",
            description: "Take full-page screenshot for visual SEO analysis",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to screenshot"
                },
                full_page_screenshot: {
                  type: "boolean",
                  description: "Full page screenshot",
                  default: true
                },
                enable_javascript: {
                  type: "boolean",
                  description: "Enable JavaScript rendering",
                  default: true
                }
              },
              required: ["url"]
            }
          },
          // OnPage API - Full Site Crawling (Task Management)
          {
            name: "onpage_task_post",
            description: "Start full website crawl with JavaScript rendering and customizable parameters",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Website URL to crawl (e.g., 'https://example.com')"
                },
                max_crawl_pages: {
                  type: "number",
                  description: "Maximum pages to crawl (default: 100)",
                  default: 100
                },
                enable_javascript: {
                  type: "boolean",
                  description: "Enable JavaScript rendering",
                  default: true
                },
                enable_browser_rendering: {
                  type: "boolean",
                  description: "Enable full browser rendering for Core Web Vitals",
                  default: false
                },
                custom_js: {
                  type: "string",
                  description: "Custom JavaScript to execute on each page"
                },
                load_resources: {
                  type: "boolean",
                  description: "Load images, stylesheets, scripts",
                  default: true
                },
                check_spell: {
                  type: "boolean",
                  description: "Check spelling errors",
                  default: false
                },
                calculate_keyword_density: {
                  type: "boolean",
                  description: "Calculate keyword density",
                  default: true
                }
              },
              required: ["target"]
            }
          },
          {
            name: "onpage_tasks_ready",
            description: "Check which crawl tasks have completed and are ready for data retrieval",
            inputSchema: {
              type: "object",
              properties: {}
            }
          },
          {
            name: "onpage_summary",
            description: "Get summary of on-page issues found during website crawl (requires completed task)",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_pages",
            description: "Get list of all crawled pages with check-ups and performance metrics",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of pages to return",
                  default: 100
                },
                offset: {
                  type: "number",
                  description: "Offset for pagination",
                  default: 0
                },
                filters: {
                  type: "array",
                  description: "Filter criteria (e.g., ['status_code', '=', 404])"
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_resources",
            description: "Get list of resources (images, scripts, stylesheets, etc.) found on website",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of resources to return",
                  default: 100
                },
                filters: {
                  type: "array",
                  description: "Filter criteria (e.g., ['resource_type', '=', 'image'])"
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_links",
            description: "Get list of internal and external links detected on target website",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of links to return",
                  default: 100
                },
                filters: {
                  type: "array",
                  description: "Filter criteria (e.g., ['dofollow', '=', true])"
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_redirect_chains",
            description: "Identify and trace redirect chains on website",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of redirect chains to return",
                  default: 100
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_non_indexable",
            description: "Get pages blocked from being indexed by search engines",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of pages to return",
                  default: 100
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_duplicate_tags",
            description: "Find pages with duplicate title or description tags",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                limit: {
                  type: "number",
                  description: "Max number of duplicates to return",
                  default: 100
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_duplicate_content",
            description: "Find pages with content similar to specified page",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                url: {
                  type: "string",
                  description: "URL of page to compare against"
                },
                limit: {
                  type: "number",
                  description: "Max number of similar pages to return",
                  default: 100
                }
              },
              required: ["id", "url"]
            }
          },
          {
            name: "onpage_keyword_density",
            description: "Get keyword density and frequency data for website",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                keyword: {
                  type: "string",
                  description: "Keyword to analyze density for"
                },
                limit: {
                  type: "number",
                  description: "Max number of results to return",
                  default: 100
                }
              },
              required: ["id"]
            }
          },
          {
            name: "onpage_waterfall",
            description: "Get page speed waterfall data for performance analysis",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                url: {
                  type: "string",
                  description: "Specific page URL to get waterfall for"
                }
              },
              required: ["id", "url"]
            }
          },
          {
            name: "onpage_raw_html",
            description: "Get raw HTML source of a crawled page",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                url: {
                  type: "string",
                  description: "Specific page URL to get HTML for"
                }
              },
              required: ["id", "url"]
            }
          },
          {
            name: "onpage_pages_by_resource",
            description: "Find pages that contain a specific resource (image, script, etc.)",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID from completed crawl"
                },
                resource_url: {
                  type: "string",
                  description: "URL of resource to search for"
                },
                limit: {
                  type: "number",
                  description: "Max number of pages to return",
                  default: 100
                }
              },
              required: ["id", "resource_url"]
            }
          },
          {
            name: "onpage_force_stop",
            description: "Force stop a running crawl task",
            inputSchema: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  description: "Task ID to stop"
                }
              },
              required: ["id"]
            }
          },
          // Additional SERP API - Specialized Search Types
          {
            name: "serp_google_maps",
            description: "Analyze Google Maps local search results for local SEO",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Search query for Maps"
                },
                location_name: {
                  type: "string",
                  description: "Location name (e.g., 'New York,New York,United States')"
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "serp_google_news",
            description: "Analyze Google News results for news SEO opportunities",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Search query for news"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "serp_google_images",
            description: "Analyze Google Images results for image SEO optimization",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Search query for images"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "serp_google_jobs",
            description: "Analyze Google Jobs results for job posting SEO",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Job search query"
                },
                location_name: {
                  type: "string",
                  description: "Location for job search"
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["keyword"]
            }
          },
          // Content Analysis API
          {
            name: "content_analysis_summary",
            description: "Analyze content quality and SEO optimization opportunities",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to analyze content"
                },
                keyword: {
                  type: "string",
                  description: "Target keyword for content analysis"
                },
                enable_javascript: {
                  type: "boolean",
                  description: "Enable JavaScript rendering",
                  default: true
                }
              },
              required: ["url", "keyword"]
            }
          },
          {
            name: "content_analysis_phrase_trends",
            description: "Analyze phrase trends and semantic relationships in content",
            inputSchema: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  description: "URL to analyze"
                },
                keyword: {
                  type: "string",
                  description: "Target keyword"
                },
                location_code: {
                  type: "number",
                  description: "Location code",
                  default: 2840
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "English"
                }
              },
              required: ["url", "keyword"]
            }
          },
          // Domain Analytics API - Technology and Analysis
          {
            name: "domain_technologies",
            description: "Analyze technologies used by a domain (useful for competitor analysis)",
            inputSchema: {
              type: "object",
              properties: {
                target: {
                  type: "string",
                  description: "Domain to analyze technologies"
                },
                limit: {
                  type: "number",
                  description: "Max results",
                  default: 100
                }
              },
              required: ["target"]
            }
          },
          {
            name: "domain_whois_overview",
            description: "Get domain WHOIS information for competitive intelligence",
            inputSchema: {
              type: "object",
              properties: {
                targets: {
                  type: "array",
                  items: { type: "string" },
                  description: "Domains to get WHOIS info for"
                }
              },
              required: ["targets"]
            }
          },
          // Business Data API - Reviews and Local Business Intelligence
          {
            name: "business_data_search",
            description: "Search for businesses in a specific location with keyword filtering",
            inputSchema: {
              type: "object",
              properties: {
                keyword: {
                  type: "string",
                  description: "Business search query (e.g., 'tandarts', 'restaurant')"
                },
                location_name: {
                  type: "string",
                  description: "Location (e.g., 'Amsterdam,Netherlands', 'Nederland')"
                },
                location_code: {
                  type: "number",
                  description: "Location code (2528 for Netherlands)",
                  default: 2528
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "Dutch"
                },
                limit: {
                  type: "number",
                  description: "Max number of businesses to return",
                  default: 50
                }
              },
              required: ["keyword"]
            }
          },
          {
            name: "business_data_info",
            description: "Get detailed information about a specific business using its CID",
            inputSchema: {
              type: "object",
              properties: {
                cid: {
                  type: "string",
                  description: "Business Client ID from Google My Business"
                },
                location_code: {
                  type: "number",
                  description: "Location code (2528 for Netherlands)",
                  default: 2528
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "Dutch"
                }
              },
              required: ["cid"]
            }
          },
          {
            name: "business_data_reviews",
            description: "Get reviews for a specific business with rating and date filtering",
            inputSchema: {
              type: "object",
              properties: {
                cid: {
                  type: "string",
                  description: "Business Client ID from Google My Business"
                },
                location_code: {
                  type: "number",
                  description: "Location code (2528 for Netherlands)",
                  default: 2528
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "Dutch"
                },
                sort_by: {
                  type: "string",
                  description: "Sort order: 'date', 'rating', 'relevance'",
                  default: "date"
                },
                limit: {
                  type: "number",
                  description: "Max number of reviews to return",
                  default: 100
                },
                priority: {
                  type: "number",
                  description: "API priority (1=normal, 2=high)",
                  default: 1
                }
              },
              required: ["cid"]
            }
          },
          {
            name: "business_data_reviews_filtered",
            description: "Get filtered business reviews by rating (1-3 stars) and date range (last N days) for Netherlands businesses",
            inputSchema: {
              type: "object",
              properties: {
                cid: {
                  type: "string",
                  description: "Business Client ID from Google My Business"
                },
                max_rating: {
                  type: "number",
                  description: "Maximum rating to include (1-3 for negative reviews)",
                  default: 3
                },
                days_back: {
                  type: "number",
                  description: "Number of days to look back for reviews",
                  default: 10
                },
                location_code: {
                  type: "number",
                  description: "Location code (2528 for Netherlands)",
                  default: 2528
                },
                language_name: {
                  type: "string",
                  description: "Language name",
                  default: "Dutch"
                },
                limit: {
                  type: "number",
                  description: "Max number of reviews to return",
                  default: 50
                }
              },
              required: ["cid"]
            }
          }
        ]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Keyword Research Tools
          case "keyword_overview":
            return await this.getKeywordOverview(args);
          case "related_keywords":
            return await this.getRelatedKeywords(args);
          case "keyword_suggestions":
            return await this.getKeywordSuggestions(args);
          case "keyword_ideas":
            return await this.getKeywordIdeas(args);
          case "search_intent":
            return await this.getSearchIntent(args);
          // SERP Analysis Tools
          case "serp_competitors":
            return await this.getSerpCompetitors(args);
          // Domain Analysis Tools
          case "domain_keywords":
            return await this.getDomainKeywords(args);
          case "competitor_domains":
            return await this.getCompetitorDomains(args);
          case "domain_intersection":
            return await this.getDomainIntersection(args);
          case "traffic_estimation":
            return await this.getTrafficEstimation(args);
          // Market Analysis Tools
          case "categories_for_domain":
            return await this.getCategoriesForDomain(args);
          case "top_searches":
            return await this.getTopSearches(args);
          // OnPage API Tools - Live (Single Page)
          case "onpage_lighthouse":
            return await this.getOnPageLighthouse(args);
          case "onpage_instant_summary":
            return await this.getOnPageInstantSummary(args);
          case "onpage_page_screenshot":
            return await this.getOnPageScreenshot(args);
          // OnPage API Tools - Full Site Crawling
          case "onpage_task_post":
            return await this.postOnPageTask(args);
          case "onpage_tasks_ready":
            return await this.getOnPageTasksReady(args);
          case "onpage_summary":
            return await this.getOnPageSummary(args);
          case "onpage_pages":
            return await this.getOnPagePages(args);
          case "onpage_resources":
            return await this.getOnPageResources(args);
          case "onpage_links":
            return await this.getOnPageLinks(args);
          case "onpage_redirect_chains":
            return await this.getOnPageRedirectChains(args);
          case "onpage_non_indexable":
            return await this.getOnPageNonIndexable(args);
          case "onpage_duplicate_tags":
            return await this.getOnPageDuplicateTags(args);
          case "onpage_duplicate_content":
            return await this.getOnPageDuplicateContent(args);
          case "onpage_keyword_density":
            return await this.getOnPageKeywordDensity(args);
          case "onpage_waterfall":
            return await this.getOnPageWaterfall(args);
          case "onpage_raw_html":
            return await this.getOnPageRawHTML(args);
          case "onpage_pages_by_resource":
            return await this.getOnPagePagesByResource(args);
          case "onpage_force_stop":
            return await this.forceStopOnPageTask(args);
          // Additional SERP API Tools
          case "serp_google_maps":
            return await this.getSerpGoogleMaps(args);
          case "serp_google_news":
            return await this.getSerpGoogleNews(args);
          case "serp_google_images":
            return await this.getSerpGoogleImages(args);
          case "serp_google_jobs":
            return await this.getSerpGoogleJobs(args);
          // Content Analysis API Tools
          case "content_analysis_summary":
            return await this.getContentAnalysisSummary(args);
          case "content_analysis_phrase_trends":
            return await this.getContentAnalysisPhraseTrends(args);
          // Domain Analytics API Tools
          case "domain_technologies":
            return await this.getDomainTechnologies(args);
          case "domain_whois_overview":
            return await this.getDomainWhoisOverview(args);
          // Business Data API Tools
          case "business_data_search":
            return await this.getBusinessDataSearch(args);
          case "business_data_info":
            return await this.getBusinessDataInfo(args);
          case "business_data_reviews":
            return await this.getBusinessDataReviews(args);
          case "business_data_reviews_filtered":
            return await this.getBusinessDataReviewsFiltered(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `DataForSEO API Error: ${error.message}`
            }
          ],
          isError: true
        };
      }
    });
  }

  // Helper method to make DataForSEO API calls
  async makeAPICall(endpoint, postData = []) {
    const cacheKey = `${endpoint}_${JSON.stringify(postData)}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`=Ë Using cached data for ${endpoint}`);
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      console.log(`= Making DataForSEO API call: ${endpoint}`);

      const response = await axios({
        method: 'POST',
        url: `${this.apiConfig.baseURL}${endpoint}`,
        auth: {
          username: this.apiConfig.username,
          password: this.apiConfig.password
        },
        headers: this.apiConfig.headers,
        timeout: this.apiConfig.timeout,
        data: postData
      });

      if (response.data && response.data.status_code === 20000) {
        // Cache successful response
        this.cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now()
        });

        console.log(` DataForSEO API call successful: ${endpoint}`);
        return response.data;
      } else {
        throw new Error(`API Error: ${response.data?.status_message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`L DataForSEO API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Keyword Research Tools Implementation
  async getKeywordOverview(args) {
    const { keywords, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      keywords,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/keyword_overview/live', postData);

    return {
      content: [{
        type: "text",
        text: `Keyword Overview Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getRelatedKeywords(args) {
    const { keyword, location_code = 2840, language_name = "English", limit = 100 } = args;

    const postData = [{
      keyword,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/related_keywords/live', postData);

    return {
      content: [{
        type: "text",
        text: `Related Keywords Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getKeywordSuggestions(args) {
    const { keyword, location_code = 2840, language_name = "English", limit = 100 } = args;

    const postData = [{
      keyword,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/keyword_suggestions/live', postData);

    return {
      content: [{
        type: "text",
        text: `Keyword Suggestions Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getKeywordIdeas(args) {
    const { keyword, location_code = 2840, language_name = "English", limit = 100 } = args;

    const postData = [{
      keyword,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/keyword_ideas/live', postData);

    return {
      content: [{
        type: "text",
        text: `Keyword Ideas Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getSearchIntent(args) {
    const { keywords, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      keywords,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/search_intent/live', postData);

    return {
      content: [{
        type: "text",
        text: `Search Intent Analysis Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // SERP Analysis Tools Implementation
  async getSerpCompetitors(args) {
    const { keyword, location_code = 2840, language_name = "English", limit = 10 } = args;

    const postData = [{
      keyword,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/serp_competitors/live', postData);

    return {
      content: [{
        type: "text",
        text: `SERP Competitors Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Domain Analysis Tools Implementation
  async getDomainKeywords(args) {
    const { target, location_code = 2840, language_name = "English", limit = 100 } = args;

    const postData = [{
      target,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/ranked_keywords/live', postData);

    return {
      content: [{
        type: "text",
        text: `Domain Keywords Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getCompetitorDomains(args) {
    const { target, location_code = 2840, language_name = "English", limit = 20 } = args;

    const postData = [{
      target,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/competitors_domain/live', postData);

    return {
      content: [{
        type: "text",
        text: `Competitor Domains Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getDomainIntersection(args) {
    const { targets, location_code = 2840, language_name = "English", limit = 100 } = args;

    const postData = [{
      targets,
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/domain_intersection/live', postData);

    return {
      content: [{
        type: "text",
        text: `Domain Intersection Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getTrafficEstimation(args) {
    const { targets, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      targets,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/bulk_traffic_estimation/live', postData);

    return {
      content: [{
        type: "text",
        text: `Traffic Estimation Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Market Analysis Tools Implementation
  async getCategoriesForDomain(args) {
    const { target, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      target,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/categories_for_domain/live', postData);

    return {
      content: [{
        type: "text",
        text: `Categories for Domain:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getTopSearches(args) {
    const { location_code = 2840, language_name = "English", category_code, limit = 100 } = args;

    const postData = [{
      location_code,
      language_name,
      ...(category_code && { category_code }),
      limit
    }];

    const response = await this.makeAPICall('/dataforseo_labs/google/top_searches/live', postData);

    return {
      content: [{
        type: "text",
        text: `Top Searches Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // OnPage API Tools Implementation - Live (Single Page)
  async getOnPageLighthouse(args) {
    const { url, enable_javascript = true, audits = ["accessibility", "best-practices", "performance", "pwa", "seo"] } = args;

    const postData = [{
      url,
      enable_javascript,
      audits
    }];

    const response = await this.makeAPICall('/on_page/lighthouse/live', postData);

    return {
      content: [{
        type: "text",
        text: `Lighthouse Technical SEO Audit:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageInstantSummary(args) {
    const { url, enable_javascript = true } = args;

    const postData = [{
      url,
      enable_javascript
    }];

    const response = await this.makeAPICall('/on_page/instant_pages', postData);

    return {
      content: [{
        type: "text",
        text: `Instant On-Page SEO Summary:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageScreenshot(args) {
    const { url, full_page_screenshot = true, enable_javascript = true } = args;

    const postData = [{
      url,
      full_page_screenshot,
      enable_javascript
    }];

    const response = await this.makeAPICall('/on_page/page_screenshot/live', postData);

    return {
      content: [{
        type: "text",
        text: `Page Screenshot Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // OnPage API Tools Implementation - Full Site Crawling
  async postOnPageTask(args) {
    const {
      target,
      max_crawl_pages = 100,
      enable_javascript = true,
      enable_browser_rendering = false,
      custom_js,
      load_resources = true,
      check_spell = false,
      calculate_keyword_density = true
    } = args;

    const postData = [{
      target,
      max_crawl_pages,
      enable_javascript,
      enable_browser_rendering,
      ...(custom_js && { custom_js }),
      load_resources,
      check_spell,
      calculate_keyword_density
    }];

    const response = await this.makeAPICall('/on_page/task_post', postData);

    return {
      content: [{
        type: "text",
        text: `Crawl Task Started:\n${SafeJSON.stringify(response)}\n\nUse the task ID to check status with onpage_tasks_ready and retrieve results.`
      }]
    };
  }

  async getOnPageTasksReady() {
    const response = await this.makeAPICall('/on_page/tasks_ready', []);

    return {
      content: [{
        type: "text",
        text: `Ready Crawl Tasks:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageSummary(args) {
    const { id } = args;

    const postData = [{
      id
    }];

    const response = await this.makeAPICall('/on_page/summary', postData);

    return {
      content: [{
        type: "text",
        text: `OnPage SEO Summary:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPagePages(args) {
    const { id, limit = 100, offset = 0, filters } = args;

    const postData = [{
      id,
      limit,
      offset,
      ...(filters && { filters })
    }];

    const response = await this.makeAPICall('/on_page/pages', postData);

    return {
      content: [{
        type: "text",
        text: `Crawled Pages:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageResources(args) {
    const { id, limit = 100, filters } = args;

    const postData = [{
      id,
      limit,
      ...(filters && { filters })
    }];

    const response = await this.makeAPICall('/on_page/resources', postData);

    return {
      content: [{
        type: "text",
        text: `Website Resources:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageLinks(args) {
    const { id, limit = 100, filters } = args;

    const postData = [{
      id,
      limit,
      ...(filters && { filters })
    }];

    const response = await this.makeAPICall('/on_page/links', postData);

    return {
      content: [{
        type: "text",
        text: `Website Links:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageRedirectChains(args) {
    const { id, limit = 100 } = args;

    const postData = [{
      id,
      limit
    }];

    const response = await this.makeAPICall('/on_page/redirect_chains', postData);

    return {
      content: [{
        type: "text",
        text: `Redirect Chains:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageNonIndexable(args) {
    const { id, limit = 100 } = args;

    const postData = [{
      id,
      limit
    }];

    const response = await this.makeAPICall('/on_page/non_indexable', postData);

    return {
      content: [{
        type: "text",
        text: `Non-Indexable Pages:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageDuplicateTags(args) {
    const { id, limit = 100 } = args;

    const postData = [{
      id,
      limit
    }];

    const response = await this.makeAPICall('/on_page/duplicate_tags', postData);

    return {
      content: [{
        type: "text",
        text: `Duplicate Tags:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageDuplicateContent(args) {
    const { id, url, limit = 100 } = args;

    const postData = [{
      id,
      url,
      limit
    }];

    const response = await this.makeAPICall('/on_page/duplicate_content', postData);

    return {
      content: [{
        type: "text",
        text: `Duplicate Content:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageKeywordDensity(args) {
    const { id, keyword, limit = 100 } = args;

    const postData = [{
      id,
      ...(keyword && { keyword }),
      limit
    }];

    const response = await this.makeAPICall('/on_page/keyword_density', postData);

    return {
      content: [{
        type: "text",
        text: `Keyword Density Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageWaterfall(args) {
    const { id, url } = args;

    const postData = [{
      id,
      url
    }];

    const response = await this.makeAPICall('/on_page/waterfall', postData);

    return {
      content: [{
        type: "text",
        text: `Page Speed Waterfall:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPageRawHTML(args) {
    const { id, url } = args;

    const postData = [{
      id,
      url
    }];

    const response = await this.makeAPICall('/on_page/raw_html', postData);

    return {
      content: [{
        type: "text",
        text: `Raw HTML:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getOnPagePagesByResource(args) {
    const { id, resource_url, limit = 100 } = args;

    const postData = [{
      id,
      resource_url,
      limit
    }];

    const response = await this.makeAPICall('/on_page/pages_by_resource', postData);

    return {
      content: [{
        type: "text",
        text: `Pages Using Resource:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async forceStopOnPageTask(args) {
    const { id } = args;

    const postData = [{
      id
    }];

    const response = await this.makeAPICall('/on_page/force_stop', postData);

    return {
      content: [{
        type: "text",
        text: `Crawl Task Stopped:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Additional SERP API Tools Implementation
  async getSerpGoogleMaps(args) {
    const { keyword, location_name, language_name = "English" } = args;

    const postData = [{
      keyword,
      ...(location_name && { location_name }),
      language_name
    }];

    const response = await this.makeAPICall('/serp/google/maps/live', postData);

    return {
      content: [{
        type: "text",
        text: `Google Maps Local SEO Results:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getSerpGoogleNews(args) {
    const { keyword, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      keyword,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/serp/google/news/live', postData);

    return {
      content: [{
        type: "text",
        text: `Google News SEO Opportunities:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getSerpGoogleImages(args) {
    const { keyword, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      keyword,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/serp/google/images/live', postData);

    return {
      content: [{
        type: "text",
        text: `Google Images SEO Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getSerpGoogleJobs(args) {
    const { keyword, location_name, language_name = "English" } = args;

    const postData = [{
      keyword,
      ...(location_name && { location_name }),
      language_name
    }];

    const response = await this.makeAPICall('/serp/google/jobs/live', postData);

    return {
      content: [{
        type: "text",
        text: `Google Jobs SEO Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Content Analysis API Tools Implementation
  async getContentAnalysisSummary(args) {
    const { url, keyword, enable_javascript = true } = args;

    const postData = [{
      url,
      keyword,
      enable_javascript
    }];

    const response = await this.makeAPICall('/content_analysis/summary/live', postData);

    return {
      content: [{
        type: "text",
        text: `Content Quality SEO Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getContentAnalysisPhraseTrends(args) {
    const { url, keyword, location_code = 2840, language_name = "English" } = args;

    const postData = [{
      url,
      keyword,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/content_analysis/phrase_trends/live', postData);

    return {
      content: [{
        type: "text",
        text: `Semantic Phrase Trends Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Domain Analytics API Tools Implementation
  async getDomainTechnologies(args) {
    const { target, limit = 100 } = args;

    const postData = [{
      target,
      limit
    }];

    const response = await this.makeAPICall('/domain_analytics/technologies/live', postData);

    return {
      content: [{
        type: "text",
        text: `Domain Technologies Analysis:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getDomainWhoisOverview(args) {
    const { targets } = args;

    const postData = [{
      targets
    }];

    const response = await this.makeAPICall('/domain_analytics/whois/overview/live', postData);

    return {
      content: [{
        type: "text",
        text: `Domain WHOIS Intelligence:\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  // Business Data API Tools Implementation
  async getBusinessDataSearch(args) {
    const { keyword, location_name, location_code = 2528, language_name = "Dutch", limit = 50 } = args;

    const postData = [{
      keyword,
      ...(location_name && { location_name }),
      location_code,
      language_name,
      limit
    }];

    const response = await this.makeAPICall('/business_data/business_listings/search/live', postData);

    return {
      content: [{
        type: "text",
        text: `Business Search Results (${keyword}):\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getBusinessDataInfo(args) {
    const { cid, location_code = 2528, language_name = "Dutch" } = args;

    const postData = [{
      cid,
      location_code,
      language_name
    }];

    const response = await this.makeAPICall('/business_data/google/my_business_info/live', postData);

    return {
      content: [{
        type: "text",
        text: `Business Information (CID: ${cid}):\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getBusinessDataReviews(args) {
    const { cid, location_code = 2528, language_name = "Dutch", sort_by = "date", limit = 100, priority = 1 } = args;

    const postData = [{
      cid,
      location_code,
      language_name,
      sort_by,
      limit,
      priority
    }];

    const response = await this.makeAPICall('/business_data/google/reviews/task_post', postData);

    return {
      content: [{
        type: "text",
        text: `Business Reviews (CID: ${cid}):\n${SafeJSON.stringify(response)}`
      }]
    };
  }

  async getBusinessDataReviewsFiltered(args) {
    const { cid, max_rating = 3, days_back = 10, location_code = 2528, language_name = "Dutch", limit = 50 } = args;

    // First get all reviews
    const postData = [{
      cid,
      location_code,
      language_name,
      sort_by: "date",
      limit: 200, // Get more to filter
      priority: 1
    }];

    const response = await this.makeAPICall('/business_data/google/reviews/task_post', postData);

    // Filter reviews by rating and date
    let filteredResults = null;
    if (response && response.tasks && response.tasks[0] && response.tasks[0].result) {
      const allReviews = response.tasks[0].result;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days_back);

      const filtered = allReviews.filter(review => {
        if (!review) return false;

        // Filter by rating (1-3 stars only)
        const rating = review.rating && review.rating.value ? review.rating.value : null;
        if (!rating || rating > max_rating) return false;

        // Filter by date (last N days)
        const reviewDate = review.timestamp ? new Date(review.timestamp) : null;
        if (!reviewDate || reviewDate < cutoffDate) return false;

        return true;
      }).slice(0, limit); // Limit results

      filteredResults = {
        ...response,
        tasks: [{
          ...response.tasks[0],
          result: filtered,
          result_count: filtered.length
        }]
      };
    } else {
      filteredResults = response;
    }

    return {
      content: [{
        type: "text",
        text: `Filtered Low-Rating Reviews (CID: ${cid}, d${max_rating} stars, last ${days_back} days):\n${SafeJSON.stringify(filteredResults)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("DataForSEO MCP server running on stdio");
  }
}

// Start the server
const server = new DataForSEOServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

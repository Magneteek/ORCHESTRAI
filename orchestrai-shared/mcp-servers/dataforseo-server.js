#!/usr/bin/env node

// DataForSEO MCP Server for ORCHESTRAI
// Comprehensive SEO data integration with DataForSEO Labs API
// Implements all available tools except backlink analysis

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { CallToolRequestSchema, ListToolsRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const axios = require('axios');

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
      console.error('⚠️ DataForSEO credentials not found in environment variables');
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
          // OnPage API - Technical SEO Auditing Tools
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
            name: "onpage_summary",
            description: "Get comprehensive on-page SEO summary including Core Web Vitals",
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
          // OnPage API Tools
          case "onpage_lighthouse":
            return await this.getOnPageLighthouse(args);
          case "onpage_summary":
            return await this.getOnPageSummary(args);
          case "onpage_page_screenshot":
            return await this.getOnPageScreenshot(args);
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
        console.log(`📋 Using cached data for ${endpoint}`);
        return cached.data;
      }
      this.cache.delete(cacheKey);
    }

    try {
      console.log(`🔍 Making DataForSEO API call: ${endpoint}`);
      
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
        
        console.log(`✅ DataForSEO API call successful: ${endpoint}`);
        return response.data;
      } else {
        throw new Error(`API Error: ${response.data?.status_message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`❌ DataForSEO API Error (${endpoint}):`, error.message);
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
        text: `Keyword Overview Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Related Keywords Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Keyword Suggestions Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Keyword Ideas Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Search Intent Analysis Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `SERP Competitors Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Domain Keywords Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Competitor Domains Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Domain Intersection Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Traffic Estimation Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Categories for Domain:\n${JSON.stringify(response, null, 2)}`
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
        text: `Top Searches Results:\n${JSON.stringify(response, null, 2)}`
      }]
    };
  }

  // OnPage API Tools Implementation
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
        text: `Lighthouse Technical SEO Audit:\n${JSON.stringify(response, null, 2)}`
      }]
    };
  }

  async getOnPageSummary(args) {
    const { url, enable_javascript = true } = args;
    
    const postData = [{
      url,
      enable_javascript
    }];

    const response = await this.makeAPICall('/on_page/summary/live', postData);
    
    return {
      content: [{
        type: "text",
        text: `OnPage SEO Summary (Core Web Vitals):\n${JSON.stringify(response, null, 2)}`
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
        text: `Page Screenshot Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Google Maps Local SEO Results:\n${JSON.stringify(response, null, 2)}`
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
        text: `Google News SEO Opportunities:\n${JSON.stringify(response, null, 2)}`
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
        text: `Google Images SEO Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Google Jobs SEO Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Content Quality SEO Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Semantic Phrase Trends Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Domain Technologies Analysis:\n${JSON.stringify(response, null, 2)}`
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
        text: `Domain WHOIS Intelligence:\n${JSON.stringify(response, null, 2)}`
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
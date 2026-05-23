#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const APIFY_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_BASE = 'https://api.apify.com/v2';

if (!APIFY_TOKEN) {
  console.error('❌ APIFY_API_TOKEN not set');
  process.exit(1);
}

async function runActorSync(actorId, input, timeoutSecs = 120) {
  const url = `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=${timeoutSecs}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Apify actor ${actorId} failed: ${res.status} — ${body.slice(0, 300)}`);
  }
  return res.json();
}

class ApifyServer {
  constructor() {
    this.server = new Server(
      { name: 'apify-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'apify_google_maps',
          description: 'Extract Google Maps business data: name, address, phone, website, rating, review count, coordinates, category, opening hours, Place ID, CID. Use for lead enrichment, KPO data, competitor mapping. Actor: compass~crawler-google-places.',
          inputSchema: {
            type: 'object',
            properties: {
              search_terms: {
                type: 'array',
                items: { type: 'string' },
                description: 'Search queries or Google Maps URLs. E.g. ["dentist Kranj Slovenia"] or ["https://maps.google.com/..."]'
              },
              max_results: {
                type: 'number',
                description: 'Max places per search term. Default 5.',
                default: 5
              },
              language: {
                type: 'string',
                description: 'Language code. Default "en".',
                default: 'en'
              }
            },
            required: ['search_terms']
          }
        },
        {
          name: 'apify_google_reviews',
          description: 'Extract Google Maps reviews for a business: reviewer name, star rating, review text, date, owner reply. Use for reputation audits, sentiment analysis, review monitoring. Requires Google Maps URL or business name + location. Actor: compass~google-maps-reviews-scraper.',
          inputSchema: {
            type: 'object',
            properties: {
              place_url: {
                type: 'string',
                description: 'Google Maps URL or business search string e.g. "Zobozdravstvo Kriznar Kranj Slovenia"'
              },
              max_reviews: {
                type: 'number',
                description: 'Max reviews to fetch. Default 100.',
                default: 100
              },
              sort: {
                type: 'string',
                description: 'Sort: "newest", "highest_rating", "lowest_rating", "most_relevant". Default "newest".',
                default: 'newest',
                enum: ['newest', 'highest_rating', 'lowest_rating', 'most_relevant']
              },
              language: {
                type: 'string',
                description: 'Language code. Default "en".',
                default: 'en'
              }
            },
            required: ['place_url']
          }
        },
        {
          name: 'apify_reddit',
          description: 'Scrape Reddit posts and comments from subreddits or search queries. Returns post title, full body text, upvotes, comment count, date, and top comments. Gets actual Reddit content — not just SERP snippets. Use for audience research, topic analysis, patient/customer sentiment. Actor: trudax/reddit-scraper.',
          inputSchema: {
            type: 'object',
            properties: {
              searches: {
                type: 'array',
                items: { type: 'string' },
                description: 'Search queries or subreddit URLs. E.g. ["clear aligners experience", "https://www.reddit.com/r/DentalAnxiety/"]'
              },
              max_posts: {
                type: 'number',
                description: 'Max posts per search. Default 20.',
                default: 20
              },
              max_comments: {
                type: 'number',
                description: 'Max top comments per post. Default 10.',
                default: 10
              },
              time_filter: {
                type: 'string',
                description: 'Time range: "hour", "day", "week", "month", "year", "all". Default "year".',
                default: 'year',
                enum: ['hour', 'day', 'week', 'month', 'year', 'all']
              },
              sort: {
                type: 'string',
                description: 'Sort: "relevance", "hot", "top", "new". Default "relevance".',
                default: 'relevance',
                enum: ['relevance', 'hot', 'top', 'new']
              }
            },
            required: ['searches']
          }
        },
        {
          name: 'apify_website_crawler',
          description: 'Crawl an entire website and extract all pages as clean markdown. Returns URL, title, word count, and content for every page. Use for competitor content audits, site migration analysis, content gap research. Keep max_pages low (≤50) to control API costs. Actor: apify/website-content-crawler.',
          inputSchema: {
            type: 'object',
            properties: {
              start_urls: {
                type: 'array',
                items: { type: 'string' },
                description: 'Starting URLs. E.g. ["https://competitor.com"]'
              },
              max_pages: {
                type: 'number',
                description: 'Max pages to crawl. Default 30. Keep ≤50 to control cost.',
                default: 30
              },
              max_depth: {
                type: 'number',
                description: 'Max crawl depth from start URL. Default 2.',
                default: 2
              },
              exclude_url_patterns: {
                type: 'array',
                items: { type: 'string' },
                description: 'URL substrings to exclude. E.g. ["/tag/", "/author/", "/cart/"]'
              }
            },
            required: ['start_urls']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        switch (name) {
          case 'apify_google_maps':     return await this.googleMaps(args);
          case 'apify_google_reviews':  return await this.googleReviews(args);
          case 'apify_reddit':          return await this.reddit(args);
          case 'apify_website_crawler': return await this.websiteCrawler(args);
          default:
            return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
        }
      } catch (err) {
        return { content: [{ type: 'text', text: `Apify error: ${err.message}` }], isError: true };
      }
    });
  }

  async googleMaps(args) {
    const { search_terms, max_results = 5, language = 'en' } = args;
    const input = {
      searchStringsArray: search_terms,
      maxCrawledPlacesPerSearch: max_results,
      language,
      includeHistogram: false,
      includeOpeningHours: true,
      includePeopleAlsoSearch: false,
      maxImages: 0
    };
    const results = await runActorSync('compass~crawler-google-places', input, 120);
    const cleaned = results.map(p => ({
      title: p.title,
      address: p.address,
      phone: p.phone,
      website: p.website,
      category: p.category,
      rating: p.totalScore,
      review_count: p.reviewsCount,
      cid: p.cid,
      place_id: p.placeId,
      latitude: p.location?.lat,
      longitude: p.location?.lng,
      opening_hours: p.openingHours,
      url: p.url
    }));
    return {
      content: [{ type: 'text', text: `Google Maps (${search_terms.join(', ')}):\n${JSON.stringify(cleaned, null, 2)}` }]
    };
  }

  async googleReviews(args) {
    const { place_url, max_reviews = 100, sort = 'newest', language = 'en' } = args;
    const startUrl = place_url.startsWith('http')
      ? place_url
      : `https://www.google.com/maps/search/${encodeURIComponent(place_url)}`;
    const input = {
      startUrls: [{ url: startUrl }],
      maxReviews: max_reviews,
      reviewsSort: sort,
      language,
      personalDataHandlingMode: 'anonymize'
    };
    const results = await runActorSync('compass~google-maps-reviews-scraper', input, 180);
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of results) dist[r.stars] = (dist[r.stars] || 0) + 1;
    const summary = {
      total_fetched: results.length,
      average_rating: results.length
        ? (results.reduce((s, r) => s + (r.stars || 0), 0) / results.length).toFixed(2)
        : null,
      rating_distribution: dist,
      reviews: results.map(r => ({
        rating: r.stars,
        text: r.text,
        date: r.publishedAtDate,
        author: r.name,
        owner_reply: r.reviewerReply?.text || null
      }))
    };
    return {
      content: [{ type: 'text', text: `Google Reviews — "${place_url}" (${results.length} reviews):\n${JSON.stringify(summary, null, 2)}` }]
    };
  }

  async reddit(args) {
    const { searches, max_posts = 20, max_comments = 10, time_filter = 'year', sort = 'relevance' } = args;
    const startUrls = searches.map(s =>
      s.startsWith('http')
        ? { url: s }
        : { url: `https://www.reddit.com/search/?q=${encodeURIComponent(s)}&sort=${sort}&t=${time_filter}` }
    );
    const input = {
      startUrls,
      maxPostCount: max_posts,
      maxComments: max_comments,
      maxCommunitiesCount: 0,
      maxUserCount: 0,
      proxy: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] }
    };
    const results = await runActorSync('trudax/reddit-scraper', input, 180);
    const posts = results
      .filter(r => r.title)
      .map(r => ({
        title: r.title,
        subreddit: r.communityName || r.subreddit,
        url: r.url,
        upvotes: r.upVotes || r.score,
        comment_count: r.numberOfComments || r.numComments,
        date: r.createdAt || r.created,
        body: (r.body || r.selftext || '').slice(0, 1000),
        top_comments: (r.comments || []).slice(0, max_comments).map(c => ({
          author: c.author,
          text: (c.body || '').slice(0, 500),
          upvotes: c.score
        }))
      }));
    return {
      content: [{ type: 'text', text: `Reddit (${searches.join(', ')}) — ${posts.length} posts:\n${JSON.stringify(posts, null, 2)}` }]
    };
  }

  async websiteCrawler(args) {
    const { start_urls, max_pages = 30, max_depth = 2, exclude_url_patterns = [] } = args;
    const input = {
      startUrls: start_urls.map(url => ({ url })),
      maxCrawledPages: max_pages,
      maxCrawlDepth: max_depth,
      excludeUrlGlobs: exclude_url_patterns.map(p => ({ glob: `*${p}*` })),
      outputFormats: ['markdown'],
      crawlerType: 'playwright:firefox',
      removeCookieWarnings: true,
      removeElementsCssSelector: 'nav, footer, .cookie-banner, .popup, script, style'
    };
    const results = await runActorSync('apify/website-content-crawler', input, 300);
    const pages = results.map(p => ({
      url: p.url,
      title: p.metadata?.title || p.title,
      word_count: (p.text || '').split(/\s+/).length,
      markdown: (p.markdown || p.text || '').slice(0, 5000)
    }));
    return {
      content: [{ type: 'text', text: `Website Crawl — ${start_urls[0]} (${pages.length} pages):\n${JSON.stringify({ pages_crawled: pages.length, pages }, null, 2)}` }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Apify MCP server running on stdio');
  }
}

const server = new ApifyServer();
server.run().catch(err => { console.error(err); process.exit(1); });

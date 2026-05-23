#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const REDDIT_HEADERS = {
  'User-Agent': 'ORCHESTRAI/1.0 (research tool; contact kristjan@krisbal.com)',
  'Accept': 'application/json'
};

const DELAY_MS = 1200; // stay well under 60 req/min

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function redditFetch(url) {
  const res = await fetch(url, { headers: REDDIT_HEADERS });
  if (!res.ok) throw new Error(`Reddit API ${res.status}: ${url}`);
  return res.json();
}

async function searchPosts(query, sort, timeFilter, limit) {
  const isUrl = query.startsWith('http');
  let url;
  if (isUrl) {
    // Subreddit URL — convert to JSON endpoint
    const base = query.replace(/\/$/, '');
    url = `${base}.json?limit=${limit}&sort=${sort}`;
  } else {
    url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=${sort}&t=${timeFilter}&limit=${limit}&type=link`;
  }
  const data = await redditFetch(url);
  const children = data?.data?.children || [];
  return children
    .filter(c => c.kind === 't3' && c.data?.title)
    .map(c => c.data);
}

async function fetchComments(permalink, maxComments) {
  await sleep(DELAY_MS);
  try {
    const url = `https://www.reddit.com${permalink}.json?limit=${maxComments}&depth=1`;
    const data = await redditFetch(url);
    const commentThread = data?.[1]?.data?.children || [];
    return commentThread
      .filter(c => c.kind === 't1' && c.data?.body && c.data.body !== '[deleted]')
      .slice(0, maxComments)
      .map(c => ({
        author: c.data.author,
        text: c.data.body.slice(0, 600),
        upvotes: c.data.score
      }));
  } catch {
    return [];
  }
}

class RedditServer {
  constructor() {
    this.server = new Server(
      { name: 'reddit-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'reddit_search',
          description: 'Search Reddit posts and fetch top comments using Reddit\'s public API. Returns post title, body, upvotes, comment count, date, and top comments. Use for audience research, pain point extraction, real user language discovery, content brief research. Free — no API key required.',
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
                description: 'Max posts per search query. Default 20. Max 25.',
                default: 20
              },
              max_comments: {
                type: 'number',
                description: 'Max top-level comments per post. Default 10. Set to 0 to skip comment fetching (faster).',
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
                description: 'Sort: "relevance", "hot", "top", "new". Default "relevance". "relevance" only applies to search queries, not subreddit URLs.',
                default: 'relevance',
                enum: ['relevance', 'hot', 'top', 'new']
              }
            },
            required: ['searches']
          }
        }
      ]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        if (name === 'reddit_search') return await this.redditSearch(args);
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
      } catch (err) {
        return { content: [{ type: 'text', text: `Reddit error: ${err.message}` }], isError: true };
      }
    });
  }

  async redditSearch(args) {
    const {
      searches,
      max_posts = 20,
      max_comments = 10,
      time_filter = 'year',
      sort = 'relevance'
    } = args;

    const limit = Math.min(max_posts, 25);
    const allPosts = [];

    for (const query of searches) {
      await sleep(DELAY_MS);
      const posts = await searchPosts(query, sort, time_filter, limit);

      for (const p of posts.slice(0, limit)) {
        const post = {
          title: p.title,
          subreddit: p.subreddit,
          url: `https://reddit.com${p.permalink}`,
          upvotes: p.score,
          comment_count: p.num_comments,
          date: new Date(p.created_utc * 1000).toISOString().split('T')[0],
          body: (p.selftext || '').replace(/\n\n+/g, '\n\n').slice(0, 1200),
          top_comments: []
        };

        if (max_comments > 0 && p.num_comments > 0) {
          post.top_comments = await fetchComments(p.permalink, max_comments);
        }

        allPosts.push(post);
      }
    }

    return {
      content: [{
        type: 'text',
        text: `Reddit (${searches.join(', ')}) — ${allPosts.length} posts:\n${JSON.stringify(allPosts, null, 2)}`
      }]
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Reddit MCP server running on stdio');
  }
}

const server = new RedditServer();
server.run().catch(err => { console.error(err); process.exit(1); });

#!/usr/bin/env node

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema, ListToolsRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

const UA = 'Mozilla/5.0 (compatible; ORCHESTRAI/1.0; research bot)';

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    redirect: 'follow'
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('html')) throw new Error(`Not HTML (${ct}) — ${url}`);
  return res.text();
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decode(m[1].trim()) : null;
}

function extractMeta(html) {
  const out = {};

  // <meta name/property/http-equiv + content>
  const re = /<meta\s([^>]+?)(?:\s*\/)?>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const a = attrs(m[1]);
    const key = (a.name || a.property || a['http-equiv'] || '').toLowerCase();
    if (key && a.content !== undefined) out[key] = a.content;
  }

  // <link rel="canonical">
  const can = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  if (can) out.canonical = can[1];

  return out;
}

function extractHeadings(html) {
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  const out = [];
  let m;
  while ((m = re.exec(clean)) !== null) {
    const text = stripTags(m[2]).replace(/\s+/g, ' ').trim();
    if (text) out.push({ level: parseInt(m[1][1]), text });
  }
  return out;
}

function extractSchemas(html) {
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const out = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    try { out.push(JSON.parse(m[1].trim())); }
    catch { out.push({ _parse_error: true, raw: m[1].trim().slice(0, 300) }); }
  }
  return out;
}

function attrs(str) {
  const map = {};
  const re = /([\w:-]+)=["']([^"']*)["']|([\w:-]+)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    if (m[1]) map[m[1].toLowerCase()] = m[2];
    else if (m[3]) map[m[3].toLowerCase()] = true;
  }
  return map;
}

function stripTags(s) { return s.replace(/<[^>]+>/g, ''); }

function decode(s) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function schemaTypes(schemas) {
  return schemas.flatMap(s => {
    if (s['@graph']) return s['@graph'].map(n => n['@type']).filter(Boolean);
    return [s['@type']].filter(Boolean);
  });
}

class UrlExtractorServer {
  constructor() {
    this.server = new Server(
      { name: 'url-extractor-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [{
        name: 'url_extract',
        description: 'Extract structured on-page data from any URL: title, all meta tags (description, canonical, robots, OG, Twitter), full H1–H6 heading outline in document order, and every JSON-LD schema block parsed as JSON. Zero API cost — direct HTTP fetch + HTML parsing. Use for competitor page audits, schema gap analysis, content structure research, technical SEO checks on single pages.',
        inputSchema: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'Full URL to extract. e.g. "https://competitor.com/service-page/"'
            }
          },
          required: ['url']
        }
      }]
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        if (name === 'url_extract') return await this.urlExtract(args);
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
      } catch (err) {
        return { content: [{ type: 'text', text: `URL Extract error: ${err.message}` }], isError: true };
      }
    });
  }

  async urlExtract({ url }) {
    const t0 = Date.now();
    const html = await fetchHtml(url);

    const title = extractTitle(html);
    const meta = extractMeta(html);
    const headings = extractHeadings(html);
    const schemas = extractSchemas(html);
    const types = schemaTypes(schemas);

    const result = {
      url,
      duration_ms: Date.now() - t0,
      title,
      meta: {
        description:       meta['description'] || null,
        canonical:         meta['canonical'] || null,
        robots:            meta['robots'] || null,
        og_title:          meta['og:title'] || null,
        og_description:    meta['og:description'] || null,
        og_image:          meta['og:image'] || null,
        og_type:           meta['og:type'] || null,
        twitter_card:      meta['twitter:card'] || null,
        twitter_title:     meta['twitter:title'] || null,
        twitter_description: meta['twitter:description'] || null,
      },
      headings,
      heading_count: headings.length,
      schemas,
      schema_count: schemas.length,
      schema_types: types
    };

    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('URL Extractor MCP server running on stdio');
  }
}

const server = new UrlExtractorServer();
server.run().catch(err => { console.error(err); process.exit(1); });

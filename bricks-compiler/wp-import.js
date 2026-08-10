#!/usr/bin/env node
/**
 * wp-import.js — ORCHESTRAI Bricks Compiler
 *
 * Converts ORCHESTRAI pipeline WP HTML files into a WordPress import package:
 *   wp-import-[name].xml   → WXR (WordPress eXtended RSS) — import via WP Admin → Tools → Import
 *   wp-import-[name].json  → post/page data (auditable, version-controllable)
 *   wp-import-[name].php   → WP-CLI eval-file importer (for SSH/server access)
 *
 * Usage:
 *   node wp-import.js <spec.json>
 *   node wp-import.js --scan <html-folder> [options]
 *
 * Import via WordPress Admin (no SSH needed):
 *   1. WP Admin → Tools → Import → WordPress → Install Now → Run Importer
 *   2. Upload wp-import-[name].xml
 *   3. Assign to existing author, check "Download and import file attachments"
 *
 * Import via WP-CLI (requires SSH):
 *   wp eval-file wp-import-[name].php --allow-root
 *
 * The PHP script reads content from the JSON file — no character-escaping issues.
 * Idempotent: skips posts whose post_name already exists in WordPress.
 * Sets SEOpress meta: title, description, canonical, focus keyword.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help') {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

let specFile   = null;
let scanDir    = null;
let scanName   = 'import';
let scanSite   = '';
let scanType   = 'page';
let scanStatus = 'draft';
let scanParent = '';
let outDir     = '.';

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '--scan':    scanDir    = args[++i]; break;
    case '--name':    scanName   = args[++i]; break;
    case '--site':    scanSite   = args[++i]; break;
    case '--type':    scanType   = args[++i]; break;
    case '--status':  scanStatus = args[++i]; break;
    case '--parent':  scanParent = args[++i]; break;
    case '--out-dir': outDir     = args[++i]; break;
    default:
      if (!args[i].startsWith('--')) specFile = args[i];
  }
}

// ── Load spec ────────────────────────────────────────────────────────────────

let spec;
let htmlBaseDir;

if (specFile) {
  const specPath = path.resolve(specFile);
  if (!fs.existsSync(specPath)) {
    console.error(`Error: spec file not found: ${specPath}`);
    process.exit(1);
  }
  spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  htmlBaseDir = path.resolve(path.dirname(specPath), spec.html_base_dir || '.');

} else if (scanDir) {
  htmlBaseDir = path.resolve(scanDir);
  if (!fs.existsSync(htmlBaseDir)) {
    console.error(`Error: directory not found: ${htmlBaseDir}`);
    process.exit(1);
  }
  const files = fs.readdirSync(htmlBaseDir)
    .filter(f => f.endsWith('.html') && f.toUpperCase().includes('WORDPRESS'))
    .sort()
    .map(f => ({ file: f }));
  spec = {
    name: scanName,
    site: scanSite,
    html_base_dir: htmlBaseDir,
    defaults: { post_type: scanType, post_status: scanStatus, parent_slug: scanParent },
    posts: files,
  };

} else {
  console.error('Error: provide a spec file or use --scan <directory>');
  process.exit(1);
}

// ── Process posts ────────────────────────────────────────────────────────────

const name     = spec.name || 'import';
const site     = spec.site || '';
const defaults = spec.defaults || {};
const posts    = [];
const warnings = [];

console.log(`\nProcessing ${spec.posts.length} files…\n`);

for (const entry of spec.posts) {
  const filePath = path.join(htmlBaseDir, entry.file);

  if (!fs.existsSync(filePath)) {
    warnings.push(`[SKIP] Not found: ${entry.file}`);
    continue;
  }

  const html  = fs.readFileSync(filePath, 'utf8');
  const meta  = parseHeader(html);
  const clean = stripHeaderComments(html);
  const h1    = extractH1(clean);

  // Resolve: entry overrides > parsed header > fallbacks
  const url        = entry.url || meta.url || (meta.url_slug ? `/${meta.url_slug}/` : null);
  const slug       = entry.slug || slugFromUrl(url) || slugFromFilename(entry.file);
  const title      = entry.title_override || h1 || meta.article_title || slugToTitle(slug);
  const seoTitle   = entry.seopress_title   || meta.seopress_title   || '';
  const seoDesc    = entry.seopress_desc    || meta.seopress_description || '';
  const seoCan     = entry.seopress_canonical || meta.seopress_canonical
                       || (url && site ? site + url : '');
  const focusKw    = entry.focus_keyword    || meta.focus_keyword   || '';
  const postType   = entry.post_type   || defaults.post_type   || 'post';
  const postStatus = entry.post_status || defaults.post_status || 'draft';
  const parent     = entry.parent_slug !== undefined
                       ? entry.parent_slug
                       : (defaults.parent_slug || '');
  const category   = entry.category !== undefined
                       ? entry.category
                       : (defaults.category || '');

  if (!seoTitle)  warnings.push(`[WARN] No SEOpress title for: ${entry.file}`);
  if (!seoDesc)   warnings.push(`[WARN] No SEOpress description for: ${entry.file}`);
  if (!url)       warnings.push(`[WARN] No URL found for: ${entry.file} (slug: ${slug})`);

  posts.push({
    _source_file:   entry.file,
    post_title:     title,
    post_name:      slug,
    post_type:      postType,
    post_status:    postStatus,
    post_content:   clean,
    ...(parent    ? { parent_slug:          parent   } : {}),
    ...(category  ? { category:             category } : {}),
    ...(seoTitle  ? { seopress_title:       seoTitle } : {}),
    ...(seoDesc   ? { seopress_description: seoDesc  } : {}),
    ...(seoCan    ? { seopress_canonical:   seoCan   } : {}),
    ...(focusKw   ? { focus_keyword:        focusKw  } : {}),
  });

  const status = seoTitle && seoDesc ? '✅' : '⚠️ ';
  console.log(`  ${status}  ${slug}`);
  console.log(`       title: ${title.slice(0, 80)}${title.length > 80 ? '…' : ''}`);
  if (!seoTitle) console.log(`       ⚠️  SEOpress title missing — fill manually in WordPress`);
  console.log('');
}

// ── Write outputs ─────────────────────────────────────────────────────────────

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const xmlFile  = path.join(outDir, `wp-import-${name}.xml`);
const jsonFile = path.join(outDir, `wp-import-${name}.json`);
const phpFile  = path.join(outDir, `wp-import-${name}.php`);

// WXR — for Admin → Tools → Import
fs.writeFileSync(xmlFile, generateWxr(name, site, posts), 'utf8');

// JSON — auditable source of truth
const jsonOut  = {
  _generated:  new Date().toISOString().slice(0, 10),
  _tool:       'ORCHESTRAI bricks-compiler / wp-import.js',
  site,
  post_count:  posts.length,
  posts,
};
fs.writeFileSync(jsonFile, JSON.stringify(jsonOut, null, 2));

// PHP — WP-CLI eval-file
fs.writeFileSync(phpFile, generatePhp(name, posts.length));

// ── Summary ──────────────────────────────────────────────────────────────────

if (warnings.length) {
  console.log('Warnings:');
  warnings.forEach(w => console.log('  ' + w));
  console.log('');
}

// Collect unique categories and parent stubs for summary
const usedCategories = [...new Set(posts.map(p => p.category).filter(Boolean))];
const stubParentSlugs = [...new Set(posts.filter(p => p.post_type === 'page' && p.parent_slug).map(p => p.parent_slug))];

console.log(`✅  Generated:`);
console.log(`    ${xmlFile}  (WXR — import via WP Admin)`);
console.log(`    ${jsonFile}  (${posts.length} posts — human-readable, auditable)`);
console.log(`    ${phpFile}  (WP-CLI importer)`);
console.log('');
console.log('  ── Via WordPress Admin (easiest, no SSH) ────────────────────────');
console.log('    1. WP Admin → Tools → Import → WordPress → Install Now → Run Importer');
console.log(`    2. Upload: ${path.basename(xmlFile)}`);
console.log('    3. Assign posts to an author → Submit');
if (usedCategories.length) {
  console.log('');
  console.log(`    ℹ️  Categories in XML: ${usedCategories.join(', ')}`);
  console.log('       WordPress will create them automatically if they don\'t exist.');
  console.log('       Permalink must be set to /%category%/%postname%/ for URLs to resolve.');
}
if (stubParentSlugs.length) {
  console.log('');
  console.log(`    ⚠️  Parent page stub(s) included in XML: ${stubParentSlugs.join(', ')}`);
  console.log('       If that page already exists in WordPress: trash the duplicate stub after import.');
}
console.log('');
console.log('  ── Via WP-CLI / SSH ─────────────────────────────────────────────');
console.log(`    scp wp-import-${name}.json wp-import-${name}.php user@host:/var/www/html/`);
console.log(`    ssh user@host "cd /var/www/html && wp eval-file wp-import-${name}.php --allow-root"`);

// ── Header parser ─────────────────────────────────────────────────────────────

/**
 * Parse SEOpress metadata from HTML comment blocks at the top of a file.
 * Handles all 4+ header formats used across ORCHESTRAI pipeline output.
 */
function parseHeader(html) {
  const meta = {};

  // Look in the first 200 lines — some header blocks include inline FAQ JSON-LD
  // which pushes the closing --> well past line 60.
  const zone = html.split('\n').slice(0, 200).join('\n');

  // Extract every HTML comment block in the header zone
  const commentRx = /<!--([\s\S]*?)-->/g;
  let m;
  while ((m = commentRx.exec(zone)) !== null) {
    const b = m[1];

    const grab = (rx, key) => {
      if (meta[key]) return;             // first match wins
      const r = b.match(rx);
      if (r) meta[key] = r[1].trim().replace(/\s+/g, ' ');
    };

    // ── Article/page title ───────────────────────────────────────────────────
    grab(/(?:Article|Page title)[:\s]+(.+)/i, 'article_title');

    // ── URL (path or full URL) ───────────────────────────────────────────────
    // "URL path:", "Canonical URL:", "URL:"  — value starts with /  or https://
    grab(/(?:URL path|Canonical URL|URL)[:\s]+((?:https?:\/\/[^/\s]+)?\/[^\s]+)/i, 'url');
    // "URL slug: some-slug" (no leading slash)
    if (!meta.url) grab(/URL slug[:\s]+([a-z0-9][a-z0-9-]*)\s*$/im, 'url_slug');

    // ── SEOpress Title ───────────────────────────────────────────────────────
    // "SEOpress Title:", "SEOpress: Title:", "SEOpress Titles Title:",
    // "- SEO title:", "- SEO Title:", "- Title:"
    grab(/SEOpress\s*:?\s*Titles?\s*:?\s*Titl(?:e)?[:\s]+(.+)/i, 'seopress_title');
    if (!meta.seopress_title) grab(/SEOpress\s*:?\s*Titl(?:e)?[:\s]+(.+)/i, 'seopress_title');
    if (!meta.seopress_title) grab(/[-*\s]*SEO\s+titl(?:e)?[:\s]+(.+)/i, 'seopress_title');
    if (!meta.seopress_title) grab(/^[-*\s]*Title[:\s]+(.+)/im, 'seopress_title');

    // ── SEOpress Meta Description ────────────────────────────────────────────
    // "SEOpress Meta Description:", "SEOpress Meta:", "SEOpress: Meta description:",
    // "- SEO description:", "- Meta description:"
    grab(/SEOpress\s*:?\s*Meta\s+(?:Description|Desc)[:\s]+(.+)/i, 'seopress_description');
    if (!meta.seopress_description) grab(/SEOpress\s*:?\s*Meta[:\s]+(.+)/i, 'seopress_description');
    if (!meta.seopress_description) grab(/[-*\s]*SEO\s+description[:\s]+(.+)/i, 'seopress_description');
    if (!meta.seopress_description) grab(/^[-*\s]*Meta\s*description[:\s]+(.+)/im, 'seopress_description');

    // ── Canonical ────────────────────────────────────────────────────────────
    grab(/SEOpress\s+canonical[:\s]+(https?:\/\/\S+)/i, 'seopress_canonical');

    // ── Focus keyword ────────────────────────────────────────────────────────
    grab(/Focus\s+keyword[:\s]+(.+)/i, 'focus_keyword');
  }

  return meta;
}

// ── Content helpers ───────────────────────────────────────────────────────────

/** Extract text of the first <h1> tag (strips inner HTML tags). */
function extractH1(html) {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, '').replace(/&#\d+;|&[a-z]+;/gi, c => {
    const map = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#8212;': '—', '&#8216;': '‘', '&#8217;': '’' };
    return map[c] || c;
  }).replace(/\s+/g, ' ').trim();
}

/**
 * Strip all leading HTML comment blocks from the start of the file.
 * Stops at the first non-whitespace, non-comment content.
 * Preserves comments embedded within the content body.
 */
function stripHeaderComments(html) {
  let s = html.trimStart();
  let prev;
  do {
    prev = s;
    // Remove one leading comment + any trailing whitespace/newlines
    s = s.replace(/^<!--[\s\S]*?-->\s*/, '');
  } while (s !== prev);
  return s.trim();
}

/** Extract the last path segment as slug from a URL like /google-reviews/stap-voor-stap/ */
function slugFromUrl(url) {
  if (!url) return null;
  const p = url.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '');
  const parts = p.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
}

/** Derive a slug from a filename by stripping known suffixes. */
function slugFromFilename(file) {
  return path.basename(file, '.html')
    .replace(/-v\d+$/, '')
    .replace(/-WORDPRESS$/i, '')
    .replace(/-PIPELINE$/i, '')
    .replace(/-WITH-LINKS$/i, '')
    .replace(/-REWRITE-\d{4}-\d{2}-\d{2}$/i, '')
    .replace(/-\d{4}-\d{2}-\d{2}$/i, '')
    .toLowerCase();
}

/** Convert a slug to Title Case (fallback when no H1 is found). */
function slugToTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── PHP eval-file generator ───────────────────────────────────────────────────

function generatePhp(name, count) {
  return `<?php
/**
 * WordPress import — generated by ORCHESTRAI bricks-compiler / wp-import.js
 * Posts: ${count}
 * Generated: ${new Date().toISOString().slice(0, 10)}
 *
 * Run with:
 *   wp eval-file wp-import-${name}.php --allow-root
 *
 * The script reads post content from wp-import-${name}.json in the same directory.
 * Idempotent: skips any post whose post_name already exists.
 * Sets SEOpress meta: _seopress_titles_title, _seopress_titles_desc,
 *                     _seopress_robots_canonical, _seopress_analysis_target_kw
 */

$json_file = __DIR__ . '/wp-import-${name}.json';

if ( ! file_exists( $json_file ) ) {
    WP_CLI::error( 'JSON file not found: ' . $json_file );
    return;
}

$data = json_decode( file_get_contents( $json_file ), true );

if ( ! $data || empty( $data['posts'] ) ) {
    WP_CLI::error( 'No posts found in ' . basename( $json_file ) );
    return;
}

$total   = count( $data['posts'] );
$created = 0;
$skipped = 0;
$failed  = 0;

WP_CLI::log( "Importing {$total} items from wp-import-${name}.json..." );
WP_CLI::log( "" );

foreach ( $data['posts'] as $i => $post ) {
    $num  = $i + 1;
    $type = $post['post_type'] ?? 'post';
    $slug = $post['post_name'];

    // Skip if slug already exists (works for both posts and pages)
    $existing = get_page_by_path( $slug, OBJECT, $type );
    if ( $existing ) {
        WP_CLI::log( "  [{$num}/{$total}] SKIP (exists as #{$existing->ID}): {$slug}" );
        $skipped++;
        continue;
    }

    // Resolve parent page ID (for hierarchical post types like 'page')
    $parent_id = 0;
    if ( ! empty( $post['parent_slug'] ) ) {
        $parent = get_page_by_path( $post['parent_slug'], OBJECT, $type );
        if ( $parent ) {
            $parent_id = $parent->ID;
        } else {
            WP_CLI::warning( "  Parent not found: '{$post['parent_slug']}' — creating without parent" );
        }
    }

    // Insert post
    $post_id = wp_insert_post( array(
        'post_title'   => wp_slash( $post['post_title'] ),
        'post_name'    => $slug,
        'post_content' => wp_slash( $post['post_content'] ),
        'post_status'  => $post['post_status'] ?? 'draft',
        'post_type'    => $type,
        'post_parent'  => $parent_id,
    ), true );

    if ( is_wp_error( $post_id ) ) {
        WP_CLI::warning( "  [{$num}/{$total}] FAILED: {$slug} — " . $post_id->get_error_message() );
        $failed++;
        continue;
    }

    // Assign category (for post_type = 'post')
    if ( ! empty( $post['category'] ) && $type === 'post' ) {
        $term = get_term_by( 'slug', $post['category'], 'category' );
        if ( $term ) {
            wp_set_post_terms( $post_id, array( $term->term_id ), 'category' );
        } else {
            // Category doesn't exist yet — create it
            $new_term = wp_insert_term(
                ucwords( str_replace( '-', ' ', $post['category'] ) ),
                'category',
                array( 'slug' => $post['category'] )
            );
            if ( ! is_wp_error( $new_term ) ) {
                wp_set_post_terms( $post_id, array( $new_term['term_id'] ), 'category' );
                WP_CLI::log( "  Created category: {$post['category']}" );
            }
        }
    }

    // SEOpress meta fields
    if ( ! empty( $post['seopress_title'] ) ) {
        update_post_meta( $post_id, '_seopress_titles_title', $post['seopress_title'] );
    }
    if ( ! empty( $post['seopress_description'] ) ) {
        update_post_meta( $post_id, '_seopress_titles_desc', $post['seopress_description'] );
    }
    if ( ! empty( $post['seopress_canonical'] ) ) {
        update_post_meta( $post_id, '_seopress_robots_canonical', $post['seopress_canonical'] );
    }
    if ( ! empty( $post['focus_keyword'] ) ) {
        update_post_meta( $post_id, '_seopress_analysis_target_kw', $post['focus_keyword'] );
    }

    $created++;
    WP_CLI::success( "  [{$num}/{$total}] #{$post_id}: " . mb_substr( $post['post_title'], 0, 70 ) );
}

WP_CLI::log( "" );
WP_CLI::log( "Done — Created: {$created} | Skipped (exists): {$skipped} | Failed: {$failed} | Total: {$total}" );
`;
}

// ── WXR generator ─────────────────────────────────────────────────────────────

/**
 * Generate a WXR (WordPress eXtended RSS) file importable via
 * WP Admin → Tools → Import → WordPress.
 *
 * Parent-child handling: for each unique parent_slug found in the posts array,
 * a lightweight stub page is added at the top of the item list with a fake
 * wp:post_id. Child posts reference that fake ID via wp:post_parent. WordPress
 * resolves the relationship at import time.
 *
 * If the parent page already exists in WordPress, delete the stub after import
 * (it will be imported as a draft with the same slug — just trash it).
 */
function generateWxr(name, site, posts) {
  const now        = new Date();
  const dateStr    = now.toISOString().replace('T', ' ').slice(0, 19);
  const pubDate    = now.toUTCString();
  const siteUrl    = site || 'https://example.com';

  /** Escape text for use in XML attributes / regular elements (not CDATA) */
  const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /** Escape content for CDATA — split on any ]]> sequence */
  const cdata = s => `<![CDATA[${(s || '').replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

  // ── Collect categories and build <wp:category> declarations ─────────────
  const allCategories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  const categoryDeclarations = allCategories.map(slug => {
    const niceName = slug;
    const catName  = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `    <wp:category>
      <wp:term_id>1</wp:term_id>
      <wp:category_nicename>${esc(niceName)}</wp:category_nicename>
      <wp:category_parent></wp:category_parent>
      <wp:cat_name>${cdata(catName)}</wp:cat_name>
    </wp:category>`;
  }).join('\n');

  // ── Build parent stubs (for Pages only — Posts use categories) ────────────
  const parentSlugs = [...new Set(
    posts.filter(p => p.post_type === 'page' && p.parent_slug).map(p => p.parent_slug)
  )];
  const parentIdMap = {};
  parentSlugs.forEach((slug, i) => { parentIdMap[slug] = 90 + i; });

  // ── Assign fake IDs to posts ──────────────────────────────────────────────
  const postItems = posts.map((p, i) => ({
    ...p,
    _fake_id: 100 + i,
    _parent_fake_id: (p.post_type === 'page' && parentIdMap[p.parent_slug]) || 0,
  }));

  // ── Render parent stub items (Pages only) ─────────────────────────────────
  const parentStubs = parentSlugs.map(slug => {
    const fakeId = parentIdMap[slug];
    const title  = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return `    <item>
      <title>${esc(title)}</title>
      <link>${esc(siteUrl)}/${esc(slug)}/</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>admin</dc:creator>
      <content:encoded>${cdata('')}</content:encoded>
      <excerpt:encoded>${cdata('')}</excerpt:encoded>
      <wp:post_id>${fakeId}</wp:post_id>
      <wp:post_date>${dateStr}</wp:post_date>
      <wp:post_date_gmt>${dateStr}</wp:post_date_gmt>
      <wp:comment_status>closed</wp:comment_status>
      <wp:ping_status>closed</wp:ping_status>
      <wp:post_name>${esc(slug)}</wp:post_name>
      <wp:status>draft</wp:status>
      <wp:post_parent>0</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type>page</wp:post_type>
      <wp:is_sticky>0</wp:is_sticky>
    </item>`;
  }).join('\n\n');

  // ── Render post items ─────────────────────────────────────────────────────
  const postItemsXml = postItems.map(p => {
    const postType = p.post_type || 'post';
    const url      = `${siteUrl}/${p.post_name}/`;

    const metaBlock = (key, value) =>
      value ? `      <wp:postmeta>\n        <wp:meta_key>${esc(key)}</wp:meta_key>\n        <wp:meta_value>${cdata(value)}</wp:meta_value>\n      </wp:postmeta>` : '';

    const metas = [
      metaBlock('_seopress_titles_title',      p.seopress_title),
      metaBlock('_seopress_titles_desc',        p.seopress_description),
      metaBlock('_seopress_robots_canonical',   p.seopress_canonical),
      metaBlock('_seopress_analysis_target_kw', p.focus_keyword),
    ].filter(Boolean).join('\n');

    // Category element — for Posts; Pages use wp:post_parent instead
    const categoryEl = (postType === 'post' && p.category)
      ? `      <category domain="category" nicename="${esc(p.category)}">${cdata(
          p.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        )}</category>`
      : '';

    return `    <item>
      <title>${esc(p.post_title)}</title>
      <link>${esc(url)}</link>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>admin</dc:creator>
${categoryEl ? categoryEl + '\n' : ''}      <content:encoded>${cdata(p.post_content)}</content:encoded>
      <excerpt:encoded>${cdata('')}</excerpt:encoded>
      <wp:post_id>${p._fake_id}</wp:post_id>
      <wp:post_date>${dateStr}</wp:post_date>
      <wp:post_date_gmt>${dateStr}</wp:post_date_gmt>
      <wp:comment_status>closed</wp:comment_status>
      <wp:ping_status>closed</wp:ping_status>
      <wp:post_name>${esc(p.post_name)}</wp:post_name>
      <wp:status>${esc(p.post_status || 'draft')}</wp:status>
      <wp:post_parent>${p._parent_fake_id}</wp:post_parent>
      <wp:menu_order>0</wp:menu_order>
      <wp:post_type>${esc(postType)}</wp:post_type>
      <wp:is_sticky>0</wp:is_sticky>
${metas}
    </item>`;
  }).join('\n\n');

  return `<?xml version="1.0" encoding="UTF-8" ?>
<!-- Generated by ORCHESTRAI bricks-compiler / wp-import.js on ${now.toISOString().slice(0, 10)} -->
<!-- Import via: WP Admin → Tools → Import → WordPress → Upload this file -->
<!-- Permalink required: Settings → Permalinks → /%category%/%postname%/ -->
<rss version="2.0"
     xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:wp="http://wordpress.org/export/1.2/">
  <channel>
    <title>${esc(name)}</title>
    <link>${esc(siteUrl)}</link>
    <description>ORCHESTRAI pipeline import — ${posts.length} posts</description>
    <pubDate>${pubDate}</pubDate>
    <language>nl</language>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>${esc(siteUrl)}</wp:base_site_url>
    <wp:base_blog_url>${esc(siteUrl)}</wp:base_blog_url>

${categoryDeclarations}

${parentStubs ? parentStubs + '\n\n' : ''}${postItemsXml}

  </channel>
</rss>
`;
}

function printUsage() {
  console.log(`
wp-import.js — ORCHESTRAI Bricks Compiler

Converts pipeline WP HTML files into a WordPress import package.

Usage:
  node wp-import.js <spec.json>
  node wp-import.js --scan <html-folder> [options]

Spec-file options (in spec.json):
  name           string   — output filename prefix
  site           string   — WordPress site URL (for canonical fallback)
  html_base_dir  string   — path to HTML folder (relative to spec file)
  defaults       object   — post_type, post_status, parent_slug
  posts          array    — { file, url?, slug?, title_override?, seopress_title?,
                              seopress_desc?, seopress_canonical?, focus_keyword?,
                              post_type?, post_status?, parent_slug? }

CLI options (--scan mode):
  --name   <string>   Output filename prefix     (default: import)
  --site   <url>      WordPress site URL
  --type   <string>   Post type                  (default: page)
  --status <string>   Post status                (default: draft)
  --parent <slug>     Parent page slug
  --out-dir <path>    Output directory           (default: current dir)

Outputs:
  wp-import-[name].xml    WXR — import via WP Admin → Tools → Import → WordPress
  wp-import-[name].json   Post data (auditable, version-controllable)
  wp-import-[name].php    WP-CLI eval-file importer

Import via WordPress Admin (no SSH needed):
  1. WP Admin → Tools → Import → WordPress → Install Now → Run Importer
  2. Upload wp-import-[name].xml
  3. Assign to an author, click Submit

Import via WP-CLI (requires SSH / server access):
  wp eval-file wp-import-[name].php --allow-root
`.trim());
}

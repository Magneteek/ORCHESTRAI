---
name: wordpress-publisher
description: Publishes a single HTML file to WordPress as a draft via REST API with SEOpress meta support.
tools: Read, Bash, Write
model: sonnet
---

You publish HTML content files to WordPress as drafts via the WordPress REST API. Every fix must be exact — no generic steps.

---

## Required Inputs

| Input | Source |
|-------|--------|
| HTML file path | Provided by user or command |
| WordPress site URL | Project CLAUDE.md → `## WordPress API` |
| WP username | Project CLAUDE.md → `## WordPress API` |
| WP Application Password | Project CLAUDE.md → `## WordPress API` |

---

## Credentials Setup (first-time per client)

If project CLAUDE.md has no `## WordPress API` section, instruct the user to:

1. Log into WordPress admin → Users → Profile
2. Scroll to **Application Passwords**
3. Enter name: `ORCHESTRAI` → click **Add New Application Password**
4. Copy the generated password (shown once)
5. Add to project CLAUDE.md:

```markdown
## WordPress API
- url: https://example.com
- username: admin
- app_password: AbCd EfGh IjKl MnOp QrSt UvWx
```

The password can include spaces exactly as WordPress shows it.

---

## HTML Metadata Convention

Content pipeline HTML files may include a metadata block as the very first element:

```html
<!--
wp:title: Full Post Title Here
wp:seo_title: SEO Title | Brand Name
wp:seo_desc: Meta description — 150–160 characters, includes primary keyword.
wp:slug: post-url-slug
wp:categories: category-slug, second-category
wp:tags: tag one, tag two, tag three
wp:excerpt: One sentence excerpt for archive pages.
-->
```

If this block is absent, extract metadata from the HTML itself (see Step 2).

---

## Step 1 — Read credentials and HTML file

```bash
# Read project CLAUDE.md
Read("projects/[uuid]/CLAUDE.md")
```

Extract:
- `WP_URL` — site URL without trailing slash
- `WP_USER` — username
- `WP_PASS` — app password (strip all spaces before use)

```bash
# Read the HTML file
Read("[html_file_path]")
```

---

## Step 2 — Extract metadata

Run this to parse the wp: comment block:

```bash
HTML_FILE="[html_file_path]"

# Try wp: comment block first
WP_TITLE=$(grep -o 'wp:title:.*' "$HTML_FILE" | head -1 | sed 's/wp:title: *//')
WP_SEO_TITLE=$(grep -o 'wp:seo_title:.*' "$HTML_FILE" | head -1 | sed 's/wp:seo_title: *//')
WP_SEO_DESC=$(grep -o 'wp:seo_desc:.*' "$HTML_FILE" | head -1 | sed 's/wp:seo_desc: *//')
WP_SLUG=$(grep -o 'wp:slug:.*' "$HTML_FILE" | head -1 | sed 's/wp:slug: *//')
WP_CATEGORIES=$(grep -o 'wp:categories:.*' "$HTML_FILE" | head -1 | sed 's/wp:categories: *//')
WP_TAGS=$(grep -o 'wp:tags:.*' "$HTML_FILE" | head -1 | sed 's/wp:tags: *//')
WP_EXCERPT=$(grep -o 'wp:excerpt:.*' "$HTML_FILE" | head -1 | sed 's/wp:excerpt: *//')

# Fallback: extract title from first <h1>
if [ -z "$WP_TITLE" ]; then
  WP_TITLE=$(grep -o '<h1[^>]*>[^<]*</h1>' "$HTML_FILE" | head -1 | sed 's/<[^>]*>//g')
fi

# Fallback: derive slug from filename
if [ -z "$WP_SLUG" ]; then
  WP_SLUG=$(basename "$HTML_FILE" .html | tr '_' '-' | tr '[:upper:]' '[:lower:]')
fi

# Fallback: use first <p> text as excerpt
if [ -z "$WP_EXCERPT" ]; then
  WP_EXCERPT=$(grep -o '<p[^>]*>[^<]*</p>' "$HTML_FILE" | head -1 | sed 's/<[^>]*>//g' | cut -c1-200)
fi

echo "Title: $WP_TITLE"
echo "Slug: $WP_SLUG"
echo "SEO Title: $WP_SEO_TITLE"
echo "SEO Desc: $WP_SEO_DESC"
echo "Categories: $WP_CATEGORIES"
echo "Tags: $WP_TAGS"
echo "Excerpt: $WP_EXCERPT"
```

Confirm extracted values with the user before publishing if any critical fields are empty.

---

## Step 3 — Resolve category and tag IDs

WordPress REST API requires numeric IDs, not slugs/names.

```bash
WP_URL="[site_url]"
TOKEN=$(echo -n "[username]:[app_password_no_spaces]" | base64)

# Look up each category by slug
for CAT in $(echo "$WP_CATEGORIES" | tr ',' '\n' | xargs); do
  curl -s "${WP_URL}/wp-json/wp/v2/categories?slug=${CAT}" \
    -H "Authorization: Basic ${TOKEN}" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data:
    print(data[0]['id'])
else:
    print('NOT_FOUND:' + '${CAT}')
"
done
```

**If a category returns NOT_FOUND**: create it:

```bash
curl -s -X POST "${WP_URL}/wp-json/wp/v2/categories" \
  -H "Authorization: Basic ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"${CAT}\", \"slug\": \"${CAT}\"}" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])"
```

Repeat for tags using `/wp-json/wp/v2/tags` endpoint.

---

## Step 4 — Publish to WordPress

Build and send the API call using Python for safe JSON handling (avoids shell escaping issues with HTML content):

```bash
python3 << 'PYEOF'
import json, base64, urllib.request, sys

# Credentials
wp_url    = "[WP_URL]"
username  = "[WP_USER]"
password  = "[WP_PASS_NO_SPACES]"
token     = base64.b64encode(f"{username}:{password}".encode()).decode()
ua        = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Content — read full HTML file
with open("[html_file_path]", "r") as f:
    content = f.read()

# Remove the wp: metadata comment block from content before publishing
import re
content = re.sub(r'<!--\s*\nwp:.*?-->\s*\n?', '', content, flags=re.DOTALL)

# Build payload
payload = {
    "title":   "[WP_TITLE]",
    "content": content,
    "excerpt": "[WP_EXCERPT]",
    "slug":    "[WP_SLUG]",
    "status":  "draft",
    "categories": [CATEGORY_IDS],  # list of ints
    "tags":       [TAG_IDS],       # list of ints
    "meta": {
        "_seopress_titles_title": "[WP_SEO_TITLE]",
        "_seopress_titles_desc":  "[WP_SEO_DESC]"
    }
}

# Send
req = urllib.request.Request(
    f"{wp_url}/wp-json/wp/v2/posts",
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Basic {token}",
        "Content-Type":  "application/json",
        "User-Agent":    ua
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        result = json.loads(resp.read())
        print(f"SUCCESS | Post ID: {result['id']} | Draft URL: {result['link']}")
        print(f"Edit URL: {wp_url}/wp-admin/post.php?post={result['id']}&action=edit")
except urllib.error.HTTPError as e:
    error = json.loads(e.read())
    print(f"ERROR {e.code}: {error.get('message', 'Unknown error')}")
    print(f"Code: {error.get('code', '')}")
    sys.exit(1)
PYEOF
```

---

## Step 5 — Output

Report the result:

```
✅ Published as draft
   Title:    [post title]
   Slug:     [slug]
   Edit URL: [wp-admin edit link]
   SEO:      title + description set via SEOpress
```

If error:
- `rest_cannot_create` → Application Password not set up correctly; verify username matches the user who generated the password
- `rest_post_invalid_page_number` → URL path issue; confirm WP_URL has no trailing slash
- `400 Bad Request` on meta → SEOpress not registering REST fields; check SEOpress version ≥ 5.0

---

## What NOT to do

- Do not publish as `status: publish` — always draft, let the client review first
- Do not strip HTML from content — the pipeline outputs WordPress-ready HTML, preserve it
- Do not hardcode credentials — always read from project CLAUDE.md
- Do not skip the metadata comment removal step — the `<!-- wp:... -->` block must not appear in the published post content

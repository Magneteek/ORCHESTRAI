---
name: publish-to-wordpress
description: Bulk-publish HTML pipeline files to WordPress drafts via REST API.
tools: Read, Bash, Write, Glob
model: sonnet
---

You orchestrate bulk publishing of ORCHESTRAI content pipeline HTML files to WordPress as drafts.

---

## Usage

```
/publish-to-wordpress [project-uuid]
/publish-to-wordpress [project-uuid] [specific-file.html]
```

**Examples:**
```
/publish-to-wordpress nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e
/publish-to-wordpress nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e zobni-vsadki.html
```

---

## Step 1 — Read project context

```
Read("projects/[uuid]/CLAUDE.md")
```

Extract from the `## WordPress API` section:
- `WP_URL` — site URL (no trailing slash)
- `WP_USER` — WordPress username
- `WP_PASS` — Application Password (will strip spaces before use)

**If `## WordPress API` section is missing**, stop and instruct the user:

> Add the following to `projects/[uuid]/CLAUDE.md`:
> ```markdown
> ## WordPress API
> - url: https://yoursite.com
> - username: your_wp_username
> - app_password: AbCd EfGh IjKl MnOp QrSt UvWx
> ```
> Generate the Application Password in WordPress admin → Users → Profile → Application Passwords → name it "ORCHESTRAI".

---

## Step 2 — Find HTML files

**If a specific file was provided**: use that path directly.

**If no file specified**: scan the project's WordPress HTML deliverables folder:

```bash
find "projects/[uuid]/deliverables/content/wordpress-html/" -name "*.html" -type f | sort
```

List the files found and confirm with a count:
> Found X HTML files to publish. Proceeding...

If the folder doesn't exist, also check:
- `projects/[uuid]/deliverables/content/`
- `projects/[uuid]/deliverables/`

---

## Step 3 — Process each file

For each HTML file, run the full publish sequence:

### 3a — Extract metadata

```bash
FILE="[html_file_path]"

WP_TITLE=$(grep -o 'wp:title:.*' "$FILE" | head -1 | sed 's/wp:title: *//')
WP_SEO_TITLE=$(grep -o 'wp:seo_title:.*' "$FILE" | head -1 | sed 's/wp:seo_title: *//')
WP_SEO_DESC=$(grep -o 'wp:seo_desc:.*' "$FILE" | head -1 | sed 's/wp:seo_desc: *//')
WP_SLUG=$(grep -o 'wp:slug:.*' "$FILE" | head -1 | sed 's/wp:slug: *//')
WP_TYPE=$(grep -o 'wp:type:.*' "$FILE" | head -1 | sed 's/wp:type: *//')
WP_CATEGORIES=$(grep -o 'wp:categories:.*' "$FILE" | head -1 | sed 's/wp:categories: *//')
WP_TAGS=$(grep -o 'wp:tags:.*' "$FILE" | head -1 | sed 's/wp:tags: *//')
WP_EXCERPT=$(grep -o 'wp:excerpt:.*' "$FILE" | head -1 | sed 's/wp:excerpt: *//')

# Fallbacks
[ -z "$WP_TITLE" ] && WP_TITLE=$(grep -o '<h1[^>]*>[^<]*</h1>' "$FILE" | head -1 | sed 's/<[^>]*>//g')
[ -z "$WP_SLUG" ] && WP_SLUG=$(basename "$FILE" .html | tr '_' '-' | tr '[:upper:]' '[:lower:]')
[ -z "$WP_EXCERPT" ] && WP_EXCERPT=$(grep -o '<p[^>]*>[^<]*</p>' "$FILE" | head -1 | sed 's/<[^>]*>//g' | cut -c1-200)
[ -z "$WP_TYPE" ] && WP_TYPE="post"
```

### 3b — Resolve category and tag IDs

```bash
TOKEN=$(echo -n "[WP_USER]:[WP_PASS_NO_SPACES]" | base64)
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Resolve categories (creates if not found)
resolve_term() {
  local TERM="$1"
  local ENDPOINT="$2"  # categories or tags
  local TRIMMED=$(echo "$TERM" | xargs)
  
  ID=$(curl -s "${WP_URL}/wp-json/wp/v2/${ENDPOINT}?slug=${TRIMMED}" \
    -H "Authorization: Basic ${TOKEN}" \
    -H "User-Agent: ${UA}" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")
  
  if [ -z "$ID" ]; then
    ID=$(curl -s -X POST "${WP_URL}/wp-json/wp/v2/${ENDPOINT}" \
      -H "Authorization: Basic ${TOKEN}" \
      -H "User-Agent: ${UA}" \
      -H "Content-Type: application/json" \
      -d "{\"name\": \"${TRIMMED}\", \"slug\": \"${TRIMMED}\"}" \
      | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  fi
  echo "$ID"
}
```

### 3c — Publish

Route to the correct endpoint based on `WP_TYPE`:
- `wp:type: page` → `/wp-json/wp/v2/pages` (no categories/tags fields)
- `wp:type: post` (default) → `/wp-json/wp/v2/posts`

```python
python3 << PYEOF
import json, base64, urllib.request, re, sys

wp_url   = "[WP_URL]"
username = "[WP_USER]"
password = "[WP_PASS]".replace(" ", "")
token    = base64.b64encode(f"{username}:{password}".encode()).decode()
wp_type  = "[WP_TYPE]"  # "post" or "page"
ua       = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

with open("[FILE]", "r") as f:
    content = f.read()

# Strip metadata comment block from content
content = re.sub(r'<!--\s*\nwp:.*?-->\s*\n?', '', content, flags=re.DOTALL)

endpoint = f"{wp_url}/wp-json/wp/v2/{'pages' if wp_type == 'page' else 'posts'}"

payload = {
    "title":   "[WP_TITLE]",
    "content": content,
    "excerpt": "[WP_EXCERPT]",
    "slug":    "[WP_SLUG]",
    "status":  "draft",
    "meta": {
        "_seopress_titles_title": "[WP_SEO_TITLE]",
        "_seopress_titles_desc":  "[WP_SEO_DESC]"
    }
}

# Posts support categories and tags; pages do not
if wp_type != "page":
    payload["categories"] = [CATEGORY_IDS]
    payload["tags"]       = [TAG_IDS]

req = urllib.request.Request(
    endpoint,
    data=json.dumps(payload).encode(),
    headers={
        "Authorization": f"Basic {token}",
        "Content-Type":  "application/json",
        "User-Agent":    ua
    }
)

try:
    with urllib.request.urlopen(req) as resp:
        r = json.loads(resp.read())
        edit_path = "post.php" if wp_type != "page" else "post.php"
        print(f"OK|{r['id']}|{wp_url}/wp-admin/post.php?post={r['id']}&action=edit")
except urllib.error.HTTPError as e:
    err = json.loads(e.read())
    print(f"ERR|{e.code}|{err.get('message','')}")
    sys.exit(1)
PYEOF
```

---

## Step 4 — Output summary

After all files are processed, print a results table:

```
## WordPress Publishing Complete

| # | File | Title | Status | Edit URL |
|---|------|-------|--------|----------|
| 1 | zobni-vsadki.html | Zobni vsadki — popoln vodič | ✅ Draft | [link] |
| 2 | implantati-cena.html | Cena zobnih vsadkov | ✅ Draft | [link] |
| 3 | okrevanje.html | Okrevanje po vgradnji | ❌ Error: rest_cannot_create | — |

**3 files processed — 2 published, 1 failed**

### Next steps
1. Review each draft in WordPress admin before publishing
2. Add featured images where needed
3. Set publish dates if scheduling posts
4. Verify SEOpress meta title + description in each post's SEO tab
```

---

## HTML Metadata Convention

Tell the user: for best results, content pipeline HTML files should include this block at the very top:

```html
<!--
wp:title: Full Post Title
wp:seo_title: SEO Title | Brand
wp:seo_desc: Meta description 150–160 chars.
wp:slug: url-slug-here
wp:categories: category-slug
wp:tags: tag one, tag two
wp:excerpt: One sentence for archive pages.
-->
```

Fields that are missing will fall back to HTML extraction (title from `<h1>`, slug from filename, excerpt from first `<p>`).

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `rest_cannot_create` | Wrong username or bad app password | Regenerate Application Password; username must match the WP user who created it |
| `401 Unauthorized` | App password not activated or spaces not stripped | Verify password in WP admin; strip all spaces from password string |
| `meta fields empty in WP` | SEOpress not registering REST fields | Update SEOpress to v5.0+; check SEOpress → Settings → REST API |
| `500 on category create` | User doesn't have `manage_categories` capability | Use an admin-level WordPress user |
| `403 error code: 1010` | Cloudflare bot protection blocking the request | Add `User-Agent: Mozilla/5.0 ...Chrome...` header to all requests — already included in this skill |

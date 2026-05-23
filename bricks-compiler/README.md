# Bricks Compiler

Converts Frames+ACSS section templates into Bricks Builder clipboard JSON.
The output is identical to what Bricks produces when you copy elements —
paste it directly into any Bricks editor, or write it to WP postmeta via REST API.

## Quick start

```bash
npm install
node cli.js examples/foxtrot-example.json --clipboard
# → copies to macOS clipboard, paste into Bricks editor
```

## How it works

```
Page spec (JSON)
    ↓
  [Compiler]
    ↓  loads template + manifest per section
    ↓  strips fr-notes elements
    ↓  expands array/compound_array slots (clones subtrees)
    ↓  regenerates all element IDs
    ↓  fills scalar slots (string, html, media, icon, link)
    ↓  merges globalClasses across sections
    ↓
Bricks clipboard JSON  ← paste into editor
                       ← or write to _bricks_page_content_2 postmeta
```

## Page spec format

```json
{
  "page_title": "My Service Page",
  "slug": "my-service-page",
  "source_url": "https://mysite.com",
  "sections": [
    {
      "component": "feature-section-foxtrot",
      "slots": {
        "heading": "Why Choose Us",
        "accent_heading": "Our Services",
        "lede": "Supporting paragraph here.",
        "features": [
          { "icon": { "url": "https://..." }, "heading": "Feature 1", "text": "Description." },
          { "icon": { "url": "https://..." }, "heading": "Feature 2", "text": "Description." }
        ],
        "primary_cta_text": "Get Started",
        "primary_cta_link": { "url": "https://mysite.com/contact" }
      }
    }
  ]
}
```

## CLI

```bash
node cli.js <page-spec.json>               # print clipboard JSON to stdout
node cli.js <page-spec.json> output.json   # write to file
node cli.js <page-spec.json> --clipboard   # copy to macOS clipboard (pbcopy)
```

## Slot types

| Type | Value format | Notes |
|------|-------------|-------|
| `string` | `"plain text"` | For headings, labels, CTA text |
| `html` | `"<p>Rich text</p>"` | For body text elements |
| `media` | `{ url, full?, id?, filename? }` | Image elements; isPlaceholder cleared, path stripped |
| `icon` | `{ url, full? }` | SVG icon elements |
| `link` | `{ url, type? }` or `"https://..."` | Button/heading links; inserted even if absent in template |
| `dynamic` | pass-through | `{post_title}` etc. — never touched by compiler |
| `array` | `[{ item_slots... }, ...]` | Simple repeating elements (stat cards, feature cards) |
| `compound_array` | `[{ item_slots... }, ...]` | Two parallel subtrees (tabs nav+content, synced sliders) |

## Adding a new section

1. **Export the section** from Bricks editor (copy elements → the clipboard JSON)
2. **Save as template**: `templates/<section-name>.json`
3. **Write a manifest**: `manifests/<section-name>.yaml`
4. **Test**: `node cli.js examples/<section-name>-example.json --clipboard`

### Manifest structure

```yaml
component: my-section-name
version: "2.3.5"
description: What this section does

slots:
  heading:
    type: string
    required: true
    max_length: 80
    target_class: my-section__heading    # class name from globalClasses
    description: Main H2

  body:
    type: html
    required: true
    target_label: "Text"                 # fallback: match by element label

  image:
    type: media
    required: true
    target_class: my-section__media

  cards:
    type: array
    required: true
    min: 2
    max: 6
    template_label: "Card"              # label of the repeating element
    item_slots:
      heading:
        type: string
        required: true
        target_label: "Card Heading"
      text:
        type: string
        target_label: "Card Text"

strip_elements:
  - name: fr-notes                      # always strip Frames builder notes
```

### Targeting strategy

The compiler finds elements by:
1. **`target_class`** (preferred) — looks up class ID from `globalClasses`, finds element with that ID in `_cssGlobalClasses`
2. **`target_label`** (fallback) — matches element's `label` field

Use `target_class` whenever possible — it's reliable even when elements have no `label`.

## Available templates

| Component | Slots | Notes |
|-----------|-------|-------|
| `feature-section-foxtrot` | heading, accent, lede, features[], ctas | 2–6 icon+text cards |
| *(add more as you export from Bricks)* | | |

## WP publishing (postmeta write)

The compiler output includes two separate arrays for direct WP writing:

```js
const result = compilePage(pageSpec);

// Write to WordPress via WP-CLI:
// wp post create --post_title="..." --post_status=draft
// wp post meta update <ID> _bricks_page_content_2 '<result.bricks_content JSON>'
// wp post meta update <ID> _bricks_editor_mode 'bricks'
// wp option patch update bricks_global_classes '<merge result.bricks_global_classes>'

// Or via WP REST API:
// POST /wp-json/wp/v2/pages with meta fields
```

## Architecture notes

- **IDs**: Regenerated fresh on every compile — no collisions when pasting multiple sections
- **`_hidden._cssClasses`**: Frames JS hook strings (e.g. `fr-tabs__link`) — preserved exactly on all clones
- **`fr-*` widget elements**: Treated as opaque — settings never touched, only content slots within subtree filled
- **ACSS classes** (`category: "acss"`): Referenced but not defined — plugin manages them
- **Missing class refs**: Warned, not errored — class may exist on target site already
- **`syncId`**: Slider sync IDs preserved exactly — don't regenerate

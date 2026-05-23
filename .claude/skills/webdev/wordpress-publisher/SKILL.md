---
name: wordpress-publisher
description: Publishes HTML content files to WordPress as drafts via REST API. No plugin required — uses WordPress Application Passwords (built-in since WP 5.6). Sets title, content, excerpt, slug, categories, tags, and SEOpress meta fields in a single call. Reads credentials from project CLAUDE.md.
domain: webdev
tools: Read, Bash, Write
model: sonnet
color: blue
---

Publishes a single HTML file to WordPress as a draft via REST API. Extracts metadata from the file's wp: comment block if present, falls back to HTML extraction. Returns the draft edit URL.

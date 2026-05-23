---
name: publish-to-wordpress
description: Bulk-publishes HTML content pipeline files to WordPress as drafts. Reads WP credentials from project CLAUDE.md, scans deliverables/content/wordpress-html/ for HTML files, creates one draft per file with title, slug, categories, tags, and SEOpress meta fields populated. Returns a summary table with edit URLs.
domain: commands
tools: Read, Bash, Write, Glob
model: sonnet
---

Command to export ORCHESTRAI content pipeline output to WordPress drafts in bulk.

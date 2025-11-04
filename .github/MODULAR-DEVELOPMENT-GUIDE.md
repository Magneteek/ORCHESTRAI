# ORCHESTRAI Modular Development Guide

## Overview

ORCHESTRAI is structured as a **modular monorepo** that allows you to work on individual domains independently while maintaining a unified codebase. This guide explains three different workflows for modular development.

## 🎯 Choose Your Workflow

### Workflow 1: Domain Branching (Recommended for Most)

**Best for:** Working on one domain at a time, standard git workflow

**Pros:**
- ✅ Familiar git workflow
- ✅ Easy to understand and review
- ✅ Clean branch history
- ✅ No additional setup needed

**Cons:**
- ❌ Need to switch branches to work on different domains
- ❌ Can't test cross-domain changes simultaneously

**Setup:**
```bash
npm run git:setup-domains
```

**Usage:**
```bash
# Work on advertising domain
git checkout domain/advertising-enhanced
git checkout -b feature/advertising/my-feature

# Make changes, commit, push
git add orchestrai-domains/advertising-enhanced/
git commit -m "feat(advertising): Add new feature"
git push origin feature/advertising/my-feature
```

---

### Workflow 2: Git Worktrees (Advanced - Multiple Domains)

**Best for:** Working on multiple domains simultaneously

**Pros:**
- ✅ Multiple domains open at once in different directories
- ✅ No branch switching needed
- ✅ Can run tests for different domains in parallel
- ✅ Each worktree is independent

**Cons:**
- ❌ More disk space (separate copies)
- ❌ Slightly more complex setup
- ❌ Need to manage multiple directories

**Setup:**
```bash
npm run git:setup-worktrees
```

**Usage:**
```bash
# Work on advertising in one terminal
cd ../ORCHESTRAI-worktrees/advertising
git checkout -b feature/advertising/google-ads
# Make changes...

# Work on SEO in another terminal (simultaneously!)
cd ../ORCHESTRAI-worktrees/seo
git checkout -b feature/seo/competitor-analysis
# Make changes...
```

---

### Workflow 3: Sparse Checkout (Lightweight - Focus Mode)

**Best for:** Working on one domain with minimal disk usage, hiding other domains

**Pros:**
- ✅ Only checkout files you need
- ✅ Faster git operations
- ✅ Less clutter in your IDE
- ✅ Smaller disk footprint

**Cons:**
- ❌ Can't see other domains (unless added)
- ❌ Need to reconfigure to switch domains
- ❌ Can accidentally commit without seeing full context

**Setup:**
```bash
npm run git:sparse-checkout
# Select domain(s) from interactive menu
```

**Usage:**
```bash
# After setup, your workspace only shows selected domain
ls orchestrai-domains/
# Only shows: advertising-enhanced/

# Work normally - other domains are hidden
git add orchestrai-domains/advertising-enhanced/
git commit -m "feat(advertising): Update campaign logic"

# To see full repo again
git sparse-checkout disable
```

---

## 🚀 Quick Start

### Option A: Standard Domain Workflow

1. **Setup domain branches:**
   ```bash
   npm run git:setup-domains
   ```

2. **Start working on a domain:**
   ```bash
   git checkout domain/advertising-enhanced
   git checkout -b feature/advertising/linkedin-integration
   ```

3. **Make changes and commit:**
   ```bash
   git add orchestrai-domains/advertising-enhanced/
   git commit -m "feat(advertising): Add LinkedIn Ads integration"
   ```

4. **Push and create PR:**
   ```bash
   git push origin feature/advertising/linkedin-integration
   # Create PR: feature/advertising/linkedin-integration → domain/advertising-enhanced
   ```

### Option B: Worktree Workflow (Multiple Domains)

1. **Setup worktrees:**
   ```bash
   npm run git:setup-worktrees
   ```

2. **Open multiple terminals/IDEs:**
   ```bash
   # Terminal 1 - Advertising work
   cd ../ORCHESTRAI-worktrees/advertising
   code .

   # Terminal 2 - SEO work
   cd ../ORCHESTRAI-worktrees/seo
   code .

   # Terminal 3 - Content work
   cd ../ORCHESTRAI-worktrees/content
   code .
   ```

3. **Work independently in each:**
   ```bash
   # In advertising worktree
   git checkout -b feature/advertising/meta-ads
   # Make changes, commit, push

   # In SEO worktree (at the same time!)
   git checkout -b feature/seo/technical-audit
   # Make changes, commit, push
   ```

### Option C: Sparse Checkout Workflow (Focused)

1. **Enable sparse checkout for specific domain:**
   ```bash
   npm run git:sparse-checkout
   # Choose: 1 (advertising-enhanced)
   ```

2. **Work as normal:**
   ```bash
   # Only advertising files are visible
   git checkout -b feature/advertising/campaign-optimizer
   # Edit files...
   git commit -m "feat(advertising): Optimize campaign bidding"
   ```

3. **Switch to different domain:**
   ```bash
   npm run git:sparse-checkout
   # Choose: 6 (seo)
   # Now only SEO files are visible
   ```

---

## 📋 Domain Structure

```
orchestrai-domains/
├── advertising-enhanced/        # Google, Meta, LinkedIn, Reddit ads
│   ├── agents/
│   ├── advertising-domain-hub.js
│   └── ADVERTISING-OUTPUT-STRUCTURE.md
│
├── client-intelligence/         # ICP, psychographics, research
│   ├── agents/
│   └── client-intelligence-domain-hub.js
│
├── content-enhanced/            # Content creation, copywriting
│   ├── agents/
│   ├── workflows/
│   └── content-domain-hub.js
│
├── content-strategy/            # Outlines, planning
│   ├── enhanced-outline-generator.js
│   └── strategic-outline-generator-v3.js
│
├── reputation-intelligence/     # Reviews, sentiment analysis
│   ├── agents/
│   ├── package.json            # Domain-specific dependencies
│   └── reputation-intelligence-domain-hub.js
│
├── seo/                        # SEO analysis, optimization
│   ├── agents/
│   └── seo-domain-hub.js
│
└── web-quality/                # Web dev, visual QA
    ├── agents/
    ├── claude-code-agents/
    ├── mcp-agents/
    └── web-quality-domain-hub.js
```

---

## 🔄 Branch Strategy

### Main Branches
```
main                    # Production-ready code (PROTECTED)
develop                 # Integration branch
```

### Domain Branches (Long-lived)
```
domain/advertising-enhanced
domain/client-intelligence
domain/content-enhanced
domain/content-strategy
domain/reputation-intelligence
domain/seo
domain/web-quality
```

### Feature Branches (Short-lived)
```
feature/<domain>/<feature-name>

Examples:
  feature/advertising/google-ads-quality-score
  feature/content/wordpress-gutenberg
  feature/seo/competitor-gap-analysis
```

### System-wide Features
```
feature/orchestrator/<feature-name>
feature/memory/<feature-name>
feature/shared/<feature-name>

Examples:
  feature/orchestrator/harmonic-windowing
  feature/memory/crystalline-optimization
```

---

## 💡 Common Scenarios

### Scenario 1: Add feature to advertising domain

```bash
# Standard workflow
git checkout domain/advertising-enhanced
git checkout -b feature/advertising/quality-score-optimizer
# Make changes...
git add orchestrai-domains/advertising-enhanced/
git commit -m "feat(advertising): Add Quality Score optimization"
git push origin feature/advertising/quality-score-optimizer
```

### Scenario 2: Work on SEO and content simultaneously

```bash
# Worktree workflow
cd ../ORCHESTRAI-worktrees/seo
git checkout -b feature/seo/technical-audit
# Make SEO changes in one IDE...

cd ../ORCHESTRAI-worktrees/content
git checkout -b feature/content/outline-validator
# Make content changes in another IDE simultaneously...
```

### Scenario 3: Focus only on web development

```bash
# Sparse checkout workflow
npm run git:sparse-checkout
# Select: 7 (web-quality)

# Now you only see web-quality domain
git checkout -b feature/web/shadcn-components
# Make changes...
```

### Scenario 4: Cross-domain feature (affects multiple)

```bash
# Work on main repo or create worktrees for affected domains
git checkout develop
git checkout -b feature/orchestrator/multi-domain-coordination

# Make changes across multiple domains
git add orchestrai-domains/advertising-enhanced/
git add orchestrai-domains/content-enhanced/
git add orchestrai-master/
git commit -m "feat(orchestrator): Add cross-domain task coordination"
```

---

## 📊 Comparison Matrix

| Feature | Domain Branching | Git Worktrees | Sparse Checkout |
|---------|-----------------|---------------|-----------------|
| **Ease of Setup** | ✅✅✅ Easy | ✅✅ Moderate | ✅✅ Moderate |
| **Disk Usage** | ✅✅✅ Low | ❌ High | ✅✅✅ Very Low |
| **Parallel Work** | ❌ No | ✅✅✅ Yes | ❌ No |
| **IDE Performance** | ✅✅ Good | ✅✅✅ Excellent | ✅✅✅ Excellent |
| **Git Operations** | ✅✅ Normal | ✅✅ Normal | ✅✅✅ Fast |
| **Context Switching** | ❌ Branch switch | ✅✅✅ Directory switch | ✅ Reconfigure |
| **Full Visibility** | ✅✅✅ Always | ✅✅✅ Always | ❌ Limited |
| **Complexity** | ✅✅✅ Low | ✅✅ Medium | ✅✅ Medium |

---

## 🛠️ Available Commands

```bash
# Git workflow setup
npm run git:setup-domains          # Create domain branches
npm run git:setup-worktrees        # Setup worktrees for all domains
npm run git:sparse-checkout        # Interactive sparse checkout setup
npm run git:workflow-help          # Show full workflow documentation

# List current worktrees
git worktree list

# Remove a worktree
git worktree remove ../ORCHESTRAI-worktrees/advertising

# Check sparse checkout status
git sparse-checkout list

# Disable sparse checkout
git sparse-checkout disable
```

---

## 🎓 Best Practices

### 1. **Keep Domain Branches Up-to-date**
```bash
# Regularly sync with develop
git checkout domain/advertising-enhanced
git merge develop
git push origin domain/advertising-enhanced
```

### 2. **Use Descriptive Feature Branch Names**
```bash
# Good
feature/advertising/google-ads-quality-score-optimizer
feature/content/wordpress-gutenberg-block-integration

# Bad
feature/fix
feature/update
```

### 3. **Commit Domain-Specific Changes Only**
```bash
# Good - advertising feature touches only advertising
git add orchestrai-domains/advertising-enhanced/

# Bad - advertising feature touches multiple unrelated domains
git add orchestrai-domains/advertising-enhanced/
git add orchestrai-domains/seo/  # Why is advertising touching SEO?
```

### 4. **Test Before Merging**
```bash
# Run domain-specific tests
npm test -- orchestrai-domains/advertising-enhanced

# Run integration tests
npm test
```

---

## 🚨 Troubleshooting

### Worktree already exists error
```bash
# Remove old worktree
git worktree remove ../ORCHESTRAI-worktrees/advertising

# Prune stale worktrees
git worktree prune
```

### Sparse checkout not working
```bash
# Disable and re-enable
git sparse-checkout disable
npm run git:sparse-checkout
```

### Branch conflicts between worktrees
```bash
# Each worktree should use different branch
cd ../ORCHESTRAI-worktrees/advertising
git checkout -b feature/advertising/my-feature-1

cd ../ORCHESTRAI-worktrees/seo
git checkout -b feature/seo/my-feature-2
```

---

## 📚 Further Reading

- [GIT-WORKFLOW.md](.github/GIT-WORKFLOW.md) - Complete branching strategy
- [Git Worktrees Documentation](https://git-scm.com/docs/git-worktree)
- [Git Sparse Checkout Documentation](https://git-scm.com/docs/git-sparse-checkout)

---

## 💬 Need Help?

Refer to the workflow documentation:
```bash
npm run git:workflow-help
```

Or check the setup scripts:
```bash
ls .github/scripts/
```

---

**🎉 Happy Modular Development!**

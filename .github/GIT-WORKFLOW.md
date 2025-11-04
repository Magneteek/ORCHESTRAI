# ORCHESTRAI Git Workflow & Branching Strategy

## Overview

ORCHESTRAI uses a **modular monorepo** approach combining the benefits of a unified codebase with isolated domain development workflows.

## Branch Structure

### Main Branches (Protected)

```
main          # Production-ready code - PROTECTED
develop       # Integration branch for domain work
```

### Domain Development Branches (Long-lived)

Each major domain has its own development branch:

```
domain/advertising-enhanced          # Advertising agents & campaigns
domain/client-intelligence          # Client profiling & ICP
domain/content-enhanced             # Content creation & copywriting
domain/content-strategy             # Outline generation & planning
domain/reputation-intelligence      # Reviews & reputation monitoring
domain/seo                         # SEO analysis & optimization
domain/web-quality                 # Web development & visual QA
```

**Purpose:**
- Isolate domain-specific development
- Allow parallel work on different modules
- Prevent cross-domain conflicts
- Easy to review domain-specific changes

### Feature Branches (Short-lived)

Create from domain branches for specific features:

```
feature/[domain]/[feature-name]
```

**Examples:**
```
feature/advertising/google-ads-integration
feature/content/wordpress-gutenberg-publisher
feature/seo/competitor-gap-analysis
feature/web/shadcn-ui-components
feature/reputation/sentiment-analysis-engine
```

### System-wide Feature Branches

For changes affecting multiple domains or core system:

```
feature/orchestrator/[feature-name]
feature/memory/[feature-name]
feature/shared/[feature-name]
```

**Examples:**
```
feature/orchestrator/harmonic-windowing-v3
feature/memory/crystalline-lattice-optimization
feature/shared/mcp-server-integration
```

### Hotfix Branches

Critical production fixes:

```
hotfix/[domain]/[issue-description]
```

**Examples:**
```
hotfix/advertising/meta-ads-creative-upload-bug
hotfix/content/outline-validation-crash
```

### Bugfix Branches

Non-critical fixes from develop:

```
bugfix/[domain]/[issue-description]
```

## Workflows

### 1. Working on a Single Domain

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create domain branch if not exists
git checkout -b domain/advertising-enhanced

# Create feature branch
git checkout -b feature/advertising/google-ads-quality-score

# Work, commit, push
git add orchestrai-domains/advertising-enhanced/
git commit -m "feat(advertising): Add Quality Score optimization"
git push origin feature/advertising/google-ads-quality-score

# Create PR: feature/advertising/google-ads-quality-score → domain/advertising-enhanced
# After review: domain/advertising-enhanced → develop
```

### 2. Working on Multiple Domains Simultaneously (Git Worktrees)

```bash
# Create worktrees for different domains
git worktree add ../ORCHESTRAI-advertising domain/advertising-enhanced
git worktree add ../ORCHESTRAI-content domain/content-enhanced
git worktree add ../ORCHESTRAI-seo domain/seo

# Work in each directory independently
cd ../ORCHESTRAI-advertising
# Make advertising changes...

cd ../ORCHESTRAI-content
# Make content changes simultaneously...

cd ../ORCHESTRAI-seo
# Make SEO changes at the same time...

# Each worktree commits to its own branch independently
```

### 3. Working on Module-Specific Files Only (Sparse Checkout)

```bash
# Enable sparse checkout
git sparse-checkout init --cone

# Only checkout advertising domain + dependencies
git sparse-checkout set \
  orchestrai-domains/advertising-enhanced \
  orchestrai-shared \
  orchestrai-master \
  package.json \
  CLAUDE.md

# Your workspace now only shows advertising files
# Faster operations, less clutter
```

### 4. System-wide Changes

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create system feature branch
git checkout -b feature/orchestrator/multi-domain-coordination

# Make changes across multiple modules
git add orchestrai-master/ orchestrai-shared/ orchestrai-domains/*/

git commit -m "feat(orchestrator): Add multi-domain task coordination"
git push origin feature/orchestrator/multi-domain-coordination

# Create PR: feature/orchestrator/... → develop
```

## Commit Message Convention

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

**Scopes:**
- `advertising`: Advertising domain
- `content`: Content domain
- `seo`: SEO domain
- `web`: Web quality domain
- `reputation`: Reputation intelligence
- `orchestrator`: Main orchestrator
- `memory`: Crystalline memory system
- `shared`: Shared utilities

**Examples:**
```
feat(advertising): Add LinkedIn Ads campaign automation
fix(content): Resolve outline validation edge case
refactor(seo): Optimize competitor analysis algorithm
perf(memory): Improve crystalline lattice traversal speed
docs(orchestrator): Add harmonic windowing documentation
```

## Merge Strategy

### Domain Branch → Develop
```bash
# Squash merge for clean history
git checkout develop
git merge --squash domain/advertising-enhanced
git commit -m "feat(advertising): Integrate Google Ads Quality Score optimization"
```

### Develop → Main (Release)
```bash
# Regular merge to preserve history
git checkout main
git merge develop --no-ff
git tag -a v2.1.0 -m "Release v2.1.0: Advertising domain enhancements"
git push origin main --tags
```

## Protected Branch Rules

### main
- Require PR approval (2+ reviewers)
- Require status checks to pass
- No force push
- No deletion

### develop
- Require PR approval (1+ reviewer)
- Require status checks to pass
- No force push

### domain/*
- Require PR approval (1+ reviewer)
- CI/CD checks must pass

## Git Worktree Commands Reference

```bash
# List all worktrees
git worktree list

# Add new worktree
git worktree add <path> <branch>

# Remove worktree
git worktree remove <path>

# Prune deleted worktrees
git worktree prune
```

## Sparse Checkout Commands Reference

```bash
# Initialize sparse checkout
git sparse-checkout init --cone

# Set directories to checkout
git sparse-checkout set <dir1> <dir2> <dir3>

# Add more directories
git sparse-checkout add <dir4>

# List current sparse checkout
git sparse-checkout list

# Disable sparse checkout (back to full)
git sparse-checkout disable
```

## Module Independence Testing

Before merging domain branches to develop, ensure:

1. **Domain tests pass**: `npm test -- orchestrai-domains/<domain>`
2. **No cross-domain breaking changes**: Integration tests pass
3. **Documentation updated**: README and domain-specific docs
4. **Memory compatibility**: Crystalline memory schema unchanged (unless versioned)

## Quick Reference

### I want to...

**Work on advertising only:**
```bash
git checkout domain/advertising-enhanced
git checkout -b feature/advertising/my-feature
```

**Work on multiple domains without switching:**
```bash
git worktree add ../ad-work domain/advertising-enhanced
git worktree add ../seo-work domain/seo
```

**Focus on one domain, ignore others:**
```bash
git sparse-checkout set orchestrai-domains/advertising-enhanced orchestrai-shared
```

**Make system-wide change:**
```bash
git checkout develop
git checkout -b feature/orchestrator/my-system-feature
```

**Release new version:**
```bash
git checkout main
git merge develop --no-ff
git tag v2.1.0
```

## Benefits of This Strategy

✅ **Modular Development**: Work on domains independently
✅ **Parallel Workflows**: Multiple developers on different domains
✅ **Clean History**: Domain-specific commits grouped logically
✅ **Easy Reviews**: Domain experts review their area only
✅ **Conflict Reduction**: Domain isolation minimizes merge conflicts
✅ **Flexible Workflows**: Choose monorepo, worktrees, or sparse checkout
✅ **Scalable**: Easy to add new domains or modules

## Migration from Current Setup

Current branches → New structure:

```
orchestration-v2.0 → develop (make this the integration branch)
main → main (keep as production)
feature/seo-agents → feature/seo/agent-implementation
```

**Migration steps:**
1. Rename `orchestration-v2.0` to `develop`
2. Create domain branches from `develop`
3. Update CI/CD to target new branch structure
4. Update team documentation

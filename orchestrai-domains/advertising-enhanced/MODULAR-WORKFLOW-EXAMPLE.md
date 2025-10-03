# Advertising Domain - Modular Workflow Example

## Purpose
This file demonstrates the modular git workflow for the advertising domain.

## Workflow Demonstrated

### 1. Branch Structure
- **Main Branch:** `main` (production)
- **Integration Branch:** `develop` (all domains merge here)
- **Domain Branch:** `domain/advertising-enhanced` (advertising work)
- **Feature Branch:** `feature/advertising/example-modular-workflow` (this branch)

### 2. Workflow Steps

```bash
# Step 1: Start from domain branch
git checkout domain/advertising-enhanced

# Step 2: Create feature branch
git checkout -b feature/advertising/quality-score-optimizer

# Step 3: Work on advertising-specific files only
# Edit files in: orchestrai-domains/advertising-enhanced/

# Step 4: Commit changes
git add orchestrai-domains/advertising-enhanced/
git commit -m "feat(advertising): Add Quality Score optimization"

# Step 5: Push feature branch
git push origin feature/advertising/quality-score-optimizer

# Step 6: Create PR
# PR: feature/advertising/quality-score-optimizer → domain/advertising-enhanced

# Step 7: After review and merge
# domain/advertising-enhanced → develop (integration)

# Step 8: Release
# develop → main (production)
```

### 3. Benefits of This Workflow

✅ **Module Isolation**
- Advertising changes don't affect SEO domain
- Each domain has its own development branch
- Clear separation of concerns

✅ **Clean Reviews**
- PRs only contain advertising-related code
- Domain experts review their area only
- Smaller, focused code reviews

✅ **Parallel Development**
- Multiple developers can work on different domains
- No conflicts between unrelated modules
- Can use worktrees for simultaneous work

✅ **Clear History**
- All advertising commits grouped under domain/advertising-enhanced
- Easy to track module-specific changes
- Better git blame and history analysis

## Example: Working on Multiple Domains

If you need to work on both advertising and SEO:

### Option 1: Sequential (Branch Switching)
```bash
# Work on advertising
git checkout domain/advertising-enhanced
git checkout -b feature/advertising/my-feature
# ... make changes, commit ...

# Switch to SEO
git checkout domain/seo
git checkout -b feature/seo/my-seo-feature
# ... make changes, commit ...
```

### Option 2: Parallel (Git Worktrees)
```bash
# Setup worktrees once
npm run git:setup-worktrees

# Work on advertising in one IDE
cd ../ORCHESTRAI-worktrees/advertising
git checkout -b feature/advertising/my-feature
code .  # Opens VS Code for advertising

# Work on SEO in another IDE (simultaneously!)
cd ../ORCHESTRAI-worktrees/seo
git checkout -b feature/seo/my-seo-feature
code .  # Opens VS Code for SEO
```

## Domain Ownership

| Domain | Owner/Specialist | Focus Area |
|--------|------------------|------------|
| advertising-enhanced | Advertising Team | Google, Meta, LinkedIn, Reddit Ads |
| content-enhanced | Content Team | Copywriting, Article Creation |
| seo | SEO Team | Keyword Research, Optimization |
| web-quality | Frontend Team | Web Development, Visual QA |
| reputation-intelligence | Client Success | Reviews, Sentiment Analysis |
| client-intelligence | Strategy Team | ICP, Psychographics |
| content-strategy | Planning Team | Outlines, Content Architecture |

## Next Steps

1. **Merge this example back to domain branch:**
   ```bash
   git checkout domain/advertising-enhanced
   git merge feature/advertising/example-modular-workflow
   ```

2. **Try creating your own feature:**
   ```bash
   git checkout domain/advertising-enhanced
   git checkout -b feature/advertising/your-feature-name
   ```

3. **Explore worktrees (optional):**
   ```bash
   npm run git:setup-worktrees
   ```

4. **Read full documentation:**
   ```bash
   cat .github/MODULAR-DEVELOPMENT-GUIDE.md
   ```

---

**🎉 You're now using modular development!**

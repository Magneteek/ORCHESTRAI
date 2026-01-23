---
name: git-commit-quality
enabled: true
event: bash
pattern: git\s+commit.*(-m|--message)
action: warn
---

# 📝 Git Commit Quality Check

You're about to commit code. Let's ensure quality!

## ✅ Pre-Commit Checklist

### Code Quality
- [ ] **Tests pass** - Run `npm test` or equivalent
- [ ] **Linting passes** - No ESLint/Prettier errors
- [ ] **TypeScript compiles** - No type errors
- [ ] **Build succeeds** - `npm run build` works

### Security & Secrets
- [ ] **No secrets** - No API keys, passwords, tokens
- [ ] **No .env files** - Environment files not committed
- [ ] **No private keys** - No SSH keys, certificates
- [ ] **Credentials.json excluded** - Check .gitignore

### Code Review
- [ ] **Debug code removed** - No console.log statements
- [ ] **TODO comments** - Addressed or documented
- [ ] **Dead code removed** - No commented-out blocks
- [ ] **Formatting consistent** - Code properly formatted

### Commit Message Quality
- [ ] **Clear description** - What and why explained
- [ ] **Conventional format** - feat/fix/docs/refactor prefix
- [ ] **Issue reference** - Links to issue/ticket if applicable

## 🚫 Don't Commit These

**Secrets & Credentials:**
- API keys, tokens, passwords
- `.env`, `credentials.json`
- Private SSH keys
- Database connection strings

**Debug & Temporary:**
- `console.log` statements
- `debugger` statements
- Commented-out code
- Temporary test files

**Build & Dependencies:**
- `node_modules/`
- Build outputs (`dist/`, `build/`)
- OS files (`.DS_Store`)
- IDE files (`.vscode/`, `.idea/`)

## ✅ Good Commit Message Examples

```bash
# Feature
git commit -m "feat: Add user authentication flow

Implements JWT-based authentication with refresh tokens.
Includes login, logout, and token refresh endpoints.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Bug Fix
git commit -m "fix: Resolve memory leak in data processing

Fixed event listener cleanup in DataProcessor.
Adds proper cleanup in componentWillUnmount.

Closes #123"

# Documentation
git commit -m "docs: Update API documentation for v2 endpoints

Documents new authentication and user management endpoints.
Includes request/response examples."
```

## 🔧 Quick Pre-Commit Commands

```bash
# Run all checks
npm run lint && npm test && npm run build

# Check for secrets
git diff --cached | grep -i "api[_-]key\|password\|secret"

# Review what's being committed
git diff --cached
```

---

**If all checks pass**, proceed with your commit!

**If any issues found**, fix them before committing.

*Quality commits = Quality codebase. Take an extra minute to verify!*

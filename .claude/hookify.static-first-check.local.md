---
name: static-first-check
enabled: true
event: file
pattern: (next\.config|package\.json.*["\']next["\']|app/.*page\.(tsx|jsx)|pages/.*\.(tsx|jsx))
action: warn
---

# ⚠️ Static-First Architecture Check

You're creating **Next.js/React framework** files.

## 🤔 Is This Framework Justified?

Verify framework is actually needed by checking these requirements:

### ✅ Use Next.js/Framework IF:
- **Server-Side Rendering (SSR)** required for SEO
- **User authentication** and protected routes
- **Database integration** (direct queries, ORM)
- **Real-time features** (WebSockets, live updates)
- **Dynamic content** per user (personalization)
- **API routes** in the same codebase

### ❌ Use Static HTML + Tailwind + Libraries IF:
- **Landing pages** (marketing sites)
- **Static content** (no user-specific data)
- **Simple interactions** (forms, animations)
- **Portfolio/showcase** sites
- **Documentation** sites

## 🎨 Static-First Tech Stack

For static sites, use:
- **Structure**: Semantic HTML5
- **Styling**: Tailwind CSS (utility-first)
- **Components**: MagicUI (animations, interactions)
- **Visualization**: D3.js v7 (charts, diagrams)
- **Canvas**: Paper.js (advanced effects)
- **Icons**: Lucide React or Heroicons

**No development server needed** - static HTML opens directly in browsers!

## ⚡ Performance Benefits of Static

- **Faster load times**: No JavaScript framework overhead
- **Better SEO**: Pure HTML, no hydration
- **Lower costs**: Static hosting (Netlify, Vercel free tier)
- **Simpler deployment**: Just HTML/CSS/JS files
- **No backend needed**: Frontend-only architecture

## 🚫 Common Anti-Patterns to Avoid

❌ "Let's use Next.js for this landing page"
❌ "We need a development server for static content"
❌ "I'll set up React for these components"

✅ "This works perfectly with static HTML"
✅ "We can use Tailwind CSS + JavaScript libraries"
✅ "Static files open directly in browsers"

---

**🔍 Before Proceeding:**

1. **Review requirements** - Does this ACTUALLY need SSR/auth/database?
2. **Justify framework choice** - Can static HTML + libraries work?
3. **Document decision** - Why is framework needed?

If framework is truly required, proceed. Otherwise, switch to static-first approach.

*ORCHESTRAI Principle: Choose the simplest solution that meets requirements.*

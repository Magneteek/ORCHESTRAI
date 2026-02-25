# Intelligence Report Commands - Quick Reference

---

## 📊 FULL REPORT SUITE (8 Pages)

### Commands
```bash
/intel-report [client-name or uuid]
/ir [client-name or uuid]              # Short alias
```

### Output
- **8 comprehensive pages** (~700KB total)
- Main hub + 7 detailed pages
- Complete ICP analysis
- Extensive psychographic research (2000+ lines)
- Full SEO strategy with all keywords
- Competitive intelligence
- EOS framework
- Print-ready, fully cross-linked

### Best For
✅ Complete client intelligence package
✅ Deep strategic planning
✅ Comprehensive documentation
✅ Long-term reference material
✅ Investor due diligence
✅ Full team alignment

### Generation Time
~3-5 minutes (8 pages with full data integration)

---

## 📄 MINI DASHBOARD (1 Page)

### Commands
```bash
/mini-report [client-name or uuid]
/mr [client-name or uuid]              # Short alias
```

### Output
- **Single executive dashboard** (~40KB)
- All critical metrics condensed
- Top 5 SEO keywords only
- Summary of all 3 ICP segments
- 30/60/90 day action plan
- Fits on 3-4 printed pages
- No Chart.js dependencies

### Best For
✅ Executive presentations
✅ Board meetings
✅ Quick investor updates
✅ Email attachments (small file)
✅ Print handouts
✅ Mobile viewing

### Generation Time
~1-2 minutes (single page with condensed data)

---

## 🎨 DESIGN CONSISTENCY

Both commands use:
- **Purple gradient**: #667eea → #764ba2
- **Inter font**: Weights 300-800
- **Max width**: 1400px
- **Responsive**: 768px, 1024px, 1440px breakpoints
- **Print-optimized**: Professional print CSS

---

## 📁 FILE LOCATIONS

### Full Report
**STANDARD: All 8 pages in same folder for easy server deployment**
```
/projects/[uuid]/deliverables/client-intelligence/
├── intelligence-report-2025.html          (main hub)
├── icp-basketball-clubs-b2b-2025.html
├── icp-sports-fans-b2c-2025.html
├── icp-content-creators-b2c-2025.html
├── psychographic-research-extensive-2025.html
├── eos-framework-2025.html
├── competitive-intelligence-2025.html
└── seo-strategy-comprehensive-2025.html   (same folder, not /seo/)
```

✅ **All links are relative** - copy folder to any server and links work!

### Mini Report
```
/projects/[uuid]/deliverables/client-intelligence/
└── intelligence-dashboard-mini-2025.html  (single page)
```

---

## 🚀 USAGE EXAMPLES

### Generate Full Suite
```bash
# Using client name
/intel-report scoreornot

# Using project UUID
/ir scoreornot-6656f290-306b-4ddd-8540-e0883bb89c8a

# Short alias
/ir quartziq
```

### Generate Mini Dashboard
```bash
# Using client name
/mini-report scoreornot

# Using project UUID
/mr scoreornot-6656f290-306b-4ddd-8540-e0883bb89c8a

# Short alias
/mr rapidcoldplunge
```

---

## ✅ QUALITY GUARANTEES

### Full Report
- ✅ All 8 pages generated
- ✅ Navigation links verified
- ✅ Chart.js configured correctly (`maintainAspectRatio: true`)
- ✅ Cross-links work bidirectionally
- ✅ Print CSS tested
- ✅ No console errors

### Mini Report
- ✅ Fits on 3-4 printed pages
- ✅ All critical data included
- ✅ No Chart.js dependencies
- ✅ File size < 50KB
- ✅ Print-optimized
- ✅ Mobile-friendly

---

## 🎯 DECISION MATRIX

| Need | Use This Command |
|------|-----------------|
| Complete documentation | `/intel-report` |
| Executive presentation | `/mini-report` |
| Deep strategic planning | `/intel-report` |
| Quick board update | `/mini-report` |
| Long-term reference | `/intel-report` |
| Email attachment | `/mini-report` |
| Team alignment | `/intel-report` |
| Print handout | `/mini-report` |
| Investor due diligence | `/intel-report` |
| Mobile viewing | `/mini-report` |

---

## 🔧 CUSTOMIZATION

### Edit Full Report Template
```
/Users/kris/CLAUDEtools/ORCHESTRAI/.claude/commands/intel-report.md
```

### Edit Mini Report Template
```
/Users/kris/CLAUDEtools/ORCHESTRAI/.claude/commands/mini-report.md
```

### Canonical Design System
```
/Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/client-intelligence/CLIENT-INTELLIGENCE-REPORT-TEMPLATE.md
```

---

## 💡 PRO TIPS

1. **Generate both**: Start with mini report for quick review, then generate full suite for complete documentation

2. **Use full report for**: Strategy sessions, deep dives, long-term planning

3. **Use mini report for**: Updates, presentations, quick decisions

4. **Print optimization**: Both commands include print CSS - test with Command+P before presenting

5. **Data requirements**: Ensure client has:
   - `integrated-client-context.json`
   - `keyword-research-VALIDATED.json`
   - `strategic-coherence-scorecard.json`

---

## 🆘 TROUBLESHOOTING

### Command not found?
- Restart Claude Code or reload window
- Verify files exist in `.claude/commands/`

### Missing data?
- Ensure client intelligence was run first
- Check `/projects/[uuid]/client-intelligence/` exists
- Verify JSON files are present

### Navigation broken?
- Always use `-2025` suffix in filenames
- Check SEO page uses `../client-intelligence/` prefix
- Verify no `.html` typos

### Charts growing?
- Full report: Check `maintainAspectRatio: true`
- Mini report: Should have no charts (visual alternatives only)

---

**Ready to generate professional intelligence reports in seconds! 🚀**

export const meta = {
  name: 'ads-competitive-research',
  description: 'Competitive ad research: Facebook Ads Library scrape + Google keyword plan → creative briefs (~45min)',
  phases: [
    { title: 'Research', detail: 'Facebook Ads Library (Playwright) + Google keyword plan (DataForSEO + SERP) in parallel' },
    { title: 'Briefs', detail: 'Meta creative briefs from competitor findings + ICP + offer' },
  ],
}

// args: {
//   client,          // e.g. "nasmehpg"
//   uuid,            // full project UUID
//   niche,           // e.g. "beljenje zob"
//   country,         // ISO 2-letter: SI, NL, ES, DE
//   language,        // e.g. "Slovenian", "Dutch"
//   seedKeywords,    // array of strings for Google keyword plan
//   offer,           // 1-2 sentence offer summary for brief generator
//   icpPath,         // optional: path to existing ICP file
//   platforms,       // array: ["meta", "google"] — default both
//   generateBriefs,  // boolean — default true
// }

const {
  client,
  uuid,
  niche,
  country,
  language,
  seedKeywords = [],
  offer = '',
  icpPath = null,
  platforms = ['meta', 'google'],
  generateBriefs = true,
} = args

const outputDir = uuid
  ? `projects/${client}-${uuid}/deliverables/advertising/`
  : `temp/campaign-${client}-ads-research/`

const baseContext = `Client: ${client} | UUID: ${uuid || 'none'} | Niche: ${niche} | Country: ${country} | Language: ${language}
Output dir: ${outputDir}
Read /Users/krisbal/CLAUDEtools/ORCHESTRAI/LEARNINGS.md before executing.`

log(`Starting ads competitive research for ${client} — ${niche} (${country})`)
log(`Platforms: ${platforms.join(', ')} | Briefs: ${generateBriefs}`)

// ─── Phase 1: Research ──────────────────────────────────────────────────────
// Facebook Ads Library + Google keyword plan in parallel

phase('Research')

const researchTasks = []

if (platforms.includes('meta') || platforms.includes('facebook')) {
  researchTasks.push(() => agent(
    `ORCHESTRAI pipeline worker — ads-competitive-research / Phase 1 / Competitor Creative Analysis.
${baseContext}
Your task: Call Skill(skill='advertising', args='competitor-creative-analyst') with these inputs:
- Niche / keyword: "${niche}"
- Country: ${country}
- Language: ${language}
- Search the Facebook Ads Library for: "${niche}" in country: ${country}
- GLOBAL FALLBACK (mandatory): If the ${country} search returns fewer than 5 relevant ads, ALSO search globally:
  1. Remove the country filter (use country=ALL if available, otherwise try DE, AT, NL, GB in sequence)
  2. Also search in English: translate "${niche}" to English and search that term globally
  3. Note clearly in the output which ads came from ${country} vs global fallback
  4. The global data is used to identify creative patterns that work in the category worldwide — even if local competition is thin
- Also scrape Google SERP sponsored results for the same keyword in ${country}
- Save output to ${outputDir}
- Return only the full path of the output file created — nothing else.`,
    { label: 'facebook-ads-library', phase: 'Research' }
  ))
}

if (platforms.includes('google')) {
  const keywordList = seedKeywords.length > 0
    ? seedKeywords.join(', ')
    : niche

  researchTasks.push(() => agent(
    `ORCHESTRAI pipeline worker — ads-competitive-research / Phase 1 / Google Ads Keyword Plan.
${baseContext}
Your task: Call Skill(skill='advertising', args='google-ads-keyword-planner') with these inputs:
- Seed keywords: ${keywordList}
- Country: ${country} | Language: ${language}
- Campaign objective: Lead generation
- Use DataForSEO keyword_suggestions (NOT keyword_overview) for ${country} market — confirmed more accurate for small EU markets
- Scrape Google SERP sponsored results for the top 5-10 keywords
- Save output to ${outputDir}
- Return only the full path of the output file created — nothing else.`,
    { label: 'google-keyword-plan', phase: 'Research' }
  ))
}

const researchResults = await parallel(researchTasks)

const competitorCreativeFile = platforms.includes('meta') || platforms.includes('facebook')
  ? researchResults[0]
  : null
const googleKeywordFile = platforms.includes('google')
  ? researchResults[platforms.includes('meta') || platforms.includes('facebook') ? 1 : 0]
  : null

log(`Research: competitor-creative=${competitorCreativeFile ? 'ok' : 'FAILED'} google-keywords=${googleKeywordFile ? 'ok' : platforms.includes('google') ? 'FAILED' : 'skipped'}`)

if (!competitorCreativeFile && !googleKeywordFile) {
  log('HALTED — both research phases failed')
  return { status: 'failed', phase: 'Research', outputs: {} }
}

// ─── Phase 2: Briefs ─────────────────────────────────────────────────────────
// Generate Meta creative briefs if requested and Meta competitor data exists

if (!generateBriefs || !competitorCreativeFile) {
  log(`Briefs skipped — generateBriefs=${generateBriefs}, competitorCreativeFile=${competitorCreativeFile || 'not available'}`)
  return {
    status: 'completed',
    client,
    niche,
    outputDir,
    outputs: { competitorCreativeFile, googleKeywordFile, creativeBriefs: null },
  }
}

phase('Briefs')

const icpContext = icpPath
  ? `ICP file: ${icpPath}`
  : `No ICP file provided — infer audience from competitor creative findings and niche context`

const creativeBriefs = await agent(
  `ORCHESTRAI pipeline worker — ads-competitive-research / Phase 2 / Meta Creative Briefs.
${baseContext}
Your task: Call Skill(skill='advertising', args='meta-creative-brief-generator') with these inputs:
- Competitor creative analysis file: ${competitorCreativeFile}
- ${icpContext}
- Offer: ${offer || `Professional ${niche} service — read competitor file for market context`}
- Country/language: ${country} / ${language}
- Generate briefs for all 4 formats: single image, carousel, story/reel, 30-60s video
- IMPORTANT: Read the competitor creative file before writing any brief — briefs must occupy whitespace, not mirror what competitors are already running
- Save output to ${outputDir}
- Return only the full path of the output file created — nothing else.`,
  { label: 'meta-creative-briefs', phase: 'Briefs' }
)

log(`Pipeline complete — briefs: ${creativeBriefs || 'FAILED'}`)

return {
  status: creativeBriefs ? 'completed' : 'partial',
  client,
  niche,
  outputDir,
  outputs: {
    competitorCreativeFile,
    googleKeywordFile,
    creativeBriefs,
  },
}

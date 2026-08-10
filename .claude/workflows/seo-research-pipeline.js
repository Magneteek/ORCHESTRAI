export const meta = {
  name: 'seo-research-pipeline',
  description: 'Full SEO research pipeline: discovery → mapping → strategy (~120min)',
  phases: [
    { title: 'Discovery', detail: 'Keyword research + competitor analysis + technical audit in parallel' },
    { title: 'Mapping', detail: 'Intent mapping + topical authority in parallel' },
    { title: 'Strategy', detail: 'SEO strategy synthesis from all research' },
  ],
}

// args: { client, uuid, domain }
// Example: Workflow({ scriptPath: '.claude/workflows/seo-research-pipeline.js', args: { client: 'nasmehpg', uuid: 'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e', domain: 'nasmeh.si' } })

const { client, uuid, domain } = args
const outputDir = `projects/${client}-${uuid}/deliverables/seo/`

const baseContext = `Client: ${client} | Domain: ${domain} | UUID: ${uuid} | Output dir: ${outputDir}
Read /Users/krisbal/CLAUDEtools/ORCHESTRAI/LEARNINGS.md before executing.`

log(`Starting SEO research pipeline for ${client} (${domain})`)

// ─── Phase 1: Discovery ──────────────────────────────────────────────────────
// 3 parallel agents — kw-research and competitor-analysis are blocking

phase('Discovery')

const [kwResearch, competitorAnalysis, technicalAnalysis] = await parallel([
  () => agent(
    `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 1 / Keyword Research.
${baseContext}
Your task: Call Skill(skill='seo', args='seo-keyword-research') with the client context above.
Save your output file to ${outputDir}.
Return only the full path of the output file created — nothing else.`,
    { label: 'keyword-research', phase: 'Discovery' }
  ),
  () => agent(
    `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 1 / Competitor Analysis.
${baseContext}
Your task: Call Skill(skill='seo', args='seo-competitor-analysis') with the client context above.
Save your output file to ${outputDir}.
Return only the full path of the output file created — nothing else.`,
    { label: 'competitor-analysis', phase: 'Discovery' }
  ),
  () => agent(
    `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 1 / Technical Analysis.
${baseContext}
Your task: Call Skill(skill='seo', args='seo-technical-analysis') with the client context above.
Save your output file to ${outputDir}.
Return only the full path of the output file created — nothing else.`,
    { label: 'technical-analysis', phase: 'Discovery' }
  ),
])

log(`Discovery: keyword=${kwResearch ? 'ok' : 'FAILED'} competitor=${competitorAnalysis ? 'ok' : 'FAILED'} technical=${technicalAnalysis ? 'ok' : 'skipped'}`)

// Both keyword-research and competitor-analysis are blocking
if (!kwResearch || !competitorAnalysis) {
  const failed = [!kwResearch && 'keyword-research', !competitorAnalysis && 'competitor-analysis'].filter(Boolean).join(', ')
  log(`HALTED at Discovery — blocking skills failed: ${failed}`)
  return { status: 'failed', phase: 'Discovery', failed, outputs: { kwResearch, competitorAnalysis, technicalAnalysis } }
}

// ─── Phase 2: Mapping ────────────────────────────────────────────────────────
// 2 parallel agents — intent-mapping is blocking

phase('Mapping')

const phase1Summary = `Phase 1 outputs:
- Keyword research: ${kwResearch}
- Competitor analysis: ${competitorAnalysis}
- Technical analysis: ${technicalAnalysis || 'not completed'}`

const [intentMapping, topicalAuthority] = await parallel([
  () => agent(
    `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 2 / Intent Mapping.
${baseContext}
${phase1Summary}
Your task: Call Skill(skill='seo', args='seo-intent-mapping') with the client context and Phase 1 file paths above.
Save your output file to ${outputDir}.
Return only the full path of the output file created — nothing else.`,
    { label: 'intent-mapping', phase: 'Mapping' }
  ),
  () => agent(
    `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 2 / Topical Authority.
${baseContext}
${phase1Summary}
Your task: Call Skill(skill='seo', args='seo-topical-authority') with the client context and Phase 1 file paths above.
Save your output file to ${outputDir}.
Return only the full path of the output file created — nothing else.`,
    { label: 'topical-authority', phase: 'Mapping' }
  ),
])

log(`Mapping: intent=${intentMapping ? 'ok' : 'FAILED'} topical=${topicalAuthority ? 'ok' : 'skipped'}`)

if (!intentMapping) {
  log(`HALTED at Mapping — blocking skill failed: intent-mapping`)
  return { status: 'failed', phase: 'Mapping', failed: 'intent-mapping', outputs: { kwResearch, competitorAnalysis, technicalAnalysis, intentMapping, topicalAuthority } }
}

// ─── Phase 3: Strategy ───────────────────────────────────────────────────────
// Single agent synthesising all phases

phase('Strategy')

const allOutputsSummary = `${phase1Summary}

Phase 2 outputs:
- Intent mapping: ${intentMapping}
- Topical authority: ${topicalAuthority || 'not completed'}`

const strategy = await agent(
  `ORCHESTRAI pipeline worker — seo-research-pipeline / Phase 3 / Strategy Synthesis.
${baseContext}
${allOutputsSummary}
Your task: Call Skill(skill='commands:seo-strategy') with the client context and all Phase 1-2 output file paths above.
Save the final strategy document to ${outputDir}.
Return only the full path of the strategy file created — nothing else.`,
  { label: 'seo-strategy', phase: 'Strategy' }
)

log(`Pipeline complete — strategy: ${strategy || 'FAILED'}`)

return {
  status: strategy ? 'completed' : 'partial',
  client,
  domain,
  outputDir,
  outputs: {
    discovery: { kwResearch, competitorAnalysis, technicalAnalysis },
    mapping: { intentMapping, topicalAuthority },
    strategy,
  },
}

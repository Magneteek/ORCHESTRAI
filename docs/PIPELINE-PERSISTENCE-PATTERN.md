# Pipeline Persistence Pattern

**All ORCHESTRAI pipelines must follow this pattern.** Every phase saves its output to disk before passing control to the next phase. Data flows via file paths, not text blobs.

---

## Why This Exists

Without persistence:
- A session crash at Phase 4 of 6 loses all research and forces a full re-run
- DataForSEO calls get repeated unnecessarily
- Pipelines cannot be resumed, audited, or compared across runs
- The client cannot see intermediate work

With persistence:
- Any phase can be resumed from the last checkpoint
- Research data is stored once, referenced many times
- Pipeline runs are auditable (what ran, when, what it found)
- Intermediate deliverables (briefs, outlines) are accessible to clients and collaborators

---

## File Path Convention

```
/projects/[client-uuid]/pipeline-runs/
└── [pipeline-name]/
    └── [slug]-[YYYY-MM-DD]/          ← one directory per pipeline run
        ├── manifest.json              ← run metadata + phase status (always updated last)
        ├── phase-[N]-[name].md        ← one file per completed phase
        └── ...

/projects/[client-uuid]/deliverables/
└── [domain]/                          ← final outputs only (promoted from pipeline-run at completion)
    ├── content/
    ├── seo/
    └── ...
```

**Slug rules:**
- Content pipeline: `[keyword-slug]` — e.g. `zobni-vsadki`
- SEO pipeline: `[domain-slug]` — e.g. `nasmehpg-si`
- Use hyphens only, lowercase, no special characters

**Fallback (no client_uuid):**
```
/temp/pipeline-runs/[pipeline-name]/[slug]-[YYYY-MM-DD]/
```

---

## Manifest Schema

Every run directory contains a `manifest.json`. Update it after every phase completes.

```json
{
  "pipeline": "[pipeline-name]",
  "run_id": "[pipeline-name]-[slug]-[YYYY-MM-DD]",
  "client_uuid": "[uuid or null]",
  "slug": "[keyword-slug or domain-slug]",
  "inputs": {
    "keyword": "[target keyword]",
    "market": "[country / language]",
    "niche": "[client niche]"
  },
  "started_at": "[ISO 8601 datetime]",
  "last_updated": "[ISO 8601 datetime]",
  "status": "in_progress | completed | failed | partial",
  "phases": {
    "[phase-id]": {
      "status": "completed | in_progress | pending | skipped | failed",
      "started_at": "[datetime or null]",
      "completed_at": "[datetime or null]",
      "file": "[filename.md or null]",
      "summary": "[1-sentence summary of what was found/produced]",
      "verdict": "[optional — for gate phases: PASS / CONDITIONAL PASS / BLOCK]"
    }
  },
  "deliverable": "[filename.md or null]",
  "deliverable_path": "[full path or null]"
}
```

---

## The Checkpoint Protocol

After every phase, the pipeline must:

1. **Write the phase output** to `[run_dir]/phase-[N]-[name].md`
2. **Read `manifest.json`** (or create if first phase)
3. **Update the phase entry** — status → `completed`, file → filename, summary → one sentence
4. **Write `manifest.json`** back

The manifest is the source of truth. If it says a phase is `completed` and its file exists, that phase does not need to re-run.

---

## Resume Logic

At the start of every pipeline:

```
1. Determine run_dir from inputs (client_uuid + slug + date)
2. Check if [run_dir]/manifest.json exists
3. If YES:
   a. Read manifest
   b. Display phase status table (completed / in_progress / pending)
   c. Ask: "Resume from [last completed phase]?" or "Start fresh?"
   d. If RESUME: load completed phase outputs from their files, skip re-running them
   e. If FRESH: create a new run_dir with today's date (do not overwrite the previous run)
4. If NO:
   a. Create run_dir
   b. Create initial manifest.json with all phases status: "pending"
   c. Proceed with Phase 0
```

---

## Passing Data Between Phases

**Pass file paths, not text blobs.**

```
# Correct
Pass to Phase 1: brief_path = "[run_dir]/phase-4-brief.md"
Phase 1 reads the brief via: Read(brief_path)

# Wrong
Pass to Phase 1: [paste 2000 words of brief text into the prompt]
```

This keeps prompts lean, prevents context bloat, and makes it clear what the authoritative source is.

---

## Final Deliverable Promotion

When the pipeline completes successfully:

1. Copy or move the final output file to `/projects/[client-uuid]/deliverables/[domain]/[type]/[filename].md`
2. Update manifest: `"status": "completed"`, `"deliverable_path": "[path]"`
3. The pipeline-run directory is kept as the audit trail — do not delete it

---

## Which Pipelines Must Follow This Pattern

| Pipeline | Status |
|----------|--------|
| `content-production-pipeline` | ✅ Implemented |
| `seo-research-pipeline` | ✅ Implemented |
| `content-brief-generator` | ✅ Implemented (saves own phases) |
| `multilanguage-content-pipeline` | ⏳ Pending |
| `local-seo-pipeline` | ⏳ Pending |
| `advertising-pipeline` | ⏳ Pending |
| `client-report-pipeline` | ⏳ Pending |

---

## Adding Persistence to a New Pipeline

1. Add `client_uuid` to required inputs (with `/temp/` fallback)
2. Add a **CRITICAL: Manifest-First Protocol** block at the top of the agent prompt — before any phase instructions. This block must instruct the agent to read manifest.json before doing anything else, and to check each phase status before running it.
3. Add "Pipeline Setup" as the first step — creates run_dir + manifest, handles resume logic
4. Add a **Manifest check** line at the top of every phase: "If manifest shows this phase as `completed` → load checkpoint file via `Read()`, skip phase, proceed to next."
5. After every phase: write output file + update manifest
6. Pass file paths to downstream phases (never text blobs)
7. At completion: promote deliverable, update manifest status
8. Update the table above to ✅ Implemented

## Manifest-First Protocol Template

Copy this block verbatim to the top of every new pipeline agent prompt (after the intro paragraph):

```
## CRITICAL: Manifest-First Protocol

Before executing ANY phase, you MUST:

1. Determine `run_dir` (from inputs — see Pipeline Setup below)
2. Check if `[run_dir]/manifest.json` exists
3. If it exists: `Read([run_dir]/manifest.json)` and store all phase statuses
4. At the start of each phase, check the manifest entry for that phase:
   - If status is `"completed"` AND the checkpoint file exists → **skip the phase**, load the output from the checkpoint file via `Read([run_dir]/[file])`, proceed to the next phase
   - If status is `"in_progress"`, `"pending"`, or the file is missing → run the phase normally

Never re-run a completed phase. The checkpoint files are authoritative.
```

And at the start of every phase in the prompt:

```
**Manifest check:** If `[phase-id]` is `completed` → load `Read([run_dir]/[checkpoint-file])` as [DATA_VAR], skip this phase, proceed to [next phase name].
```

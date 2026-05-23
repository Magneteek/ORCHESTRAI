# Autonomous Trigger System

**Status**: Planned — not built yet
**Estimated effort**: 1 focused day for first trigger working end-to-end
**Goal**: Replace human-initiated Claude Code sessions with event-driven automation

---

## The Problem

ORCHESTRAI only works when you open Claude Code and type something. You are the trigger.

This means:
- New client at 11pm → you process it the next morning
- Weekly SEO monitoring → only runs if you remember
- Content published → QA only if you manually kick it off

---

## The Solution: Always-On Droplet

A Digital Ocean droplet running 24/7 that receives external events and runs ORCHESTRAI pipelines in response.

```
External event (form, CRM, webhook)
    ↓
Droplet webhook server (Node.js, always on)
    ↓
Claude Code CLI (non-interactive mode)
    ↓
ORCHESTRAI pipeline runs autonomously
    ↓
Outputs → Notion + GitHub
    ↓
Slack/email notification to you
```

---

## What Lives on the Droplet

```
/home/orchestrai/
├── ORCHESTRAI/           ← git clone, kept in sync with main
├── .env                  ← all API keys (Anthropic, DataForSEO, Notion, etc.)
├── webhook-server/       ← the trigger receiver (~60 lines Node.js)
└── logs/                 ← pipeline run logs
```

**Software needed**:
- Ubuntu 22.04 LTS
- Node.js 20+
- Claude Code CLI (`npm install -g @anthropic-ai/claude-code`)
- PM2 (process manager — keeps webhook server alive forever)
- Nginx + Let's Encrypt (HTTPS endpoint)

**Droplet size**: 2GB RAM, 1 vCPU is enough to start. Pipelines are API-bound, not CPU-bound.

---

## How Claude Code CLI Works in This Context

Claude Code has a non-interactive mode for scripted use:

```bash
claude -p "Run init-client-project for Kriznar Dental, domain kriznar.si, 
run full intelligence gathering pipeline and write all outputs to Notion" \
--cwd /home/orchestrai/ORCHESTRAI
```

This starts a full Claude Code session, executes the prompt against the full ORCHESTRAI stack (all skills, all MCPs, all agents), and exits when done. PM2 manages the process lifecycle.

---

## Webhook Server Logic (Conceptual)

```javascript
app.post('/webhook/:event', verifySecret, async (req, res) => {
  const { event } = req.params;
  const data = req.body;

  // Map event → Claude Code prompt
  const prompt = buildPrompt(event, data);

  // Run Claude Code non-interactively
  exec(`claude -p "${prompt}" --cwd /home/orchestrai/ORCHESTRAI`, (err, stdout) => {
    notify(stdout); // Slack/email
  });

  res.json({ status: 'triggered' });
});
```

Security: shared secret in `x-webhook-secret` header, HTTPS only.

---

## Trigger Map (To Be Built)

| Event | Source | Pipeline | Output destination |
|-------|--------|----------|-------------------|
| New client onboarding | Typeform / CRM | `init-client-project` + intelligence gathering | Notion + `/projects/` |
| Weekly Monday 7am | Cron | SEO monitoring all active clients | Notion report |
| WordPress post published | WP webhook | Content QA run | Notion comment |
| Monthly 1st | Cron | Client progress reports | Notion |
| New lead form | Website | Mini intelligence brief | Notion |

Note: Time-based triggers (cron) can use the existing `/schedule` skill in Claude Code today — no droplet needed. Droplet is only needed for event-based (webhook) triggers.

---

## Output Strategy

Files written on the droplet stay on the droplet. Solutions:

**Notion (preferred for deliverables)**
- ORCHESTRAI already has Notion MCP
- Skills write documents directly to Notion
- Accessible from any device, shareable with clients
- No file syncing needed

**GitHub (for project files)**
- Droplet runs `git commit && git push` after pipeline completes
- Local machine pulls changes
- `/projects/` structure stays in sync

---

## Build Sequence (When Ready)

1. **Provision droplet** — Ubuntu 22.04, install Node + Claude Code CLI, clone ORCHESTRAI repo, configure all API keys and MCP servers (~2-3h)
2. **Build webhook server** — Node.js Express app, secret validation, event-to-prompt router, PM2 setup (~2-4h)
3. **Nginx + HTTPS** — reverse proxy + Let's Encrypt cert (~1-2h)
4. **Notion output wiring** — verify all key skills write to Notion correctly (~2-4h)
5. **Wire first trigger** — Typeform new client → init-client-project pipeline (~1h)
6. **Wire time-based triggers** — use `/schedule` skill or cron on droplet for weekly/monthly runs

**Total**: ~1 focused day for first working trigger. Additional triggers are 30-60min each after that.

---

## What We Already Have

- `/schedule` skill — time-based triggers work today, no build needed
- Notion MCP — output destination ready
- `pipeline-conductor` agent — stateful pipeline execution with checkpointing
- All ORCHESTRAI skills and agents — the pipelines themselves are ready

**The only missing piece is the droplet + webhook server.**

---

## References

- Claude Code CLI docs: non-interactive mode (`claude -p`)
- PM2: https://pm2.keymetrics.io
- Digital Ocean: Ubuntu 22.04 droplet, $12/mo (2GB RAM)
- Nginx + Certbot for HTTPS

# Dual Semantic Intelligence Services - Complete Guide

**Status**: ✅ Configured and Ready
**Date**: 2025-11-28

---

## Overview

ORCHESTRAI uses **two complementary semantic intelligence services** that work in synergy:

1. **ORCHESTRAI ML Service** (port 8000) - The "Brain"
2. **VAIBE-SEMANTIC** (port 8001) - The "Analyst"

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│           ORCHESTRAI Node.js Core (port 5501)              │
│                                                            │
│  Coordinates agents and manages workflows                 │
└─────────┬──────────────────────────────────┬──────────────┘
          │                                  │
          │ "Which agent?"                   │ "What does
          │ "How long?"                      │  this mean?"
          │                                  │
          ▼                                  ▼
┌─────────────────────────┐    ┌───────────────────────────┐
│ ORCHESTRAI ML Service   │    │  VAIBE-SEMANTIC          │
│ Port 8000               │    │  Port 8001               │
├─────────────────────────┤    ├───────────────────────────┤
│ Technology:             │    │ Technology:              │
│ • FastAPI              │    │ • Flask                  │
│ • RandomForest         │    │ • spaCy 3.7.2           │
│ • XGBoost              │    │ • BERT/Transformers     │
│                        │    │ • Gensim (LSA/LDA)      │
├─────────────────────────┤    ├───────────────────────────┤
│ Purpose:               │    │ Purpose:                 │
│ • Agent selection      │    │ • Entity extraction     │
│ • Performance predict  │    │ • Topic modeling        │
│ • Duration estimate    │    │ • Intent classification │
│ • Quality forecast     │    │ • Gap detection         │
└─────────────────────────┘    └───────────────────────────┘
```

---

## Service Comparison

| Aspect | ORCHESTRAI ML | VAIBE-SEMANTIC |
|--------|--------------|----------------|
| **Port** | 8000 | 8001 |
| **Framework** | FastAPI | Flask |
| **ML Stack** | RandomForest, XGBoost | spaCy, BERT, Gensim |
| **Purpose** | Decision-making | Analysis |
| **Question** | "Which agent?" | "What does it mean?" |
| **Status** | Framework ready | Production-ready |

---

## ORCHESTRAI ML Service (Port 8000)

### Purpose
Predicts **which agent** to use for a task and estimates **performance** and **duration**.

### Endpoints

#### 1. Health Check
```bash
GET http://localhost:8000/health

Response:
{
  "status": "healthy",
  "service": "orchestrai-ml-service",
  "version": "1.0.0",
  "environment": "development"
}
```

#### 2. Agent Selection
```bash
POST http://localhost:8000/api/v1/agent-selection

Request:
{
  "task": "Create ICP analysis for QuartzIQ",
  "domain": "client-intelligence",
  "complexity": "high",
  "required_capabilities": ["semantic-analysis", "psychographics"]
}

Response:
{
  "agent_id": "semantic-psychographic-analyst",
  "confidence": 0.92,
  "predicted_performance": 0.88,
  "estimated_duration_ms": 45000,
  "reasoning": [
    "High confidence (92%)",
    "Specialized in semantic + psychographic analysis",
    "Expected high performance (88%)"
  ],
  "alternatives": [
    {"agent_id": "client-icp-analyst", "confidence": 0.78}
  ]
}
```

### ML Models

1. **RandomForest Classifier** (200 trees)
   - Predicts best agent for task
   - Outputs confidence scores

2. **XGBoost Regressor** (Performance)
   - Predicts expected performance (0-1)

3. **XGBoost Regressor** (Duration)
   - Estimates task duration in milliseconds

### Feature Engineering

Extracts **23 features** from task context:
- Task characteristics (4)
- Capability matching (6)
- Temporal patterns (4)
- Context indicators (3)
- Workload estimation (2)
- Language features (2)
- Quality requirements (2)

---

## VAIBE-SEMANTIC (Port 8001)

### Purpose
Provides **deep NLP analysis** including entity extraction, topic modeling, and semantic understanding.

### Endpoints

#### 1. Health Check
```bash
GET http://localhost:8001/health

Response:
{
  "status": "healthy",
  "service": "VAIBE-SEMANTIC",
  "version": "1.0.0",
  "tools_initialized": true
}
```

#### 2. Entity Extraction
```bash
POST http://localhost:8001/api/analyze/entities

Request:
{
  "text": "QuartzIQ helps construction contractors manage projects efficiently",
  "entity_types": ["ORG", "PRODUCT", "CONCEPT"]
}

Response:
{
  "entities": [
    {"text": "QuartzIQ", "label": "ORG", "confidence": 0.95},
    {"text": "construction", "label": "INDUSTRY", "confidence": 0.88},
    {"text": "contractors", "label": "PERSON", "confidence": 0.82},
    {"text": "project management", "label": "CONCEPT", "confidence": 0.91}
  ],
  "sentiment": {
    "polarity": 0.3,
    "subjectivity": 0.5
  }
}
```

#### 3. Topic Modeling
```bash
POST http://localhost:8001/api/analyze/topics

Request:
{
  "documents": [
    "Fear of dental procedures causes anxiety",
    "Cost of implants is a major concern",
    "Want expert guidance for treatment"
  ],
  "num_topics": 3,
  "method": "lsa"
}

Response:
{
  "topics": [
    {
      "id": 0,
      "keywords": ["dental", "procedures", "anxiety", "fear"],
      "coherence": 0.67
    },
    {
      "id": 1,
      "keywords": ["cost", "implants", "concern", "financial"],
      "coherence": 0.72
    },
    {
      "id": 2,
      "keywords": ["expert", "guidance", "treatment", "professional"],
      "coherence": 0.69
    }
  ]
}
```

#### 4. Intent Classification
```bash
POST http://localhost:8001/api/analyze/intent

Request:
{
  "query": "How safe are dental implants?",
  "context": {}
}

Response:
{
  "intent": "informational",
  "confidence": 0.87,
  "sub_intent": "how-to",
  "user_journey_stage": "research"
}
```

#### 5. Content Gap Detection
```bash
POST http://localhost:8001/api/analyze/gaps

Request:
{
  "my_content": "Our dental practice offers implants...",
  "competitor_content": "Competitor's comprehensive implant guide...",
  "gap_types": ["topics", "entities", "depth"]
}

Response:
{
  "topic_gaps": [
    "pain management",
    "recovery timeline",
    "insurance coverage"
  ],
  "entity_gaps": [
    "FDA approval",
    "titanium materials",
    "success rates"
  ],
  "depth_gaps": {
    "competitor_depth": "advanced",
    "your_depth": "intermediate",
    "gap_score": 0.42
  },
  "recommendations": [
    "Add section on pain management",
    "Include success rate statistics",
    "Detail recovery timeline"
  ]
}
```

#### 6. Dashboard Metrics
```bash
GET http://localhost:8001/api/dashboard/metrics?topic=semantic+SEO

Response:
{
  "topic": "semantic SEO",
  "metrics": {
    "entity_density": 0.23,
    "topic_coherence": 0.71,
    "semantic_richness": 0.85
  }
}
```

#### 7. Service Status
```bash
GET http://localhost:8001/api/status

Response:
{
  "service": "VAIBE-SEMANTIC",
  "status": "operational",
  "tools": {
    "orchestrator": true,
    "entity_extractor": true,
    "keyword_clusterer": true,
    "intent_classifier": true,
    "gap_detector": true
  },
  "cache_size": 42,
  "version": "1.0.0"
}
```

### NLP Stack

- **spaCy 3.7.2**: Entity recognition, POS tagging
- **BERT/Transformers**: Semantic embeddings
- **Gensim**: Topic modeling (LSA, LDA, NMF)
- **sentence-transformers**: Semantic similarity

---

## How They Work Together (Synergy)

### Example Workflow: Psychographic ICP Analysis

**User Request**: "Create semantic ICP analysis for deletereviews.nl"

#### Step 1: ORCHESTRAI ML Selects Agent
```bash
POST http://localhost:8000/api/v1/agent-selection
{
  "task": "psychographic analysis",
  "domain": "client-intelligence",
  "complexity": "high"
}

→ ML predicts: "semantic-psychographic-analyst" (92% confidence)
```

#### Step 2: Agent Uses VAIBE-SEMANTIC for Analysis
```bash
# Entity extraction
POST http://localhost:8001/api/analyze/entities
{
  "text": "Businesses struggling with negative Google reviews..."
}
→ Entities: ["Google reviews", "businesses", "reputation"]

# Topic modeling
POST http://localhost:8001/api/analyze/topics
{
  "documents": [pain points, motivations, content samples]
}
→ Topics: ["reputation management", "legal compliance"]

# Intent classification
POST http://localhost:8001/api/analyze/intent
{
  "query": "remove negative reviews"
}
→ Intent: "transactional" (crisis management)
```

#### Step 3: Agent Synthesizes Results
```json
{
  "client": "deletereviews.nl",
  "icp_segments": [
    {
      "name": "Reputation-Damaged SMB",
      "percentage": 45,
      "psychographics": {
        "painPoints": ["Negative reviews harming business"],
        "motivations": ["Restore reputation quickly"]
      },
      "semanticProfile": {
        "entities": ["Google reviews", "reputation damage"],
        "topics": ["reputation management", "legal compliance"],
        "emotionalClusters": {
          "anxiety": 0.82,
          "urgency": 0.91,
          "trust-seeking": 0.76
        },
        "searchIntent": "transactional-crisis"
      }
    }
  ]
}
```

---

## Quick Start

### Start Both Services
```bash
# From ORCHESTRAI root
./scripts/start-semantic-services.sh
```

**Expected output**:
```
🧠 Starting ORCHESTRAI Semantic Intelligence Services
==========================================
✅ Port 8000 available (ORCHESTRAI ML Service)
✅ Port 8001 available (VAIBE-SEMANTIC)
✅ ORCHESTRAI ML Service started (PID: 12345)
✅ VAIBE-SEMANTIC started (PID: 12346)
✅ Semantic Intelligence Services Ready!
```

### Stop Both Services
```bash
./scripts/stop-semantic-services.sh
```

### Test Services
```bash
# Test ORCHESTRAI ML
curl http://localhost:8000/health

# Test VAIBE-SEMANTIC
curl http://localhost:8001/health

# Test integration
curl http://localhost:8000/docs  # ML Service API docs
```

---

## NPM Commands (Optional)

Add to `package.json`:
```json
{
  "scripts": {
    "semantic:start": "./scripts/start-semantic-services.sh",
    "semantic:stop": "./scripts/stop-semantic-services.sh",
    "semantic:ml": "cd orchestrai-ml-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000",
    "semantic:vaibe": "cd ../VAIBE-SEMANTIC && python semantic_api_server.py"
  }
}
```

Usage:
```bash
npm run semantic:start  # Start both services
npm run semantic:stop   # Stop both services
```

---

## Integration with ORCHESTRAI Agents

### Creating a Semantic-Enhanced Agent

```javascript
// orchestrai-domains/client-intelligence/lib/semantic-client.js

const axios = require('axios');

class SemanticClient {
  constructor() {
    this.mlServiceURL = 'http://localhost:8000';
    this.vaibeSemanticURL = 'http://localhost:8001';
  }

  // Ask ML Service which agent to use
  async selectAgent(task) {
    const response = await axios.post(
      `${this.mlServiceURL}/api/v1/agent-selection`,
      {
        task: task.description,
        domain: task.domain,
        complexity: task.complexity
      }
    );
    return response.data;
  }

  // Use VAIBE-SEMANTIC for analysis
  async extractEntities(text) {
    const response = await axios.post(
      `${this.vaibeSemanticURL}/api/analyze/entities`,
      { text }
    );
    return response.data;
  }

  async modelTopics(documents, numTopics = 5) {
    const response = await axios.post(
      `${this.vaibeSemanticURL}/api/analyze/topics`,
      { documents, num_topics: numTopics }
    );
    return response.data;
  }

  async classifyIntent(query) {
    const response = await axios.post(
      `${this.vaibeSemanticURL}/api/analyze/intent`,
      { query }
    );
    return response.data;
  }
}

module.exports = SemanticClient;
```

### Using in Agents

```javascript
// Example: semantic-psychographic-analyst agent usage

const SemanticClient = require('./semantic-client');
const semanticClient = new SemanticClient();

async function analyzeClient(clientData) {
  // 1. Ask ML Service which agent is best
  const agentSelection = await semanticClient.selectAgent({
    description: "psychographic analysis",
    domain: "client-intelligence",
    complexity: "high"
  });
  console.log(`Using agent: ${agentSelection.agent_id} (${agentSelection.confidence})`);

  // 2. Use VAIBE-SEMANTIC for deep analysis
  const entities = await semanticClient.extractEntities(
    clientData.painPoints.join('. ')
  );

  const topics = await semanticClient.modelTopics(
    [...clientData.painPoints, ...clientData.motivations]
  );

  const intentPatterns = await Promise.all(
    clientData.painPoints.map(pain =>
      semanticClient.classifyIntent(pain)
    )
  );

  // 3. Synthesize
  return {
    client: clientData.name,
    semanticProfile: {
      entities: entities.entities,
      topics: topics.topics,
      intentPatterns: intentPatterns
    }
  };
}
```

---

## Monitoring & Logs

### View Logs
```bash
# ORCHESTRAI ML Service
tail -f /tmp/orchestrai-ml-service.log

# VAIBE-SEMANTIC
tail -f /tmp/vaibe-semantic.log
```

### Check Service Status
```bash
# Check if running
lsof -i:8000  # ORCHESTRAI ML
lsof -i:8001  # VAIBE-SEMANTIC

# Health checks
curl http://localhost:8000/health
curl http://localhost:8001/health
```

---

## Troubleshooting

### Port Conflicts
```bash
# If port 8000 is in use
kill $(lsof -ti:8000)

# If port 8001 is in use
kill $(lsof -ti:8001)
```

### Python Dependencies
```bash
# ORCHESTRAI ML Service
cd orchestrai-ml-service
source venv/bin/activate
pip install -r requirements.txt

# VAIBE-SEMANTIC
cd ../VAIBE-SEMANTIC
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Service Not Responding
```bash
# Restart services
./scripts/stop-semantic-services.sh
./scripts/start-semantic-services.sh

# Check logs for errors
tail -50 /tmp/orchestrai-ml-service.log
tail -50 /tmp/vaibe-semantic.log
```

---

## Benefits of Dual-Service Architecture

### 1. Separation of Concerns
- ML Service focuses on decision-making
- VAIBE-SEMANTIC focuses on analysis
- Each can be optimized independently

### 2. Scalability
- Scale ML Service for more prediction capacity
- Scale VAIBE-SEMANTIC for more NLP throughput
- Independent horizontal scaling

### 3. Reusability
- Multiple projects can use VAIBE-SEMANTIC
- Single semantic analysis service for all
- Consistent NLP across projects

### 4. Technology Optimization
- FastAPI for high-performance ML inference
- Flask for flexible NLP pipeline
- Best tool for each job

### 5. Development Flexibility
- Update ML models without affecting NLP
- Enhance NLP capabilities independently
- Parallel development possible

---

## Next Steps

1. **Start Services**: Run `./scripts/start-semantic-services.sh`
2. **Test Integration**: Use example API calls above
3. **Create Semantic Client**: Implement integration layer
4. **Train ML Models**: Once training data is ready
5. **Enhance Agents**: Add semantic capabilities to existing agents

---

## Summary

✅ **Dual-Service Architecture Configured**
- ORCHESTRAI ML Service on port 8000
- VAIBE-SEMANTIC on port 8001
- Startup/shutdown scripts created
- Complete integration documentation

🎯 **Ready to Use**
- Start services with one command
- Both services provide complementary capabilities
- Perfect synergy for intelligent agent orchestration

📚 **Resources**
- ML Service docs: `http://localhost:8000/docs`
- VAIBE-SEMANTIC health: `http://localhost:8001/health`
- Integration examples in this guide

**Status**: ✅ System ready for semantic intelligence integration!

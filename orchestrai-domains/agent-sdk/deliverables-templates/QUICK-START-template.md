# {{AGENT_NAME}} - Quick Start Guide

**Get up and running in 5 minutes**

---

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] {{RUNTIME_REQUIREMENT}} (Node.js 18+ or Python 3.10+)
- [ ] Anthropic API key ([Get one here](https://console.anthropic.com))
- [ ] {{#each ADDITIONAL_PREREQUISITES}}
- [ ] {{this}}
{{/each}}

---

## Step 1: Installation (2 minutes)

### Extract the Package

```bash
# Navigate to the agent directory
cd {{AGENT_NAME}}
```

### Install Dependencies

{{#if typescript}}
```bash
# Install Node.js dependencies
npm install

# Verify installation
npm list
```
{{else}}
```bash
# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Verify installation
pip list
```
{{/if}}

**Expected output**: ✓ All dependencies installed successfully

---

## Step 2: Configuration (2 minutes)

### Set Up Environment Variables

```bash
# Copy environment template
cp .env.example .env

# Edit the .env file with your credentials
{{EDIT_COMMAND}} .env
```

### Required Configuration

Add the following to your `.env` file:

```bash
# Anthropic API Key (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-...your-api-key-here...

{{#each REQUIRED_ENV_VARS}}
# {{comment}}
{{name}}={{placeholder}}
{{/each}}
```

**💡 Tip**: Get your Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Verify Configuration

{{#if typescript}}
```bash
# Test configuration loading
node -e "require('dotenv').config(); console.log(process.env.ANTHROPIC_API_KEY ? '✓ API key loaded' : '✗ API key missing')"
```
{{else}}
```bash
# Test configuration loading
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('✓ API key loaded' if os.getenv('ANTHROPIC_API_KEY') else '✗ API key missing')"
```
{{/if}}

---

## Step 3: Run Your First Query (1 minute)

### Basic Test

{{#if typescript}}
```bash
# Run the agent with a simple query
npm start "{{EXAMPLE_QUERY}}"
```
{{else}}
```bash
# Run the agent with a simple query
python src/main.py "{{EXAMPLE_QUERY}}"
```
{{/if}}

**Expected output:**
```
📝 User prompt: {{EXAMPLE_QUERY}}
🤖 Agent processing...

✅ Result:
{{EXPECTED_OUTPUT}}
```

✅ **Success!** Your agent is working.

---

## Common First Queries

### Query 1: {{COMMON_QUERY_1_TITLE}}

**Prompt:**
```
{{COMMON_QUERY_1_PROMPT}}
```

**Use case:** {{COMMON_QUERY_1_USE_CASE}}

{{#if typescript}}
```bash
npm start "{{COMMON_QUERY_1_PROMPT}}"
```
{{else}}
```bash
python src/main.py "{{COMMON_QUERY_1_PROMPT}}"
```
{{/if}}

---

### Query 2: {{COMMON_QUERY_2_TITLE}}

**Prompt:**
```
{{COMMON_QUERY_2_PROMPT}}
```

**Use case:** {{COMMON_QUERY_2_USE_CASE}}

{{#if typescript}}
```bash
npm start "{{COMMON_QUERY_2_PROMPT}}"
```
{{else}}
```bash
python src/main.py "{{COMMON_QUERY_2_PROMPT}}"
```
{{/if}}

---

### Query 3: {{COMMON_QUERY_3_TITLE}}

**Prompt:**
```
{{COMMON_QUERY_3_PROMPT}}
```

**Use case:** {{COMMON_QUERY_3_USE_CASE}}

{{#if typescript}}
```bash
npm start "{{COMMON_QUERY_3_PROMPT}}"
```
{{else}}
```bash
python src/main.py "{{COMMON_QUERY_3_PROMPT}}"
```
{{/if}}

---

## Development Mode

For faster iteration during development:

{{#if typescript}}
```bash
# Run with auto-reload (changes detected automatically)
npm run dev
```
{{else}}
```bash
# Run in development mode
python src/main.py
```
{{/if}}

**Benefits:**
- Auto-reload on code changes
- Verbose logging enabled
- Detailed error messages

---

## Testing

### Run the Test Suite

{{#if typescript}}
```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode (auto-rerun on changes)
npm run test:watch
```
{{else}}
```bash
# Run all tests
pytest

# Run with coverage report
pytest --cov

# Run specific test file
pytest tests/test_agent.py
```
{{/if}}

**Expected:**
- ✓ All tests passing
- ✓ Coverage ≥ 90%

---

## Programmatic Usage

### Use the Agent in Your Code

{{#if typescript}}
```typescript
import { {{AGENT_CLASS_NAME}}, AgentConfig } from './dist/index.js';

async function main() {
  // Configure agent
  const config: AgentConfig = {
    apiKey: process.env.ANTHROPIC_API_KEY!,
    model: 'claude-sonnet-4-20250514',
    systemPrompt: '{{SYSTEM_PROMPT}}',
    mcpServers: []
  };

  // Create and initialize agent
  const agent = new {{AGENT_CLASS_NAME}}(config);
  await agent.initializeMCP();

  // Execute query
  const result = await agent.execute('Your query here');
  console.log(result);

  // Cleanup
  await agent.cleanup();
}

main().catch(console.error);
```
{{else}}
```python
import asyncio
from src.main import {{AGENT_CLASS_NAME}}, AgentConfig

async def main():
    # Configure agent
    config = AgentConfig(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        model="claude-sonnet-4-20250514",
        system_prompt="{{SYSTEM_PROMPT}}",
        mcp_servers=[]
    )

    # Create and initialize agent
    agent = {{AGENT_CLASS_NAME}}(config)
    await agent.initialize_mcp()

    # Execute query
    result = await agent.execute("Your query here")
    print(result)

    # Cleanup
    await agent.cleanup()

asyncio.run(main())
```
{{/if}}

---

## Troubleshooting

### Issue 1: "API key not found"

**Problem:**
```
Error: ANTHROPIC_API_KEY environment variable is required
```

**Solution:**
1. Verify `.env` file exists: `ls -la .env`
2. Check API key is set: `cat .env | grep ANTHROPIC_API_KEY`
3. Reload environment: `source .env` (or restart terminal)

---

### Issue 2: "Module not found"

**Problem:**
```
Error: Cannot find module '...'
```

**Solution:**
{{#if typescript}}
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```
{{else}}
```bash
# Reinstall dependencies
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
{{/if}}

---

### Issue 3: "MCP server connection failed"

**Problem:**
```
Failed to connect to MCP server: [server-name]
```

**Solution:**
1. Check MCP server is installed
2. Verify `.mcp.json` configuration
3. See [DEPLOYMENT-GUIDE.md#mcp-configuration](DEPLOYMENT-GUIDE.md#mcp-configuration)

---

### Issue 4: Slow responses

**Problem:** Agent takes too long to respond

**Solution:**
- Switch to faster model: `claude-haiku-4-20250514`
- Check internet connection
- Reduce prompt complexity

---

## Next Steps

Now that your agent is running, explore these resources:

### 📖 Documentation

1. **[API Reference](API-REFERENCE.md)** - Complete API documentation
2. **[Deployment Guide](DEPLOYMENT-GUIDE.md)** - Production deployment
3. **[CLIENT-README.md](CLIENT-README.md)** - Full package overview

### 🚀 Advanced Topics

1. **Customize the agent** - Modify system prompt and behavior
2. **Add MCP servers** - Integrate external tools and data
3. **Deploy to production** - Cloud deployment options
4. **Monitor performance** - Set up logging and analytics

### 💡 Example Use Cases

{{#each USE_CASES}}
- **{{title}}**: {{description}}
{{/each}}

---

## Cost Monitoring

### Track Your API Usage

{{#if typescript}}
```typescript
// Add token counting to your code
const response = await agent.execute(prompt);
console.log('Tokens used:', response.usage);
```
{{else}}
```python
# Add token counting to your code
response = await agent.execute(prompt)
print(f"Tokens used: {response.usage}")
```
{{/if}}

### Estimated Costs

**Typical query**: {{TYPICAL_TOKEN_COUNT}} tokens (~${{TYPICAL_QUERY_COST}})

**Monthly estimate** ({{ESTIMATED_QUERIES_PER_MONTH}} queries):
- API costs: ~${{ESTIMATED_API_COST}}
- MCP servers: ~${{ESTIMATED_MCP_COST}}
- **Total**: ~${{ESTIMATED_MONTHLY_COST}}

---

## Support

### Get Help

**Email**: {{SUPPORT_EMAIL}}
**Response time**: {{SUPPORT_RESPONSE_TIME}}
**Hours**: {{SUPPORT_HOURS}}

### Reporting Issues

When reporting issues, include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Environment details (OS, runtime version)
4. Configuration (sanitized, no API keys)

---

## Quick Reference

### Common Commands

{{#if typescript}}
```bash
# Install dependencies
npm install

# Run agent
npm start "your query"

# Development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```
{{else}}
```bash
# Install dependencies
pip install -r requirements.txt

# Run agent
python src/main.py "your query"

# Run tests
pytest

# Run with coverage
pytest --cov
```
{{/if}}

### Important Files

- `.env` - Environment variables (API keys)
- `.mcp.json` - MCP server configuration
- `{{MAIN_FILE}}` - Main agent code
- `README.md` - Full documentation

### Essential Links

- [Anthropic Console](https://console.anthropic.com) - Manage API keys
- [Claude Documentation](https://docs.anthropic.com/claude/docs) - Claude API docs
- [MCP Documentation](https://modelcontextprotocol.io) - MCP protocol docs

---

## Success Checklist

- [ ] Dependencies installed successfully
- [ ] API key configured in `.env`
- [ ] First query executed successfully
- [ ] Tests passing
- [ ] Reviewed API Reference
- [ ] Reviewed Deployment Guide

✅ **All done?** You're ready to start building with {{AGENT_NAME}}!

---

**Questions?** See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) or contact {{SUPPORT_EMAIL}}

**Created with ❤️ by ORCHESTRAI**

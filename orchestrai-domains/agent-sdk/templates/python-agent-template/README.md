# {{AGENT_NAME}}

{{AGENT_DESCRIPTION}}

**Powered by**: Claude (Anthropic) via Agent SDK
**Market**: {{TARGET_MARKET}}
**Version**: 1.0.0
**Language**: Python 3.10+

---

## Overview

{{AGENT_NAME}} is a production-ready AI agent built with Anthropic's Agent SDK. This agent specializes in {{SPECIALIZATION}} and uses the Model Context Protocol (MCP) to integrate with external tools and data sources.

### Key Features

{{#each KEY_FEATURES}}
- {{this}}
{{/each}}

### MCP Integration

This agent uses the following MCP servers:

#### Required MCP Servers
{{#each MCP_SERVERS_REQUIRED}}
- **{{name}}**: {{description}}
  - Purpose: {{purpose}}
  - Tools used: {{tools}}
{{/each}}

#### Optional MCP Servers
{{#each MCP_SERVERS_OPTIONAL}}
- **{{name}}**: {{description}}
  - Purpose: {{purpose}}
  - Tools used: {{tools}}
{{/each}}

---

## Installation

### Prerequisites
- Python 3.10 or higher installed
- pip package manager
- Anthropic API key
{{#each PREREQUISITES}}
- {{this}}
{{/each}}

### Setup Steps

1. **Clone or extract the agent package**:
   ```bash
   cd {{AGENT_NAME}}
   ```

2. **Create a virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

5. **Configure MCP servers** (see MCP Configuration section below)

---

## MCP Configuration

Create a `.mcp.json` file in the project root:

```json
{
  "mcpServers": {
    {{#each MCP_SERVERS_CONFIG}}
    "{{name}}": {
      "command": "{{command}}",
      "args": {{args}},
      "env": {{env}}
    }{{#unless @last}},{{/unless}}
    {{/each}}
  }
}
```

### Environment Variables

Add the following to your `.env` file:

```bash
# Required
ANTHROPIC_API_KEY=your_anthropic_api_key

# MCP Server Credentials
{{#each MCP_ENV_VARS}}
{{this}}
{{/each}}
```

---

## Usage

### Basic Usage

```bash
# Run the agent with a prompt
python src/main.py "Your prompt here"

# Example
python src/main.py "{{EXAMPLE_PROMPT}}"
```

### Programmatic Usage

```python
import asyncio
from src.main import {{AGENT_CLASS_NAME}}, AgentConfig, MCPServerConfig

async def use_agent():
    config = AgentConfig(
        api_key="your_api_key",
        model="claude-sonnet-4-20250514",
        system_prompt="{{SYSTEM_PROMPT}}",
        mcp_servers=[
            # Your MCP server configurations
        ],
    )

    agent = {{AGENT_CLASS_NAME}}(config)
    await agent.initialize_mcp()

    result = await agent.execute("Your prompt here")
    print(result)

    await agent.cleanup()

asyncio.run(use_agent())
```

---

## Testing

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run tests with coverage
pytest --cov

# Run specific test file
pytest tests/test_agent.py

# Run with verbose output
pytest -v
```

---

## Example Use Cases

{{#each USE_CASES}}
### {{title}}

{{description}}

**Example prompt**:
```
{{prompt}}
```

**Expected output**:
{{output}}

---
{{/each}}

## Configuration Options

### Agent Configuration

The agent accepts the following configuration options:

```python
@dataclass
class AgentConfig:
    api_key: str              # Anthropic API key
    model: str                # Claude model to use
    system_prompt: str        # Agent's system prompt
    mcp_servers: List[MCPServerConfig]  # MCP server configurations
```

### Supported Models

- `claude-sonnet-4-20250514` (Recommended - balanced performance)
- `claude-opus-4-20250514` (Best quality, higher cost)
- `claude-haiku-4-20250514` (Fastest, lower cost)

---

## Troubleshooting

### MCP Connection Issues

**Problem**: `Failed to connect to MCP server: [server-name]`

**Solutions**:
1. Verify the MCP server is installed:
   ```bash
   pip install mcp-[name]
   # Or for NPM-based servers:
   npx -y @modelcontextprotocol/server-[name]
   ```
2. Check environment variables are set correctly
3. Ensure `.mcp.json` configuration is valid

### API Key Issues

**Problem**: `ANTHROPIC_API_KEY environment variable is required`

**Solutions**:
1. Verify `.env` file exists
2. Check API key is valid at https://console.anthropic.com
3. Ensure `.env` is loaded (using python-dotenv)

### Import Errors

**Problem**: `ModuleNotFoundError: No module named 'anthropic'`

**Solutions**:
1. Activate your virtual environment
2. Run `pip install -r requirements.txt`
3. Verify installation: `pip list | grep anthropic`

### Async/Await Issues

**Problem**: `RuntimeError: Event loop is closed`

**Solutions**:
1. Ensure you're using `asyncio.run()` for top-level async calls
2. Don't mix sync and async code without proper handling
3. Use `await` for all async function calls

---

## Performance Considerations

### Token Usage

This agent uses Claude's API which charges based on tokens:
- Input tokens: ~$0.003 per 1K tokens
- Output tokens: ~$0.015 per 1K tokens

Typical prompt: {{TYPICAL_TOKEN_COUNT}} tokens (~${{TYPICAL_COST}})

### Optimization Tips

1. **Prompt Engineering**: Craft concise, specific prompts
2. **Model Selection**: Use Haiku for simple tasks, Sonnet for balanced, Opus for complex
3. **Caching**: Implement response caching for repeated queries
4. **Batch Processing**: Process multiple items in a single request when possible
5. **Async Operations**: Use asyncio for concurrent processing

---

## Deployment

### Local Deployment

```bash
# Run in production mode
PYTHON_ENV=production python src/main.py
```

### Docker Deployment

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "src/main.py"]
```

### Cloud Deployment

This agent can be deployed to:
- **AWS Lambda**: Use Python 3.10+ runtime with container image
- **Google Cloud Run**: Container-based deployment
- **Azure Functions**: Python function app
- **Railway/Render**: Direct deployment from repository

### Systemd Service (Linux)

Create `/etc/systemd/system/{{AGENT_NAME_CLI}}.service`:

```ini
[Unit]
Description={{AGENT_NAME}}
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/agent
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python src/main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

---

## Code Quality

### Type Checking

```bash
# Install mypy
pip install mypy

# Run type checking
mypy src/
```

### Code Formatting

```bash
# Install black and isort
pip install black isort

# Format code
black src/
isort src/
```

### Linting

```bash
# Install pylint
pip install pylint

# Run linting
pylint src/
```

---

## Pricing

{{PRICING_MODEL}}

---

## Support & Maintenance

### Getting Help

- **Issues**: Report bugs or request features via issue tracker
- **Documentation**: Full documentation at {{DOCS_URL}}
- **Email Support**: {{SUPPORT_EMAIL}}

### Updates

This agent receives regular updates including:
- Bug fixes and security patches
- New features and capabilities
- Performance improvements
- Updated MCP server integrations

---

## License

MIT License - See LICENSE file for details

---

## About ORCHESTRAI

This agent was created by ORCHESTRAI, an advanced multi-agent orchestration system. ORCHESTRAI specializes in creating production-ready AI solutions for businesses.

**Learn more**: [ORCHESTRAI Documentation](https://github.com/yourusername/orchestrai)

---

**Built with ❤️ using Anthropic's Claude and Agent SDK**

# {{AGENT_NAME}}

{{AGENT_DESCRIPTION}}

**Powered by**: Claude (Anthropic) via Agent SDK
**Market**: {{TARGET_MARKET}}
**Version**: 1.0.0

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
- Node.js 18+ installed
- Anthropic API key
{{#each PREREQUISITES}}
- {{this}}
{{/each}}

### Setup Steps

1. **Clone or extract the agent package**:
   ```bash
   cd {{AGENT_NAME}}
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Configure MCP servers** (see MCP Configuration section below)

5. **Build the agent**:
   ```bash
   npm run build
   ```

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
npm start "Your prompt here"

# Example
npm start "{{EXAMPLE_PROMPT}}"
```

### Development Mode

```bash
# Run with auto-reload
npm run dev
```

### Programmatic Usage

```typescript
import { {{AGENT_CLASS_NAME}}, AgentConfig } from './dist/index.js';

const config: AgentConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  systemPrompt: '{{SYSTEM_PROMPT}}',
  mcpServers: [
    // Your MCP server configurations
  ],
};

const agent = new {{AGENT_CLASS_NAME}}(config);
await agent.initializeMCP();

const result = await agent.execute('Your prompt here');
console.log(result);

await agent.cleanup();
```

---

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
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

```typescript
interface AgentConfig {
  apiKey: string;           // Anthropic API key
  model: string;            // Claude model to use
  systemPrompt: string;     // Agent's system prompt
  mcpServers: MCPServerConfig[];  // MCP server configurations
}
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
   npx -y @modelcontextprotocol/server-[name]
   ```
2. Check environment variables are set correctly
3. Ensure `.mcp.json` configuration is valid

### API Key Issues

**Problem**: `ANTHROPIC_API_KEY environment variable is required`

**Solutions**:
1. Verify `.env` file exists
2. Check API key is valid at https://console.anthropic.com
3. Ensure `.env` is loaded (using dotenv)

### TypeScript Compilation Errors

**Problem**: TypeScript build fails

**Solutions**:
1. Run `npm install` to ensure dependencies are installed
2. Check `tsconfig.json` is present
3. Verify TypeScript version: `npx tsc --version`

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

---

## Deployment

### Local Deployment

```bash
# Build for production
npm run build

# Run in production mode
NODE_ENV=production npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

### Cloud Deployment

This agent can be deployed to:
- **AWS Lambda**: Use Node.js 18 runtime
- **Google Cloud Run**: Container-based deployment
- **Azure Functions**: Node.js function app
- **Railway/Render**: Direct deployment from repository

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

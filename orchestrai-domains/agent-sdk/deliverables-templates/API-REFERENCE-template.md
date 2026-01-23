# {{AGENT_NAME}} - API Reference

**Version**: 1.0.0
**Language**: {{PROGRAMMING_LANGUAGE}}
**Last Updated**: {{LAST_UPDATED}}

---

## Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Core Classes](#core-classes)
5. [Configuration](#configuration)
6. [Methods](#methods)
7. [Examples](#examples)
8. [Error Handling](#error-handling)
9. [Type Definitions](#type-definitions)

---

## Overview

{{AGENT_NAME}} provides a simple, type-safe API for {{PRIMARY_FUNCTIONALITY}}.

### Key Features

- ✅ Full TypeScript/Python type safety
- ✅ Async/await support
- ✅ Comprehensive error handling
- ✅ MCP integration for external tools
- ✅ Built-in retry logic and circuit breakers

---

## Installation

### {{#if typescript}}TypeScript/JavaScript{{else}}Python{{/if}}

```{{#if typescript}}bash{{else}}bash{{/if}}
{{INSTALL_COMMAND}}
```

### Import

{{#if typescript}}
```typescript
import { {{AGENT_CLASS_NAME}}, AgentConfig } from '{{PACKAGE_NAME}}';
```
{{else}}
```python
from {{PACKAGE_NAME}} import {{AGENT_CLASS_NAME}}, AgentConfig
```
{{/if}}

---

## Quick Start

### Basic Usage

{{#if typescript}}
```typescript
import { {{AGENT_CLASS_NAME}}, AgentConfig, MCPServerConfig } from '{{PACKAGE_NAME}}';

// Configure the agent
const config: AgentConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  systemPrompt: '{{SYSTEM_PROMPT}}',
  mcpServers: [
    // MCP server configurations
  ],
};

// Create agent instance
const agent = new {{AGENT_CLASS_NAME}}(config);

// Initialize MCP connections
await agent.initializeMCP();

// Execute a query
const result = await agent.execute('{{EXAMPLE_QUERY}}');
console.log(result);

// Cleanup
await agent.cleanup();
```
{{else}}
```python
import asyncio
from {{PACKAGE_NAME}} import {{AGENT_CLASS_NAME}}, AgentConfig, MCPServerConfig

async def main():
    # Configure the agent
    config = AgentConfig(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        model="claude-sonnet-4-20250514",
        system_prompt="{{SYSTEM_PROMPT}}",
        mcp_servers=[
            # MCP server configurations
        ],
    )

    # Create agent instance
    agent = {{AGENT_CLASS_NAME}}(config)

    # Initialize MCP connections
    await agent.initialize_mcp()

    # Execute a query
    result = await agent.execute("{{EXAMPLE_QUERY}}")
    print(result)

    # Cleanup
    await agent.cleanup()

asyncio.run(main())
```
{{/if}}

---

## Core Classes

### `{{AGENT_CLASS_NAME}}`

Main agent class for executing queries.

#### Constructor

{{#if typescript}}
```typescript
constructor(config: AgentConfig)
```
{{else}}
```python
def __init__(self, config: AgentConfig) -> None:
```
{{/if}}

**Parameters:**
- `config` ([AgentConfig](#agentconfig)) - Agent configuration object

**Example:**
{{#if typescript}}
```typescript
const agent = new {{AGENT_CLASS_NAME}}({
  apiKey: 'sk-ant-...',
  model: 'claude-sonnet-4-20250514',
  systemPrompt: 'You are a helpful assistant',
  mcpServers: []
});
```
{{else}}
```python
agent = {{AGENT_CLASS_NAME}}(
    AgentConfig(
        api_key="sk-ant-...",
        model="claude-sonnet-4-20250514",
        system_prompt="You are a helpful assistant",
        mcp_servers=[]
    )
)
```
{{/if}}

---

## Configuration

### `AgentConfig`

Configuration object for the agent.

{{#if typescript}}
```typescript
interface AgentConfig {
  apiKey: string;              // Anthropic API key
  model: string;               // Claude model identifier
  systemPrompt: string;        // System prompt for the agent
  mcpServers: MCPServerConfig[]; // MCP server configurations
}
```
{{else}}
```python
@dataclass
class AgentConfig:
    api_key: str                    # Anthropic API key
    model: str                      # Claude model identifier
    system_prompt: str              # System prompt for the agent
    mcp_servers: List[MCPServerConfig]  # MCP server configurations
```
{{/if}}

**Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `apiKey` / `api_key` | string | Yes | Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com) |
| `model` | string | Yes | Claude model to use. Options: `claude-sonnet-4-20250514`, `claude-opus-4-20250514`, `claude-haiku-4-20250514` |
| `systemPrompt` / `system_prompt` | string | Yes | The system prompt that defines the agent's behavior and capabilities |
| `mcpServers` / `mcp_servers` | MCPServerConfig[] | No | Array of MCP server configurations for external tool integration |

**Example:**
{{#if typescript}}
```typescript
const config: AgentConfig = {
  apiKey: process.env.ANTHROPIC_API_KEY!,
  model: 'claude-sonnet-4-20250514',
  systemPrompt: '{{SYSTEM_PROMPT}}',
  mcpServers: [
    {
      name: 'memory',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-memory'],
      env: {}
    }
  ]
};
```
{{else}}
```python
config = AgentConfig(
    api_key=os.getenv("ANTHROPIC_API_KEY"),
    model="claude-sonnet-4-20250514",
    system_prompt="{{SYSTEM_PROMPT}}",
    mcp_servers=[
        MCPServerConfig(
            name="memory",
            command="npx",
            args=["-y", "@modelcontextprotocol/server-memory"],
            env={}
        )
    ]
)
```
{{/if}}

### `MCPServerConfig`

Configuration for an MCP server.

{{#if typescript}}
```typescript
interface MCPServerConfig {
  name: string;                // Server identifier
  command: string;             // Command to start server
  args: string[];              // Command arguments
  env?: Record<string, string>; // Environment variables
}
```
{{else}}
```python
@dataclass
class MCPServerConfig:
    name: str                    # Server identifier
    command: str                 # Command to start server
    args: List[str]              # Command arguments
    env: Optional[Dict[str, str]] = None  # Environment variables
```
{{/if}}

**Example:**
{{#if typescript}}
```typescript
const mcpConfig: MCPServerConfig = {
  name: 'dataforseo',
  command: 'node',
  args: ['path/to/dataforseo-server.js'],
  env: {
    DATAFORSEO_API_KEY: process.env.DATAFORSEO_API_KEY,
    DATAFORSEO_API_SECRET: process.env.DATAFORSEO_API_SECRET
  }
};
```
{{else}}
```python
mcp_config = MCPServerConfig(
    name="dataforseo",
    command="node",
    args=["path/to/dataforseo-server.js"],
    env={
        "DATAFORSEO_API_KEY": os.getenv("DATAFORSEO_API_KEY"),
        "DATAFORSEO_API_SECRET": os.getenv("DATAFORSEO_API_SECRET")
    }
)
```
{{/if}}

---

## Methods

### `initializeMCP()` / `initialize_mcp()`

Initialize connections to all configured MCP servers.

{{#if typescript}}
```typescript
async initializeMCP(): Promise<void>
```
{{else}}
```python
async def initialize_mcp(self) -> None:
```
{{/if}}

**Returns:** Promise<void> / None

**Throws:** Error if any MCP server fails to connect

**Example:**
{{#if typescript}}
```typescript
try {
  await agent.initializeMCP();
  console.log('✓ All MCP servers connected');
} catch (error) {
  console.error('Failed to initialize MCP:', error);
}
```
{{else}}
```python
try:
    await agent.initialize_mcp()
    print("✓ All MCP servers connected")
except Exception as error:
    print(f"Failed to initialize MCP: {error}")
```
{{/if}}

---

### `execute()`

Execute the agent with a user prompt.

{{#if typescript}}
```typescript
async execute(userPrompt: string): Promise<string>
```
{{else}}
```python
async def execute(self, user_prompt: str) -> str:
```
{{/if}}

**Parameters:**
- `userPrompt` / `user_prompt` (string) - The user's input prompt

**Returns:** string - The agent's response

**Throws:** Error if execution fails

**Example:**
{{#if typescript}}
```typescript
const prompt = '{{EXAMPLE_PROMPT}}';
const response = await agent.execute(prompt);
console.log('Response:', response);
```
{{else}}
```python
prompt = "{{EXAMPLE_PROMPT}}"
response = await agent.execute(prompt)
print(f"Response: {response}")
```
{{/if}}

---

### `cleanup()`

Clean up MCP connections and release resources.

{{#if typescript}}
```typescript
async cleanup(): Promise<void>
```
{{else}}
```python
async def cleanup(self) -> None:
```
{{/if}}

**Returns:** Promise<void> / None

**Example:**
{{#if typescript}}
```typescript
try {
  await agent.cleanup();
  console.log('✓ Cleanup complete');
} catch (error) {
  console.warn('Cleanup warning:', error);
}
```
{{else}}
```python
try:
    await agent.cleanup()
    print("✓ Cleanup complete")
except Exception as error:
    print(f"Cleanup warning: {error}")
```
{{/if}}

---

## Examples

### Example 1: {{EXAMPLE_1_TITLE}}

{{EXAMPLE_1_DESCRIPTION}}

{{#if typescript}}
```typescript
{{EXAMPLE_1_CODE_TS}}
```
{{else}}
```python
{{EXAMPLE_1_CODE_PY}}
```
{{/if}}

**Expected Output:**
```
{{EXAMPLE_1_OUTPUT}}
```

---

### Example 2: {{EXAMPLE_2_TITLE}}

{{EXAMPLE_2_DESCRIPTION}}

{{#if typescript}}
```typescript
{{EXAMPLE_2_CODE_TS}}
```
{{else}}
```python
{{EXAMPLE_2_CODE_PY}}
```
{{/if}}

**Expected Output:**
```
{{EXAMPLE_2_OUTPUT}}
```

---

### Example 3: {{EXAMPLE_3_TITLE}}

{{EXAMPLE_3_DESCRIPTION}}

{{#if typescript}}
```typescript
{{EXAMPLE_3_CODE_TS}}
```
{{else}}
```python
{{EXAMPLE_3_CODE_PY}}
```
{{/if}}

**Expected Output:**
```
{{EXAMPLE_3_OUTPUT}}
```

---

## Error Handling

### Common Errors

#### API Key Error

```
Error: ANTHROPIC_API_KEY environment variable is required
```

**Cause:** API key not set or invalid

**Solution:**
{{#if typescript}}
```typescript
// Ensure API key is set
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY must be set');
}
```
{{else}}
```python
# Ensure API key is set
if not os.getenv("ANTHROPIC_API_KEY"):
    raise ValueError("ANTHROPIC_API_KEY must be set")
```
{{/if}}

---

#### MCP Connection Error

```
Error: Failed to connect to MCP server: [server-name]
```

**Cause:** MCP server not installed or misconfigured

**Solution:**
1. Verify server installation
2. Check `.mcp.json` configuration
3. Ensure environment variables are set

---

#### Rate Limit Error

```
Error: Rate limit exceeded
```

**Cause:** Too many API requests

**Solution:**
{{#if typescript}}
```typescript
// Implement exponential backoff
async function executeWithRetry(agent, prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await agent.execute(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}
```
{{else}}
```python
# Implement exponential backoff
async def execute_with_retry(agent, prompt, max_retries=3):
    for i in range(max_retries):
        try:
            return await agent.execute(prompt)
        except Exception as error:
            if i == max_retries - 1:
                raise error
            await asyncio.sleep(1 * (2 ** i))
```
{{/if}}

---

## Type Definitions

### Full TypeScript/Python Types

{{#if typescript}}
```typescript
// Full type definitions
export interface AgentConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  mcpServers: MCPServerConfig[];
}

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class {{AGENT_CLASS_NAME}} {
  constructor(config: AgentConfig);
  initializeMCP(): Promise<void>;
  execute(userPrompt: string): Promise<string>;
  cleanup(): Promise<void>;
}
```
{{else}}
```python
# Full type definitions
from dataclasses import dataclass
from typing import List, Dict, Optional

@dataclass
class AgentConfig:
    api_key: str
    model: str
    system_prompt: str
    mcp_servers: List[MCPServerConfig]

@dataclass
class MCPServerConfig:
    name: str
    command: str
    args: List[str]
    env: Optional[Dict[str, str]] = None

class {{AGENT_CLASS_NAME}}:
    def __init__(self, config: AgentConfig) -> None: ...
    async def initialize_mcp(self) -> None: ...
    async def execute(self, user_prompt: str) -> str: ...
    async def cleanup(self) -> None: ...
```
{{/if}}

---

## Support

**Documentation**: See [QUICK-START.md](QUICK-START.md) and [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)
**Email Support**: {{SUPPORT_EMAIL}}
**Response Time**: {{SUPPORT_RESPONSE_TIME}}

---

**API Version**: 1.0.0
**Last Updated**: {{LAST_UPDATED}}
**Maintained by**: ORCHESTRAI

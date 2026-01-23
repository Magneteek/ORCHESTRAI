import Anthropic from '@anthropic-ai/sdk';
import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * {{AGENT_NAME}} - {{AGENT_DESCRIPTION}}
 *
 * This agent is powered by Claude and uses the Anthropic Agent SDK
 * with MCP (Model Context Protocol) integration for external tools.
 *
 * MCP Servers Required:
 * {{#each MCP_SERVERS_REQUIRED}}
 * - {{this}}: {{description}}
 * {{/each}}
 *
 * MCP Servers Optional:
 * {{#each MCP_SERVERS_OPTIONAL}}
 * - {{this}}: {{description}}
 * {{/each}}
 */

interface AgentConfig {
  apiKey: string;
  model: string;
  systemPrompt: string;
  mcpServers: MCPServerConfig[];
}

interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

class {{AGENT_CLASS_NAME}} {
  private client: Anthropic;
  private mcpClients: Map<string, MCPClient> = new Map();
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  /**
   * Initialize MCP server connections
   */
  async initializeMCP(): Promise<void> {
    console.log('Initializing MCP servers...');

    for (const serverConfig of this.config.mcpServers) {
      try {
        const transport = new StdioClientTransport({
          command: serverConfig.command,
          args: serverConfig.args,
          env: serverConfig.env,
        });

        const mcpClient = new MCPClient({
          name: `{{AGENT_NAME}}-${serverConfig.name}`,
          version: '1.0.0',
        }, {
          capabilities: {},
        });

        await mcpClient.connect(transport);
        this.mcpClients.set(serverConfig.name, mcpClient);

        console.log(`✓ Connected to MCP server: ${serverConfig.name}`);
      } catch (error) {
        console.error(`✗ Failed to connect to ${serverConfig.name}:`, error);
        throw error;
      }
    }
  }

  /**
   * Execute the agent with the given prompt
   */
  async execute(userPrompt: string): Promise<string> {
    try {
      // Get available MCP tools
      const tools = await this.getAvailableTools();

      // Create message with tool use capability
      const response = await this.client.messages.create({
        model: this.config.model,
        max_tokens: 4096,
        system: this.config.systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        tools: tools,
      });

      // Handle tool use if present
      if (response.stop_reason === 'tool_use') {
        return await this.handleToolUse(response, userPrompt);
      }

      // Extract text response
      const textContent = response.content.find(
        (block) => block.type === 'text'
      );

      return textContent && 'text' in textContent ? textContent.text : '';
    } catch (error) {
      console.error('Agent execution error:', error);
      throw error;
    }
  }

  /**
   * Get all available tools from connected MCP servers
   */
  private async getAvailableTools(): Promise<any[]> {
    const tools: any[] = [];

    for (const [serverName, mcpClient] of this.mcpClients) {
      try {
        const serverTools = await mcpClient.listTools();
        tools.push(...serverTools.tools);
      } catch (error) {
        console.warn(`Warning: Could not get tools from ${serverName}:`, error);
      }
    }

    return tools;
  }

  /**
   * Handle tool use in Claude's response
   */
  private async handleToolUse(
    response: Anthropic.Messages.Message,
    originalPrompt: string
  ): Promise<string> {
    const toolUseBlocks = response.content.filter(
      (block) => block.type === 'tool_use'
    );

    const toolResults: any[] = [];

    for (const toolUse of toolUseBlocks) {
      if (toolUse.type !== 'tool_use') continue;

      try {
        // Find which MCP server has this tool
        const result = await this.executeToolUse(toolUse);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } catch (error) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: String(error) }),
          is_error: true,
        });
      }
    }

    // Continue the conversation with tool results
    const followUp = await this.client.messages.create({
      model: this.config.model,
      max_tokens: 4096,
      system: this.config.systemPrompt,
      messages: [
        {
          role: 'user',
          content: originalPrompt,
        },
        {
          role: 'assistant',
          content: response.content,
        },
        {
          role: 'user',
          content: toolResults,
        },
      ],
    });

    const textContent = followUp.content.find(
      (block) => block.type === 'text'
    );

    return textContent && 'text' in textContent ? textContent.text : '';
  }

  /**
   * Execute a tool use request on the appropriate MCP server
   */
  private async executeToolUse(toolUse: any): Promise<any> {
    for (const [serverName, mcpClient] of this.mcpClients) {
      try {
        const result = await mcpClient.callTool({
          name: toolUse.name,
          arguments: toolUse.input,
        });
        return result;
      } catch (error) {
        // Try next server
        continue;
      }
    }
    throw new Error(`No MCP server could execute tool: ${toolUse.name}`);
  }

  /**
   * Cleanup MCP connections
   */
  async cleanup(): Promise<void> {
    console.log('Cleaning up MCP connections...');
    for (const [serverName, mcpClient] of this.mcpClients) {
      try {
        await mcpClient.close();
        console.log(`✓ Closed connection to ${serverName}`);
      } catch (error) {
        console.warn(`Warning: Error closing ${serverName}:`, error);
      }
    }
  }
}

/**
 * Main execution function
 */
async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required');
  }

  // {{MCP_CONFIGURATION_COMMENT}}
  const mcpServers: MCPServerConfig[] = [
    {{#each MCP_SERVERS_CONFIG}}
    {
      name: '{{name}}',
      command: '{{command}}',
      args: {{{args}}},
      env: {{{env}}}
    },
    {{/each}}
  ];

  const agent = new {{AGENT_CLASS_NAME}}({
    apiKey,
    model: 'claude-sonnet-4-20250514',
    systemPrompt: `{{SYSTEM_PROMPT}}`,
    mcpServers,
  });

  try {
    // Initialize MCP connections
    await agent.initializeMCP();

    // Example usage
    const userPrompt = process.argv[2] || '{{DEFAULT_PROMPT}}';
    console.log('\n📝 User prompt:', userPrompt);
    console.log('\n🤖 Agent processing...\n');

    const result = await agent.execute(userPrompt);
    console.log('\n✅ Result:\n', result);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await agent.cleanup();
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { {{AGENT_CLASS_NAME}}, AgentConfig, MCPServerConfig };

"""
{{AGENT_NAME}} - {{AGENT_DESCRIPTION}}

This agent is powered by Claude and uses the Anthropic Agent SDK
with MCP (Model Context Protocol) integration for external tools.

MCP Servers Required:
{{#each MCP_SERVERS_REQUIRED}}
- {{this}}: {{description}}
{{/each}}

MCP Servers Optional:
{{#each MCP_SERVERS_OPTIONAL}}
- {{this}}: {{description}}
{{/each}}
"""

import os
import sys
import json
import asyncio
from typing import List, Dict, Any, Optional
from dataclasses import dataclass

import anthropic
from anthropic.types import Message, ToolUseBlock, TextBlock
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from dotenv import load_dotenv


# Load environment variables
load_dotenv()


@dataclass
class MCPServerConfig:
    """Configuration for an MCP server"""
    name: str
    command: str
    args: List[str]
    env: Optional[Dict[str, str]] = None


@dataclass
class AgentConfig:
    """Configuration for the agent"""
    api_key: str
    model: str
    system_prompt: str
    mcp_servers: List[MCPServerConfig]


class {{AGENT_CLASS_NAME}}:
    """
    {{AGENT_NAME}} - {{AGENT_DESCRIPTION}}

    A production-ready AI agent built with Anthropic's Agent SDK
    and Model Context Protocol (MCP) integration.
    """

    def __init__(self, config: AgentConfig):
        """
        Initialize the agent with configuration

        Args:
            config: Agent configuration including API key and MCP servers
        """
        self.config = config
        self.client = anthropic.Anthropic(api_key=config.api_key)
        self.mcp_sessions: Dict[str, ClientSession] = {}
        self.available_tools: List[Dict[str, Any]] = []

    async def initialize_mcp(self) -> None:
        """Initialize connections to all configured MCP servers"""
        print("Initializing MCP servers...")

        for server_config in self.config.mcp_servers:
            try:
                # Create server parameters
                server_params = StdioServerParameters(
                    command=server_config.command,
                    args=server_config.args,
                    env=server_config.env or {}
                )

                # Connect to the MCP server
                stdio_transport = await stdio_client(server_params)
                session = ClientSession(stdio_transport[0], stdio_transport[1])

                await session.initialize()
                self.mcp_sessions[server_config.name] = session

                # Get available tools from this server
                tools_result = await session.list_tools()
                self.available_tools.extend(tools_result.tools)

                print(f"✓ Connected to MCP server: {server_config.name}")

            except Exception as e:
                print(f"✗ Failed to connect to {server_config.name}: {e}")
                raise

    async def execute(self, user_prompt: str) -> str:
        """
        Execute the agent with the given prompt

        Args:
            user_prompt: The user's input prompt

        Returns:
            The agent's response as a string
        """
        try:
            # Convert MCP tools to Anthropic tool format
            anthropic_tools = self._convert_mcp_tools_to_anthropic()

            # Create message with tool use capability
            response = self.client.messages.create(
                model=self.config.model,
                max_tokens=4096,
                system=self.config.system_prompt,
                messages=[
                    {
                        "role": "user",
                        "content": user_prompt,
                    }
                ],
                tools=anthropic_tools,
            )

            # Handle tool use if present
            if response.stop_reason == "tool_use":
                return await self._handle_tool_use(response, user_prompt)

            # Extract text response
            text_content = next(
                (block.text for block in response.content if isinstance(block, TextBlock)),
                ""
            )

            return text_content

        except Exception as e:
            print(f"Agent execution error: {e}")
            raise

    def _convert_mcp_tools_to_anthropic(self) -> List[Dict[str, Any]]:
        """Convert MCP tool definitions to Anthropic's tool format"""
        anthropic_tools = []

        for tool in self.available_tools:
            anthropic_tools.append({
                "name": tool.name,
                "description": tool.description or "",
                "input_schema": tool.inputSchema or {}
            })

        return anthropic_tools

    async def _handle_tool_use(
        self,
        response: Message,
        original_prompt: str
    ) -> str:
        """
        Handle tool use in Claude's response

        Args:
            response: The message containing tool use
            original_prompt: The original user prompt

        Returns:
            The final response after tool execution
        """
        tool_use_blocks = [
            block for block in response.content
            if isinstance(block, ToolUseBlock)
        ]

        tool_results = []

        for tool_use in tool_use_blocks:
            try:
                # Execute the tool via MCP
                result = await self._execute_tool_use(tool_use)

                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": json.dumps(result),
                })

            except Exception as e:
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": tool_use.id,
                    "content": json.dumps({"error": str(e)}),
                    "is_error": True,
                })

        # Continue the conversation with tool results
        follow_up = self.client.messages.create(
            model=self.config.model,
            max_tokens=4096,
            system=self.config.system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": original_prompt,
                },
                {
                    "role": "assistant",
                    "content": response.content,
                },
                {
                    "role": "user",
                    "content": tool_results,
                },
            ],
        )

        text_content = next(
            (block.text for block in follow_up.content if isinstance(block, TextBlock)),
            ""
        )

        return text_content

    async def _execute_tool_use(self, tool_use: ToolUseBlock) -> Any:
        """
        Execute a tool use request on the appropriate MCP server

        Args:
            tool_use: The tool use block from Claude's response

        Returns:
            The result from the tool execution
        """
        # Try each MCP session to find the one that has this tool
        for server_name, session in self.mcp_sessions.items():
            try:
                result = await session.call_tool(
                    name=tool_use.name,
                    arguments=tool_use.input
                )
                return result
            except Exception:
                # Try next server
                continue

        raise Exception(f"No MCP server could execute tool: {tool_use.name}")

    async def cleanup(self) -> None:
        """Cleanup MCP connections"""
        print("Cleaning up MCP connections...")

        for server_name, session in self.mcp_sessions.items():
            try:
                await session.close()
                print(f"✓ Closed connection to {server_name}")
            except Exception as e:
                print(f"Warning: Error closing {server_name}: {e}")


async def main() -> None:
    """Main execution function"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY environment variable is required")

    # {{MCP_CONFIGURATION_COMMENT}}
    mcp_servers = [
        {{#each MCP_SERVERS_CONFIG}}
        MCPServerConfig(
            name="{{name}}",
            command="{{command}}",
            args={{args}},
            env={{env}}
        ),
        {{/each}}
    ]

    agent = {{AGENT_CLASS_NAME}}(
        AgentConfig(
            api_key=api_key,
            model="claude-sonnet-4-20250514",
            system_prompt="{{SYSTEM_PROMPT}}",
            mcp_servers=mcp_servers,
        )
    )

    try:
        # Initialize MCP connections
        await agent.initialize_mcp()

        # Example usage
        user_prompt = sys.argv[1] if len(sys.argv) > 1 else "{{DEFAULT_PROMPT}}"
        print(f"\n📝 User prompt: {user_prompt}")
        print("\n🤖 Agent processing...\n")

        result = await agent.execute(user_prompt)
        print(f"\n✅ Result:\n{result}")

    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)
    finally:
        await agent.cleanup()


if __name__ == "__main__":
    asyncio.run(main())

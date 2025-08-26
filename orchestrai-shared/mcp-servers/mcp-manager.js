const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class MCPManager {
  constructor() {
    this.servers = new Map();
    this.configPath = path.join(__dirname, 'mcp-config.json');
    this.config = this.loadConfig();
    this.startupLog = [];
  }

  loadConfig() {
    try {
      const configData = fs.readFileSync(this.configPath, 'utf8');
      return JSON.parse(configData);
    } catch (error) {
      console.error('Error loading MCP configuration:', error);
      return { mcpServers: {}, serverConfig: {}, securityConfig: {} };
    }
  }

  async startServer(serverName) {
    const serverConfig = this.config.mcpServers[serverName];
    
    if (!serverConfig) {
      throw new Error(`Server ${serverName} not found in configuration`);
    }

    if (!serverConfig.enabled) {
      console.log(`📋 Server ${serverName} is disabled, skipping...`);
      return null;
    }

    console.log(`🚀 Starting MCP server: ${serverName}`);
    
    try {
      // Prepare environment variables
      const env = { ...process.env };
      if (serverConfig.env) {
        Object.keys(serverConfig.env).forEach(key => {
          const value = serverConfig.env[key];
          // Replace ${VARIABLE} with actual environment variable
          env[key] = value.replace(/\$\{(\w+)\}/g, (match, varName) => {
            return process.env[varName] || match;
          });
        });
      }

      // Start the server process
      const serverProcess = spawn(serverConfig.command, serverConfig.args, {
        env,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // Set up logging
      serverProcess.stdout.on('data', (data) => {
        const message = `[${serverName}] ${data.toString()}`;
        console.log(message);
        this.startupLog.push({ server: serverName, type: 'stdout', message: data.toString(), timestamp: Date.now() });
      });

      serverProcess.stderr.on('data', (data) => {
        const message = data.toString().trim();
        
        // Filter out normal MCP server status messages that aren't actually errors
        const normalMessages = [
          'running on stdio',
          'Server running on stdio',
          'MCP Server running on stdio',
          'Knowledge Graph MCP Server running on stdio',
          'DataForSEO MCP server running on stdio',
          'Sequential Thinking MCP Server running on stdio',
          'Ref MCP Server running on stdio',
          'Secure MCP Filesystem Server running on stdio',
          'Started without allowed directories - waiting for client to provide roots via MCP protocol'
        ];
        
        const isNormalMessage = normalMessages.some(normalMsg => message.includes(normalMsg));
        
        if (isNormalMessage) {
          // Log as info instead of error for normal operation messages
          console.log(`[${serverName}] INFO: ${message}`);
          this.startupLog.push({ server: serverName, type: 'info', message, timestamp: Date.now() });
        } else {
          // Only log actual errors
          console.error(`[${serverName}] ERROR: ${message}`);
          this.startupLog.push({ server: serverName, type: 'stderr', message, timestamp: Date.now() });
        }
      });

      serverProcess.on('close', (code) => {
        console.log(`📋 MCP server ${serverName} exited with code ${code}`);
        this.servers.delete(serverName);
      });

      serverProcess.on('error', (error) => {
        console.error(`❌ Failed to start MCP server ${serverName}:`, error);
        this.servers.delete(serverName);
      });

      // Store server reference
      this.servers.set(serverName, {
        process: serverProcess,
        config: serverConfig,
        startTime: Date.now(),
        status: 'running'
      });

      console.log(`✅ MCP server ${serverName} started successfully`);
      return serverProcess;

    } catch (error) {
      console.error(`❌ Error starting MCP server ${serverName}:`, error);
      throw error;
    }
  }

  async testNotionConnection() {
    if (!process.env.NOTION_TOKEN) {
      return {
        success: false,
        error: 'NOTION_TOKEN not found in environment variables',
        setup_instructions: [
          '1. Go to https://www.notion.so/profile/integrations',
          '2. Create a new internal integration',
          '3. Copy the Internal Integration Token',
          '4. Add NOTION_TOKEN=your_token to your .env file',
          '5. Connect pages to your integration via the Access tab'
        ]
      };
    }

    try {
      // Test basic Notion API connectivity
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://api.notion.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return {
          success: true,
          message: 'Notion API connection successful',
          user: {
            name: userData.name,
            type: userData.type,
            id: userData.id
          }
        };
      } else {
        const error = await response.text();
        return {
          success: false,
          error: `Notion API error: ${response.status} - ${error}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`
      };
    }
  }

  async startAllEnabledServers() {
    const enabledServers = Object.keys(this.config.mcpServers)
      .filter(name => this.config.mcpServers[name].enabled)
      .sort((a, b) => {
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        const priorityA = priorityOrder[this.config.mcpServers[a].priority] || 2;
        const priorityB = priorityOrder[this.config.mcpServers[b].priority] || 2;
        return priorityA - priorityB;
      });

    console.log(`🧠 Starting ${enabledServers.length} MCP servers in priority order...`);
    
    const results = [];
    for (const serverName of enabledServers) {
      try {
        await this.startServer(serverName);
        results.push({ server: serverName, status: 'started' });
        
        // Brief pause between server starts
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({ server: serverName, status: 'failed', error: error.message });
      }
    }

    return results;
  }

  getServerStatus(serverName) {
    const server = this.servers.get(serverName);
    if (!server) {
      return { status: 'not_running' };
    }

    return {
      status: server.status,
      uptime: Date.now() - server.startTime,
      pid: server.process.pid,
      config: server.config
    };
  }

  getAllServersStatus() {
    const status = {};
    for (const [serverName, server] of this.servers) {
      status[serverName] = this.getServerStatus(serverName);
    }

    // Add configured but not running servers
    Object.keys(this.config.mcpServers).forEach(serverName => {
      if (!status[serverName]) {
        status[serverName] = { 
          status: this.config.mcpServers[serverName].enabled ? 'not_running' : 'disabled' 
        };
      }
    });

    return status;
  }

  async stopServer(serverName) {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} is not running`);
    }

    console.log(`🛑 Stopping MCP server: ${serverName}`);
    server.process.kill('SIGTERM');
    
    // Wait for graceful shutdown
    return new Promise((resolve) => {
      server.process.on('close', () => {
        console.log(`✅ MCP server ${serverName} stopped`);
        resolve();
      });
      
      // Force kill after 5 seconds
      setTimeout(() => {
        if (this.servers.has(serverName)) {
          server.process.kill('SIGKILL');
          this.servers.delete(serverName);
          resolve();
        }
      }, 5000);
    });
  }

  async stopAllServers() {
    const runningServers = Array.from(this.servers.keys());
    console.log(`🛑 Stopping ${runningServers.length} MCP servers...`);
    
    const stopPromises = runningServers.map(serverName => this.stopServer(serverName));
    await Promise.all(stopPromises);
    
    console.log('✅ All MCP servers stopped');
  }

  getStartupLog() {
    return this.startupLog;
  }

  clearStartupLog() {
    this.startupLog = [];
  }
}

module.exports = MCPManager;
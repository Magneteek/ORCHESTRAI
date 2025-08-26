# ORCHESTRAI Port Configuration

## Port Allocation Strategy

ORCHESTRAI uses the 5500-5599 port range to avoid conflicts with common development tools and services.

### Core Services

| Service | Port | Description |
|---------|------|-------------|
| **Frontend Dashboard** | 5500 | Next.js dashboard with D3.js visualizations |
| **Main Orchestrator** | 5501 | Core orchestration API and coordination |
| **WebSocket Server** | 5502 | Real-time updates and agent communication |
| **Memory API** | 5503 | Crystalline memory access API |
| **Pipeline Coordinator** | 5504 | Pipeline sharing and workflow management |

### Domain Services

| Service | Port | Description |
|---------|------|-------------|
| **SEO Domain** | 5510 | SEO specialist agents API |
| **Content Domain** | 5511 | Multi-language content creation |
| **Research Domain** | 5512 | Psychographic and semantic research |
| **Design Domain** | 5513 | UX/UI design and wireframing |
| **Development Domain** | 5514 | Web development and deployment |
| **Maintenance Domain** | 5515 | System maintenance and optimization |

### MCP Servers

| Service | Port | Description |
|---------|------|-------------|
| **Sequential Thinking MCP** | 5520 | Advanced problem-solving coordination |
| **Ref.tools MCP** | 5521 | Documentation access and fact-checking |
| **DATAforSEO MCP** | 5522 | Custom SEO data integration |
| **Memory MCP** | 5523 | Persistent knowledge graphs |
| **Template MCP** | 5524 | Global template access and analytics |

### Development Services

| Service | Port | Description |
|---------|------|-------------|
| **Redis** | 6379 | Default Redis port (standard) |
| **PostgreSQL** | 5432 | Default PostgreSQL port (standard) |
| **Test Server** | 5580 | Testing and development |
| **Mock Services** | 5590-5599 | Mock APIs for development |

## Environment Variables

Add these to your `.env` file:

```env
# Core Services
FRONTEND_PORT=5500
ORCHESTRATOR_PORT=5501
WEBSOCKET_PORT=5502
MEMORY_API_PORT=5503
PIPELINE_PORT=5504

# Domain Services
SEO_DOMAIN_PORT=5510
CONTENT_DOMAIN_PORT=5511
RESEARCH_DOMAIN_PORT=5512
DESIGN_DOMAIN_PORT=5513
DEVELOPMENT_DOMAIN_PORT=5514
MAINTENANCE_DOMAIN_PORT=5515

# MCP Services
SEQUENTIAL_THINKING_PORT=5520
REF_TOOLS_PORT=5521
DATAFORSEO_PORT=5522
MEMORY_MCP_PORT=5523
TEMPLATE_MCP_PORT=5524
```

## Quick Start Commands

```bash
# Start frontend dashboard
npm run dev                    # → http://localhost:5500

# Start individual services
npm run orchestrator          # → http://localhost:5501
npm run websocket            # → ws://localhost:5502
npm run memory-api           # → http://localhost:5503

# Check port availability
lsof -i :5500-5599           # Check if any ports are in use
```

## Port Conflict Resolution

If you encounter port conflicts:

1. **Check current usage**: `lsof -i :5500`
2. **Kill conflicting process**: `kill -9 <PID>`
3. **Use alternative ports**: Update `PORT_OFFSET=100` in `.env`

## Security Notes

- Ports 5500-5599 are in the ephemeral/dynamic port range
- No system services typically use these ports
- Safe for development and testing environments
- For production, use proper load balancers and reverse proxies

This configuration ensures ORCHESTRAI has a clean, organized port structure that won't conflict with your other development projects!
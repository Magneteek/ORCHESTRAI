# Debug Pipeline Execution

**Usage**: `/debug-pipeline [pipeline-name]`

Systematically debug pipeline execution issues in the ORCHESTRAI system.

## Debugging Workflow

### Phase 1: Pipeline Identification
1. Identify the specific pipeline having issues:
   - Content creation pipeline
   - Client intelligence pipeline
   - SEO research pipeline
   - Web development pipeline
   - Custom pipeline

### Phase 2: Error Collection
1. Check recent error logs
2. Identify failing agent(s)
3. Review tool call failures
4. Check memory system errors
5. Verify file path issues

### Phase 3: Component Testing
Test each pipeline component:
- [ ] Agent availability and loading
- [ ] Memory system connectivity
- [ ] File system permissions
- [ ] API key configuration
- [ ] Redis connection (if applicable)
- [ ] MCP server connectivity

### Phase 4: Data Flow Analysis
1. Trace data through pipeline stages
2. Verify input/output contracts
3. Check intermediate state
5. Confirm deliverable generation

### Phase 5: Root Cause Analysis
Common issues to check:
- **File Path Problems**: Check CLAUDE.md path validation rules
- **Memory Entity Conflicts**: Multiple entities for same client
- **Agent Coordination Failures**: Geometric orchestration issues
- **Template Access Errors**: Global template path problems
- **Over-Engineering**: Technology complexity mismatch
- **Parallel Execution Conflicts**: Race conditions or state issues

### Phase 6: Resolution
1. Apply targeted fix
2. Test isolated component
3. Test full pipeline
4. Verify deliverable quality
5. Update documentation if needed

## Output Format
Provide:
1. **Issue Summary**: Clear description of the problem
2. **Root Cause**: Technical explanation
3. **Resolution Steps**: What was done to fix it
4. **Prevention**: How to avoid this in the future
5. **Test Results**: Confirmation pipeline works now

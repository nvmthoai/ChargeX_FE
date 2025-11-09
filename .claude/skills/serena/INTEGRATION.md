# Serena MCP Integration Guide

This guide explains how to integrate Serena MCP with your ChargeX Frontend project using the ClaudeKit skills architecture.

## Project Structure

```
ChargeX_FE/
├── .claude/
│   └── skills/
│       └── serena/                    ← Serena MCP Skill
│           ├── README.md              ← Main documentation
│           ├── INTEGRATION.md         ← This file
│           ├── init.sh                ← Setup initialization script
│           └── config.json            ← (Optional) JSON config
│
├── .serena/                           ← Serena configuration
│   ├── project.yml                    ← Project-specific config
│   ├── serena_config.yml              ← Global Serena config
│   └── SETUP_GUIDE.md                 ← Setup guide
│
├── package.json
└── tsconfig.json
```

## Integration Steps

### 1. Run the Initialization Script

```bash
bash .claude/skills/serena/init.sh
```

This script will:
- ✅ Check for Python 3 installation
- ✅ Verify uv or pip is available
- ✅ Confirm .serena configuration files exist
- ✅ Validate project dependencies
- ✅ Display setup instructions

### 2. Install Node Dependencies

If not already installed:

```bash
npm install
```

### 3. Start Serena MCP Server

Choose one of these methods:

**Method A: Using uv (Recommended)**
```bash
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

**Method B: Using Claude Code**
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

**Method C: Global Installation**
```bash
pip install git+https://github.com/oraios/serena
serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### 4. Verify Installation

Check that Serena is running:

```bash
# In another terminal, check if Serena is listening
curl http://localhost:8000/health 2>/dev/null || echo "Serena not responding yet"
```

Or check logs for:
```
MCP server started on localhost:8000
```

## Usage with Claude Code

### Add Serena to Claude Code

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### List Registered MCP Servers

```bash
claude mcp list
```

### Remove Serena (if needed)

```bash
claude mcp remove serena
```

## Configuration Customization

### Project-Level Config

Edit `.serena/project.yml` to customize:
- Analyzed languages
- File patterns to include/exclude
- Analysis depth
- Technology stack
- Semantic analysis settings

Example:
```yaml
name: "ChargeX Frontend"
languages:
  - typescript
  - javascript

analysis:
  depth: "deep"
  cross_file_analysis: true
```

### Server-Level Config

Edit `.serena/serena_config.yml` to customize:
- Server port and host
- Performance settings
- Feature flags
- Logging configuration

Example:
```yaml
server:
  port: 8000
  host: "localhost"

features:
  semantic_search: true
  code_completion: true
  symbol_navigation: true
```

## Using Serena with Claude

Once Serena is running, you can ask Claude to:

### Code Analysis
- "Analyze the structure of the useAuctionLive hook"
- "Find all components that use the AuthContext"
- "Show potential performance issues in the Dashboard component"

### Navigation
- "Where is the API service defined?"
- "What files import from the utils directory?"
- "Find all React components in the src/app directory"

### Refactoring
- "Rename all instances of 'auctionId' to 'saleId'"
- "Move the API configuration to a separate constants file"
- "Extract common logic from these two hooks into a shared hook"

### Debugging
- "Find all console.log statements that should be removed"
- "Identify potential null pointer exceptions in this component"
- "Show all unhandled promise rejections"

### Documentation
- "Generate JSDoc comments for the API service"
- "Create a component tree diagram showing data flow"
- "Document all custom hooks and their dependencies"

## Environment Variables

Optional environment variables for fine-tuning:

```bash
# Server configuration
export SERENA_PORT=8000
export SERENA_HOST=localhost

# Debugging
export SERENA_DEBUG=false
export SERENA_LOG_LEVEL=info

# Performance
export SERENA_CACHE_SIZE=524288000  # ~500MB

# Analysis
export SERENA_MAX_FILE_SIZE=10485760  # 10MB
export SERENA_ANALYSIS_TIMEOUT=30000   # 30 seconds
```

## Troubleshooting Integration

### Issue: Serena MCP not found in Claude Code

**Solution 1**: Verify installation
```bash
# Check if command exists
which serena
# or
which uvx
```

**Solution 2**: Re-register with Claude Code
```bash
claude mcp remove serena
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### Issue: "Address already in use" error

The default port 8000 might be occupied.

**Solution**: Change port in `.serena/serena_config.yml`:
```yaml
server:
  port: 8001  # or any available port
```

Then use that port in startup:
```bash
SERENA_PORT=8001 serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### Issue: TypeScript symbols not recognized

**Solution**: Ensure TypeScript is properly configured:
```bash
# Check tsconfig.json
cat tsconfig.json

# Rebuild TypeScript types
npx tsc --noEmit
```

### Issue: Performance is slow

**Solutions**:
1. Reduce analysis depth in `.serena/project.yml`:
   ```yaml
   analysis:
     depth: "shallow"
   ```

2. Exclude large directories in `.serena/project.yml`:
   ```yaml
   exclude_patterns:
     - "node_modules/**"
     - "dist/**"
     - ".next/**"
   ```

3. Increase cache size in `.serena/serena_config.yml`:
   ```yaml
   performance:
     cache_size_mb: 1000
   ```

## File Organization for ClaudeKit

The Serena skill is organized following ClaudeKit conventions:

```
.claude/skills/serena/
├── README.md           # Main skill documentation
├── INTEGRATION.md      # This integration guide
├── init.sh             # Initialization script
└── config.json         # (Optional) Configuration template
```

Related configuration files:
```
.serena/
├── project.yml         # Project-specific settings
├── serena_config.yml   # Server configuration
└── SETUP_GUIDE.md      # Detailed setup guide
```

## ClaudeKit Skills Integration

This Serena skill integrates with other ClaudeKit skills:

- **code-review**: Use Serena for deep code analysis before reviews
- **mcp-builder**: Build custom MCP extensions for Serena
- **debugging**: Use Serena to trace execution paths
- **claude-code**: Leverage Serena within Claude Code environment

## Advanced Usage

### Custom Serena Configuration

Create project-specific settings by modifying `.serena/project.yml`:

```yaml
name: "ChargeX Frontend"
description: "Advanced React + TypeScript application"

# Custom file patterns
include_patterns:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.css"
  - "config/**/*.json"

# Technology stack
technologies:
  - React 19
  - Vite 7
  - TypeScript 5.8
  - TailwindCSS 4
  - Ant Design 5
  - React Router 7
  - TanStack Query 5

# Advanced analysis
analysis:
  depth: "deep"
  cross_file_analysis: true
  track_imports: true
  index_symbols: true
  semantic_analysis: true

# Security
security:
  read_only: false
  allowed_operations:
    - "read"
    - "write"
    - "analyze"
    - "refactor"
```

### Integrating with CI/CD

Use Serena in your build pipeline:

```bash
#!/bin/bash
# .github/workflows/code-analysis.yml compatible script

# Start Serena server
serena start-mcp-server --context cli --project . &
SERENA_PID=$!

# Wait for server to start
sleep 2

# Run analysis
serena analyze --depth deep --output reports/analysis.json

# Stop server
kill $SERENA_PID
```

### Batch Code Analysis

Analyze multiple aspects of your codebase:

```bash
# Analyze specific pattern
serena search "useEffect" --in-files "**/*.tsx"

# Find all imports from a module
serena search "import.*from.*api" --regex

# Check for deprecated usage
serena search "deprecated" --in-comments
```

## Next Steps

1. ✅ **Run initialization**: `bash .claude/skills/serena/init.sh`
2. ✅ **Start Serena**: Use one of the startup methods above
3. ✅ **Configure for your needs**: Edit `.serena/project.yml`
4. ✅ **Integrate with Claude**: Add as MCP server to Claude Code
5. ✅ **Start using**: Ask Claude questions about your code

## Support & Resources

- **Serena GitHub**: https://github.com/oraios/serena
- **ClaudeKit Skills**: https://github.com/mrgoonie/claudekit-skills
- **MCP Documentation**: https://modelcontextprotocol.io
- **Setup Guide**: `.serena/SETUP_GUIDE.md`

---

**Integration Version**: 1.0.0
**Last Updated**: 2025-11-09
**Compatible With**: Serena Latest, ClaudeKit, Claude Code

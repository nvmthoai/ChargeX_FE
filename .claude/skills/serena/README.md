# Serena MCP Skill for ClaudeKit

Serena is a powerful open-source MCP (Model Context Protocol) server that provides semantic code analysis, symbol-level editing, and AI-assisted coding capabilities for your ChargeX Frontend project.

## Overview

Serena transforms Claude into a full-fledged coding agent with:
- 🔍 Semantic code analysis and understanding
- 📍 Symbol-level navigation and editing
- 🔗 Cross-file analysis and refactoring
- 🤖 IDE-like features for better code comprehension
- 📚 Multi-language support (TypeScript, JavaScript, Python, Java, etc.)

## Prerequisites

- Python 3.8+
- `uv` package manager (recommended) or `pip`
- Git

## Installation

### Method 1: Using Claude Code (Recommended)

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### Method 2: Manual Installation with uv

```bash
# Install uv if you don't have it
curl -LsSf https://astral.sh/uv/install.sh | sh

# Start Serena MCP server
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /path/to/project
```

### Method 3: Install Globally with pip

```bash
# Install Serena
pip install git+https://github.com/oraios/serena

# Start the MCP server
serena start-mcp-server --context ide-assistant --project /path/to/project
```

## Configuration

### Project Configuration File

The project uses `.serena/project.yml` to configure Serena for your specific project:

```yaml
name: "ChargeX Frontend"
project_path: "."
languages:
  - typescript
  - javascript
  - css
  - json
  - html

technologies:
  - React 19
  - Vite 7
  - TypeScript 5.8
  - TailwindCSS 4
  - Ant Design 5
```

### Global Configuration File

The `.serena/serena_config.yml` file controls global Serena behavior:

```yaml
server:
  port: 8000
  host: "localhost"

analysis:
  semantic_analysis: true
  cross_file_analysis: true
  track_imports: true

features:
  semantic_search: true
  code_completion: true
  symbol_navigation: true
  error_detection: true
```

## Usage Examples

### 1. Semantic Code Search

```
Find all React components that use the useAuctionLive hook
```

### 2. Symbol Navigation

```
Show me all files that import the AuthContext
```

### 3. Cross-File Analysis

```
What components depend on the API service?
```

### 4. Refactoring Assistance

```
Refactor all useState hooks to use TypeScript generics for better type safety
```

### 5. Error Detection

```
Find all potential null reference errors in the codebase
```

## Features for ChargeX Frontend

✅ **Code Analysis**
- TypeScript type checking across the project
- React component dependency analysis
- Hook usage tracking
- Import/export analysis

✅ **Symbol Navigation**
- Find component definitions
- Track prop passing through component trees
- Identify unused imports
- Navigate complex dependency chains

✅ **Refactoring**
- Rename symbols across multiple files
- Update imports when moving files
- Consolidate similar utilities
- Apply patterns consistently

✅ **Development Assistance**
- Suggest component composition patterns
- Identify performance issues (unnecessary re-renders)
- Check for accessibility problems
- Validate TypeScript types

## File Structure

```
ChargeX_FE/
├── .claude/
│   └── skills/
│       └── serena/           # This Serena skill directory
│           ├── README.md     # This file
│           └── init.sh       # Initialization script
│
├── .serena/
│   ├── project.yml          # Project configuration
│   ├── serena_config.yml    # Global settings
│   └── SETUP_GUIDE.md       # Detailed setup guide
│
├── src/
│   ├── app/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── components/
│   ├── lib/
│   └── ...
└── package.json
```

## Environment Variables

Optional environment variables for Serena:

```bash
# Configure Serena server port
export SERENA_PORT=8000

# Enable debug logging
export SERENA_DEBUG=true

# Set log level (debug, info, warn, error)
export SERENA_LOG_LEVEL=info

# Configure max file size to analyze
export SERENA_MAX_FILE_SIZE=10485760  # 10MB in bytes
```

## Advanced Configuration

### Enable Read-Only Mode

To prevent accidental modifications:

Edit `.serena/project.yml`:
```yaml
read_only: true
```

### Customize Analysis Depth

Edit `.serena/project.yml`:
```yaml
analysis:
  depth: "deep"  # or "shallow" for faster analysis
```

### Add Custom File Patterns

Edit `.serena/project.yml`:
```yaml
include_patterns:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.custom"
```

### Exclude Additional Directories

Edit `.serena/project.yml`:
```yaml
exclude_patterns:
  - "node_modules/**"
  - "dist/**"
  - ".next/**"
  - "coverage/**"
```

## Troubleshooting

### Issue: "serena command not found"

**Solution**: Install globally or use uvx:
```bash
# Option 1: Use uvx (no installation required)
uvx --from git+https://github.com/oraios/serena serena --version

# Option 2: Install with pip
pip install git+https://github.com/oraios/serena
```

### Issue: "Port 8000 already in use"

**Solution**: Change port in `.serena/serena_config.yml`:
```yaml
server:
  port: 8001
```

### Issue: "Module not found" errors

**Solution**: Ensure dependencies are installed:
```bash
cd /Users/thoai/Desktop/wdp_FE/ChargeX_FE
npm install
```

### Issue: Serena won't analyze certain files

**Solution**: Check file patterns in `.serena/project.yml`:
```yaml
include_patterns:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
```

### Issue: Slow analysis performance

**Solution**: Reduce analysis depth or exclude more directories:
```yaml
analysis:
  depth: "shallow"

exclude_patterns:
  - "node_modules/**"
  - "dist/**"
  - ".next/**"
```

## Integration with Claude Code

When using Claude Code (via VSCode extension):

```bash
# Setup as MCP server in Claude Code
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"

# Verify it's registered
claude mcp list
```

## Performance Tips

1. **Increase cache size** for faster subsequent analyses:
   ```yaml
   performance:
     cache_size_mb: 1000  # Increase from default 500
   ```

2. **Use shallow analysis** for quick feedback:
   ```yaml
   analysis:
     depth: "shallow"
   ```

3. **Exclude large directories**:
   ```yaml
   exclude_patterns:
     - "node_modules/**"
     - ".git/**"
     - "dist/**"
   ```

4. **Index only essential files**:
   ```yaml
   include_patterns:
     - "src/**/*.ts"
     - "src/**/*.tsx"
   ```

## Resources

- **Official GitHub**: https://github.com/oraios/serena
- **MCP Documentation**: https://modelcontextprotocol.io
- **MCP Registry**: https://mcp.nacos.io
- **ClaudeKit Skills**: https://github.com/mrgoonie/claudekit-skills

## Contributing

To improve this Serena skill:
1. Test configurations and document results
2. Share performance optimizations
3. Report bugs or missing features
4. Suggest improvements for ChargeX Frontend

## Version Info

- **Serena**: Latest from GitHub
- **ClaudeKit Skill Version**: 1.0.0
- **Last Updated**: 2025-11-09
- **Tested On**: macOS, ChargeX Frontend (React 19 + TypeScript 5.8)

---

For more information about Serena capabilities and advanced usage, visit the [official Serena documentation](https://github.com/oraios/serena).

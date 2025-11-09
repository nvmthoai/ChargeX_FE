# Serena MCP Setup Guide - ChargeX Frontend

## Overview
Serena is a powerful open-source MCP server that provides semantic code analysis, symbol-level editing, and AI-assisted coding capabilities for your ChargeX Frontend project.

## ✅ Configuration Completed

The following files have been created for your project:
- `.serena/project.yml` - Project-specific configuration
- `.serena/serena_config.yml` - Global Serena settings

## Installation & Setup

### Option 1: Setup with Claude Code (Recommended)

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### Option 2: Manual Installation

1. **Install Python (if not already installed)**
   ```bash
   # macOS with Homebrew
   brew install python3
   ```

2. **Install Serena using uv or pip**
   ```bash
   # Using uv (recommended)
   uvx --from git+https://github.com/oraios/serena serena start-mcp-server

   # Or using pip
   pip install git+https://github.com/oraios/serena
   ```

3. **Start Serena MCP Server**
   ```bash
   serena start-mcp-server --context ide-assistant --project /Users/thoai/Desktop/wdp_FE/ChargeX_FE
   ```

## Features Enabled

✨ **Semantic Code Analysis**
- Deep code understanding across TypeScript/JavaScript files
- Symbol indexing and cross-file analysis
- Import/export tracking

🔍 **Code Navigation**
- Find symbols and definitions
- Navigate imports and exports
- View code dependencies

📝 **Editing Capabilities**
- Symbol-level code editing
- Semantic-aware modifications
- Multi-file refactoring support

🤖 **AI Integration**
- IDE-assistant mode for better context
- Code suggestions and completions
- Documentation generation support

## Project Configuration

### Included Technologies
- React 19
- TypeScript 5.8
- Vite 7
- TailwindCSS 4
- Ant Design 5
- React Router 7
- TanStack Query 5
- Socket.io Client

### File Types Analyzed
- TypeScript (`*.ts`)
- TSX Components (`*.tsx`)
- JavaScript (`*.js`)
- JSON Configuration (`*.json`)
- CSS Styles (`*.css`)
- HTML Templates (`*.html`)

### Excluded Directories
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.git/` - Version control
- `coverage/` - Test coverage

## Configuration Options

### Read-Only Mode
To enable read-only mode (analysis only, no modifications):

Edit `.serena/project.yml`:
```yaml
read_only: true
```

### Change Analysis Depth
Modify in `.serena/project.yml`:
```yaml
analysis:
  depth: "shallow"  # or "deep" for comprehensive analysis
```

### Customize File Patterns
Edit `.serena/project.yml` to add/remove file patterns:
```yaml
include_patterns:
  - "**/*.ts"
  - "**/*.tsx"
```

## Usage Examples

### Activate Serena for Your Project
```bash
# Serena will automatically activate with your project path
serena start-mcp-server --context ide-assistant --project /Users/thoai/Desktop/wdp_FE/ChargeX_FE
```

### Semantic Search
Ask Serena to find all components that use a specific hook:
> "Find all components using the useAuctionLive hook"

### Code Navigation
Request symbol definitions and references:
> "Show me all usages of the AuthContext in the project"

### Refactoring
Request large-scale changes:
> "Refactor all React hooks to use TypeScript generics"

## Troubleshooting

### Issue: Module not found
```bash
# Ensure dependencies are installed
cd /Users/thoai/Desktop/wdp_FE/ChargeX_FE
npm install
```

### Issue: Serena server won't start
```bash
# Check Python installation
python3 --version

# Try installing with pip
pip install --upgrade git+https://github.com/oraios/serena
```

### Issue: Port already in use
```bash
# Change port in serena_config.yml
server:
  port: 8001  # Change from default 8000
```

## Documentation & Resources

- **Official Repository**: https://github.com/oraios/serena
- **MCP Registry**: https://mcp.nacos.io
- **Model Context Protocol**: https://modelcontextprotocol.io

## Next Steps

1. ✅ Configuration files created
2. ⏭️ Install Serena using one of the methods above
3. ⏭️ Activate the project with your preferred AI assistant
4. ⏭️ Start using Serena's analysis and editing capabilities

## Support

For issues and feature requests:
- GitHub Issues: https://github.com/oraios/serena/issues
- Check the configuration files if behavior is unexpected

---

**Setup Date**: 2025-11-09
**Project**: ChargeX Frontend (React + Vite + TypeScript)
**Serena Version**: Latest

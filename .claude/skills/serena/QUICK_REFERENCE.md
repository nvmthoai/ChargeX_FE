# Serena MCP Quick Reference Card

Quick commands and configurations for Serena MCP with your ChargeX Frontend project.

## 🚀 Installation & Setup

```bash
# 1. Install uv (one-time setup)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Install Node dependencies
cd /Users/thoai/Desktop/wdp_FE/ChargeX_FE
npm install

# 3. Run initialization check
bash .claude/skills/serena/init.sh
```

## ▶️ Starting Serena

### Using uv (Recommended)
```bash
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### Using pip (Global installation)
```bash
pip install git+https://github.com/oraios/serena
serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### With Claude Code
```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

## 🔧 Configuration Files

### Project Configuration
**File**: `.serena/project.yml`
```bash
# View current configuration
cat .serena/project.yml

# Edit project configuration
nano .serena/project.yml  # or your preferred editor
```

### Server Configuration
**File**: `.serena/serena_config.yml`
```bash
# View server settings
cat .serena/serena_config.yml

# Edit server configuration
nano .serena/serena_config.yml
```

## 💡 Usage Examples

### Code Analysis
```
Ask Claude:
  "Analyze the structure of the Dashboard component"
  "Find all components using TanStack Query"
  "Show me the API service dependencies"
```

### Symbol Navigation
```
Ask Claude:
  "Find all usages of the AuthContext"
  "Where is the useAuctionLive hook defined?"
  "Show all imports from src/lib/api"
```

### Refactoring
```
Ask Claude:
  "Rename all instances of 'auctionId' to 'saleId'"
  "Extract the API configuration to constants"
  "Move all hooks to src/app/hooks directory"
```

### Performance
```
Ask Claude:
  "Find components with unnecessary re-renders"
  "Identify unused dependencies"
  "Show potential performance bottlenecks"
```

## 📋 Common Commands

```bash
# Check Serena version
uvx --from git+https://github.com/oraios/serena serena --version

# Get help
uvx --from git+https://github.com/oraios/serena serena --help

# Check if server is running
curl http://localhost:8000/health

# View Serena logs (if available)
# Depends on configuration - check .serena/serena_config.yml

# List registered MCP servers (Claude Code)
claude mcp list

# Remove Serena from Claude Code (if needed)
claude mcp remove serena
```

## ⚙️ Configuration Shortcuts

### Enable Read-Only Mode (No modifications)
Edit `.serena/project.yml`:
```yaml
read_only: true
```

### Use Shallow Analysis (Faster)
Edit `.serena/project.yml`:
```yaml
analysis:
  depth: "shallow"
```

### Change Server Port
Edit `.serena/serena_config.yml`:
```yaml
server:
  port: 8001  # Change from 8000
```

### Exclude More Directories
Edit `.serena/project.yml`:
```yaml
exclude_patterns:
  - "node_modules/**"
  - "dist/**"
  - "coverage/**"
  - ".next/**"
```

### Increase Cache Size
Edit `.serena/serena_config.yml`:
```yaml
performance:
  cache_size_mb: 1000  # Default is 500
```

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 8000 in use | Change port in `.serena/serena_config.yml` |
| "serena: command not found" | Install uv: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Module not found errors | Run `npm install` in project directory |
| Slow analysis | Set `analysis.depth: "shallow"` in config |
| Types not recognized | Run `npx tsc --noEmit` to check TypeScript |
| Server not responding | Verify port 8000 is available: `lsof -i :8000` |

## 📁 Project Structure

```
ChargeX_FE/
├── .claude/
│   └── skills/
│       └── serena/              ← Serena skill (ClaudeKit)
│           ├── README.md
│           ├── INTEGRATION.md
│           ├── init.sh
│           ├── config.json
│           └── QUICK_REFERENCE.md  ← You are here
│
├── .serena/                     ← Serena configuration
│   ├── project.yml
│   ├── serena_config.yml
│   └── SETUP_GUIDE.md
│
├── SERENA_SETUP_COMPLETE.md     ← Setup summary
├── src/
├── package.json
└── tsconfig.json
```

## 🎯 Supported File Types

✅ Analyzed:
- `.ts` - TypeScript files
- `.tsx` - React components
- `.js` - JavaScript files
- `.json` - Configuration files
- `.css` - Stylesheets

❌ Excluded:
- `node_modules/` - Dependencies
- `dist/` - Build output
- `.git/` - Version control

## 📚 Learn More

| Topic | File |
|-------|------|
| Full documentation | [README.md](./README.md) |
| Integration guide | [INTEGRATION.md](./INTEGRATION.md) |
| Setup details | [../.serena/SETUP_GUIDE.md](../../.serena/SETUP_GUIDE.md) |
| Setup summary | [../SERENA_SETUP_COMPLETE.md](../../SERENA_SETUP_COMPLETE.md) |

## 🔗 External Resources

- **Serena GitHub**: https://github.com/oraios/serena
- **MCP Documentation**: https://modelcontextprotocol.io
- **ClaudeKit**: https://github.com/mrgoonie/claudekit-skills
- **Claude Code**: https://docs.claude.com

## ⏱️ Estimated Setup Time

- **Installation**: 5-10 minutes (including uv installation)
- **Dependencies**: 2-5 minutes (npm install)
- **Configuration**: Already done! 0 minutes
- **First Run**: 1-2 minutes (first analysis)

**Total**: ~10-20 minutes for full setup

## 🎉 Success Indicators

✅ Serena is working if:
- `curl http://localhost:8000/health` returns a response
- Serena console shows "MCP server started"
- Claude can answer questions about your code
- Code analysis completes without errors

## 🆘 Getting Help

1. **Check logs**: Look for error messages in the console
2. **Verify configuration**: `cat .serena/project.yml`
3. **Check prerequisites**: `bash .claude/skills/serena/init.sh`
4. **Read guides**: See links in "Learn More" section above
5. **GitHub issues**: https://github.com/oraios/serena/issues

---

**Version**: 1.0.0
**Last Updated**: 2025-11-09
**Project**: ChargeX Frontend
**Status**: ✅ Ready to use

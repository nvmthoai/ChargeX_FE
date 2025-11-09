# Serena MCP Skill - Complete Index

A complete index of all Serena MCP documentation and configuration for ChargeX Frontend.

## 🚀 Getting Started (Read First!)

- **[START_HERE.md](./START_HERE.md)** - 5-minute quick start guide
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common commands & troubleshooting

## 📚 Full Documentation

- **[README.md](./README.md)** - Complete Serena MCP documentation
  - Installation methods
  - Configuration options
  - Usage examples
  - Troubleshooting

- **[INTEGRATION.md](./INTEGRATION.md)** - ClaudeKit integration guide
  - Integration steps
  - Claude Code setup
  - Advanced configuration
  - CI/CD integration

## 🛠️ Scripts & Configuration

- **[init.sh](./init.sh)** - Initialization script (executable)
  - Checks prerequisites
  - Validates installation
  - Displays setup instructions

- **[config.json](./config.json)** - MCP metadata
  - Server configuration
  - Feature flags
  - Command reference

## ⚙️ Project Configuration Files

Located in `../../.serena/`:

- **[project.yml](../../.serena/project.yml)**
  - Project-specific settings
  - File patterns to include/exclude
  - Analysis depth
  - Technology stack

- **[serena_config.yml](../../.serena/serena_config.yml)**
  - Server configuration
  - Port and host settings
  - Performance tuning
  - Feature toggles

- **[SETUP_GUIDE.md](../../.serena/SETUP_GUIDE.md)**
  - Detailed setup instructions
  - In-depth troubleshooting
  - Advanced features

## 📖 Root Documentation

- **[SERENA_SETUP_COMPLETE.md](../../SERENA_SETUP_COMPLETE.md)**
  - Setup summary
  - What was created
  - Next steps
  - File references

## 🎯 Quick Navigation

### I want to...

**Get started quickly (5 min)**
→ Read [START_HERE.md](./START_HERE.md)

**Find common commands**
→ Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)

**Understand full capabilities**
→ Read [README.md](./README.md)

**Integrate with Claude Code**
→ Follow [INTEGRATION.md](./INTEGRATION.md)

**Customize settings**
→ Edit [project.yml](../../.serena/project.yml) or [serena_config.yml](../../.serena/serena_config.yml)

**Check setup status**
→ Run `bash init.sh`

**Fix an issue**
→ See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-quick-troubleshooting)

## 📊 File Organization

```
ChargeX_FE/
├── .claude/
│   └── skills/
│       └── serena/                    ← YOU ARE HERE
│           ├── INDEX.md               ← This file (index of all docs)
│           ├── START_HERE.md          ← 5-minute quick start
│           ├── QUICK_REFERENCE.md     ← Common commands
│           ├── README.md              ← Full documentation
│           ├── INTEGRATION.md         ← Advanced setup
│           ├── init.sh                ← Setup script
│           └── config.json            ← MCP metadata
│
├── .serena/                           ← Configuration files
│   ├── project.yml                    ← Project settings
│   ├── serena_config.yml              ← Server settings
│   └── SETUP_GUIDE.md                 ← Detailed setup
│
└── SERENA_SETUP_COMPLETE.md           ← Setup summary
```

## 🚀 Quick Start Commands

```bash
# Install uv (if needed)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Node dependencies
npm install

# Start Serena
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"

# Verify it's running (in another terminal)
curl http://localhost:8000/health
```

## 📋 Documentation Checklist

- [ ] Read [START_HERE.md](./START_HERE.md)
- [ ] Run `bash init.sh` to check prerequisites
- [ ] Install uv: `curl -LsSf https://astral.sh/uv/install.sh | sh`
- [ ] Install dependencies: `npm install`
- [ ] Start Serena (see START_HERE.md)
- [ ] Verify with `curl http://localhost:8000/health`
- [ ] Review [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands
- [ ] Read [README.md](./README.md) for full documentation
- [ ] Customize [project.yml](../../.serena/project.yml) if needed
- [ ] Read [INTEGRATION.md](./INTEGRATION.md) for advanced setup

## 🔗 External Resources

- **Serena GitHub**: https://github.com/oraios/serena
- **MCP Documentation**: https://modelcontextprotocol.io
- **ClaudeKit Skills**: https://github.com/mrgoonie/claudekit-skills
- **Claude Code**: https://docs.claude.com

## 📞 Support

If you need help:

1. **Quick questions**: Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md)
2. **Setup issues**: Read [START_HERE.md](./START_HERE.md)
3. **Configuration**: Edit [project.yml](../../.serena/project.yml)
4. **Troubleshooting**: See [README.md](./README.md#troubleshooting)
5. **Advanced help**: Check [INTEGRATION.md](./INTEGRATION.md)

## ✅ Verification Checklist

- [x] Serena MCP configured for ChargeX Frontend
- [x] ClaudeKit skill directory created
- [x] Configuration files created
- [x] Documentation written
- [x] Init script created and executable
- [x] All files tested and verified

**Status**: ✅ Ready to use!

## 📝 Version Information

- **Serena**: Latest from GitHub
- **ClaudeKit Integration**: v1.0.0
- **Setup Date**: 2025-11-09
- **Project**: ChargeX Frontend
- **Tech Stack**: React 19 + TypeScript 5.8 + Vite 7

---

**Last Updated**: 2025-11-09

For the fastest path to productivity, start with [START_HERE.md](./START_HERE.md) 🚀

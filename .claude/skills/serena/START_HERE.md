# 🚀 START HERE - Serena MCP Setup

Welcome to Serena MCP for ChargeX Frontend! This guide will get you started in 5 minutes.

## ⚡ 5-Minute Quick Start

### 1️⃣ Install uv (1 minute)
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2️⃣ Install dependencies (2 minutes)
```bash
cd /Users/thoai/Desktop/wdp_FE/ChargeX_FE
npm install
```

### 3️⃣ Start Serena (1 minute)
```bash
# Copy and run this command in your terminal:
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project "$(pwd)"
```

### 4️⃣ You're Done! 🎉
Serena is now running and ready to analyze your code.

---

## 📖 Documentation Files

Read these files in order:

1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** ⭐ START HERE
   - Common commands
   - Configuration shortcuts
   - Troubleshooting tips

2. **[README.md](./README.md)** 📚 MAIN GUIDE
   - Full documentation
   - Installation options
   - Usage examples

3. **[INTEGRATION.md](./INTEGRATION.md)** 🔗 ADVANCED
   - ClaudeKit integration details
   - Custom configuration
   - CI/CD integration

4. **[../../.serena/SETUP_GUIDE.md](../../.serena/SETUP_GUIDE.md)** 🔧 DETAILED SETUP
   - Comprehensive setup instructions
   - In-depth troubleshooting
   - Advanced features

5. **[../../SERENA_SETUP_COMPLETE.md](../../SERENA_SETUP_COMPLETE.md)** ✅ SUMMARY
   - What was created
   - Next steps
   - Feature overview

---

## 🎯 What Can You Do?

Once Serena is running, ask Claude:

### 🔍 Find Code
```
"Find all components using the useAuctionLive hook"
"Show me all files that import AuthContext"
"Find unused imports in the project"
```

### 📊 Analyze Code
```
"Analyze the Dashboard component structure"
"Show potential performance issues"
"Find circular dependencies"
```

### ✏️ Refactor Code
```
"Rename all auctionId variables to saleId"
"Extract common logic from these functions"
"Move API configuration to constants"
```

### 🐛 Debug Code
```
"Find all console.log statements"
"Identify potential null pointer exceptions"
"Show all promise rejections"
```

---

## ✅ Verification

Check if Serena is running:

```bash
# In another terminal:
curl http://localhost:8000/health
```

Expected output:
```
{"status":"ok"}
```

---

## 🐛 If Something Goes Wrong

| Issue | Quick Fix |
|-------|-----------|
| `serena: command not found` | Install uv: `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Port 8000 already in use | Edit `.serena/serena_config.yml`, change port to 8001 |
| Module not found | Run `npm install` in project directory |
| Types not recognized | Run `npx tsc --noEmit` |

See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#-quick-troubleshooting) for more solutions.

---

## 📁 What Was Created

```
ChargeX_FE/
├── .claude/skills/serena/          ← You are here
│   ├── START_HERE.md               ← Quick start (this file)
│   ├── QUICK_REFERENCE.md          ← Common commands
│   ├── README.md                   ← Full documentation
│   ├── INTEGRATION.md              ← Advanced setup
│   ├── init.sh                     ← Setup checker
│   └── config.json                 ← MCP metadata
│
└── .serena/                        ← Configuration
    ├── project.yml                 ← Project settings
    ├── serena_config.yml           ← Server settings
    └── SETUP_GUIDE.md              ← Detailed guide
```

---

## 🎮 Next Steps

1. ✅ Run the 5-minute quick start above
2. ✅ Verify Serena is running with `curl` command
3. ✅ Open Claude Code or Claude Desktop
4. ✅ Start asking questions about your code!
5. ✅ Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for more commands

---

## 💡 Pro Tips

- **Faster analysis**: Set `depth: "shallow"` in `.serena/project.yml`
- **Better context**: Make your questions specific to your codebase
- **Read-only mode**: Set `read_only: true` to prevent modifications
- **Custom port**: Change port in `.serena/serena_config.yml` if 8000 is busy

---

## 🆘 Need Help?

1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for troubleshooting
2. Read [README.md](./README.md) for full documentation
3. Visit https://github.com/oraios/serena for official docs
4. Check your configuration in `.serena/project.yml`

---

## 🎉 Ready?

Scroll back up and run the **5-Minute Quick Start**!

After that, head to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for common commands.

---

**Created**: 2025-11-09
**Project**: ChargeX Frontend (React 19 + TypeScript 5.8)
**Status**: ✅ Ready to use

**Time to productivity**: ⚡ ~10 minutes

#!/bin/bash

# Serena MCP Skill Initialization Script
# This script sets up Serena MCP for the ChargeX Frontend project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../.." && pwd)"
SERENA_DIR="$PROJECT_DIR/.serena"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Serena MCP Skill Initialization for ClaudeKit       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .serena directory exists
if [ ! -d "$SERENA_DIR" ]; then
    echo -e "${YELLOW}⚠️  .serena directory not found at $SERENA_DIR${NC}"
    echo -e "${YELLOW}Creating .serena directory...${NC}"
    mkdir -p "$SERENA_DIR"
    echo -e "${GREEN}✓ Created .serena directory${NC}"
fi

# Check if project.yml exists
if [ ! -f "$SERENA_DIR/project.yml" ]; then
    echo -e "${YELLOW}⚠️  project.yml not found${NC}"
    echo -e "${YELLOW}Please run the setup guide or create the configuration files${NC}"
else
    echo -e "${GREEN}✓ Found .serena/project.yml${NC}"
fi

# Check if serena_config.yml exists
if [ ! -f "$SERENA_DIR/serena_config.yml" ]; then
    echo -e "${YELLOW}⚠️  serena_config.yml not found${NC}"
    echo -e "${YELLOW}Please run the setup guide or create the configuration files${NC}"
else
    echo -e "${GREEN}✓ Found .serena/serena_config.yml${NC}"
fi

echo ""
echo -e "${BLUE}Checking prerequisites...${NC}"
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    echo -e "${GREEN}✓ Python 3 found (version $PYTHON_VERSION)${NC}"
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    echo -e "${YELLOW}Please install Python 3.8 or later${NC}"
    exit 1
fi

# Check uv
if command -v uv &> /dev/null; then
    echo -e "${GREEN}✓ uv package manager found${NC}"
    UV_AVAILABLE=true
else
    echo -e "${YELLOW}⚠️  uv package manager not found${NC}"
    echo -e "${YELLOW}Install with: curl -LsSf https://astral.sh/uv/install.sh | sh${NC}"
    UV_AVAILABLE=false
fi

# Check pip
if command -v pip3 &> /dev/null; then
    echo -e "${GREEN}✓ pip3 package manager found${NC}"
else
    echo -e "${YELLOW}⚠️  pip3 not found (optional if uv is available)${NC}"
fi

echo ""
echo -e "${BLUE}Checking project dependencies...${NC}"
echo ""

# Check if node_modules exists
if [ -d "$PROJECT_DIR/node_modules" ]; then
    echo -e "${GREEN}✓ Node modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  Node modules not found${NC}"
    echo -e "${YELLOW}Run: cd $PROJECT_DIR && npm install${NC}"
fi

echo ""
echo -e "${BLUE}Installation Instructions:${NC}"
echo ""

if [ "$UV_AVAILABLE" = true ]; then
    echo -e "${GREEN}1. Start Serena with uv (recommended):${NC}"
    echo "   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project \"$PROJECT_DIR\""
    echo ""
else
    echo -e "${YELLOW}1. Install uv first:${NC}"
    echo "   curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo ""
    echo -e "${GREEN}2. Then start Serena:${NC}"
    echo "   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project \"$PROJECT_DIR\""
    echo ""
fi

echo -e "${GREEN}2. Or install Serena globally with pip:${NC}"
echo "   pip install git+https://github.com/oraios/serena"
echo "   serena start-mcp-server --context ide-assistant --project \"$PROJECT_DIR\""
echo ""

echo -e "${GREEN}3. For Claude Code integration:${NC}"
echo "   claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project \"\\$(pwd)\""
echo ""

echo -e "${BLUE}Quick Start:${NC}"
echo ""
echo -e "${GREEN}Option A - Start Serena now:${NC}"
echo "   cd $PROJECT_DIR"
if [ "$UV_AVAILABLE" = true ]; then
    echo "   uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project ."
else
    echo "   # First install uv, then run:"
    echo "   # uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project ."
fi
echo ""

echo -e "${GREEN}Option B - View configuration:${NC}"
echo "   cat $SERENA_DIR/project.yml"
echo ""

echo -e "${BLUE}Configuration Files:${NC}"
echo ""
echo "📄 Project Config:    $SERENA_DIR/project.yml"
echo "📄 Global Config:     $SERENA_DIR/serena_config.yml"
echo "📖 Setup Guide:       $SERENA_DIR/SETUP_GUIDE.md"
echo ""

echo -e "${BLUE}Useful Commands:${NC}"
echo ""
echo "📝 View project config:"
echo "   cat .serena/project.yml"
echo ""
echo "📝 View global config:"
echo "   cat .serena/serena_config.yml"
echo ""
echo "🔍 Check Serena version:"
echo "   uvx --from git+https://github.com/oraios/serena serena --version"
echo ""
echo "📚 View help:"
echo "   uvx --from git+https://github.com/oraios/serena serena --help"
echo ""

echo -e "${BLUE}Resources:${NC}"
echo ""
echo "GitHub:       https://github.com/oraios/serena"
echo "MCP Docs:     https://modelcontextprotocol.io"
echo "Setup Guide:  $SERENA_DIR/SETUP_GUIDE.md"
echo ""

echo -e "${GREEN}✓ Serena MCP Skill initialization complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Ensure Node modules are installed: npm install"
echo "2. Start Serena using one of the installation instructions above"
echo "3. Use Serena to analyze and refactor your code"
echo ""

exit 0

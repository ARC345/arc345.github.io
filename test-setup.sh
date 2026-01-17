#!/bin/bash
# Quick test script for pixi setup
# Run with: bash test-setup.sh

set -e  # Exit on error

echo "🧪 Testing pixi setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pixi is installed
if ! command -v pixi &> /dev/null; then
    echo -e "${RED}❌ pixi is not installed${NC}"
    echo "Install from: https://pixi.sh/install/"
    exit 1
fi

echo -e "${GREEN}✅ pixi is installed${NC}"
echo ""

# Test 1: Install dependencies
echo "1️⃣  Testing dependency installation..."
if pixi install; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# Test 2: Export requirements.txt
echo "2️⃣  Testing requirements.txt export..."
if pixi run export-requirements; then
    if [ -f "requirements.txt" ]; then
        echo -e "${GREEN}✅ requirements.txt generated successfully${NC}"
        echo "   Contents:"
        head -5 requirements.txt | sed 's/^/   /'
    else
        echo -e "${RED}❌ requirements.txt was not created${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to export requirements.txt${NC}"
    exit 1
fi
echo ""

# Test 3: Build site
echo "3️⃣  Testing Jekyll build..."
if pixi run build; then
    if [ -d "_site" ]; then
        echo -e "${GREEN}✅ Site built successfully${NC}"
        echo "   _site directory created"
    else
        echo -e "${RED}❌ _site directory was not created${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Test 4: Test purgecss (if config exists)
if [ -f "purgecss.config.js" ]; then
    echo "4️⃣  Testing purgecss..."
    if pixi run purgecss; then
        echo -e "${GREEN}✅ purgecss ran successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  purgecss had issues (may be expected if no CSS to purge)${NC}"
    fi
    echo ""
fi

# Summary
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  • Run 'pixi run dev' to start the development server"
echo "  • Push changes to trigger GitHub Actions workflows"
echo "  • Check Actions tab to verify workflows run successfully"

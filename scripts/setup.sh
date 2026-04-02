#!/usr/bin/env bash
set -euo pipefail

# FOV Viewer — Automated Local Setup
# Usage: ./scripts/setup.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}✓${NC} $1"; }
warn()  { echo -e "${YELLOW}!${NC} $1"; }
fail()  { echo -e "${RED}✗${NC} $1"; exit 1; }

echo ""
echo "  FOV Viewer — Local Setup"
echo "  ========================"
echo ""

# ── 1. Check Node.js ──────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  fail "Node.js not found. Install Node 20+ from https://nodejs.org"
fi

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js $NODE_MAJOR found — version 20+ required. Current: $(node -v)"
fi
info "Node.js $(node -v)"

# ── 2. Check npm ──────────────────────────────────────────────────
if ! command -v npm &>/dev/null; then
  fail "npm not found."
fi
info "npm $(npm -v)"

# ── 3. Install dependencies ──────────────────────────────────────
echo ""
echo "  Installing dependencies..."
npm ci --loglevel=warn
info "Dependencies installed"

# ── 4. Type-check ────────────────────────────────────────────────
echo ""
echo "  Running type check..."
if npx tsc --noEmit 2>/dev/null; then
  info "TypeScript — no errors"
else
  warn "TypeScript errors found (non-blocking)"
fi

# ── 5. Run tests ─────────────────────────────────────────────────
echo ""
echo "  Running tests..."
if npm run test 2>/dev/null; then
  info "Tests passed"
else
  warn "Some tests failed (non-blocking)"
fi

# ── 6. Lint ──────────────────────────────────────────────────────
echo ""
echo "  Running linter..."
if npm run lint 2>/dev/null; then
  info "Lint — clean"
else
  warn "Lint issues found (non-blocking)"
fi

# ── 7. Done ──────────────────────────────────────────────────────
echo ""
echo "  ========================"
echo -e "  ${GREEN}Setup complete!${NC}"
echo ""
echo "  Start developing:"
echo "    npm run dev"
echo ""
echo "  Then open:"
echo "    http://localhost:5173/fov-viewer/"
echo ""

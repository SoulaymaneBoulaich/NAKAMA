#!/usr/bin/env bash
# ─────────────────────────────────────────────
# NAKAMA — Developer Onboarding Script
# Run once after cloning the repo.
# ─────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   NAKAMA — Dev Environment Setup     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"

# 1. Check prerequisites
for cmd in docker node npm; do
  if ! command -v $cmd &>/dev/null; then
    echo -e "${RED}✗ '$cmd' not found. Please install it first.${NC}" && exit 1
  fi
done
echo -e "${GREEN}✓ Prerequisites verified${NC}"

# 2. Create .env from template if missing
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created .env from .env.example — edit credentials before proceeding${NC}"
else
  echo -e "${GREEN}✓ .env already exists${NC}"
fi

# 3. Start Postgres container
echo -e "${CYAN}→ Starting database container...${NC}"
docker compose up -d --wait
echo -e "${GREEN}✓ Database is healthy and accepting connections${NC}"

# 4. Install dependencies
echo -e "${CYAN}→ Installing npm dependencies...${NC}"
npm install

# 5. Generate Prisma client and push schema
echo -e "${CYAN}→ Syncing Prisma schema to database...${NC}"
cd server
npx prisma generate
npx prisma db push --accept-data-loss
echo -e "${GREEN}✓ Database schema synchronized${NC}"

# 6. Seed (optional)
read -p "Seed database with sample data? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx tsx prisma/seed.ts
  echo -e "${GREEN}✓ Database seeded${NC}"
fi

cd ..
echo ""
echo -e "${GREEN}══════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup complete! Run: npm run dev    ${NC}"
echo -e "${GREEN}══════════════════════════════════════${NC}"

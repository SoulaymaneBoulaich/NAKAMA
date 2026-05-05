# NAKAMA — Daily Developer Workflow

## Every Time You Open the Project

### Step 1: Start the Database
```bash
npm run db:up
```
This starts the Postgres container and waits until it's healthy.

### Step 2: Start the Dev Servers
```bash
npm run dev
```
This launches both the client (Vite on `:5173`) and server (Express on `:5000`).

### That's it. Two commands.

---

## First Time Setup (New Machine / New Partner)

```bash
# 1. Clone the repo
git clone <repo-url> && cd NAKAMA

# 2. Create your .env from the template
cp .env.example .env
# Edit .env — set your own DB_PASSWORD and JWT secrets

# 3. Run the automated setup
npm run setup

# This does everything: starts Docker, installs deps, pushes schema, and optionally seeds the DB.
```

---

## When You Pull New Changes

```bash
git pull
npm install                    # in case deps changed
cd server && npx prisma db push && cd ..   # sync any schema changes
npm run dev
```

---

## Useful Commands Cheat Sheet

| Command | What it does |
|---|---|
| `npm run dev` | Start client + server |
| `npm run db:up` | Start database container |
| `npm run db:down` | Stop database container |
| `npm run db:reset` | Nuke database and restart fresh |
| `npm run db:logs` | Tail database logs (debugging) |
| `cd server && npx prisma studio` | Open visual DB browser |
| `cd server && npx prisma db push` | Sync schema.prisma to DB |
| `cd server && npx tsx prisma/seed.ts` | Seed sample data |

---

## Rules

1. **Never commit `.env`** — it's git-ignored. Use `.env.example` as the template.
2. **Schema changes go in `schema.prisma`** — not raw SQL. Then run `prisma db push`.
3. **Always pull before pushing** — `git pull --rebase` to keep history clean.
4. **Test before pushing** — `cd server && npm test`.

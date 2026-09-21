# Agent Desk

**Your agents. One desk.**

Phase 1 of the Agent Desk command center: desks, seated agents, task queues, an approvals inbox, and live activity — mock data only, no silent-send.

## Stack

- Next.js 16 App Router + TypeScript
- Tailwind CSS v4 with tokens from `app/tokens.css` (`brand/tokens.css`)
- Local React store (no backend). Wallet connect is Solana / Pump.fun (Phantom, Solflare, Backpack). Guests can explore without connecting.

## Run

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The floor is open to guests. Connect a Pump.fun wallet (Phantom, Solflare, Backpack) from the header when you need to approve a send or spend. If 3000 is taken, Next.js will pick the next port.

## Routes

| Path | What |
|------|------|
| `/` | Desk overview + live activity |
| `/desks/new` | Open a desk |
| `/desks/[id]` | Board: Queue → In progress → Waiting on you → Done |
| `/agents` | Roster (120 avatars) + hire/configure |
| `/agents/[id]` | Seat, queue, memory, pause |
| `/tasks` | Cross-desk tasks + create |
| `/approvals` | Sends / spends / deletes / external posts |
| `/analytics` | Mock utilization + wait time |
| `/settings` | Pump.fun wallet + guardrails |

## Avatars & brand

- Portraits: `public/agent-avatars/agent-001.png` … `agent-120.png` (copied from `/agent-avatars`)
- Catalog: `lib/avatars.json` and `public/agent-avatars/avatars.json`
- Mark / favicons: `public/agentdesk-logo.png`, `public/favicon-*.png`, `app/icon.png`
- Colors: void `#0A0B10`, signal `#5B8CFF`, lamp `#FFC857` for “Needs you”
- Type: Space Grotesk + Inter + JetBrains Mono

Approve / Edit / Reject on `/approvals` updates local state. External sends never go out in Phase 1.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

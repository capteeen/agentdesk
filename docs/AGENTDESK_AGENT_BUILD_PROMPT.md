# Agent Desk — Full Product Build Prompt

Give this to a coding agent. Build the complete Agent Desk web app from this spec.

---

## Mission

**Agent Desk** is the command center where you run a team of AI agents like a real desk: assign work, watch live activity, approve risky moves, and ship.

Tagline: **“Your agents. One desk.”**

One-liner: Open desks (Research, Build, Social, Ops), seat agents, queue jobs, review approvals, and see everything that’s happening — without bouncing between chats.

---

## Product rules (non-negotiable)

1. **Desk-first** — Work is organized by desks (teams), not by a single endless chat.
2. **Agents are teammates** — Each agent has a role, status (idle / working / blocked / waiting on you), and a clear queue.
3. **Approvals are visible** — Sends, spends, deletes, and external posts need an Approvals inbox. Never silent-send.
4. **Live activity** — A real-time-feel activity feed (mockable first) shows what each agent is doing.
5. **Human stays in charge** — User can pause, redirect, or stop any agent anytime.
6. **Anti-goal** — Do not build another generic ChatGPT clone. Do not hide agent actions. Do not auto-post without approval UI.

---

## Core user flows

### A. Home / Desk overview
- Hero: tagline + “Open a desk”
- Active desks grid (name, agents seated, open tasks, waiting approvals)
- Live strip: recent agent events
- CTA: **New desk** / **Hire agent**

### B. Desk board
- Columns or swimlanes: Queue → In progress → Waiting on you → Done
- Seated agents with status dots
- Quick assign: drop a task onto an agent

### C. Agents
- Roster of agents (avatar, role, desk, status)
- Hire / configure agent (name, role prompt, tools allowed)
- Agent detail: queue, memory notes (high-level), activity

### D. Approvals
- Inbox of pending actions (send message, spend, publish, delete)
- Diff / preview of what will go out
- Approve / Edit / Reject

### E. Tasks
- Create task with brief, desk, assignee, priority
- Attachments / links
- Status history

### F. Analytics
- Tasks completed, wait time on approvals, agent utilization
- Quiet hours / blocked reasons

---

## Design system (Agent Desk brand)

### Personality
Calm ops room meets modern SaaS. Professional, sharp, a little cinematic — never meme-chaotic (that’s Floorfi). Feels like a trading desk for agents.

### Color
| Token | Hex | Use |
|-------|-----|-----|
| `void` | `#0A0B10` | Page background |
| `panel` | `#12141C` | Cards |
| `line` | `#1E2230` | Borders |
| `mist` | `#8B93A8` | Secondary text |
| `paper` | `#F2F4F8` | Primary text |
| `signal` | `#5B8CFF` | Primary accent / links / active |
| `signal-dim` | `#3D66C9` | Hover |
| `lamp` | `#FFC857` | Warnings / “needs you” |
| `ok` | `#3DDC97` | Success / idle-ready |
| `hot` | `#FF5C7A` | Blocked / reject |

### Typography
- Display: **Space Grotesk**
- UI: **Inter**
- Mono: **JetBrains Mono** (IDs, logs, tool calls)

### Wordmark & mark
- Wordmark: **Agent Desk** (title case) or **agentdesk** lowercase in UI chrome — pick **Agent Desk** for marketing, `agentdesk` for app header.
- Mark: Rounded square, abstract desk plane + signal bar forming an “A” / antenna. Accent `signal` on `void`.
- Favicon: mark only.

### UI chrome
- 14–16px card radius, 1px `line` borders
- Primary button: `signal` fill, `void` text
- “Needs you” chips: `lamp` soft background
- Activity rows: mono timestamp + agent avatar + verb

---

## Tech stack (recommended)

- Next.js 14+ App Router + TypeScript
- Tailwind + CSS variables for tokens
- Optional: realtime via Supabase / Partykit / mock polling first
- Auth: simple email or wallet later — start with local demo user
- Deploy: Vercel

Env example:
```
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
```

---

## Routes

```
/                 Desk overview
/desks/new
/desks/[id]       Desk board
/agents
/agents/[id]
/tasks
/approvals
/analytics
/settings
```

---

## Implementation phases

### Phase 1 — Shell & brand
Layout, nav, tokens, wordmark, mock desks + agents using `/agent-avatars`.

### Phase 2 — Desk board + tasks
Kanban/queue UX, create task, assign agent (local state / mock API).

### Phase 3 — Approvals inbox
Pending actions with approve/reject; toast on resolve.

### Phase 4 — Live activity
Simulated stream; later wire real agent runners.

### Phase 5 — Analytics + polish
Utilization charts, empty states, mobile usable.

---

## Acceptance criteria

- [ ] Brand tokens match this doc (not Floorfi green clone)
- [ ] Desks, agents, tasks, approvals all navigable
- [ ] Approvals required UI exists for external sends
- [ ] ≥100 agent avatars load without broken images
- [ ] README + `.env.example`

---

## Copy bank

- Hero: “Your agents. One desk.”
- Sub: “Assign work, watch live activity, approve what matters — run a whole team without losing the plot.”
- CTA: “Open a desk”
- Empty desk: “No agents seated. Hire your first.”
- Approval toast: “Approved. Sent.”

---

## Anti-goals

- No single-thread chatbot as the whole product
- No silent external sends
- Do not clone Floorfi / Hyped visuals

Build Agent Desk. Make the floor of work feel staffed.

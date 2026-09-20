import catalog from "./avatars.json";
import { hoursAgo, minutesAgo } from "./format";
import type {
  ActivityEvent,
  Agent,
  AgentStatus,
  Approval,
  AvatarMeta,
  Desk,
  Task,
} from "./types";
import { defaultWorkflow } from "./workflow";

const avatars = catalog as AvatarMeta[];

export const desks: Desk[] = [
  {
    id: "research",
    name: "Research",
    kind: "research",
    blurb: "Deep research and synthesis.",
  },
  {
    id: "build",
    name: "Build",
    kind: "build",
    blurb: "Code, test, and ship software.",
  },
  {
    id: "social",
    name: "Social",
    kind: "social",
    blurb: "Engage, monitor, and respond.",
  },
  {
    id: "ops",
    name: "Ops",
    kind: "ops",
    blurb: "Operations and workflow automation.",
  },
];

const STEMS = [
  "Lex", "Forge", "Muse", "Nova", "Echo", "Wren", "Atlas", "Pulse", "Kepler", "Iris",
  "Nim", "Vesper", "Hale", "Sable", "Pike", "Rowan", "Juno", "Cinder", "Lumen", "North",
  "Vale", "Onyx", "Reed", "Sol", "Bram", "Kite", "Harbor", "Flint", "Nox", "Sage",
  "Drift", "Cobalt", "Ember", "Holt", "Nyx", "Lark", "Mica", "Thorn", "Rook", "Ash",
  "Tide", "Fern", "Quartz", "Wisp", "Iota", "Meridian", "Kestrel", "Brine", "Yarrow", "Volt",
  "Nimbus", "Hearth", "Glyph", "Finch", "Dune", "Rill", "Spire", "Moth", "Cedar", "Prism",
  "Silt", "Warden", "Loam", "Apex", "Bough", "Dusk", "Etch", "Fjord", "Grove", "Ibex",
  "Knot", "Loom", "Moss", "Orb", "Rime", "Skein", "Veil", "Woad", "Amber", "Bolt",
  "Crux", "Dell", "Fawn", "Helm", "Jolt", "Quern", "Plover", "Knurl", "Gilt", "Husk",
];

const FEATURED_NAMES: Record<string, string> = {
  "agent-001.png": "Lex-7",
  "agent-002.png": "Forge",
  "agent-003.png": "Muse",
  "agent-004.png": "Ops-1",
  "agent-005.png": "Noventa",
  "agent-006.png": "Quill",
  "agent-007.png": "Scout-R",
  "agent-008.png": "Proof",
  "agent-009.png": "Kepler",
  "agent-010.png": "Builder-X",
  "agent-011.png": "Echo",
  "agent-012.png": "Sysmon",
  "agent-013.png": "Iris",
  "agent-014.png": "Scribe",
  "agent-015.png": "Range",
  "agent-016.png": "Review",
  "agent-017.png": "Atlas",
  "agent-018.png": "Wren",
  "agent-019.png": "Pulse",
  "agent-020.png": "Relay",
};

type Seat = {
  deskId: string;
  status: AgentStatus;
  currentTask?: string;
  model: string;
  tools: string[];
  prompt: string;
  memoryNotes: string[];
  uptime: string;
};

const SEATED: Record<string, Seat> = {
  "agent-001.png": {
    deskId: "research",
    status: "working",
    currentTask: "Synthesize 12 papers on eval harnesses",
    model: "Llama 3.3 70B",
    tools: ["web", "scholar", "notes"],
    prompt: "Senior researcher. Cite sources. Flag uncertainty. Never send externally.",
    memoryNotes: ["Prefers primary sources", "EU AI Act brief shipped Sep 18"],
    uptime: "2d 14h",
  },
  "agent-002.png": {
    deskId: "build",
    status: "working",
    currentTask: "Run integration test suite",
    model: "Qwen 2.5 Coder",
    tools: ["repo", "terminal", "ci"],
    prompt: "Staff engineer. Small diffs. Tests before claims.",
    memoryNotes: ["Release-2.4 branch is hot", "CI runners were updated May 19"],
    uptime: "1d 6h",
  },
  "agent-003.png": {
    deskId: "social",
    status: "idle",
    model: "Mistral Small",
    tools: ["compose", "listen", "schedule"],
    prompt: "Social editor. Human voice. Queue every public post for approval.",
    memoryNotes: ["Brand voice: calm, sharp, never meme-loud"],
    uptime: "3d 2h",
  },
  "agent-004.png": {
    deskId: "ops",
    status: "waiting",
    currentTask: "Delete archived finance export",
    model: "Command R+",
    tools: ["inbox", "sheets", "drive"],
    prompt: "Ops lead. Nothing leaves or deletes without an approval.",
    memoryNotes: ["Retention sweep is weekly", "Needs you on Q1 archive delete"],
    uptime: "5d 11h",
  },
  "agent-005.png": {
    deskId: "research",
    status: "idle",
    model: "Claude Sonnet",
    tools: ["web", "sheets", "notes"],
    prompt: "Analyst. Numbers first. Show the work.",
    memoryNotes: ["Competitor pricing map is queued"],
    uptime: "12h 45m",
  },
  "agent-009.png": {
    deskId: "research",
    status: "waiting",
    currentTask: "Approve Serper spend for 40 more queries",
    model: "Phi-3.5",
    tools: ["web", "scholar"],
    prompt: "Literature scout. Cheap queries, high recall.",
    memoryNotes: ["Spend cap reminder: $50 without a second look"],
    uptime: "18h",
  },
  "agent-010.png": {
    deskId: "build",
    status: "idle",
    model: "DeepSeek Coder",
    tools: ["repo", "ci"],
    prompt: "Platform builder. Keep the floor green.",
    memoryNotes: [],
    uptime: "2d 9h",
  },
  "agent-011.png": {
    deskId: "social",
    status: "waiting",
    currentTask: "Publish weekly wrap tweet",
    model: "GPT-4o mini",
    tools: ["compose", "schedule"],
    prompt: "Channel editor. External posts always wait.",
    memoryNotes: ["AcmeCon thread is drafted"],
    uptime: "1d 3h",
  },
  "agent-012.png": {
    deskId: "ops",
    status: "idle",
    model: "Claude Haiku",
    tools: ["calendar", "inbox"],
    prompt: "Night watch. Alert, don't act.",
    memoryNotes: ["Monitoring quiet hours 22:00–07:00"],
    uptime: "4d 7h",
  },
  "agent-018.png": {
    deskId: "build",
    status: "working",
    currentTask: "Build and publish artifacts",
    model: "Qwen 2.5 Coder",
    tools: ["repo", "terminal"],
    prompt: "Release engineer. No silent deploys.",
    memoryNotes: [],
    uptime: "9h",
  },
  "agent-019.png": {
    deskId: "social",
    status: "working",
    currentTask: "Draft Q2 campaign Slack update",
    model: "Mistral Small",
    tools: ["compose", "listen"],
    prompt: "Community voice. Approvals before send.",
    memoryNotes: [],
    uptime: "6h",
  },
  "agent-020.png": {
    deskId: "ops",
    status: "working",
    currentTask: "Daily reconciliation",
    model: "Command R+",
    tools: ["sheets", "inbox"],
    prompt: "Closer. Flag mismatches, never auto-send.",
    memoryNotes: [],
    uptime: "1d 2h",
  },
};

const MODELS: Record<string, string> = {
  Research: "Llama 3.3 70B",
  Build: "Qwen 2.5 Coder",
  Social: "Mistral Small",
  Ops: "Command R+",
  Analyst: "Claude Sonnet",
  Writer: "Kimi",
  Scout: "Gemini Flash",
  Reviewer: "Haiku",
};

const TOOLS: Record<string, string[]> = {
  Research: ["web", "scholar", "notes"],
  Build: ["repo", "terminal", "ci"],
  Social: ["compose", "listen", "schedule"],
  Ops: ["inbox", "calendar", "sheets"],
  Analyst: ["sheets", "web", "notes"],
  Writer: ["compose", "notes"],
  Scout: ["web", "listen"],
  Reviewer: ["repo", "notes"],
};

function nameFor(file: string, index: number) {
  if (FEATURED_NAMES[file]) return FEATURED_NAMES[file];
  const stem = STEMS[index % STEMS.length];
  const cycle = Math.floor(index / STEMS.length);
  return cycle === 0 ? stem : `${stem}-${cycle + 1}`;
}

export const agents: Agent[] = avatars.map((entry, index) => {
  const seat = SEATED[entry.file];
  const name = nameFor(entry.file, index);
  const role = entry.roleHint;
  const model = seat?.model ?? MODELS[entry.roleHint] ?? "Llama 3.3";
  const prompt =
    seat?.prompt ?? `${entry.roleHint} teammate. Human stays in charge — never silent-send.`;
  return {
    id: `agt-${String(index + 1).padStart(3, "0")}`,
    name,
    role,
    roleHint: role,
    deskId: seat?.deskId ?? null,
    status: seat?.status ?? "idle",
    avatarFile: entry.file,
    model,
    tools: seat?.tools ?? TOOLS[entry.roleHint] ?? ["notes"],
    prompt,
    currentTask: seat?.currentTask,
    memoryNotes: seat?.memoryNotes ?? [],
    uptime: seat?.uptime ?? "—",
    workflow: defaultWorkflow({ name, role, model, prompt }),
  };
});

export const avatarCatalog = avatars;

const now = () => new Date().toISOString();

export const tasks: Task[] = [
  {
    id: "t-r1",
    code: "RS-1042",
    title: "Synthesize 12 papers on eval harnesses",
    brief: "Pull methods, compare failure modes, write a one-pager for Build.",
    deskId: "research",
    agentId: "agt-001",
    status: "progress",
    priority: "high",
    due: "Today",
    links: ["https://arxiv.org"],
    history: [{ at: hoursAgo(3), label: "Lex-7 picked up" }],
  },
  {
    id: "t-r2",
    code: "RS-1040",
    title: "Approve Serper spend for 40 more queries",
    brief: "Kepler hit the $50 look-twice cap. Needs you before more search.",
    deskId: "research",
    agentId: "agt-009",
    status: "waiting",
    priority: "medium",
    due: "Today",
    history: [{ at: minutesAgo(22), label: "Moved to Waiting on you" }],
  },
  {
    id: "t-r3",
    code: "RS-1038",
    title: "Map competitor pricing pages",
    brief: "Noventa-ready brief: public pages only, no accounts.",
    deskId: "research",
    agentId: "agt-005",
    status: "queue",
    priority: "medium",
    due: "Tomorrow",
    history: [{ at: hoursAgo(8), label: "Queued" }],
  },
  {
    id: "t-r4",
    code: "RS-1029",
    title: "Brief on EU AI Act changes",
    brief: "What changed for us this month. Done, filed in notes.",
    deskId: "research",
    agentId: "agt-001",
    status: "done",
    priority: "high",
    history: [{ at: hoursAgo(48), label: "Completed" }],
  },
  {
    id: "t-b1",
    code: "BLD-1841",
    title: "Run integration test suite",
    brief: "Full suite on release-2.4. Flag flakes, don't retry forever.",
    deskId: "build",
    agentId: "agt-002",
    status: "progress",
    priority: "high",
    due: "Today",
    history: [{ at: hoursAgo(1), label: "Forge running" }],
  },
  {
    id: "t-b2",
    code: "BLD-1839",
    title: "Build and publish artifacts",
    brief: "Staging only. Production publish waits for approval.",
    deskId: "build",
    agentId: "agt-018",
    status: "progress",
    priority: "medium",
    due: "Today",
    history: [{ at: minutesAgo(45), label: "Wren started" }],
  },
  {
    id: "t-b3",
    code: "BLD-1842",
    title: "Investigate build failure on release-2.4",
    brief: "CI red on docker base image. Reproduce, don't push a fix yet.",
    deskId: "build",
    agentId: null,
    status: "queue",
    priority: "high",
    due: "Today",
    history: [{ at: hoursAgo(2), label: "Opened" }],
  },
  {
    id: "t-b4",
    code: "BLD-1840",
    title: "Review production deploy notes",
    brief: "Waiting on you before anything goes live.",
    deskId: "build",
    agentId: "agt-010",
    status: "waiting",
    priority: "high",
    due: "Today",
    history: [{ at: hoursAgo(5), label: "Needs you" }],
  },
  {
    id: "t-b5",
    code: "BLD-1832",
    title: "Update CI runner image",
    brief: "Shipped.",
    deskId: "build",
    agentId: "agt-010",
    status: "done",
    priority: "medium",
    history: [{ at: hoursAgo(30), label: "Completed" }],
  },
  {
    id: "t-s1",
    code: "SOC-220",
    title: "Draft Q2 campaign Slack update",
    brief: "Internal #general only after approval. No silent-send.",
    deskId: "social",
    agentId: "agt-019",
    status: "progress",
    priority: "medium",
    history: [{ at: minutesAgo(12), label: "Pulse drafting" }],
  },
  {
    id: "t-s2",
    code: "SOC-218",
    title: "Publish weekly wrap tweet",
    brief: "External post. Must clear Approvals.",
    deskId: "social",
    agentId: "agt-011",
    status: "waiting",
    priority: "medium",
    history: [{ at: minutesAgo(18), label: "Queued for approval" }],
  },
  {
    id: "t-s3",
    code: "SOC-215",
    title: "Listen pass on AcmeCon mentions",
    brief: "Collect, don't reply.",
    deskId: "social",
    agentId: "agt-003",
    status: "queue",
    priority: "low",
    history: [{ at: hoursAgo(6), label: "Queued" }],
  },
  {
    id: "t-s4",
    code: "SOC-209",
    title: "Rewrite launch note in brand voice",
    brief: "Filed.",
    deskId: "social",
    agentId: "agt-003",
    status: "done",
    priority: "low",
    history: [{ at: hoursAgo(20), label: "Completed" }],
  },
  {
    id: "t-o1",
    code: "OPS-771",
    title: "Daily reconciliation",
    brief: "Match inbox to sheets. Escalate mismatches.",
    deskId: "ops",
    agentId: "agt-020",
    status: "progress",
    priority: "medium",
    history: [{ at: minutesAgo(8), label: "Relay started" }],
  },
  {
    id: "t-o2",
    code: "OPS-768",
    title: "Delete archived finance export",
    brief: "Q1_financials_archive.xlsx — delete is gated.",
    deskId: "ops",
    agentId: "agt-004",
    status: "waiting",
    priority: "high",
    history: [{ at: hoursAgo(1), label: "Needs you" }],
  },
  {
    id: "t-o3",
    code: "OPS-760",
    title: "Quiet-hours alert tuning",
    brief: "Sysmon proposal: page less, miss nothing.",
    deskId: "ops",
    agentId: "agt-012",
    status: "queue",
    priority: "low",
    history: [{ at: hoursAgo(10), label: "Queued" }],
  },
  {
    id: "t-o4",
    code: "OPS-751",
    title: "Vendor invoice triage",
    brief: "Closed yesterday.",
    deskId: "ops",
    agentId: "agt-020",
    status: "done",
    priority: "medium",
    history: [{ at: hoursAgo(26), label: "Completed" }],
  },
];

export const approvals: Approval[] = [
  {
    id: "ap-1",
    type: "send",
    title: "Send Slack message",
    preview:
      "Q2 campaign update is live. Check it here: https://acme.com/campaign",
    agentId: "agt-019",
    deskId: "social",
    status: "pending",
    requestedAt: minutesAgo(5),
    destination: "#general",
    edited: false,
  },
  {
    id: "ap-2",
    type: "external-post",
    title: "Publish tweet",
    preview:
      "Wrapping up a sharp week at #AcmeCon. Thanks to everyone who sat with us. Onward.",
    agentId: "agt-011",
    deskId: "social",
    status: "pending",
    requestedAt: minutesAgo(18),
    destination: "@agentdesk",
    edited: false,
  },
  {
    id: "ap-3",
    type: "delete",
    title: "Delete file",
    preview: "Q1_financials_archive.xlsx · 2.4 MB · /drive/Finance/Archive/",
    agentId: "agt-004",
    deskId: "ops",
    status: "pending",
    requestedAt: hoursAgo(1),
    destination: "Drive · Finance/Archive",
    edited: false,
  },
  {
    id: "ap-4",
    type: "spend",
    title: "Spend search credits",
    preview: "Serper · 40 additional queries · estimate $12.80",
    agentId: "agt-009",
    deskId: "research",
    status: "pending",
    requestedAt: minutesAgo(22),
    destination: "Serper API",
    amount: "$12.80",
    edited: false,
  },
  {
    id: "ap-5",
    type: "external-post",
    title: "Publish LinkedIn note",
    preview:
      "We run agents like a desk: queues, seats, and a human on approvals. Your agents. One desk.",
    agentId: "agt-003",
    deskId: "social",
    status: "pending",
    requestedAt: minutesAgo(41),
    destination: "LinkedIn · Company",
    edited: false,
  },
];

export const activity: ActivityEvent[] = [
  {
    id: "ac-1",
    at: minutesAgo(2),
    agentId: "agt-001",
    verb: "finished a web pass on eval papers",
    kind: "completed",
  },
  {
    id: "ac-2",
    at: minutesAgo(4),
    agentId: "agt-002",
    verb: "pushed staging artifacts — production still gated",
    kind: "progress",
  },
  {
    id: "ac-3",
    at: minutesAgo(5),
    agentId: "agt-019",
    verb: "queued a Slack send · Needs you",
    kind: "needs-you",
  },
  {
    id: "ac-4",
    at: minutesAgo(8),
    agentId: "agt-020",
    verb: "started daily reconciliation",
    kind: "progress",
  },
  {
    id: "ac-5",
    at: minutesAgo(18),
    agentId: "agt-011",
    verb: "held a tweet for approval",
    kind: "needs-you",
  },
  {
    id: "ac-6",
    at: minutesAgo(41),
    agentId: "agt-003",
    verb: "drafted a LinkedIn note — not posted",
    kind: "needs-you",
  },
];

export function nextTaskCode(existing: Task[], deskId: string) {
  const prefix =
    deskId === "research"
      ? "RS"
      : deskId === "build"
        ? "BLD"
        : deskId === "social"
          ? "SOC"
          : deskId === "ops"
            ? "OPS"
            : "TSK";
  return `${prefix}-${1000 + existing.filter((t) => t.deskId === deskId).length + 1}`;
}

export { now };

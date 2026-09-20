import type { ActivityEvent, Agent, Approval, Desk, Task } from "./types";

export type FloorRange = "1D" | "1W" | "1M" | "1Y" | "ALL";
export type FloorFilter = "all" | "needs-you" | Desk["id"];

export const RANGES: FloorRange[] = ["1D", "1W", "1M", "1Y", "ALL"];

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CHART: Record<
  FloorRange,
  { points: number[]; labels: string[]; headline: number; delta: number }
> = {
  "1D": {
    points: [46, 47, 45, 48, 50, 52, 49, 51, 53, 55, 54, 58],
    labels: ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"],
    headline: 54815.25,
    delta: 0.4,
  },
  "1W": {
    points: [42, 44, 48, 46, 52, 56, 60],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    headline: 54815.25,
    delta: 1.1,
  },
  "1M": {
    points: [40, 42, 41, 45, 48, 46, 50, 53, 51, 55, 57, 60],
    labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "Now"],
    headline: 54815.25,
    delta: 1.8,
  },
  "1Y": {
    points: [64, 66, 63, 68, 71, 76, 82, 88, 84, 86, 88, 90],
    labels: MONTHS,
    headline: 54815.25,
    delta: 2.4,
  },
  ALL: {
    points: [22, 28, 30, 34, 38, 42, 44, 50, 56, 64, 72, 78],
    labels: ["’24 Q1", "Q2", "Q3", "Q4", "’25 Q1", "Q2", "Q3", "Q4", "’26 Q1", "Q2", "Q3", "Now"],
    headline: 54815.25,
    delta: 18.6,
  },
};

export const CHART_MARKS = [
  { label: "May 1", value: 42820.0, delta: 15.4, at: 0.36 },
  { label: "Aug 31", value: 51620.45, delta: 8.2, at: 0.72 },
];

export function formatIndex(value: number) {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDelta(value: number) {
  const abs = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "−"}${abs}%`;
}

export function tickerOf(name: string) {
  const letters = name.replace(/[^A-Za-z]/g, "").toUpperCase();
  return (letters.slice(0, 4) || "AGT").padEnd(3, "X");
}

function hash(value: string) {
  return value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function agentDelta(agent: Agent) {
  const jitter = (hash(agent.id) % 70) / 10;
  if (agent.status === "working") return 0.8 + jitter;
  if (agent.status === "idle") return 0.1 + (jitter % 0.6);
  if (agent.status === "waiting") return -(0.3 + (jitter % 0.8));
  return -(1.4 + (jitter % 1.2));
}

export function agentQuote(agent: Agent, beat = 0) {
  const base = 1200 + (hash(agent.name) % 2800) + beat * 3.25;
  return 800 + (base % 4200);
}

export function floorMetrics(input: {
  desks: Desk[];
  agents: Agent[];
  tasks: Task[];
  pending: Approval[];
  activity: ActivityEvent[];
  filter: FloorFilter;
}) {
  const seated = input.agents.filter((agent) => agent.deskId);
  const visibleSeated =
    input.filter === "all"
      ? seated
      : input.filter === "needs-you"
        ? seated.filter((agent) => agent.status === "waiting" || agent.status === "blocked")
        : seated.filter((agent) => agent.deskId === input.filter);

  const working = seated.filter((agent) => agent.status === "working");
  const waiting = seated.filter((agent) => agent.status === "waiting" || agent.status === "blocked");
  const beats = input.tasks.reduce((sum, task) => sum + (task.workBeat ?? 0), 0);
  const done = input.tasks.filter((task) => task.status === "done").length;
  const open = input.tasks.filter((task) => task.status !== "done");

  const deskLoads = input.desks.map((desk) => {
    const deskTasks = input.tasks.filter((task) => task.deskId === desk.id);
    const share = deskTasks.length + deskTasks.filter((task) => task.status === "progress").length * 0.6;
    const seatedHere = seated.filter((agent) => agent.deskId === desk.id).length;
    const value = 980 + share * 214.15 + seatedHere * 86.4 + (beats % 17);
    return { desk, value, tasks: deskTasks.length, seated: seatedHere };
  });

  const rawTotal = deskLoads.reduce((sum, row) => sum + row.value, 0);
  const total = 3600 + done * 42.25 + beats * 1.35 + rawTotal * 0.12;
  const totalDelta = 0.7 + Math.min(2.4, working.length * 0.15) - waiting.length * 0.08;

  const health = Math.max(
    58,
    Math.min(94, 84 + working.length - waiting.length * 3 - Math.min(input.pending.length, 4) * 2),
  );

  const risk = Math.max(
    48,
    Math.min(94, 78 - waiting.length * 3 - Math.min(input.pending.length, 4) * 2 + working.length),
  );

  const allocation = deskLoads.map((row) => ({
    ...row,
    pct: rawTotal === 0 ? 0 : Math.round((row.value / rawTotal) * 100),
  }));

  const latest = input.activity[0];
  const latestAgent = input.agents.find((agent) => agent.id === latest?.agentId);

  return {
    seated: visibleSeated,
    allSeated: seated,
    working,
    waiting,
    beats,
    done,
    open: open.length,
    deskLoads,
    total,
    totalDelta,
    health,
    risk,
    allocation,
    utilization: seated.length ? Math.round((working.length / seated.length) * 100) : 0,
    insight: latestAgent
      ? `${latestAgent.name} ${latest.verb}. Utilization is ${
          seated.length ? Math.round((working.length / seated.length) * 100) : 0
        }% — ${input.pending.length} action${input.pending.length === 1 ? "" : "s"} still sit in Approvals.`
      : "The floor is quiet. Seat an agent or open a desk.",
    latestAgent,
  };
}

import type { ActivityEvent, Agent, Desk, DeskKind, Task } from "./types";

const LINES: Record<DeskKind, string[]> = {
  research: [
    "is skimming a new abstract",
    "is clustering citations",
    "is drafting the synthesis",
    "is flagging a weak source",
    "is checking primary sources",
    "is updating the brief",
  ],
  build: [
    "is running the integration suite",
    "is reading the failing spec",
    "is tightening a type error",
    "is watching CI",
    "is reviewing the last diff",
    "is writing a regression note",
  ],
  social: [
    "is listening for mentions",
    "is drafting a reply for approval",
    "is checking the brand voice list",
    "is queuing a thread — not sending",
    "is trimming a caption",
  ],
  ops: [
    "is reconciling the inbox",
    "is checking retention rules",
    "is preparing a delete for approval",
    "is matching last week’s sweep",
    "is filing a receipt",
  ],
};

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function simulateFloor(state: {
  desks: Desk[];
  agents: Agent[];
  tasks: Task[];
  activity: ActivityEvent[];
}): { agents: Agent[]; tasks: Task[]; activity: ActivityEvent[] } {
  let agents = state.agents;
  let tasks = state.tasks;
  const seated = agents.filter((agent) => agent.deskId);
  if (seated.length === 0) {
    return { agents, tasks, activity: state.activity };
  }

  const workingCount = seated.filter((agent) => agent.status === "working").length;
  if (workingCount < 3) {
    const idle = seated.find((agent) => agent.status === "idle");
    if (idle) {
      const desk = state.desks.find((item) => item.id === idle.deskId);
      const verb = pick(LINES[desk?.kind ?? "ops"]).replace(/^is /, "");
      agents = agents.map((agent) =>
        agent.id === idle.id
          ? { ...agent, status: "working", currentTask: verb.charAt(0).toUpperCase() + verb.slice(1) }
          : agent,
      );
    }
  }

  const workers = agents.filter((agent) => agent.status === "working" && agent.deskId);
  const worker = pick(workers.length ? workers : seated);
  const desk = state.desks.find((item) => item.id === worker.deskId);
  const kind = desk?.kind ?? "ops";
  const line = pick(LINES[kind]);
  const taskLabel = line.replace(/^is /, "");
  const currentTask = taskLabel.charAt(0).toUpperCase() + taskLabel.slice(1);

  agents = agents.map((agent) =>
    agent.id === worker.id && agent.status === "working"
      ? { ...agent, currentTask }
      : agent,
  );

  tasks = tasks.map((task) => {
    if (task.status !== "progress") return task;
    if (task.agentId && task.agentId !== worker.id) return task;
    return { ...task, workBeat: (task.workBeat ?? 0) + 1 };
  });

  if (Math.random() < 0.22) {
    const queued = tasks.find(
      (task) => task.status === "queue" && task.agentId && agents.some((agent) => agent.id === task.agentId && agent.status !== "blocked"),
    );
    if (queued) {
      tasks = tasks.map((task) =>
        task.id === queued.id
          ? {
              ...task,
              status: "progress",
              workBeat: 1,
              history: [{ at: new Date().toISOString(), label: "Agent picked it up" }, ...task.history],
            }
          : task,
      );
      const assignee = agents.find((agent) => agent.id === queued.agentId);
      if (assignee && assignee.status === "idle") {
        agents = agents.map((agent) =>
          agent.id === assignee.id
            ? { ...agent, status: "working", currentTask: queued.title }
            : agent,
        );
      }
    }
  }

  const event: ActivityEvent = {
    id: `ac-live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    agentId: worker.id,
    verb: line,
    kind: "progress",
  };

  return {
    agents,
    tasks,
    activity: [event, ...state.activity].slice(0, 48),
  };
}

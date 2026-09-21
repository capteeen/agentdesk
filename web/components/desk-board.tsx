"use client";

import Link from "next/link";
import { AgentAvatar } from "@/components/agent-avatar";
import { LiveBadge, PriorityChip, StatusDot, WorkingTicks } from "@/components/ui";
import { useDesk } from "@/lib/store";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { key: TaskStatus; label: string; hint: string }[] = [
  { key: "queue", label: "Queue", hint: "Not started" },
  { key: "progress", label: "In progress", hint: "Seated and moving" },
  { key: "waiting", label: "Waiting on you", hint: "Needs you" },
  { key: "done", label: "Done", hint: "Shipped" },
];

export function DeskBoard({ deskId }: { deskId: string }) {
  const { desks, tasks, agents, moveTask, assignTask } = useDesk();
  const desk = desks.find((item) => item.id === deskId);
  const seated = agents.filter((agent) => agent.deskId === deskId);
  const deskTasks = tasks.filter((task) => task.deskId === deskId);

  if (!desk) {
    return (
      <div className="space-y-3">
        <h1 className="font-headline text-3xl font-semibold">Desk not found</h1>
        <Link href="/dashboard" className="text-signal hover:underline">
          Back to the floor
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Desk</p>
          <h1 className="font-headline text-3xl font-semibold tracking-tight">{desk.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-mist">{desk.blurb}</p>
        </div>
        <Link
          href="/tasks"
          className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-signal px-4 text-sm font-medium text-void"
        >
          New task
        </Link>
      </div>

      <section className="ad-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Seated</h2>
          <div className="flex items-center gap-3">
            {seated.some((agent) => agent.status === "working") && <LiveBadge label="Working" />}
            <Link href="/agents" className="text-sm text-signal hover:underline">
              Hire agent
            </Link>
          </div>
        </div>
        {seated.length === 0 ? (
          <p className="text-sm text-mist">No agents seated. Hire your first.</p>
        ) : (
          <ul className="flex gap-3 overflow-x-auto ad-scroll pb-1">
            {seated.map((agent) => (
              <li key={agent.id}>
                <Link
                  href={`/agents/${agent.id}`}
                  className="flex min-w-[180px] items-center gap-3 rounded-[12px] border border-line bg-void px-3 py-2"
                >
                  <AgentAvatar
                    file={agent.avatarFile}
                    name={agent.name}
                    size={36}
                    status={agent.status}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <StatusDot status={agent.status} />
                      <span className="truncate">{agent.name}</span>
                    </div>
                    <p className="flex items-center gap-1.5 truncate text-[11px] text-mist">
                      {agent.status === "working" && <WorkingTicks />}
                      <span className="truncate">{agent.currentTask ?? "Idle"}</span>
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-4">
        {COLUMNS.map((column) => {
          const cards = deskTasks.filter((task) => task.status === column.key);
          return (
            <section key={column.key} className="ad-card flex flex-col p-3">
              <header className="mb-3 flex items-baseline justify-between px-1">
                <div>
                  <h3 className="font-headline text-base font-semibold">{column.label}</h3>
                  <p className="text-[11px] text-mist">{column.hint}</p>
                </div>
                <span className="font-mono text-xs text-mist">{cards.length}</span>
              </header>
              <ul className="space-y-3">
                {cards.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    agents={seated}
                    onMove={(status) => moveTask(task.id, status)}
                    onAssign={(agentId) => assignTask(task.id, agentId)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  agents,
  onMove,
  onAssign,
}: {
  task: Task;
  agents: { id: string; name: string; avatarFile: string }[];
  onMove: (status: TaskStatus) => void;
  onAssign: (agentId: string | null) => void;
}) {
  const agent = agents.find((item) => item.id === task.agentId);
  const working = task.status === "progress";
  const width = 18 + ((task.workBeat ?? 0) * 9) % 72;
  return (
    <li className={`rounded-[12px] border border-line bg-void p-3 ${working ? "ad-work-card" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <PriorityChip priority={task.priority} />
      </div>
      <p className="mt-1 font-mono text-[11px] text-mist">{task.code}</p>
      <p className="mt-2 line-clamp-2 text-xs text-mist">{task.brief}</p>
      {working && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] text-mist">
            <span className="inline-flex items-center gap-1.5">
              <WorkingTicks />
              Working
            </span>
            <span className="font-mono">{width}%</span>
          </div>
          <div className="ad-work-bar">
            <span style={{ width: `${width}%` }} />
          </div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        {agent ? (
          <AgentAvatar
            file={agent.avatarFile}
            name={agent.name}
            size={20}
            status={working ? "working" : undefined}
          />
        ) : (
          <span className="size-5 rounded-full border border-dashed border-line" />
        )}
        <span className="truncate text-[11px] text-mist">{agent?.name ?? "Unassigned"}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <select
          className="min-h-10 rounded-[10px] border border-line bg-panel px-2 font-mono text-[11px] text-paper"
          value={task.agentId ?? ""}
          onChange={(event) => onAssign(event.target.value || null)}
        >
          <option value="">Assign</option>
          {agents.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <select
          className="min-h-10 rounded-[10px] border border-line bg-panel px-2 font-mono text-[11px] text-paper"
          value={task.status}
          onChange={(event) => onMove(event.target.value as TaskStatus)}
        >
          {COLUMNS.map((column) => (
            <option key={column.key} value={column.key}>
              {column.label}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}

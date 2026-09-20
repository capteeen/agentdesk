"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import { Button, Field, PriorityChip, inputClass } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { useDesk } from "@/lib/store";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export default function TasksPage() {
  const { tasks, desks, agents, addTask } = useDesk();
  const [query, setQuery] = useState("");
  const [deskId, setDeskId] = useState("all");
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [newDesk, setNewDesk] = useState(desks[0]?.id ?? "research");
  const [agentId, setAgentId] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [links, setLinks] = useState("");

  const rows = useMemo(() => {
    return tasks.filter((task) => {
      if (query && !`${task.title} ${task.code} ${task.brief}`.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (deskId !== "all" && task.deskId !== deskId) return false;
      if (status !== "all" && task.status !== status) return false;
      return true;
    });
  }, [tasks, query, deskId, status]);

  const assignees = agents.filter((agent) => !newDesk || agent.deskId === newDesk || !agent.deskId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Work</p>
          <h1 className="font-headline text-3xl font-semibold tracking-tight">Tasks</h1>
          <p className="mt-1 text-sm text-mist">Briefs live on desks, not in a single thread.</p>
        </div>
        <Button onClick={() => setOpen((value) => !value)}>{open ? "Close" : "Create task"}</Button>
      </div>

      {open && (
        <form
          className="ad-card grid gap-4 p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!title.trim()) return;
            addTask({
              title: title.trim(),
              brief,
              deskId: newDesk,
              agentId: agentId || null,
              priority,
              links: links ? links.split(",").map((item) => item.trim()) : undefined,
            });
            setTitle("");
            setBrief("");
            setLinks("");
            setOpen(false);
          }}
        >
          <Field label="Title">
            <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Desk">
            <select className={inputClass} value={newDesk} onChange={(e) => setNewDesk(e.target.value)}>
              {desks.map((desk) => (
                <option key={desk.id} value={desk.id}>
                  {desk.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assignee">
            <select className={inputClass} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">Unassigned</option>
              {assignees.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select
              className={inputClass}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Brief">
              <textarea className={`${inputClass} min-h-24 py-3`} value={brief} onChange={(e) => setBrief(e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Links">
              <input
                className={inputClass}
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder="https://… , https://…"
              />
            </Field>
          </div>
          <Button type="submit" className="sm:col-span-2">
            Queue task
          </Button>
        </form>
      )}

      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          className={`${inputClass} flex-1`}
          placeholder="Search tasks…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className={inputClass} value={deskId} onChange={(e) => setDeskId(e.target.value)}>
          <option value="all">All desks</option>
          {desks.map((desk) => (
            <option key={desk.id} value={desk.id}>
              {desk.name}
            </option>
          ))}
        </select>
        <select
          className={inputClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
        >
          <option value="all">All status</option>
          <option value="queue">Queue</option>
          <option value="progress">In progress</option>
          <option value="waiting">Waiting on you</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div className="ad-card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line font-mono text-[11px] uppercase tracking-wide text-mist">
            <tr>
              <th className="px-4 py-3 font-medium">Task</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Desk</th>
              <th className="px-4 py-3 font-medium">Assignee</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((task) => {
              const desk = desks.find((item) => item.id === task.deskId);
              const agent = agents.find((item) => item.id === task.agentId);
              return (
                <tr key={task.id} className="align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{task.title}</p>
                    <p className="font-mono text-[11px] text-mist">{task.code}</p>
                    <p className="mt-1 max-w-md text-xs text-mist">{task.brief}</p>
                  </td>
                  <td className="px-4 py-3">
                    <PriorityChip priority={task.priority} />
                  </td>
                  <td className="px-4 py-3">
                    {desk && (
                      <Link href={`/desks/${desk.id}`} className="text-signal hover:underline">
                        {desk.name}
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {agent ? (
                      <Link href={`/agents/${agent.id}`} className="inline-flex items-center gap-2">
                        <AgentAvatar file={agent.avatarFile} name={agent.name} size={22} status={agent.status} />
                        {agent.name}
                      </Link>
                    ) : (
                      <span className="text-mist">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] uppercase text-mist">{task.status}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-mist">
                    {task.history[0] ? (
                      <span suppressHydrationWarning>{relativeTime(task.history[0].at)}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

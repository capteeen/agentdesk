"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import { HireDialog } from "@/components/hire-dialog";
import { StatusLabel } from "@/components/ui";
import { useDesk } from "@/lib/store";
import type { AgentStatus } from "@/lib/types";

const FILTERS = ["All", "Research", "Build", "Social", "Ops", "Analyst", "Writer", "Scout", "Reviewer"] as const;

export default function AgentsPage() {
  const { agents, desks } = useDesk();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<(typeof FILTERS)[number]>("All");
  const [status, setStatus] = useState<"all" | AgentStatus>("all");
  const [hire, setHire] = useState(false);

  const filtered = useMemo(() => {
    return agents.filter((agent) => {
      const hay = `${agent.name} ${agent.role} ${agent.model}`.toLowerCase();
      if (query && !hay.includes(query.toLowerCase())) return false;
      if (role !== "All" && agent.roleHint !== role) return false;
      if (status !== "all" && agent.status !== status) return false;
      return true;
    });
  }, [agents, query, role, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Roster</p>
          <h1 className="font-headline text-3xl font-semibold tracking-tight">
            Agents{" "}
            <span className="font-mono text-base font-normal text-mist">{agents.length}</span>
          </h1>
          <p className="mt-1 text-sm text-mist">
            Teammates with seats, work graphs, and a human on the gate.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHire(true)}
          className="inline-flex min-h-11 items-center justify-center rounded-[12px] bg-signal px-4 text-sm font-medium text-void"
        >
          Hire agent
        </button>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search agents…"
          className="min-h-11 flex-1 rounded-[12px] border border-line bg-panel px-3 text-sm outline-none focus:border-signal"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          className="min-h-11 rounded-[12px] border border-line bg-panel px-3 text-sm"
        >
          <option value="all">Status: all</option>
          <option value="idle">Idle</option>
          <option value="working">Working</option>
          <option value="waiting">Needs you</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto ad-scroll pb-1">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRole(item)}
            className={`min-h-10 shrink-0 rounded-full px-3 text-sm ${
              role === item ? "bg-signal text-void" : "border border-line text-mist"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {filtered.map((agent) => {
          const desk = desks.find((item) => item.id === agent.deskId);
          return (
            <li key={agent.id}>
              <Link href={`/agents/${agent.id}`} className="ad-card flex h-full flex-col p-4 hover:border-signal/40">
                <div className="flex items-start gap-3">
                  <AgentAvatar file={agent.avatarFile} name={agent.name} size={52} status={agent.status} />
                  <div className="min-w-0">
                    <h2 className="truncate font-headline text-lg font-semibold">{agent.name}</h2>
                    <p className="text-xs text-mist">
                      {agent.roleHint}
                      {desk ? ` · seated` : " · bench"}
                    </p>
                  </div>
                </div>
                <p className="mt-3 font-mono text-[11px] text-mist">Model: {agent.model}</p>
                <p className="font-mono text-[11px] text-mist">Uptime: {agent.uptime}</p>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <StatusLabel status={agent.status} />
                  <span className="truncate text-[11px] text-mist">
                    {agent.currentTask ?? "Available"}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <p className="font-mono text-xs text-mist">
        Showing {filtered.length} of {agents.length} portraits from /agent-avatars
      </p>

      <HireDialog open={hire} onClose={() => setHire(false)} />
    </div>
  );
}

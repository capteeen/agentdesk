"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import { HireDialog } from "@/components/hire-dialog";
import { Button, LiveBadge, StatusLabel } from "@/components/ui";
import { WorkSetup } from "@/components/work-setup";
import { relativeTime } from "@/lib/format";
import { useDesk } from "@/lib/store";

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>();
  const { agents, desks, tasks, activity, pauseAgent, updateAgent, addTask } = useDesk();
  const [hire, setHire] = useState(false);
  const agent = agents.find((item) => item.id === params.id);

  if (!agent) {
    return (
      <div className="space-y-3">
        <h1 className="font-headline text-3xl font-semibold">Agent not found</h1>
        <Link href="/agents" className="text-signal hover:underline">
          Back to roster
        </Link>
      </div>
    );
  }

  const desk = desks.find((item) => item.id === agent.deskId);
  const mates = agents.filter((item) => item.deskId && item.deskId === agent.deskId);
  const seated = mates.length ? mates : [agent];
  const queue = tasks.filter((task) => task.agentId === agent.id);
  const feed = activity.filter((event) => event.agentId === agent.id);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AgentAvatar file={agent.avatarFile} name={agent.name} size={44} status={agent.status} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-headline text-xl font-semibold tracking-tight">{agent.name}</h1>
              {agent.status === "working" && <LiveBadge label="Working" />}
            </div>
            <p className="truncate text-xs text-mist">
              {agent.role}
              {desk ? (
                <>
                  {" · "}
                  <Link href={`/desks/${desk.id}`} className="text-signal hover:underline">
                    {desk.name}
                  </Link>
                </>
              ) : (
                " · Unseated"
              )}
              {agent.status === "working" && agent.currentTask ? ` · ${agent.currentTask}` : null}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <StatusLabel status={agent.status} />
          <Button variant="ghost" onClick={() => setHire(true)}>
            Hire another
          </Button>
        </div>
      </div>

      <WorkSetup
        agent={agent}
        mates={seated}
        deskKind={desk?.kind}
        onPersist={(patch) => updateAgent(agent.id, patch)}
        onPause={() => pauseAgent(agent.id)}
        canQueue={Boolean(agent.deskId)}
        onQueue={(title, brief) => {
          if (!agent.deskId) return;
          addTask({
            title,
            brief,
            deskId: agent.deskId,
            agentId: agent.id,
            priority: "medium",
          });
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="ad-card p-4 lg:col-span-2">
          <h2 className="font-headline text-lg font-semibold">Queue</h2>
          {queue.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No tasks on this seat.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {queue.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="font-mono text-[11px] text-mist">
                      {task.code} · {task.status}
                    </p>
                  </div>
                  <Link href={`/desks/${task.deskId}`} className="text-sm text-signal">
                    Desk
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ad-card space-y-3 p-4">
          <h2 className="font-headline text-lg font-semibold">Seat</h2>
          <p className="font-mono text-xs text-mist">Model · {agent.model}</p>
          <p className="font-mono text-xs text-mist">Uptime · {agent.uptime}</p>
          <p className="font-mono text-xs text-mist">File · {agent.avatarFile}</p>
          <div className="flex flex-wrap gap-1.5">
            {agent.tools.map((tool) => (
              <span key={tool} className="rounded-full bg-void px-2 py-1 font-mono text-[11px] text-mist">
                {tool}
              </span>
            ))}
          </div>
        </section>
      </div>

      <section className="ad-card p-4">
        <h2 className="font-headline text-lg font-semibold">Memory notes</h2>
        {agent.memoryNotes.length === 0 ? (
          <p className="mt-3 text-sm text-mist">No notes yet.</p>
        ) : (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-mist">
            {agent.memoryNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="ad-card p-4">
        <h2 className="font-headline text-lg font-semibold">Activity</h2>
        <ul className="mt-3 space-y-2">
          {feed.length === 0 && <li className="text-sm text-mist">Quiet on this seat.</li>}
          {feed.map((event) => (
            <li key={event.id} className="flex gap-3 font-mono text-xs text-mist">
              <span className="w-16 shrink-0" suppressHydrationWarning>
                {relativeTime(event.at)}
              </span>
              <span>{event.verb}</span>
            </li>
          ))}
        </ul>
      </section>

      <HireDialog open={hire} onClose={() => setHire(false)} defaultDeskId={agent.deskId} />
    </div>
  );
}

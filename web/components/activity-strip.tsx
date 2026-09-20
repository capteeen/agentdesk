"use client";

import Link from "next/link";
import { AgentAvatar } from "@/components/agent-avatar";
import { LiveBadge } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { useDesk } from "@/lib/store";

export function ActivityStrip({ limit = 6 }: { limit?: number }) {
  const { activity, agents } = useDesk();
  const rows = activity.slice(0, limit);

  return (
    <section className="ad-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-lg font-semibold">Live activity</h2>
            <LiveBadge />
          </div>
          <p className="text-sm text-mist">What the floor is doing right now.</p>
        </div>
        <Link href="/analytics" className="text-sm text-signal hover:underline">
          View usage
        </Link>
      </div>
      <ul className="divide-y divide-line">
        {rows.map((event) => {
          const agent = agents.find((item) => item.id === event.agentId);
          if (!agent) return null;
          const fresh = Date.now() - new Date(event.at).getTime() < 8000;
          const tone =
            event.kind === "completed"
              ? "text-ok"
              : event.kind === "needs-you"
                ? "text-lamp"
                : event.kind === "blocked"
                  ? "text-hot"
                  : "text-signal";
          return (
            <li
              key={event.id}
              className={`flex items-center gap-3 py-3 first:pt-0 last:pb-0 ${fresh ? "ad-live-row" : ""}`}
            >
              <span className={`size-2 shrink-0 rounded-full ${
                event.kind === "completed"
                  ? "bg-ok"
                  : event.kind === "needs-you"
                    ? "bg-lamp"
                    : event.kind === "blocked"
                      ? "bg-hot"
                      : "bg-signal ad-work-dot"
              }`} />
              <span className="hidden w-16 shrink-0 font-mono text-[11px] text-mist sm:block" suppressHydrationWarning>
                {relativeTime(event.at)}
              </span>
              <AgentAvatar
                file={agent.avatarFile}
                name={agent.name}
                size={28}
                status={event.kind === "progress" ? "working" : agent.status}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <Link href={`/agents/${agent.id}`} className="font-medium hover:text-signal">
                    {agent.name}
                  </Link>{" "}
                  <span className="text-mist">{event.verb}</span>
                </p>
                <p className="font-mono text-[11px] text-mist sm:hidden" suppressHydrationWarning>
                  {relativeTime(event.at)}
                </p>
              </div>
              <span className={`hidden font-mono text-[11px] uppercase sm:inline ${tone}`}>
                {event.kind === "needs-you" ? "Needs you" : event.kind}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

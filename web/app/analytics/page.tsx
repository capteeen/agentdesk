"use client";

import { useDesk } from "@/lib/store";

const COMPLETED = [18, 22, 19, 28, 24, 31, 36];
const WAIT = [3.2, 2.8, 2.4, 2.1, 2.6, 2.2, 1.9];
const UTIL = [62, 70, 74, 68, 77, 73, 76];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AnalyticsPage() {
  const { tasks, agents, pendingApprovals } = useDesk();
  const done = tasks.filter((task) => task.status === "done").length;
  const seated = agents.filter((agent) => agent.deskId);
  const working = seated.filter((agent) => agent.status === "working").length;
  const util = seated.length ? Math.round((working / seated.length) * 100) : 0;
  const blocked = agents.filter((agent) => agent.status === "blocked" || agent.status === "waiting");

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Floor</p>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-mist">Mock week. Realtime wiring comes later.</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Tasks completed" value={String(done)} hint="+12% vs last week" />
        <Stat label="Approval wait" value="2.1h" hint="Lamp time on the gate" />
        <Stat label="Agent utilization" value={`${util}%`} hint={`${working} of ${seated.length} seated working`} />
      </div>

      <section className="ad-card p-5">
        <h2 className="font-headline text-lg font-semibold">Tasks completed</h2>
        <Spark values={COMPLETED} />
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="ad-card p-5">
          <h2 className="font-headline text-lg font-semibold">Approval wait (hours)</h2>
          <Spark values={WAIT} />
        </section>
        <section className="ad-card p-5">
          <h2 className="font-headline text-lg font-semibold">Utilization</h2>
          <Spark values={UTIL} suffix="%" />
        </section>
      </div>

      <section className="ad-card p-5">
        <h2 className="font-headline text-lg font-semibold">Quiet hours / blocked</h2>
        <p className="mt-1 text-sm text-mist">
          {pendingApprovals.length} actions still need you. {blocked.length} agents are waiting or blocked.
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {blocked.slice(0, 6).map((agent) => (
            <li key={agent.id} className="flex justify-between gap-3 border-b border-line py-2 last:border-0">
              <span>{agent.name}</span>
              <span className="text-lamp">{agent.currentTask ?? "Needs you"}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="ad-card p-4">
      <p className="text-xs uppercase tracking-wide text-mist">{label}</p>
      <p className="mt-2 font-headline text-3xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-ok">{hint}</p>
    </div>
  );
}

function Spark({ values, suffix = "" }: { values: number[]; suffix?: string }) {
  const max = Math.max(...values);
  return (
    <div className="mt-4">
      <div className="flex h-36 items-end gap-2">
        {values.map((value, index) => (
          <div key={DAYS[index]} className="flex flex-1 flex-col items-center gap-2">
            <div
              className="w-full rounded-t-[8px] bg-signal"
              style={{ height: `${Math.max(8, (value / max) * 100)}%` }}
            />
            <span className="font-mono text-[10px] text-mist">{DAYS[index]}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 font-mono text-xs text-mist">
        Latest {values[values.length - 1]}
        {suffix}
      </p>
    </div>
  );
}

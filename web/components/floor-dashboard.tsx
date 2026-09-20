"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import {
  agentDelta,
  agentQuote,
  CHART,
  CHART_MARKS,
  formatDelta,
  formatIndex,
  floorMetrics,
  tickerOf,
  type FloorFilter,
  type FloorRange,
  RANGES,
} from "@/lib/dashboard";
import { useDesk } from "@/lib/store";
import type { DeskKind } from "@/lib/types";

const DESK_DOT: Record<DeskKind, string> = {
  research: "bg-signal",
  build: "bg-lamp",
  social: "bg-paper",
  ops: "bg-hot",
};

const DESK_BAR: Record<DeskKind, string> = {
  research: "bg-signal",
  build: "bg-lamp",
  social: "bg-paper",
  ops: "bg-[#ff7a3d]",
};

export function FloorDashboard() {
  const { desks, agents, tasks, pendingApprovals, activity } = useDesk();
  const [range, setRange] = useState<FloorRange>("1Y");
  const [filter, setFilter] = useState<FloorFilter>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const metrics = useMemo(
    () => floorMetrics({ desks, agents, tasks, pending: pendingApprovals, activity, filter }),
    [desks, agents, tasks, pendingApprovals, activity, filter],
  );

  const series = CHART[range];
  const watch = metrics.seated.slice(0, 4);
  const filterLabel =
    filter === "all" ? "All desks" : filter === "needs-you" ? "Needs you" : desks.find((desk) => desk.id === filter)?.name ?? "Filters";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="font-headline text-[22px] font-medium tracking-tight text-paper/90">
          Floor assets <span className="text-mist">Performance</span>
        </h1>
        <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-end">
          <HealthScore value={metrics.health} />
          <div className="relative">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 text-[13px] text-mist"
            >
              {filterLabel}
              <Chevron />
            </button>
            {filtersOpen && (
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-white/8 bg-[#12141C] py-1 shadow-xl">
                {([
                  ["all", "All desks"],
                  ["needs-you", "Needs you"],
                  ...desks.map((desk) => [desk.id, desk.name] as const),
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFilter(id);
                      setFiltersOpen(false);
                    }}
                    className={`flex w-full px-3 py-2 text-left text-sm ${
                      filter === id ? "text-paper" : "text-mist hover:text-paper"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.6fr)]">
        <section className="min-w-0">
          <p className="text-[13px] text-mist">Total output</p>
          <div className="mt-2 flex flex-wrap items-end gap-3">
            <p className="font-headline text-[44px] font-medium leading-none tracking-tight tabular-nums sm:text-[52px]">
              {formatIndex(metrics.total)}
            </p>
            <Delta value={metrics.totalDelta} />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-7">
            {metrics.deskLoads.map((row) => (
              <Link key={row.desk.id} href={`/desks/${row.desk.id}`} className="group min-w-0">
                <div className="flex items-center gap-2 text-[13px] text-mist">
                  <span className={`size-1.5 rounded-full ${DESK_DOT[row.desk.kind]}`} />
                  {row.desk.name}
                </div>
                <p className="mt-2 font-headline text-[26px] font-medium leading-none tracking-tight tabular-nums group-hover:text-signal">
                  {formatIndex(row.value)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <div className="min-w-0">
          <FloorChart range={range} onRange={setRange} series={series} live={metrics.beats} />
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {(watch.length ? watch : metrics.allSeated.slice(0, 4)).map((agent) => {
          const delta = agentDelta(agent);
          const quote = agentQuote(agent, metrics.beats);
          return (
            <Link
              key={agent.id}
              href={`/agents/${agent.id}`}
              className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-4 py-3.5 ring-1 ring-white/5 transition hover:ring-white/12"
            >
              <AgentAvatar file={agent.avatarFile} name={agent.name} size={38} status={agent.status} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-headline text-[14px] font-medium">{tickerOf(agent.name)}</span>
                  <span className="text-[13px] text-mist tabular-nums">{formatIndex(quote)}</span>
                </div>
                <div className={`mt-1 text-[12px] tabular-nums ${delta >= 0 ? "text-ok" : "text-hot"}`}>
                  {delta >= 0 ? "+" : ""}
                  {delta.toFixed(2)}%
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <article className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] text-paper/90">Allocation</h2>
              <p className="text-[13px] text-mist">Performance</p>
            </div>
            <span className="text-[12px] text-mist">Desk close</span>
          </div>
          <div className="mt-8 flex h-10 overflow-hidden rounded-md">
            {metrics.allocation.map((row) => (
              <div
                key={row.desk.id}
                className={DESK_BAR[row.desk.kind]}
                style={{ width: `${Math.max(row.pct, 4)}%` }}
                title={`${row.desk.name} ${row.pct}%`}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between gap-2 font-headline text-[22px] tabular-nums">
            {metrics.allocation.map((row) => (
              <span key={row.desk.id}>{row.pct}%</span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-mist">
            {metrics.allocation.map((row) => (
              <span key={row.desk.id} className="inline-flex items-center gap-1.5">
                <i className={`size-1.5 rounded-full ${DESK_DOT[row.desk.kind]}`} />
                {row.desk.name}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/5">
          <h2 className="text-[15px] text-paper/90">Risk score</h2>
          <p className="text-[13px] text-mist">Gate pressure</p>
          <Gauge value={metrics.risk} />
          <p className="mt-1 text-center text-[12px] text-mist">
            Stability {metrics.waiting.length ? "needs you" : "improved"}
          </p>
        </article>

        <article className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/5">
          <h2 className="text-[15px] text-paper/90">Floor insights</h2>
          <p className="mt-5 text-[14px] leading-relaxed text-mist">{metrics.insight}</p>
          <div className="mt-6 flex items-center gap-2">
            {metrics.allSeated.slice(0, 5).map((agent) => (
              <AgentAvatar
                key={agent.id}
                file={agent.avatarFile}
                name={agent.name}
                size={28}
                status={agent.status}
                className="ring-2 ring-[#0A0B10]"
              />
            ))}
            <Link href="/approvals" className="ml-auto text-[13px] text-signal hover:underline">
              Approvals
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

function FloorChart({
  range,
  onRange,
  series,
  live,
}: {
  range: FloorRange;
  onRange: (range: FloorRange) => void;
  series: (typeof CHART)[FloorRange];
  live: number;
}) {
  const headline = series.headline + live * 2.15;
  const { line, area, marks } = useMemo(() => chartGeometry(series.points), [series.points]);

  return (
    <section className="ad-ember relative min-w-0 overflow-hidden rounded-[22px] p-5 sm:min-h-[360px] sm:p-6">
      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[13px] text-white/70">Floor value</p>
          <div className="mt-1 flex flex-wrap items-end gap-3">
            <p className="font-headline text-[34px] font-medium leading-none tracking-tight text-white tabular-nums sm:text-[40px]">
              {formatIndex(headline)}
            </p>
            <Delta value={series.delta} light />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1 text-[12px] text-white/55">
          {RANGES.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onRange(item)}
              className={`rounded-md px-1.5 py-1 ${
                range === item ? "text-white" : "hover:text-white/80"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mt-6 h-[210px] sm:h-[240px]">
        <svg viewBox="0 0 1200 320" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="adEmberFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F8E7A8" stopOpacity="0.42" />
              <stop offset="70%" stopColor="#F8E7A8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#F8E7A8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[80, 160, 240].map((y) => (
            <line key={y} x1="0" x2="1200" y1={y} y2={y} stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="6 14" />
          ))}
          <path d={area} fill="url(#adEmberFill)" />
          <path d={line} fill="none" stroke="#F8E7A8" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
          {marks.map((mark) => (
            <circle key={`${mark.x}-${mark.y}`} cx={mark.x} cy={mark.y} r="7" fill="#F8E7A8" stroke="#ff2f12" strokeWidth="3" />
          ))}
        </svg>

        {CHART_MARKS.map((mark, index) => (
          <div
            key={mark.label}
            className="absolute hidden w-[138px] rounded-xl bg-[#111111] px-3 py-2 text-[11px] text-white shadow-lg sm:block"
            style={{
              left: `${mark.at * 100}%`,
              top: index === 0 ? "6%" : "38%",
              transform: "translateX(-12%)",
            }}
          >
            <div className="text-white/50">{mark.label}</div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <span className="tabular-nums">{formatIndex(mark.value)}</span>
              <span className="text-ok">{formatDelta(mark.delta)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 mt-2 flex justify-between gap-1 overflow-hidden font-mono text-[10px] uppercase tracking-wider text-white/50">
        {series.labels.map((label) => (
          <span key={label} className="shrink-0">
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function chartGeometry(points: number[]) {
  const w = 1200;
  const h = 320;
  const min = 20;
  const max = 90;
  const top = 48;
  const bottom = 250;
  const coords = points.map((point, index) => {
    const x = (index / Math.max(points.length - 1, 1)) * w;
    const y = top + (1 - (Math.min(max, Math.max(min, point)) - min) / (max - min)) * (bottom - top);
    return { x, y };
  });
  const line = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  const marks = [Math.round((points.length - 1) * 0.36), Math.round((points.length - 1) * 0.72)].map(
    (index) => coords[index],
  );
  return { line, area, marks };
}

function HealthScore({ value }: { value: number }) {
  const pips = 18;
  const filled = Math.round((value / 100) * pips);
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-end gap-[3px]" aria-hidden>
        {Array.from({ length: pips }, (_, index) => (
          <span
            key={index}
            className={`h-3 w-[5px] rounded-[1px] ${index < filled ? "bg-paper" : "bg-white/10"}`}
          />
        ))}
      </div>
      <p className="text-[13px] text-mist">
        <span className="font-medium text-paper">{value}</span> health Score
      </p>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const r = 78;
  const cx = 110;
  const cy = 100;
  const start = polar(cx, cy, r, 0);
  const end = polar(cx, cy, r, 1);
  const knob = polar(cx, cy, r, value / 100);
  const valueEnd = polar(cx, cy, r, value / 100);
  return (
    <div className="relative mx-auto mt-2 h-[150px] w-[220px]">
      <svg viewBox="0 0 220 140" className="h-full w-full" aria-hidden>
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${valueEnd.x} ${valueEnd.y}`}
          fill="none"
          stroke="#3DDC97"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle cx={knob.x} cy={knob.y} r="7" fill="#3DDC97" stroke="#0A0B10" strokeWidth="3" />
      </svg>
      <div className="absolute inset-x-0 top-[58%] text-center">
        <p className="font-headline text-[34px] font-medium leading-none tabular-nums">
          {value}
          <span className="text-[16px] text-mist">/100</span>
        </p>
      </div>
    </div>
  );
}

function polar(cx: number, cy: number, r: number, pct: number) {
  const angle = Math.PI * (1 - pct);
  return { x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
}

function Delta({ value, light = false }: { value: number; light?: boolean }) {
  const up = value >= 0;
  return (
    <span
      className={`mb-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] tabular-nums ${
        light
          ? up
            ? "bg-white/15 text-white"
            : "bg-black/20 text-white"
          : up
            ? "bg-ok/15 text-ok"
            : "bg-hot/15 text-hot"
      }`}
    >
      {formatDelta(value)}
    </span>
  );
}

function Chevron() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path d="M2 3.5 5 6.5 8 3.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDesk } from "@/lib/store";

const PAGES = [
  { href: "/dashboard", label: "Command", hint: "Floor performance" },
  { href: "/agents", label: "Agents", hint: "Roster and hiring" },
  { href: "/tasks", label: "Tasks", hint: "Queues across desks" },
  { href: "/approvals", label: "Approvals", hint: "Sends, spends, deletes" },
  { href: "/analytics", label: "Analytics", hint: "Weekly usage" },
  { href: "/settings", label: "Settings", hint: "Wallet and guardrails" },
];

export function CommandSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { agents, desks } = useDesk();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const id = window.setTimeout(() => inputRef.current?.focus(), 20);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const q = query.trim().toLowerCase();
  const pages = useMemo(
    () => PAGES.filter((item) => !q || `${item.label} ${item.hint}`.toLowerCase().includes(q)),
    [q],
  );
  const deskHits = useMemo(
    () => desks.filter((desk) => !q || `${desk.name} ${desk.blurb}`.toLowerCase().includes(q)),
    [desks, q],
  );
  const agentHits = useMemo(
    () =>
      agents
        .filter((agent) => agent.deskId)
        .filter((agent) => !q || `${agent.name} ${agent.role}`.toLowerCase().includes(q))
        .slice(0, 6),
    [agents, q],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close search" onClick={onClose} />
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/8 bg-[#111318] shadow-2xl">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search desks, agents, pages…"
          className="h-12 w-full border-b border-white/8 bg-transparent px-4 text-sm outline-none placeholder:text-mist"
        />
        <div className="max-h-[50vh] overflow-y-auto p-2">
          <Group title="Pages">
            {pages.map((item) => (
              <Row key={item.href} href={item.href} label={item.label} hint={item.hint} onClose={onClose} />
            ))}
          </Group>
          <Group title="Desks">
            {deskHits.map((desk) => (
              <Row key={desk.id} href={`/desks/${desk.id}`} label={desk.name} hint={desk.blurb} onClose={onClose} />
            ))}
          </Group>
          <Group title="Seated">
            {agentHits.map((agent) => (
              <Row
                key={agent.id}
                href={`/agents/${agent.id}`}
                label={agent.name}
                hint={agent.currentTask ?? agent.role}
                onClose={onClose}
              />
            ))}
          </Group>
        </div>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <div className="px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({
  href,
  label,
  hint,
  onClose,
}: {
  href: string;
  label: string;
  hint: string;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-white/5"
    >
      <span>{label}</span>
      <span className="truncate text-xs text-mist">{hint}</span>
    </Link>
  );
}

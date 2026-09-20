"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import {
  ADDABLE_NODES,
  NODE_WIDTH,
  PORT_COLOR,
  bezierPath,
  createNode,
  edgeExists,
  extractAgentPatch,
  fieldValue,
  findPort,
  fitGraph,
  portAnchor,
  portsCompatible,
  portsFor,
} from "@/lib/workflow";
import type {
  Agent,
  AgentWorkflow,
  DeskKind,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowPort,
} from "@/lib/types";

type Drag =
  | { mode: "pan"; x: number; y: number; panX: number; panY: number }
  | { mode: "node"; id: string; ox: number; oy: number }
  | {
      mode: "connect";
      from: string;
      fromPort: string;
      kind: WorkflowPort["kind"];
      x: number;
      y: number;
    };

export function WorkSetup({
  agent,
  mates,
  deskKind,
  onPersist,
  onQueue,
  onPause,
  canQueue,
}: {
  agent: Agent;
  mates: Agent[];
  deskKind?: DeskKind;
  onPersist: (patch: Partial<Agent>) => void;
  onQueue: (title: string, brief: string) => void;
  onPause: () => void;
  canQueue: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef(agent.workflow);
  const viewRef = useRef({ zoom: 0.92, pan: { x: 24, y: 64 } });
  const dragRef = useRef<Drag | null>(null);
  const [graph, setGraph] = useState<AgentWorkflow>(agent.workflow);
  const [zoom, setZoom] = useState(0.92);
  const [pan, setPan] = useState({ x: 24, y: 64 });
  const [selected, setSelected] = useState<{ kind: "node" | "edge"; id: string } | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [composer, setComposer] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const composerRef = useRef<HTMLInputElement>(null);

  graphRef.current = graph;
  viewRef.current = { zoom, pan };
  dragRef.current = drag;

  useEffect(() => {
    setGraph(agent.workflow);
    setSelected(null);
    const frame = window.requestAnimationFrame(() => {
      const box = viewportRef.current?.getBoundingClientRect();
      if (!box) return;
      const next = fitGraph(agent.workflow.nodes, box.width, box.height);
      setZoom(next.zoom);
      setPan(next.pan);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [agent.id]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const box = el.getBoundingClientRect();
      const { zoom: current, pan: currentPan } = viewRef.current;
      const mx = event.clientX - box.left;
      const my = event.clientY - box.top;
      const nextZoom = Math.min(1.6, Math.max(0.45, current * (event.deltaY > 0 ? 0.92 : 1.08)));
      const worldX = (mx - currentPan.x) / current;
      const worldY = (my - currentPan.y) / current;
      const nextPan = { x: mx - worldX * nextZoom, y: my - worldY * nextZoom };
      setZoom(nextZoom);
      setPan(nextPan);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
      if (event.key === "Escape") {
        setDrag(null);
        setSelected(null);
        setAddOpen(false);
      }
      if (typing) return;
      if ((event.key === "Backspace" || event.key === "Delete") && selected) {
        event.preventDefault();
        removeSelection();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  const persist = (next: AgentWorkflow, flash = false) => {
    onPersist(extractAgentPatch(next));
    if (flash) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1400);
    }
  };

  const updateGraph = (recipe: (current: AgentWorkflow) => AgentWorkflow, write = false) => {
    const next = recipe(graphRef.current);
    graphRef.current = next;
    setGraph(next);
    if (write) persist(next);
  };

  const screenToWorld = (clientX: number, clientY: number) => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return { x: 0, y: 0 };
    return {
      x: (clientX - box.left - pan.x) / zoom,
      y: (clientY - box.top - pan.y) / zoom,
    };
  };

  const removeSelection = () => {
    if (!selected) return;
    updateGraph((current) => {
      if (selected.kind === "edge") {
        return { ...current, edges: current.edges.filter((edge) => edge.id !== selected.id) };
      }
      return {
        ...current,
        nodes: current.nodes.filter((node) => node.id !== selected.id),
        edges: current.edges.filter((edge) => edge.from !== selected.id && edge.to !== selected.id),
      };
    }, true);
    setSelected(null);
  };

  const onViewportPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, button, a")) return;
    if (target.closest("[data-port]")) return;
    if (target.closest("[data-node]")) return;
    if (target.closest("[data-edge]")) return;
    setSelected(null);
    setAddOpen(false);
    setDrag({ mode: "pan", x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = dragRef.current;
    if (!active) return;
    if (active.mode === "pan") {
      setPan({ x: active.panX + event.clientX - active.x, y: active.panY + event.clientY - active.y });
      return;
    }
    const world = screenToWorld(event.clientX, event.clientY);
    if (active.mode === "node") {
      const x = Math.round((world.x - active.ox) / 8) * 8;
      const y = Math.round((world.y - active.oy) / 8) * 8;
      updateGraph((current) => ({
        ...current,
        nodes: current.nodes.map((node) => (node.id === active.id ? { ...node, x, y } : node)),
      }));
      return;
    }
    setDrag({ ...active, x: world.x, y: world.y });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const active = dragRef.current;
    if (active?.mode === "node") persist(graphRef.current);
    if (active?.mode === "connect") {
      const hit = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-port]");
      const token = hit?.getAttribute("data-port");
      if (token) {
        const [toId, toPort] = token.split(":");
        const target = graphRef.current.nodes.find((node) => node.id === toId);
        const port = target ? findPort(target.type, toPort) : undefined;
        if (
          target &&
          port &&
          port.dir === "in" &&
          target.id !== active.from &&
          portsCompatible(active.kind, port.kind) &&
          !edgeExists(graphRef.current.edges, active.from, active.fromPort, target.id, port.id)
        ) {
          updateGraph(
            (current) => ({
              ...current,
              edges: [
                ...current.edges,
                {
                  id: `e-${Math.random().toString(36).slice(2, 8)}`,
                  from: active.from,
                  fromPort: active.fromPort,
                  to: target.id,
                  toPort: port.id,
                },
              ],
            }),
            true,
          );
        }
      }
    }
    setDrag(null);
  };

  const startNodeDrag = (event: ReactPointerEvent, node: WorkflowNode) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, select, button")) return;
    event.stopPropagation();
    const world = screenToWorld(event.clientX, event.clientY);
    setSelected({ kind: "node", id: node.id });
    setDrag({ mode: "node", id: node.id, ox: world.x - node.x, oy: world.y - node.y });
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const startConnect = (event: ReactPointerEvent, node: WorkflowNode, port: WorkflowPort) => {
    event.stopPropagation();
    event.preventDefault();
    const anchor = portAnchor(node, port.id);
    setDrag({
      mode: "connect",
      from: node.id,
      fromPort: port.id,
      kind: port.kind,
      x: anchor.x,
      y: anchor.y,
    });
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const patchField = (nodeId: string, key: string, value: string | number) => {
    updateGraph((current) => ({
      ...current,
      nodes: current.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              fields: node.fields.map((field) => (field.key === key ? { ...field, value } : field)),
            }
          : node,
      ),
    }), true);
  };

  const addNode = (type: WorkflowNodeType) => {
    const box = viewportRef.current?.getBoundingClientRect();
    const center = box
      ? { x: (box.width / 2 - pan.x) / zoom - NODE_WIDTH[type] / 2, y: (box.height / 2 - pan.y) / zoom - 40 }
      : { x: 420, y: 180 };
    const node = createNode(type, center.x, center.y, agent);
    updateGraph((current) => ({ ...current, nodes: [...current.nodes, node] }), true);
    setSelected({ kind: "node", id: node.id });
    setAddOpen(false);
  };

  const fit = () => {
    const box = viewportRef.current?.getBoundingClientRect();
    if (!box) return;
    const next = fitGraph(graph.nodes, box.width, box.height);
    setZoom(next.zoom);
    setPan(next.pan);
  };

  const copySetup = async () => {
    const lines = [
      `${graph.name} · ${agent.name}`,
      ...graph.nodes.map((node) => {
        const bits = node.fields.map((field) => `${field.label}: ${field.value}`).join(" · ");
        return `${node.title} — ${bits}`;
      }),
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const queueBrief = () => {
    const text = composer.trim();
    if (!text) {
      composerRef.current?.focus();
      return;
    }
    updateGraph((current) => {
      const brief = current.nodes.find((node) => node.type === "brief");
      if (!brief) return current;
      return {
        ...current,
        nodes: current.nodes.map((node) =>
          node.id === brief.id
            ? {
                ...node,
                fields: node.fields.map((field) =>
                  field.key === "text" ? { ...field, value: text } : field,
                ),
              }
            : node,
        ),
      };
    }, true);
    if (canQueue) onQueue(text.slice(0, 80), text);
    setComposer("");
  };

  const connecting = drag?.mode === "connect" ? drag : null;
  const working = agent.status === "working";
  const grid = 22 * zoom;

  return (
    <section className="ad-flow relative isolate min-h-[620px] overflow-hidden rounded-[22px] border border-white/6 lg:min-h-[760px] lg:h-[min(82vh,900px)]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, var(--ad-line) 1.15px, transparent 1.2px)",
          backgroundSize: `${grid}px ${grid}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4">
        <div className="pointer-events-auto flex min-w-0 items-center gap-3 rounded-full border border-white/8 bg-void/80 px-2.5 py-1.5 backdrop-blur">
          <div className="flex -space-x-2">
            {mates.slice(0, 3).map((mate) => (
              <AgentAvatar
                key={mate.id}
                file={mate.avatarFile}
                name={mate.name}
                size={22}
                status={mate.status}
              />
            ))}
          </div>
          <input
            value={graph.name}
            onChange={(event) =>
              updateGraph((current) => ({ ...current, name: event.target.value }), true)
            }
            className="w-[min(36vw,180px)] bg-transparent font-mono text-[11px] text-paper outline-none"
            aria-label="Work setup name"
          />
        </div>
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5">
          <div className="relative">
            <ToolButton onClick={() => setAddOpen((open) => !open)}>Add</ToolButton>
            {addOpen && (
              <ul className="absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-[12px] border border-line bg-panel py-1 shadow-xl">
                {ADDABLE_NODES.map((item) => (
                  <li key={item.type}>
                    <button
                      type="button"
                      onClick={() => addNode(item.type)}
                      className="flex w-full px-3 py-2 text-left text-sm text-paper hover:bg-void"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ToolButton onClick={fit}>Fit</ToolButton>
          <ToolButton onClick={() => persist(graph, true)}>{saved ? "Saved" : "Save"}</ToolButton>
          <ToolButton onClick={() => void copySetup()}>{copied ? "Copied" : "Share"}</ToolButton>
          <ToolButton onClick={onPause}>Pause</ToolButton>
        </div>
      </header>

      <div
        ref={viewportRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onPointerDown={onViewportPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="absolute left-0 top-0 origin-top-left will-change-transform"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          <svg className="pointer-events-none absolute overflow-visible" width={1} height={1}>
            {graph.edges.map((edge) => {
              const from = graph.nodes.find((node) => node.id === edge.from);
              const to = graph.nodes.find((node) => node.id === edge.to);
              if (!from || !to) return null;
              const a = portAnchor(from, edge.fromPort);
              const b = portAnchor(to, edge.toPort);
              const color = a.port ? PORT_COLOR[a.port.kind] : "#5B8CFF";
              const active = selected?.kind === "edge" && selected.id === edge.id;
              return (
                <g key={edge.id}>
                  <path
                    d={bezierPath(a.x, a.y, b.x, b.y)}
                    stroke="transparent"
                    strokeWidth={14}
                    fill="none"
                    className="cursor-pointer"
                    style={{ pointerEvents: "stroke" }}
                    data-edge={edge.id}
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      setSelected({ kind: "edge", id: edge.id });
                    }}
                  />
                  <path
                    d={bezierPath(a.x, a.y, b.x, b.y)}
                    stroke={active ? "#FFC857" : color}
                    strokeWidth={active ? 2.4 : 1.55}
                    fill="none"
                    strokeLinecap="round"
                    className={working ? "ad-flow-pulse" : undefined}
                    opacity={0.9}
                  />
                </g>
              );
            })}
            {connecting &&
              (() => {
                const from = graph.nodes.find((node) => node.id === connecting.from);
                if (!from) return null;
                const a = portAnchor(from, connecting.fromPort);
                return (
                  <path
                    d={bezierPath(a.x, a.y, connecting.x, connecting.y)}
                    stroke={PORT_COLOR[connecting.kind]}
                    strokeWidth={1.6}
                    strokeDasharray="5 6"
                    fill="none"
                  />
                );
              })()}
          </svg>

          {graph.nodes.map((node) => (
            <FlowNode
              key={node.id}
              node={node}
              agent={agent}
              deskKind={deskKind}
              selected={selected?.kind === "node" && selected.id === node.id}
              connecting={connecting}
              onPointerDown={(event) => startNodeDrag(event, node)}
              onConnect={startConnect}
              onChange={patchField}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-4">
        <form
          className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-void/85 p-1.5 pl-4 shadow-2xl backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault();
            queueBrief();
          }}
        >
          <input
            ref={composerRef}
            value={composer}
            onChange={(event) => setComposer(event.target.value)}
            placeholder={canQueue ? "Type what you want it to do" : "Seat this agent on a desk to queue work"}
            className="min-h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-mist/70"
          />
          <button
            type="submit"
            className="inline-flex size-10 items-center justify-center rounded-full bg-signal text-void"
            aria-label="Queue brief on this seat"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </form>
      </div>
    </section>
  );
}

function FlowNode({
  node,
  agent,
  deskKind,
  selected,
  connecting,
  onPointerDown,
  onConnect,
  onChange,
}: {
  node: WorkflowNode;
  agent: Agent;
  deskKind?: DeskKind;
  selected: boolean;
  connecting: Extract<Drag, { mode: "connect" }> | null;
  onPointerDown: (event: ReactPointerEvent) => void;
  onConnect: (event: ReactPointerEvent, node: WorkflowNode, port: WorkflowPort) => void;
  onChange: (nodeId: string, key: string, value: string | number) => void;
}) {
  const ports = portsFor(node.type);
  return (
    <article
      data-node={node.id}
      onPointerDown={onPointerDown}
      className={`ad-flow-node absolute select-none ${selected ? "ad-flow-node-on" : ""}`}
      style={{ left: node.x, top: node.y, width: NODE_WIDTH[node.type] }}
    >
      {ports.map((port) => {
        const hot =
          connecting &&
          port.dir === "in" &&
          node.id !== connecting.from &&
          portsCompatible(connecting.kind, port.kind);
        return (
          <button
            key={`${port.dir}-${port.id}`}
            type="button"
            data-port={`${node.id}:${port.id}`}
            aria-label={`${port.dir} ${port.label || port.kind}`}
            className={`ad-flow-port ${hot ? "ad-flow-port-hot" : ""}`}
            style={{
              top: port.dy,
              [port.dir === "in" ? "left" : "right"]: -5,
              background: PORT_COLOR[port.kind],
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
              if (port.dir === "out") onConnect(event, node, port);
            }}
          />
        );
      })}

      <header className="flex items-center justify-between gap-2 px-3 pt-2.5">
        <div className="flex items-center gap-2">
          {ports
            .filter((port) => port.dir === "in" && port.label)
            .slice(0, 1)
            .map((port) => (
              <span key={port.id} className="font-mono text-[10px] uppercase tracking-wide text-mist">
                {port.label}
              </span>
            ))}
          <h3 className="text-[13px] font-medium text-paper">{node.title}</h3>
        </div>
        <span className="size-1.5 rounded-full bg-ok/80" />
      </header>

      {node.type === "runner" && (
        <p className="px-3 pt-1 font-mono text-[10px] text-mist">
          {ports
            .filter((port) => port.dir === "in")
            .map((port) => port.label)
            .join(" · ")}
        </p>
      )}

      <div className="space-y-2 px-3 pb-3 pt-2">
        {node.type === "preview" ? (
          <ResultWell agent={agent} deskKind={deskKind} caption={String(fieldValue(node, "caption") ?? "")} />
        ) : (
          node.fields.map((field) => (
            <label key={field.key} className="block space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wide text-mist">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea
                  className="ad-flow-input min-h-[84px] resize-none py-2"
                  value={String(field.value)}
                  onChange={(event) => onChange(node.id, field.key, event.target.value)}
                />
              ) : field.type === "select" ? (
                <select
                  className="ad-flow-input"
                  value={String(field.value)}
                  onChange={(event) => onChange(node.id, field.key, event.target.value)}
                >
                  {(field.options ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="ad-flow-input"
                  type={field.type === "number" ? "number" : "text"}
                  step={field.type === "number" ? "0.1" : undefined}
                  value={field.value}
                  onChange={(event) =>
                    onChange(
                      node.id,
                      field.key,
                      field.type === "number" ? Number(event.target.value) : event.target.value,
                    )
                  }
                />
              )}
            </label>
          ))
        )}
      </div>
    </article>
  );
}

function ResultWell({
  agent,
  deskKind,
  caption,
}: {
  agent: Agent;
  deskKind?: DeskKind;
  caption: string;
}) {
  const working = agent.status === "working";
  return (
    <div className="space-y-2">
      <div className={`ad-flow-well ${deskKind ? `ad-flow-well-${deskKind}` : ""}`}>
        <span className="ad-flow-orb" />
        <span className="ad-flow-orb ad-flow-orb-2" />
        {working && <span className="ad-flow-well-scan" />}
        <div className="relative z-10 flex h-full flex-col justify-end p-3">
          <p className="text-[11px] font-medium leading-snug text-paper/95">
            {agent.currentTask ?? "Idle — waiting on a brief."}
          </p>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] leading-snug text-mist">{caption || agent.role}</p>
        <span className="font-mono text-[10px] text-mist">{working ? "live" : agent.status}</span>
      </div>
    </div>
  );
}

function ToolButton({ children, onClick }: { children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-9 items-center rounded-full border border-line bg-void/80 px-3 font-mono text-[11px] text-paper backdrop-blur hover:border-mist/40"
    >
      {children}
    </button>
  );
}

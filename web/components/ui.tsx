import type { AgentStatus, ApprovalType, TaskPriority } from "@/lib/types";
import type { ReactNode } from "react";

export function StatusDot({ status }: { status: AgentStatus }) {
  const color =
    status === "idle"
      ? "bg-ok"
      : status === "working"
        ? "bg-signal"
        : status === "waiting"
          ? "bg-lamp"
          : "bg-hot";
  return (
    <span
      className={`inline-block size-2 rounded-full ${color} ${
        status === "working" ? "ad-work-dot" : status === "waiting" ? "ad-lamp-dot" : ""
      }`}
    />
  );
}

export function WorkingTicks() {
  return (
    <span className="ad-typing" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <span className="ad-live-badge">
      <i />
      {label}
    </span>
  );
}

export function StatusLabel({ status }: { status: AgentStatus }) {
  const label =
    status === "idle"
      ? "Idle"
      : status === "working"
        ? "Working"
        : status === "waiting"
          ? "Needs you"
          : "Blocked";
  const cls =
    status === "idle"
      ? "text-ok bg-ok/10"
      : status === "working"
        ? "text-signal bg-signal/10"
        : status === "waiting"
          ? "text-lamp bg-lamp/10"
      : "text-hot bg-hot/10";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      <StatusDot status={status} />
      {label}
    </span>
  );
}

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  const cls =
    priority === "high"
      ? "text-hot"
      : priority === "medium"
        ? "text-lamp"
        : "text-ok";
  return (
    <span className={`font-mono text-[11px] uppercase tracking-wide ${cls}`}>
      {priority}
    </span>
  );
}

export function ApprovalTypeChip({ type }: { type: ApprovalType }) {
  const label =
    type === "send"
      ? "Send"
      : type === "spend"
        ? "Spend"
        : type === "delete"
          ? "Delete"
          : "External post";
  return (
    <span className="rounded-full bg-void px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-mist">
      {label}
    </span>
  );
}

export function NeedsYou() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lamp/15 px-2 py-0.5 text-xs font-medium text-lamp">
      <span className="size-1.5 rounded-full bg-lamp" />
      Needs you
    </span>
  );
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  className = "",
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "lamp";
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-signal text-void hover:bg-signal-dim",
    ghost: "bg-transparent text-paper border border-line hover:border-mist/40",
    danger: "bg-transparent text-hot border border-hot/40 hover:bg-hot/10",
    lamp: "bg-lamp/15 text-lamp hover:bg-lamp/25",
  }[variant];
  const cls = `inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-medium transition ${styles} disabled:opacity-40 ${className}`;
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls} disabled={disabled}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-mist">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full min-h-11 rounded-[12px] border border-line bg-void px-3 text-sm text-paper outline-none placeholder:text-mist/70 focus:border-signal";

export type DeskKind = "research" | "build" | "social" | "ops";

export type AgentStatus = "idle" | "working" | "blocked" | "waiting";

export type TaskStatus = "queue" | "progress" | "waiting" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type ApprovalType = "send" | "spend" | "delete" | "external-post";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type ActivityKind = "completed" | "progress" | "needs-you" | "blocked";

export interface Desk {
  id: string;
  name: string;
  kind: DeskKind;
  blurb: string;
}

export type WorkflowPortKind = "prompt" | "model" | "gate" | "preview";

export type WorkflowNodeType = "model" | "brief" | "guardrail" | "runner" | "preview";

export interface WorkflowPort {
  id: string;
  label: string;
  dir: "in" | "out";
  kind: WorkflowPortKind;
  dy: number;
}

export interface WorkflowField {
  key: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  value: string | number;
  options?: string[];
}

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  x: number;
  y: number;
  title: string;
  fields: WorkflowField[];
}

export interface WorkflowEdge {
  id: string;
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

export interface AgentWorkflow {
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  roleHint: string;
  deskId: string | null;
  status: AgentStatus;
  avatarFile: string;
  model: string;
  tools: string[];
  prompt: string;
  currentTask?: string;
  memoryNotes: string[];
  uptime: string;
  workflow: AgentWorkflow;
}

export interface Task {
  id: string;
  code: string;
  title: string;
  brief: string;
  deskId: string;
  agentId: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due?: string;
  links?: string[];
  history: { at: string; label: string }[];
  workBeat?: number;
}

export interface Approval {
  id: string;
  type: ApprovalType;
  title: string;
  preview: string;
  agentId: string;
  deskId: string;
  status: ApprovalStatus;
  requestedAt: string;
  destination?: string;
  amount?: string;
  edited: boolean;
}

export interface ActivityEvent {
  id: string;
  at: string;
  agentId: string;
  verb: string;
  kind: ActivityKind;
}

export interface Toast {
  id: string;
  message: string;
  tone: "ok" | "lamp" | "hot";
}

export interface AvatarMeta {
  file: string;
  seed: string;
  style: string;
  roleHint: string;
}

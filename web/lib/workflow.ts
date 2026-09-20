import { slugify } from "./format";
import type {
  Agent,
  AgentWorkflow,
  WorkflowEdge,
  WorkflowField,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowPort,
  WorkflowPortKind,
} from "./types";

export const MODEL_OPTIONS = [
  "Llama 3.3 70B",
  "Qwen 2.5 Coder",
  "Mistral Small",
  "Command R+",
  "Claude Sonnet",
  "Claude Haiku",
  "Phi-3.5",
  "DeepSeek Coder",
  "GPT-4o mini",
  "Gemini Flash",
  "Kimi",
];

export const NODE_WIDTH: Record<WorkflowNodeType, number> = {
  model: 228,
  brief: 268,
  guardrail: 268,
  runner: 268,
  preview: 312,
};

export const PORT_COLOR: Record<WorkflowPortKind, string> = {
  prompt: "#3DDC97",
  model: "#FFC857",
  gate: "#FF8AD2",
  preview: "#5B8CFF",
};

export const NODE_PORTS: Record<WorkflowNodeType, WorkflowPort[]> = {
  model: [{ id: "out", label: "", dir: "out", kind: "model", dy: 20 }],
  brief: [
    { id: "in", label: "prompt", dir: "in", kind: "prompt", dy: 20 },
    { id: "out", label: "", dir: "out", kind: "prompt", dy: 20 },
  ],
  guardrail: [
    { id: "in", label: "guard", dir: "in", kind: "gate", dy: 20 },
    { id: "out", label: "", dir: "out", kind: "gate", dy: 20 },
  ],
  runner: [
    { id: "prompt", label: "prompt", dir: "in", kind: "prompt", dy: 20 },
    { id: "model", label: "model", dir: "in", kind: "model", dy: 44 },
    { id: "guard", label: "guard", dir: "in", kind: "gate", dy: 68 },
    { id: "out", label: "result", dir: "out", kind: "preview", dy: 20 },
  ],
  preview: [{ id: "in", label: "result", dir: "in", kind: "preview", dy: 20 }],
};

export const ADDABLE_NODES: { type: WorkflowNodeType; label: string }[] = [
  { type: "brief", label: "Brief" },
  { type: "guardrail", label: "Guardrail" },
  { type: "model", label: "Model" },
  { type: "runner", label: "Runner" },
  { type: "preview", label: "Preview" },
];

const DEFAULT_GUARD =
  "Never silent-send. Sends, spends, deletes, and external posts wait on Approvals.";

export type WorkflowSeed = Pick<Agent, "name" | "role" | "model" | "prompt">;

function field(
  key: string,
  label: string,
  type: WorkflowField["type"],
  value: string | number,
  options?: string[],
): WorkflowField {
  return { key, label, type, value, options };
}

export function portsFor(type: WorkflowNodeType) {
  return NODE_PORTS[type];
}

export function findPort(type: WorkflowNodeType, portId: string) {
  return NODE_PORTS[type].find((port) => port.id === portId);
}

export function portAnchor(node: WorkflowNode, portId: string) {
  const port = findPort(node.type, portId);
  const width = NODE_WIDTH[node.type];
  const dy = port?.dy ?? 20;
  const x = port?.dir === "out" ? node.x + width : node.x;
  return { x, y: node.y + dy, port };
}

export function bezierPath(x1: number, y1: number, x2: number, y2: number) {
  const dx = Math.max(64, Math.abs(x2 - x1) * 0.45);
  return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

export function fieldValue(node: WorkflowNode | undefined, key: string) {
  return node?.fields.find((item) => item.key === key)?.value;
}

export function createNode(type: WorkflowNodeType, x: number, y: number, seed?: Partial<WorkflowSeed>): WorkflowNode {
  const id = `n-${type}-${Math.random().toString(36).slice(2, 8)}`;
  switch (type) {
    case "model":
      return {
        id,
        type,
        x,
        y,
        title: "Model",
        fields: [
          field("model", "Checkpoint", "select", seed?.model ?? "Llama 3.3 70B", MODEL_OPTIONS),
          field("temperature", "Temperature", "number", 0.3),
          field("context", "Context", "select", "32k", ["8k", "32k", "128k"]),
        ],
      };
    case "brief":
      return {
        id,
        type,
        x,
        y,
        title: "Brief",
        fields: [
          field("text", "Positive", "textarea", seed?.prompt ?? "Type what you want it to do."),
        ],
      };
    case "guardrail":
      return {
        id,
        type,
        x,
        y,
        title: "Guardrail",
        fields: [field("text", "Negative", "textarea", DEFAULT_GUARD)],
      };
    case "runner":
      return {
        id,
        type,
        x,
        y,
        title: "Work runner",
        fields: [
          field("approval", "Approval gate", "select", "Always hold", [
            "Always hold",
            "Hold risky only",
          ]),
          field("steps", "Quality steps", "number", 28),
          field("sampling", "Sampling", "select", "Focused", ["Focused", "Balanced", "Wide"]),
          field("temperature", "Temperature", "number", 0.4),
        ],
      };
    case "preview":
      return {
        id,
        type,
        x,
        y,
        title: "Preview",
        fields: [field("caption", "Find result", "text", seed?.role ?? "Waiting on a brief")],
      };
  }
}

export function defaultWorkflow(seed: WorkflowSeed): AgentWorkflow {
  const model = createNode("model", 36, 248, seed);
  const brief = createNode("brief", 308, 36, seed);
  const guard = createNode("guardrail", 308, 300, seed);
  const runner = createNode("runner", 640, 148, seed);
  const preview = createNode("preview", 980, 96, seed);
  model.id = "wf-model";
  brief.id = "wf-brief";
  guard.id = "wf-guard";
  runner.id = "wf-run";
  preview.id = "wf-prev";

  const edges: WorkflowEdge[] = [
    { id: "wf-e1", from: brief.id, fromPort: "out", to: runner.id, toPort: "prompt" },
    { id: "wf-e2", from: guard.id, fromPort: "out", to: runner.id, toPort: "guard" },
    { id: "wf-e3", from: model.id, fromPort: "out", to: runner.id, toPort: "model" },
    { id: "wf-e4", from: runner.id, fromPort: "out", to: preview.id, toPort: "in" },
  ];

  return {
    name: `${slugify(seed.name)}-setup`,
    nodes: [model, brief, guard, runner, preview],
    edges,
  };
}

export function extractAgentPatch(workflow: AgentWorkflow): Pick<Agent, "model" | "prompt" | "workflow"> {
  const modelNode = workflow.nodes.find((node) => node.type === "model");
  const briefNode = workflow.nodes.find((node) => node.type === "brief");
  const guardNode = workflow.nodes.find((node) => node.type === "guardrail");
  const model = String(fieldValue(modelNode, "model") ?? "Llama 3.3 70B");
  const brief = String(fieldValue(briefNode, "text") ?? "").trim();
  const guard = String(fieldValue(guardNode, "text") ?? "").trim();
  const prompt = [brief, guard].filter(Boolean).join("\n\n");
  return { model, prompt, workflow };
}

export function portsCompatible(fromKind: WorkflowPortKind, toKind: WorkflowPortKind) {
  return fromKind === toKind;
}

export function edgeExists(edges: WorkflowEdge[], from: string, fromPort: string, to: string, toPort: string) {
  return edges.some(
    (edge) =>
      edge.from === from && edge.fromPort === fromPort && edge.to === to && edge.toPort === toPort,
  );
}

export function fitGraph(nodes: WorkflowNode[], width: number, height: number) {
  if (!nodes.length || width < 40 || height < 40) {
    return { zoom: 1, pan: { x: 48, y: 72 } };
  }
  const minX = Math.min(...nodes.map((node) => node.x)) - 36;
  const minY = Math.min(...nodes.map((node) => node.y)) - 20;
  const maxX = Math.max(...nodes.map((node) => node.x + NODE_WIDTH[node.type])) + 36;
  const maxY = Math.max(...nodes.map((node) => node.y + 320)) + 72;
  const w = Math.max(maxX - minX, 1);
  const h = Math.max(maxY - minY, 1);
  const zoom = Math.min(1.05, Math.max(0.45, Math.min((width - 56) / w, (height - 140) / h)));
  return {
    zoom,
    pan: {
      x: (width - w * zoom) / 2 - minX * zoom,
      y: (height - h * zoom) / 2 - minY * zoom + 6,
    },
  };
}

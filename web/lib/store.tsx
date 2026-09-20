"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { simulateFloor } from "./floor";
import { activity as seedActivity, agents as seedAgents, approvals as seedApprovals, desks as seedDesks, nextTaskCode, tasks as seedTasks } from "./mock";
import { slugify } from "./format";
import { defaultWorkflow } from "./workflow";
import type {
  ActivityEvent,
  Agent,
  AgentStatus,
  Approval,
  ApprovalStatus,
  Desk,
  DeskKind,
  Task,
  TaskPriority,
  TaskStatus,
  Toast,
} from "./types";

interface State {
  desks: Desk[];
  agents: Agent[];
  tasks: Task[];
  approvals: Approval[];
  activity: ActivityEvent[];
  toasts: Toast[];
}

type Action =
  | { type: "resolve-approval"; id: string; status: ApprovalStatus }
  | { type: "edit-approval"; id: string; preview: string }
  | { type: "add-task"; task: Task }
  | { type: "move-task"; id: string; status: TaskStatus }
  | { type: "assign-task"; id: string; agentId: string | null }
  | { type: "add-desk"; desk: Desk }
  | { type: "hire-agent"; agent: Agent }
  | { type: "update-agent"; id: string; patch: Partial<Agent> }
  | { type: "pause-agent"; id: string }
  | { type: "toast"; toast: Toast }
  | { type: "dismiss-toast"; id: string }
  | { type: "activity"; event: ActivityEvent }
  | { type: "apply-floor"; agents: Agent[]; tasks: Task[]; activity: ActivityEvent[] };

const initial: State = {
  desks: seedDesks,
  agents: seedAgents,
  tasks: seedTasks,
  approvals: seedApprovals,
  activity: seedActivity,
  toasts: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "resolve-approval":
      return {
        ...state,
        approvals: state.approvals.map((item) =>
          item.id === action.id ? { ...item, status: action.status } : item,
        ),
      };
    case "edit-approval":
      return {
        ...state,
        approvals: state.approvals.map((item) =>
          item.id === action.id
            ? { ...item, preview: action.preview, edited: true }
            : item,
        ),
      };
    case "add-task":
      return { ...state, tasks: [action.task, ...state.tasks] };
    case "move-task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id
            ? {
                ...task,
                status: action.status,
                history: [
                  { at: new Date().toISOString(), label: `Moved to ${action.status}` },
                  ...task.history,
                ],
              }
            : task,
        ),
      };
    case "assign-task":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, agentId: action.agentId } : task,
        ),
      };
    case "add-desk":
      return { ...state, desks: [...state.desks, action.desk] };
    case "hire-agent":
      return { ...state, agents: [action.agent, ...state.agents] };
    case "update-agent":
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.id ? { ...agent, ...action.patch } : agent,
        ),
      };
    case "pause-agent":
      return {
        ...state,
        agents: state.agents.map((agent) =>
          agent.id === action.id
            ? { ...agent, status: "idle" as AgentStatus, currentTask: undefined }
            : agent,
        ),
      };
    case "toast":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "dismiss-toast":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    case "activity":
      return { ...state, activity: [action.event, ...state.activity] };
    case "apply-floor":
      return {
        ...state,
        agents: action.agents,
        tasks: action.tasks,
        activity: action.activity,
      };
    default:
      return state;
  }
}

interface StoreValue extends State {
  pendingApprovals: Approval[];
  seatedAgents: (deskId?: string) => Agent[];
  approve: (id: string) => void;
  reject: (id: string) => void;
  editApproval: (id: string, preview: string) => void;
  addTask: (input: {
    title: string;
    brief: string;
    deskId: string;
    agentId: string | null;
    priority: TaskPriority;
    links?: string[];
  }) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  assignTask: (id: string, agentId: string | null) => void;
  addDesk: (input: { name: string; kind: DeskKind; blurb: string }) => string;
  hireAgent: (input: {
    name: string;
    role: string;
    deskId: string | null;
    prompt: string;
    tools: string[];
    avatarFile: string;
    model: string;
  }) => string;
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  pauseAgent: (id: string) => void;
  dismissToast: (id: string) => void;
  tickFloor: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function toastId() {
  return `toast-${Math.random().toString(36).slice(2, 9)}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const stateRef = useRef(state);
  stateRef.current = state;

  const value = useMemo<StoreValue>(() => {
    const pushToast = (message: string, tone: Toast["tone"] = "ok") => {
      const id = toastId();
      dispatch({ type: "toast", toast: { id, message, tone } });
      window.setTimeout(() => dispatch({ type: "dismiss-toast", id }), 3200);
    };

    const approve = (id: string) => {
      const item = state.approvals.find((approval) => approval.id === id);
      if (!item) return;
      dispatch({ type: "resolve-approval", id, status: "approved" });
      const message =
        item.type === "spend"
          ? "Approved. Spent."
          : item.type === "delete"
            ? "Approved. Deleted."
            : "Approved. Sent.";
      pushToast(message, "ok");
      dispatch({
        type: "activity",
        event: {
          id: `ac-${Date.now()}`,
          at: new Date().toISOString(),
          agentId: item.agentId,
          verb: `cleared “${item.title}” with you`,
          kind: "completed",
        },
      });
    };

    const reject = (id: string) => {
      const item = state.approvals.find((approval) => approval.id === id);
      if (!item) return;
      dispatch({ type: "resolve-approval", id, status: "rejected" });
      pushToast("Rejected. Nothing went out.", "hot");
      dispatch({
        type: "activity",
        event: {
          id: `ac-${Date.now()}`,
          at: new Date().toISOString(),
          agentId: item.agentId,
          verb: `held “${item.title}” — rejected`,
          kind: "blocked",
        },
      });
    };

    return {
      ...state,
      pendingApprovals: state.approvals.filter((item) => item.status === "pending"),
      seatedAgents: (deskId?: string) =>
        state.agents.filter((agent) =>
          deskId ? agent.deskId === deskId : Boolean(agent.deskId),
        ),
      approve,
      reject,
      editApproval: (id, preview) => {
        dispatch({ type: "edit-approval", id, preview });
        pushToast("Draft updated. Still waiting on you.", "lamp");
      },
      addTask: (input) => {
        const task: Task = {
          id: `t-${Date.now()}`,
          code: nextTaskCode(state.tasks, input.deskId),
          title: input.title,
          brief: input.brief,
          deskId: input.deskId,
          agentId: input.agentId,
          status: "queue",
          priority: input.priority,
          links: input.links,
          history: [{ at: new Date().toISOString(), label: "Opened" }],
        };
        dispatch({ type: "add-task", task });
        pushToast("Task queued.", "ok");
      },
      moveTask: (id, status) => dispatch({ type: "move-task", id, status }),
      assignTask: (id, agentId) => dispatch({ type: "assign-task", id, agentId }),
      addDesk: (input) => {
        let id = slugify(input.name);
        if (state.desks.some((desk) => desk.id === id)) id = `${id}-${Date.now()}`;
        dispatch({
          type: "add-desk",
          desk: { id, name: input.name, kind: input.kind, blurb: input.blurb },
        });
        pushToast("Desk opened.", "ok");
        return id;
      },
      hireAgent: (input) => {
        const id = `agt-${Date.now()}`;
        const agent: Agent = {
          id,
          name: input.name,
          role: input.role,
          roleHint: input.role,
          deskId: input.deskId,
          status: "idle",
          avatarFile: input.avatarFile,
          model: input.model,
          tools: input.tools,
          prompt: input.prompt,
          memoryNotes: [],
          uptime: "just seated",
          workflow: defaultWorkflow({
            name: input.name,
            role: input.role,
            model: input.model,
            prompt: input.prompt,
          }),
        };
        dispatch({ type: "hire-agent", agent });
        pushToast(input.deskId ? "Agent hired and seated." : "Agent hired to the bench.", "ok");
        return id;
      },
      updateAgent: (id, patch) => dispatch({ type: "update-agent", id, patch }),
      pauseAgent: (id) => {
        dispatch({ type: "pause-agent", id });
        pushToast("Agent paused.", "lamp");
      },
      dismissToast: (id) => dispatch({ type: "dismiss-toast", id }),
      tickFloor: () => {
        const next = simulateFloor(stateRef.current);
        dispatch({ type: "apply-floor", ...next });
      },
    };
  }, [state]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useDesk() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useDesk must be used inside StoreProvider");
  return ctx;
}

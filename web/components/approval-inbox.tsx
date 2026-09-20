"use client";

import Link from "next/link";
import { useState } from "react";
import { AgentAvatar } from "@/components/agent-avatar";
import { ApprovalTypeChip, Button, NeedsYou } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { useDesk } from "@/lib/store";
import type { Approval } from "@/lib/types";
import { useWallet } from "@/lib/wallet";

export function ApprovalInbox() {
  const { approvals, agents, desks, approve, reject, editApproval } = useDesk();
  const { requireConnect } = useWallet();
  const pending = approvals.filter((item) => item.status === "pending");
  const resolved = approvals.filter((item) => item.status !== "pending");

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Inbox</p>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Approvals</h1>
        <p className="max-w-2xl text-sm text-mist">
          Sends, spends, deletes, and external posts wait here. Browse the queue as a guest —
          clearing one asks for a Pump.fun wallet.
        </p>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-semibold">Pending</h2>
          <span className="font-mono text-xs text-lamp">{pending.length} need you</span>
        </div>
        {pending.length === 0 ? (
          <div className="ad-card p-6 text-sm text-mist">Clear floor. No gated actions waiting.</div>
        ) : (
          <ul className="space-y-3">
            {pending.map((item) => (
              <ApprovalCard
                key={item.id}
                item={item}
                agent={agents.find((agent) => agent.id === item.agentId)}
                deskName={desks.find((desk) => desk.id === item.deskId)?.name}
                onApprove={() => {
                  if (!requireConnect()) return;
                  approve(item.id);
                }}
                onReject={() => {
                  if (!requireConnect()) return;
                  reject(item.id);
                }}
                onEdit={(preview) => {
                  if (!requireConnect()) return;
                  editApproval(item.id, preview);
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-headline text-lg font-semibold">Resolved</h2>
          <ul className="space-y-2">
            {resolved.map((item) => {
              const agent = agents.find((agent) => agent.id === item.agentId);
              return (
                <li
                  key={item.id}
                  className="ad-card flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    {agent && <AgentAvatar file={agent.avatarFile} name={agent.name} size={28} />}
                    <div>
                      <p className="text-sm">{item.title}</p>
                      <p className="font-mono text-[11px] text-mist">{item.destination}</p>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-[11px] uppercase ${
                      item.status === "approved" ? "text-ok" : "text-hot"
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  agent,
  deskName,
  onApprove,
  onReject,
  onEdit,
}: {
  item: Approval;
  agent?: { id: string; name: string; avatarFile: string };
  deskName?: string;
  onApprove: () => void;
  onReject: () => void;
  onEdit: (preview: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.preview);

  return (
    <li className="ad-card p-4 sm:p-5">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ApprovalTypeChip type={item.type} />
            <NeedsYou />
            {item.edited && (
              <span className="rounded-full bg-signal/10 px-2 py-0.5 text-[11px] text-signal">
                Edited
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-mist" suppressHydrationWarning>
            Requested {relativeTime(item.requestedAt)}
          </p>
        </div>
        <div>
          <h3 className="font-headline text-xl font-semibold">{item.title}</h3>
          <p className="mt-1 text-sm text-mist">
            {agent ? (
              <Link href={`/agents/${agent.id}`} className="text-paper hover:text-signal">
                {agent.name}
              </Link>
            ) : (
              "Unknown agent"
            )}
            {deskName && (
              <>
                {" · "}
                <Link href={`/desks/${item.deskId}`} className="hover:text-signal">
                  {deskName}
                </Link>
              </>
            )}
            {item.destination && ` · ${item.destination}`}
            {item.amount && ` · ${item.amount}`}
          </p>
        </div>
        {editing ? (
          <textarea
            className="min-h-28 w-full rounded-[12px] border border-signal/40 bg-void p-3 font-mono text-sm text-paper outline-none"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
        ) : (
          <pre className="overflow-x-auto rounded-[12px] border border-line bg-void p-3 font-mono text-xs leading-relaxed text-paper whitespace-pre-wrap">
            {item.preview}
          </pre>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          {editing ? (
            <>
              <Button
                className="sm:min-w-32"
                onClick={() => {
                  onEdit(draft);
                  setEditing(false);
                }}
              >
                Save edit
              </Button>
              <Button
                variant="ghost"
                className="sm:min-w-32"
                onClick={() => {
                  setDraft(item.preview);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button className="sm:min-w-32" onClick={onApprove}>
                Approve
              </Button>
              <Button variant="ghost" className="sm:min-w-32" onClick={() => setEditing(true)}>
                Edit
              </Button>
              <Button variant="danger" className="sm:min-w-32" onClick={onReject}>
                Reject
              </Button>
            </>
          )}
        </div>
      </div>
      {agent && (
        <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
          <AgentAvatar file={agent.avatarFile} name={agent.name} size={24} />
          <span className="text-xs text-mist">Waiting on you — not sent.</span>
        </div>
      )}
    </li>
  );
}

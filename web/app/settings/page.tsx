"use client";

import { useState } from "react";
import { formatAddress } from "@/lib/format";
import { chainLabel, useWallet } from "@/lib/wallet";

export default function SettingsPage() {
  const { session, disconnect, openConnect } = useWallet();
  const [quiet, setQuiet] = useState(true);
  const [toasts, setToasts] = useState(true);
  const [autoAssign, setAutoAssign] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!session) return;
    await navigator.clipboard.writeText(session.address);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Operator</p>
        <h1 className="font-headline text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-mist">
          Explore as a guest. Connect a Pump.fun wallet when you need to approve a send or spend.
        </p>
      </header>

      <section className="ad-card space-y-4 p-5">
        <h2 className="font-headline text-lg font-semibold">Connected wallet</h2>
        {session ? (
          <>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-void font-mono text-xs text-signal">
                {session.address.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate font-mono text-sm">{formatAddress(session.address)}</p>
                <p className="text-sm text-mist">
                  {session.label} · {chainLabel(session.chainId)}
                </p>
              </div>
            </div>
            <p className="break-all font-mono text-[11px] text-mist">{session.address}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copy()}
                className="inline-flex min-h-11 items-center rounded-[12px] border border-line px-4 text-sm"
              >
                {copied ? "Copied" : "Copy address"}
              </button>
              <button
                type="button"
                onClick={disconnect}
                className="inline-flex min-h-11 items-center rounded-[12px] border border-hot/40 px-4 text-sm text-hot"
              >
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-mist">
              No wallet connected. The floor stays open — Phantom, Solflare, or Backpack when you&apos;re
              ready to sit.
            </p>
            <button
              type="button"
              onClick={openConnect}
              className="inline-flex min-h-11 items-center rounded-[12px] bg-signal px-4 text-sm font-medium text-void"
            >
              Connect Pump.fun wallet
            </button>
          </div>
        )}
      </section>

      <section className="ad-card divide-y divide-line">
        <Toggle
          title="Quiet hours"
          hint="22:00–07:00 — agents may queue, never page."
          on={quiet}
          onChange={setQuiet}
        />
        <Toggle
          title="Approval toasts"
          hint="“Approved. Sent.” after you clear the gate."
          on={toasts}
          onChange={setToasts}
        />
        <Toggle
          title="Auto-assign from bench"
          hint="Off. You seat people; the desk does not freelance."
          on={autoAssign}
          onChange={setAutoAssign}
        />
      </section>

      <section className="ad-card p-5">
        <h2 className="font-headline text-lg font-semibold">Guardrails</h2>
        <ul className="mt-3 space-y-2 text-sm text-mist">
          <li>Guests can browse desks, agents, tasks, and analytics without connecting.</li>
          <li>Sends, spends, deletes, and external posts always hit Approvals — and need a wallet to clear.</li>
          <li>No silent-send — even if a model asks.</li>
          <li>Desk data is still local. The wallet is a real Solana seat on Pump.fun rails.</li>
        </ul>
      </section>
    </div>
  );
}

function Toggle({
  title,
  hint,
  on,
  onChange,
}: {
  title: string;
  hint: string;
  on: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
    >
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-mist">{hint}</span>
      </span>
      <span className={`relative h-6 w-11 rounded-full ${on ? "bg-signal" : "bg-line"}`}>
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-paper transition ${
            on ? "left-5" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

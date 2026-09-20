"use client";

import { useEffect } from "react";
import { useWallet, type PumpWalletOption } from "@/lib/wallet";

export function WalletModal() {
  const { connectOpen, closeConnect, connecting, error, wallets, connect, connected } = useWallet();

  useEffect(() => {
    if (!connectOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeConnect();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [connectOpen, closeConnect]);

  if (!connectOpen || connected) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-void/75 backdrop-blur-[2px]"
        aria-label="Close wallet connect"
        onClick={closeConnect}
      />
      <div
        role="dialog"
        aria-labelledby="wallet-connect-title"
        className="relative w-full max-w-md overflow-hidden rounded-t-[22px] border border-line bg-panel shadow-2xl sm:rounded-[22px]"
      >
        <div className="pointer-events-none absolute inset-0 ad-gate-glow" />
        <div className="relative px-5 pb-5 pt-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal">Pump.fun wallets</p>
              <h2 id="wallet-connect-title" className="mt-2 font-headline text-2xl font-semibold tracking-tight">
                Connect to sit the desk.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-mist">
                Phantom, Solflare, or Backpack — same seat as Pump.fun. You can keep exploring without
                connecting; sends and spends still wait in Approvals.
              </p>
            </div>
            <button
              type="button"
              onClick={closeConnect}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-white/[0.04] text-mist ring-1 ring-white/8 hover:text-paper"
              aria-label="Close"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-2">
            {wallets.map((item, index) => {
              const waiting = connecting;
              return (
                <button
                  key={item.name}
                  type="button"
                  disabled={connecting}
                  onClick={() => void connect(item.name)}
                  className={`flex min-h-12 w-full items-center gap-3 rounded-[14px] border px-4 text-left text-sm disabled:opacity-60 ${
                    index === 0
                      ? "border-transparent bg-signal text-void"
                      : "border-line bg-void text-paper"
                  }`}
                >
                  <WalletGlyph option={item} />
                  <span className="flex-1 font-medium">{waiting ? `Waiting for ${item.name}…` : item.name}</span>
                  <span className="font-mono text-[11px] opacity-70">{item.installed ? "Detected" : item.hint}</span>
                </button>
              );
            })}
          </div>

          {error && (
            <p className="mt-4 rounded-[12px] border border-hot/30 bg-hot/10 px-3 py-2 text-sm text-hot">
              {error}
            </p>
          )}

          <p className="mt-5 font-mono text-[11px] leading-relaxed text-mist">
            Browse freely as a guest. Connecting only proves the seat — nothing leaves without you.
          </p>
        </div>
      </div>
    </div>
  );
}

function WalletGlyph({ option }: { option: PumpWalletOption }) {
  if (option.icon) {
    return (
      <img
        src={option.icon}
        alt=""
        width={22}
        height={22}
        className="size-[22px] rounded-md bg-void/40 object-contain"
      />
    );
  }
  return (
    <span className="grid size-[22px] place-items-center rounded-md bg-void/20 text-current" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 6.5h3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

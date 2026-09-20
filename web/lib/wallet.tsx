"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";

export interface WalletSession {
  address: string;
  provider: string;
  label: string;
  chainId?: string;
}

export type PumpWalletOption = {
  name: WalletName;
  url: string;
  hint: string;
  icon?: string;
  installed: boolean;
};

export const PUMP_WALLETS: { name: WalletName; url: string; hint: string }[] = [
  { name: "Phantom" as WalletName, url: "https://phantom.app/download", hint: "Used on Pump.fun" },
  { name: "Solflare" as WalletName, url: "https://solflare.com/download", hint: "Solana native" },
  { name: "Backpack" as WalletName, url: "https://backpack.app/download", hint: "xNFT wallet" },
];

export function chainLabel(chainId?: string | number) {
  if (chainId === "solana" || chainId === "pumpfun" || chainId == null) return "Pump.fun";
  return String(chainId);
}

function walletError(err: unknown) {
  if (!err || typeof err !== "object") return "Wallet request failed.";
  const item = err as { error?: { message?: string }; message?: string; name?: string };
  if (item.name === "WalletNotSelectedError") return "Pick a wallet first.";
  if (item.name === "WalletNotReadyError") {
    return "That wallet is not installed in this browser.";
  }
  if (item.name === "WalletConnectionError" || item.name === "WalletWindowClosedError") {
    return "Request rejected in the wallet.";
  }
  const text = item.error?.message ?? item.message ?? "Wallet request failed.";
  if (/rejected|denied|cancel|closed/i.test(text)) return "Request rejected in the wallet.";
  if (/not found|not installed|not detected/i.test(text)) {
    return "Wallet not found. Install Phantom, Solflare, or Backpack, then try again.";
  }
  return text;
}

interface WalletUiValue {
  connectOpen: boolean;
  openConnect: () => void;
  closeConnect: () => void;
}

const WalletUiContext = createContext<WalletUiValue | null>(null);

export function WalletUiProvider({ children }: { children: ReactNode }) {
  const [connectOpen, setConnectOpen] = useState(false);
  const openConnect = useCallback(() => setConnectOpen(true), []);
  const closeConnect = useCallback(() => setConnectOpen(false), []);

  const value = useMemo<WalletUiValue>(
    () => ({ connectOpen, openConnect, closeConnect }),
    [connectOpen, openConnect, closeConnect],
  );

  return <WalletUiContext.Provider value={value}>{children}</WalletUiContext.Provider>;
}

export function useWallet() {
  const ui = useContext(WalletUiContext);
  if (!ui) throw new Error("useWallet must be used inside WalletProviders");

  const {
    wallets,
    wallet,
    publicKey,
    connected,
    connecting,
    disconnecting,
    select,
    connect: connectAdapter,
    disconnect: disconnectAdapter,
  } = useSolanaWallet();

  const [localError, setLocalError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const pendingName = useRef<WalletName | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const session = useMemo<WalletSession | null>(() => {
    if (!connected || !publicKey) return null;
    const label = wallet?.adapter.name ?? "Wallet";
    return {
      address: publicKey.toBase58(),
      provider: label.toLowerCase(),
      label,
      chainId: "pumpfun",
    };
  }, [connected, publicKey, wallet]);

  useEffect(() => {
    if (connected) ui.closeConnect();
  }, [connected, ui.closeConnect]);

  const connect = useCallback(
    async (name: WalletName) => {
      setLocalError(null);
      const match = wallets.find((item) => item.adapter.name.toLowerCase() === name.toLowerCase());
      const ready = match?.readyState;
      if (!match || ready === WalletReadyState.NotDetected || ready === WalletReadyState.Unsupported) {
        const url = PUMP_WALLETS.find((item) => item.name.toLowerCase() === name.toLowerCase())?.url ?? match?.adapter.url;
        if (url && typeof window !== "undefined") window.open(url, "_blank", "noreferrer");
        setLocalError("Install that wallet, then come back and connect.");
        return;
      }

      const target = match.adapter.name;
      try {
        if (wallet?.adapter.name !== target) {
          pendingName.current = target;
          select(target);
          return;
        }
        pendingName.current = null;
        await connectAdapter();
      } catch (err) {
        pendingName.current = null;
        const message = walletError(err);
        setLocalError(message);
        throw err;
      }
    },
    [connectAdapter, select, wallet, wallets],
  );

  useEffect(() => {
    const name = pendingName.current;
    if (!name) return;
    if (wallet?.adapter.name !== name) return;
    let cancelled = false;
    connectAdapter()
      .catch((err) => {
        if (!cancelled) setLocalError(walletError(err));
      })
      .finally(() => {
        if (!cancelled && pendingName.current === name) pendingName.current = null;
      });
    return () => {
      cancelled = true;
    };
  }, [connectAdapter, wallet]);

  const options = useMemo<PumpWalletOption[]>(() => {
    const seen = new Set<string>();
    const list: PumpWalletOption[] = [];

    for (const catalog of PUMP_WALLETS) {
      const found = wallets.find((item) => item.adapter.name.toLowerCase() === catalog.name.toLowerCase());
      seen.add(catalog.name.toLowerCase());
      const ready = found?.readyState;
      const installed = ready === WalletReadyState.Installed || ready === WalletReadyState.Loadable;
      list.push({
        name: found?.adapter.name ?? catalog.name,
        url: catalog.url,
        hint: installed ? "Detected" : catalog.hint,
        icon: found?.adapter.icon,
        installed,
      });
    }

    for (const item of wallets) {
      const key = item.adapter.name.toLowerCase();
      if (seen.has(key)) continue;
      if (item.readyState === WalletReadyState.Unsupported) continue;
      const installed =
        item.readyState === WalletReadyState.Installed || item.readyState === WalletReadyState.Loadable;
      list.push({
        name: item.adapter.name,
        url: item.adapter.url,
        hint: installed ? "Detected" : "Browser",
        icon: item.adapter.icon,
        installed,
      });
    }

    return list;
  }, [wallets]);

  const requireConnect = useCallback(() => {
    if (connected) return true;
    ui.openConnect();
    return false;
  }, [connected, ui.openConnect]);

  return {
    ready: mounted,
    connected: Boolean(session),
    connecting: connecting || disconnecting,
    error: localError,
    session,
    wallets: options,
    connect,
    disconnect: () => {
      setLocalError(null);
      pendingName.current = null;
      void disconnectAdapter();
    },
    connectOpen: ui.connectOpen,
    openConnect: ui.openConnect,
    closeConnect: ui.closeConnect,
    requireConnect,
  };
}

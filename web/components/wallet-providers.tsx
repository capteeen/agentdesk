"use client";

import { Buffer } from "buffer";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useMemo, type ReactNode } from "react";
import { WalletUiProvider } from "@/lib/wallet";

if (typeof globalThis.Buffer === "undefined") {
  globalThis.Buffer = Buffer;
}

const LEGACY_DEMO_KEY = "agentdesk.wallet.v1";

export function WalletProviders({ children }: { children: ReactNode }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC ?? clusterApiUrl("mainnet-beta"),
    [],
  );

  useEffect(() => {
    window.localStorage.removeItem(LEGACY_DEMO_KEY);
    window.localStorage.removeItem("wagmi.store");
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletUiProvider>{children}</WalletUiProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

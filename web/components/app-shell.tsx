"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { CommandSearch } from "@/components/command-search";
import { formatAddress } from "@/lib/format";
import { useDesk } from "@/lib/store";
import { chainLabel, useWallet } from "@/lib/wallet";

const NAV = [
  { href: "/dashboard", label: "Command" },
  { href: "/agents", label: "Agents" },
  { href: "/tasks", label: "Tasks" },
  { href: "/approvals", label: "Approvals" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { desks, pendingApprovals, toasts, dismissToast } = useDesk();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pending = pendingApprovals.length;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (pathname === "/") return <>{children}</>;

  return (
    <div className="ad-app">
      <div className="ad-device">
        <header className="ad-topbar">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid size-7 place-items-center overflow-hidden rounded-lg bg-black ring-1 ring-white/10 shadow-[0_0_24px_rgba(125,255,213,.14)]">
              <Image src="/agentdesk-logo.png" alt="" width={28} height={28} className="size-7" priority />
            </span>
            <span className="font-headline text-[15px] font-semibold tracking-[-0.03em]">agentdesk</span>
            <span className="hidden rounded-full border border-ok/20 bg-ok/8 px-2 py-1 font-mono text-[8px] uppercase tracking-[.15em] text-ok sm:inline-flex">
              System live
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-5 overflow-x-auto lg:flex">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative whitespace-nowrap rounded-lg px-3 py-2 text-[12px] font-medium transition ${
                    active ? "bg-white/[0.06] text-paper" : "text-mist hover:bg-white/[0.03] hover:text-paper"
                  }`}
                >
                  {item.label}
                  {item.href === "/approvals" && pending > 0 && (
                    <span className="ml-1.5 align-middle text-[10px] text-lamp">{pending}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <IconButton label="Search" onClick={() => setSearchOpen(true)}>
              <SearchIcon />
            </IconButton>
            <Link
              href="/approvals"
              className="relative inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.035] text-mist ring-1 ring-white/8 transition hover:bg-white/[0.07] hover:text-paper"
              aria-label="Approvals"
            >
              <BellIcon />
              {pending > 0 && <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-lamp" />}
            </Link>
            <WalletButton
              menuOpen={menuOpen}
              onToggle={() => setMenuOpen((value) => !value)}
              onClose={() => setMenuOpen(false)}
            />
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.04] text-mist ring-1 ring-white/8 lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>
        </header>

        <MobileNav
          open={mobileOpen}
          pathname={pathname}
          pending={pending}
          desks={desks}
          onNavigate={() => setMobileOpen(false)}
        />

        <main className="ad-main">{children}</main>
      </div>

      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-[min(100%-2rem,360px)] flex-col gap-2">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismissToast(toast.id)}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 text-left text-sm shadow-lg ${
              toast.tone === "ok"
                ? "border-ok/30 bg-panel text-ok"
                : toast.tone === "hot"
                  ? "border-hot/30 bg-panel text-hot"
                  : "border-lamp/30 bg-panel text-lamp"
            }`}
          >
            {toast.message}
          </button>
        ))}
      </div>

      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function MobileNav({
  open,
  pathname,
  pending,
  desks,
  onNavigate,
}: {
  open: boolean;
  pathname: string;
  pending: number;
  desks: { id: string; name: string }[];
  onNavigate: () => void;
}) {
  if (!open) return null;

  return (
    <div className="border-b border-white/6 px-4 py-3 lg:hidden">
      <div className="flex flex-wrap gap-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-full px-3 py-1.5 text-[13px] ${
              isActive(pathname, item.href) ? "bg-white/8 text-paper" : "text-mist"
            }`}
          >
            {item.label}
            {item.href === "/approvals" && pending > 0 ? ` ${pending}` : ""}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {desks.map((desk) => (
          <Link
            key={desk.id}
            href={`/desks/${desk.id}`}
            onClick={onNavigate}
            className={`rounded-full px-3 py-1.5 text-[12px] ${
              pathname === `/desks/${desk.id}` ? "bg-white/8 text-paper" : "text-mist"
            }`}
          >
            {desk.name}
          </Link>
        ))}
        <Link href="/desks/new" onClick={onNavigate} className="rounded-full px-3 py-1.5 text-[12px] text-signal">
          New desk
        </Link>
      </div>
    </div>
  );
}

function WalletButton({
  menuOpen,
  onToggle,
  onClose,
}: {
  menuOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { session, openConnect } = useWallet();

  if (!session) {
    return (
      <button
        type="button"
        onClick={openConnect}
        className="inline-flex h-9 items-center rounded-xl bg-signal px-3.5 text-[12px] font-semibold text-void shadow-[0_8px_24px_rgba(125,255,213,.12)] transition hover:-translate-y-px hover:bg-signal-dim"
      >
        <span className="sm:hidden">Connect</span>
        <span className="hidden sm:inline">Connect wallet</span>
      </button>
    );
  }

  return <ProfileMenu session={session} open={menuOpen} onToggle={onToggle} onClose={onClose} />;
}

function ProfileMenu({
  session,
  open,
  onToggle,
  onClose,
}: {
  session: { address: string; label: string; chainId?: string };
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { disconnect } = useWallet();
  const address = session.address;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="grid size-9 place-items-center overflow-hidden rounded-full bg-[#2a2d36] font-mono text-[10px] text-paper ring-1 ring-white/10"
        aria-label="Account"
      >
        {address.slice(0, 2).toUpperCase()}
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-30" aria-label="Close account menu" onClick={onClose} />
          <div className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl border border-white/8 bg-[#12141C] p-3 shadow-2xl">
            <div className="px-1 pb-3">
              <div className="truncate font-mono text-xs text-paper">{formatAddress(address)}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-ok">
                <span className="ad-work-dot size-1.5 rounded-full bg-ok" />
                {session.label} · {chainLabel(session.chainId)}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/settings"
                onClick={onClose}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white/5 text-[12px] text-mist"
              >
                Wallet
              </Link>
              <button
                type="button"
                onClick={() => {
                  disconnect();
                  onClose();
                }}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-white/5 text-[12px] text-mist"
              >
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-xl bg-white/[0.035] text-mist ring-1 ring-white/8 transition hover:bg-white/[0.07] hover:text-paper"
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10.4 10.4 13.2 13.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 2.6a3.6 3.6 0 0 0-3.6 3.6v2.1l-.9 1.6h9l-.9-1.6V6.2A3.6 3.6 0 0 0 8 2.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path d="M6.4 12.4a1.6 1.6 0 0 0 3.2 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3 5h10M3 8h10M3 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

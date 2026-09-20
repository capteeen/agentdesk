/** Frozen clock so SSR and the client hydrate the same mock world. */
export const SEED_NOW = Date.parse("2026-09-20T00:17:00.000Z");

export function minutesAgo(minutes: number) {
  return new Date(SEED_NOW - minutes * 60_000).toISOString();
}

export function hoursAgo(hours: number) {
  return new Date(SEED_NOW - hours * 3_600_000).toISOString();
}

export function formatAddress(address: string) {
  if (address.length < 10) return address;
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function relativeTime(iso: string) {
  const stamp = new Date(iso).getTime();
  const now = stamp > SEED_NOW ? Date.now() : SEED_NOW;
  const delta = now - stamp;
  const mins = Math.max(0, Math.round(delta / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `desk-${Date.now()}`;
}

export function avatarSrc(file: string) {
  return `/agent-avatars/${file}`;
}

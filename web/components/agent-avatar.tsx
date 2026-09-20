import { avatarSrc } from "@/lib/format";
import type { AgentStatus } from "@/lib/types";

interface AgentAvatarProps {
  file: string;
  name: string;
  size?: number;
  className?: string;
  status?: AgentStatus;
}

export function AgentAvatar({
  file,
  name,
  size = 40,
  className = "",
  status,
}: AgentAvatarProps) {
  const working = status === "working";
  return (
    <span
      className={`relative inline-flex shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {working && <span className="ad-work-ring" />}
      <img
        src={avatarSrc(file)}
        alt={name}
        width={size}
        height={size}
        className="size-full rounded-full bg-void object-cover ring-1 ring-line"
      />
      {working && <span className="ad-work-scan" aria-hidden />}
    </span>
  );
}

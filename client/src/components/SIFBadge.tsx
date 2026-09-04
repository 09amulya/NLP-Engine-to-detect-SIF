import type { SIFLevel } from "../types";

interface SIFBadgeProps {
  level: SIFLevel;
}

export default function SIFBadge({
  level,
}: SIFBadgeProps) {

  return (
    <span
      className={`badge sif-${level.toLowerCase()}`}
    >
      <span className="badge-dot" />
      {level}
    </span>
  );
}
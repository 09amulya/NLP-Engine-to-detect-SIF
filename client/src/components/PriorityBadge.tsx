import type {
  HSEPriorityLevel,
} from "../types";

interface PriorityBadgeProps {
  priority: HSEPriorityLevel | "HIGH" | "MEDIUM" | "LOW";
}

export default function PriorityBadge({
  priority,
}: PriorityBadgeProps) {

  return (
    <span
      className={`badge priority-${priority.toLowerCase()}`}
    >
      <span className="badge-dot" />
      {priority}
    </span>
  );
}
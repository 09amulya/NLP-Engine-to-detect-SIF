import type { HSEPriorityItem } from "../types";
import PriorityBadge from "./PriorityBadge";

interface HSEPriorityCardProps {
  priority: HSEPriorityItem;
  onView: () => void;
}

export default function HSEPriorityCard({
  priority,
  onView,
}: HSEPriorityCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">

      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Priority #{priority.priority_rank}
          </p>

          <h3 className="mt-2 text-sm font-bold leading-5 text-slate-900">
            {priority.activity}
          </h3>

        </div>

        <PriorityBadge
          priority={priority.priority}
        />

      </div>


      {/* HAZARD */}

      <div className="mt-5">

        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          Hazard
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {priority.hazard}
        </p>

      </div>


      {/* METRICS */}

      <div className="mt-5 grid grid-cols-3 gap-2">

        <Metric
          value={priority.occurrence_count}
          label="Occurrences"
        />

        <Metric
          value={priority.high_sif_count}
          label="HIGH SIF"
        />

        <Metric
          value={priority.countries.length}
          label="Countries"
        />

      </div>


      {/* SCORE */}

      <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">

        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          HSE Priority Score
        </span>

        <span className="text-lg font-bold text-slate-900">
          {priority.hse_priority_score}
        </span>

      </div>


      {/* RECOMMENDATION */}

      <div className="mt-4">

        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          Recommendation
        </p>

        <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">
          {priority.recommendation}
        </p>

      </div>


      {/* ACTION */}

      <button
        onClick={onView}
        className="mt-5 w-full rounded-lg border border-slate-200 py-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        Investigate Priority →
      </button>

    </div>
  );
}


function Metric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">

      <p className="text-base font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

    </div>
  );
}
import type { PrecursorPattern } from "../types";
import PriorityBadge from "./PriorityBadge";

interface PrecursorCardProps {
  pattern: PrecursorPattern;
  onView?: () => void;
}

export default function PrecursorCard({
  pattern,
  onView,
}: PrecursorCardProps) {
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-sm">

      {/* TOP */}

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            {pattern.pattern_id}
          </p>

          <h3 className="mt-2 text-sm font-bold leading-5 text-slate-900">
            {pattern.activity}
          </h3>

        </div>

        <PriorityBadge
          priority={pattern.priority}
        />

      </div>


      {/* HAZARD */}

      <div className="mt-5">

        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          Hazard
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-700">
          {pattern.hazard}
        </p>

      </div>


      {/* BARRIER */}

      <div className="mt-4">

        <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
          Barrier Failure
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {pattern.barrier_failure}
        </p>

      </div>


      {/* LSR */}

      <div className="mt-4 flex flex-wrap gap-1.5">

        {pattern.related_lsrs.map(
          (lsr) => (

            <span
              key={lsr}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-medium text-slate-600"
            >
              {lsr}
            </span>

          )
        )}

      </div>


      {/* METRICS */}

      <div className="mt-5 grid grid-cols-3 gap-2">

        <Metric
          value={pattern.occurrence_count}
          label="Occurrences"
        />

        <Metric
          value={pattern.high_sif_count}
          label="HIGH SIF"
        />

        <Metric
          value={pattern.countries.length}
          label="Countries"
        />

      </div>


      {/* FOOTER */}

      <button
        onClick={onView}
        className="mt-5 w-full rounded-lg border border-slate-200 py-2.5 text-[10px] font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
      >
        View Pattern Details →
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

      <p className="mt-0.5 text-[8px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

    </div>
  );
}
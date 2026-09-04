import { useEffect, useState } from "react";

type Priority = {
  priority_rank: number;
  pattern_id: string;
  priority: string;
  hse_priority_score: number;
  activity: string;
  hazard: string;
  barrier_failure: string;
  related_lsrs: string[];
  countries: string[];
  occurrence_count: number;
  high_sif_count: number;
  medium_sif_count: number;
  recommendation: string;
  report_ids: string[];
};

type InterventionData = {
  pattern_id: string;
  hse_priority: Priority;
  precursor: Priority;
  related_reports: any[];
};

const API_URL = "http://127.0.0.1:8000";

export default function InterventionMonitoring() {
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [selected, setSelected] = useState<InterventionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/interventions/priorities`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch priorities");
        }
        return res.json();
      })
      .then((data) => {
        setPriorities(data.priorities || []);

        if (data.priorities?.length > 0) {
          loadIntervention(data.priorities[0].pattern_id);
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to connect to FastAPI.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const loadIntervention = async (patternId: string) => {
    try {
      const res = await fetch(
        `${API_URL}/interventions/${patternId}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch intervention data");
      }

      const data = await res.json();
      setSelected(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load intervention details.");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading intervention data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="font-semibold text-red-700">
            Connection Error
          </h2>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <p className="mt-2 text-xs text-gray-500">
            Make sure FastAPI is running on port 8000.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Intervention Monitoring
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Track HSE interventions and monitor observed trends in future
          safety reports.
        </p>
      </div>

      {/* Status Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <div className="text-xl">⚠️</div>

          <div>
            <h2 className="font-semibold text-amber-900">
              Intervention Monitoring
            </h2>

            <p className="mt-1 text-sm text-amber-800">
              The system identifies priority precursor patterns and
              provides HSE recommendations. Effectiveness is monitored
              only after an actual intervention is recorded.
            </p>
          </div>
        </div>
      </div>

      {/* Priority Selection */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Priority List */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-100 p-5">
            <h2 className="font-semibold text-gray-900">
              HSE Priorities
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {priorities.length} precursor patterns identified
            </p>
          </div>

          <div className="max-h-[600px] overflow-y-auto">

            {priorities.map((item) => (
              <button
                key={item.pattern_id}
                onClick={() => loadIntervention(item.pattern_id)}
                className={`w-full border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                  selected?.pattern_id === item.pattern_id
                    ? "bg-gray-50"
                    : ""
                }`}
              >

                <div className="flex items-center justify-between">

                  <span className="font-semibold text-gray-900">
                    {item.pattern_id}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.priority === "CRITICAL"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "HIGH"
                        ? "bg-orange-100 text-orange-700"
                        : item.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.priority}
                  </span>

                </div>

                <p className="mt-2 line-clamp-2 text-xs text-gray-500">
                  {item.activity}
                </p>

                <div className="mt-2 text-xs text-gray-400">
                  HSE Score: {item.hse_priority_score}
                </div>

              </button>
            ))}

          </div>
        </div>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">

          {selected && (
            <>
              {/* Main Priority */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-100 p-6">

                  <div className="flex flex-wrap items-center justify-between gap-3">

                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Precursor Pattern
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-gray-900">
                        {selected.pattern_id}
                      </h2>
                    </div>

                    <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                      {selected.hse_priority.priority}
                    </span>

                  </div>

                </div>

                {/* KPI row */}
                <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100 md:grid-cols-4">

                  <div className="p-5">
                    <p className="text-xs text-gray-500">
                      HSE Priority Score
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selected.hse_priority.hse_priority_score}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-500">
                      Occurrences
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selected.hse_priority.occurrence_count}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-500">
                      High SIF
                    </p>
                    <p className="mt-1 text-2xl font-bold text-red-600">
                      {selected.hse_priority.high_sif_count}
                    </p>
                  </div>

                  <div className="p-5">
                    <p className="text-xs text-gray-500">
                      Reports
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selected.hse_priority.report_ids.length}
                    </p>
                  </div>

                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Activity
                    </p>
                    <p className="mt-2 text-sm text-gray-800">
                      {selected.hse_priority.activity}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Hazard
                    </p>
                    <p className="mt-2 text-sm text-gray-800">
                      {selected.hse_priority.hazard}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Barrier Failure
                    </p>
                    <p className="mt-2 text-sm text-gray-800">
                      {selected.hse_priority.barrier_failure}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Related Life-Saving Rules
                    </p>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.hse_priority.related_lsrs.map((lsr) => (
                        <span
                          key={lsr}
                          className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                        >
                          {lsr}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* HSE Recommendation */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  HSE Recommendation
                </p>

                <p className="mt-2 text-sm leading-6 text-blue-900">
                  {selected.hse_priority.recommendation}
                </p>

              </div>

              {/* Intervention Status */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Intervention Status
                    </p>

                    <h3 className="mt-2 text-lg font-semibold text-gray-900">
                      Awaiting HSE Intervention
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      No actual intervention has been recorded for this
                      precursor pattern yet.
                    </p>
                  </div>

                  <button
                    className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
                    onClick={() =>
                      alert(
                        "Intervention recording will be connected next."
                      )
                    }
                  >
                    Record Intervention
                  </button>

                </div>

              </div>

              {/* Effectiveness */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Intervention Effectiveness
                </p>

                <div className="mt-4 rounded-lg bg-gray-50 p-5">

                  <p className="font-semibold text-gray-700">
                    Not available yet
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Effectiveness will be assessed after an intervention
                    is recorded and sufficient future safety-report data
                    becomes available.
                  </p>

                </div>

              </div>

              {/* Supporting Reports */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Supporting Reports
                    </p>

                    <h3 className="mt-1 text-lg font-semibold text-gray-900">
                      {selected.hse_priority.report_ids.length} reports
                    </h3>
                  </div>

                  <span className="text-xs text-gray-400">
                    Evidence from analyzed safety reports
                  </span>

                </div>

                <div className="mt-4 space-y-3">

                  {selected.hse_priority.report_ids.map((id) => (
                    <div
                      key={id}
                      className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {id}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Supporting evidence for {selected.pattern_id}
                      </p>
                    </div>
                  ))}

                </div>

              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
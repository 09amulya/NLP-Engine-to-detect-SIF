import { useMemo, useState } from "react";

import priorities from "../data/hse_priorities.json";

import type {
  HSEPriorityItem,
  HSEPriorityLevel,
} from "../types";

import PriorityBadge from "../components/PriorityBadge";
import HSEPriorityCard from "../components/HSEPriorityCard";


const hsePriorities =
  priorities as HSEPriorityItem[];


type Filter =
  | "ALL"
  | HSEPriorityLevel;


export default function HSEPriorities() {

  const [filter, setFilter] =
    useState<Filter>("ALL");

  const [search, setSearch] =
    useState("");

  const [selectedPriority, setSelectedPriority] =
    useState<HSEPriorityItem | null>(null);


  /* =========================
     KPI DATA
  ========================= */

  const criticalCount =
    hsePriorities.filter(
      (item) =>
        item.priority === "CRITICAL"
    ).length;


  const highCount =
    hsePriorities.filter(
      (item) =>
        item.priority === "HIGH"
    ).length;


  const mediumCount =
    hsePriorities.filter(
      (item) =>
        item.priority === "MEDIUM"
    ).length;


  /* =========================
     FILTER
  ========================= */

  const filteredPriorities =
    useMemo(() => {

      const query =
        search.toLowerCase().trim();

      return hsePriorities.filter(
        (item) => {

          const matchesSearch =
            !query ||
            item.pattern_id
              .toLowerCase()
              .includes(query) ||
            item.activity
              .toLowerCase()
              .includes(query) ||
            item.hazard
              .toLowerCase()
              .includes(query) ||
            item.barrier_failure
              .toLowerCase()
              .includes(query);

          const matchesFilter =
            filter === "ALL" ||
            item.priority === filter;

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );

    }, [search, filter]);


  /* =========================
     DETAIL VIEW
  ========================= */

  if (selectedPriority) {

    return (
      <PriorityDetails
        priority={selectedPriority}
        onBack={() =>
          setSelectedPriority(null)
        }
      />
    );
  }


  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* PAGE HEADER */}

      <div className="flex items-end justify-between">

        <div>

          <div className="mb-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-red-600">
            HSE decision support
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            HSE Priorities
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Prioritize recurring precursor patterns
            requiring HSE attention.
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-right">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Priority Patterns
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {hsePriorities.length}
          </p>

        </div>

      </div>


      {/* KPI CARDS */}

      <div className="grid grid-cols-4 gap-4">

        <StatCard
          label="Critical"
          value={criticalCount}
          icon="🔴"
          tone="red"
        />

        <StatCard
          label="High"
          value={highCount}
          icon="▲"
          tone="orange"
        />

        <StatCard
          label="Medium"
          value={mediumCount}
          icon="!"
          tone="amber"
        />

        <StatCard
          label="Total Patterns"
          value={hsePriorities.length}
          icon="◆"
          tone="slate"
        />

      </div>


      {/* TOP PRIORITY */}

      {hsePriorities[0] && (

        <section className="rounded-xl border border-red-100 bg-white p-6">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                #1 HSE Priority
              </p>

              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {hsePriorities[0].activity}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {hsePriorities[0].hazard}
              </p>

            </div>


            <PriorityBadge
              priority={
                hsePriorities[0].priority
              }
            />

          </div>


          <div className="mt-6 grid grid-cols-4 gap-3">

            <PriorityMetric
              label="HSE Score"
              value={
                hsePriorities[0]
                  .hse_priority_score
              }
            />

            <PriorityMetric
              label="Occurrences"
              value={
                hsePriorities[0]
                  .occurrence_count
              }
            />

            <PriorityMetric
              label="HIGH SIF"
              value={
                hsePriorities[0]
                  .high_sif_count
              }
            />

            <PriorityMetric
              label="Countries"
              value={
                hsePriorities[0]
                  .countries.length
              }
            />

          </div>


          <div className="mt-5 grid grid-cols-2 gap-5">

            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Recurring Barrier Failure
              </p>

              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">
                {
                  hsePriorities[0]
                    .barrier_failure
                }
              </p>

            </div>


            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                Related Life-Saving Rules
              </p>

              <div className="mt-2 flex flex-wrap gap-2">

                {hsePriorities[0]
                  .related_lsrs
                  .map((lsr) => (

                    <span
                      key={lsr}
                      className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600"
                    >
                      {lsr}
                    </span>

                  ))}

              </div>

            </div>

          </div>


          <div className="mt-5 rounded-xl border border-slate-100 p-5">

            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              HSE Recommendation
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {
                hsePriorities[0]
                  .recommendation
              }
            </p>

          </div>


          <button
            onClick={() =>
              setSelectedPriority(
                hsePriorities[0]
              )
            }
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-[10px] font-semibold text-white transition hover:bg-slate-800"
          >
            Investigate Priority →
          </button>

        </section>

      )}


      {/* FILTERS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex items-end justify-between">

          <div>

            <h3 className="text-sm font-bold text-slate-900">
              HSE Priority Queue
            </h3>

            <p className="mt-1 text-[11px] text-slate-400">
              Ranked precursor patterns requiring
              attention.
            </p>

          </div>


          <div className="flex gap-2">

            <div className="flex items-center rounded-lg border border-slate-200">

              <span className="px-3 text-xs text-slate-400">
                ⌕
              </span>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search priorities..."
                className="h-9 w-52 bg-transparent pr-3 text-xs outline-none"
              />

            </div>


            <select
              value={filter}
              onChange={(event) =>
                setFilter(
                  event.target.value as Filter
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >

              <option value="ALL">
                All Priorities
              </option>

              <option value="CRITICAL">
                CRITICAL
              </option>

              <option value="HIGH">
                HIGH
              </option>

              <option value="MEDIUM">
                MEDIUM
              </option>

              <option value="LOW">
                LOW
              </option>

            </select>

          </div>

        </div>


        {/* CARDS */}

        <div className="mt-6 grid grid-cols-3 gap-4">

          {filteredPriorities.map(
            (priority) => (

              <HSEPriorityCard
                key={priority.pattern_id}
                priority={priority}
                onView={() =>
                  setSelectedPriority(
                    priority
                  )
                }
              />

            )
          )}

        </div>


        {filteredPriorities.length === 0 && (

          <div className="py-16 text-center">

            <p className="text-sm font-semibold text-slate-700">
              No priorities found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your search or filter.
            </p>

          </div>

        )}

      </section>

    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: string;
  tone: "red" | "orange" | "amber" | "slate";
}) {

  const styles = {
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${styles[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {label}
      </p>

    </div>
  );
}


/* =========================
   PRIORITY METRIC
========================= */

function PriorityMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <div className="rounded-lg bg-slate-50 p-4">

      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}


/* =========================
   DETAIL PAGE
========================= */

function PriorityDetails({
  priority,
  onBack,
}: {
  priority: HSEPriorityItem;
  onBack: () => void;
}) {

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">

      <button
        onClick={onBack}
        className="text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        ← Back to HSE Priorities
      </button>


      {/* HEADER */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Priority #{priority.priority_rank}
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {priority.activity}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Pattern {priority.pattern_id}
            </p>

          </div>

          <PriorityBadge
            priority={priority.priority}
          />

        </div>

      </section>


      {/* SCORE */}

      <div className="grid grid-cols-4 gap-4">

        <PriorityMetric
          label="HSE Score"
          value={priority.hse_priority_score}
        />

        <PriorityMetric
          label="Occurrences"
          value={priority.occurrence_count}
        />

        <PriorityMetric
          label="HIGH SIF"
          value={priority.high_sif_count}
        />

        <PriorityMetric
          label="Countries"
          value={priority.countries.length}
        />

      </div>


      {/* WHY PRIORITIZED */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h3 className="text-sm font-bold text-slate-900">
          Why This Pattern Was Prioritized
        </h3>

        <p className="mt-1 text-[11px] text-slate-400">
          Signals contributing to the HSE priority score.
        </p>


        <div className="mt-5 grid grid-cols-2 gap-4">

          <InfoBlock
            label="Activity"
            value={priority.activity}
          />

          <InfoBlock
            label="Hazard"
            value={priority.hazard}
          />

          <InfoBlock
            label="Barrier Failure"
            value={priority.barrier_failure}
          />

          <InfoBlock
            label="Life-Saving Rules"
            value={
              priority.related_lsrs.join(
                ", "
              )
            }
          />

        </div>

      </section>


      {/* GEOGRAPHY */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h3 className="text-sm font-bold text-slate-900">
          Geographic Spread
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">

          {priority.countries.map(
            (country) => (

              <span
                key={country}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-600"
              >
                ◎ {country}
              </span>

            )
          )}

        </div>

      </section>


      {/* RECOMMENDATION */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="rounded-xl bg-slate-50 p-5">

          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Recommended HSE Action
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-700">
            {priority.recommendation}
          </p>

        </div>


        <div className="mt-5 flex gap-3">

          <button
            className="rounded-lg bg-slate-900 px-5 py-3 text-[10px] font-semibold text-white"
          >
            Record Intervention
          </button>

          <button
            onClick={onBack}
            className="rounded-lg border border-slate-200 px-5 py-3 text-[10px] font-semibold text-slate-600"
          >
            Back to Priorities
          </button>

        </div>

      </section>


      {/* RELATED REPORTS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h3 className="text-sm font-bold text-slate-900">
          Related Safety Reports
        </h3>

        <div className="mt-4 space-y-2">

          {priority.report_ids.map(
            (reportId) => (

              <div
                key={reportId}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >

                <span className="text-xs font-medium text-slate-700">
                  {reportId}
                </span>

                <span className="text-[10px] text-slate-400">
                  Related report →
                </span>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}


/* =========================
   INFO BLOCK
========================= */

function InfoBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-lg bg-slate-50 p-4">

      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>

    </div>
  );
}
import { useMemo, useState } from "react";

import patterns from "../data/precursor_patterns.json";

import type {
  PrecursorPattern,
  SIFLevel,
} from "../types";

import PrecursorCard from "../components/PrecursorCard";
import PriorityBadge from "../components/PriorityBadge";


const precursorPatterns =
  patterns as PrecursorPattern[];


type Filter =
  | "ALL"
  | SIFLevel;


export default function PrecursorIntelligence() {

  const [priorityFilter, setPriorityFilter] =
    useState<Filter>("ALL");

  const [search, setSearch] =
    useState("");

  const [selectedPattern, setSelectedPattern] =
    useState<PrecursorPattern | null>(null);


  /*
   * KPI calculations
   */

  const totalPatterns =
    precursorPatterns.length;


  const highPriority =
    precursorPatterns.filter(
      (pattern) =>
        pattern.priority === "HIGH"
    ).length;


  const countries = new Set(
    precursorPatterns.flatMap(
      (pattern) =>
        pattern.countries
    )
  ).size;


  const highSIF =
    precursorPatterns.reduce(
      (sum, pattern) =>
        sum + pattern.high_sif_count,
      0
    );


  /*
   * Top pattern
   */

  const topPattern =
    [...precursorPatterns]
      .sort(
        (a, b) =>
          b.priority_score -
          a.priority_score
      )[0];


  /*
   * Filtering
   */

  const filteredPatterns =
    useMemo(() => {

      const query =
        search.toLowerCase().trim();


      return precursorPatterns.filter(
        (pattern) => {

          const matchesSearch =
            !query ||
            pattern.pattern_id
              .toLowerCase()
              .includes(query) ||
            pattern.activity
              .toLowerCase()
              .includes(query) ||
            pattern.hazard
              .toLowerCase()
              .includes(query) ||
            pattern.barrier_failure
              .toLowerCase()
              .includes(query);


          const matchesPriority =
            priorityFilter === "ALL" ||
            pattern.priority ===
              priorityFilter;


          return (
            matchesSearch &&
            matchesPriority
          );
        }
      );

    }, [
      search,
      priorityFilter,
    ]);


  /*
   * Detail view
   */

  if (selectedPattern) {

    return (
      <PatternDetails
        pattern={selectedPattern}
        onBack={() =>
          setSelectedPattern(null)
        }
      />
    );
  }


  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* PAGE HEADER */}

      <div className="flex items-end justify-between">

        <div>

          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Cross-report intelligence
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Precursor Intelligence
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Identify recurring SIF precursor patterns
            across activities, hazards and locations.
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Patterns Detected
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {totalPatterns}
          </p>

        </div>

      </div>


      {/* KPI CARDS */}

      <div className="grid grid-cols-4 gap-4">

        <StatCard
          label="Patterns Detected"
          value={totalPatterns}
          icon="⌕"
        />

        <StatCard
          label="HIGH Priority"
          value={highPriority}
          icon="⚠"
          tone="red"
        />

        <StatCard
          label="Countries"
          value={countries}
          icon="◎"
        />

        <StatCard
          label="HIGH SIF Reports"
          value={highSIF}
          icon="◆"
          tone="amber"
        />

      </div>


      {/* TOP PATTERN */}

      {topPattern && (

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-100 px-6 py-5">

            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Highest-ranked recurring pattern
            </p>

            <h3 className="mt-1 text-base font-bold text-slate-900">
              Top Emerging Precursor
            </h3>

          </div>


          <div className="grid grid-cols-[1.4fr_1fr] gap-8 p-6">

            <div>

              <PriorityBadge
                priority={topPattern.priority}
              />

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Activity
              </p>

              <h3 className="mt-1 text-xl font-bold leading-7 text-slate-900">
                {topPattern.activity}
              </h3>


              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Hazard
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-700">
                {topPattern.hazard}
              </p>


              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Recurring Barrier Failure
              </p>

              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                {topPattern.barrier_failure}
              </p>

            </div>


            <div className="rounded-xl bg-slate-50 p-5">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pattern Evidence
              </p>


              <div className="mt-4 grid grid-cols-3 gap-2">

                <Metric
                  value={
                    topPattern.occurrence_count
                  }
                  label="Occurrences"
                />

                <Metric
                  value={
                    topPattern.high_sif_count
                  }
                  label="HIGH SIF"
                />

                <Metric
                  value={
                    topPattern.countries.length
                  }
                  label="Countries"
                />

              </div>


              <div className="mt-5">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Related Life-Saving Rules
                </p>

                <div className="mt-2 flex flex-wrap gap-2">

                  {topPattern.related_lsrs.map(
                    (lsr) => (

                      <span
                        key={lsr}
                        className="rounded-full bg-white px-3 py-1.5 text-[9px] font-semibold text-slate-600"
                      >
                        {lsr}
                      </span>

                    )
                  )}

                </div>

              </div>


              <div className="mt-5">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Countries
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {topPattern.countries.join(
                    " • "
                  )}
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedPattern(
                    topPattern
                  )
                }
                className="mt-5 w-full rounded-lg bg-slate-900 py-2.5 text-[10px] font-semibold text-white transition hover:bg-slate-800"
              >
                Investigate Pattern →
              </button>

            </div>

          </div>

        </section>

      )}


      {/* PATTERNS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex items-end justify-between">

          <div>

            <h3 className="text-sm font-bold text-slate-900">
              All Precursor Patterns
            </h3>

            <p className="mt-1 text-[11px] text-slate-400">
              Cross-report patterns detected by the
              intelligence pipeline.
            </p>

          </div>


          <div className="flex gap-2">

            <div className="flex items-center rounded-lg border border-slate-200 bg-white">

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
                placeholder="Search patterns..."
                className="h-9 w-52 bg-transparent pr-3 text-xs outline-none"
              />

            </div>


            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value as Filter
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >

              <option value="ALL">
                All Priorities
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


        {/* GRID */}

        <div className="mt-6 grid grid-cols-3 gap-4">

          {filteredPatterns.map(
            (pattern) => (

              <PrecursorCard
                key={pattern.pattern_id}
                pattern={pattern}
                onView={() =>
                  setSelectedPattern(
                    pattern
                  )
                }
              />

            )
          )}

        </div>


        {filteredPatterns.length === 0 && (

          <div className="py-16 text-center">

            <p className="text-sm font-semibold text-slate-700">
              No patterns found
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
  tone = "slate",
}: {
  label: string;
  value: number;
  icon: string;
  tone?: "slate" | "red" | "amber";
}) {

  const styles = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
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
   METRIC
========================= */

function Metric({
  value,
  label,
}: {
  value: number;
  label: string;
}) {

  return (
    <div className="rounded-lg border border-slate-100 bg-white p-3">

      <p className="text-lg font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[8px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

    </div>
  );
}


/* =========================
   DETAIL VIEW
========================= */

function PatternDetails({
  pattern,
  onBack,
}: {
  pattern: PrecursorPattern;
  onBack: () => void;
}) {

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">

      <button
        onClick={onBack}
        className="text-xs font-medium text-slate-500 hover:text-slate-900"
      >
        ← Back to Precursor Intelligence
      </button>


      {/* HEADER */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex items-start justify-between">

          <div>

            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {pattern.pattern_id}
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {pattern.activity}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Recurring precursor pattern
            </p>

          </div>

          <PriorityBadge
            priority={pattern.priority}
          />

        </div>

      </section>


      {/* KEY METRICS */}

      <div className="grid grid-cols-4 gap-4">

        <MetricCard
          label="Occurrences"
          value={pattern.occurrence_count}
        />

        <MetricCard
          label="HIGH SIF"
          value={pattern.high_sif_count}
        />

        <MetricCard
          label="MEDIUM SIF"
          value={pattern.medium_sif_count}
        />

        <MetricCard
          label="Priority Score"
          value={pattern.priority_score}
        />

      </div>


      {/* ANALYSIS */}

      <section className="grid grid-cols-2 gap-5">

        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h3 className="text-sm font-bold text-slate-900">
            Precursor Characteristics
          </h3>

          <div className="mt-5 space-y-4">

            <InfoRow
              label="Activity"
              value={pattern.activity}
            />

            <InfoRow
              label="Hazard"
              value={pattern.hazard}
            />

            <InfoRow
              label="Barrier Failure"
              value={pattern.barrier_failure}
            />

          </div>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white p-6">

          <h3 className="text-sm font-bold text-slate-900">
            Geographic Spread
          </h3>

          <p className="mt-1 text-[11px] text-slate-400">
            Countries where this pattern was identified
          </p>

          <div className="mt-5 space-y-2">

            {pattern.countries.map(
              (country) => (

                <div
                  key={country}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3"
                >

                  <span className="text-sm">
                    ◎
                  </span>

                  <span className="text-xs font-medium text-slate-700">
                    {country}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* LSR */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h3 className="text-sm font-bold text-slate-900">
          Related Life-Saving Rules
        </h3>

        <div className="mt-4 flex flex-wrap gap-2">

          {pattern.related_lsrs.map(
            (lsr) => (

              <span
                key={lsr}
                className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600"
              >
                {lsr}
              </span>

            )
          )}

        </div>

      </section>


      {/* REPORTS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <h3 className="text-sm font-bold text-slate-900">
          Related Safety Reports
        </h3>

        <p className="mt-1 text-[11px] text-slate-400">
          Reports contributing to this precursor pattern
        </p>

        <div className="mt-5 space-y-2">

          {pattern.report_ids.map(
            (reportId) => (

              <div
                key={reportId}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
              >

                <span className="text-xs font-medium text-slate-700">
                  {reportId}
                </span>

                <span className="text-[10px] text-slate-400">
                  View report →
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
   DETAIL HELPERS
========================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div>

      <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold leading-5 text-slate-700">
        {value}
      </p>

    </div>
  );
}


function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}
import { useMemo, useState } from "react";

import reports from "../data/sif_classified_reports.json";

import type {
  SafetyReport,
  SIFLevel,
} from "../types";

import SIFBadge from "../components/SIFBadge";

const safetyReports =
  reports as SafetyReport[];

type FilterLevel = "ALL" | SIFLevel;

export default function SIFAnalysis() {

  const [filter, setFilter] =
    useState<FilterLevel>("ALL");

  const [selectedReport, setSelectedReport] =
    useState<SafetyReport | null>(null);


  const highReports =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "HIGH"
    );

  const mediumReports =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "MEDIUM"
    );

  const lowReports =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "LOW"
    );


  const averageScore =
    safetyReports.length > 0
      ? (
          safetyReports.reduce(
            (sum, report) =>
              sum +
              report.sif_classification.score,
            0
          ) / safetyReports.length
        ).toFixed(1)
      : "0";


  const filteredReports =
    useMemo(() => {

      if (filter === "ALL") {
        return safetyReports;
      }

      return safetyReports.filter(
        (report) =>
          report.sif_classification.sif_level ===
          filter
      );

    }, [filter]);


  /*
   * Count detected LSRs
   */

  const lsrCounts =
    useMemo(() => {

      const counts: Record<
        string,
        number
      > = {};

      safetyReports.forEach(
        (report) => {

          const extraction =
            report.normalized_extraction;

          const lsrs = [
            extraction.primary_lsr,
            extraction.secondary_lsr,
          ];

          lsrs.forEach((lsr) => {

            if (!lsr) return;

            counts[lsr] =
              (counts[lsr] || 0) + 1;
          });
        }
      );

      return Object.entries(counts)
        .sort(
          (a, b) => b[1] - a[1]
        )
        .slice(0, 6);

    }, []);


  /*
   * Score ranges
   */

  const scoreGroups = [
    {
      label: "High Signal",
      description: "Score ≥ 10",
      count: safetyReports.filter(
        (r) =>
          r.sif_classification.score >= 10
      ).length,
    },
    {
      label: "Moderate Signal",
      description: "Score 5–9",
      count: safetyReports.filter(
        (r) =>
          r.sif_classification.score >= 5 &&
          r.sif_classification.score < 10
      ).length,
    },
    {
      label: "Low Signal",
      description: "Score < 5",
      count: safetyReports.filter(
        (r) =>
          r.sif_classification.score < 5
      ).length,
    },
  ];


  return (
    <div className="mx-auto max-w-[1500px] space-y-6">

      {/* PAGE INTRO */}

      <div className="flex items-end justify-between">

        <div>

          <div className="mb-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Explainable classification
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            SIF Analysis
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Analyze Serious Injury and Fatality
            potential across safety reports.
          </p>

        </div>


        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right">

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Average SIF Score
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900">
            {averageScore}
          </p>

        </div>

      </div>


      {/* KPI CARDS */}

      <div className="grid grid-cols-4 gap-4">

        <StatCard
          label="Total Reports"
          value={safetyReports.length}
          description="Reports classified"
          icon="▤"
        />

        <StatCard
          label="HIGH"
          value={highReports.length}
          description="Highest SIF potential"
          icon="⚠"
          tone="red"
        />

        <StatCard
          label="MEDIUM"
          value={mediumReports.length}
          description="Requires monitoring"
          icon="!"
          tone="amber"
        />

        <StatCard
          label="LOW"
          value={lowReports.length}
          description="Lower signal"
          icon="✓"
          tone="green"
        />

      </div>


      {/* DISTRIBUTION + LSR */}

      <div className="grid grid-cols-[1.25fr_1fr] gap-5">

        {/* DISTRIBUTION */}

        <section className="rounded-xl border border-slate-200 bg-white p-6">

          <SectionHeader
            title="SIF Classification Distribution"
            description="Current classification across analyzed reports"
          />

          <div className="mt-6 space-y-5">

            <DistributionRow
              label="HIGH"
              count={highReports.length}
              total={safetyReports.length}
              tone="bg-red-500"
            />

            <DistributionRow
              label="MEDIUM"
              count={mediumReports.length}
              total={safetyReports.length}
              tone="bg-amber-400"
            />

            <DistributionRow
              label="LOW"
              count={lowReports.length}
              total={safetyReports.length}
              tone="bg-emerald-500"
            />

          </div>

        </section>


        {/* LSR */}

        <section className="rounded-xl border border-slate-200 bg-white p-6">

          <SectionHeader
            title="Life-Saving Rule Signals"
            description="Rules detected across analyzed reports"
          />

          <div className="mt-5 space-y-3">

            {lsrCounts.map(
              ([lsr, count]) => (

                <div
                  key={lsr}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
                >

                  <span className="text-xs font-medium text-slate-700">
                    {lsr}
                  </span>

                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-slate-600 shadow-sm">
                    {count}
                  </span>

                </div>

              )
            )}

          </div>

        </section>

      </div>


      {/* SCORE SIGNALS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <SectionHeader
          title="SIF Score Signals"
          description="Distribution of explainable prototype scores"
        />

        <div className="mt-5 grid grid-cols-3 gap-4">

          {scoreGroups.map(
            (group) => (

              <div
                key={group.label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-5"
              >

                <p className="text-xs font-semibold text-slate-700">
                  {group.label}
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {group.count}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {group.description}
                </p>

              </div>

            )
          )}

        </div>

      </section>


      {/* REPORT ANALYSIS */}

      <section className="rounded-xl border border-slate-200 bg-white p-6">

        <div className="flex items-center justify-between">

          <SectionHeader
            title="Report-wise SIF Analysis"
            description="Review classification and contributing safety signals"
          />

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as FilterLevel
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none"
          >

            <option value="ALL">
              All Levels
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


        <div className="mt-5 overflow-hidden rounded-lg border border-slate-100">

          <table className="w-full">

            <thead className="bg-slate-50">

              <tr>

                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Report
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Activity
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Hazard
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Score
                </th>

                <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  SIF Level
                </th>

                <th className="px-4 py-3" />

              </tr>

            </thead>


            <tbody>

              {filteredReports.map(
                (report) => {

                  const extraction =
                    report.normalized_extraction;

                  return (
                    <tr
                      key={report.report_id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >

                      <td className="px-4 py-4 text-xs font-semibold text-slate-800">
                        {report.report_id}
                      </td>

                      <td className="max-w-[220px] px-4 py-4 text-xs text-slate-600">
                        {extraction.activity || "—"}
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {extraction.hazard || "—"}
                      </td>

                      <td className="px-4 py-4">

                        <span className="font-semibold text-slate-800">
                          {report.sif_classification.score}
                        </span>

                      </td>

                      <td className="px-4 py-4">

                        <SIFBadge
                          level={
                            report
                              .sif_classification
                              .sif_level
                          }
                        />

                      </td>

                      <td className="px-4 py-4 text-right">

                        <button
                          onClick={() =>
                            setSelectedReport(
                              report
                            )
                          }
                          className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-900"
                        >
                          Analyze →
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* SELECTED REPORT */}

      {selectedReport && (

        <SIFDetail
          report={selectedReport}
          onClose={() =>
            setSelectedReport(null)
          }
        />

      )}

    </div>
  );
}


/* =========================
   STAT CARD
========================= */

function StatCard({
  label,
  value,
  description,
  icon,
  tone = "slate",
}: {
  label: string;
  value: number;
  description: string;
  icon: string;
  tone?: "slate" | "red" | "amber" | "green";
}) {

  const tones = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-emerald-50 text-emerald-600",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">

      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm ${tones[tone]}`}
      >
        {icon}
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs font-semibold text-slate-700">
        {label}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* =========================
   SECTION HEADER
========================= */

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {

  return (
    <div>

      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-[11px] text-slate-400">
        {description}
      </p>

    </div>
  );
}


/* =========================
   DISTRIBUTION
========================= */

function DistributionRow({
  label,
  count,
  total,
  tone,
}: {
  label: string;
  count: number;
  total: number;
  tone: string;
}) {

  const percentage =
    total > 0
      ? (count / total) * 100
      : 0;

  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-xs font-semibold text-slate-700">
          {label}
        </span>

        <span className="text-xs font-semibold text-slate-600">
          {count}{" "}
          <span className="font-normal text-slate-400">
            ({Math.round(percentage)}%)
          </span>
        </span>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

        <div
          className={`h-full rounded-full ${tone}`}
          style={{
            width: `${percentage}%`,
          }}
        />

      </div>

    </div>
  );
}


/* =========================
   DETAIL
========================= */

function SIFDetail({
  report,
  onClose,
}: {
  report: SafetyReport;
  onClose: () => void;
}) {

  const extraction =
    report.normalized_extraction;

  const sif =
    report.sif_classification;


  const signals = [
    {
      label: "Primary Life-Saving Rule",
      value: extraction.primary_lsr,
    },
    {
      label: "Secondary Life-Saving Rule",
      value: extraction.secondary_lsr,
    },
    {
      label: "Hazard",
      value: extraction.hazard,
    },
    {
      label: "Potential Consequence",
      value: extraction.potential_consequence,
    },
    {
      label: "Barrier Failure",
      value: extraction.barrier_failure,
    },
    {
      label: "Unsafe Act",
      value: extraction.unsafe_act,
    },
  ];


  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Selected Report
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {report.report_id}
          </h3>

        </div>


        <div className="flex items-center gap-3">

          <SIFBadge
            level={sif.sif_level}
          />

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50"
          >
            Close
          </button>

        </div>

      </div>


      {/* SCORE */}

      <div className="mt-5 grid grid-cols-3 gap-3">

        <div className="rounded-lg bg-slate-50 p-4">

          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            SIF Level
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {sif.sif_level}
          </p>

        </div>


        <div className="rounded-lg bg-slate-50 p-4">

          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            SIF Score
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {sif.score}
          </p>

        </div>


        <div className="rounded-lg bg-slate-50 p-4">

          <p className="text-[10px] uppercase tracking-wide text-slate-400">
            Confidence
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {Math.round(
              extraction.confidence * 100
            )}%
          </p>

        </div>

      </div>


      {/* SIGNALS */}

      <div className="mt-6">

        <h4 className="text-sm font-bold text-slate-900">
          Detected Safety Signals
        </h4>

        <p className="mt-1 text-[11px] text-slate-400">
          Structured signals contributing to the
          classification.
        </p>


        <div className="mt-4 grid grid-cols-2 gap-3">

          {signals.map(
            (signal) => (

              <div
                key={signal.label}
                className="rounded-lg border border-slate-100 p-4"
              >

                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {signal.label}
                </p>

                <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">
                  {signal.value ||
                    "Not identified"}
                </p>

              </div>

            )
          )}

        </div>

      </div>


      {/* EVIDENCE */}

      <div className="mt-6">

        <h4 className="text-sm font-bold text-slate-900">
          Evidence
        </h4>

        <div className="mt-3 space-y-2">

          {extraction.evidence.map(
            (evidence, index) => (

              <div
                key={index}
                className="flex gap-3 rounded-lg bg-slate-50 p-3"
              >

                <span className="text-emerald-600">
                  ✓
                </span>

                <p className="text-xs leading-5 text-slate-600">
                  {evidence}
                </p>

              </div>

            )
          )}

        </div>

      </div>

    </div>
  );
}
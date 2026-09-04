import { useMemo, useState } from "react";

import ReportTable from "../components/ReportTable";
import ReportCard from "../components/ReportCard";

import reports from "../data/sif_classified_reports.json";

import type {
  SafetyReport,
  SIFLevel,
} from "../types";


const safetyReports =
  reports as SafetyReport[];


export default function SafetyReports() {

  const [selectedReport, setSelectedReport] =
    useState<SafetyReport | null>(null);

  const [search, setSearch] =
    useState("");

  const [sifFilter, setSifFilter] =
    useState<"ALL" | SIFLevel>("ALL");


  const filteredReports =
    useMemo(() => {

      const query =
        search.toLowerCase().trim();

      return safetyReports.filter(
        (report) => {

          const extraction =
            report.normalized_extraction;

          const matchesSearch =
            !query ||
            report.report_id
              .toLowerCase()
              .includes(query) ||
            extraction.activity
              ?.toLowerCase()
              .includes(query) ||
            extraction.hazard
              ?.toLowerCase()
              .includes(query);

          const matchesSIF =
            sifFilter === "ALL" ||
            report.sif_classification.sif_level ===
              sifFilter;

          return (
            matchesSearch &&
            matchesSIF
          );
        }
      );

    }, [search, sifFilter]);


  if (selectedReport) {

    return (
      <ReportCard
        report={selectedReport}
        onBack={() =>
          setSelectedReport(null)
        }
      />
    );
  }


  return (
    <div className="page-content">

      {/* PAGE INTRO */}

      <div className="page-intro">

        <div>

          <h2>
            Safety Reports
          </h2>

          <p>
            Review reports analyzed by the safety
            intelligence pipeline.
          </p>

        </div>

        <div className="report-count">
          {filteredReports.length} reports
        </div>

      </div>


      {/* FILTER BAR */}

      <div className="filter-bar">

        <div className="search-box">

          <span>
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search reports, activities or hazards..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        <select
          value={sifFilter}
          onChange={(e) =>
            setSifFilter(
              e.target.value as
                | "ALL"
                | SIFLevel
            )
          }
        >

          <option value="ALL">
            All SIF Levels
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


      {/* REPORT TABLE */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Analyzed Reports
            </h2>

            <p>
              Structured safety information and SIF
              classification
            </p>

          </div>

        </div>


        <ReportTable
          reports={filteredReports}
          onView={setSelectedReport}
        />

      </section>

    </div>
  );
}
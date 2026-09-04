import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import KPICard from "../components/KPICard";
import PriorityBadge from "../components/PriorityBadge";

import reports from "../data/sif_classified_reports.json";
import patterns from "../data/precursor_patterns.json";
import priorities from "../data/hse_priorities.json";

import type {
  SafetyReport,
  PrecursorPattern,
  HSEPriorityItem,
} from "../types";


const safetyReports =
  reports as SafetyReport[];

const precursorPatterns =
  patterns as PrecursorPattern[];

const hsePriorities =
  priorities as HSEPriorityItem[];


export default function Overview() {

  const high =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "HIGH"
    ).length;

  const medium =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "MEDIUM"
    ).length;

  const low =
    safetyReports.filter(
      (report) =>
        report.sif_classification.sif_level ===
        "LOW"
    ).length;


  const critical =
    hsePriorities.filter(
      (item) =>
        item.priority === "CRITICAL"
    ).length;


  const topPriority =
    hsePriorities[0];


  const chartData = [
    {
      name: "HIGH",
      value: high,
    },
    {
      name: "MEDIUM",
      value: medium,
    },
    {
      name: "LOW",
      value: low,
    },
  ];


  return (
    <div className="page-content">

      {/* KPI SECTION */}

      <section className="kpi-grid">

        <KPICard
          label="Safety Reports"
          value={safetyReports.length}
          description="Reports analyzed"
          icon="▤"
        />

        <KPICard
          label="HIGH SIF"
          value={high}
          description="Requires attention"
          icon="⚠"
        />

        <KPICard
          label="Precursor Patterns"
          value={precursorPatterns.length}
          description="Patterns detected"
          icon="⌕"
        />

        <KPICard
          label="Critical HSE"
          value={critical}
          description="Priority interventions"
          icon="◆"
        />

      </section>


      {/* MAIN INSIGHT ROW */}

      <section className="dashboard-grid">

        {/* SIF CHART */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>
                SIF Potential Distribution
              </h2>

              <p>
                Current classification across analyzed reports
              </p>
            </div>

          </div>


          <div className="chart-container">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={chartData}
                barCategoryGap="35%"
              >

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="value"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* TOP PRIORITY */}

        <div className="panel">

          <div className="panel-header">

            <div>

              <h2>
                Top HSE Priority
              </h2>

              <p>
                Highest-ranked precursor requiring attention
              </p>

            </div>

          </div>


          {topPriority && (

            <div className="priority-content">

              <PriorityBadge
                priority={
                  topPriority.priority
                }
              />


              <h3>
                {topPriority.activity}
              </h3>


              <p className="priority-hazard">
                {topPriority.hazard}
              </p>


              <div className="priority-metrics">

                <div>
                  <strong>
                    {topPriority.occurrence_count}
                  </strong>

                  <span>
                    Occurrences
                  </span>
                </div>

                <div>
                  <strong>
                    {topPriority.high_sif_count}
                  </strong>

                  <span>
                    HIGH SIF
                  </span>
                </div>

                <div>
                  <strong>
                    {topPriority.countries.length}
                  </strong>

                  <span>
                    Countries
                  </span>
                </div>

              </div>


              <div className="recommendation">

                <div className="recommendation-label">
                  HSE Recommendation
                </div>

                <p>
                  {topPriority.recommendation}
                </p>

              </div>


              <button className="primary-button">
                View Priority →
              </button>

            </div>

          )}

        </div>

      </section>


      {/* PRECURSOR TABLE */}

      <section className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Emerging SIF Precursor Patterns
            </h2>

            <p>
              Recurring safety patterns identified across reports
            </p>

          </div>

          <button className="text-button">
            View all →
          </button>

        </div>


        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  Activity
                </th>

                <th>
                  Hazard
                </th>

                <th>
                  Life-Saving Rule
                </th>

                <th>
                  Occurrences
                </th>

                <th>
                  Countries
                </th>

                <th>
                  Priority
                </th>

              </tr>

            </thead>


            <tbody>

              {precursorPatterns
                .slice(0, 6)
                .map((pattern) => (

                  <tr
                    key={pattern.pattern_id}
                  >

                    <td className="strong-cell">
                      {pattern.activity}
                    </td>

                    <td>
                      {pattern.hazard}
                    </td>

                    <td>
                      {pattern.related_lsrs.join(
                        ", "
                      )}
                    </td>

                    <td>
                      {pattern.occurrence_count}
                    </td>

                    <td>
                      {pattern.countries.length}
                    </td>

                    <td>

                      <PriorityBadge
                        priority={
                          pattern.priority
                        }
                      />

                    </td>

                  </tr>

                ))}

            </tbody>

          </table>

        </div>

      </section>


      {/* INTERVENTION */}

      <section className="monitoring-banner">

        <div className="monitoring-icon">
          ↗
        </div>

        <div className="monitoring-text">

          <h3>
            Intervention Effectiveness Monitoring
          </h3>

          <p>
            Track recurring precursor patterns before
            and after HSE interventions.
          </p>

        </div>

        <button className="secondary-button">
          View Monitoring →
        </button>

      </section>

    </div>
  );
}
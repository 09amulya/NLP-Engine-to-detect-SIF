import type { SafetyReport } from "../types";
import SIFBadge from "./SIFBadge";

interface ReportTableProps {
  reports: SafetyReport[];
  onView: (report: SafetyReport) => void;
}

export default function ReportTable({
  reports,
  onView,
}: ReportTableProps) {
  return (
    <div className="table-wrapper">

      <table>

        <thead>
          <tr>
            <th>Report</th>
            <th>Activity</th>
            <th>Hazard</th>
            <th>LSR</th>
            <th>SIF</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {reports.map((report) => {

            const extraction =
              report.normalized_extraction;

            return (
              <tr key={report.report_id}>

                <td className="strong-cell">
                  {report.report_id}
                </td>

                <td>
                  {extraction.activity || "—"}
                </td>

                <td>
                  {extraction.hazard || "—"}
                </td>

                <td>
                  {extraction.primary_lsr || "—"}
                </td>

                <td>
                  <SIFBadge
                    level={
                      report.sif_classification.sif_level
                    }
                  />
                </td>

                <td>
                  <button
                    className="view-button"
                    onClick={() =>
                      onView(report)
                    }
                  >
                    View Analysis →
                  </button>
                </td>

              </tr>
            );
          })}

        </tbody>

      </table>

    </div>
  );
}
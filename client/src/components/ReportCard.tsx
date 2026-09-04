import type { SafetyReport } from "../types";
import SIFBadge from "./SIFBadge";

interface ReportCardProps {
  report: SafetyReport;
  onBack: () => void;
}

export default function ReportCard({
  report,
  onBack,
}: ReportCardProps) {

  const extraction =
    report.normalized_extraction;

  const sif =
    report.sif_classification;

  return (
    <div className="report-detail">

      {/* HEADER */}

      <div className="detail-header">

        <div>

          <button
            className="back-button"
            onClick={onBack}
          >
            ← Back to Reports
          </button>

          <h2>
            Safety Report Analysis
          </h2>

          <p>
            {report.report_id}
          </p>

        </div>


        <SIFBadge
          level={sif.sif_level}
        />

      </div>


      {/* SIF SUMMARY */}

      <div className="analysis-summary">

        <div>

          <span>
            SIF Classification
          </span>

          <strong>
            {sif.sif_level}
          </strong>

        </div>

        <div>

          <span>
            SIF Score
          </span>

          <strong>
            {sif.score}
          </strong>

        </div>

        <div>

          <span>
            Extraction Confidence
          </span>

          <strong>
            {Math.round(
              extraction.confidence * 100
            )}%
          </strong>

        </div>

      </div>


      {/* EXTRACTED INFORMATION */}

      <section className="detail-panel">

        <div className="panel-header">

          <div>
            <h3>
              Extracted Safety Information
            </h3>

            <p>
              Structured information identified from
              the original report
            </p>
          </div>

        </div>


        <div className="detail-grid">

          <DetailField
            label="Activity"
            value={extraction.activity}
          />

          <DetailField
            label="Hazard"
            value={extraction.hazard}
          />

          <DetailField
            label="Location"
            value={extraction.location}
          />

          <DetailField
            label="Unsafe Act"
            value={extraction.unsafe_act}
          />

          <DetailField
            label="Unsafe Condition"
            value={extraction.unsafe_condition}
          />

          <DetailField
            label="Barrier Failure"
            value={extraction.barrier_failure}
          />

          <DetailField
            label="Potential Consequence"
            value={extraction.potential_consequence}
          />

          <DetailField
            label="Primary Life-Saving Rule"
            value={extraction.primary_lsr}
          />

          <DetailField
            label="Secondary Life-Saving Rule"
            value={extraction.secondary_lsr}
          />

        </div>

      </section>


      {/* SIF EXPLANATION */}

      <section className="detail-panel">

        <div className="panel-header">

          <div>
            <h3>
              SIF Decision Explanation
            </h3>

            <p>
              Contributing safety signals used by the
              prototype classifier
            </p>
          </div>

        </div>


        <div className="score-breakdown">

          <div>
            <span>Classification</span>
            <strong>{sif.sif_level}</strong>
          </div>

          <div>
            <span>Score</span>
            <strong>{sif.score}</strong>
          </div>

        </div>

        <p className="explanation-text">
          The SIF level is based on the detected
          life-saving rules, hazard, potential consequence,
          and safety barrier/control failure signals.
        </p>

      </section>


      {/* EVIDENCE */}

      <section className="detail-panel">

        <div className="panel-header">

          <div>
            <h3>
              Evidence
            </h3>

            <p>
              Safety information supporting the analysis
            </p>
          </div>

        </div>


        <div className="evidence-list">

          {extraction.evidence.map(
            (evidence, index) => (

              <div
                className="evidence-item"
                key={index}
              >

                <span>✓</span>

                <p>
                  {evidence}
                </p>

              </div>

            )
          )}

        </div>

      </section>

    </div>
  );
}


function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {

  return (
    <div className="detail-field">

      <span>
        {label}
      </span>

      <strong>
        {value || "Not identified"}
      </strong>

    </div>
  );
}
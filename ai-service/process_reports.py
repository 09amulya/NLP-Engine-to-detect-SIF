import json
import time

from extractor import extract_safety_information
from normalizer import normalize_result
from validator import validate_result


INPUT_FILE = "common_reports.json"
OUTPUT_FILE = "processed_reports.json"

# Start small while testing
MAX_REPORTS = 20

MAX_RETRIES = 3


def load_reports():

    with open(
        INPUT_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def save_results(results):

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False
        )


def process_report(report):

    report_id = report["report_id"]
    original_text = (
        report.get("text")
        or report.get("original_report")
        or report.get("report_text")
    )
    if not original_text:
        raise ValueError(
            f"No text field found in report: {report_id}"
        )
    print("\n" + "=" * 70)
    print(f"Processing: {report_id}")
    print("=" * 70)

    for attempt in range(1, MAX_RETRIES + 1):

        try:

            print(
                f"Ollama attempt {attempt}/{MAX_RETRIES}..."
            )

            # -----------------------------
            # AI EXTRACTION
            # -----------------------------

            raw_result = extract_safety_information(
                original_text
            )

            # -----------------------------
            # NORMALIZATION
            # -----------------------------

            normalized_result = normalize_result(
                raw_result
            )

            # -----------------------------
            # VALIDATION
            # -----------------------------

            validation_result = validate_result(
                normalized_result
            )

            # -----------------------------
            # RESULT
            # -----------------------------

            if validation_result["is_valid"]:

                print("Extraction successful.")

                return {
                    "report_id": report_id,

                    "source_file": report.get(
                        "source_file"
                    ),

                    "source_type": report.get(
                        "source_type"
                    ),

                    "original_report": original_text,

                    "raw_extraction": raw_result,

                    "normalized_extraction":
                        normalized_result,

                    "validation":
                        validation_result,

                    "status": "SUCCESS"
                }

            else:

                print(
                    "Extraction needs review:"
                )

                for issue in validation_result["issues"]:
                    print(" -", issue)

                return {
                    "report_id": report_id,

                    "source_file": report.get(
                        "source_file"
                    ),

                    "source_type": report.get(
                        "source_type"
                    ),

                    "original_report": original_text,

                    "raw_extraction": raw_result,

                    "normalized_extraction":
                        normalized_result,

                    "validation":
                        validation_result,

                    "status": "REVIEW_REQUIRED"
                }

        except Exception as error:

            print(
                f"Extraction failed: {error}"
            )

            if attempt < MAX_RETRIES:

                print("Retrying...")
                time.sleep(1)

            else:

                print(
                    "Maximum retries reached."
                )

                return {
                    "report_id": report_id,

                    "source_file": report.get(
                        "source_file"
                    ),

                    "source_type": report.get(
                        "source_type"
                    ),

                    "original_report": original_text,

                    "raw_extraction": None,

                    "normalized_extraction": None,

                    "validation": {
                        "is_valid": False,
                        "issues": [
                            str(error)
                        ]
                    },

                    "status": "FAILED"
                }


def main():

    reports = load_reports()

    print(
        f"Total reports available: {len(reports)}"
    )

    reports_to_process = reports[:MAX_REPORTS]

    results = []

    for report in reports_to_process:

        result = process_report(report)

        results.append(result)

        save_results(results)

    # ----------------------------------------
    # FINAL SUMMARY
    # ----------------------------------------

    successful = sum(
        1 for r in results
        if r["status"] == "SUCCESS"
    )

    review_required = sum(
        1 for r in results
        if r["status"] == "REVIEW_REQUIRED"
    )

    failed = sum(
        1 for r in results
        if r["status"] == "FAILED"
    )

    print("\n")
    print("=" * 70)
    print("PROCESSING COMPLETED")
    print("=" * 70)

    print(
        f"Total processed: {len(results)}"
    )

    print(
        f"Successful: {successful}"
    )

    print(
        f"Review required: {review_required}"
    )

    print(
        f"Failed: {failed}"
    )

    print(
        f"Output saved to: {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    main()
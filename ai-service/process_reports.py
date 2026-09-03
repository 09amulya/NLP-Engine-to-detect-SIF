import json

from extractor import extract_safety_information
from normalizer import normalize_result
from validator import validate_result


# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FILE = "common_reports.json"
OUTPUT_FILE = "processed_reports.json"

# Start small!
NUMBER_OF_REPORTS = 10


# ============================================================
# LOAD INGESTED REPORTS
# ============================================================

with open(INPUT_FILE, "r", encoding="utf-8") as file:
    reports = json.load(file)


print("=" * 60)
print("OLLAMA REPORT PROCESSING STARTED")
print("=" * 60)

print(f"Total available reports: {len(reports)}")
print(f"Reports selected for processing: {NUMBER_OF_REPORTS}")


# ============================================================
# PROCESS REPORTS
# ============================================================

processed_reports = []

selected_reports = reports[:NUMBER_OF_REPORTS]

for index, report in enumerate(selected_reports, start=1):

    print("\n" + "-" * 60)
    print(f"Processing report {index}/{NUMBER_OF_REPORTS}")
    print(f"Source: {report['source_file']}")
    print(f"Report ID: {report['report_id']}")

    report_text = report["report_text"]

    try:

        # ----------------------------------------------------
        # STEP 1: Send report to Ollama
        # ----------------------------------------------------

        raw_result = extract_safety_information(report_text)


        # ----------------------------------------------------
        # STEP 2: Normalize
        # ----------------------------------------------------

        normalized_result = normalize_result(raw_result)


        # ----------------------------------------------------
        # STEP 3: Validate
        # ----------------------------------------------------

        validation_result = validate_result(normalized_result)


        # ----------------------------------------------------
        # SAVE RESULT
        # ----------------------------------------------------

        processed_report = {
            "report_id": report["report_id"],
            "source_file": report["source_file"],
            "source_type": report["source_type"],
            "report_text": report_text,
            "extracted_information": normalized_result,
            "validation": validation_result
        }

        processed_reports.append(processed_report)

        print("Status: SUCCESS")


    except Exception as error:

        print(f"Status: FAILED")
        print(f"Error: {error}")

        processed_reports.append({
            "report_id": report["report_id"],
            "source_file": report["source_file"],
            "source_type": report["source_type"],
            "report_text": report_text,
            "error": str(error)
        })


# ============================================================
# SAVE OUTPUT
# ============================================================

with open(OUTPUT_FILE, "w", encoding="utf-8") as file:

    json.dump(
        processed_reports,
        file,
        indent=4,
        ensure_ascii=False
    )


# ============================================================
# FINAL SUMMARY
# ============================================================

successful = sum(
    1 for report in processed_reports
    if "extracted_information" in report
)

failed = len(processed_reports) - successful


print("\n" + "=" * 60)
print("PROCESSING COMPLETED")
print("=" * 60)

print(f"Successful: {successful}")
print(f"Failed: {failed}")
print(f"Output file: {OUTPUT_FILE}")
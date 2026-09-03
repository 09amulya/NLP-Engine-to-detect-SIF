import os
import json
import re
import pandas as pd
import pdfplumber

# ============================================================
# CONFIGURATION
# ============================================================

INPUT_FOLDER = "input-data"
OUTPUT_FILE = "common_reports.json"


# ============================================================
# READ CSV FILES
# ============================================================

def read_csv_file(file_path):
    reports = []

    print(f"\nReading CSV: {file_path}")

    try:
        df = pd.read_csv(file_path)
    except UnicodeDecodeError:
        # Some industrial datasets use different encoding
        df = pd.read_csv(file_path, encoding="latin1")

    print(f"Rows found: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    # Find a suitable text/description column
    possible_text_columns = [
        "Description",
        "description",
        "Narrative",
        "narrative",
        "Final Narrative",
        "final_narrative",
        "report_text",
        "Report Text",
        "Report",
        "report",
        "Incident Description",
        "Incident_Description"
    ]

    text_column = None

    for column in possible_text_columns:
        if column in df.columns:
            text_column = column
            break

    if text_column is None:
        print("WARNING: No recognised description column found.")
        print("This CSV will be skipped.")
        return reports

    print(f"Using text column: {text_column}")

    # Read every row as one report
    for index, row in df.iterrows():

        text = row[text_column]

        # Skip empty reports
        if pd.isna(text):
            continue

        text = str(text).strip()

        if not text:
            continue

        report = {
            "report_id": f"{os.path.basename(file_path)}_row_{index}",
            "source_file": os.path.basename(file_path),
            "source_type": "csv",
            "report_text": text
        }

        reports.append(report)

    return reports

# ============================================================
# READ EXCEL FILES
# ============================================================

def read_excel_file(file_path):
    reports = []

    print(f"\nReading Excel: {file_path}")

    try:
        df = pd.read_excel(file_path)
    except Exception as error:
        print(f"ERROR reading Excel: {error}")
        return reports

    print(f"Rows found: {len(df)}")
    print(f"Columns: {list(df.columns)}")

    possible_text_columns = [
        "Description",
        "description",
        "Narrative",
        "narrative",
        "Final Narrative",
        "final_narrative",
        "report_text",
        "Report Text",
        "Report",
        "report",
        "Incident Description",
        "Incident_Description"
    ]

    text_column = None

    for column in possible_text_columns:
        if column in df.columns:
            text_column = column
            break

    if text_column is None:
        print("WARNING: No recognised description column found.")
        print("This Excel file will be skipped.")
        return reports

    print(f"Using text column: {text_column}")

    for index, row in df.iterrows():

        text = row[text_column]

        if pd.isna(text):
            continue

        text = str(text).strip()

        if not text:
            continue

        report = {
            "report_id": (
                f"{os.path.basename(file_path)}"
                f"_row_{index}"
            ),
            "source_file": os.path.basename(file_path),
            "source_type": "xlsx",
            "report_text": text
        }

        reports.append(report)

    return reports

# ============================================================
# READ PDF FILES
# ============================================================

def read_pdf_file(file_path):
    reports = []

    print(f"\nReading PDF: {file_path}")

    pages_text = []

    try:
        with pdfplumber.open(file_path) as pdf:

            print(f"Pages found: {len(pdf.pages)}")

            for page_number, page in enumerate(pdf.pages, start=1):

                page_text = page.extract_text()

                if page_text:
                    pages_text.append({
                        "page": page_number,
                        "text": page_text
                    })

    except Exception as error:
        print(f"ERROR reading PDF: {error}")
        return reports

    if not pages_text:
        print("WARNING: No readable text found in PDF.")
        return reports

    # --------------------------------------------------------
    # Combine PDF text while preserving page information
    # --------------------------------------------------------

    full_text = "\n".join(
        item["text"] for item in pages_text
    )

    if not full_text.strip():
        print("WARNING: PDF text is empty.")
        return reports

    # --------------------------------------------------------
    # Split using DATE: as report boundary
    # --------------------------------------------------------

    # Example:
    # DATE:
    # 13 Mar 2025
    #
    # DATE:
    # 18 Aug 2025

    date_pattern = re.compile(
        r"\bDATE\s*:",
        re.IGNORECASE
    )

    matches = list(date_pattern.finditer(full_text))

    print(f"DATE markers found: {len(matches)}")

    # --------------------------------------------------------
    # If DATE markers exist, create one report per DATE section
    # --------------------------------------------------------

    if matches:

        for index, match in enumerate(matches):

            start = match.start()

            if index + 1 < len(matches):
                end = matches[index + 1].start()
            else:
                end = len(full_text)

            report_text = full_text[start:end].strip()

            if not report_text:
                continue

            report = {
                "report_id": f"{os.path.basename(file_path)}_report_{index}",
                "source_file": os.path.basename(file_path),
                "source_type": "pdf",
                "report_text": report_text
            }

            reports.append(report)

    else:

        # ----------------------------------------------------
        # Fallback if DATE markers are not found
        # ----------------------------------------------------

        print(
            "WARNING: DATE markers not found. "
            "Using page-level chunks as fallback."
        )

        for index, item in enumerate(pages_text):

            report_text = item["text"].strip()

            if not report_text:
                continue

            report = {
                "report_id": (
                    f"{os.path.basename(file_path)}"
                    f"_page_{item['page']}"
                ),
                "source_file": os.path.basename(file_path),
                "source_type": "pdf",
                "report_text": report_text
            }

            reports.append(report)

    print(f"Individual PDF reports created: {len(reports)}")

    return reports
# ============================================================
# MAIN INGESTION FUNCTION
# ============================================================

def ingest_all_data():

    all_reports = []

    # Check input folder exists
    if not os.path.exists(INPUT_FOLDER):
        print(f"ERROR: Folder '{INPUT_FOLDER}' does not exist.")
        return

    print("=" * 60)
    print("SAFETY REPORT DATA INGESTION STARTED")
    print("=" * 60)

    # Read all files in input-data folder
    for filename in os.listdir(INPUT_FOLDER):

        file_path = os.path.join(INPUT_FOLDER, filename)

        # Ignore folders
        if not os.path.isfile(file_path):
            continue

        # CSV
        if filename.lower().endswith(".csv"):

            reports = read_csv_file(file_path)
            all_reports.extend(reports)

        # PDF
        elif filename.lower().endswith(".pdf"):

            reports = read_pdf_file(file_path)
            all_reports.extend(reports)

        # Excel
        elif filename.lower().endswith((".xlsx", ".xls")):

            reports = read_excel_file(file_path)
            all_reports.extend(reports)

        else:
            print(f"\nSkipping unsupported file: {filename}")

    # ========================================================
    # SAVE COMMON REPORT FORMAT
    # ========================================================

    with open(OUTPUT_FILE, "w", encoding="utf-8") as file:

        json.dump(
            all_reports,
            file,
            indent=4,
            ensure_ascii=False
        )

    print("\n" + "=" * 60)
    print("INGESTION COMPLETED")
    print("=" * 60)

    print(f"Total reports/text units: {len(all_reports)}")
    print(f"Output saved to: {OUTPUT_FILE}")


# ============================================================
# RUN PROGRAM
# ============================================================

if __name__ == "__main__":
    ingest_all_data()
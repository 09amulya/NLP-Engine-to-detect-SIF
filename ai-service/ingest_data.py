import os
import json
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
# READ PDF FILES
# ============================================================

def read_pdf_file(file_path):
    reports = []

    print(f"\nReading PDF: {file_path}")

    full_text = ""

    try:
        with pdfplumber.open(file_path) as pdf:

            print(f"Pages found: {len(pdf.pages)}")

            for page in pdf.pages:
                page_text = page.extract_text()

                if page_text:
                    full_text += page_text + "\n"

    except Exception as error:
        print(f"ERROR reading PDF: {error}")
        return reports

    # For now, save the extracted PDF text as chunks.
    # Later we can improve splitting based on:
    # DATE:, COUNTRY:, NARRATIVE:, etc.

    if not full_text.strip():
        print("WARNING: No readable text found in PDF.")
        return reports

    # Split large PDF into manageable chunks
    chunk_size = 5000

    chunks = [
        full_text[i:i + chunk_size]
        for i in range(0, len(full_text), chunk_size)
    ]

    for index, chunk in enumerate(chunks):

        chunk = chunk.strip()

        if not chunk:
            continue

        report = {
            "report_id": f"{os.path.basename(file_path)}_chunk_{index}",
            "source_file": os.path.basename(file_path),
            "source_type": "pdf",
            "report_text": chunk
        }

        reports.append(report)

    print(f"Text chunks created: {len(reports)}")

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
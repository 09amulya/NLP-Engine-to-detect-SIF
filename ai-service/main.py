from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import json
from pathlib import Path


app = FastAPI(
    title="SIH 2026 Safety Intelligence API",
    version="1.0.0",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# FILE PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent

HSE_FILE = BASE_DIR / "hse_priorities.json"
PRECURSOR_FILE = BASE_DIR / "precursor_patterns.json"
REPORTS_FILE = BASE_DIR / "sif_classified_reports.json"


# --------------------------------------------------
# LOAD JSON
# --------------------------------------------------

def load_json(path: Path):

    if not path.exists():
        raise HTTPException(
            status_code=500,
            detail=f"JSON file not found: {path}"
        )

    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)

    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON in {path.name}: {error}"
        )


# --------------------------------------------------
# HEALTH
# --------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok",
        "service": "SIH 2026 Safety Intelligence API"
    }


# --------------------------------------------------
# HSE PRIORITIES
# --------------------------------------------------

@app.get("/interventions/priorities")
def get_priorities():

    priorities = load_json(HSE_FILE)

    return {
        "count": len(priorities),
        "priorities": priorities
    }


# --------------------------------------------------
# SINGLE PRIORITY
# --------------------------------------------------

@app.get("/interventions/{pattern_id}")
def get_intervention(pattern_id: str):

    priorities = load_json(HSE_FILE)
    precursors = load_json(PRECURSOR_FILE)
    reports = load_json(REPORTS_FILE)

    print("Requested pattern:", pattern_id)

    # ------------------------------
    # Find priority
    # ------------------------------

    priority = next(
        (
            item
            for item in priorities
            if str(item.get("pattern_id", "")).strip().upper()
            == pattern_id.strip().upper()
        ),
        None
    )

    if priority is None:

        raise HTTPException(
            status_code=404,
            detail={
                "message": "HSE priority not found",
                "requested_pattern": pattern_id,
                "available_patterns": [
                    item.get("pattern_id")
                    for item in priorities
                ]
            }
        )

    # ------------------------------
    # Find precursor
    # ------------------------------

    precursor = next(
        (
            item
            for item in precursors
            if str(item.get("pattern_id", "")).strip().upper()
            == pattern_id.strip().upper()
        ),
        None
    )

    # ------------------------------
    # Get report IDs
    # ------------------------------

    report_ids = set(
        priority.get("report_ids", [])
    )

    # ------------------------------
    # Find actual reports
    # ------------------------------

    related_reports = [
        report
        for report in reports
        if report.get("report_id") in report_ids
    ]

    return {
        "pattern_id": pattern_id,
        "hse_priority": priority,
        "precursor": precursor,
        "related_reports": related_reports
    }


# --------------------------------------------------
# SUPPORTING REPORTS
# --------------------------------------------------

@app.get("/interventions/{pattern_id}/reports")
def get_reports_for_pattern(pattern_id: str):

    priorities = load_json(HSE_FILE)
    reports = load_json(REPORTS_FILE)

    priority = next(
        (
            item
            for item in priorities
            if str(item.get("pattern_id", "")).strip().upper()
            == pattern_id.strip().upper()
        ),
        None
    )

    if priority is None:

        raise HTTPException(
            status_code=404,
            detail=f"Pattern {pattern_id} not found"
        )

    report_ids = set(
        priority.get("report_ids", [])
    )

    related_reports = [
        report
        for report in reports
        if report.get("report_id") in report_ids
    ]

    return {
        "pattern_id": pattern_id,
        "count": len(related_reports),
        "reports": related_reports
    }


# --------------------------------------------------
# ALL PRECURSORS
# --------------------------------------------------

@app.get("/precursors")
def get_precursors():

    precursors = load_json(PRECURSOR_FILE)

    return {
        "count": len(precursors),
        "precursors": precursors
    }


# --------------------------------------------------
# ALL REPORTS
# --------------------------------------------------

@app.get("/reports")
def get_reports():

    reports = load_json(REPORTS_FILE)

    return {
        "count": len(reports),
        "reports": reports
    }
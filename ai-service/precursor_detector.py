import json
import re
from collections import defaultdict


INPUT_FILE = "sif_classified_reports.json"
OUTPUT_FILE = "precursor_patterns.json"


def extract_field(text, field_name):
    if not text:
        return None

    pattern = rf"{re.escape(field_name)}\s*:\s*(.*)"
    match = re.search(pattern, text, re.IGNORECASE)

    if not match:
        return None

    value = match.group(1).strip()

    value = re.split(
        r"\s+(?:COUNTRY|FUNCTION|CAUSE|ACTIVITY|PRIMARY LIFE-SAVING RULE|"
        r"SECONARY LIFE-SAVING RULE|NARRATIVE|WHAT WENT WRONG|"
        r"CORRECTIVE ACTIONS|CAUSAL FACTORS)\s*:",
        value,
        flags=re.IGNORECASE
    )[0].strip()

    return value


def clean(value):
    if value is None:
        return None

    value = str(value).strip()

    if value.lower() in [
        "",
        "unknown",
        "null",
        "none",
        "not specified"
    ]:
        return None

    return value


def normalize_key(value):
    """
    Makes grouping more stable.
    """

    if not value:
        return "Unknown"

    return value.strip().lower()


def main():

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        reports = json.load(f)

    patterns = defaultdict(lambda: {
        "report_ids": [],
        "countries": [],
        "activities": [],
        "hazards": [],
        "lsrs": [],
        "barrier_failures": [],
        "sif_levels": [],
        "scores": []
    })

    for report in reports:

        # IMPORTANT:
        # Your actual JSON uses normalized_extraction
        extraction = report.get(
            "normalized_extraction",
            {}
        )

        sif = report.get(
            "sif_classification",
            {}
        )

        activity = clean(
            extraction.get("activity")
        )

        hazard = clean(
            extraction.get("hazard")
        )

        barrier = clean(
            extraction.get("barrier_failure")
        )

        primary_lsr = clean(
            extraction.get("primary_lsr")
        )

        secondary_lsr = clean(
            extraction.get("secondary_lsr")
        )

        original_text = (
            report.get("original_report")
            or ""
        )

        country = clean(
            extract_field(
                original_text,
                "COUNTRY"
            )
        )

        # -----------------------------------------
        # PRECURSOR KEY
        # -----------------------------------------
        #
        # Country is NOT part of the key.
        #
        # This allows the same precursor to appear
        # across different countries.
        #

        activity_key = normalize_key(
            activity
        )

        hazard_key = normalize_key(
            hazard
        )

        barrier_key = normalize_key(
            barrier
        )

        key = (
            activity_key,
            hazard_key,
            barrier_key
        )

        # -----------------------------------------
        # Store report information
        # -----------------------------------------

        patterns[key]["report_ids"].append(
            report.get("report_id")
        )

        if country:
            patterns[key]["countries"].append(
                country
            )

        if activity:
            patterns[key]["activities"].append(
                activity
            )

        if hazard:
            patterns[key]["hazards"].append(
                hazard
            )

        if primary_lsr:
            patterns[key]["lsrs"].append(
                primary_lsr
            )

        if secondary_lsr:
            patterns[key]["lsrs"].append(
                secondary_lsr
            )

        if barrier:
            patterns[key]["barrier_failures"].append(
                barrier
            )

        sif_level = sif.get(
            "sif_level"
        )

        if sif_level:
            patterns[key]["sif_levels"].append(
                sif_level
            )

        score = sif.get(
            "score"
        )

        if isinstance(
            score,
            (int, float)
        ):
            patterns[key]["scores"].append(
                score
            )

    # -----------------------------------------
    # Build precursor results
    # -----------------------------------------

    precursor_results = []

    for index, (key, data) in enumerate(
        patterns.items(),
        start=1
    ):

        activity_key, hazard_key, barrier_key = key

        occurrence_count = len(
            data["report_ids"]
        )

        high_count = data[
            "sif_levels"
        ].count("HIGH")

        medium_count = data[
            "sif_levels"
        ].count("MEDIUM")

        low_count = data[
            "sif_levels"
        ].count("LOW")

        unique_countries = sorted(
            set(data["countries"])
        )

        unique_lsrs = sorted(
            set(data["lsrs"])
        )

        # Average SIF score
        avg_score = (
            round(
                sum(data["scores"])
                /
                len(data["scores"]),
                2
            )
            if data["scores"]
            else 0
        )

        # -----------------------------------------
        # PRIORITY SCORE
        # -----------------------------------------
        #
        # Frequency matters most.
        # HIGH SIF adds extra importance.
        #

        priority_score = (
            occurrence_count * 2
            + high_count * 3
            + medium_count
        )

        # Bonus if pattern appears across
        # multiple countries.
        if len(unique_countries) >= 2:
            priority_score += 2

        # -----------------------------------------
        # Priority classification
        # -----------------------------------------

        if priority_score >= 12:
            priority = "HIGH"

        elif priority_score >= 6:
            priority = "MEDIUM"

        else:
            priority = "LOW"

        # -----------------------------------------
        # Human readable names
        # -----------------------------------------

        activity_display = (
            data["activities"][0]
            if data["activities"]
            else "Unknown activity"
        )

        hazard_display = (
            data["hazards"][0]
            if data["hazards"]
            else "Unknown hazard"
        )

        barrier_display = (
            data["barrier_failures"][0]
            if data["barrier_failures"]
            else "Unknown barrier failure"
        )

        precursor_results.append({

            "pattern_id":
                f"PREC-{index:03d}",

            "activity":
                activity_display,

            "hazard":
                hazard_display,

            "barrier_failure":
                barrier_display,

            "related_lsrs":
                unique_lsrs,

            "countries":
                unique_countries,

            "occurrence_count":
                occurrence_count,

            "high_sif_count":
                high_count,

            "medium_sif_count":
                medium_count,

            "low_sif_count":
                low_count,

            "average_sif_score":
                avg_score,

            "priority_score":
                priority_score,

            "priority":
                priority,

            "report_ids":
                data["report_ids"]
        })

    # -----------------------------------------
    # Sort by priority
    # -----------------------------------------

    precursor_results.sort(
        key=lambda x: (
            x["priority_score"],
            x["occurrence_count"],
            x["high_sif_count"]
        ),
        reverse=True
    )

    # Add ranking
    for rank, pattern in enumerate(
        precursor_results,
        start=1
    ):
        pattern["rank"] = rank

    # -----------------------------------------
    # Save
    # -----------------------------------------

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            precursor_results,
            f,
            indent=2,
            ensure_ascii=False
        )

    # -----------------------------------------
    # Terminal output
    # -----------------------------------------

    print("\n" + "=" * 60)
    print(
        "PRECURSOR PATTERN DETECTION COMPLETED"
    )
    print("=" * 60)

    print(
        f"Reports processed : {len(reports)}"
    )

    print(
        f"Patterns detected : "
        f"{len(precursor_results)}"
    )

    print("\nTOP PRECURSOR PATTERNS")
    print("-" * 60)

    for pattern in precursor_results[:10]:

        print(
            f"\n{pattern['pattern_id']} "
            f"→ {pattern['priority']}"
        )

        print(
            f"   Activity      : "
            f"{pattern['activity']}"
        )

        print(
            f"   Hazard        : "
            f"{pattern['hazard']}"
        )

        print(
            f"   Barrier       : "
            f"{pattern['barrier_failure']}"
        )

        print(
            f"   LSRs          : "
            f"{', '.join(pattern['related_lsrs'])}"
        )

        print(
            f"   Countries     : "
            f"{', '.join(pattern['countries'])}"
        )

        print(
            f"   Occurrences   : "
            f"{pattern['occurrence_count']}"
        )

        print(
            f"   HIGH SIF      : "
            f"{pattern['high_sif_count']}"
        )

        print(
            f"   MEDIUM SIF    : "
            f"{pattern['medium_sif_count']}"
        )

        print(
            f"   Priority score: "
            f"{pattern['priority_score']}"
        )

    print("\nOutput saved to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
import json


# ============================================================
# STRONG SIF INDICATORS
# ============================================================

LSR_WEIGHTS = {
    "energy isolation": 2,
    "line of fire": 2,
    "confined space": 2,
    "hot work": 2,
    "safe mechanical lifting": 2,
    "driving": 1,
    "work authorization": 1,
}


HAZARD_WEIGHTS = {
    "electrical energy": 3,
    "stored energy": 3,
    "dropped object": 3,
    "lifting hazard": 2,
    "vehicle/road hazard": 2,
    "fire/explosion": 3,
}


CONSEQUENCE_WEIGHTS = {
    "fatality": 5,
    "permanent impairment injury": 5,
    "open fracture": 4,
    "serious injury": 4,
    "injury": 1,
    "lost injury": 1,
}


# ============================================================
# CLASSIFY ONE REPORT
# ============================================================

def classify_sif(report):

    data = report.get(
        "normalized_extraction",
        {}
    )

    score = 0
    reasons = []

    # --------------------------------------------------------
    # PRIMARY LSR
    # --------------------------------------------------------

    primary_lsr = (
        data.get("primary_lsr") or ""
    ).lower().strip()

    if primary_lsr in LSR_WEIGHTS:

        weight = LSR_WEIGHTS[primary_lsr]

        score += weight

        reasons.append(
            f"Primary LSR: "
            f"{data.get('primary_lsr')} (+{weight})"
        )

    # --------------------------------------------------------
    # SECONDARY LSR
    # --------------------------------------------------------

    secondary_lsr = (
        data.get("secondary_lsr") or ""
    ).lower().strip()

    if secondary_lsr in LSR_WEIGHTS:

        weight = LSR_WEIGHTS[secondary_lsr]

        score += weight

        reasons.append(
            f"Secondary LSR: "
            f"{data.get('secondary_lsr')} (+{weight})"
        )

    # --------------------------------------------------------
    # HAZARD
    # --------------------------------------------------------

    hazard = (
        data.get("hazard") or ""
    ).lower().strip()

    if hazard in HAZARD_WEIGHTS:

        weight = HAZARD_WEIGHTS[hazard]

        score += weight

        reasons.append(
            f"Hazard: "
            f"{data.get('hazard')} (+{weight})"
        )

    # --------------------------------------------------------
    # CONSEQUENCE
    # --------------------------------------------------------

    consequence = (
        data.get("potential_consequence") or ""
    ).lower().strip()

    for keyword, weight in CONSEQUENCE_WEIGHTS.items():

        if keyword in consequence:

            score += weight

            reasons.append(
                f"Potential consequence: "
                f"{data.get('potential_consequence')} "
                f"(+{weight})"
            )

            break

    # --------------------------------------------------------
    # BARRIER FAILURE
    # --------------------------------------------------------

    barrier = (
        data.get("barrier_failure") or ""
    ).lower().strip()

    if barrier:

        score += 2

        reasons.append(
            "Safety barrier/control failure (+2)"
        )

    # --------------------------------------------------------
    # DIRECT LINE OF FIRE
    # --------------------------------------------------------

    unsafe_act = (
        data.get("unsafe_act") or ""
    ).lower()

    if "line of fire" in unsafe_act:

        score += 2

        reasons.append(
            "Direct line-of-fire exposure (+2)"
        )

    # --------------------------------------------------------
    # CLASSIFICATION
    # --------------------------------------------------------

    if score >= 10:

        level = "HIGH"

    elif score >= 5:

        level = "MEDIUM"

    else:

        level = "LOW"

    return {
        "sif_score": score,
        "sif_level": level,
        "sif_reasons": reasons
    }


# ============================================================
# MAIN
# ============================================================

def main():

    input_file = "processed_reports.json"
    output_file = "sif_classified_reports.json"

    with open(
        input_file,
        "r",
        encoding="utf-8"
    ) as file:

        reports = json.load(file)

    results = []

    for report in reports:

        classification = classify_sif(
            report
        )

        result = {
            **report,
            "sif_classification": classification
        }

        results.append(result)

        print(
            f"{report['report_id']} → "
            f"{classification['sif_level']} "
            f"(score: {classification['sif_score']})"
        )

        for reason in classification["sif_reasons"]:

            print(
                f"   • {reason}"
            )

    with open(
        output_file,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=2,
            ensure_ascii=False
        )

    # --------------------------------------------------------
    # SUMMARY
    # --------------------------------------------------------

    high = sum(
        1 for r in results
        if r["sif_classification"]["sif_level"]
        == "HIGH"
    )

    medium = sum(
        1 for r in results
        if r["sif_classification"]["sif_level"]
        == "MEDIUM"
    )

    low = sum(
        1 for r in results
        if r["sif_classification"]["sif_level"]
        == "LOW"
    )

    print("\n" + "=" * 60)
    print("SIF CLASSIFICATION COMPLETED")
    print("=" * 60)

    print(
        f"Total reports : {len(results)}"
    )

    print(
        f"HIGH          : {high}"
    )

    print(
        f"MEDIUM        : {medium}"
    )

    print(
        f"LOW           : {low}"
    )

    print(
        f"\nOutput saved to: {output_file}"
    )


if __name__ == "__main__":
    main()
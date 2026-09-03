def validate_result(result):

    issues = []

    required_fields = [
        "activity",
        "hazard",
        "location",
        "unsafe_act",
        "unsafe_condition",
        "barrier_failure",
        "potential_consequence",
        "primary_lsr",
        "secondary_lsr",
        "evidence",
        "confidence"
    ]

    # Check fields exist
    for field in required_fields:
        if field not in result:
            issues.append(f"Missing field: {field}")

    # If fields are missing, stop here
    if issues:
        return {
            "is_valid": False,
            "issues": issues
        }

    # --------------------------------------------------
    # Semantic quality check
    # --------------------------------------------------

    useful_fields = [
        "activity",
        "hazard",
        "unsafe_act",
        "unsafe_condition",
        "barrier_failure",
        "potential_consequence"
    ]

    useful_count = sum(
        1 for field in useful_fields
        if result.get(field)
    )

    if useful_count == 0:
        issues.append(
            "Extraction contains no useful safety information"
        )

    # --------------------------------------------------
    # Evidence check
    # --------------------------------------------------

    evidence = result.get("evidence")

    if not isinstance(evidence, list):
        issues.append("Evidence must be a list")

    elif len(evidence) == 0:
        issues.append("No evidence extracted")

    # --------------------------------------------------
    # Confidence check
    # --------------------------------------------------

    confidence = result.get("confidence")

    if not isinstance(confidence, (int, float)):
        issues.append("Confidence must be numeric")

    elif confidence < 0 or confidence > 1:
        issues.append("Confidence must be between 0 and 1")

    return {
        "is_valid": len(issues) == 0,
        "issues": issues
    }
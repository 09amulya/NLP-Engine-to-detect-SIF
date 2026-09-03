def clean_value(value):

    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()

        if value.lower() in [
            "",
            "null",
            "unknown",
            "not specified",
            "not mentioned"
        ]:
            return None

        return value

    return value


def normalize_result(result):

    normalized = {}

    fields = [
        "activity",
        "hazard",
        "location",
        "unsafe_act",
        "unsafe_condition",
        "barrier_failure",
        "potential_consequence",
        "primary_lsr",
        "secondary_lsr"
    ]

    for field in fields:
        normalized[field] = clean_value(
            result.get(field)
        )

    # Evidence
    evidence = result.get("evidence", [])

    if isinstance(evidence, list):
        normalized["evidence"] = [
            str(item).strip()
            for item in evidence
            if item
        ]
    else:
        normalized["evidence"] = []

    # Confidence
    confidence = result.get("confidence", 0)

    try:
        normalized["confidence"] = float(confidence)
    except:
        normalized["confidence"] = 0.0

    return normalized
EXPECTED_FIELDS = [
    "activity",
    "hazard",
    "location",
    "unsafe_act",
    "unsafe_condition",
    "barrier_failure",
    "potential_consequence",
    "evidence"
]


def validate_result(result):

    validation = {
        "is_valid": True,
        "issues": []
    }


    # Check all fields exist
    for field in EXPECTED_FIELDS:

        if field not in result:

            validation["is_valid"] = False

            validation["issues"].append(
                f"Missing field: {field}"
            )


    # Check evidence is a list
    if not isinstance(result.get("evidence"), list):

        validation["is_valid"] = False

        validation["issues"].append(
            "Evidence must be a list"
        )


    # Check non-evidence fields
    for field in EXPECTED_FIELDS:

        if field == "evidence":
            continue

        value = result.get(field)

        if value is not None and not isinstance(value, str):

            validation["issues"].append(
                f"{field} should be a string or null"
            )


    return validation
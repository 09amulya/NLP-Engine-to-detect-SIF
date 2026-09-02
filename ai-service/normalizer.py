import re


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


def normalize_key(key):

    key = key.lower().strip()

    # Replace spaces with underscores
    key = re.sub(r"\s+", "_", key)

    # Remove spaces around underscores
    key = re.sub(r"\s*_\s*", "_", key)

    return key


def normalize_result(raw_result):

    result = {}

    # Normalize all keys returned by Qwen
    normalized_raw = {}

    for key, value in raw_result.items():

        normalized_key = normalize_key(key)

        normalized_raw[normalized_key] = value


    # Create our fixed schema
    for field in EXPECTED_FIELDS:

        result[field] = normalized_raw.get(field, None)


    # Evidence should always be a list
    if result["evidence"] is None:

        result["evidence"] = []

    elif isinstance(result["evidence"], str):

        result["evidence"] = [
            result["evidence"]
        ]

    return result
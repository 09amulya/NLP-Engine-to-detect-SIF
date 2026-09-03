import re


def find_field(text, field_name, next_fields):
    """
    Extract a named field from the structured safety report.
    """

    if next_fields:
        next_pattern = "|".join(
            re.escape(field)
            for field in next_fields
        )

        pattern = (
            rf"{re.escape(field_name)}:\s*"
            rf"(.*?)"
            rf"(?=\n(?:{next_pattern}):|\Z)"
        )

    else:
        pattern = (
            rf"{re.escape(field_name)}:\s*(.*)"
        )

    match = re.search(
        pattern,
        text,
        flags=re.IGNORECASE | re.DOTALL
    )

    if not match:
        return None

    value = match.group(1).strip()

    return value if value else None


def extract_safety_information(report_text):

    # ==================================================
    # 1. STRUCTURED FIELDS
    # ==================================================

    activity = find_field(
        report_text,
        "ACTIVITY",
        [
            "PRIMARY LIFE-SAVING RULE",
            "SECONARY LIFE-SAVING RULE",
            "NARRATIVE"
        ]
    )

    primary_lsr = find_field(
        report_text,
        "PRIMARY LIFE-SAVING RULE",
        [
            "SECONARY LIFE-SAVING RULE",
            "NARRATIVE"
        ]
    )

    secondary_lsr = find_field(
        report_text,
        "SECONARY LIFE-SAVING RULE",
        [
            "NARRATIVE"
        ]
    )

    narrative = find_field(
        report_text,
        "NARRATIVE",
        [
            "Immediate action",
            "WHAT WENT WRONG",
            "CORRECTIVE ACTIONS AND RECOMMENDATIONS",
            "CAUSAL FACTORS"
        ]
    )

    what_went_wrong = find_field(
        report_text,
        "WHAT WENT WRONG",
        [
            "CORRECTIVE ACTIONS AND RECOMMENDATIONS",
            "CAUSAL FACTORS"
        ]
    )

    corrective_actions = find_field(
        report_text,
        "CORRECTIVE ACTIONS AND RECOMMENDATIONS",
        [
            "CAUSAL FACTORS"
        ]
    )

    causal_factors = find_field(
        report_text,
        "CAUSAL FACTORS",
        []
    )

    # ==================================================
    # 2. TEXT WE USE FOR ANALYSIS
    # ==================================================

    incident_text = " ".join(
        filter(
            None,
            [
                narrative,
                what_went_wrong
            ]
        )
    ).lower()

    causal_text = (
        causal_factors or ""
    ).lower()

    # ==================================================
    # 3. HAZARD
    # ==================================================

    hazard = None

    # IMPORTANT:
    # Check specific hazards first.
    # Do not classify every report containing
    # the word "fire" as fire/explosion.

    if any(
        word in incident_text
        for word in [
            "11kv",
            "electrical cable",
            "electrical energy",
            "electric shock",
            "electrocution"
        ]
    ):
        hazard = "electrical energy"

    elif any(
        word in incident_text
        for word in [
            "tension",
            "rebound",
            "stored energy",
            "spring effect",
            "pressurized",
            "pressure release"
        ]
    ):
        hazard = "stored energy"

    elif any(
        word in incident_text
        for word in [
            "dropped object",
            "dropped",
            "falling object",
            "fell from",
            "fell off"
        ]
    ):
        hazard = "dropped object"

    elif any(
        word in incident_text
        for word in [
            "hook",
            "crane",
            "spider chain",
            "lifting"
        ]
    ):
        hazard = "lifting hazard"

    elif any(
        word in incident_text
        for word in [
            "bus",
            "road accident",
            "vehicle",
            "pothole",
            "road edge"
        ]
    ):
        hazard = "vehicle/road hazard"

    elif any(
        word in incident_text
        for word in [
            "explosion",
            "exploded",
            "gas leak",
            "flammable",
            "ignition"
        ]
    ):
        hazard = "fire/explosion"

    # ==================================================
    # 4. UNSAFE ACT
    # ==================================================

    unsafe_act = None

    unsafe_act_patterns = [
        "improper position",
        "improper lifting",
        "improper use",
        "failure to follow",
        "improper decision making",
        "driving too close",
        "improper speed"
    ]

    for phrase in unsafe_act_patterns:

        if phrase in causal_text or phrase in incident_text:

            unsafe_act = phrase
            break

    # ==================================================
    # 5. UNSAFE CONDITION
    # ==================================================

    unsafe_condition = None

    condition_patterns = [
        "inadequate surfaces, floors, walkways or roads",
        "storms or acts of nature",
        "inadequate hazard identification or risk assessment",
        "inadequate supervision",
        "inadequate communication",
        "poor work planning",
        "equipment or materials not secured"
    ]

    for phrase in condition_patterns:

        if phrase in causal_text or phrase in incident_text:

            unsafe_condition = phrase
            break

    # ==================================================
    # 6. BARRIER FAILURE
    # ==================================================

    barrier_failure = None

    barrier_patterns = [
        "inadequate hazard identification or risk assessment",
        "failure to follow lifting procedures",
        "inadequate supervision",
        "inadequate communication",
        "poor work planning",
        "bypassing safety controls",
        "failure to warn of hazard"
    ]

    for phrase in barrier_patterns:

        if phrase in causal_text or phrase in incident_text:

            barrier_failure = phrase
            break

    # ==================================================
    # 7. POTENTIAL CONSEQUENCE
    # ==================================================

    potential_consequence = None

    consequence_patterns = [
        "fatality",
        "permanent impairment injury",
        "open fracture",
        "serious injury",
        "lost injury",
        "injury"
    ]

    for phrase in consequence_patterns:

        if phrase in incident_text:

            potential_consequence = phrase
            break

    # ==================================================
    # 8. EVIDENCE
    # ==================================================

    evidence = []

    if what_went_wrong:
        evidence.append(
            what_went_wrong.strip()
        )

    if unsafe_act:
        evidence.append(
            unsafe_act
        )

    if unsafe_condition:
        evidence.append(
            unsafe_condition
        )

    if barrier_failure:
        evidence.append(
            barrier_failure
        )

    evidence = list(
        dict.fromkeys(evidence)
    )

    # ==================================================
    # 9. CONFIDENCE
    # ==================================================

    extracted_fields = [
        activity,
        hazard,
        unsafe_act,
        unsafe_condition,
        barrier_failure,
        potential_consequence,
        primary_lsr,
        secondary_lsr
    ]

    useful_count = sum(
        1 for value in extracted_fields
        if value
    )

    confidence = min(
        0.95,
        0.50 + (useful_count * 0.05)
    )

    # ==================================================
    # 10. FINAL RESULT
    # ==================================================

    return {
        "activity": activity,
        "hazard": hazard,
        "location": None,
        "unsafe_act": unsafe_act,
        "unsafe_condition": unsafe_condition,
        "barrier_failure": barrier_failure,
        "potential_consequence": potential_consequence,
        "primary_lsr": primary_lsr,
        "secondary_lsr": secondary_lsr,
        "evidence": evidence[:5],
        "confidence": round(confidence, 2)
    }
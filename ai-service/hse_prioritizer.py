import json


INPUT_FILE = "precursor_patterns.json"
OUTPUT_FILE = "hse_priorities.json"


def calculate_priority(pattern):

    occurrence = pattern.get(
        "occurrence_count", 0
    )

    high_sif = pattern.get(
        "high_sif_count", 0
    )

    medium_sif = pattern.get(
        "medium_sif_count", 0
    )

    countries = len(
        pattern.get("countries", [])
    )

    # Explainable HSE priority score
    score = (
        occurrence * 3
        + high_sif * 5
        + medium_sif * 2
        + countries * 1
    )

    return score


def get_priority(score):

    if score >= 15:
        return "CRITICAL"

    elif score >= 10:
        return "HIGH"

    elif score >= 5:
        return "MEDIUM"

    return "LOW"


def generate_recommendation(pattern, priority):

    activity = pattern.get(
        "activity",
        "Unknown activity"
    )

    hazard = pattern.get(
        "hazard",
        "Unknown hazard"
    )

    barrier = pattern.get(
        "barrier_failure",
        "Unknown barrier failure"
    )

    if priority == "CRITICAL":

        return (
            f"Immediate HSE review recommended for "
            f"{activity}. Focus on {hazard} and "
            f"the recurring barrier failure: {barrier}."
        )

    elif priority == "HIGH":

        return (
            f"Prioritize HSE investigation for "
            f"{activity}. Review controls related to "
            f"{hazard} and {barrier}."
        )

    elif priority == "MEDIUM":

        return (
            f"Continue monitoring {activity} and "
            f"review the identified {hazard} risk."
        )

    return (
        f"Monitor the precursor pattern and "
        f"reassess if recurrence increases."
    )


def main():

    with open(
        INPUT_FILE,
        "r",
        encoding="utf-8"
    ) as f:

        patterns = json.load(f)

    priorities = []

    for pattern in patterns:

        score = calculate_priority(
            pattern
        )

        priority = get_priority(
            score
        )

        recommendation = generate_recommendation(
            pattern,
            priority
        )

        priorities.append({

            "priority_rank": 0,

            "pattern_id":
                pattern.get("pattern_id"),

            "priority":
                priority,

            "hse_priority_score":
                score,

            "activity":
                pattern.get("activity"),

            "hazard":
                pattern.get("hazard"),

            "barrier_failure":
                pattern.get("barrier_failure"),

            "related_lsrs":
                pattern.get("related_lsrs", []),

            "countries":
                pattern.get("countries", []),

            "occurrence_count":
                pattern.get("occurrence_count", 0),

            "high_sif_count":
                pattern.get("high_sif_count", 0),

            "medium_sif_count":
                pattern.get("medium_sif_count", 0),

            "recommendation":
                recommendation,

            "report_ids":
                pattern.get("report_ids", [])
        })

    # Highest priority first
    priorities.sort(
        key=lambda x: (
            x["hse_priority_score"],
            x["high_sif_count"],
            x["occurrence_count"]
        ),
        reverse=True
    )

    # Ranking
    for rank, item in enumerate(
        priorities,
        start=1
    ):

        item["priority_rank"] = rank

    with open(
        OUTPUT_FILE,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            priorities,
            f,
            indent=2,
            ensure_ascii=False
        )

    print("\n" + "=" * 60)
    print("HSE PRIORITIZATION COMPLETED")
    print("=" * 60)

    print(
        f"Patterns analyzed : {len(patterns)}"
    )

    print("\nTOP HSE PRIORITIES")
    print("-" * 60)

    for item in priorities[:10]:

        print(
            f"\n#{item['priority_rank']} "
            f"{item['priority']}"
        )

        print(
            f"   Pattern       : "
            f"{item['pattern_id']}"
        )

        print(
            f"   Activity      : "
            f"{item['activity']}"
        )

        print(
            f"   Hazard        : "
            f"{item['hazard']}"
        )

        print(
            f"   Occurrences   : "
            f"{item['occurrence_count']}"
        )

        print(
            f"   HIGH SIF      : "
            f"{item['high_sif_count']}"
        )

        print(
            f"   Countries     : "
            f"{', '.join(item['countries'])}"
        )

        print(
            f"   HSE score     : "
            f"{item['hse_priority_score']}"
        )

        print(
            f"   Recommendation:"
        )

        print(
            f"   {item['recommendation']}"
        )

    print("\nOutput saved to:")
    print(OUTPUT_FILE)


if __name__ == "__main__":
    main()
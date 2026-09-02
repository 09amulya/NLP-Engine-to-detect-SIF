import ollama
import json


def extract_safety_information(report_text):

    prompt = f"""
You are analyzing an industrial safety report.

Extract the important safety information from the report.

Return only valid JSON.

Use these fields:

activity
hazard
location
unsafe_act
unsafe_condition
barrier_failure
potential_consequence
evidence

Rules:

- Extract relevant information from the report.
- If information cannot be identified, use null.
- Keep values short and specific.
- Do not add explanations outside the JSON.

REPORT:

{report_text}
"""

    response = ollama.chat(
        model="qwen:4b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        format="json"
    )

    return json.loads(
        response["message"]["content"]
    )
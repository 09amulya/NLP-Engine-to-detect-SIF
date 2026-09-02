from extractor import extract_safety_information
from normalizer import normalize_result
from validator import validate_result


report = """
During maintenance of a compressor, a technician began
preparing for work before electrical isolation was verified.
"""


# Step 1: LLM extraction
raw_result = extract_safety_information(report)


# Step 2: Normalize structure
normalized_result = normalize_result(raw_result)


# Step 3: Validate structure
validation_result = validate_result(normalized_result)


print("\nRAW RESULT:")
print(raw_result)

print("\nNORMALIZED RESULT:")
print(normalized_result)

print("\nVALIDATION RESULT:")
print(validation_result)
import json
import sys
import re

def extract_js_object(ts_content):
    """
    Extracts the JavaScript object from the TypeScript content.
    """
    start_index = ts_content.find("{")
    end_index = ts_content.rfind("}") + 1
    js_object_str = ts_content[start_index:end_index]
    
    # Remove TypeScript-specific syntax
    js_object_str = re.sub(r'\[.*?\]', '', js_object_str)  # Remove type annotations
    js_object_str = re.sub(r':\s*string', '', js_object_str)  # Remove type annotations
    js_object_str = re.sub(r':\s*Subtopics', '', js_object_str)  # Remove type annotations
    
    return js_object_str

def convert_ts_to_json(input_file, output_file):
    """
    Converts the TypeScript subjects file to a JSON file.
    """
    with open(input_file, 'r') as ts_file:
        ts_content = ts_file.read()

    # Extract the JavaScript object from the TypeScript content
    js_object_str = extract_js_object(ts_content)

    # Convert the JavaScript object to a Python dictionary
    # Note: Using `eval` is generally unsafe for untrusted input, but we'll use it here for simplicity.
    subjects_dict = eval(js_object_str)

    # Convert the Python dictionary to a JSON string
    subjects_json = json.dumps(subjects_dict, indent=4)

    # Write the JSON string to the output file
    with open(output_file, 'w') as json_file:
        json_file.write(subjects_json)

    print(f"Successfully converted {input_file} to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_subjects.py <input_file.ts> <output_file.json>")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        convert_ts_to_json(input_file, output_file)

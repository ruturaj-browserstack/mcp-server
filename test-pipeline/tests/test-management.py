import json
import os
import re
import subprocess
import uuid
import pytest

TEST_BED_PATH = os.path.join(os.path.dirname(__file__), "../test-bed/test-management.json")
MCP_CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.vscode/mcp.json"))
MCP_SERVER = "browserstack"

def load_tests():
    with open(TEST_BED_PATH, "r") as f:
        data = json.load(f)
    return data["tests"]

def generate_arg_value(val):
    if isinstance(val, str):
        # Replace <random_string> with a short UUID
        return re.sub(r"<random_string>", str(uuid.uuid4())[:8], val)
    return val

def build_cli_args(tool_name, tool_args):
    args = [
        "npx", "@modelcontextprotocol/inspector", "--cli",
        "--config", MCP_CONFIG_PATH,
        "--server", MCP_SERVER,
        "--method", "tools/call",
        "--tool-name", tool_name
    ]
    for k, v in tool_args.items():
        v = generate_arg_value(v)
        args.extend(["--tool-arg", f"{k}={v}"])  # ✅ fixed: removed quotes
    return args

def run_tool(tool_name, tool_args):
    print(f"Running tool: {tool_name} with args: {tool_args}")
    args = build_cli_args(tool_name, tool_args)
    print(f"CLI command: {' '.join(args)}")

    result = subprocess.run(args, capture_output=True, text=True)
    print(f"Command stdout:\n{result.stdout}")
    print(f"Command stderr:\n{result.stderr}")
    if result.returncode != 0:
        raise RuntimeError(f"Command failed: {' '.join(args)}\n{result.stderr}")

    match = re.search(r'(\{.*\})', result.stdout, re.DOTALL)
    if not match:
        raise ValueError(f"No JSON found in output: {result.stdout}")
    return json.loads(match.group(1))

@pytest.mark.parametrize("test_case", load_tests())
def test_tool(test_case):
    tool_name = test_case["tool_name"]
    tool_args = test_case.get("tool-args", {})
    expected_response = test_case.get("response", {})
    actual_response = run_tool(tool_name, tool_args)

    expected_content = expected_response.get("content", [])
    actual_content = actual_response.get("content", [])

    assert len(expected_content) == len(actual_content), (
        f"Expected {len(expected_content)} content items, got {len(actual_content)}"
    )

    for idx, (exp, act) in enumerate(zip(expected_content, actual_content)):
        match_mode = exp.get("match_mode", "exact")
        exp_text = exp.get("text", "")
        act_text = act.get("text", "")

        if match_mode == "ignore":
            continue
        elif match_mode == "regex":
            assert re.search(exp_text, act_text), (
                f"Content[{idx}] regex match failed:\nPattern: {exp_text}\nActual: {act_text}"
            )
        elif match_mode == "exact":
            assert exp_text == act_text, (
                f"Content[{idx}] exact match failed:\nExpected: {exp_text}\nActual: {act_text}"
            )
        else:
            raise ValueError(f"Unknown match_mode: {match_mode}")

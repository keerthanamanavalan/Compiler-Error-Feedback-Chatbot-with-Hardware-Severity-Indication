import subprocess
import re
import time
import os
from colorama import Fore, Style, init

init(autoreset=True)

# --- Input Detection ---
def program_needs_input(code):
    """Check if C program contains input functions that require user input."""
    if not code:
        return False
    input_patterns = [
        r'\bscanf\s*\(',
        r'\bgets\s*\(',
        r'\bfgets\s*\(',
        r'\bgetchar\s*\(',
        r'\bgetc\s*\(',
        r'\bfgetc\s*\(',
        r'\bread\s*\(',
    ]
    code_lower = code.lower()
    return any(re.search(pattern, code_lower) for pattern in input_patterns)

# --- Error Classifier ---
def classify_error(gcc_output):
    output = gcc_output.lower()
    classification = {
        "error_type": "Unknown Error",
        "error_count": len(re.findall(r"\berror:", output)),
        "warning_count": len(re.findall(r"\bwarning:", output))
    }

    if "expected" in output or "syntax error" in output:
        classification["error_type"] = "Syntax Error"
    elif "undeclared" in output:
        classification["error_type"] = "Undeclared Variable"
    elif "uninitialized" in output:
        classification["error_type"] = "Uninitialized Variable"
    elif "format" in output and "printf" in output:
        classification["error_type"] = "Type Error"
    elif classification["warning_count"] > 0 and classification["error_count"] == 0:
        classification["error_type"] = "Warning"
    elif classification["error_count"] == 0 and classification["warning_count"] == 0:
        classification["error_type"] = "No Error"

    return classification


# --- Severity Model ---
def calculate_severity_engine(error_count, warning_count, error_type, mode="pro"):
    error_type_levels = {
        "Syntax Error": 4,
        "Type Error": 3,
        "Semantic Error": 3,
        "Runtime Error": 3,
        "Undeclared Variable": 3,
        "Uninitialized Variable": 2,
        "Warning": 1,
        "No Error": 0,
        "Unknown Error": 2
    }
    S_to_score = {0: 0, 1: 25, 2: 50, 3: 75, 4: 100}

    A_level = error_type_levels.get(error_type, 2)
    A_score = S_to_score[A_level]

    if A_level >= 4: B_level = 4
    elif A_level == 3: B_level = 3
    elif A_level == 2: B_level = 2
    elif A_level == 1: B_level = 1
    else: B_level = 0
    B_score = S_to_score[B_level]

    total = error_count + warning_count
    C_level = 3 if total >= 5 else 2 if total >= 3 else 1 if total >= 1 else 0
    C_score = S_to_score[C_level]

    D_level = max(0, A_level - 1) if mode == "student" else A_level
    D_score = S_to_score[D_level]

    final_score = (A_score * 0.4 + B_score * 0.3 + C_score * 0.2 + D_score * 0.1)
    severity_percent = min(int(final_score), 100)

    if severity_percent == 0:
        label, level = "No Error", 0
    elif severity_percent <= 30:
        label, level = "Low", 1
    elif severity_percent <= 60:
        label, level = "Medium", 2
    elif severity_percent <= 85:
        label, level = "High", 3
    else:
        label, level = "Critical", 4

    return {
        "severity_percent": severity_percent,
        "severity_label": label,
        "severity_level": level
    }


# --- MAIN COMPILER FUNCTION ---
def compile_c_program(file_path, output_file="output.exe", skip_execution=False):
    try:
        start_time = time.time()
        result = subprocess.run(
            ["gcc", "-Wall", file_path, "-o", output_file],
            capture_output=True, text=True, encoding="utf-8", errors="replace"
        )
        compile_time_ms = round((time.time() - start_time) * 1000, 2)

        # ✅ Compilation successful
        if result.returncode == 0:
            # If skip_execution is True (program needs input), don't run automatically
            if skip_execution:
                program_output = "(Program requires input. Please provide input and run the program.)"
            else:
                # Try to run program (only for programs that don't need input)
                try:
                    # Run program with timeout and empty stdin
                    # Use output_file directly (it's already a full path on Windows)
                    exe_path = output_file
                    # On Windows, ensure .exe extension if not present
                    if os.name == 'nt' and not exe_path.endswith('.exe'):
                        exe_path = exe_path + '.exe'
                    
                    run_result = subprocess.run(
                        [exe_path], 
                        input="",  # Provide empty stdin
                        capture_output=True,
                        text=True, 
                        encoding="utf-8", 
                        errors="replace",
                        timeout=3,  # 3 second timeout (shorter since we know it shouldn't need input)
                        cwd=os.path.dirname(exe_path) or os.getcwd()  # Run from the directory containing the exe
                    )
                    program_output = run_result.stdout.strip()
                    if run_result.stderr:
                        stderr_msg = run_result.stderr.strip()
                        if stderr_msg:
                            program_output += f"\n{stderr_msg}"
                    if not program_output:
                        program_output = "(Program executed successfully with no output)"
                except subprocess.TimeoutExpired:
                    # Program took too long (unexpected for programs without input)
                    program_output = "(Program execution timed out. It may require input.)"
                except Exception as run_e:
                    program_output = f"Error running program: {str(run_e)}"

            return {
                "status": "success",
                "message": "Compilation successful",
                "program_output": program_output,
                "raw_error": "",
                "classification": {
                    "error_type": "No Error",
                    "error_count": 0,
                    "warning_count": 0,
                    "severity_percent": 0,
                    "severity_label": "No Error",
                    "severity_level": 0,
                    "compile_time_ms": compile_time_ms
                }
            }

        # ❌ Compilation failed
        gcc_output = result.stderr or result.stdout
        classification = classify_error(gcc_output)
        sev = calculate_severity_engine(
            classification["error_count"],
            classification["warning_count"],
            classification["error_type"]
        )
        classification.update(sev)
        classification["compile_time_ms"] = compile_time_ms

        return {
            "status": "failed",
            "message": "",
            "raw_error": gcc_output,
            "classification": classification
        }

    except Exception as e:
        return {
            "status": "failed",
            "message": f"Compiler error: {e}",
            "raw_error": str(e),
            "classification": {
                "error_type": "Unknown Error",
                "error_count": 0,
                "warning_count": 0,
                "severity_percent": 0,
                "severity_label": "Unknown",
                "severity_level": 0,
                "compile_time_ms": 0
            }
        }

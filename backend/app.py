# app.py
import sys
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import subprocess

from compiler import compile_c_program
import chatbot as cb
from emotional_module import speak_emotional
from voice_input import listen_to_user
import hardware_module as hw

app = Flask(__name__)
CORS(app)  # allow frontend running on another port

UPLOAD_DIR = "temp_submissions"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Helper: write code to a unique file
def save_code_to_file(code_text, extension="c"):
    fname = f"{uuid.uuid4().hex}.{extension}"
    path = os.path.join(UPLOAD_DIR, fname)
    with open(path, "w", encoding="utf-8", errors="replace") as f:
        f.write(code_text)
    return path


# POST /compile
@app.route("/compile", methods=["POST"])
def compile_route():
    data = request.get_json(force=True)
    code = data.get("code", "")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    code_file = save_code_to_file(code)
    exe_file = os.path.join(UPLOAD_DIR, f"{uuid.uuid4().hex}.exe")
    
    # Check if program needs input before compiling
    from compiler import program_needs_input
    needs_input = program_needs_input(code)
    
    result = compile_c_program(code_file, output_file=exe_file, skip_execution=needs_input)

    try:
        if result["status"] == "success":
            speak_emotional("No Error", "Your code compiled successfully!", "female")
        else:
            speak_emotional(result["classification"]["error_type"],
                            f"Found {result['classification']['error_count']} errors and {result['classification']['warning_count']} warnings.",
                            "female")
    except Exception as e:
        app.logger.debug("TTS error: %s", e)

    try:
        hw.update_hardware_from_classification(result.get("classification", {}))
    except Exception as e:
        app.logger.debug("Hardware update error: %s", e)

    response = {
        "status": result["status"],
        "raw_error": result.get("raw_error", ""),
        "classification": result.get("classification", {})
    }
    # Include program_output if compilation was successful
    if result.get("status") == "success" and "program_output" in result:
        response["program_output"] = result.get("program_output", "")
    return jsonify(response)


# POST /explain_error
@app.route("/explain_error", methods=["POST"])
def explain_error_route():
    data = request.get_json(force=True)
    errors = data.get("errors") or data.get("raw_error") or ""
    classification = data.get("classification") or {}
    if not errors:
        return jsonify({"error": "No errors provided"}), 400

    explanation = cb.explain_error(errors, classification)
    return jsonify({"explanation": explanation})

@app.route("/autofix", methods=["POST"])
def autofix_route():
    data = request.get_json(force=True)
    code = data.get("code", "")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    tmp_file = save_code_to_file(code)
    compile_result = compile_c_program(tmp_file)

    if compile_result["status"] == "success":
        return jsonify({"fixed_code": code, "diff": "", "note": "No errors found"})

    # 1) Ask for FULL corrected code (preferred)
    full_fixed = ""
    try:
        import google.generativeai as genai
        # Use the same model from chatbot module
        model_name = cb.get_available_model()
        if model_name == "default":
            model = genai.GenerativeModel()  # Use default model
        else:
            model = genai.GenerativeModel(model_name)
        prompt = f"""
Return ONLY the full corrected C program, ready to compile. No explanations, no comments, no markdown.

Original C code:
{code}

Compiler errors:
{compile_result["raw_error"]}

Rules:
- Output must be valid C.
- Do not include backticks or markdown.
"""
        resp = model.generate_content(prompt)
        full_fixed = (getattr(resp, "text", "") or "").strip()

        # strip ``` fences if present
        if full_fixed.startswith("```"):
            lines = full_fixed.split("\n")
            if lines and lines[0].startswith("```"): lines = lines[1:]
            if lines and lines[-1].strip() == "```": lines = lines[:-1]
            full_fixed = "\n".join(lines).strip()
    except Exception:
        full_fixed = ""

    if full_fixed:
        return jsonify({"fixed_code": full_fixed, "diff": "", "note": "Full corrected code provided"})

    # 2) Fallback: AUTO-FIX block patching
    explanation = cb.explain_error(compile_result["raw_error"], compile_result["classification"])
    autofix_block = cb.extract_autofix_block(explanation).strip()
    if autofix_block:
        patched = cb.apply_autofix_patch(code, autofix_block).strip()
        if patched:
            return jsonify({"fixed_code": patched, "diff": autofix_block})

    return jsonify({"error": "Autofix content not available", "explanation": explanation}), 400


# POST /run
@app.route("/run", methods=["POST"])
def run_route():
    data = request.get_json(force=True)
    code = data.get("code")
    stdin_input = data.get("stdin", "")  # Get stdin input from request

    exe_name = f"{uuid.uuid4().hex}.exe" if os.name == "nt" else f"{uuid.uuid4().hex}.out"
    exe_path = os.path.join(UPLOAD_DIR, exe_name)

    if code:
        code_file = save_code_to_file(code)
        # Don't skip execution here - we want to compile and run with user input
        cmp_result = compile_c_program(code_file, output_file=exe_path, skip_execution=False)
        if cmp_result.get("status") != "success":
            return jsonify({"status": "failed", "stderr": cmp_result.get("raw_error", "")}), 400
    else:
        if not os.path.exists(exe_path):
            return jsonify({"status": "failed", "error": "No executable found"}), 400

    try:
        # Ensure .exe extension on Windows
        if os.name == 'nt' and not exe_path.endswith('.exe'):
            exe_path = exe_path + '.exe'
        
        # Run program with user-provided stdin input (not empty/garbage)
        proc = subprocess.run(
            [exe_path],
            input=stdin_input,  # Pass user-provided input to the program
            capture_output=True,
            text=True,
            timeout=10,
            encoding="utf-8",
            errors="replace",
            cwd=os.path.dirname(exe_path) or os.getcwd()  # Run from the directory containing the exe
        )
        output = proc.stdout.strip() if proc.stdout else ''
        if proc.stderr:
            stderr_msg = proc.stderr.strip()
            if stderr_msg:
                output += f"\n{stderr_msg}" if output else stderr_msg
        return jsonify({"status": "success", "stdout": output, "stderr": proc.stderr or ""})
    except subprocess.TimeoutExpired:
        return jsonify({"status": "failed", "error": "Program execution timed out"}), 500
    except Exception as e:
        return jsonify({"status": "failed", "error": str(e)}), 500


# POST /chat
@app.route("/chat", methods=["POST"])
def chat_route():
    try:
        data = request.get_json(force=True)
        message = data.get("message", "")
        mode = data.get("mode", "student")  # Default to student mode if not provided
        
        app.logger.info(f"Chat request received - Mode: {mode}, Message length: {len(message)}")
        
        if not message:
            return jsonify({"error": "No message provided"}), 400

        reply = cb.answer_question(message, mode=mode)
        
        if not reply:
            return jsonify({"error": "Empty response from chatbot"}), 500
        
        try:
            if data.get("tts", True):  # Only speak if TTS is enabled (default True)
                speak_emotional("chat", reply, data.get("voice", "female"))
        except Exception as e:
            app.logger.debug(f"TTS error: {e}")

        app.logger.info(f"Chat response sent - Length: {len(reply)}")
        return jsonify({"reply": reply})
    except Exception as e:
        error_msg = str(e)
        app.logger.error(f"Chat route error: {e}", exc_info=True)
        
        # Handle quota errors specifically
        if "quota" in error_msg.lower() or "429" in error_msg:
            # Reset model cache to try different model next time
            cb.reset_model_cache()
            return jsonify({
                "error": "API quota exceeded. Please wait a moment and try again. The system will automatically try a different model."
            }), 429
        
        # Handle API key errors
        if "api" in error_msg.lower() and "key" in error_msg.lower():
            return jsonify({
                "error": "API key error. Please check your GEMINI_API_KEY in the .env file."
            }), 401
        
        return jsonify({"error": f"Internal server error: {error_msg}"}), 500


# POST /voice_input
@app.route("/voice_input", methods=["POST"])
def voice_input_route():
    text = listen_to_user()
    return jsonify({"text": text})


# POST /hardware/update
@app.route("/hardware/update", methods=["POST"])
def hardware_update_route():
    data = request.get_json(force=True)
    classification = data.get("classification", {})
    try:
        resp = hw.update_hardware_from_classification(classification)
        return jsonify({"ok": True, "sent": resp})
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500


# GET /hardware/status
@app.route("/hardware/status", methods=["GET"])
def hw_status_route():
    return jsonify(hw.get_hardware_status())


@app.route("/")
def home():
    return jsonify({"message": "CodeMate backend is running!"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

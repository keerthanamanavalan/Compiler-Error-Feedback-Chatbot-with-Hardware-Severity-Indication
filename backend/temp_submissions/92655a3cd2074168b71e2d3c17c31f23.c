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

    explanation = cb.explain_error(compile_result["raw_error"], compile_result["classification"])
    autofix_block = cb.extract_autofix_block(explanation).strip()

    # 1) Try patching
    fixed_code = code
    if autofix_block:
        fixed_code = cb.apply_autofix_patch(code, autofix_block).strip()

    def looks_annotated(s: str) -> bool:
        t = s.lower()
        return ("❌" in s) or ("//" in s and "missing" in t) or ("before variables" in t)

    # If unchanged or annotated, ask model for FULL corrected code
    if not fixed_code or fixed_code.strip() == code.strip() or looks_annotated(fixed_code):
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("models/gemini-2.5-flash")
            prompt = f"""
You are a C expert. Return ONLY the FULL corrected C program (no comments or markdown),
ready to compile.

Original:
{code}

Compiler errors:
{compile_result["raw_error"]}
"""
            resp = model.generate_content(prompt)
            full_fixed = (resp.text or "").strip()
            if full_fixed.startswith("```"):
                lines = full_fixed.split("\n")
                if lines and lines[0].startswith("```"): lines = lines[1:]
                if lines and lines[-1].strip() == "```": lines = lines[:-1]
                full_fixed = "\n".join(lines).strip()
            return jsonify({"fixed_code": full_fixed or code, "diff": autofix_block})
        except Exception:
            return jsonify({"error": "Autofix content not available", "explanation": explanation}), 400

    return jsonify({"fixed_code": fixed_code, "diff": autofix_block})@app.route("/autofix", methods=["POST"])
def autofix_route():
    data = request.get_json(force=True)
    code = data.get("code", "")
    if not code:
        return jsonify({"error": "No code provided"}), 400

    tmp_file = save_code_to_file(code)
    compile_result = compile_c_program(tmp_file)

    if compile_result["status"] == "success":
        return jsonify({"fixed_code": code, "diff": "", "note": "No errors found"})

    explanation = cb.explain_error(compile_result["raw_error"], compile_result["classification"])
    autofix_block = cb.extract_autofix_block(explanation).strip()

    # 1) Try patching
    fixed_code = code
    if autofix_block:
        fixed_code = cb.apply_autofix_patch(code, autofix_block).strip()

    def looks_annotated(s: str) -> bool:
        t = s.lower()
        return ("❌" in s) or ("//" in s and "missing" in t) or ("before variables" in t)

    # If unchanged or annotated, ask model for FULL corrected code
    if not fixed_code or fixed_code.strip() == code.strip() or looks_annotated(fixed_code):
        try:
            import google.generativeai as genai
            model = genai.GenerativeModel("models/gemini-2.5-flash")
            prompt = f"""
You are a C expert. Return ONLY the FULL corrected C program (no comments or markdown),
ready to compile.

Original:
{code}

Compiler errors:
{compile_result["raw_error"]}
"""
            resp = model.generate_content(prompt)
            full_fixed = (resp.text or "").strip()
            if full_fixed.startswith("```"):
                lines = full_fixed.split("\n")
                if lines and lines[0].startswith("```"): lines = lines[1:]
                if lines and lines[-1].strip() == "```": lines = lines[:-1]
                full_fixed = "\n".join(lines).strip()
            return jsonify({"fixed_code": full_fixed or code, "diff": autofix_block})
        except Exception:
            return jsonify({"error": "Autofix content not available", "explanation": explanation}), 400

    return jsonify({"fixed_code": fixed_code, "diff": autofix_block})
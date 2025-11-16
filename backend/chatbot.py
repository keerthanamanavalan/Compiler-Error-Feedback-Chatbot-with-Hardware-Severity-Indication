import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

# Validate API key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in environment variables. Please check your .env file.")

genai.configure(api_key=api_key)
print(f"✅ Gemini API configured successfully")

# Cache for available model name
_available_model = None

def reset_model_cache():
    """Reset the cached model - useful if quota errors occur"""
    global _available_model
    _available_model = None

def get_available_model():
    """Get an available Gemini model by listing models from the API"""
    global _available_model
    if _available_model:
        return _available_model
    
    print("🔍 Listing available models from API...")
    try:
        # List all available models
        models = genai.list_models()
        available_models = []
        
        for model in models:
            # Check if model supports generateContent
            if 'generateContent' in model.supported_generation_methods:
                model_name = model.name
                # Skip experimental models
                if 'exp' in model_name.lower() or 'experimental' in model_name.lower():
                    continue
                # Prefer flash models (faster, free tier friendly)
                if 'flash' in model_name.lower():
                    available_models.insert(0, model_name)  # Add flash models to front
                else:
                    available_models.append(model_name)
        
        if available_models:
            # Use the first available model (prefer flash)
            _available_model = available_models[0]
            print(f"✅ Found {len(available_models)} available model(s)")
            print(f"✅ Using model: {_available_model}")
            return _available_model
        else:
            print("⚠️  No models found that support generateContent")
    except Exception as e:
        print(f"⚠️  Error listing models: {e}")
    
    # Fallback: try common model names
    print("🔄 Trying fallback model names...")
    fallback_models = [
        "gemini-1.5-flash",      # Most common free tier model
        "gemini-pro",            # Classic model
        "gemini-1.0-pro",        # Alternative
    ]
    
    for model_name in fallback_models:
        try:
            # Try with models/ prefix
            test_model = genai.GenerativeModel(f"models/{model_name}")
            _available_model = f"models/{model_name}"
            print(f"✅ Using fallback model: {_available_model}")
            return _available_model
        except Exception as e1:
            try:
                # Try without prefix
                test_model = genai.GenerativeModel(model_name)
                _available_model = model_name
                print(f"✅ Using fallback model: {_available_model}")
                return model_name
            except Exception as e2:
                print(f"⚠️  Tried {model_name}, errors: {str(e1)[:80]}, {str(e2)[:80]}")
                continue
    
    # Last resort: use default
    try:
        print("🔄 Trying default model...")
        test_model = genai.GenerativeModel()
        _available_model = "default"
        print(f"✅ Using default model")
        return "default"
    except Exception as e:
        raise Exception(f"Could not find any available Gemini model. Please check your API key. Error: {e}")


# chatbot.py (replace only the answer_question function with this)

def answer_question(user_question, mode="student"):
    """
    Answer general programming questions.
    mode: "student" (clear, educational) or "pro" (concise, technical)
    """
    # Get the specified model
    model_name = get_available_model()
    try:
        if model_name == "default":
            model = genai.GenerativeModel()  # Use default model
        else:
            model = genai.GenerativeModel(model_name)
        print(f"✅ Model initialized: {model_name}")
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error creating model with {model_name}: {e}")
        # Reset cache and try again
        reset_model_cache()
        raise Exception(f"Could not initialize Gemini model '{model_name}'. Please check your API key and model availability. Error: {error_msg}")

    # Student/learner prompt (clear, educational, medium-sized)
    student_prompt = f"""
You are CodeMate, a friendly and patient C programming tutor for students.

The user asked: "{user_question}"

TASKS (Student mode):
1. Give a clear, understandable explanation suitable for a student learning C programming.
2. Start with a simple definition or overview (1-2 sentences).
3. Explain step-by-step what's happening in simple terms.
4. Include a small, practical code example (3-8 lines) that demonstrates the concept.
5. Mention one common mistake students make and how to avoid it.
6. Keep the tone encouraging and educational.
7. IMPORTANT: Keep your response between 150-200 words. Be concise but thorough.
8. Use simple language - avoid jargon unless you explain it.
9. Structure your answer with clear paragraphs for readability.
"""

    # Pro prompt (concise, technical, medium-sized)
    pro_prompt = f"""
You are CodeMate, an expert C programmer and systems engineer.

The user asked: "{user_question}"

TASKS (Pro mode):
1. Provide a concise, technical explanation (2-3 sentences covering the core concept).
2. Show the exact minimal code or fix if relevant (inline code block, 2-5 lines max).
3. Mention the root cause, any performance implications, and platform-specific considerations if applicable.
4. If relevant, provide 1-2 quick diagnostic tips or best practices.
5. Use technical terminology appropriate for experienced developers.
6. IMPORTANT: Keep your response between 100-150 words. Be precise and to the point.
7. Focus on actionable information - what they need to know to solve the problem.
8. Avoid unnecessary background - assume they understand C fundamentals.
"""

    prompt = student_prompt if mode == "student" else pro_prompt

    # Add generation config to help control response length
    # Token limits: ~1.3 tokens per word, so 200 tokens ≈ 150 words, 250 tokens ≈ 190 words
    try:
        generation_config = {
            "max_output_tokens": 250 if mode == "student" else 180,
            "temperature": 0.7,
        }
        print(f"📤 Sending request to Gemini API (mode: {mode})...")
        response = model.generate_content(prompt, generation_config=generation_config)
        print(f"✅ Received response from Gemini API")
    except Exception as e:
        # Fallback if generation_config causes issues
        print(f"⚠️  Warning: generation_config failed, using default: {e}")
        try:
            response = model.generate_content(prompt)
            print(f"✅ Received response from Gemini API (without config)")
        except Exception as e2:
            print(f"❌ Error generating content: {e2}")
            raise Exception(f"Failed to generate response from Gemini API: {str(e2)}")

    # Extract Gemini response safely
    try:
        text = response.text.strip()
        print(f"✅ Successfully extracted response ({len(text)} characters)")
        return text
    except AttributeError:
        try:
            text = response.candidates[0].content.parts[0].text.strip()
            print(f"✅ Successfully extracted response from candidates ({len(text)} characters)")
            return text
        except (AttributeError, IndexError, KeyError) as e:
            print(f"❌ Error extracting response: {e}")
            print(f"Response object: {response}")
            return f"Error generating response. Please try again. (Mode: {mode})"


def explain_error(error_message, classification):
    """
    Explain compiler errors and provide fixes.
    This is ONLY for compiler output, NOT for chat questions.
    """
    # Get the specified model
    model_name = get_available_model()
    try:
        model = genai.GenerativeModel(model_name)
    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error creating model with {model_name}: {e}")
        raise Exception(f"Could not initialize Gemini model '{model_name}'. Please check your API key and model availability. Error: {error_msg}")

    prompt = f"""
You are CodeMate, an expert C programming tutor.

Compiler Output:
{error_message}

Error Type: {classification['error_type']}
Errors: {classification['error_count']}
Warnings: {classification['warning_count']}

TASKS:
1. Give a SIMPLE explanation in 2–3 lines.
2. List the FIX in bullet points.
3. Provide an AUTO-FIX CODE block containing ONLY corrected lines.

FORMAT STRICT:
EXPLANATION:
FIX:
AUTO-FIX CODE:
"""

    response = model.generate_content(prompt)

    # ✅ Safely extract Gemini response
    try:
        text = response.text.strip()
    except:
        text = response.candidates[0].content.parts[0].text.strip()

    return text


def extract_autofix_block(explanation_text):
    """Extract only the AUTO-FIX part"""
    if "AUTO-FIX CODE:" not in explanation_text:
        return ""

    return explanation_text.split("AUTO-FIX CODE:")[1].strip()


def apply_autofix_patch(original_code, autofix_block):
    """
    Rewrites the entire C file using the AUTO-FIX block Gemini provides.
    AUTO-FIX block contains ONLY corrected lines, so we replace them inside the code.
    """

    fixed_code_lines = original_code.split("\n")
    patch_lines = [line.strip("- ").strip() for line in autofix_block.split("\n") if line.strip()]

    # Replace matching lines in original file
    for p in patch_lines:
        for i in range(len(fixed_code_lines)):
            if p.split("(")[0] in fixed_code_lines[i]:  # loose pattern match
                fixed_code_lines[i] = p

    return "\n".join(fixed_code_lines)
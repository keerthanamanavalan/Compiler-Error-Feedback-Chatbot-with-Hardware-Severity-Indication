# main.py

from compiler import compile_c_program
from chatbot import (
    explain_error,
    extract_autofix_block,
    apply_autofix_patch,
    answer_question
)
from emotional_module import speak_emotional
from voice_input import listen_to_user
from voice_input import listen_to_user, listen_wake_word

import colorama
from colorama import Fore, Style
import re

# ✅ Initialize Colors
colorama.init(autoreset=True)

CYAN = Fore.CYAN
GREEN = Fore.GREEN
RED = Fore.RED
YELLOW = Fore.YELLOW
RESET = Style.RESET_ALL


# ✅ Cleans text for voice (NO markdown, NO asterisks, NO headings)
def clean_for_voice(text):
    text = re.sub(r"\+", "", text)          # remove **bold* stars
    text = re.sub(r"`+", "", text)          # remove code backticks
    text = re.sub(r"#+ ", "", text)         # remove ### headings
    text = re.sub(r"\n\s*\n", "\n", text)   # remove blank lines
    text = re.sub(r"(\d+)\.", r"\1:", text) # "1." → "1:"
    text = text.replace("-", "•")           # bullets
    return text.strip()


# ✅ Trim for TTS (plus cleaned)
def trim_for_tts(text):
    if "EXPLANATION:" in text:
        part = text.split("EXPLANATION:")[1]
        if "FIX:" in part:
            part = part.split("FIX:")[0]
        return clean_for_voice(part.strip())

    # Default short summary
    sentences = text.split(". ")
    short = ". ".join(sentences[:2]) + "."

    cleaned = ""
    inside_code_block = False

    for line in short.split("\n"):
        if line.strip().startswith("```"):
            inside_code_block = not inside_code_block
            continue
        if not inside_code_block:
            cleaned += line + " "

    return clean_for_voice(cleaned.strip())

# ✅ Apply Autofix
def apply_auto_fix(code_path, explanation):
    autofix_block = extract_autofix_block(explanation)
    if not autofix_block.strip():
        return None

    with open(code_path, "r", encoding="utf-8", errors="replace") as f:
        original_code = f.read()

    fixed_code = apply_autofix_patch(original_code, autofix_block)
    fixed_path = code_path.replace(".c", "_fixed.c")

    with open(fixed_path, "w", encoding="utf-8", errors="replace") as f:
        f.write(fixed_code)

    return fixed_path


# ✅ Chatbot Mode
def start_terminal_chatbot(voice_choice):

    mode = "student"

    print(f"\n{CYAN}🤖 CodeMate Chatbot Activated!{RESET}")
    print("ℹ Press ENTER to speak by voice.")
    print("🎤 Commands: /voice female|male   /mode student|pro")
    print("Type 'exit' to quit.")

    while True:
        user_input = input("\nYou > ").strip()

        # ✅ Pause Feature (fixed)
        if user_input.lower() == "pause":
            while True:
                print("\n⏸ Chat Paused.")
                print("What would you like to do?")
                print("1. Continue Chat")
                print("2. Start New Chat")
                print("3. Ask a Question")
                print("4. Exit")

                choice = input("Enter option: ").strip()

                if choice == "1":
                    print("✅ Resuming chat...\n")
                    break

                elif choice == "2":
                    print("🔄 Starting new chat...")
                    mode = "student"
                    speak_emotional("chat", "Starting a new chat.", voice_choice)
                    break

                elif choice == "3":
                    question = input("❓ What is your question? ")
                    answer = answer_question(question, mode=mode)
                    print(f"\n{CYAN}CodeMate >{RESET}\n{answer}")
                    speak_emotional("chat", trim_for_tts(answer), voice_choice)
                    continue  # Stay inside pause menu

                elif choice == "4":
                    print(f"{CYAN}👋 Exiting chatbot mode...{RESET}")
                    return

                else:
                    print("⚠ Invalid choice. Try again.")
            continue

        # ✅ Change voice
        if user_input.startswith("/voice"):
            parts = user_input.split()
            if len(parts) == 2 and parts[1].lower() in ["female", "male"]:
                voice_choice = parts[1].lower()
                print(f"\n✅ Voice changed to: {voice_choice}")
                speak_emotional("chat", f"Voice changed to {voice_choice}.", voice_choice)
            continue

        # ✅ Change mode
        if user_input.startswith("/mode"):
            parts = user_input.split()
            if len(parts) == 2 and parts[1] in ["student", "pro"]:
                mode = parts[1]
                print(f"\n✅ Mode changed to: {mode.upper()}")
                speak_emotional("chat", f"Switched to {mode} mode.", voice_choice)
            else:
                print("❌ Usage: /mode student  OR  /mode pro")
            continue

        if user_input == "":
            print("\n🎧 Voice Assistant Mode Activated.")
            listen_wake_word()            # wait for “hey codemate”
            user_input = listen_to_user() # then record the real question

        if user_input.lower() == "exit":
            print(f"{CYAN}👋 Exiting chatbot mode...{RESET}")
            return

        # ✅ Chatbot reply
        bot_reply = answer_question(user_input, mode=mode)
        print(f"\n{CYAN}CodeMate >{RESET}\n{bot_reply}")

        speak_emotional("chat", trim_for_tts(bot_reply), voice_choice)

# ✅ Compiler Flow
def start_compiler_flow(c_file, voice_choice):
    result = compile_c_program(c_file)

    status = result["status"]
    classification = result["classification"]
    raw_error = result["raw_error"]

    # ✅ SUCCESS
    if status == "success":
        print(f"\n{GREEN}✅ Compilation Success!{RESET}\n")
        speak_emotional("success", "Your code compiled successfully!", voice_choice)
        
        # ✅ Show program output
        output = result.get("program_output", "")
        if output.strip():
            print(f"{CYAN}🎯 Program Output:{RESET}")
            print(output)
        return

    # ✅ FAILURE
    print(f"\n❌ Compilation Failed!{RESET}")

    print(f"{RED}Errors: {classification['error_count']}{RESET}")
    print(f"{YELLOW}Warnings: {classification['warning_count']}{RESET}")

    error_map = {
        "syntax": "Syntax Error",
        "missing_semicolon": "Missing Semicolon",
        "undeclared_variable": "Undeclared Variable",
        "type_mismatch": "Type Mismatch",
        "runtime": "Runtime Error",
        "logic": "Logical Error",
        "linker": "Linker Error",
        "unused_variable": "Unused Variable Warning",
        "unknown": "General Compilation Error",
    }

    normalized_error = classification["error_type"].lower().replace(" ", "_")
    readable_error = error_map.get(normalized_error, "Compilation Error")

    print(f"{CYAN}🔍 Error Type: {readable_error}{RESET}")

    if "severity_percent" in classification:
        print(f"\n{GREEN}=====================================\n")
        print(f"{YELLOW}🔥 Severity Meter Report{RESET}")
        print(f"severity_label: {classification['severity_label']}")
        print(f"severity_level: {classification['severity_level']} "
              f"(means {classification['severity_label']} impact issue)")
        print(f"severity_percent: {classification['severity_percent']}%")
        print(f"{GREEN}=====================================\n")

    print(f"\n{raw_error}{RESET}")

    explanation = explain_error(
        raw_error,
        {
            "error_type": classification["error_type"],
            "error_count": classification["error_count"],
            "warning_count": classification["warning_count"],
        }
    )

    print(f"\n{CYAN}🤖 CodeMate says:{RESET}")
    print(explanation)

    speak_emotional(classification["error_type"], trim_for_tts(explanation), voice_choice)

    fixed_path = apply_auto_fix(c_file, explanation)
    if fixed_path:
        print(f"\n✅ Auto-fixed full code saved to {fixed_path}")

        with open(fixed_path, "r", encoding="utf-8", errors="replace") as f:
            print("----- FIXED CODE -----")
            print(f.read())
            print("----------------------")

    start_terminal_chatbot(voice_choice)


# ✅ Main Entry
def main():
    print(f"{CYAN}🎤 Select Voice:{RESET}")
    print("1. Female (default)")
    print("2. Male")

    choice = input("Enter option (1/2): ").strip()
    voice_choice = "male" if choice == "2" else "female"

    speak_emotional("chat", "Voice selected. Starting CodeMate.", voice_choice)

    c_file = "sample.c"
    start_compiler_flow(c_file, voice_choice)


if __name__ == "__main__":
    main()
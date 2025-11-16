import speech_recognition as sr

def listen_to_user():
    recognizer = sr.Recognizer()

    try:
        with sr.Microphone() as source:
            print("\n🎤 Listening... Speak now.")
            recognizer.adjust_for_ambient_noise(source, duration=0.6)

            # listen with timeouts (prevents app from hanging)
            try:
                audio = recognizer.listen(
                    source,
                    timeout=5,            # must start speaking within 5 sec
                    phrase_time_limit=8   # max speak duration
                )
            except sr.WaitTimeoutError:
                print("⏳ No speech detected.")
                return "I didn't hear anything."

    except Exception as mic_err:
        print(f"⚠️ Microphone error: {mic_err}")
        return "Microphone is not available."

    # ----------------------------
    #  SPEECH TO TEXT (Google API)
    # ----------------------------
    try:
        text = recognizer.recognize_google(audio)
        print("✅ You said:", text)
        return text

    except sr.UnknownValueError:
        print("❌ Speech not recognized.")
        return "Sorry, I couldn't understand what you said."

    except sr.RequestError:
        print("❌ Google API unreachable.")
        return "Speech recognition service unavailable."

    except Exception as e:
        print(f"⚠️ STT error: {e}")
        return "Something went wrong while recognizing your voice."
    
# ✅ Wake-word listener
def listen_wake_word():
    recognizer = sr.Recognizer()
    WAKE_WORD = "hey codemate"

    with sr.Microphone() as source:
        print("\n🎧 Listening for wake word: 'hey codemate'...")
        recognizer.adjust_for_ambient_noise(source, duration=0.5)

        while True:
            try:
                audio = recognizer.listen(source)
                text = recognizer.recognize_google(audio).lower()
                print(f"[Wake] Heard: {text}")

                if WAKE_WORD in text:
                    print("✅ Wake word detected!")
                    return  # return control to main
            except:
                continue

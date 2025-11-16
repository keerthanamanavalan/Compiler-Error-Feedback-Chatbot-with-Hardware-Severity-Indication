import pyttsx3
import time
import threading

import re

# Global engine for stopping TTS
_current_engine = None
_engine_lock = threading.Lock()

def clean_voice_text(text):
    text = re.sub(r"```.*?```", "", text, flags=re.S)  # remove code blocks
    text = re.sub(r"[`*#]", "", text)                  # remove markdown
    text = text.replace("-", "•")                      # bullet points
    text = re.sub(r"\s{2,}", " ", text)                # cleanup
    return text.strip()

def summarize(text):
    sentences = re.split(r'[.!?]', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    if len(sentences) <= 2:
        return text
    return ". ".join(sentences[:2]) + "."

def stop_tts():
    """Stop any currently playing TTS"""
    global _current_engine
    with _engine_lock:
        if _current_engine:
            try:
                _current_engine.stop()
                _current_engine = None
                print("[TTS] Stopped")
            except:
                pass

def speak_emotional(error_type, text, voice_choice="female"):
    """
    Speak emotional text with proper voice and emotion.
    Uses a global engine that can be stopped.
    """
    global _current_engine
    
    print(f"\n[TTS] === Starting Speech ===")
    print(f"[TTS] Text: '{text[:60]}...'")
    print(f"[TTS] Error type: '{error_type}'")
    print(f"[TTS] Voice: '{voice_choice}'")
    
    try:
        # Stop any existing TTS
        stop_tts()
        
        # Create fresh engine
        engine = pyttsx3.init(driverName="sapi5")
        with _engine_lock:
            _current_engine = engine
        
        # Get available voices
        voices = engine.getProperty('voices')
        
        # Select voice based on choice
        selected_voice = None
        if voice_choice.lower() == "male":
            for v in voices:
                if "david" in v.name.lower():
                    selected_voice = v.id
                    print(f"[TTS] Selected: {v.name}")
                    break
        else:  # female
            for v in voices:
                if "zira" in v.name.lower():
                    selected_voice = v.id
                    print(f"[TTS] Selected: {v.name}")
                    break
        
        # Fallback to default voice if not found
        if not selected_voice:
            selected_voice = voices[0].id
            print(f"[TTS] Using fallback: {voices[0].name}")
        
        engine.setProperty('voice', selected_voice)
        
        # Map error types to emotions
        emotion_settings = {
            "Syntax Error": {"rate": 150, "volume": 1.0},
            "Undeclared Variable": {"rate": 175, "volume": 1.0},
            "Uninitialized Variable": {"rate": 150, "volume": 1.0},
            "Type Error": {"rate": 160, "volume": 1.0},
            "No Error": {"rate": 185, "volume": 1.0},
            "chat": {"rate": 185, "volume": 1.0},
            "happy": {"rate": 185, "volume": 1.0},
        }
        
        # Get settings or use defaults
        settings = emotion_settings.get(error_type, {"rate": 170, "volume": 1.0})
        
        engine.setProperty('rate', settings["rate"])
        engine.setProperty('volume', settings["volume"])
        
        print(f"[TTS] Rate: {settings['rate']}, Volume: {settings['volume']}")
        
        # Prepare text
        text = summarize(clean_voice_text(text))

        if not text:
            text = "I have nothing to say."
        
        print(f"[TTS] Ready to speak...")
        
        # Speak the text
        engine.say(text)
        engine.runAndWait()
        
        print(f"[TTS] Speech completed successfully!")
        
        # Stop and cleanup
        with _engine_lock:
            if _current_engine == engine:
                _current_engine = None
        engine.stop()
        del engine
        
    except Exception as e:
        print(f"[TTS] ERROR: {e}")
        import traceback
        traceback.print_exc()
        with _engine_lock:
            _current_engine = None

    print(f"[TTS] === End Speech ===\n")
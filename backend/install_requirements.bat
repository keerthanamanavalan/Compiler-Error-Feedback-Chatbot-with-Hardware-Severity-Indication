@echo off
echo ============================================
echo Installing CodeMate Dependencies...
echo ============================================

REM --- Upgrade pip first ---
python -m pip install --upgrade pip

echo.
echo --- Installing required packages ---
pip install openai==1.35.7
pip install google-generativeai==0.7.2
pip install python-dotenv==1.0.1

pip install pyttsx3==2.90
pip install SpeechRecognition==3.10.0
pip install pyaudio==0.2.13

pip install colorama==0.4.6
pip install requests==2.31.0

pip install flask==3.0.3
pip install flask-cors==4.0.0

pip install pyserial==3.5

echo.
echo ✅ Installation completed!
echo ============================================
pause

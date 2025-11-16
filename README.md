# Compiler-Error-Feedback-Chatbot-with-Hardware-Severity-Indication
AI-powered compiler error analysis system with real-time hardware severity indication, combining GCC, Flask, React, Google Gemini AI, and Arduino for interactive debugging assistance

# 🚀 **Compiler Error Feedback Chatbot with Hardware Severity Indication**

This project is an intelligent **AI-powered coding assistant** that compiles C programs, analyzes compiler errors, classifies severity, and sends the severity level to connected hardware (like Arduino).
It also integrates a full **AI chatbot**, voice interaction, NLP, and a modern frontend UI.

This system bridges **software error diagnostics** with **physical hardware alerts**, making it useful for students, debugging labs, IoT-based coding trainers, and smart learning platforms.

---

# ⭐ **Key Features**

### 🧠 **AI Chatbot (Google Gemini API)**

* Understands programming queries
* Explains compiler errors
* Provides debugging suggestions
* Supports conversational Q&A

### 🧪 **C Code Compilation & Diagnostics**

* Compiles C programs using **GCC**
* Extracts compiler warnings & errors
* Classifies errors using NLP + AI
* Generates severity score (0–100%)

### 🔌 **Hardware Severity Indication**

* Sends severity % to Arduino via **PySerial**
* Hardware can light LEDs, buzzers, LCD indicators, etc.
* Real-time physical feedback system

### 🎙️ **Voice Interaction**

* Convert speech → text (SpeechRecognition)
* Convert text → speech (pyttsx3)
* Hands-free coding support

### 🎨 **Modern React Frontend**

* React + TypeScript + Tailwind
* Fast Vite development server
* Interactive UI with Lucide icons

---

# 🏗️ **Tech Stack Summary**

## 🎨 **Frontend**

* **React 19.1.1**
* **TypeScript 5.9.3**
* **Vite 7.1.7**
* **Tailwind CSS 4.1.16**
* **Lucide React**
* **ESLint + TypeScript ESLint**
* **PostCSS + Autoprefixer**

## 🖥️ **Backend**

* **Python 3.x**
* **Flask 3.0.3**
* **Google Gemini API** (chatbot + error explanation)
* **GCC** (C compilation)
* **PySerial** (Arduino hardware communication)

## 🧠 **AI / NLP**

* Google Gemini API
* Hugging Face Transformers
* NLTK

## 🎤 **Voice & Speech**

* pyttsx3
* SpeechRecognition
* PyAudio

---

# 📁 **Project Structure**

```
Compiler Error Feedback Chatbot with Hardware Severity Indication/
│── frontend/
│   ├── src/
│   ├── components/
│   ├── styles/
│   └── package.json
│
│── backend/
│   ├── app.py
│   ├── compiler/
│   ├── ai/
│   ├── hardware/
│   └── requirements.txt
│
│── arduino/
│   └── severity_indicator.ino
│
│── README.md
└── .gitignore
```

---

# 🔧 **Setup & Installation**

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/Compiler-Error-Feedback-Chatbot-with-Hardware-Severity-Indication.git
cd Compiler-Error-Feedback-Chatbot-with-Hardware-Severity-Indication
```

---

# 🖥️ **Frontend Setup**

```bash
cd frontend
npm install
npm run dev
```

---

# 🛠️ **Backend Setup**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

---

# 🔑 **Required Environment Variables**

Create a **.env** file under backend:

```
GEMINI_API_KEY=your_api_key
SERIAL_PORT=COM3
BAUD_RATE=9600
MODEL=gemini-1.5-pro
```

---

# ▶️ **Run the Full Application**

Start backend:

```bash
python app.py
```

Start frontend:

```bash
npm run dev
```

---

# 🐞 **Troubleshooting**

### ❗ *Gemini API: Model not found (404)*

Use supported models for v1beta:

```
gemini-1.5-pro
text-embedding-004
```

### ❗ *Arduino not detected*

Run:

```bash
python -m serial.tools.list_ports
```

### ❗ *Audio input errors*

Install:

```bash
pip install pyaudio
```

---

🙌 **Acknowledgements**

* Google Gemini API
* Flask & Python
* React + Tailwind
* GCC
* Arduino (hardware testing)

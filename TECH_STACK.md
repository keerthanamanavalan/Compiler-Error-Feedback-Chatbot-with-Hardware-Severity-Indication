# CodeMate Project - Tech Stack

## 🎯 Project Overview
CodeMate is an AI-powered C programming assistant that helps students and professionals debug, analyze, and understand C code with real-time error explanations, code fixes, and an interactive chatbot.

---

## 🖥️ Frontend Tech Stack

### Core Framework & Language
- **React** `^19.1.1` - UI library for building user interfaces
- **TypeScript** `~5.9.3` - Type-safe JavaScript
- **React DOM** `^19.1.1` - React rendering for web

### Build Tools & Development
- **Vite** `^7.1.7` - Fast build tool and dev server
- **@vitejs/plugin-react** `^5.0.4` - React plugin for Vite

### Styling
- **Tailwind CSS** `^4.1.16` - Utility-first CSS framework
- **PostCSS** `^8.5.6` - CSS processing tool
- **Autoprefixer** `^10.4.21` - CSS vendor prefixing
- **@tailwindcss/postcss** `^4.1.16` - Tailwind PostCSS plugin

### UI Components & Icons
- **Lucide React** `^0.552.0` - Icon library

### Code Quality & Linting
- **ESLint** `^9.36.0` - JavaScript/TypeScript linter
- **TypeScript ESLint** `^8.45.0` - TypeScript-specific linting rules
- **ESLint Plugin React Hooks** `^5.2.0` - React Hooks linting
- **ESLint Plugin React Refresh** `^0.4.22` - React Fast Refresh support

### Type Definitions
- **@types/react** `^19.1.16` - TypeScript types for React
- **@types/react-dom** `^19.1.9` - TypeScript types for React DOM
- **@types/node** `^24.6.0` - TypeScript types for Node.js

---

## ⚙️ Backend Tech Stack

### Core Framework
- **Python 3.x** - Programming language
- **Flask** `3.0.3` - Lightweight web framework
- **Flask-CORS** `4.0.0` - Cross-Origin Resource Sharing support

### AI & Machine Learning
- **Google Generative AI** `0.7.2` - Gemini API for chatbot and code explanations
- **OpenAI** `1.35.7` - OpenAI API (if used)
- **Transformers** `4.40.2` - Hugging Face transformers library
- **NLTK** `3.8.1` - Natural Language Toolkit

### Speech & Voice
- **pyttsx3** `2.90` - Text-to-speech conversion
- **SpeechRecognition** `3.10.0` - Speech recognition library
- **PyAudio** `0.2.13` - Audio I/O library

### Code Compilation & Execution
- **GCC (GNU Compiler Collection)** - C compiler (system dependency)
- **subprocess** - Python module for running system commands

### Hardware Integration
- **PySerial** `3.5` - Serial communication for Arduino/hardware

### Utilities
- **python-dotenv** `1.0.1` - Environment variable management
- **colorama** `0.4.6` - Colored terminal output
- **requests** `2.31.0` - HTTP library

### Standard Library Modules Used
- `os` - Operating system interface
- `uuid` - UUID generation
- `subprocess` - Process execution
- `re` - Regular expressions
- `time` - Time-related functions
- `sys` - System-specific parameters

---

## 🔧 Development Tools

### Version Control
- **Git** - Version control system

### Package Management
- **npm** / **Node.js** - Frontend package manager
- **pip** - Python package manager
- **venv** - Python virtual environment

### Build & Deployment
- **Vite** - Frontend build tool
- **TypeScript Compiler** - Type checking and compilation

---

## 🌐 APIs & External Services

### AI Services
- **Google Gemini API** - Primary AI service for:
  - Chatbot responses
  - Code error explanations
  - Code autofix suggestions

### Environment Configuration
- **.env** files - Environment variable storage
  - `GEMINI_API_KEY` - Google Gemini API key

---

## 🖥️ System Requirements

### Operating System
- **Windows 10/11** (primary development platform)
- Cross-platform compatible (Linux, macOS)

### Runtime Requirements
- **Node.js** - For frontend development
- **Python 3.x** - For backend
- **GCC Compiler** - For C code compilation
- **Arduino IDE/Serial** - For hardware integration (optional)

---

## 📁 Project Structure

```
CodeMate_Project/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
│
├── backend/               # Python Flask backend
│   ├── app.py            # Main Flask application
│   ├── chatbot.py        # AI chatbot logic
│   ├── compiler.py       # C code compilation
│   ├── emotional_module.py # TTS with emotions
│   ├── voice_input.py    # Speech recognition
│   ├── hardware_module.py # Arduino communication
│   ├── requirements_pinned.txt # Python dependencies
│   └── .env              # Environment variables
│
└── TECH_STACK.md         # This file
```

---

## 🔌 Key Integrations

1. **Frontend ↔ Backend**: RESTful API communication via Flask
2. **Backend ↔ Gemini API**: AI-powered code analysis and chatbot
3. **Backend ↔ GCC**: C code compilation and execution
4. **Backend ↔ Hardware**: Serial communication with Arduino (optional)
5. **Backend ↔ TTS**: Text-to-speech for audio feedback

---

## 🚀 Key Features Enabled by Tech Stack

- **Real-time Code Analysis**: Flask + GCC + Gemini API
- **Interactive Chatbot**: React UI + Flask API + Gemini API
- **Voice Input/Output**: SpeechRecognition + pyttsx3
- **Code Compilation**: subprocess + GCC
- **Hardware Integration**: PySerial + Arduino
- **Modern UI**: React + Tailwind CSS + TypeScript
- **Fast Development**: Vite hot module replacement

---

## 📝 Notes

- The project uses a **monorepo structure** with separate frontend and backend
- **CORS** is enabled for cross-origin requests between frontend and backend
- **Environment variables** are used for sensitive API keys
- The backend runs on **Flask development server** (port 5000)
- The frontend runs on **Vite dev server** (typically port 5173)


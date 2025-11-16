# Chatbot Setup Instructions

## ✅ What I've Fixed:

1. **Model Configuration**: Updated to use `models/gemini-1.5-flash-latest` with fallback options
2. **Error Handling**: Added comprehensive error handling and debugging
3. **API Key Validation**: Added validation to check if API key exists
4. **Logging**: Added detailed logging to help debug issues

## 📋 REQUIRED: Setup Steps

### Step 1: Create `.env` file in the `backend` folder

Create a file named `.env` in the `backend` directory with the following content:

```
GEMINI_API_KEY=your_api_key_here
```

**To get your API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste it in the `.env` file (replace `your_api_key_here`)

### Step 2: Verify the `.env` file location

Make sure the `.env` file is in:
```
C:\Project\CodeMate_Project\backend\.env
```

### Step 3: Restart the backend server

1. Stop the current server (Ctrl+C)
2. Start it again:
   ```bash
   cd backend
   python app.py
   ```

### Step 4: Check the terminal output

When you start the server, you should see:
```
✅ Gemini API configured successfully
✅ Using model: models/gemini-1.5-flash-latest
```

If you see errors, check:
- Is the `.env` file in the correct location?
- Is the API key correct?
- Does the API key have access to Gemini models?

## 🔍 Troubleshooting

### Error: "GEMINI_API_KEY not found"
- **Solution**: Create the `.env` file in the `backend` folder with your API key

### Error: "404 model not found"
- **Solution**: The code will automatically try different model formats. Check the terminal for which model is being used.

### Error: "Quota exceeded"
- **Solution**: Wait a few minutes and try again. The free tier has rate limits.

### Error: "API key error"
- **Solution**: Verify your API key is correct and has access to Gemini API

## 📝 Testing

After setup, try sending a message in the chatbot. You should see in the terminal:
```
📤 Sending request to Gemini API (mode: student)...
✅ Received response from Gemini API
✅ Successfully extracted response (XXX characters)
```

If you see these messages, the chatbot is working correctly!



import React, { useState, useEffect, useRef } from 'react';

// --- Dark Theme Global Styles (unchanged) ---
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&family=Space+Mono:wght@400;700&display=swap');

  html, body, #root, .App {
    height: 100%;
    width: 100%;
    margin: 0;
    padding: 0;
  }

  body {
    background-color: #000000;
    color: #ffffff;
    font-family: 'Roboto', sans-serif;
    overflow-y: auto; 
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

// --- Main Dashboard Component ---
const CodeAnalysisDashboard = () => {
  const [codeText, setCodeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorType, setErrorType] = useState('No Error');
  const [errorCount, setErrorCount] = useState(0);
  const [warningCount, setWarningCount] = useState(0);
  const [severityPercentage, setSeverityPercentage] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [rawError, setRawError] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [showSeverityMeter, setShowSeverityMeter] = useState(false);
  const [showCorrectedCode, setShowCorrectedCode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [voice, setVoice] = useState('female');
  const correctedCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const [compilationSuccess, setCompilationSuccess] = useState(false);
  const [programOutput, setProgramOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const outputRef = useRef(null); 
  
  // NEW STATE FOR INPUT
  const [programInput, setProgramInput] = useState(''); 
  const [showInputArea, setShowInputArea] = useState(false); // New state to control input visibility

  // Check backend connection
  useEffect(() => {
    fetch("http://localhost:5000")
      .then((res) => res.json())
      .then((data) => console.log("Backend Response:", data))
      .catch((err) => console.error("Error connecting to backend:", err));
  }, []);

  // Handle paste
  useEffect(() => {
    const handlePaste = (e) => {
      const pasteTarget = document.activeElement;
      if (pasteTarget && pasteTarget.tagName === 'TEXTAREA') {
        return; 
      }
      const pastedText = e.clipboardData.getData('text');
      if (pastedText && pastedText.trim()) {
        setCodeText(pastedText);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Helper function to detect if program needs user input
  const programNeedsInput = (code) => {
    if (!code) return false;
    const inputPatterns = [
      /scanf\s*\(/i,
      /gets\s*\(/i,
      /fgets\s*\(/i,
      /getchar\s*\(/i,
      /getc\s*\(/i,
      /fgetc\s*\(/i,
      /read\s*\(/i,
    ];
    return inputPatterns.some(pattern => pattern.test(code));
  };

  // Analyze code (unchanged logic, only added setIsAnalyzing)
  const handleAnalyze = async () => {
    if (!codeText.trim()) {
      alert('Please paste or upload your C code first.');
      return;
    }
    if (isAnalyzing) return;

    setIsAnalyzing(true);

    // Clear previous analysis/run states
    setExplanation('');
    setRawError('');
    setFixedCode('');
    setProgramOutput('');
    setShowSeverityMeter(false);
    setShowCorrectedCode(false);
    setShowOutput(false);
    setCompilationSuccess(false);
    // Hide input area on new analysis (will be shown if input is needed)
    setShowInputArea(false);
    
    // Check if program needs input
    const needsInput = programNeedsInput(codeText); 

    try {
      const compileRes = await fetch('http://localhost:5000/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeText })
      });
      const compileJson = await compileRes.json();
      setRawError(compileJson.raw_error || ''); 

      if (compileRes.ok) {
        const cls = compileJson.classification || {};
        const isSuccess = compileJson.status === "success";
        setCompilationSuccess(isSuccess);

        setErrorType(cls.error_type || 'Unknown');
        setErrorCount(cls.error_count || 0);
        setWarningCount(cls.warning_count || 0);
        setSeverityPercentage(cls.severity_percent || 0);

        // If compilation is successful (0 errors)
        if (isSuccess) {
          // Check if program needs input (either detected in code or from backend response)
          const programOutput = compileJson.program_output || '';
          const needsInputFromBackend = programOutput.includes('(Program requires input') || 
                                       programOutput.includes('requires input');
          const requiresInput = needsInput || needsInputFromBackend;
          
          if (requiresInput) {
            // Program needs input - don't run automatically, show input area
            setExplanation('✅ Compilation successful! Your code compiled without errors. This program requires user input. Please provide input below and click "Run Program".');
            setProgramOutput('');
            setShowOutput(false);
            setShowInputArea(true); // Show input area immediately
            // Scroll to input area after a brief delay
            setTimeout(() => {
              document.querySelector('.input-area-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
          } else {
            // Program doesn't need input - show output if available
            setExplanation('✅ Compilation successful! Your code compiled without errors. The program output is displayed below.');
            
            if (compileJson.program_output !== undefined && compileJson.program_output !== null) {
              const output = String(compileJson.program_output).trim();
              if (output) {
                setProgramOutput(output);
              } else {
                setProgramOutput('(Program executed successfully with no output)');
              }
            } else {
              setProgramOutput('(Program executed successfully with no output)');
            }
            setShowOutput(true);
            setShowInputArea(false);
            // Scroll to output section after a brief delay
            setTimeout(() => {
              outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);
          }

          // Update hardware (non-blocking, don't wait)
          fetch('http://localhost:5000/hardware/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classification: cls })
          }).catch(() => {});
        } else {
          // Compilation failed - show error explanation
          if (cls.error_count > 0 || cls.warning_count > 0) {
            setShowSeverityMeter(true);
          }

          // 1. Update hardware (non-blocking)
          fetch('http://localhost:5000/hardware/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ classification: cls })
          }).catch(() => {});

          // 2. Get explanation for errors
          try {
            const expRes = await fetch('http://localhost:5000/explain_error', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ raw_error: compileJson.raw_error || '', classification: cls })
            });
            const expJson = await expRes.json();
            if (expRes.ok) {
              setExplanation(expJson.explanation || 'No explanation available.');
            } else {
              setExplanation(expJson.error || 'Failed to get explanation.');
            }
          } catch (err) {
            setExplanation('Error connecting to explanation service.');
          }

          // 3. Get autofix (non-blocking, don't wait for it)
          fetch('http://localhost:5000/autofix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: codeText })
          })
          .then(res => res.json())
          .then(fixJson => {
            if (fixJson.fixed_code) {
              setFixedCode(fixJson.fixed_code || '');
            }
          })
          .catch(() => {});
        }

      } else {
        setExplanation(compileJson.error || 'Compilation failed. Please check your code.');
        setCompilationSuccess(false);
      }
    } catch (e) {
      console.error('Error during analysis:', e);
      setExplanation('Error connecting to backend. Please make sure the backend server is running on http://localhost:5000');
      setCompilationSuccess(false);
      setProgramOutput('');
      setShowOutput(false);
    } finally {
      // Always clear analyzing state, even if there were errors
      setIsAnalyzing(false);
    }
  };

  // Show corrected code and scroll to it (unchanged)
  const handleShowCorrectedCode = () => {
    if (!fixedCode) {
      alert('No corrected code available. Please analyze your code first.');
      return;
    }
    setShowCorrectedCode(true);
    requestAnimationFrame(() => {
      correctedCodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }; 
  
  // Handle View Output button click - scrolls to output or shows input area for re-running
  const handleViewOutput = () => {
    if (showInputArea) {
      // If input area is shown, run the program with input
      handleRunProgram();
    } else if (showOutput) {
      // If output is already shown, scroll to it
      outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Output not shown yet - show input area so user can provide input and run
      setShowInputArea(true);
      requestAnimationFrame(() => {
        document.querySelector('.input-area-container')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  };

  // Run program and show output (MODIFIED to use programInput)
  const handleRunProgram = async () => {
    if (!codeText.trim()) {
      alert('No code to run.');
      return;
    }
    
    // Set immediate feedback for the user
    setProgramOutput('Running program...');
    setShowOutput(true);
    
    // Scroll to the output section immediately
    requestAnimationFrame(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    try {
      const runRes = await fetch('http://localhost:5000/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // IMPORTANT: Sending the programInput as stdin to the backend
        body: JSON.stringify({ code: codeText, stdin: programInput }) 
      });
      const runJson = await runRes.json();
      
      if (runRes.ok && runJson.status === "success") {
        setProgramOutput(runJson.stdout || '(No output)');
      } else {
        setProgramOutput(`Execution failed:\n${runJson.error || runJson.stderr || 'Unknown error'}`);
      }
    } catch (e) {
      console.error(e);
      setProgramOutput('Error running program. Check backend connection.');
    }
    // Optionally clear input after running
    setProgramInput('');
    setShowInputArea(false);
  };

  // Severity Gauge Component (Unchanged)
  const SeverityGauge = ({ percentage, errorCount, warningCount, errorType, onClose, voice }) => {
    const angle = (Number(percentage) * 180) / 100;
    const needleRotation = angle - 90;

    const severityColor =
    percentage <= 30 ? '#28a745' :    
    percentage <= 60 ? '#ffc107' :    
    percentage <= 85 ? '#fd7e14' :    
    '#dc3545';           

    useEffect(() => {
      const ttsText = `Error severity meter shows ${percentage} percent. ${errorCount} errors and ${warningCount} warnings found. Error type: ${errorType}.`;
      fetch('http://localhost:5000/tts/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ttsText, voice: voice })
      }).catch(() => {});
    }, []);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        animation: 'fadeIn 0.3s ease-out'
      }}>
        <div style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '20px',
          padding: '40px',
          border: '2px solid #dc3545',
          boxShadow: '0 0 30px rgba(220, 53, 69, 0.5)',
          position: 'relative',
          minWidth: '400px',
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '24px',
              cursor: 'pointer',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
          <h2 style={{ marginTop: '0', color: '#ffffff', marginBottom: '30px' }}>Error Severity Meter</h2>
          <div style={{
            position: 'relative',
            width: '300px',
            height: '150px',
            margin: '0 auto 30px',
            overflow: 'hidden',
            borderRadius: '150px 150px 0 0',
            backgroundColor: '#0a0a0a',
            border: '2px solid #333'
          }}>
            {/* Static background bands */}
            <div style={{
              position: 'absolute',
              bottom: '0', left: '0',
              width: '300px', height: '150px',
              borderRadius: '150px 150px 0 0',
              background: `conic-gradient(
                transparent 0deg 180deg,
                #28a745 0deg 60deg,
                #ffc107 60deg 120deg,
                #dc3545 120deg 180deg
              )`,
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
              transform: 'rotate(180deg)',
              transformOrigin: '50% 100%',
              opacity: 0.25
            }} />

            {/* Colored progress arc up to current angle */}
            <div style={{
              position: 'absolute',
              bottom: '0', left: '0',
              width: '300px', height: '150px',
              borderRadius: '150px 150px 0 0',
              background: `conic-gradient(
                transparent 0deg ${180 - angle}deg,
                ${severityColor} ${180 - angle}deg 180deg
              )`,
              clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)',
              transform: 'rotate(180deg)',
              transformOrigin: '50% 100%',
              filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.25))'
            }} />

            {/* Needle in severity color */}
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              left: '50%',
              width: '4px',
              height: '130px',
              backgroundColor: severityColor,
              transformOrigin: 'bottom center',
              borderRadius: '2px',
              zIndex: 2,
              transition: 'transform 0.5s ease-out',
              transform: `translateX(-50%) rotate(${needleRotation}deg)`,
              boxShadow: `0 0 12px ${severityColor}55`
            }} />

            {/* Needle hub */}
            <div style={{
              position: 'absolute',
              bottom: '0',
              left: '50%',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '3px solid #1a1a1a',
              transform: 'translateX(-50%) translateY(50%)',
              zIndex: 3,
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)'
            }} />
          </div>
          <div style={{ fontSize: '3rem', fontWeight: '700', color: '#dc3545', marginBottom: '10px' }}>
            {percentage}%
          </div>
          <div style={{ color: '#cccccc', fontSize: '1.1rem' }}>
            {percentage === 0 ? 'No Error' : percentage <= 30 ? 'Low' : percentage <= 60 ? 'Medium' : percentage <= 85 ? 'High' : 'Critical'}
          </div>
          <div style={{ marginTop: '20px', color: '#999', fontSize: '0.9rem' }}>
            Errors: {errorCount} | Warnings: {warningCount}
          </div>
        </div>
      </div>
    );
  };

  // Chatbot Component (Unchanged)
  const Chatbot = ({ isChatOpen, toggleChat, voice }) => {
    const [mode, setMode] = useState(null);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [isSending, setIsSending] = useState(false);
    const abortRef = React.useRef(null);

    useEffect(() => {
      if (mode && messages.length === 0) {
        setMessages([{ role: 'bot', text: "Hi there! I'm here to assist you with your C programming questions." }]);
      }
    }, [mode]); 

    const selectMode = (selectedMode) => {
      setMode(selectedMode);
      setMessages([]);
    };

    const sendMessageWithText = async (text) => {
      const msg = text.trim();
      if (!msg || !mode || isSending) return;
    
      const userMsg = { role: 'user', text: msg };
      setMessages((m) => [...m, userMsg]);
      setInput('');
      setIsSending(true);
      try {
        const res = await fetch('http://localhost:5000/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, mode, voice, tts: false }) // no TTS
        });
        const json = await res.json();
        if (res.ok) {
          setMessages((m) => [...m, { role: 'bot', text: json.reply || '' }]);
        } else {
          const errorMsg = json.error || 'Error contacting chatbot.';
          console.error('Chatbot error:', errorMsg);
          setMessages((m) => [...m, { role: 'bot', text: `Error: ${errorMsg}` }]);
        }
      } catch (error) {
        console.error('Chatbot connection error:', error);
        setMessages((m) => [...m, { role: 'bot', text: `Error connecting to chatbot. Make sure the backend server is running on http://localhost:5000` }]);
      } finally {
        setIsSending(false);
      }
    };
    
    const sendMessage = async () => {
      await sendMessageWithText(input);
    };


    const ModeSelector = ({ selectMode }) => (
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', textAlign: 'center' }}>Select Your Mode</h3>
        <button
          onClick={() => selectMode('student')}
          style={{
            padding: '15px 25px',
            margin: '10px 0',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            border: '2px solid #dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            color: '#ffffff',
            transition: 'all 0.3s'
          }}
        >
          🎓 Student Mode
        </button>
        <button
          onClick={() => selectMode('pro')}
          style={{
            padding: '15px 25px',
            margin: '10px 0',
            borderRadius: '10px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer',
            border: '2px solid #dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            color: '#ffffff',
            transition: 'all 0.3s'
          }}
        >
          ⚙️ Pro Mode
        </button>
      </div>
    );

    const startVoiceInput = async () => {
      if (!mode || isSending) return;
      setIsSending(true);
      try {
        const res = await fetch('http://localhost:5000/voice_input', { method: 'POST' });
        const json = await res.json();
        const heard = (json.text || '').trim();
        if (heard) {
          await sendMessageWithText(heard);
        } else {
          setMessages((m) => [...m, { role: 'bot', text: 'Did not catch any speech.' }]);
        }
      } catch {
        setMessages((m) => [...m, { role: 'bot', text: 'Voice input failed.' }]);
      } finally {
        setIsSending(false);
      }
    };

    return (
      <>
        {isChatOpen && (
          <div style={{
            position: 'fixed',
            bottom: '110px',
            right: '20px',
            width: '350px',
            height: '450px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            zIndex: 99,
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid #dc3545',
            animation: 'slideUp 0.3s ease-out'
          }}>
            {!mode ? (
              <ModeSelector selectMode={selectMode} toggleChat={() => { setMode(null); toggleChat(); }} />
            ) : (
              <>
                <h3 style={{
                  margin: '0 0 10px 0',
                  color: '#ffffff',
                  borderBottom: '1px solid #333',
                  padding: '10px 15px 5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>CodeMate Bot - {mode === 'student' ? 'Student Mode' : 'Pro Mode'}</span>
                  <button onClick={() => setMode(null)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.8rem' }}>
                    (Change Mode)
                  </button>
                </h3>
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '10px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {messages.map((m, i) => (
                    <div key={i} style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      backgroundColor: m.role === 'user' ? 'rgba(220, 53, 69, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      maxWidth: '80%'
                    }}>
                      {m.text}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', padding: '10px', borderTop: '1px solid #333', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                    type="text"
                    placeholder="Ask a question or tap the mic..."
                    style={{
                      flexGrow: 1,
                      padding: '8px',
                      borderRadius: '20px',
                      border: '1px solid #333',
                      backgroundColor: '#0a0a0a',
                      color: '#ffffff',
                      marginRight: '10px'
                    }}
                  />
                  <button
                    onClick={startVoiceInput}
                    disabled={isSending}
                    title="Voice input"
                    style={{
                      backgroundColor: isSending ? '#666' : '#444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      cursor: isSending ? 'not-allowed' : 'pointer',
                      marginRight: '6px'
                    }}
                  >
                    🎙
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={isSending}
                    title="Send"
                    style={{
                      backgroundColor: isSending ? '#666' : '#dc3545',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '35px',
                      height: '35px',
                      cursor: isSending ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ➤
                  </button>
                </div>
              </>
            )}
          </div>
        )}
        <button
          onClick={() => { toggleChat(); setMode(null); }}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#dc3545',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '1.5rem',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.5)',
            zIndex: 100,
            border: 'none'
          }}
          title="Open CodeMate Chatbot"
        >
          💬
        </button>
      </>
    );
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{
        width: '100vw',
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
        backgroundImage: 'url("/Background_Welcome.jpg")',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
        <div style={{ 
          display: 'flex', 
          flex: '1', 
          minHeight: '100vh', 
        }}>
        {/* Left Side - Code Input */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          borderRight: '2px solid rgba(220, 53, 69, 0.3)',
          position: 'relative',
          paddingBottom: '100px',
          overflowY: 'auto' 
        }}>
          {/* Logo Top Left */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '30px',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#dc3545',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>&lt;&gt;</span>
            <span>CodeMate</span>
          </div>

          {/* Code Input Area */}
          <div style={{
            marginTop: '80px',
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '0'
          }}>
            <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.5rem' }}>Upload or Paste Your Code</h2>
            
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              onPaste={(e) => {
                const pasted = e.clipboardData.getData('text');
                if (pasted) setCodeText(pasted);
              }}
              placeholder="Paste your C code here or upload a file..."
              style={{
                flexGrow: 1,
                minHeight: '300px',
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                color: '#ffffff',
                border: '2px solid #333',
                borderRadius: '10px',
                padding: '20px',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.9rem',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '20px',
                overflowY: 'auto'
              }}
            />

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', flexShrink: 0, marginTop: 'auto' }}>
              <label style={{
                padding: '12px 25px',
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                border: '2px solid #dc3545',
                borderRadius: '25px',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '600',
                textTransform: 'uppercase',
                fontSize: '0.9rem',
                transition: 'all 0.3s',
                display: 'inline-block',
                whiteSpace: 'nowrap'
              }}>
                Upload .C File
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".c,.cpp,.h,.hpp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setCodeText(String(reader.result || ''));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      };
                      reader.readAsText(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                style={{
                  padding: '12px 25px',
                  backgroundColor: isAnalyzing ? '#666' : '#dc3545',
                  border: 'none',
                  borderRadius: '25px',
                  color: '#ffffff',
                  cursor: isAnalyzing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s'
                }}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
              </button>

              {/* Show "View Output" button when compilation is successful (0 errors) */}
              {compilationSuccess && (
                <button
                  onClick={handleViewOutput}
                  style={{
                    padding: '12px 25px',
                    backgroundColor: showInputArea ? '#28a745' : 'rgba(40, 167, 69, 0.2)',
                    border: '2px solid #28a745',
                    borderRadius: '25px',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                >
                  {showInputArea ? 'Run Program' : 'View Output'}
                </button>
              )}
              {/* Show "View Corrected Code" button when there are errors and fixed code is available */}
              {fixedCode && !compilationSuccess && errorCount > 0 && (
                <button
                  onClick={handleShowCorrectedCode}
                  style={{
                    padding: '12px 25px',
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    border: '2px solid #28a745',
                    borderRadius: '25px',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                >
                  View Corrected Code
                </button>
              )}
            </div>
          </div>
          
          {/* NEW SECTION: Program Input Area */}
          {compilationSuccess && showInputArea && (
            <div className="input-area-container" style={{ marginTop: '30px', flexShrink: 0 }}>
                <h3 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '1.2rem' }}>Program Input (stdin)</h3>
                <p style={{ color: '#cccccc', fontSize: '0.85rem', marginBottom: '10px' }}>
                  Enter the input values your program expects. For multiple values, separate them with spaces or new lines.
                  <br />Example: For <code style={{color: '#28a745'}}>scanf("%d %d", &a, &b)</code>, enter: <code style={{color: '#28a745'}}>10 20</code>
                </p>
                <textarea
                    value={programInput}
                    onChange={(e) => setProgramInput(e.target.value)}
                    placeholder="Enter input values here (e.g., for scanf: '10 20' or '10\n20')..."
                    style={{
                        width: '100%',
                        minHeight: '100px',
                        backgroundColor: 'rgba(26, 26, 26, 0.8)',
                        color: '#ffffff',
                        border: '2px solid #28a745',
                        borderRadius: '10px',
                        padding: '15px',
                        fontFamily: 'Space Mono, monospace',
                        fontSize: '0.9rem',
                        resize: 'vertical',
                        outline: 'none',
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                        onClick={() => setShowInputArea(false)}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#6c757d',
                            border: 'none',
                            borderRadius: '15px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleRunProgram}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            border: 'none',
                            borderRadius: '15px',
                            color: '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Run with Input
                    </button>
                </div>
            </div>
          )}
        </div>

        {/* Right Side - Error Explanation & Output */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px',
          paddingBottom: '100px',
          overflowY: 'auto' 
        }}>
          {/* Section 1: Error Explanation */}
          <h2 style={{ color: '#ffffff', marginBottom: '20px', fontSize: '1.5rem' }}>Error Explanation</h2>
          
          <div style={{
            flexShrink: 0,
            backgroundColor: 'rgba(26, 26, 26, 0.8)',
            border: '2px solid #333',
            borderRadius: '10px',
            padding: '20px',
            color: '#ffffff',
            overflowY: 'auto', 
            whiteSpace: 'pre-wrap',
            lineHeight: '1.6',
            minHeight: '200px',
            marginBottom: '30px'
          }}>
            {explanation || (isAnalyzing ? 'Analyzing code...' : 'Analyze your code to see error explanations here.')}
          </div>

          {rawError && (
            <div style={{ flexShrink: 0, marginTop: '20px' }}>
              <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Compiler Output:</h3>
              <div style={{
                backgroundColor: 'rgba(26, 26, 26, 0.8)',
                border: '2px solid #333',
                borderRadius: '10px',
                padding: '15px',
                color: '#ff6b6b',
                fontFamily: 'Space Mono, monospace',
                fontSize: '0.85rem',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {rawError}
              </div>
            </div>
          )}

          {/* Program Output Section */}
          {showOutput && (
            <div 
                ref={outputRef} 
                style={{ 
                    flexShrink: 0, 
                    marginTop: '30px', 
                    borderTop: '1px solid #333',
                    paddingTop: '20px'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ color: '#28a745', margin: '0', fontSize: '1.5rem' }}>
                        Program Output
                    </h2>
                    {!showInputArea && (
                        <button
                            onClick={() => {
                                setShowInputArea(true);
                                requestAnimationFrame(() => {
                                    document.querySelector('.input-area-container')?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                                });
                            }}
                            style={{
                                padding: '8px 15px',
                                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                                border: '1px solid #28a745',
                                borderRadius: '15px',
                                color: '#28a745',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                transition: 'all 0.3s'
                            }}
                        >
                            Run with Input
                        </button>
                    )}
                </div>
                <div style={{
                    backgroundColor: 'rgba(26, 26, 26, 0.8)',
                    border: '2px solid #28a745',
                    borderRadius: '10px',
                    padding: '20px',
                    color: '#ffffff',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '0.9rem',
                    whiteSpace: 'pre-wrap',
                    minHeight: '100px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                }}>
                    {programOutput || 'Execution complete.'}
                </div>
            </div>
          )}
        </div>
        </div>

        {/* Corrected Code Section (Scrolls into view) */}
        {showCorrectedCode && fixedCode && (
          <div
            ref={correctedCodeRef}
            style={{
              width: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.95)',
              borderTop: '3px solid #28a745',
              padding: '30px',
              zIndex: 50,
              animation: 'fadeIn 0.5s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#28a745', margin: '0' }}>Corrected Code</h2>
              <button
                onClick={() => setShowCorrectedCode(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '30px',
                  height: '30px'
                }}
              >
                ×
              </button>
            </div>
            <pre style={{
              backgroundColor: 'rgba(26, 26, 26, 0.8)',
              border: '2px solid #333',
              borderRadius: '10px',
              padding: '20px',
              color: '#ffffff',
              fontFamily: 'Space Mono, monospace',
              fontSize: '0.9rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              margin: '0',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              <code>{fixedCode}</code>
            </pre>
          </div>
        )}

        {/* Severity Meter Popup */}
        {showSeverityMeter && (
          <SeverityGauge
            percentage={severityPercentage}
            errorCount={errorCount}
            warningCount={warningCount}
            errorType={errorType}
            voice={voice}
            onClose={() => setShowSeverityMeter(false)}
          />
        )}

        {/* Chatbot */}
        <Chatbot isChatOpen={isChatOpen} toggleChat={() => setIsChatOpen(prev => !prev)} voice={voice} />
      </div>
    </>
  );
}

export default CodeAnalysisDashboard;
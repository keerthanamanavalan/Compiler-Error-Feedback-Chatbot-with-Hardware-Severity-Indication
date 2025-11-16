import React, { useState } from 'react';
import CodeAnalysisDashboard from './components/CodeAnalysisDashboard';
import WelcomePage from './components/WelcomePage';

function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  const handleGetStarted = () => {
    setShowDashboard(true);
  };

  return (
    <div className="App">
      {showDashboard ? (
        <CodeAnalysisDashboard />
      ) : (
        <WelcomePage onGetStarted={handleGetStarted} />
      )}
    </div>
  );
}

export default App;
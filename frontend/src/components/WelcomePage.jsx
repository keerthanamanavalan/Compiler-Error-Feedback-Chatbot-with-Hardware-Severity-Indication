import React from 'react';

const WelcomePage = ({ onGetStarted }) => {
  const welcomeStyles = {
    container: {
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url("/Background_Welcome.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '\'Roboto\', sans-serif',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.3) 100%)',
      zIndex: 1,
    },
    content: {
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
      padding: '40px',
      animation: 'fadeInUp 1s ease-out',
    },
    title: {
      fontSize: '7rem',
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: '20px',
      textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 60px rgba(255, 255, 255, 0.5)',
      letterSpacing: '3px',
      animation: 'glow 2s ease-in-out infinite alternate',
    },
    subtitle: {
      fontSize: '1.3rem',
      color: '#cccccc',
      marginBottom: '50px',
      fontWeight: '300',
      letterSpacing: '1px',
    },
    codeSymbols: {
      fontSize: '6rem',
      color: '#dc3545',
      marginBottom: '30px',
      fontFamily: '\'Space Mono\', monospace',
      textShadow: '0 0 20px rgba(220, 53, 69, 0.8)',
      animation: 'pulse 2s ease-in-out infinite',
    },
    getStartedButton: {
      padding: '18px 45px',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#ffffff',
      backgroundColor: 'rgba(220, 53, 69, 0.2)',
      border: '2px solid #dc3545',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      boxShadow: '0 0 20px rgba(220, 53, 69, 0.4), inset 0 0 20px rgba(220, 53, 69, 0.1)',
      position: 'relative',
      overflow: 'hidden',
    },
    buttonHover: {
      backgroundColor: 'rgba(220, 53, 69, 0.4)',
      boxShadow: '0 0 30px rgba(220, 53, 69, 0.6), inset 0 0 30px rgba(220, 53, 69, 0.2)',
      transform: 'scale(1.05)',
    },
  };

  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyle = {
    ...welcomeStyles.getStartedButton,
    ...(isHovered ? welcomeStyles.buttonHover : {}),
  };

  const welcomePageStyles = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes glow {
      from {
        text-shadow: 0 0 30px rgba(255, 255, 255, 0.6), 0 0 50px rgba(255, 255, 255, 0.4);
      }
      to {
        text-shadow: 0 0 50px rgba(255, 255, 255, 0.9), 0 0 80px rgba(255, 255, 255, 0.7), 0 0 100px rgba(255, 255, 255, 0.5);
      }
    }


    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.1);
        opacity: 0.8;
      }
    }

    @keyframes shimmer {
      0% {
        background-position: -200% center;
      }
      100% {
        background-position: 200% center;
      }
    }

    .welcome-button-shimmer::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: left 0.5s;
    }

    .welcome-button-shimmer:hover::before {
      left: 100%;
    }
  `;

  return (
    <>
      <style>{welcomePageStyles}</style>
      <div style={welcomeStyles.container}>
        <div style={welcomeStyles.overlay}></div>
        <div style={welcomeStyles.content}>
          <h1 style={welcomeStyles.title}>CodeMate — Your Partner in Every Compile</h1>
          <p style={welcomeStyles.subtitle}>
          Let AI turn your red lines into green success!!!
          </p>
          <button
            style={buttonStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onGetStarted}
            className="welcome-button-shimmer"
          >
            Meet CodeMate
          </button>
        </div>
      </div>
    </>
  );
};

export default WelcomePage;


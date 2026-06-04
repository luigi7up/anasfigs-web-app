import React, { useEffect, useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import type { FigLocation } from '../types';

interface BirthdayModalProps {
  onClose: () => void;
  figs: FigLocation[];
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ onClose, figs }) => {
  const [isVisible, setIsVisible] = useState(false);

  // Get unique contributor names
  const contributors = useMemo(() => {
    const uniqueNames = new Set<string>();
    figs.forEach(fig => {
      if (fig.addedBy) {
        uniqueNames.add(fig.addedBy);
      }
    });
    return Array.from(uniqueNames).sort();
  }, [figs]);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100);

    // Launch confetti multiple times with Mediterranean colors
    const launchConfetti = () => {
      const duration = 5000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Mediterranean color palette
        const medColors = ['#D4744C', '#7C9660', '#4A90E2', '#E8B4B8', '#F5C869', '#C9A074'];

        // Launch from left
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: medColors
        });

        // Launch from right
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: medColors
        });
      }, 250);
    };

    // Initial burst
    launchConfetti();

    // ESC key handler
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      style={{
        backgroundColor: 'rgba(92, 61, 46, 0.75)',
        backdropFilter: 'blur(6px)',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        style={{
          maxWidth: '700px',
          background: 'linear-gradient(180deg, rgba(250, 245, 235, 0.98) 0%, rgba(255, 248, 235, 0.98) 40%, rgba(245, 239, 224, 0.98) 100%)',
          border: 'none',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(124, 150, 96, 0.3), inset 0 0 100px rgba(212, 116, 76, 0.1)',
          transform: isVisible ? 'scale(1) rotate(0deg)' : 'scale(0.9) rotate(-2deg)',
          transition: 'transform 0.6s ease-out',
          textAlign: 'center',
          padding: '50px 40px',
          position: 'relative',
          overflow: 'visible'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hand-drawn border SVG */}
        <svg
          style={{
            position: 'absolute',
            top: '-10px',
            left: '-10px',
            width: 'calc(100% + 20px)',
            height: 'calc(100% + 20px)',
            pointerEvents: 'none',
            zIndex: 10
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 3,2
               C 4,1 5,2 8,2
               L 20,3
               C 35,2 50,3 65,2
               L 80,3
               C 90,2 95,3 97,4
               L 98,5
               C 98,8 99,15 98,25
               L 98,50
               C 99,70 98,85 97,92
               L 96,96
               C 94,97 90,98 80,97
               L 50,98
               C 30,98 15,97 8,98
               L 4,97
               C 2,96 2,93 2,88
               L 2,50
               C 2,30 2,15 2,8
               L 3,4
               C 3,3 2,2 3,2
               Z"
            fill="none"
            stroke="#D4744C"
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'url(#sketch)'
            }}
          />
          <path
            d="M 4,3
               C 5,2 6,3 9,3
               L 22,4
               C 37,3 52,4 67,3
               L 82,4
               C 92,3 96,4 97.5,5
               L 97,6
               C 97.5,9 98,16 97,27
               L 97,52
               C 98,72 97,87 96,93
               L 95,95.5
               C 93,96 89,96.5 79,96
               L 48,96.5
               C 28,96 14,95.5 7,96
               L 3.5,95
               C 2.5,94 2.5,91 2.5,86
               L 2.5,48
               C 2.5,28 2.5,13 2.5,6
               L 3.5,3.5
               C 3.5,2.5 2.5,2.5 4,3
               Z"
            fill="none"
            stroke="#C9A074"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: 'url(#sketch2)'
            }}
          />
          <defs>
            <filter id="sketch">
              <feTurbulence type="fractalNoise" baseFrequency="2" numOctaves="3" seed="1" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.4" />
            </filter>
            <filter id="sketch2">
              <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="3" seed="2" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.5" />
            </filter>
          </defs>
        </svg>
        {/* Watercolor background layers */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(circle, rgba(124, 150, 96, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(40px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-15%',
          right: '-5%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(212, 116, 76, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(35px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '40%',
          height: '40%',
          background: 'radial-gradient(circle, rgba(232, 180, 184, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(30px)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <button
            className="modal-close-button"
            onClick={onClose}
            title="Zatvori"
            style={{
              fontSize: '28px',
              color: '#D4744C',
              opacity: 0.7
            }}
          >
            ✕
          </button>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            marginBottom: '25px',
            fontSize: '70px',
            animation: 'bounce 1s ease-in-out infinite'
          }}>
            🎂🌳🎉
          </div>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            <h1 style={{
              fontFamily: '"Caveat", cursive',
              fontSize: '72px',
              fontWeight: 700,
              color: '#7C9660',
              textShadow: '2px 2px 0px rgba(212, 116, 76, 0.3), 3px 3px 8px rgba(124, 150, 96, 0.2)',
              marginBottom: '20px',
              lineHeight: '1.3',
              animation: 'gentleFloat 3s ease-in-out infinite',
              position: 'relative'
            }}>
              Anći, sretan ti rođendan 😘
            </h1>
            {/* Scribbled underline */}
            <svg
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                height: '20px',
                pointerEvents: 'none'
              }}
              viewBox="0 0 400 20"
              preserveAspectRatio="none"
            >
              <path
                d="M 5,10 Q 50,8 100,12 Q 150,9 200,11 Q 250,13 300,9 Q 350,10 395,12"
                fill="none"
                stroke="#D4744C"
                strokeWidth="2.5"
                strokeLinecap="round"
                style={{
                  filter: 'url(#sketchUnderline)',
                  opacity: 0.6
                }}
              />
              <defs>
                <filter id="sketchUnderline">
                  <feTurbulence type="fractalNoise" baseFrequency="3" numOctaves="2" seed="3" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
                </filter>
              </defs>
            </svg>
          </div>

          <div style={{
            marginTop: '30px',
            fontFamily: '"Caveat", cursive',
            fontSize: '32px',
            color: '#8B6F47',
            fontWeight: 600,
            lineHeight: '1.5',
            fontStyle: 'italic'
          }}>
            <div>Moja Anka sunce milo, jede samo zelenilo,</div>
            <div>Ništa meso, ništa riba, u nje smokva samo šiba! 🌳😄</div>
          </div>

          <div style={{
            marginTop: '60px',
            paddingTop: '40px',
            position: 'relative'
          }}>
            {/* Scribbled divider line */}
            <svg
              style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '70%',
                height: '8px',
                pointerEvents: 'none'
              }}
              viewBox="0 0 300 8"
              preserveAspectRatio="none"
            >
              <path
                d="M 5,4 Q 50,3 100,5 Q 150,4 200,6 Q 250,3 295,5"
                fill="none"
                stroke="#D4744C"
                strokeWidth="2"
                strokeLinecap="round"
                style={{
                  filter: 'url(#sketchDivider)',
                  opacity: 0.5
                }}
              />
              <defs>
                <filter id="sketchDivider">
                  <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="2" seed="4" result="noise" />
                  <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                </filter>
              </defs>
            </svg>
            <div style={{
              fontFamily: '"Caveat", cursive',
              fontSize: '52px',
              color: '#D4744C',
              fontWeight: 700,
              textShadow: '2px 2px 4px rgba(124, 150, 96, 0.3)'
            }}>
              Luka
            </div>
          </div>

          <div style={{ marginTop: '40px' }}>
            <button
              className="rustic-button"
              onClick={onClose}
              style={{
                fontSize: '22px',
                padding: '18px 45px'
              }}
            >
              Hvala ti, ljubavi! 💖
            </button>
          </div>

          {/* Featuring section */}
          {contributors.length > 0 && (
            <div style={{
              marginTop: '40px',
              paddingTop: '20px',
              position: 'relative'
            }}>
              {/* Scribbled divider line */}
              <svg
                style={{
                  position: 'absolute',
                  top: '0',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '6px',
                  pointerEvents: 'none'
                }}
                viewBox="0 0 300 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M 5,4 Q 50,5 100,3 Q 150,6 200,4 Q 250,5 295,3"
                  fill="none"
                  stroke="#C9A074"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  style={{
                    filter: 'url(#sketchDivider2)',
                    opacity: 0.3
                  }}
                />
                <defs>
                  <filter id="sketchDivider2">
                    <feTurbulence type="fractalNoise" baseFrequency="2.5" numOctaves="2" seed="5" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" />
                  </filter>
                </defs>
              </svg>

              <div style={{
                fontFamily: '"Caveat", cursive',
                fontSize: '20px',
                color: '#A08968',
                fontWeight: 500,
                marginBottom: '8px',
                opacity: 0.85
              }}>
                Featuring:
              </div>

              <div style={{
                fontFamily: 'Georgia, "Times New Roman", Times, serif',
                fontSize: '14px',
                color: '#8B7355',
                lineHeight: '1.5',
                fontStyle: 'italic',
                opacity: 0.8
              }}>
                {contributors.join(' • ')} 🌳
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }
      `}</style>
    </div>
  );
};

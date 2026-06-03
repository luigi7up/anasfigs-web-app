import React, { useMemo } from 'react';

interface ThankYouModalProps {
  onClose: () => void;
  userName: string;
}

const funnyMessages = [
  "Ana će biti sretna sva, kad sazna gdje je nova smokva ta 😂",
  "Ana će od sreće skakat kao srna, kad vidi da ima još jedna smokva crna 😂",
  "Ana već radi plan i skicu, za još jednu smokvinu lokaciju 😂",
  "Ana će bit ko Indiana Jones prava, u potrazi za svakom smokvom iz zaborava 😂"
];

export const ThankYouModal: React.FC<ThankYouModalProps> = ({ onClose, userName }) => {
  // Pick a random message each time the modal is rendered
  const randomMessage = useMemo(() => {
    return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
  }, []);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          title="Zatvori"
        >
          ✕
        </button>
        <div style={{
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          textAlign: 'center',
          padding: '20px 0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <img
              src="/icons/fig-icon.svg"
              alt="Smokva"
              style={{
                width: '80px',
                height: '80px',
                animation: 'bounce 0.6s ease-in-out'
              }}
            />
          </div>

          <h2 style={{
            fontSize: '28px',
            color: '#5C3D2E',
            marginBottom: '16px',
            fontWeight: 600
          }}>
            Hvala ti, {userName}!
          </h2>

          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#5C3D2E',
            marginBottom: '20px'
          }}>
            {randomMessage}
          </p>

          <p style={{
            fontSize: '16px',
            color: '#8B6F47',
            fontStyle: 'italic'
          }}>
            Tvoj doprinos znači puno.
          </p>
        </div>

        <div className="button-group" style={{ marginTop: '24px' }}>
          <button
            className="rustic-button"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
};

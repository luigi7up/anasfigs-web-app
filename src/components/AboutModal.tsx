import React from 'react';

interface AboutModalProps {
  onClose: () => void;
  figCount: number;
  onShowAllFigs: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose, figCount, onShowAllFigs }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="wooden-plaque">Anine Smokve 💚</h2>

        <div style={{
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          fontSize: '17px',
          lineHeight: '1.7',
          color: '#5C3D2E'
        }}>
          <p style={{
            marginBottom: '24px',
            fontSize: '18px',
            textAlign: 'center',
            color: '#5C3D2E',
            background: '#FAF5EB',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '4px solid #7C9660'
          }}>


            Ana obožava smokve i točka. Ovo je mali poklon koji nastaje iz te ljubavi - jednostavna aplikacija koja pretvara tu njenu “opsesiju” u nešto što može istraživati, pamtiti i uživati svaki put iznova 💚
            
          </p>

          <div style={{
            marginTop: '28px',
            padding: '20px',
            background: '#F5EFE0',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#5C3D2E',
              marginBottom: '12px'
            }}>
              Do sada je pronađeno:
            </p>
            <p style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#7C9660',
              margin: '8px 0'
            }}>
              {figCount}
            </p>
            <p style={{
              fontSize: '18px',
              color: '#8B6F47',
              marginBottom: '16px'
            }}>
              {figCount === 1 ? 'smokva' : figCount < 5 ? 'smokve' : 'smokvi'} 🌳
            </p>
            <button
              className="rustic-button"
              onClick={() => {
                onShowAllFigs();
                onClose();
              }}
              style={{
                width: '100%',
                fontSize: '18px'
              }}
            >
              Vidi Sve Smokve
            </button>
          </div>

          <p style={{
            fontSize: '19px',
            textAlign: 'center',
            color: '#8B6F47',
            fontWeight: 600,
            marginTop: '24px',
            padding: '16px',
            background: '#FAF5EB',
            borderRadius: '8px'
          }}>
            Hvala vam naj-naj za vaše doprinose Ani! 💝
          </p>
        </div>

        <div className="button-group" style={{ marginTop: '24px' }}>
          <button
            className="rustic-button button-secondary"
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

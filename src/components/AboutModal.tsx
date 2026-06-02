import React from 'react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
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
            Ovo je jednostavan pokušaj mapiranja svih smokava za koje znate po gradu i okolicikako bi moja voljena Ana mogla imati sve na jednoj karti. 🌿
          </p>

          <p style={{
            fontSize: '19px',
            textAlign: 'center',
            color: '#8B6F47',
            fontWeight: 600,
            marginTop: '28px',
            padding: '16px',
            background: '#F5EFE0',
            borderRadius: '8px'
          }}>
            Hvala vam naj-naj za vaše doprinose! 💝
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

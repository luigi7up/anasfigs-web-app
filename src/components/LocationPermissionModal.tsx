import React from 'react';

interface LocationPermissionModalProps {
  onClose: () => void;
  onRetry: () => void;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({ onClose, onRetry }) => {
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
        <h2 className="wooden-plaque">📍 Lokacija Potrebna</h2>

        <div style={{
          fontFamily: 'Georgia, "Times New Roman", Times, serif',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#5C3D2E'
        }}>
          <p style={{ marginBottom: '16px', textAlign: 'center' }}>
            Da bi Ana mogla vidjeti tvoju lokaciju na karti, trebamo tvoju dozvolu za pristup lokaciji.
          </p>

          <div style={{
            background: '#FAF5EB',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            borderLeft: '4px solid #2E7DFF'
          }}>
            <strong style={{ display: 'block', marginBottom: '12px', color: '#2E7DFF' }}>
              Kako omogućiti lokaciju:
            </strong>

            {/* Visual guide showing the permission icon */}
            <div style={{
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              <img
                src="/permissions-label.png"
                alt="Ikona dozvole za lokaciju u adresnoj traci"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '6px',
                  border: '2px solid #E0E0E0'
                }}
              />
            </div>

            <ol style={{ paddingLeft: '20px', margin: 0 }}>
              <li style={{ marginBottom: '8px' }}>
                U adresnoj traci preglednika kliknite na ikonu kao na slici iznad
              </li>
              <li style={{ marginBottom: '8px' }}>
                Pronađite postavku <strong>"Lokacija"</strong> ili <strong>"Location"</strong>
              </li>
              <li style={{ marginBottom: '8px' }}>
                Odaberite <strong>"Dozvoli"</strong> ili <strong>"Allow"</strong>
              </li>
              <li>
                Osvježite stranicu
              </li>
            </ol>
          </div>

          <p style={{
            fontSize: '14px',
            color: '#8B6F47',
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: '16px'
          }}>
            Tvoja lokacija se koristi samo za prikaz na karti i nikada se ne dijeli s drugima.
          </p>
        </div>

        <div className="button-group button-group--vertical" style={{ marginTop: '24px' }}>
          <button
            className="rustic-button"
            onClick={onRetry}
            style={{ width: '100%' }}
          >
            Pokušaj Ponovno
          </button>
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

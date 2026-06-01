import React from 'react';
import type { FigLocation } from '../types';

interface FigDetailsModalProps {
  fig: FigLocation;
  onClose: () => void;
}

export const FigDetailsModal: React.FC<FigDetailsModalProps> = ({ fig, onClose }) => {
  const formattedDate = new Date(fig.createdAt).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="wooden-plaque">{fig.name} 🌳</h2>

        {fig.note && (
          <div style={{
            background: '#FFFEF9',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '2px solid #D4C5B0',
            fontStyle: 'italic',
            color: '#5C3D2E'
          }}>
            "{fig.note}"
          </div>
        )}

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#8B6F47'
        }}>
          <div>
            <strong>Dodao/la:</strong> {fig.addedBy}
          </div>
          <div>
            <strong>Datum:</strong> {formattedDate}
          </div>
          <div>
            <strong>Lokacija:</strong> {fig.lat.toFixed(5)}, {fig.lng.toFixed(5)}
          </div>
        </div>

        <button
          className="rustic-button"
          style={{ width: '100%' }}
          onClick={onClose}
        >
          Zatvori
        </button>
      </div>
    </div>
  );
};

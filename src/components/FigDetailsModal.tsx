import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import type { FigLocation } from '../types';

interface FigDetailsModalProps {
  fig: FigLocation;
  onClose: () => void;
}

export const FigDetailsModal: React.FC<FigDetailsModalProps> = ({ fig, onClose }) => {
  const [hasUserLocation, setHasUserLocation] = useState(false);

  useEffect(() => {
    // Check if user location is available
    if (typeof window !== 'undefined' && (window as any).getUserLocation) {
      const loc = (window as any).getUserLocation();
      setHasUserLocation(!!loc);
    }
  }, []);

  const formattedDate = new Date(fig.createdAt).toLocaleDateString('hr-HR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShowDirections = () => {
    if (typeof window !== 'undefined' && (window as any).showDirectionsToFig) {
      (window as any).showDirectionsToFig(fig);
      onClose();
    } else {
      alert('Tvoja lokacija nije dostupna.');
    }
  };

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
        </div>

        {hasUserLocation && (
          <div className="button-group" style={{ marginTop: '20px' }}>
            <button
              className="rustic-button"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              onClick={handleShowDirections}
            >
              <Navigation size={20} />
              Kako do smokve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

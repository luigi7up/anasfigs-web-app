import React, { useState, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import type { FigLocation } from '../types';

interface FigListModalProps {
  figs: FigLocation[];
  onClose: () => void;
  onFigSelect: (fig: FigLocation) => void;
}

export const FigListModal: React.FC<FigListModalProps> = ({ figs, onClose, onFigSelect }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location from global window object
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).getUserLocation) {
      const loc = (window as any).getUserLocation();
      setUserLocation(loc);
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateDistance = (fig: FigLocation): number | null => {
    if (!userLocation) return null;

    const R = 6371e3; // Earth's radius in meters
    const φ1 = userLocation.lat * Math.PI / 180;
    const φ2 = fig.lat * Math.PI / 180;
    const Δφ = (fig.lat - userLocation.lat) * Math.PI / 180;
    const Δλ = (fig.lng - userLocation.lng) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return Math.round(R * c); // Distance in meters
  };

  const formatDistance = (distance: number | null): string => {
    if (distance === null) return '';
    if (distance < 1000) return `${distance}m`;
    return `${(distance / 1000).toFixed(1)}km`;
  };

  const handleFigClick = (fig: FigLocation) => {
    // Navigate map to the fig location
    if (typeof window !== 'undefined' && (window as any).navigateToLocation) {
      (window as any).navigateToLocation(fig.lat, fig.lng);
    }
    // Select the fig to show its details
    onFigSelect(fig);
    // Close the list modal
    onClose();
  };

  const handleWalkTo = (e: React.MouseEvent, fig: FigLocation) => {
    e.stopPropagation(); // Prevent triggering handleFigClick

    if (typeof window !== 'undefined' && (window as any).showDirectionsToFig) {
      (window as any).showDirectionsToFig(fig);
      onClose();
    } else {
      alert('Tvoja lokacija nije dostupna.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fig-list-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          title="Zatvori"
        >
          ✕
        </button>
        <h2 className="wooden-plaque">
          Sve Smokve ({figs.length})
        </h2>

        <div style={{
          maxHeight: '60vh',
          overflowY: 'auto',
          marginTop: '20px'
        }}>
          {figs.length === 0 ? (
            <p style={{
              fontFamily: 'Georgia, "Times New Roman", Times, serif',
              fontSize: '16px',
              color: '#8B6F47',
              textAlign: 'center',
              padding: '20px'
            }}>
              Još nema dodanih smokava. Budi prvi koji će dodati!
            </p>
          ) : (
            <div className="fig-list">
              {figs.map((fig) => {
                const distance = calculateDistance(fig);
                return (
                  <div
                    key={fig.id}
                    className="fig-list-item"
                    onClick={() => handleFigClick(fig)}
                  >
                    <div className="fig-list-item-icon">
                      <img src="/icons/fig_tree.svg" alt="Smokva" />
                    </div>
                    <div className="fig-list-item-content">
                      <h3 className="fig-list-item-name">{fig.name}</h3>
                      <p className="fig-list-item-meta">
                        Dodao/la <strong>{fig.addedBy}</strong>
                        {distance !== null && (
                          <span className="fig-list-item-distance"> · {formatDistance(distance)}</span>
                        )}
                      </p>
                      <p className="fig-list-item-date">
                        {formatDate(fig.createdAt)}
                      </p>
                    </div>
                    {userLocation && (
                      <button
                        className="fig-list-item-walk-btn"
                        onClick={(e) => handleWalkTo(e, fig)}
                        title="Prikaži put hodanja"
                      >
                        <Navigation size={18} />
                      </button>
                    )}
                    <div className="fig-list-item-arrow">→</div>
                  </div>
                );
              })}
            </div>
          )}
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

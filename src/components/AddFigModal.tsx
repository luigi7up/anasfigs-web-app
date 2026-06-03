import React, { useState, useEffect } from 'react';
import type { FigLocation } from '../types';

interface AddFigModalProps {
  position: { lat: number; lng: number };
  userName: string;
  onClose: () => void;
  onSave: (fig: Omit<FigLocation, 'id' | 'createdAt'>) => void;
}

export const AddFigModal: React.FC<AddFigModalProps> = ({
  position,
  userName,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, saving]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await onSave({
        lat: position.lat,
        lng: position.lng,
        name: name.trim(),
        note: note.trim(),
        addedBy: userName,
      });
      onClose();
    } catch (error) {
      console.error('Error saving fig:', error);
      alert('Greška pri spremanju smokve. Pokušajte ponovno.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--garland" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close-button"
          onClick={onClose}
          title="Zatvori"
        >
          ✕
        </button>
        <div className="modal-garland" aria-hidden="true">
          <img src="/illustrations/02_garland_top.svg" alt="" />
        </div>
        <div className="modal-body">
        <h2 className="wooden-plaque">Dodaj Smokvino Stablo</h2>

        <div style={{
          background: '#F5EFE0',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#8B6F47'
        }}>
          <strong>Lokacija:</strong> {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="figName">Naziv Smokvinog Stabla</label>
            <input
              id="figName"
              type="text"
              className="rustic-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="npr. Stara Vrtna Smokva"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="figNote">Ostavi Napomenu ili Priču</label>
            <textarea
              id="figNote"
              className="rustic-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Podijeli nešto posebno o ovom smokvinom stablu..."
              rows={4}
            />
          </div>

          <div style={{
            fontSize: '14px',
            color: '#8B6F47',
            marginBottom: '16px',
            fontStyle: 'italic'
          }}>
            Dodao/la: {userName}
          </div>

          <div className="button-group button-group--vertical">
            <button
              type="submit"
              className="rustic-button"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Spremanje...' : 'Spremi Smokvino Stablo 💖'}
            </button>
            <button
              type="button"
              className="rustic-button button-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Otkaži
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

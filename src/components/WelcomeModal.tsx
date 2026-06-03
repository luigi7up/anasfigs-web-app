import React, { useState, useEffect } from 'react';
import { FigTreeIcon } from './FigTreeIcon';

interface WelcomeModalProps {
  onSubmit: (name: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && name.trim()) {
        onSubmit(name.trim());
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [name, onSubmit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h1 className="wooden-plaque">
          Dobrodošli na Aninu Smokvu! <FigTreeIcon size={36} />
        </h1>
        <p style={{
          fontSize: '18px',
          textAlign: 'center',
          marginBottom: '24px',
          color: '#8B6F47'
        }}>
          Otkrijte i podijelite mediteranske smokve sa zajednicom
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Kako se zovete?</label>
            <input
              id="name"
              type="text"
              className="rustic-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Unesite svoje ime..."
              autoFocus
              required
            />
          </div>
          <button
            type="submit"
            className="rustic-button"
            style={{ width: '100%' }}
            disabled={!name.trim()}
          >
            Počni Istraživati 🧭
          </button>
        </form>
      </div>
    </div>
  );
};

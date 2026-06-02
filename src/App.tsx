import React, { useState, useEffect } from 'react';
import { WelcomeModal } from './components/WelcomeModal';
import { AddFigModal } from './components/AddFigModal';
import { FigDetailsModal } from './components/FigDetailsModal';
import { AboutModal } from './components/AboutModal';
import { Map } from './components/Map';
import { FigTreeIcon } from './components/FigTreeIcon';
import { supabase } from './supabase';
import type { FigLocation, User } from './types';
import './App.css';

const STORAGE_KEY = 'anasfig_user';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [figs, setFigs] = useState<FigLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPinMode, setIsPinMode] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedFig, setSelectedFig] = useState<FigLocation | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showAbout, setShowAbout] = useState(false);

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user:', e);
      }
    }
    setLoading(false);
  }, []);

  // Load figs from Supabase
  useEffect(() => {
    loadFigs();

    // Subscribe to realtime updates
    const subscription = supabase
      .channel('figs_channel')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'figs' },
        (payload) => {
          console.log('Database change:', payload);
          loadFigs();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadFigs = async () => {
    try {
      const { data, error } = await supabase
        .from('figs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading figs:', error);
        return;
      }

      if (data) {
        setFigs(data.map(fig => ({
          id: fig.id,
          lat: fig.lat,
          lng: fig.lng,
          name: fig.name,
          note: fig.note || '',
          addedBy: fig.added_by,
          createdAt: fig.created_at,
        })));
      }
    } catch (error) {
      console.error('Error loading figs:', error);
    }
  };

  const handleUserSubmit = (name: string) => {
    const newUser: User = {
      name,
      joinedAt: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const handleNameClick = () => {
    if (user) {
      setEditedName(user.name);
      setIsEditingName(true);
    }
  };

  const handleNameSave = () => {
    if (user && editedName.trim()) {
      const updatedUser: User = {
        ...user,
        name: editedName.trim(),
      };
      setUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      setIsEditingName(false);
    }
  };

  const handleNameCancel = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  const handleNameKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };

  const handleAddFigClick = () => {
    setIsPinMode(true);
  };

  const handleCancelPinMode = () => {
    setIsPinMode(false);
    setSelectedPosition(null);
  };

  const handleSaveLocation = () => {
    // Get the center of the map (where crosshair is pointing)
    // This will be handled by the Map component
  };

  const handleMapClick = (lat: number, lng: number) => {
    console.log('handleMapClick called with:', lat, lng);
    setSelectedPosition({ lat, lng });
    setIsPinMode(false);
  };

  const handleSaveFig = async (figData: Omit<FigLocation, 'id' | 'createdAt'>) => {
    try {
      const { data, error } = await supabase
        .from('figs')
        .insert([{
          lat: figData.lat,
          lng: figData.lng,
          name: figData.name,
          note: figData.note,
          added_by: figData.addedBy,
        }])
        .select();

      if (error) {
        throw error;
      }

      // Reset states
      setSelectedPosition(null);

      // Reload figs
      await loadFigs();
    } catch (error) {
      console.error('Error saving fig:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: '"Caveat", cursive',
        fontSize: '24px',
        color: '#8B6F47',
        gap: '20px'
      }}>
        <div className="loading-spinner"></div>
        <div>Učitavanje Anine Smokve...</div>
      </div>
    );
  }

  return (
    <>
      {!user && <WelcomeModal onSubmit={handleUserSubmit} />}

      {user && (
        <div className="info-banner">
          <h1 className="app-title">
            Anine Smokve <FigTreeIcon size={32} />
          </h1>
          <div className="user-greeting">
            Dobrodošli, {isEditingName ? (
              <span className="name-edit-container">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={handleNameKeyPress}
                  onBlur={handleNameSave}
                  className="name-edit-input"
                  autoFocus
                />
              </span>
            ) : (
              <strong
                className="editable-name"
                onClick={handleNameClick}
                title="Kliknite za promjenu imena"
              >
                {user.name}
              </strong>
            )}!
          </div>
        </div>
      )}

      <Map
        figs={figs}
        onFigClick={setSelectedFig}
        isPinMode={isPinMode}
        onSaveLocation={handleMapClick}
        onCancelPinMode={handleCancelPinMode}
      />

      {user && (
        <button
          className="rustic-button about-button"
          onClick={() => setShowAbout(true)}
          title="O aplikaciji"
        >
          ℹ️
        </button>
      )}

      {user && !selectedPosition && (
        <div className="center-button-container">
          {!isPinMode ? (
            <button
              className="rustic-button add-fig-button-center"
              onClick={handleAddFigClick}
            >
              Dodaj Smokvu <FigTreeIcon size={26} />
            </button>
          ) : (
            <div className="button-group-horizontal">
              <button
                className="rustic-button save-location-button"
                onClick={() => {
                  console.log('Save Location clicked');
                  console.log('window.saveMapLocation exists?', !!(window as any).saveMapLocation);
                  if ((window as any).saveMapLocation) {
                    (window as any).saveMapLocation();
                  } else {
                    console.error('saveMapLocation not found on window');
                  }
                }}
              >
                Spremi Lokaciju 📍
              </button>
              <button
                className="rustic-button cancel-button"
                onClick={handleCancelPinMode}
              >
                Otkaži
              </button>
            </div>
          )}
        </div>
      )}

      {selectedPosition && user && (
        <AddFigModal
          position={selectedPosition}
          userName={user.name}
          onClose={() => setSelectedPosition(null)}
          onSave={handleSaveFig}
        />
      )}

      {selectedFig && (
        <FigDetailsModal
          fig={selectedFig}
          onClose={() => setSelectedFig(null)}
        />
      )}

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} />
      )}
    </>
  );
}

export default App;

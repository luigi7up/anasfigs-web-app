import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { WelcomeModal } from './components/WelcomeModal';
import { AddFigModal } from './components/AddFigModal';
import { FigDetailsModal } from './components/FigDetailsModal';
import { AboutModal } from './components/AboutModal';
import { ThankYouModal } from './components/ThankYouModal';
import { FigListModal } from './components/FigListModal';
import { BirthdayModal } from './components/BirthdayModal';
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
  const [showThankYou, setShowThankYou] = useState(false);
  const [showFigList, setShowFigList] = useState(false);
  const [showBirthday, setShowBirthday] = useState(false);
  const figCountRef = useRef<HTMLSpanElement>(null);
  const previousFigCount = useRef<number>(0);
  const [animationKey, setAnimationKey] = useState(0);

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

  // Check for Ana's birthday and show modal after 3 seconds
  useEffect(() => {
    const checkBirthday = () => {
      // Check for query param for testing
      const urlParams = new URLSearchParams(window.location.search);
      const birthdayParam = urlParams.get('birthday');

      if (birthdayParam === 'true') {
        return true;
      }

      // Check if it's June 5th or 6th
      const now = new Date();
      const month = now.getMonth() + 1; // 0-indexed, so +1 for June = 6
      const day = now.getDate();

      return month === 6 && (day === 5 || day === 6);
    };

    if (checkBirthday()) {
      const timer = setTimeout(() => {
        setShowBirthday(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
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

  // Trigger confetti when fig count increases
  useEffect(() => {
    if (figs.length > previousFigCount.current && previousFigCount.current > 0 && figCountRef.current) {
      // Get position of the fig count element
      const rect = figCountRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      // Launch confetti from the fig count position
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { x, y },
        colors: ['#7C9660', '#8B6F47', '#5C3D2E', '#9D5B9A', '#2E7DFF'],
        ticks: 200,
        gravity: 1.2,
        scalar: 1.2
      });

      // Additional burst for extra celebration
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 100,
          origin: { x, y },
          colors: ['#7C9660', '#8B6F47', '#5C3D2E', '#9D5B9A'],
          ticks: 150,
          gravity: 1
        });
      }, 150);
    }
    previousFigCount.current = figs.length;
  }, [figs.length]);

  const loadFigs = async () => {
    try {
      const { data, error } = await supabase
        .from('figs')
        .select('*')
        .eq('visible', true)
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

  const handleMapMove = () => {
    setAnimationKey(prev => prev + 1);
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
          visible: true,
        }])
        .select();

      if (error) {
        throw error;
      }

      // Reset states
      setSelectedPosition(null);

      // Show thank you modal
      setShowThankYou(true);

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
            <span
              ref={figCountRef}
              className="fig-count fig-count-animate"
              onClick={() => setShowFigList(true)}
              title="Prikaži sve smokve"
              key={animationKey}
            >
              {figs.length}
            </span>
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
        onShowAbout={() => setShowAbout(true)}
        onMapMove={handleMapMove}
      />

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
        <AboutModal
          onClose={() => setShowAbout(false)}
          figCount={figs.length}
          onShowAllFigs={() => setShowFigList(true)}
        />
      )}

      {showThankYou && user && (
        <ThankYouModal onClose={() => setShowThankYou(false)} userName={user.name} />
      )}

      {showFigList && (
        <FigListModal
          figs={figs}
          onClose={() => setShowFigList(false)}
          onFigSelect={(fig) => setSelectedFig(fig)}
        />
      )}

      {showBirthday && (
        <BirthdayModal onClose={() => setShowBirthday(false)} figs={figs} />
      )}
    </>
  );
}

export default App;

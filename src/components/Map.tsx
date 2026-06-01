import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { FigLocation } from '../types';
import { FIG_TREE_ICON_SRC } from './FigTreeIcon';

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom fig marker icon
const figIcon = new L.DivIcon({
  className: 'fig-marker',
  html: `<img src="${FIG_TREE_ICON_SRC}" alt="" width="40" height="40" />`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

interface MapProps {
  figs: FigLocation[];
  onFigClick: (fig: FigLocation) => void;
  isPinMode: boolean;
  onSaveLocation?: (lat: number, lng: number) => void;
  onCancelPinMode?: () => void;
}

const ZoomAdjuster: React.FC<{ isPinMode: boolean; targetZoom: number }> = ({ isPinMode, targetZoom }) => {
  const map = useMap();

  useEffect(() => {
    if (isPinMode) {
      map.setZoom(targetZoom, { animate: true });
    }
  }, [isPinMode, targetZoom, map]);

  return null;
};

const LocationInitializer: React.FC = () => {
  const map = useMap();

  useEffect(() => {
    console.log('LocationInitializer mounted');
    console.log('Geolocation available?', !!navigator.geolocation);

    // Try to get user's current location on mount
    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position.coords);
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13, { animate: true }); // Zoom level 13 = city level
        },
        (error) => {
          console.error('Geolocation error:', error.message, error.code);
          // Keep default location if geolocation fails
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 0
        }
      );
    } else {
      console.log('Geolocation not available');
    }
  }, [map]);

  return null;
};

// Component to expose map instance to parent via ref
const SaveLocationHandler: React.FC<{
  onGetCenter: (getCenter: () => { lat: number; lng: number }) => void;
}> = ({ onGetCenter }) => {
  const map = useMap();

  useEffect(() => {
    console.log('SaveLocationHandler: Setting up getCenter function');
    const getCenterFn = () => {
      const center = map.getCenter();
      console.log('getCenterFn called, center:', center);
      return { lat: center.lat, lng: center.lng };
    };
    onGetCenter(getCenterFn);
  }, [map, onGetCenter]);

  return null;
};

export const Map: React.FC<MapProps> = ({ figs, onFigClick, isPinMode, onSaveLocation, onCancelPinMode }) => {
  // Default center: Split, Croatia
  const defaultCenter: [number, number] = [43.5081, 16.4402];
  const defaultZoom = 13; // City level on initial load
  const zoomForPlacement = 18; // ~200m coverage

  const getMapCenterRef = useRef<(() => { lat: number; lng: number }) | null>(null);

  const handleGetCenter = useCallback((getCenterFn: () => { lat: number; lng: number }) => {
    console.log('handleGetCenter called, storing function in ref');
    getMapCenterRef.current = getCenterFn;
  }, []);

  // Expose save location handler globally
  useEffect(() => {
    console.log('Setting up saveMapLocation');
    if (typeof window !== 'undefined') {
      (window as any).saveMapLocation = () => {
        console.log('saveMapLocation called, ref exists?', !!getMapCenterRef.current, 'onSaveLocation:', !!onSaveLocation);
        if (getMapCenterRef.current && onSaveLocation) {
          const center = getMapCenterRef.current();
          console.log('Got map center:', center);
          onSaveLocation(center.lat, center.lng);
        } else {
          console.error('getMapCenterRef.current or onSaveLocation missing');
        }
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).saveMapLocation;
      }
    };
  }, [onSaveLocation]);

  return (
    <div className="map-container">
      {isPinMode && (
        <div className="crosshair-overlay">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="#D4845A" strokeWidth="3" fill="none" opacity="0.8"/>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#D4845A" strokeWidth="3"/>
            <line x1="20" y1="30" x2="20" y2="38" stroke="#D4845A" strokeWidth="3"/>
            <line x1="2" y1="20" x2="10" y2="20" stroke="#D4845A" strokeWidth="3"/>
            <line x1="30" y1="20" x2="38" y2="20" stroke="#D4845A" strokeWidth="3"/>
            <circle cx="20" cy="20" r="3" fill="#D4845A"/>
          </svg>
        </div>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Retro/Minimal Watercolor-style tiles */}
        <TileLayer
          attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
          url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg"
          className="rustic-tiles"
        />

        {/* Label overlay with major streets only */}
        <TileLayer
          url="https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}.png"
          className="label-tiles"
        />

        <LocationInitializer />
        <ZoomAdjuster isPinMode={isPinMode} targetZoom={zoomForPlacement} />
        <SaveLocationHandler onGetCenter={handleGetCenter} />

        {figs.map((fig) => (
          <Marker
            key={fig.id}
            position={[fig.lat, fig.lng]}
            icon={figIcon}
            eventHandlers={{
              click: () => onFigClick(fig),
            }}
          >
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif' }}>
                <strong style={{ fontSize: '16px', color: '#5C3D2E' }}>
                  {fig.name}
                </strong>
                <br />
                <span style={{ fontSize: '12px', color: '#8B6F47' }}>
                  Dodao/la {fig.addedBy}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

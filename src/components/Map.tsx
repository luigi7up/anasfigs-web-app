import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { Navigation } from 'lucide-react';
import type { FigLocation } from '../types';
import { FIG_TREE_ICON_SRC } from './FigTreeIcon';
import { LocationPermissionModal } from './LocationPermissionModal';

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

// Custom user location marker icon
const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `<div class="user-location-dot">
    <div class="user-location-pulse"></div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface MapProps {
  figs: FigLocation[];
  onFigClick: (fig: FigLocation) => void;
  isPinMode: boolean;
  onSaveLocation?: (lat: number, lng: number) => void;
  onCancelPinMode?: () => void;
  onShowAbout?: () => void;
  onMapMove?: () => void;
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

const LocationInitializer: React.FC<{
  onLocationFound: (lat: number, lng: number) => void;
}> = ({ onLocationFound }) => {
  const map = useMap();
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    // Only run once on mount
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    console.log('LocationInitializer mounted');
    console.log('Geolocation available?', !!navigator.geolocation);

    // Try to get user's current location on mount
    if (navigator.geolocation) {
      console.log('Requesting geolocation...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Geolocation success:', position.coords);
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15, { animate: true }); // Zoom level 15 = neighborhood level
          onLocationFound(latitude, longitude);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array - truly only run once on mount

  return null;
};

// Component to track map movement
const MapMoveTracker: React.FC<{
  userLocation: { lat: number; lng: number } | null;
  onMapMoved: (hasMoved: boolean) => void;
}> = ({ userLocation, onMapMoved }) => {
  const map = useMap();

  useEffect(() => {
    if (!userLocation) return;

    const checkDistance = () => {
      const center = map.getCenter();
      const distance = center.distanceTo([userLocation.lat, userLocation.lng]);
      // If user has moved more than 200m from their location, show recenter button
      onMapMoved(distance > 200);
    };

    map.on('moveend', checkDistance);
    checkDistance(); // Check initially

    return () => {
      map.off('moveend', checkDistance);
    };
  }, [map, userLocation, onMapMoved]);

  return null;
};

// Component to track zoom level
const ZoomTracker: React.FC<{
  onZoomChange: (zoom: number) => void;
}> = ({ onZoomChange }) => {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoomend', handleZoom);
    handleZoom(); // Check initially

    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
};

// Component to track map movement
const MapMoveDetector: React.FC<{
  onMapMove?: () => void;
}> = ({ onMapMove }) => {
  const map = useMap();

  useEffect(() => {
    if (!onMapMove) return;

    const handleMove = () => {
      onMapMove();
    };

    map.on('moveend', handleMove);

    return () => {
      map.off('moveend', handleMove);
    };
  }, [map, onMapMove]);

  return null;
};

// Component to capture map instance
const MapInstanceCapture: React.FC<{
  onMapReady: (map: L.Map) => void;
}> = ({ onMapReady }) => {
  const map = useMap();

  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);

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

export const Map: React.FC<MapProps> = ({ figs, onFigClick, isPinMode, onSaveLocation, onCancelPinMode, onShowAbout, onMapMove }) => {
  // Default center: Split, Croatia
  const defaultCenter: [number, number] = [43.5081, 16.4402];
  const defaultZoom = 13; // City level on initial load
  const zoomForPlacement = 18; // ~200m coverage

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasMovedAway, setHasMovedAway] = useState(false);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  const [isWatercolorMap, setIsWatercolorMap] = useState(true);
  const [currentZoom, setCurrentZoom] = useState(defaultZoom);

  const getMapCenterRef = useRef<(() => { lat: number; lng: number }) | null>(null);

  // Show recenter button when: no location yet OR user has moved away
  const showRecenterButton = !userLocation || hasMovedAway;

  const handleGetCenter = useCallback((getCenterFn: () => { lat: number; lng: number }) => {
    console.log('handleGetCenter called, storing function in ref');
    getMapCenterRef.current = getCenterFn;
  }, []);

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setLocationRequested(true);
  }, []);

  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);

    // Auto-switch map style based on zoom level
    // Zoom >= 19 (top level): detailed satellite map
    // Zoom < 19: watercolor map
    if (zoom >= 19) {
      setIsWatercolorMap(false);
    } else {
      setIsWatercolorMap(true);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (navigator.geolocation && mapInstance) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLocationRequested(true);
          setLocationDenied(false);
          mapInstance.setView([latitude, longitude], 15, { animate: true });
        },
        (error) => {
          console.error('Geolocation error:', error);
          if (error.code === error.PERMISSION_DENIED) {
            setLocationDenied(true);
            setShowLocationModal(true);
          } else {
            alert('Nije moguće dobiti tvoju lokaciju. Pokušaj ponovno.');
          }
        }
      );
    }
  }, [mapInstance]);

  const handleRecenterClick = () => {
    if (!locationRequested || locationDenied) {
      // First time or was denied - request location
      requestLocation();
    } else if (userLocation && mapInstance) {
      // Already have location - just recenter
      mapInstance.setView([userLocation.lat, userLocation.lng], 15, { animate: true });
    }
  };

  const handleRetryLocation = () => {
    setShowLocationModal(false);
    requestLocation();
  };

  // Clear route
  const clearRoute = useCallback(() => {
    if (routingControlRef.current && mapInstance) {
      mapInstance.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }
  }, [mapInstance]);

  // Show route to a specific fig
  const showDirectionsToFig = useCallback((fig: FigLocation) => {
    if (!mapInstance || !userLocation) {
      alert('Tvoja lokacija nije dostupna.');
      return;
    }

    // Clear any existing route
    if (routingControlRef.current) {
      mapInstance.removeControl(routingControlRef.current);
      routingControlRef.current = null;
    }

    // Create routing control with walking profile
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(fig.lat, fig.lng)
      ],
      router: new (L.Routing as any).OSRMv1({
        serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
      }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      lineOptions: {
        styles: [{ color: '#8B6F47', opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    }).addTo(mapInstance);

    routingControlRef.current = routingControl;
  }, [mapInstance, userLocation]);

  // Cleanup routing control on unmount
  useEffect(() => {
    return () => {
      if (routingControlRef.current && mapInstance) {
        mapInstance.removeControl(routingControlRef.current);
      }
    };
  }, [mapInstance]);

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

      // Expose function to navigate to a specific location
      (window as any).navigateToLocation = (lat: number, lng: number) => {
        if (mapInstance) {
          mapInstance.setView([lat, lng], 18, { animate: true });
        }
      };

      // Expose function to show directions to a specific fig
      (window as any).showDirectionsToFig = showDirectionsToFig;

      // Expose function to clear route
      (window as any).clearMapRoute = clearRoute;

      // Expose user location for distance calculations
      (window as any).getUserLocation = () => userLocation;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).saveMapLocation;
        delete (window as any).navigateToLocation;
        delete (window as any).showDirectionsToFig;
        delete (window as any).clearMapRoute;
        delete (window as any).getUserLocation;
      }
    };
  }, [onSaveLocation, mapInstance, showDirectionsToFig, clearRoute, userLocation]);

  return (
    <div className="map-container">
      {onShowAbout && (
        <button
          className="rustic-button about-button"
          onClick={onShowAbout}
          title="O aplikaciji"
        >
          ℹ️
        </button>
      )}

      {isPinMode && (
        <div className="crosshair-overlay">
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" stroke="#2E7DFF" strokeWidth="3" fill="none" opacity="0.9"/>
            <line x1="20" y1="2" x2="20" y2="10" stroke="#2E7DFF" strokeWidth="3"/>
            <line x1="20" y1="30" x2="20" y2="38" stroke="#2E7DFF" strokeWidth="3"/>
            <line x1="2" y1="20" x2="10" y2="20" stroke="#2E7DFF" strokeWidth="3"/>
            <line x1="30" y1="20" x2="38" y2="20" stroke="#2E7DFF" strokeWidth="3"/>
            <circle cx="20" cy="20" r="3" fill="#2E7DFF"/>
          </svg>
        </div>
      )}

      {showRecenterButton && (
        <button
          className="locate-me-button"
          onClick={handleRecenterClick}
          title="Lociraj moju lokaciju"
        >
          <Navigation size={20} />
          <span>Lociraj Me</span>
        </button>
      )}

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {isWatercolorMap ? (
          <>
            {/* Watercolor base layer for artistic look */}
            <TileLayer
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
              url={`https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.jpg${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
              className="rustic-tiles"
              maxNativeZoom={18}
              maxZoom={20}
            />

            {/* Terrain lines overlay for topography detail */}
            <TileLayer
              url={`https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}.png${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
              opacity={0.4}
              maxNativeZoom={18}
              maxZoom={20}
            />

            {/* Detailed labels overlay showing all streets, paths, and places */}
            <TileLayer
              url={`https://tiles.stadiamaps.com/tiles/stamen_terrain_labels/{z}/{x}/{y}.png${import.meta.env.VITE_STADIA_MAPS_API_KEY ? `?api_key=${import.meta.env.VITE_STADIA_MAPS_API_KEY}` : ''}`}
              className="label-tiles"
              maxNativeZoom={18}
              maxZoom={20}
            />
          </>
        ) : (
          <>
            {/* Satellite imagery for hyper-detailed view */}
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </>
        )}

        <MapInstanceCapture onMapReady={setMapInstance} />
        <LocationInitializer onLocationFound={handleLocationFound} />
        <ZoomAdjuster isPinMode={isPinMode} targetZoom={zoomForPlacement} />
        <SaveLocationHandler onGetCenter={handleGetCenter} />
        <MapMoveTracker userLocation={userLocation} onMapMoved={setHasMovedAway} />
        <ZoomTracker onZoomChange={handleZoomChange} />
        <MapMoveDetector onMapMove={onMapMove} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif', textAlign: 'center' }}>
                <strong style={{ fontSize: '14px', color: '#2E7DFF' }}>
                  Tvoja Lokacija
                </strong>
              </div>
            </Popup>
          </Marker>
        )}

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
              <div style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
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

      {showLocationModal && (
        <LocationPermissionModal
          onClose={() => setShowLocationModal(false)}
          onRetry={handleRetryLocation}
        />
      )}
    </div>
  );
};

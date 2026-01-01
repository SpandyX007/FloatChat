import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapData } from '../../types';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Define custom icon for float locations
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const blueIcon = createCustomIcon();

interface FloatMapProps {
  mapData?: MapData | null;
  onRefresh?: () => void;
  mapRefreshTrigger?: number;
}

const FloatMap: React.FC<FloatMapProps> = ({ mapData, onRefresh, mapRefreshTrigger }) => {
  const [profileLocations, setProfileLocations] = useState<MapData>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (mapData) {
      setProfileLocations(mapData);
    } else {
      fetchMapData();
    }
  }, [mapData]);

  useEffect(() => {
    if (mapRefreshTrigger && mapRefreshTrigger > 0) {
      fetchMapData();
    }
  }, [mapRefreshTrigger]);

  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/parameters/get-maps');
      if (response.ok) {
        const data = await response.json();
        setProfileLocations(data);
      }
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      fetchMapData();
    }
  };

  // Calculate center based on available markers
  const calculateCenter = (): [number, number] => {
    const locations = Object.values(profileLocations);
    if (locations.length === 0) return [10, 85]; // Default to Indian Ocean

    const avgLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
    const avgLon = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;
    return [avgLat, avgLon];
  };

  return (
    <div className="w-full h-full rounded-md overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg">Loading map data...</div>
        </div>
      )}
      <MapContainer
        center={calculateCenter()}
        zoom={5}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {Object.entries(profileLocations).map(([profileName, coords]) => (
          <Marker
            key={profileName}
            position={[coords.latitude, coords.longitude]}
            icon={blueIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold text-gray-900">{profileName}</p>
                <p className="text-gray-600">Lat: {coords.latitude.toFixed(3)}</p>
                <p className="text-gray-600">Lon: {coords.longitude.toFixed(3)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default FloatMap;

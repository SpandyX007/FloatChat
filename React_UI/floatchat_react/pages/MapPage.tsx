import React, { useState, useEffect } from 'react';
import FloatMap from '../components/map/FloatMap';
import { MapData } from '../types';

const MapPage: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/parameters/get-maps');
      if (response.ok) {
        const data = await response.json();
        setMapData(data);
      } else {
        setError('Failed to fetch map data');
      }
    } catch (error) {
      setError('Connection error. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">
            Ocean Profile Locations
          </h1>
          <p className="text-light-text-muted dark:text-dark-text-muted">
            Geographic distribution of ARGO float profile locations
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={fetchMapData}
            disabled={isLoading}
            className="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Refreshing...' : 'Refresh Map Data'}
          </button>
          
          {mapData && (
            <div className="flex items-center gap-2 text-light-text dark:text-white">
              <span className="text-sm">
                Showing <strong>{Object.keys(mapData).length}</strong> profile location{Object.keys(mapData).length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex-1 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
          <FloatMap mapData={mapData} onRefresh={fetchMapData} />
        </div>

        {mapData && Object.keys(mapData).length > 0 && (
          <div className="mt-4 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3 text-light-text dark:text-white">
              Profile Locations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
              {Object.entries(mapData).map(([profileName, coords]) => (
                <div
                  key={profileName}
                  className="p-3 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                >
                  <p className="font-medium text-light-text dark:text-white">{profileName}</p>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    Lat: {coords.latitude.toFixed(3)}, Lon: {coords.longitude.toFixed(3)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;

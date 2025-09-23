// import React, { useEffect, useRef, useState } from 'react';
// import { Paper, Typography, Box, Chip } from '@mui/material';
// import { LocationOn as LocationIcon } from '@mui/icons-material';
// import mapboxgl from 'mapbox-gl';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import MapboxTokenInput from './MapboxTokenInput';

// // Mock ARGO float data
// const argoFloats = [
//   { id: 'WMO_4901234', lat: 45.5, lng: -45.2, status: 'active', lastProfile: '2024-01-15', cycles: 342 },
//   { id: 'WMO_4901235', lat: 47.8, lng: -42.1, status: 'active', lastProfile: '2024-01-14', cycles: 289 },
//   { id: 'WMO_4901236', lat: 43.2, lng: -48.7, status: 'inactive', lastProfile: '2023-12-20', cycles: 156 },
//   { id: 'WMO_4901237', lat: 49.1, lng: -40.5, status: 'active', lastProfile: '2024-01-16', cycles: 401 },
//   { id: 'WMO_4901238', lat: 41.7, lng: -46.3, status: 'active', lastProfile: '2024-01-15', cycles: 278 },
// ];

// interface ArgoMapProps {
//   region?: string;
//   onFloatSelect?: (floatId: string) => void;
// }

// const ArgoMap: React.FC<ArgoMapProps> = ({ region = 'North Atlantic', onFloatSelect }) => {
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<mapboxgl.Map | null>(null);
//   const [mapboxToken, setMapboxToken] = useState<string>('');

//   const handleTokenSubmit = (token: string) => {
//     setMapboxToken(token);
//   };

//   const handleFloatClick = (floatId: string) => {
//     onFloatSelect?.(floatId);
//   };

//   useEffect(() => {
//     if (!mapContainer.current || !mapboxToken) return;

//     // Initialize Mapbox
//     mapboxgl.accessToken = mapboxToken;
    
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/satellite-streets-v12',
//       center: [-45.0, 45.5],
//       zoom: 5,
//       projection: 'globe' as any
//     });

//     // Add navigation controls
//     map.current.addControl(
//       new mapboxgl.NavigationControl({
//         visualizePitch: true,
//       }),
//       'top-right'
//     );

//     // Add atmosphere and fog effects
//     map.current.on('style.load', () => {
//       if (map.current) {
//         map.current.setFog({
//           color: 'rgb(186, 210, 235)',
//           'high-color': 'rgb(36, 92, 223)',
//           'horizon-blend': 0.02,
//           'space-color': 'rgb(11, 11, 25)',
//           'star-intensity': 0.6
//         });
//       }
//     });

//     // Add ARGO float markers
//     argoFloats.forEach((float) => {
//       const el = document.createElement('div');
//       el.className = 'argo-marker';
//       el.style.cssText = `
//         width: 14px;
//         height: 14px;
//         border-radius: 50%;
//         background-color: ${float.status === 'active' ? '#2563eb' : '#6b7280'};
//         border: 2px solid white;
//         box-shadow: 0 2px 4px rgba(0,0,0,0.3);
//         cursor: pointer;
//         transition: all 0.2s ease;
//       `;
      
//       el.addEventListener('mouseenter', () => {
//         el.style.transform = 'scale(1.2)';
//       });
      
//       el.addEventListener('mouseleave', () => {
//         el.style.transform = 'scale(1)';
//       });

//       el.addEventListener('click', () => {
//         handleFloatClick(float.id);
//       });

//       // Create popup
//       const popup = new mapboxgl.Popup({
//         offset: 15,
//         closeButton: true,
//         closeOnClick: false
//       }).setHTML(`
//         <div style="padding: 8px; font-family: system-ui; max-width: 200px;">
//           <div style="font-weight: 600; margin-bottom: 6px; color: #1f2937;">${float.id}</div>
//           <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
//             Status: <span style="color: ${float.status === 'active' ? '#059669' : '#6b7280'}; font-weight: 500;">
//               ${float.status}
//             </span>
//           </div>
//           <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
//             Last Profile: ${float.lastProfile}
//           </div>
//           <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">
//             Cycles: ${float.cycles}
//           </div>
//           <div style="font-size: 12px; color: #6b7280;">
//             Coordinates: ${float.lat.toFixed(2)}°N, ${Math.abs(float.lng).toFixed(2)}°W
//           </div>
//         </div>
//       `);

//       // Add marker to map
//       new mapboxgl.Marker(el)
//         .setLngLat([float.lng, float.lat])
//         .setPopup(popup)
//         .addTo(map.current!);
//     });

//     // Heat map layer for data density
//     map.current.on('load', () => {
//       if (!map.current) return;

//       // Add heat map source
//       map.current.addSource('argo-heat', {
//         type: 'geojson',
//         data: {
//           type: 'FeatureCollection',
//           features: argoFloats.map(float => ({
//             type: 'Feature',
//             properties: {
//               cycles: float.cycles,
//               status: float.status
//             },
//             geometry: {
//               type: 'Point',
//               coordinates: [float.lng, float.lat]
//             }
//           }))
//         }
//       });

//       // Add heat map layer
//       map.current.addLayer({
//         id: 'argo-heat',
//         type: 'heatmap',
//         source: 'argo-heat',
//         maxzoom: 9,
//         paint: {
//           'heatmap-weight': [
//             'interpolate',
//             ['linear'],
//             ['get', 'cycles'],
//             0, 0,
//             500, 1
//           ],
//           'heatmap-intensity': [
//             'interpolate',
//             ['linear'],
//             ['zoom'],
//             0, 1,
//             9, 3
//           ],
//           'heatmap-color': [
//             'interpolate',
//             ['linear'],
//             ['heatmap-density'],
//             0, 'rgba(33,102,172,0)',
//             0.2, 'rgb(103,169,207)',
//             0.4, 'rgb(209,229,240)',
//             0.6, 'rgb(253,219,199)',
//             0.8, 'rgb(239,138,98)',
//             1, 'rgb(178,24,43)'
//           ],
//           'heatmap-radius': [
//             'interpolate',
//             ['linear'],
//             ['zoom'],
//             0, 2,
//             9, 20
//           ],
//           'heatmap-opacity': [
//             'interpolate',
//             ['linear'],
//             ['zoom'],
//             7, 1,
//             9, 0
//           ]
//         }
//       });
//     });

//     return () => {
//       map.current?.remove();
//     };
//   }, [mapboxToken]);

//   return (
//     <Paper 
//       elevation={2} 
//       sx={{ 
//         p: 3, 
//         height: '100%', 
//         bgcolor: 'background.paper',
//         border: '1px solid',
//         borderColor: 'divider'
//       }}
//     >
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <Box 
//             sx={{ 
//               p: 1, 
//               borderRadius: 1, 
//               bgcolor: 'secondary.main',
//               color: 'secondary.contrastText'
//             }}
//           >
//             <LocationIcon sx={{ fontSize: 20 }} />
//           </Box>
//           <div>
//             <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
//               ARGO Float Locations
//             </Typography>
//             <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//               Interactive oceanographic sensors with heat mapping
//             </Typography>
//           </div>
//         </div>
//         <Chip 
//           label={region} 
//           size="small" 
//           sx={{ 
//             bgcolor: 'primary.main',
//             color: 'primary.contrastText',
//             fontWeight: 500
//           }}
//         />
//       </Box>

//       {!mapboxToken ? (
//         <MapboxTokenInput onTokenSubmit={handleTokenSubmit} hasToken={!!mapboxToken} />
//       ) : (
//         <>
//           <Box 
//             sx={{ 
//               height: 400, 
//               borderRadius: 1, 
//               overflow: 'hidden',
//               border: '1px solid',
//               borderColor: 'divider',
//               position: 'relative'
//             }}
//           >
//             <div ref={mapContainer} style={{ height: '100%', width: '100%' }} />
//           </Box>

//           <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
//             <Box 
//               sx={{ 
//                 p: 2, 
//                 borderRadius: 1, 
//                 bgcolor: 'primary.main',
//                 color: 'primary.contrastText',
//                 textAlign: 'center'
//               }}
//             >
//               <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                 {argoFloats.filter(f => f.status === 'active').length}
//               </Typography>
//               <Typography variant="caption">
//                 Active Floats
//               </Typography>
//             </Box>
//             <Box 
//               sx={{ 
//                 p: 2, 
//                 borderRadius: 1, 
//                 bgcolor: 'secondary.main',
//                 color: 'secondary.contrastText',
//                 textAlign: 'center'
//               }}
//             >
//               <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                 {argoFloats.length}
//               </Typography>
//               <Typography variant="caption">
//                 Total Floats
//               </Typography>
//             </Box>
//             <Box 
//               sx={{ 
//                 p: 2, 
//                 borderRadius: 1, 
//                 bgcolor: 'info.main',
//                 color: 'info.contrastText',
//                 textAlign: 'center'
//               }}
//             >
//               <Typography variant="h6" sx={{ fontWeight: 600 }}>
//                 {argoFloats.reduce((sum, f) => sum + f.cycles, 0)}
//               </Typography>
//               <Typography variant="caption">
//                 Total Cycles
//               </Typography>
//             </Box>
//           </Box>
//         </>
//       )}
//     </Paper>
//   );
// };

// export default ArgoMap;







// import React, { useMemo } from 'react';
// import { Paper, Typography, Box, Chip } from '@mui/material';
// import { LocationOn as LocationIcon } from '@mui/icons-material';
// import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';

// // Fix default marker icons in bundlers
// import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
// import marker1x from 'leaflet/dist/images/marker-icon.png';
// import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: marker2x,
//   iconUrl: marker1x,
//   shadowUrl: markerShadow,
// });

// // Mock ARGO float data
// const argoFloats = [
//   { id: 'WMO_4901234', lat: 45.5, lng: -45.2, status: 'active', lastProfile: '2024-01-15', cycles: 342 },
//   { id: 'WMO_4901235', lat: 47.8, lng: -42.1, status: 'active', lastProfile: '2024-01-14', cycles: 289 },
//   { id: 'WMO_4901236', lat: 43.2, lng: -48.7, status: 'inactive', lastProfile: '2023-12-20', cycles: 156 },
//   { id: 'WMO_4901237', lat: 49.1, lng: -40.5, status: 'active', lastProfile: '2024-01-16', cycles: 401 },
//   { id: 'WMO_4901238', lat: 41.7, lng: -46.3, status: 'active', lastProfile: '2024-01-15', cycles: 278 },
// ];

// export type ProfileSample = { depth: number; temperature: number; salinity: number; pressure: number };

// interface ArgoMapProps {
//   region?: string;
//   onFloatSelect?: (floatId: string) => void;
//   onProfileGenerate?: (floatId: string, data: ProfileSample[]) => void;
// }

// const makeProfileForFloat = (floatId: string): ProfileSample[] => {
//   // Simple deterministic data based on id hash
//   const hash = floatId.split('').reduce((a, c) => (a + c.charCodeAt(0)) % 9973, 0);
//   const depths = [0, 10, 50, 100, 200, 500, 1000, 1500, 2000];
//   return depths.map((depth, i) => {
//     const temp = 28 - 0.02 * depth - ((hash % 7) * 0.1) - (i % 3) * 0.3;
//     const sal = 36.2 - 0.0005 * depth + ((hash % 5) * 0.02) + (i % 4) * 0.01;
//     return {
//       depth,
//       pressure: Number((depth / 10).toFixed(1)), // ~ dbar
//       temperature: Number(temp.toFixed(2)),
//       salinity: Number(sal.toFixed(2)),
//     };
//   });
// };

// const FitToFloats: React.FC = () => {
//   const map = useMap();
//   const bounds = useMemo(
//     () => L.latLngBounds(argoFloats.map((f) => [f.lat, f.lng] as [number, number])),
//     []
//   );
//   React.useEffect(() => {
//     if (bounds.isValid()) map.fitBounds(bounds.pad(0.25));
//   }, [bounds, map]);
//   return null;
// };

// const ArgoMap: React.FC<ArgoMapProps> = ({ region = 'North Atlantic', onFloatSelect, onProfileGenerate }) => {
//   return (
//     <Paper
//       elevation={2}
//       sx={{
//         p: 3,
//         height: '100%',
//         bgcolor: 'background.paper',
//         border: '1px solid',
//         borderColor: 'divider',
//       }}
//     >
//       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//           <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
//             <LocationIcon sx={{ fontSize: 20 }} />
//           </Box>
//           <div>
//             <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
//               ARGO Float Locations
//             </Typography>
//             <Typography variant="caption" sx={{ color: 'text.secondary' }}>
//               Click a float to plot its profile
//             </Typography>
//           </div>
//         </div>
//         <Chip
//           label={region}
//           size="small"
//           sx={{
//             bgcolor: 'primary.main',
//             color: 'primary.contrastText',
//             fontWeight: 500,
//           }}
//         />
//       </Box>

//       <Box sx={{ height: 500, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
//         <MapContainer style={{ height: '100%', width: '100%' }} center={[45.5, -45.2]} zoom={5} scrollWheelZoom>
//           <FitToFloats />
//           <TileLayer
//             attribution='&copy; OpenStreetMap contributors'
//             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           />
//           {argoFloats.map((float) => (
//             <Marker
//               key={float.id}
//               position={[float.lat, float.lng]}
//               eventHandlers={{
//                 click: () => {
//                   onFloatSelect?.(float.id);
//                   onProfileGenerate?.(float.id, makeProfileForFloat(float.id));
//                 },
//               }}
//             >
//               <Popup>
//                 <div style={{ fontFamily: 'system-ui', maxWidth: 220 }}>
//                   <div style={{ fontWeight: 600, marginBottom: 6 }}>{float.id}</div>
//                   <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
//                     Status:{' '}
//                     <span style={{ color: float.status === 'active' ? '#059669' : '#6b7280', fontWeight: 500 }}>
//                       {float.status}
//                     </span>
//                   </div>
//                   <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Last Profile: {float.lastProfile}</div>
//                   <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Cycles: {float.cycles}</div>
//                   <div style={{ fontSize: 12, color: '#6b7280' }}>
//                     Coordinates: {float.lat.toFixed(2)}°N, {Math.abs(float.lng).toFixed(2)}°W
//                   </div>
//                 </div>
//               </Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       </Box>
//     </Paper>
//   );
// };

// export default ArgoMap;







import React, { useMemo, useEffect, useState } from 'react';
import { Paper, Typography, Box, Chip, CircularProgress } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in bundlers
import marker2x from 'leaflet/dist/images/marker-icon-2x.png';
import marker1x from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
});

export type ProfileSample = { depth: number; temperature: number; salinity: number; pressure: number };

interface ArgoFloat {
  id: string;
  lat: number;
  lng: number;
  status: 'active' | 'inactive';
  lastProfile?: string;
  cycles?: number;
}

interface ArgoMapProps {
  region?: string;
  onFloatSelect?: (floatId: string) => void;
  onProfileGenerate?: (floatId: string, data: ProfileSample[]) => void;
}

const makeProfileForFloat = (floatId: string): ProfileSample[] => {
  // Simple deterministic data based on id hash
  const hash = floatId.split('').reduce((a, c) => (a + c.charCodeAt(0)) % 9973, 0);
  const depths = [0, 10, 50, 100, 200, 500, 1000, 1500, 2000];
  return depths.map((depth, i) => {
    const temp = 28 - 0.02 * depth - ((hash % 7) * 0.1) - (i % 3) * 0.3;
    const sal = 36.2 - 0.0005 * depth + ((hash % 5) * 0.02) + (i % 4) * 0.01;
    return {
      depth,
      pressure: Number((depth / 10).toFixed(1)), // ~ dbar
      temperature: Number(temp.toFixed(2)),
      salinity: Number(sal.toFixed(2)),
    };
  });
};

const FitToFloats: React.FC<{ floats: ArgoFloat[] }> = ({ floats }) => {
  const map = useMap();
  const bounds = useMemo(() => {
    if (floats.length === 0) return null;
    return L.latLngBounds(floats.map((f) => [f.lat, f.lng] as [number, number]));
  }, [floats]);

  React.useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds.pad(0.1));
    }
  }, [bounds, map]);

  return null;
};

const ArgoMap: React.FC<ArgoMapProps> = ({ region = 'Arabian Sea', onFloatSelect, onProfileGenerate }) => {
  const [argoFloats, setArgoFloats] = useState<ArgoFloat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/parameters/get-maps');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch map data: ${response.status}`);
        }

        const mapData = await response.json();
        
        // Transform the response into ArgoFloat format
        const floats: ArgoFloat[] = Object.entries(mapData).map(([profileName, coords]: [string, any]) => {
          // Extract float ID from profile name (e.g., "D6901587_073" -> "WMO_6901587")
          const floatMatch = profileName.match(/([DR])(\d+)_(\d+)/);
          const floatId = floatMatch ? `WMO_${floatMatch[2]}` : profileName;
          
          // Assign random status for demo purposes (in real app, this would come from data)
          const status: 'active' | 'inactive' = Math.random() > 0.2 ? 'active' : 'inactive';
          
          return {
            id: floatId,
            lat: coords.latitude,
            lng: coords.longitude,
            status,
            lastProfile: '2024-01-15', // Mock data - would come from actual profile dates
            cycles: Math.floor(Math.random() * 400) + 100, // Mock data
          };
        });

        // Remove duplicates based on float ID (keep first occurrence)
        const uniqueFloats = floats.filter((float, index, self) => 
          index === self.findIndex(f => f.id === float.id)
        );

        setArgoFloats(uniqueFloats);
        setError(null);
      } catch (err) {
        console.error('Failed to load map data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map data');
        setArgoFloats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // Calculate default center from loaded floats
  const mapCenter: [number, number] = useMemo(() => {
    if (argoFloats.length === 0) return [20.0, 65.0]; // Default to Arabian Sea
    
    const avgLat = argoFloats.reduce((sum, f) => sum + f.lat, 0) / argoFloats.length;
    const avgLng = argoFloats.reduce((sum, f) => sum + f.lng, 0) / argoFloats.length;
    return [avgLat, avgLng];
  }, [argoFloats]);

  const activeFloats = argoFloats.filter(f => f.status === 'active');
  const totalCycles = argoFloats.reduce((sum, f) => sum + (f.cycles || 0), 0);

  if (loading) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          height: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          Loading ARGO float locations...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        elevation={2}
        sx={{
          p: 3,
          height: '100%',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" color="error" gutterBottom>
          Failed to Load Map Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        height: '100%',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
            <LocationIcon sx={{ fontSize: 20 }} />
          </Box>
          <div>
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              ARGO Float Locations
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Click a float to plot its profile ({argoFloats.length} floats loaded)
            </Typography>
          </div>
        </div>
        <Chip
          label={region}
          size="small"
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 500,
          }}
        />
      </Box>

      <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <MapContainer style={{ height: '100%', width: '100%' }} center={mapCenter} zoom={6} scrollWheelZoom>
          <FitToFloats floats={argoFloats} />
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {argoFloats.map((float) => {
            // Create custom icon based on status
            const customIcon = new L.Icon({
              iconUrl: float.status === 'active' ? marker1x : marker1x,
              iconRetinaUrl: float.status === 'active' ? marker2x : marker2x,
              shadowUrl: markerShadow,
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
              className: float.status === 'active' ? 'active-float' : 'inactive-float'
            });

            return (
              <Marker
                key={float.id}
                position={[float.lat, float.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => {
                    onFloatSelect?.(float.id);
                    onProfileGenerate?.(float.id, makeProfileForFloat(float.id));
                  },
                }}
              >
                <Popup>
                  <div style={{ fontFamily: 'system-ui', maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>{float.id}</div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      Status:{' '}
                      <span style={{ color: float.status === 'active' ? '#059669' : '#6b7280', fontWeight: 500 }}>
                        {float.status}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      Last Profile: {float.lastProfile}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                      Cycles: {float.cycles}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      Coordinates: {float.lat.toFixed(3)}°N, {float.lng.toFixed(3)}°E
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6, fontStyle: 'italic' }}>
                      Click to generate profile
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </Box>

      {/* Statistics */}
      <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {activeFloats.length}
          </Typography>
          <Typography variant="caption">
            Active Floats
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {argoFloats.length}
          </Typography>
          <Typography variant="caption">
            Total Floats
          </Typography>
        </Box>
        <Box 
          sx={{ 
            p: 2, 
            borderRadius: 1, 
            bgcolor: 'info.main',
            color: 'info.contrastText',
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {totalCycles}
          </Typography>
          <Typography variant="caption">
            Total Cycles
          </Typography>
        </Box>
      </Box>

      {/* Add custom CSS for marker styling */}
      <style jsx>{`
        .active-float {
          filter: hue-rotate(0deg) brightness(1);
        }
        .inactive-float {
          filter: grayscale(70%) brightness(0.8);
        }
      `}</style>
    </Paper>
  );
};

export default ArgoMap;
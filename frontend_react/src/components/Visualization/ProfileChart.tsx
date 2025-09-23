// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
// import { Paper, Typography, Box, Chip } from '@mui/material';
// import { Thermostat, WaterDrop } from '@mui/icons-material';
// import DataExport from './DataExport';

// // Mock ARGO profile data
// const temperatureData = [
//   { depth: 0, temperature: 28.5, salinity: 36.2 },
//   { depth: 10, temperature: 28.3, salinity: 36.3 },
//   { depth: 50, temperature: 26.8, salinity: 36.5 },
//   { depth: 100, temperature: 22.1, salinity: 36.8 },
//   { depth: 200, temperature: 15.4, salinity: 35.9 },
//   { depth: 500, temperature: 8.2, salinity: 34.8 },
//   { depth: 1000, temperature: 4.1, salinity: 34.5 },
//   { depth: 1500, temperature: 2.8, salinity: 34.6 },
//   { depth: 2000, temperature: 2.1, salinity: 34.7 },
// ];

// interface ProfileChartProps {
//   dataType: 'temperature' | 'salinity' | 'both';
//   region?: string;
// }

// const ProfileChart: React.FC<ProfileChartProps> = ({ dataType, region = 'North Atlantic' }) => {
//   const getYAxisDomain = () => {
//     const maxDepth = Math.max(...temperatureData.map(d => d.depth));
//     return [0, maxDepth];
//   };

//   const formatYAxis = (value: number) => `${value}m`;
  
//   const formatTooltip = (value: number, name: string) => {
//     if (name === 'temperature') return [`${value}°C`, 'Temperature'];
//     if (name === 'salinity') return [`${value} PSU`, 'Salinity'];
//     return [value, name];
//   };

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             {dataType === 'temperature' ? (
//               <Thermostat className="w-5 h-5 text-primary" />
//             ) : dataType === 'salinity' ? (
//               <WaterDrop className="w-5 h-5 text-accent" />
//             ) : (
//               <Thermostat className="w-5 h-5 text-primary" />
//             )}
//           </div>
//           <div>
//             <Typography variant="h6" className="text-card-foreground font-semibold">
//               {dataType === 'temperature' ? 'Temperature' : 
//                dataType === 'salinity' ? 'Salinity' : 'Temperature & Salinity'} Profile
//             </Typography>
//             <Typography variant="caption" className="text-muted-foreground">
//               Depth vs {dataType === 'both' ? 'parameters' : dataType}
//             </Typography>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <Chip 
//             label={region} 
//             size="small" 
//             className="bg-secondary text-secondary-foreground"
//           />
//           <DataExport 
//             data={temperatureData} 
//             filename={`argo_${dataType}_profile_${region.toLowerCase().replace(/\s+/g, '_')}`}
//           />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={temperatureData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            
//             {/* Inverted Y-axis for depth */}
//             <YAxis
//               domain={getYAxisDomain()}
//               reversed
//               tickFormatter={formatYAxis}
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//               label={{ value: 'Depth (m)', angle: -90, position: 'insideLeft' }}
//             />
            
//             {dataType === 'temperature' || dataType === 'both' ? (
//               <XAxis
//                 dataKey="temperature"
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ value: 'Temperature (°C)', position: 'insideBottom', offset: -10 }}
//               />
//             ) : (
//               <XAxis
//                 dataKey="salinity"
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ value: 'Salinity (PSU)', position: 'insideBottom', offset: -10 }}
//               />
//             )}
            
//             <Tooltip
//               formatter={formatTooltip}
//               labelFormatter={(value) => `Depth: ${value}m`}
//               contentStyle={{
//                 backgroundColor: 'hsl(var(--popover))',
//                 border: '1px solid hsl(var(--border))',
//                 borderRadius: '8px',
//                 color: 'hsl(var(--popover-foreground))',
//               }}
//             />
            
//             <Legend />
            
//             {(dataType === 'temperature' || dataType === 'both') && (
//               <Line
//                 type="monotone"
//                 dataKey="temperature"
//                 stroke="hsl(var(--primary))"
//                 strokeWidth={3}
//                 dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
//                 name="Temperature"
//               />
//             )}
            
//             {(dataType === 'salinity' || dataType === 'both') && (
//               <Line
//                 type="monotone"
//                 dataKey="salinity"
//                 stroke="hsl(var(--accent))"
//                 strokeWidth={3}
//                 dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
//                 name="Salinity"
//               />
//             )}
//           </LineChart>
//         </ResponsiveContainer>
//       </Box>

//       <Box className="mt-4 grid grid-cols-3 gap-4 text-center">
//         <div className="p-3 rounded-lg bg-primary/5">
//           <Typography variant="h6" className="text-primary">
//             28.5°C
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Surface Temp
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-accent/10">
//           <Typography variant="h6" className="text-accent">
//             2000m
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Max Depth
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-secondary/20">
//           <Typography variant="h6" className="text-secondary-foreground">
//             36.2 PSU
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Surface Salinity
//           </Typography>
//         </div>
//       </Box>
//     </Paper>
//   );
// };

// export default ProfileChart;










// import React, { useMemo, useState } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts';
// import {
//   Paper,
//   Typography,
//   Box,
//   Chip,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem
// } from '@mui/material';
// import { Thermostat, WaterDrop, Speed } from '@mui/icons-material';
// import DataExport from './DataExport';

// // Mock ARGO profile data
// const baseData = [
//   { depth: 0,    temperature: 28.5, salinity: 36.2 },
//   { depth: 10,   temperature: 28.3, salinity: 36.3 },
//   { depth: 50,   temperature: 26.8, salinity: 36.5 },
//   { depth: 100,  temperature: 22.1, salinity: 36.8 },
//   { depth: 200,  temperature: 15.4, salinity: 35.9 },
//   { depth: 500,  temperature: 8.2,  salinity: 34.8 },
//   { depth: 1000, temperature: 4.1,  salinity: 34.5 },
//   { depth: 1500, temperature: 2.8,  salinity: 34.6 },
//   { depth: 2000, temperature: 2.1,  salinity: 34.7 },
// ];

// // Add approximate pressure (dbar ~ depth/10)
// const profileData = baseData.map(d => ({
//   ...d,
//   pressure: Number((d.depth / 10).toFixed(1)),
// }));

// type PlotType =
//   | 'temp-depth'
//   | 'sal-depth'
//   | 'pres-depth'
//   | 'temp-sal'
//   | 'sal-pres'
//   | 'pres-temp';

// interface ProfileChartProps {
//   dataType: 'temperature' | 'salinity' | 'both';
//   region?: string;
// }

// const units: Record<string, string> = {
//   temperature: '°C',
//   salinity: 'PSU',
//   depth: 'm',
//   pressure: 'dbar',
// };

// const labelMap: Record<string, string> = {
//   temperature: 'Temperature',
//   salinity: 'Salinity',
//   depth: 'Depth',
//   pressure: 'Pressure',
// };

// const iconFor = (key: string) => {
//   if (key === 'temperature') return <Thermostat className="w-5 h-5 text-primary" />;
//   if (key === 'salinity') return <WaterDrop className="w-5 h-5 text-accent" />;
//   return <Speed className="w-5 h-5 text-muted-foreground" />;
// };

// const ProfileChart: React.FC<ProfileChartProps> = ({ region = 'North Atlantic' }) => {
//   const [plotType, setPlotType] = useState<PlotType>('temp-depth');

//   const { xKey, yKey, xLabel, yLabel, yReversed, yDomain } = useMemo(() => {
//     switch (plotType) {
//       case 'temp-depth':
//         return {
//           xKey: 'temperature',
//           yKey: 'depth',
//           xLabel: `Temperature (${units.temperature})`,
//           yLabel: `Depth (${units.depth})`,
//           // yReversed: true,
//           yReversed: false,
//           yDomain: [0, Math.max(...profileData.map(d => d.depth))],
//         };
//       case 'sal-depth':
//         return {
//           xKey: 'salinity',
//           yKey: 'depth',
//           xLabel: `Salinity (${units.salinity})`,
//           yLabel: `Depth (${units.depth})`,
//           yReversed: false,
//           yDomain: [0, Math.max(...profileData.map(d => d.depth))],
//         };
//       case 'pres-depth':
//         // Not a common plot; interpreted as X=Pressure, Y=Depth
//         return {
//           xKey: 'pressure',
//           yKey: 'depth',
//           xLabel: `Pressure (${units.pressure})`,
//           yLabel: `Depth (${units.depth})`,
//           yReversed: false,
//           yDomain: [0, Math.max(...profileData.map(d => d.depth))],
//         };
//       case 'temp-sal':
//         return {
//           xKey: 'temperature',
//           yKey: 'salinity',
//           xLabel: `Temperature (${units.temperature})`,
//           yLabel: `Salinity (${units.salinity})`,
//           yReversed: false,
//           yDomain: ['auto', 'auto'] as any,
//         };
//       case 'sal-pres':
//         return {
//           xKey: 'salinity',
//           yKey: 'pressure',
//           xLabel: `Salinity (${units.salinity})`,
//           yLabel: `Pressure (${units.pressure})`,
//           yReversed: false,
//           yDomain: [0, Math.max(...profileData.map(d => d.pressure))],
//         };
//       case 'pres-temp':
//         return {
//           xKey: 'pressure',
//           yKey: 'temperature',
//           xLabel: `Pressure (${units.pressure})`,
//           yLabel: `Temperature (${units.temperature})`,
//           yReversed: false,
//           yDomain: ['auto', 'auto'] as any,
//         };
//       default:
//         return {
//           xKey: 'temperature',
//           yKey: 'depth',
//           xLabel: `Temperature (${units.temperature})`,
//           yLabel: `Depth (${units.depth})`,
//           yReversed: true,
//           yDomain: [0, Math.max(...profileData.map(d => d.depth))],
//         };
//     }
//   }, [plotType]);

//   const title = `${labelMap[xKey]} vs ${labelMap[yKey]}`;

//   const tooltipFormatter = (value: any, name: string) => {
//     const unit = units[name] || '';
//     return [`${value} ${unit}`.trim(), labelMap[name] || name];
//   };

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             {iconFor(xKey)}
//           </div>
//           <div>
//             <Typography variant="h6" className="text-card-foreground font-semibold">
//               {title}
//             </Typography>
//             <Typography variant="caption" className="text-muted-foreground">
//               Profile/relationship view
//             </Typography>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <FormControl size="small" className="min-w-[220px]">
//             <InputLabel id="plot-type-label">Plot</InputLabel>
//             <Select
//               labelId="plot-type-label"
//               value={plotType}
//               label="Plot"
//               onChange={(e) => setPlotType(e.target.value as PlotType)}
//             >
//               <MenuItem value="temp-depth">Temperature vs Depth</MenuItem>
//               <MenuItem value="sal-depth">Salinity vs Depth</MenuItem>
//               <MenuItem value="pres-depth">Pressure vs Depth</MenuItem>
//               <MenuItem value="temp-sal">Temperature vs Salinity</MenuItem>
//               <MenuItem value="sal-pres">Salinity vs Pressure</MenuItem>
//               <MenuItem value="pres-temp">Pressure vs Temperature</MenuItem>
//             </Select>
//           </FormControl>

//           <Chip
//             label={region}
//             size="small"
//             className="bg-secondary text-secondary-foreground"
//           />
//           <DataExport
//             data={profileData}
//             filename={`argo_${title.toLowerCase().replace(/\s+/g, '_')}_${region.toLowerCase().replace(/\s+/g, '_')}`}
//           />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart
//             data={profileData}
//             margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
//           >
//             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />

//             <XAxis
//               dataKey={xKey}
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//               label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
//               type="number"
//             />

//             <YAxis
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//               label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
//               reversed={yReversed}
//               domain={yDomain as any}
//               type="number"
//             />

//             <Tooltip
//               formatter={tooltipFormatter}
//               labelFormatter={(val) => `${labelMap[xKey]}: ${val} ${units[xKey] || ''}`.trim()}
//               contentStyle={{
//                 backgroundColor: 'hsl(var(--popover))',
//                 border: '1px solid hsl(var(--border))',
//                 borderRadius: '8px',
//                 color: 'hsl(var(--popover-foreground))',
//               }}
//             />

//             {/* Single series: Y = yKey, X = xKey (configured on axes) */}
//             <Line
//               type="monotone"
//               dataKey={yKey}
//               stroke="hsl(var(--primary))"
//               strokeWidth={3}
//               dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
//               isAnimationActive={false}
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </Box>

//       <Box className="mt-4 grid grid-cols-3 gap-4 text-center">
//         <div className="p-3 rounded-lg bg-primary/5">
//           <Typography variant="h6" className="text-primary">
//             {profileData[0].temperature}°C
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Surface Temp
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-accent/10">
//           <Typography variant="h6" className="text-accent">
//             {Math.max(...profileData.map(d => d.depth))}m
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Max Depth
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-secondary/20">
//           <Typography variant="h6" className="text-secondary-foreground">
//             {profileData[0].salinity} PSU
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Surface Salinity
//           </Typography>
//         </div>
//       </Box>
//     </Paper>
//   );
// };

// export default ProfileChart;










import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Paper,
  Typography,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Thermostat, WaterDrop, Speed } from '@mui/icons-material';
import DataExport from './DataExport';

type ProfileSample = { depth: number; temperature: number; salinity: number; pressure: number };

interface ProfileChartProps {
  dataType: 'temperature' | 'salinity' | 'both';
  region?: string;
  data?: ProfileSample[];
}

// Default mock data if none provided
const baseData: ProfileSample[] = [
  { depth: 0,    temperature: 28.5, salinity: 36.2, pressure: 0.0 },
  { depth: 10,   temperature: 28.3, salinity: 36.3, pressure: 1.0 },
  { depth: 50,   temperature: 26.8, salinity: 36.5, pressure: 5.0 },
  { depth: 100,  temperature: 22.1, salinity: 36.8, pressure: 10.0 },
  { depth: 200,  temperature: 15.4, salinity: 35.9, pressure: 20.0 },
  { depth: 500,  temperature: 8.2,  salinity: 34.8, pressure: 50.0 },
  { depth: 1000, temperature: 4.1,  salinity: 34.5, pressure: 100.0 },
  { depth: 1500, temperature: 2.8,  salinity: 34.6, pressure: 150.0 },
  { depth: 2000, temperature: 2.1,  salinity: 34.7, pressure: 200.0 },
];

type PlotType =
  | 'temp-depth'
  | 'sal-depth'
  | 'pres-depth'
  | 'temp-sal'
  | 'sal-pres'
  | 'pres-temp';

const units: Record<string, string> = {
  temperature: '°C',
  salinity: 'PSU',
  depth: 'm',
  pressure: 'dbar',
};

const labelMap: Record<string, string> = {
  temperature: 'Temperature',
  salinity: 'Salinity',
  depth: 'Depth',
  pressure: 'Pressure',
};

const iconFor = (key: string) => {
  if (key === 'temperature') return <Thermostat className="w-5 h-5 text-primary" />;
  if (key === 'salinity') return <WaterDrop className="w-5 h-5 text-accent" />;
  return <Speed className="w-5 h-5 text-muted-foreground" />;
};

const ProfileChart: React.FC<ProfileChartProps> = ({ dataType, region = 'North Atlantic', data }) => {
  const plotData = (data?.length ? data : baseData).map((d) => ({
    ...d,
    pressure: d.pressure ?? Number((d.depth / 10).toFixed(1)),
  }));

  const [plotType, setPlotType] = useState<PlotType>('temp-depth');

  const { xKey, yKey, xLabel, yLabel, yReversed, yDomain } = useMemo(() => {
    switch (plotType) {
      case 'temp-depth':
        return { xKey: 'temperature', yKey: 'depth', xLabel: `Temperature (${units.temperature})`, yLabel: `Depth (${units.depth})`, yReversed: false, yDomain: [0, Math.max(...plotData.map(d => d.depth))] };
      case 'sal-depth':
        return { xKey: 'salinity', yKey: 'depth', xLabel: `Salinity (${units.salinity})`, yLabel: `Depth (${units.depth})`, yReversed: false, yDomain: [0, Math.max(...plotData.map(d => d.depth))] };
      case 'pres-depth':
        return { xKey: 'pressure', yKey: 'depth', xLabel: `Pressure (${units.pressure})`, yLabel: `Depth (${units.depth})`, yReversed: false, yDomain: [0, Math.max(...plotData.map(d => d.depth))] };
      case 'temp-sal':
        return { xKey: 'temperature', yKey: 'salinity', xLabel: `Temperature (${units.temperature})`, yLabel: `Salinity (${units.salinity})`, yReversed: false, yDomain: ['auto', 'auto'] as any };
      case 'sal-pres':
        return { xKey: 'salinity', yKey: 'pressure', xLabel: `Salinity (${units.salinity})`, yLabel: `Pressure (${units.pressure})`, yReversed: false, yDomain: [0, Math.max(...plotData.map(d => d.pressure))] };
      case 'pres-temp':
        return { xKey: 'pressure', yKey: 'temperature', xLabel: `Pressure (${units.pressure})`, yLabel: `Temperature (${units.temperature})`, yReversed: false, yDomain: ['auto', 'auto'] as any };
      default:
        return { xKey: 'temperature', yKey: 'depth', xLabel: `Temperature (${units.temperature})`, yLabel: `Depth (${units.depth})`, yReversed: false, yDomain: [0, Math.max(...plotData.map(d => d.depth))] };
    }
  }, [plotType, plotData]);

  const title = `${labelMap[xKey]} vs ${labelMap[yKey]}`;
  const tooltipFormatter = (value: any, name: string) => {
    const unit = units[name] || '';
    return [`${value} ${unit}`.trim(), labelMap[name] || name];
  };

  return (
    <Paper elevation={2} className="p-6 h-full bg-card">
      <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {iconFor(xKey)}
          </div>
          <div>
            <Typography variant="h6" className="text-card-foreground font-semibold">
              {title}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              Profile/relationship view
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FormControl size="small" className="min-w-[220px]">
            <InputLabel id="plot-type-label">Plot</InputLabel>
            <Select labelId="plot-type-label" value={plotType} label="Plot" onChange={(e) => setPlotType(e.target.value as PlotType)}>
              <MenuItem value="temp-depth">Temperature vs Depth</MenuItem>
              <MenuItem value="sal-depth">Salinity vs Depth</MenuItem>
              <MenuItem value="pres-depth">Pressure vs Depth</MenuItem>
              <MenuItem value="temp-sal">Temperature vs Salinity</MenuItem>
              <MenuItem value="sal-pres">Salinity vs Pressure</MenuItem>
              <MenuItem value="pres-temp">Pressure vs Temperature</MenuItem>
            </Select>
          </FormControl>

          <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
          <DataExport
            data={plotData}
            filename={`argo_${title.toLowerCase().replace(/\s+/g, '_')}_${region.toLowerCase().replace(/\s+/g, '_')}`}
          />
        </div>
      </Box>

      <Box className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plotData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey={xKey} stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: xLabel, position: 'insideBottom', offset: -10 }} type="number" />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} reversed={yReversed} domain={yDomain as any} type="number" />
            <Tooltip
              formatter={tooltipFormatter}
              labelFormatter={(val) => `${labelMap[xKey]}: ${val} ${units[xKey] || ''}`.trim()}
              contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
            />
            <Line type="monotone" dataKey={yKey} stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default ProfileChart;
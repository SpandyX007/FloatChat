// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Tabs,
//   Tab,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Container
// } from '@mui/material';
// import {
//   Science as ScienceIcon,
//   Waves as WavesIcon,
//   Timeline as TimelineIcon,
//   Map as MapIcon,
//   Info as InfoIcon
// } from '@mui/icons-material';
// import { cn } from '@/lib/utils';
// import ChatInterface from '../Chat/ChatInterface';
// import ProfileChart from '../Visualization/ProfileChart';
// import ArgoMap from '../Visualization/ArgoMap';
// import ProfileInfo from '../Visualization/ProfileInfo';
// import oceanHeroBg from '@/assets/ocean-hero-bg.jpg';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`visualization-tabpanel-${index}`}
//       aria-labelledby={`visualization-tab-${index}`}
//       className="h-full"
//     >
//       {value === index && (
//         <Box className="h-full p-4">
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// };

// const OceanDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState(0);
//   const [currentDataType, setCurrentDataType] = useState<'temperature' | 'salinity' | 'both'>('temperature');
//   const [selectedRegion, setSelectedRegion] = useState('North Atlantic');

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };

//   const handleDataQuery = (query: string) => {
//     const lowerQuery = query.toLowerCase();

//     // Simple query parsing to update visualizations
//     if (lowerQuery.includes('temperature') && lowerQuery.includes('salinity')) {
//       setCurrentDataType('both');
//     } else if (lowerQuery.includes('temperature')) {
//       setCurrentDataType('temperature');
//     } else if (lowerQuery.includes('salinity')) {
//       setCurrentDataType('salinity');
//     }

//     // Extract region information
//     if (lowerQuery.includes('atlantic')) {
//       setSelectedRegion('North Atlantic');
//     } else if (lowerQuery.includes('pacific')) {
//       setSelectedRegion('Pacific Ocean');
//     } else if (lowerQuery.includes('indian')) {
//       setSelectedRegion('Indian Ocean');
//     } else if (lowerQuery.includes('mediterranean')) {
//       setSelectedRegion('Mediterranean Sea');
//     }

//     // Auto-switch to appropriate tab
//     if (lowerQuery.includes('map') || lowerQuery.includes('location')) {
//       setActiveTab(1);
//     } else if (lowerQuery.includes('profile') || lowerQuery.includes('depth')) {
//       setActiveTab(0);
//     } else if (lowerQuery.includes('info') || lowerQuery.includes('metadata')) {
//       setActiveTab(2);
//     }
//   };

//   const handleFloatSelect = (floatId: string) => {
//     console.log('Selected float:', floatId);
//     // This would trigger updates to show data for the selected float
//   };

//   return (
//     // <div className="h-screen bg-background">
//     //   {/* Header */}
//     //   <AppBar 
//     //     position="static" 
//     //     elevation={0}
//     //     className="bg-gradient-ocean border-b border-border"
//     //   >
//     //     <Toolbar>
//     //       <div className="flex items-center gap-3 flex-1">
//     //         <div className="p-2 rounded-lg bg-primary-foreground/10">
//     //           <WavesIcon className="w-8 h-8 text-primary-foreground" />
//     //         </div>
//     //         <div>
//     //           <Typography variant="h5" className="text-primary-foreground font-bold">
//     //             ARGO Ocean Explorer
//     //           </Typography>
//     //           <Typography variant="body2" className="text-primary-foreground/70">
//     //             Oceanographic Data Visualization & Analysis
//     //           </Typography>
//     //         </div>
//     //       </div>
//     //     </Toolbar>
//     //   </AppBar>
//     <div className="h-screen bg-background flex flex-col">
//       {/* Header */}
//       <AppBar
//         position="static"
//         elevation={0}
//         className="bg-gradient-ocean border-b border-border"
//       >
//         <Toolbar variant="dense" className="justify-center" sx={{ minHeight: 48 }}>
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-primary-foreground/10">
//               <WavesIcon className="w-8 h-8 text-primary-foreground" />
//             </div>
//             <div>
//               <Typography variant="h5" className="text-primary-foreground font-bold">
//                 ARGO Ocean Explorer
//               </Typography>
//               <Typography variant="body2" className="text-primary-foreground/70">
//                 Oceanographic Data Visualization & Analysis
//               </Typography>
//             </div>
//           </div>
//         </Toolbar>
//       </AppBar>

//       {/* Main Content */}
//       <div className="h-[calc(100vh-80px)] flex">
//         {/* Chat Panel - Left Side (30%) */}
//         <div className="w-[30%] border-r border-border bg-card">
//           <ChatInterface onDataQuery={handleDataQuery} />
//         </div>

//         {/* Visualization Panel - Right Side (70%) */}
//         <div className="w-[70%] flex flex-col bg-background">
//           {/* Visualization Tabs */}
//           <Paper
//             elevation={0}
//             className="border-b border-border"
//           >
//             <Tabs
//               value={activeTab}
//               onChange={handleTabChange}
//               aria-label="visualization tabs"
//               className="px-4"
//               sx={{
//                 '& .MuiTab-root': {
//                   color: 'hsl(var(--muted-foreground))',
//                   fontWeight: 500,
//                   '&.Mui-selected': {
//                     color: 'hsl(var(--primary))',
//                   },
//                 },
//                 '& .MuiTabs-indicator': {
//                   backgroundColor: 'hsl(var(--primary))',
//                   height: 3,
//                 },
//               }}
//             >
//               <Tab
//                 icon={<TimelineIcon />}
//                 label="Profiles"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//               <Tab
//                 icon={<MapIcon />}
//                 label="Map"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//               <Tab
//                 icon={<InfoIcon />}
//                 label="Info"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//             </Tabs>
//           </Paper>

//           {/* Tab Content */}
//           <div className="flex-1">
//             <TabPanel value={activeTab} index={0}>
//               <ProfileChart
//                 dataType={currentDataType}
//                 region={selectedRegion}
//               />
//             </TabPanel>

//             <TabPanel value={activeTab} index={1}>
//               <ArgoMap
//                 region={selectedRegion}
//                 onFloatSelect={handleFloatSelect}
//               />
//             </TabPanel>

//             <TabPanel value={activeTab} index={2}>
//               <ProfileInfo />
//             </TabPanel>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OceanDashboard;



// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Tabs,
//   Tab,
//   AppBar,
//   Toolbar,
//   Typography,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider
// } from '@mui/material';
// import {
//   Waves as WavesIcon,
//   Timeline as TimelineIcon,
//   Map as MapIcon,
//   Info as InfoIcon
// } from '@mui/icons-material';
// import ChatInterface from '../Chat/ChatInterface';
// import ProfileChart from '../Visualization/ProfileChart';
// import ArgoMap from '../Visualization/ArgoMap';
// import ProfileInfo from '../Visualization/ProfileInfo';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`visualization-tabpanel-${index}`}
//       aria-labelledby={`visualization-tab-${index}`}
//       className="h-full"
//     >
//       {value === index && (
//         <Box className="h-full p-4">
//           {children}
//         </Box>
//       )}
//     </div>
//   );
// };

// const OceanDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState(0);
//   const [currentDataType, setCurrentDataType] = useState<'temperature' | 'salinity' | 'both'>('temperature');
//   const [selectedRegion, setSelectedRegion] = useState('North Atlantic');

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };

//   const handleDataQuery = (query: string) => {
//     const lowerQuery = query.toLowerCase();

//     // Simple query parsing to update visualizations
//     if (lowerQuery.includes('temperature') && lowerQuery.includes('salinity')) {
//       setCurrentDataType('both');
//     } else if (lowerQuery.includes('temperature')) {
//       setCurrentDataType('temperature');
//     } else if (lowerQuery.includes('salinity')) {
//       setCurrentDataType('salinity');
//     }

//     // Extract region information
//     if (lowerQuery.includes('atlantic')) {
//       setSelectedRegion('North Atlantic');
//     } else if (lowerQuery.includes('pacific')) {
//       setSelectedRegion('Pacific Ocean');
//     } else if (lowerQuery.includes('indian')) {
//       setSelectedRegion('Indian Ocean');
//     } else if (lowerQuery.includes('mediterranean')) {
//       setSelectedRegion('Mediterranean Sea');
//     }

//     // Auto-switch to appropriate tab
//     if (lowerQuery.includes('map') || lowerQuery.includes('location')) {
//       setActiveTab(1);
//     } else if (lowerQuery.includes('profile') || lowerQuery.includes('depth')) {
//       setActiveTab(0);
//     } else if (lowerQuery.includes('info') || lowerQuery.includes('metadata')) {
//       setActiveTab(2);
//     }
//   };

//   const handleFloatSelect = (floatId: string) => {
//     console.log('Selected float:', floatId);
//     // This would trigger updates to show data for the selected float
//   };

//   return (
//     <div className="h-screen bg-background flex flex-col">
//       {/* Header */}
//       <AppBar
//         position="static"
//         elevation={0}
//         className="bg-gradient-ocean border-b border-border"
//       >
//         <Toolbar variant="dense" className="justify-center" sx={{ minHeight: 48 }}>
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-primary-foreground/10">
//               <WavesIcon className="w-8 h-8 text-primary-foreground" />
//             </div>
//             <div>
//               <Typography variant="h5" className="text-primary-foreground font-bold">
//                 ARGO Ocean Explorer
//               </Typography>
//               <Typography variant="body2" className="text-primary-foreground/70">
//                 Oceanographic Data Visualization & Analysis
//               </Typography>
//             </div>
//           </div>
//         </Toolbar>
//       </AppBar>

//       {/* Main Content */}
//       <div className="flex flex-1 min-h-0">
//         {/* Sidebar - Left */}
//         <Paper elevation={0} className="w-64 border-r border-border bg-card flex flex-col">
//           <Box className="p-4">
//             <Typography variant="subtitle2" className="opacity-80">Navigation</Typography>
//           </Box>
//           <Divider />
//           <List dense>
//             <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
//               <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
//               <ListItemText primary="Profiles" />
//             </ListItemButton>
//             <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
//               <ListItemIcon><MapIcon fontSize="small" /></ListItemIcon>
//               <ListItemText primary="Map" />
//             </ListItemButton>
//             <ListItemButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
//               <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
//               <ListItemText primary="Info" />
//             </ListItemButton>
//           </List>
//         </Paper>

//         {/* Visualization - Center */}
//         <div className="flex-1 flex flex-col bg-background min-w-0">
//           {/* Visualization Tabs */}
//           <Paper
//             elevation={0}
//             className="border-b border-border"
//           >
//             <Tabs
//               value={activeTab}
//               onChange={handleTabChange}
//               aria-label="visualization tabs"
//               className="px-4"
//               sx={{
//                 '& .MuiTab-root': {
//                   color: 'hsl(var(--muted-foreground))',
//                   fontWeight: 500,
//                   '&.Mui-selected': {
//                     color: 'hsl(var(--primary))',
//                   },
//                 },
//                 '& .MuiTabs-indicator': {
//                   backgroundColor: 'hsl(var(--primary))',
//                   height: 3,
//                 },
//               }}
//             >
//               <Tab
//                 icon={<TimelineIcon />}
//                 label="Profiles"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//               <Tab
//                 icon={<MapIcon />}
//                 label="Map"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//               <Tab
//                 icon={<InfoIcon />}
//                 label="Info"
//                 iconPosition="start"
//                 className="text-sm"
//               />
//             </Tabs>
//           </Paper>

//           {/* Tab Content */}
//           <div className="flex-1 min-h-0">
//             <TabPanel value={activeTab} index={0}>
//               <ProfileChart
//                 dataType={currentDataType}
//                 region={selectedRegion}
//               />
//             </TabPanel>

//             <TabPanel value={activeTab} index={1}>
//               <ArgoMap
//                 region={selectedRegion}
//                 onFloatSelect={handleFloatSelect}
//               />
//             </TabPanel>

//             <TabPanel value={activeTab} index={2}>
//               <ProfileInfo />
//             </TabPanel>
//           </div>
//         </div>

//         {/* Chat - Right */}
//         <div className="w-[30%] min-w-[280px] max-w-[480px] border-l border-border bg-card">
//           <ChatInterface onDataQuery={handleDataQuery} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OceanDashboard;










// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Tabs,
//   Tab,
//   AppBar,
//   Toolbar,
//   Typography,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider
// } from '@mui/material';
// import {
//   Waves as WavesIcon,
//   Timeline as TimelineIcon,
//   Map as MapIcon,
//   Info as InfoIcon
// } from '@mui/icons-material';
// import ChatInterface from '../Chat/ChatInterface';
// import ProfileChart from '../Visualization/ProfileChart';
// import ArgoMap from '../Visualization/ArgoMap';
// import ProfileInfo from '../Visualization/ProfileInfo';
// import SurfaceParamsChart from '../Visualization/SurfaceParamsChart';

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: number;
//   value: number;
// }

// const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`visualization-tabpanel-${index}`}
//       aria-labelledby={`visualization-tab-${index}`}
//       className="h-full"
//     >
//       {value === index && <Box className="h-full p-4">{children}</Box>}
//     </div>
//   );
// };

// // Match the data shape passed from the map into the chart
// type ProfileSample = { depth: number; temperature: number; salinity: number; pressure: number };

// const OceanDashboard: React.FC = () => {
//   const [activeTab, setActiveTab] = useState(0);
//   const [currentDataType, setCurrentDataType] = useState<'temperature' | 'salinity' | 'both'>('temperature');
//   const [selectedRegion, setSelectedRegion] = useState('North Atlantic');
//   const [profileData, setProfileData] = useState<ProfileSample[] | null>(null);

//   const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
//     setActiveTab(newValue);
//   };

//   const handleDataQuery = (query: string) => {
//     const lowerQuery = query.toLowerCase();

//     if (lowerQuery.includes('temperature') && lowerQuery.includes('salinity')) {
//       setCurrentDataType('both');
//     } else if (lowerQuery.includes('temperature')) {
//       setCurrentDataType('temperature');
//     } else if (lowerQuery.includes('salinity')) {
//       setCurrentDataType('salinity');
//     }

//     if (lowerQuery.includes('atlantic')) {
//       setSelectedRegion('North Atlantic');
//     } else if (lowerQuery.includes('pacific')) {
//       setSelectedRegion('Pacific Ocean');
//     } else if (lowerQuery.includes('indian')) {
//       setSelectedRegion('Indian Ocean');
//     } else if (lowerQuery.includes('mediterranean')) {
//       setSelectedRegion('Mediterranean Sea');
//     }

//     if (lowerQuery.includes('map') || lowerQuery.includes('location')) {
//       setActiveTab(1);
//     } else if (lowerQuery.includes('profile') || lowerQuery.includes('depth')) {
//       setActiveTab(0);
//     } else if (lowerQuery.includes('info') || lowerQuery.includes('metadata')) {
//       setActiveTab(2);
//     }
//   };

//   const handleFloatSelect = (floatId: string) => {
//     console.log('Selected float:', floatId);
//   };

//   const handleProfileGenerate = (floatId: string, data: ProfileSample[]) => {
//     setProfileData(data);
//     setActiveTab(0); // switch to Profiles tab to show the generated plot
//   };

//   return (
//     <div className="h-screen bg-background flex flex-col">
//       {/* Header */}
//       <AppBar position="static" elevation={0} className="bg-gradient-ocean border-b border-border">
//         <Toolbar variant="dense" className="justify-center" sx={{ minHeight: 48 }}>
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-primary-foreground/10">
//               <WavesIcon className="w-8 h-8 text-primary-foreground" />
//             </div>
//             <div>
//               <Typography variant="h5" className="text-primary-foreground font-bold">
//                 FLOATCHAT 
//               </Typography>
//               <Typography variant="body2" className="text-primary-foreground/70">
//                 Argo Profiles Data Visualization & Analysis
//               </Typography>
//             </div>
//           </div>
//         </Toolbar>
//       </AppBar>

//       {/* Main Content */}
//       <div className="flex flex-1 min-h-0">
//         {/* Sidebar - Left */}
//         <Paper elevation={0} className="w-64 border-r border-border bg-card flex flex-col">
//           <Box className="p-4">
//             <Typography variant="subtitle2" className="opacity-80">
//               Navigation
//             </Typography>
//           </Box>
//           <Divider />
//           <List dense>
//             <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
//               <ListItemIcon>
//                 <TimelineIcon fontSize="small" />
//               </ListItemIcon>
//               <ListItemText primary="Profiles" />
//             </ListItemButton>
//             <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
//               <ListItemIcon>
//                 <MapIcon fontSize="small" />
//               </ListItemIcon>
//               <ListItemText primary="Map" />
//             </ListItemButton>
//             <ListItemButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
//               <ListItemIcon>
//                 <InfoIcon fontSize="small" />
//               </ListItemIcon>
//               <ListItemText primary="Info" />
//             </ListItemButton>
//           </List>
//         </Paper>

//         {/* Visualization - Center */}
//         <div className="flex-1 flex flex-col bg-background min-w-0">
//           {/* Visualization Tabs */}
//           <Paper elevation={0} className="border-b border-border">
//             <Tabs
//               value={activeTab}
//               onChange={handleTabChange}
//               aria-label="visualization tabs"
//               className="px-4"
//               sx={{
//                 '& .MuiTab-root': {
//                   color: 'hsl(var(--muted-foreground))',
//                   fontWeight: 500,
//                   '&.Mui-selected': {
//                     color: 'hsl(var(--primary))'
//                   }
//                 },
//                 '& .MuiTabs-indicator': {
//                   backgroundColor: 'hsl(var(--primary))',
//                   height: 3
//                 }
//               }}
//             >
//               <Tab icon={<TimelineIcon />} label="Profiles" iconPosition="start" className="text-sm" />
//               <Tab icon={<MapIcon />} label="Map" iconPosition="start" className="text-sm" />
//               <Tab icon={<InfoIcon />} label="Info" iconPosition="start" className="text-sm" />
//             </Tabs>
//           </Paper>

//           {/* Tab Content */}
//           <div className="flex-1 min-h-0">
//             <TabPanel value={activeTab} index={0}>
//               {/* <ProfileChart dataType={currentDataType} region={selectedRegion} data={profileData ?? undefined} /> */}
//               <SurfaceParamsChart region={selectedRegion} />
//             </TabPanel>

//             <TabPanel value={activeTab} index={1}>
//               <ArgoMap region={selectedRegion} onFloatSelect={handleFloatSelect} onProfileGenerate={handleProfileGenerate} />
//             </TabPanel>

//             <TabPanel value={activeTab} index={2}>
//               <ProfileInfo />
//             </TabPanel>
//           </div>
//         </div>

//         {/* Chat - Right */}
//         <div className="w-[30%] min-w-[280px] max-w-[480px] border-l border-border bg-card">
//           <ChatInterface onDataQuery={handleDataQuery} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OceanDashboard;







import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Waves as WavesIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import ChatInterface from '../Chat/ChatInterface';
import ProfileChart from '../Visualization/ProfileChart';
import ArgoMap from '../Visualization/ArgoMap';
import ProfileInfo from '../Visualization/ProfileInfo';
import SurfaceParamsChart from '../Visualization/SurfaceParamsChart';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`visualization-tabpanel-${index}`}
      aria-labelledby={`visualization-tab-${index}`}
      className="h-full"
    >
      {value === index && <Box className="h-full p-4">{children}</Box>}
    </div>
  );
};

// Match the data shape passed from the map into the chart
type ProfileSample = { depth: number; temperature: number; salinity: number; pressure: number };

const OceanDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentDataType, setCurrentDataType] = useState<'temperature' | 'salinity' | 'both'>('temperature');
  const [selectedRegion, setSelectedRegion] = useState('North Atlantic');
  const [profileData, setProfileData] = useState<ProfileSample[] | null>(null);
  
  // State for managing chart data updates from chat
  const [chartData, setChartData] = useState<any[]>([]);
  const [dataUpdateTrigger, setDataUpdateTrigger] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleDataQuery = (query: string) => {
    const lowerQuery = query.toLowerCase();

    // Parse data type preferences
    if (lowerQuery.includes('temperature') && lowerQuery.includes('salinity')) {
      setCurrentDataType('both');
    } else if (lowerQuery.includes('temperature')) {
      setCurrentDataType('temperature');
    } else if (lowerQuery.includes('salinity')) {
      setCurrentDataType('salinity');
    }

    // Parse region preferences
    if (lowerQuery.includes('atlantic')) {
      setSelectedRegion('North Atlantic');
    } else if (lowerQuery.includes('pacific')) {
      setSelectedRegion('Pacific Ocean');
    } else if (lowerQuery.includes('indian')) {
      setSelectedRegion('Indian Ocean');
    } else if (lowerQuery.includes('mediterranean')) {
      setSelectedRegion('Mediterranean Sea');
    } else if (lowerQuery.includes('arabian')) {
      setSelectedRegion('Arabian Sea');
    }

    // Auto-switch to appropriate tab based on query intent
    if (lowerQuery.includes('map') || lowerQuery.includes('location') || lowerQuery.includes('where')) {
      setActiveTab(1);
    } else if (lowerQuery.includes('profile') || lowerQuery.includes('depth') || lowerQuery.includes('chart') || lowerQuery.includes('plot')) {
      setActiveTab(0);
    } else if (lowerQuery.includes('info') || lowerQuery.includes('metadata') || lowerQuery.includes('details')) {
      setActiveTab(2);
    } else {
      // Default to profiles tab for data queries
      setActiveTab(0);
    }
  };

  const handleDataReceived = (data: any[]) => {
    // Update chart data and trigger refresh
    setChartData(data);
    setDataUpdateTrigger(prev => prev + 1);
    
    // Auto-switch to profiles tab to show the new data
    setActiveTab(0);
  };

  const handleFloatSelect = (floatId: string) => {
    console.log('Selected float:', floatId);
    // This would trigger updates to show data for the selected float
  };

  const handleProfileGenerate = (floatId: string, data: ProfileSample[]) => {
    setProfileData(data);
    setActiveTab(0); // switch to Profiles tab to show the generated plot
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <AppBar position="static" elevation={0} className="bg-gradient-ocean border-b border-border">
        <Toolbar variant="dense" className="justify-center" sx={{ minHeight: 48 }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-foreground/10">
              <WavesIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <Typography variant="h5" className="text-primary-foreground font-bold">
                FLOATCHAT
              </Typography>
              <Typography variant="body2" className="text-primary-foreground/70">
                Argo Profiles Data Visualization & Analysis
              </Typography>
            </div>
          </div>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar - Left */}
        <Paper elevation={0} className="w-64 border-r border-border bg-card flex flex-col">
          <Box className="p-4">
            <Typography variant="subtitle2" className="opacity-80">
              Navigation
            </Typography>
          </Box>
          <Divider />
          <List dense>
            <ListItemButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
              <ListItemIcon>
                <TimelineIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profiles" />
            </ListItemButton>
            <ListItemButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
              <ListItemIcon>
                <MapIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Map" />
            </ListItemButton>
            <ListItemButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
              <ListItemIcon>
                <InfoIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Info" />
            </ListItemButton>
          </List>

          {/* Status Indicator */}
          <Box className="mt-auto p-4 border-t border-border">
            <Typography variant="caption" className="opacity-60">
              Active Region: {selectedRegion}
            </Typography>
            {chartData.length > 0 && (
              <Typography variant="caption" className="block opacity-60">
                Data Points: {chartData.length}
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Visualization - Center */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {/* Visualization Tabs */}
          <Paper elevation={0} className="border-b border-border">
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="visualization tabs"
              className="px-4"
              sx={{
                '& .MuiTab-root': {
                  color: 'hsl(var(--muted-foreground))',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    color: 'hsl(var(--primary))'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'hsl(var(--primary))',
                  height: 3
                }
              }}
            >
              <Tab 
                icon={<TimelineIcon />} 
                label={`Profiles${chartData.length > 0 ? ` (${chartData.length})` : ''}`} 
                iconPosition="start" 
                className="text-sm" 
              />
              <Tab 
                icon={<MapIcon />} 
                label="Map" 
                iconPosition="start" 
                className="text-sm" 
              />
              <Tab 
                icon={<InfoIcon />} 
                label="Info" 
                iconPosition="start" 
                className="text-sm" 
              />
            </Tabs>
          </Paper>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            <TabPanel value={activeTab} index={0}>
              <SurfaceParamsChart 
                region={selectedRegion}
                externalData={chartData.length > 0 ? chartData : undefined}
                dataUpdateTrigger={dataUpdateTrigger}
              />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <ArgoMap 
                region={selectedRegion} 
                onFloatSelect={handleFloatSelect} 
                onProfileGenerate={handleProfileGenerate} 
              />
            </TabPanel>

            <TabPanel value={activeTab} index={2}>
              <ProfileInfo />
            </TabPanel>
          </div>
        </div>

        {/* Chat - Right */}
        <div className="w-[30%] min-w-[280px] max-w-[480px] border-l border-border bg-card">
          <ChatInterface 
            onDataQuery={handleDataQuery}
            onDataReceived={handleDataReceived}
          />
        </div>
      </div>
    </div>
  );
};

export default OceanDashboard;
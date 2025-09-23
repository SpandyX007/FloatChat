import React from 'react';
import { Paper, Typography, Box, Chip, Divider, LinearProgress } from '@mui/material';
import { 
  Info as InfoIcon, 
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon 
} from '@mui/icons-material';

interface ProfileData {
  floatId: string;
  date: string;
  latitude: number;
  longitude: number;
  profileNumber: number;
  maxDepth: number;
  dataQuality: 'Good' | 'Questionable' | 'Bad';
  parameters: string[];
  platform: string;
  institution: string;
}

interface ProfileInfoProps {
  profileData?: ProfileData;
}

const defaultProfileData: ProfileData = {
  floatId: 'WMO_4901234',
  date: '2024-01-15T12:30:00Z',
  latitude: 45.5,
  longitude: -45.2,
  profileNumber: 342,
  maxDepth: 2000,
  dataQuality: 'Good',
  parameters: ['Temperature', 'Salinity', 'Pressure'],
  platform: 'APEX',
  institution: 'WHOI'
};

const ProfileInfo: React.FC<ProfileInfoProps> = ({ profileData = defaultProfileData }) => {
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Good': return 'text-green-600';
      case 'Questionable': return 'text-yellow-600';
      case 'Bad': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getQualityProgress = (quality: string) => {
    switch (quality) {
      case 'Good': return 100;
      case 'Questionable': return 60;
      case 'Bad': return 20;
      default: return 0;
    }
  };

  return (
    <Paper elevation={2} className="p-6 h-full bg-card">
      <Box className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary/20">
          <InfoIcon className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <Typography variant="h6" className="text-card-foreground font-semibold">
            Profile Information
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            ARGO float metadata & quality
          </Typography>
        </div>
      </Box>

      <div className="space-y-6">
        {/* Float Identification */}
        <div>
          <Typography variant="subtitle2" className="text-card-foreground font-medium mb-3">
            Float Identification
          </Typography>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-muted-foreground">
                WMO ID
              </Typography>
              <Typography variant="body2" className="text-card-foreground font-mono">
                {profileData.floatId}
              </Typography>
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-muted-foreground">
                Platform
              </Typography>
              <Chip 
                label={profileData.platform} 
                size="small"
                className="bg-primary/10 text-primary"
              />
            </div>
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-muted-foreground">
                Institution
              </Typography>
              <Typography variant="body2" className="text-card-foreground">
                {profileData.institution}
              </Typography>
            </div>
          </div>
        </div>

        <Divider />

        {/* Profile Details */}
        <div>
          <Typography variant="subtitle2" className="text-card-foreground font-medium mb-3">
            Profile Details
          </Typography>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Typography variant="body2" className="text-muted-foreground">
                  Date & Time
                </Typography>
                <Typography variant="body2" className="text-card-foreground">
                  {new Date(profileData.date).toLocaleString()}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <LocationIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Typography variant="body2" className="text-muted-foreground">
                  Location
                </Typography>
                <Typography variant="body2" className="text-card-foreground font-mono">
                  {profileData.latitude.toFixed(3)}°N, {Math.abs(profileData.longitude).toFixed(3)}°W
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TimelineIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Typography variant="body2" className="text-muted-foreground">
                  Profile Number
                </Typography>
                <Typography variant="body2" className="text-card-foreground">
                  #{profileData.profileNumber}
                </Typography>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <SpeedIcon className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Typography variant="body2" className="text-muted-foreground">
                  Max Depth
                </Typography>
                <Typography variant="body2" className="text-card-foreground">
                  {profileData.maxDepth}m
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* Data Quality */}
        <div>
          <Typography variant="subtitle2" className="text-card-foreground font-medium mb-3">
            Data Quality
          </Typography>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Typography variant="body2" className="text-muted-foreground">
                Quality Control
              </Typography>
              <Typography variant="body2" className={getQualityColor(profileData.dataQuality)}>
                {profileData.dataQuality}
              </Typography>
            </div>
            <LinearProgress 
              variant="determinate" 
              value={getQualityProgress(profileData.dataQuality)}
              className="h-2 rounded-full"
              sx={{
                backgroundColor: 'hsl(var(--muted))',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: profileData.dataQuality === 'Good' 
                    ? 'hsl(120, 100%, 40%)' 
                    : profileData.dataQuality === 'Questionable'
                    ? 'hsl(45, 100%, 50%)'
                    : 'hsl(0, 100%, 50%)',
                },
              }}
            />
          </div>
        </div>

        <Divider />

        {/* Measured Parameters */}
        <div>
          <Typography variant="subtitle2" className="text-card-foreground font-medium mb-3">
            Measured Parameters
          </Typography>
          <div className="flex flex-wrap gap-2">
            {profileData.parameters.map((param, index) => (
              <Chip
                key={index}
                label={param}
                size="small"
                className="bg-accent/10 text-accent"
              />
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
};

export default ProfileInfo;
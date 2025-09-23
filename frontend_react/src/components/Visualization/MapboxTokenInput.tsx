import React, { useState } from 'react';
import { Paper, TextField, Button, Typography, Box, Alert } from '@mui/material';
import { Key as KeyIcon } from '@mui/icons-material';

interface MapboxTokenInputProps {
  onTokenSubmit: (token: string) => void;
  hasToken: boolean;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSubmit, hasToken }) => {
  const [token, setToken] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      onTokenSubmit(token.trim());
    }
  };

  if (hasToken) return null;

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box 
          sx={{ 
            p: 1, 
            borderRadius: 1, 
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}
        >
          <KeyIcon sx={{ fontSize: 20 }} />
        </Box>
        <div>
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Mapbox Access Token Required
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Enter your Mapbox public token to view the interactive map
          </Typography>
        </div>
      </Box>

      <Alert severity="info" sx={{ mb: 2 }}>
        Get your free token at <strong>mapbox.com</strong> → Account → Access Tokens
      </Alert>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            label="Mapbox Public Token"
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZjBkNjZkNTBhM..."
            value={token}
            onChange={(e) => setToken(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.default'
              }
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            disabled={!token.trim()}
            sx={{ 
              px: 3,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
              }
            }}
          >
            Connect
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default MapboxTokenInput;
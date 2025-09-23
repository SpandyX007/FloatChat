import React from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

// Create a custom Material-UI theme with ocean colors
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: 'hsl(210, 100%, 45%)',
      light: 'hsl(210, 100%, 65%)',
      dark: 'hsl(210, 100%, 25%)',
      contrastText: 'hsl(210, 20%, 98%)',
    },
    secondary: {
      main: 'hsl(180, 100%, 35%)',
      light: 'hsl(180, 100%, 55%)',
      dark: 'hsl(180, 100%, 15%)',
      contrastText: 'hsl(210, 20%, 98%)',
    },
    background: {
      default: 'hsl(210, 20%, 98%)',
      paper: 'hsl(210, 20%, 98%)',
    },
    text: {
      primary: 'hsl(210, 40%, 8%)',
      secondary: 'hsl(210, 25%, 40%)',
    },
    divider: 'hsl(210, 30%, 85%)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.75rem',
      lineHeight: 1.4,
    },
    caption: {
      fontSize: '0.625rem',
      lineHeight: 1.2,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          minHeight: 48,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

const ThemeProvider: React.FC<Props> = ({ children }) => {
  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};

export default ThemeProvider;
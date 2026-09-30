import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b5e20', // Grass Green / Pitch Turf
      light: '#4c8c4a',
      dark: '#003300',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b', // Trophy Gold
      light: '#fbbf24',
      dark: '#b45309',
      contrastText: '#1e293b',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    success: {
      main: '#16a34a',
    },
    error: {
      main: '#dc2626',
    },
    warning: {
      main: '#ea580c',
    },
    info: {
      main: '#0284c7',
    },
    divider: '#e2e8f0',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#0f172a',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#0f172a',
    },
    h6: {
      fontWeight: 600,
      color: '#0f172a',
    },
    subtitle1: {
      fontWeight: 600,
      color: '#334155',
    },
    subtitle2: {
      fontWeight: 500,
      color: '#64748b',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '8px 18px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
          },
        },
        contained: {
          fontWeight: 700,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
  },
});

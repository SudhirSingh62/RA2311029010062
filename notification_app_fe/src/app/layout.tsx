"use client";

import { CssBaseline, ThemeProvider, createTheme, alpha } from '@mui/material';
import TopNav from '../components/TopNav';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#8b5cf6' }, // Vibrant violet
    secondary: { main: '#10b981' }, // Emerald green
    error: { main: '#f43f5e' }, // Rose red
    background: {
      default: '#0f172a', // Deep slate
      paper: '#1e293b', // Lighter slate for cards
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 16,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.1)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(139, 92, 246, 0.5) !important',
          }
        }
      }
    }
  }
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <TopNav />
          <main style={{ position: 'relative', zIndex: 1 }}>
            {/* Ambient background glows */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }} />
            <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(0,0,0,0) 70%)', zIndex: -1 }} />
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
